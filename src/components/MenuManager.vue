<!-- src/components/MenuManager.vue -->
<!--
  Admin: edit the cafeteria menu from the browser. The source of truth is
  data/menu/YYYY-MM-{a,b}.txt (one dish per line, line N = day N); the app reads
  the generated data/menu/menu.json, which CI rebuilds via convert-menu on push.
  So this editor only ever writes the .txt files — never the JSON.

  Mirrors ScheduleEditor's CSV UX: two drop-slots (A定食 / B定食) that accept a
  dropped .txt file or pasted/typed text, plus a live day-aligned preview table
  to verify line N maps to day N before committing. A month's A/B files are
  written together in one commit via commitFiles. Switching months is locked
  while there are unsaved edits so a stray click can't discard them.
-->
<template>
  <section class="menu-mgr">
    <h2>食堂メニューの管理</h2>
    <p class="menu-muted">
      月ごとに A定食・B定食 を編集します（1行＝1日）。txt
      ファイルをドロップするか、内容を貼り付けてください。
    </p>

    <p v-if="loading" class="menu-muted">読み込み中…</p>
    <p v-else-if="loadError" class="menu-error">
      読み込みに失敗しました: {{ loadError }}
    </p>

    <template v-else>
      <div class="menu-pick">
        <label class="menu-field">
          <span>月</span>
          <select
            v-model="selected"
            :disabled="busy || dirty || months.length === 0"
            @change="onSelectMonth"
          >
            <option v-if="months.length === 0" value="">（未登録）</option>
            <option v-for="key in months" :key="key" :value="key">
              {{ monthLabel(key) }}
            </option>
          </select>
        </label>

        <template v-if="!addingMonth">
          <button
            type="button"
            class="menu-secondary"
            :disabled="busy || dirty"
            @click="addingMonth = true"
          >
            ＋ 新しい月
          </button>
        </template>
        <template v-else>
          <input v-model="newMonth" type="month" :disabled="busy" />
          <button
            type="button"
            class="menu-secondary"
            :disabled="busy || !canAddMonth"
            @click="addMonth"
          >
            追加
          </button>
          <button
            type="button"
            class="menu-link"
            :disabled="busy"
            @click="cancelAddMonth"
          >
            やめる
          </button>
          <small v-if="newMonth && !canAddMonth" class="menu-warn">
            その月は既に登録済みです
          </small>
        </template>
      </div>

      <p v-if="dirty" class="menu-muted">
        編集中は月の切り替え・追加ができません。保存または取消してください。
      </p>

      <template v-if="selected && working">
        <h3 class="menu-heading">{{ monthLabel(selected) }} の献立</h3>
        <p class="menu-muted">
          上から {{ daysInMonth(selected) }} 日分（1行＝1日）。空行はその日の
          メニュー無し、「定休日」はそのまま入力してください。
        </p>

        <div class="menu-slots">
          <div v-for="slot in SLOTS" :key="slot.key" class="menu-slot">
            <label>{{ slot.label }}</label>
            <div
              class="menu-drop"
              :class="{ 'is-over': dragOver === slot.key }"
              @dragover.prevent="dragOver = slot.key"
              @dragleave.prevent="dragOver = ''"
              @drop.prevent="onDrop(slot.key, $event)"
            >
              <textarea
                v-model="working[slot.key]"
                :placeholder="`${selected}-${slot.key}.txt をドロップ、または貼り付け`"
                :disabled="busy"
                spellcheck="false"
                rows="12"
              ></textarea>
            </div>
            <small
              class="menu-count"
              :class="{ 'menu-warn': overCount(slot.key) > 0 }"
            >
              {{ rowCount(slot.key) }} 行<template
                v-if="overCount(slot.key) > 0"
                >（{{
                  daysInMonth(selected)
                }}日を超えた分は取り込まれません）</template
              >
            </small>
          </div>
        </div>

        <div v-if="previewRows.length" class="menu-preview">
          <p class="menu-preview-title">
            プレビュー — 掲示物と見比べてください
          </p>
          <div class="menu-table-wrap">
            <table class="menu-table">
              <thead>
                <tr>
                  <th class="menu-day-col">日</th>
                  <th>A定食</th>
                  <th>B定食</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in previewRows"
                  :key="row.n"
                  :class="{ 'is-over': row.over }"
                >
                  <td class="menu-day-col">{{ row.over ? "—" : row.n }}</td>
                  <td>{{ row.a }}</td>
                  <td>{{ row.b }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="menu-actions">
          <button
            type="button"
            class="menu-primary"
            :disabled="busy || !dirty"
            @click="save"
          >
            {{ busy ? "保存中…" : "保存して配信する" }}
          </button>
          <button
            v-if="dirty"
            type="button"
            class="menu-link"
            :disabled="busy"
            @click="reset"
          >
            変更を取り消す
          </button>
          <span v-if="dirty" class="menu-dirty">未保存の変更があります</span>
        </div>
      </template>

      <p
        v-if="opStatus.message"
        :class="['menu-status', `is-${opStatus.type}`]"
      >
        {{ opStatus.message }}
        <a
          v-if="opStatus.sha && commitUrl"
          :href="commitUrl"
          target="_blank"
          rel="noopener"
        >
          コミットを見る
        </a>
        <span v-if="opStatus.type === 'ok'"> CI が数分で配信します。</span>
      </p>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useGitHubApi } from "@/composables/useGitHubApi";
import {
  MENU_MONTH_RE,
  parseMenuFilename,
  menuFilePath,
  daysInMonth,
  parseMenuText,
  serializeMenuText,
  monthLabel,
} from "@/utils/menuText";

const { resolveRepo, getFile, listDir, commitFiles } = useGitHubApi();

const SLOTS = [
  { key: "a", label: "A定食" },
  { key: "b", label: "B定食" },
];

const loading = ref(true);
const loadError = ref("");
const busy = ref(false);

const months = ref([]); // ["2026-07", "2026-06", …] newest first
const selected = ref("");
const addingMonth = ref(false);
const newMonth = ref("");

// { a: string, b: string } raw file text; null until a month is loaded.
const working = ref(null);
const original = ref(null);
// Whether each source file already existed (so clearing it commits an empty
// file rather than being skipped as brand-new-and-blank).
const existed = ref({ a: false, b: false });
const dragOver = ref("");

const opStatus = ref({ type: "", message: "", sha: "" });

// Normalize before comparing/writing so trailing whitespace or blank lines
// don't register as edits (matches convertMenu's readLines parsing).
function norm(text) {
  return serializeMenuText(parseMenuText(text));
}

const dirty = computed(() => {
  if (!working.value) return false;
  return (
    norm(working.value.a) !== norm(original.value.a) ||
    norm(working.value.b) !== norm(original.value.b)
  );
});

const canAddMonth = computed(
  () =>
    MENU_MONTH_RE.test(newMonth.value) &&
    !months.value.includes(newMonth.value),
);

const commitUrl = computed(() => {
  const repo = resolveRepo();
  if (!repo || !opStatus.value.sha) return "";
  return `https://github.com/${repo.owner}/${repo.repo}/commit/${opStatus.value.sha}`;
});

// Day-aligned rows for the preview: A and B side by side by day, plus any
// overflow lines beyond the month's length (flagged so the admin can fix them).
const previewRows = computed(() => {
  if (!selected.value || !working.value) return [];
  const a = parseMenuText(working.value.a);
  const b = parseMenuText(working.value.b);
  const n = daysInMonth(selected.value);
  const rows = Math.max(n, a.length, b.length);
  return Array.from({ length: rows }, (_, i) => ({
    n: i + 1,
    over: i >= n,
    a: a[i] ?? "",
    b: b[i] ?? "",
  }));
});

function rowCount(key) {
  return working.value ? parseMenuText(working.value[key]).length : 0;
}

function overCount(key) {
  if (!selected.value) return 0;
  return Math.max(0, rowCount(key) - daysInMonth(selected.value));
}

async function loadMonthList() {
  const entries = await listDir("data/menu");
  const keys = new Set();
  for (const e of entries) {
    if (e.type !== "file") continue;
    const parsed = parseMenuFilename(e.name);
    if (parsed) keys.add(parsed.key);
  }
  months.value = [...keys].sort().reverse();
}

async function openMonth(monthKey) {
  const [fileA, fileB] = await Promise.all([
    getFile(menuFilePath(monthKey, "a")),
    getFile(menuFilePath(monthKey, "b")),
  ]);
  existed.value = { a: !!fileA, b: !!fileB };
  working.value = {
    a: fileA ? fileA.content : "",
    b: fileB ? fileB.content : "",
  };
  original.value = { ...working.value };
  selected.value = monthKey;
}

async function load() {
  loading.value = true;
  loadError.value = "";
  try {
    await loadMonthList();
    if (months.value.length) await openMonth(months.value[0]);
  } catch (err) {
    loadError.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(load);

async function onSelectMonth() {
  const key = selected.value;
  if (!key) return;
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  try {
    await openMonth(key);
  } catch (err) {
    loadError.value = err.message;
  } finally {
    busy.value = false;
  }
}

function addMonth() {
  if (!canAddMonth.value) return;
  const key = newMonth.value;
  existed.value = { a: false, b: false };
  working.value = { a: "", b: "" };
  original.value = { a: "", b: "" };
  selected.value = key;
  addingMonth.value = false;
  newMonth.value = "";
}

function cancelAddMonth() {
  addingMonth.value = false;
  newMonth.value = "";
}

async function onDrop(key, event) {
  dragOver.value = "";
  const file = event.dataTransfer?.files?.[0];
  if (file) working.value[key] = await file.text();
}

function reset() {
  working.value = { ...original.value };
}

async function save() {
  if (!dirty.value) return;
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  const key = selected.value;
  try {
    const files = [];
    for (const type of ["a", "b"]) {
      const content = norm(working.value[type]);
      // Write when there is content, or when clearing a file that already
      // existed; skip an all-empty brand-new file so we don't litter blanks.
      if (content || existed.value[type]) {
        files.push({ path: menuFilePath(key, type), content });
      }
    }
    if (files.length === 0) {
      opStatus.value = {
        type: "warn",
        message: "保存する内容がありません。",
        sha: "",
      };
      return;
    }
    const sha = await commitFiles({
      message: `data(menu): update ${key} cafeteria menu`,
      files,
    });
    opStatus.value = { type: "ok", message: "保存しました。", sha };
    await loadMonthList();
    await openMonth(key);
  } catch (err) {
    opStatus.value = {
      type: "error",
      message: `失敗: ${err.message}`,
      sha: "",
    };
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.menu-mgr {
  max-width: 760px;
  margin: 1.5rem auto 0;
  padding: 1.5rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 8px;
  background: var(--card-bg, #fff);
}

.menu-mgr h2 {
  margin-top: 0;
}

.menu-muted {
  opacity: 0.75;
  font-size: 0.9em;
}

.menu-pick {
  display: flex;
  align-items: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: 1rem 0;
}

.menu-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.menu-field > span {
  font-weight: 600;
  font-size: 0.85em;
}

.menu-pick select,
.menu-pick input {
  padding: 0.5rem;
  font: inherit;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
}

.menu-heading {
  margin: 1rem 0 0.5rem;
}

.menu-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 0.75rem;
  margin: 0.75rem 0 1rem;
}

.menu-slot label {
  font-weight: 600;
  display: block;
  margin-bottom: 0.25rem;
}

.menu-drop {
  border: 2px dashed var(--border-color, #bbb);
  border-radius: 6px;
  transition: border-color 0.15s;
}

.menu-drop.is-over {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.06);
}

.menu-drop textarea {
  width: 100%;
  box-sizing: border-box;
  border: none;
  background: transparent;
  padding: 0.5rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.85rem;
  resize: vertical;
  color: inherit;
}

.menu-count {
  opacity: 0.7;
}

.menu-table-wrap {
  max-height: 360px;
  overflow: auto;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 4px;
}

.menu-preview {
  margin: 1rem 0;
}

.menu-preview-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.menu-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.menu-table th,
.menu-table td {
  border-bottom: 1px solid var(--border-color, #eee);
  padding: 0.3rem 0.5rem;
  text-align: left;
}

.menu-table thead th {
  position: sticky;
  top: 0;
  background: var(--card-bg, #fff);
}

.menu-day-col {
  width: 3rem;
  text-align: center;
  opacity: 0.7;
}

.menu-table tr.is-over td {
  background: #fef9c3;
  color: #854d0e;
}

.menu-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.menu-primary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #16a34a;
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.menu-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-secondary {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.menu-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-link {
  border: none;
  background: none;
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
}

.menu-dirty {
  color: #854d0e;
  font-size: 0.85em;
}

.menu-warn {
  color: #b45309;
  font-size: 0.85em;
}

.menu-status {
  margin-top: 1rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

.menu-status.is-ok {
  background: #dcfce7;
  color: #166534;
}

.menu-status.is-warn {
  background: #fef9c3;
  color: #854d0e;
}

.menu-status.is-error {
  background: #fee2e2;
  color: #991b1b;
}

.menu-error {
  color: #991b1b;
}
</style>
