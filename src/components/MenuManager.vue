<!-- src/components/MenuManager.vue -->
<!--
  Admin: edit the cafeteria menu from the browser. The source of truth is
  data/menu/YYYY-MM-{a,b}.txt (one dish per line, line N = day N); the app reads
  the generated data/menu/menu.json, which CI rebuilds via convert-menu on push.
  So this editor only ever writes the .txt files — never the JSON.

  A month's A/B lists are edited together in one table and committed as a single
  commit (both files) via commitFiles, mirroring HolidaysManager's stage-then-
  save flow. Switching months is locked while there are unsaved edits so a stray
  click can't silently discard them.
-->
<template>
  <section class="menu-mgr">
    <h2>食堂メニューの管理</h2>
    <p class="menu-muted">
      月ごとに A定食・B定食 を日別で編集します。空欄の日はメニュー無しとして
      扱われ、「定休日」はそのまま入力してください。
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
              <tr v-for="(_, i) in working.a" :key="i">
                <td class="menu-day-col">{{ i + 1 }}</td>
                <td>
                  <input
                    v-model="working.a[i]"
                    type="text"
                    :disabled="busy"
                    autocomplete="off"
                  />
                </td>
                <td>
                  <input
                    v-model="working.b[i]"
                    type="text"
                    :disabled="busy"
                    autocomplete="off"
                  />
                </td>
              </tr>
            </tbody>
          </table>
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

const loading = ref(true);
const loadError = ref("");
const busy = ref(false);

const months = ref([]); // ["2026-07", "2026-06", …] newest first
const selected = ref("");
const addingMonth = ref(false);
const newMonth = ref("");

// { a: string[], b: string[] } sized to the month; null until a month loads.
const working = ref(null);
const original = ref(null);
// Whether each source file already existed (so clearing it commits an empty
// file rather than being skipped as brand-new-and-blank).
const existed = ref({ a: false, b: false });

const opStatus = ref({ type: "", message: "", sha: "" });

const dirty = computed(
  () =>
    working.value !== null &&
    JSON.stringify(working.value) !== JSON.stringify(original.value),
);

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

function buildWorking(aLines, bLines, monthKey) {
  const n = daysInMonth(monthKey);
  const fill = (lines) => Array.from({ length: n }, (_, i) => lines[i] ?? "");
  return { a: fill(aLines), b: fill(bLines) };
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
  const w = buildWorking(
    fileA ? parseMenuText(fileA.content) : [],
    fileB ? parseMenuText(fileB.content) : [],
    monthKey,
  );
  working.value = w;
  original.value = JSON.parse(JSON.stringify(w));
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
  working.value = buildWorking([], [], key);
  original.value = JSON.parse(JSON.stringify(working.value));
  selected.value = key;
  addingMonth.value = false;
  newMonth.value = "";
}

function cancelAddMonth() {
  addingMonth.value = false;
  newMonth.value = "";
}

function reset() {
  working.value = JSON.parse(JSON.stringify(original.value));
}

async function save() {
  if (!dirty.value) return;
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  const key = selected.value;
  try {
    const files = [];
    for (const type of ["a", "b"]) {
      const content = serializeMenuText(working.value[type]);
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

.menu-table-wrap {
  overflow-x: auto;
}

.menu-table {
  width: 100%;
  border-collapse: collapse;
}

.menu-table th,
.menu-table td {
  border: 1px solid var(--border-color, #ccc);
  padding: 0.3rem 0.4rem;
  text-align: left;
}

.menu-table th {
  font-size: 0.85em;
  opacity: 0.85;
}

.menu-day-col {
  width: 2.5rem;
  text-align: center;
  opacity: 0.75;
}

.menu-table input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.35rem 0.4rem;
  font: inherit;
  border: 1px solid transparent;
  border-radius: 4px;
  background: var(--code-bg, rgba(127, 127, 127, 0.08));
}

.menu-table input:focus {
  border-color: #2563eb;
  outline: none;
  background: var(--card-bg, #fff);
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
