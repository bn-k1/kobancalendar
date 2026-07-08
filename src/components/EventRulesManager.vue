<!-- src/components/EventRulesManager.vue -->
<!--
  Admin: edit config/event.json — the ordered keyword→color rules that decide
  how a schedule subject is displayed, plus whether it counts as an all-day-free
  slot for the meetup finder (freeAllDay). Rules are evaluated top-down; the
  first rule whose keyword is a substring of the subject wins (see
  src/utils/eventRules.js matchRule()), so row order is priority and is
  editable via drag-and-drop or the ↑/↓ buttons.

  Same load/edit/diff/commit shape as HolidaysManager: fetch the file, mutate a
  local `working` copy, diff against `original` to gate the save button, commit
  via useGitHubApi. Unlike config.json (shared across several admin sections),
  config/event.json is a single dedicated file, so this reads/writes it
  directly with getFile/putFile rather than going through useConfigEditor.
-->
<template>
  <section class="evt">
    <h2>表示ルール</h2>
    <p class="evt-muted">
      上のルールが優先されます。予定名にキーワードが含まれていれば、そのルールの色になります。
    </p>

    <p v-if="loading" class="evt-muted">読み込み中…</p>
    <p v-else-if="loadError" class="evt-error">
      読み込みに失敗しました: {{ loadError }}
    </p>

    <template v-else>
      <div class="evt-table-wrap">
        <table class="evt-table">
          <thead>
            <tr>
              <th class="evt-col-handle"></th>
              <th>表示名</th>
              <th>キーワード</th>
              <th>色</th>
              <th
                class="evt-col-check"
                title="飲みに行くンダーで「終日空いている」と判定します"
              >
                全日空き
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(rule, i) in working.rules"
              :key="`rule-${i}`"
              class="evt-row"
              :class="{ 'is-dragging': dragIndex === i }"
              draggable="true"
              @dragstart="onDragStart(i, $event)"
              @dragover.prevent
              @drop.prevent="onDrop(i)"
              @dragend="onDragEnd"
            >
              <td class="evt-col-handle">
                <span class="evt-handle" title="ドラッグして並び替え">⠿</span>
                <span class="evt-reorder-btns">
                  <button
                    type="button"
                    class="evt-icon-btn"
                    :disabled="busy || i === 0"
                    title="上へ"
                    @click="moveUp(i)"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    class="evt-icon-btn"
                    :disabled="busy || i === working.rules.length - 1"
                    title="下へ"
                    @click="moveDown(i)"
                  >
                    ↓
                  </button>
                </span>
              </td>
              <td>
                <input
                  v-model="rule.label"
                  type="text"
                  class="evt-label-input"
                  :class="{ 'is-invalid': !rule.label.trim() }"
                  :disabled="busy"
                  placeholder="公休"
                />
              </td>
              <td>
                <div
                  class="evt-chips"
                  :class="{ 'is-invalid': rule.keywords.length === 0 }"
                >
                  <span v-for="kw in rule.keywords" :key="kw" class="evt-chip">
                    {{ kw }}
                    <button
                      type="button"
                      class="evt-x"
                      :disabled="busy"
                      aria-label="削除"
                      @click="removeKeyword(rule, kw)"
                    >
                      ×
                    </button>
                  </span>
                  <input
                    v-model="keywordDrafts[rule.id]"
                    type="text"
                    class="evt-chip-input"
                    :disabled="busy"
                    placeholder="キーワードを追加"
                    @keydown.enter.prevent="commitKeyword(rule)"
                    @blur="commitKeyword(rule)"
                  />
                </div>
              </td>
              <td>
                <input
                  v-model="rule.color"
                  type="color"
                  class="evt-color"
                  :disabled="busy"
                />
              </td>
              <td class="evt-col-check">
                <input
                  v-model="rule.freeAllDay"
                  type="checkbox"
                  :disabled="busy"
                  title="飲みに行くンダーで「終日空いている」と判定します"
                />
              </td>
              <td>
                <button
                  type="button"
                  class="evt-icon-btn evt-danger"
                  :disabled="busy"
                  title="削除"
                  @click="removeRule(i)"
                >
                  🗑
                </button>
              </td>
            </tr>
            <tr v-if="working.rules.length === 0">
              <td colspan="6" class="evt-muted">（ルールがありません）</td>
            </tr>
          </tbody>
        </table>
      </div>

      <button
        type="button"
        class="evt-secondary"
        :disabled="busy"
        @click="addRule"
      >
        ＋ ルールを追加
      </button>

      <div class="evt-defaults">
        <label class="evt-color-field">
          <span>既定色</span>
          <input
            v-model="working.fallback.color"
            type="color"
            :disabled="busy"
          />
        </label>
        <label class="evt-color-field">
          <span>編集済みの色</span>
          <input v-model="working.edited.color" type="color" :disabled="busy" />
        </label>
      </div>

      <div class="evt-preview">
        <label class="evt-field">
          <span>プレビュー</span>
          <input
            v-model="previewSubject"
            type="text"
            placeholder="黄121"
            autocomplete="off"
          />
        </label>
        <span
          class="evt-preview-swatch"
          :style="{ background: previewColor }"
        ></span>
        <span class="evt-preview-label">{{ previewLabel }}</span>
      </div>

      <ul v-if="errors.length" class="evt-errors">
        <li v-for="(e, i) in errors" :key="i">{{ e }}</li>
      </ul>

      <div class="evt-actions">
        <button
          type="button"
          class="evt-primary"
          :disabled="busy || !canSave"
          @click="save"
        >
          {{ busy ? "保存中…" : "保存して配信する" }}
        </button>
        <button
          v-if="dirty"
          type="button"
          class="evt-link"
          :disabled="busy"
          @click="reset"
        >
          変更を取り消す
        </button>
        <span v-if="dirty" class="evt-dirty">未保存の変更があります</span>
      </div>

      <p v-if="opStatus.message" :class="['evt-status', `is-${opStatus.type}`]">
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
import { ref, reactive, computed, onMounted } from "vue";
import { useGitHubApi } from "@/composables/useGitHubApi";
import { matchRule } from "@/utils/eventRules";

const { resolveRepo, getFile, putFile } = useGitHubApi();

const EVENT_PATH = "config/event.json";
const DEFAULT_COLOR = "#888888";
const COLOR_RE = /^#[0-9a-fA-F]{6}$/;

const loading = ref(true);
const loadError = ref("");
const busy = ref(false);
const original = ref(null);
const working = ref(null);
// Per-rule "add a keyword" input text, keyed by rule.id (not part of the
// persisted schema). A plain reactive object so dynamic keys stay reactive.
const keywordDrafts = reactive({});
const dragIndex = ref(null);
const previewSubject = ref("");
const opStatus = ref({ type: "", message: "", sha: "" });

function defaultEventConfig() {
  return {
    rules: [],
    fallback: { color: DEFAULT_COLOR },
    edited: { color: DEFAULT_COLOR },
  };
}

// Clone + fill in defaults so working/original always have the same shape,
// regardless of what is actually present in the file on disk.
function normalize(data) {
  const rules = Array.isArray(data?.rules) ? data.rules : [];
  return {
    rules: rules.map((r) => ({
      id: r.id,
      label: r.label ?? "",
      keywords: Array.isArray(r.keywords) ? [...r.keywords] : [],
      color: r.color ?? DEFAULT_COLOR,
      freeAllDay: !!r.freeAllDay,
    })),
    fallback: { color: data?.fallback?.color ?? DEFAULT_COLOR },
    edited: { color: data?.edited?.color ?? DEFAULT_COLOR },
  };
}

function resetKeywordDrafts() {
  Object.keys(keywordDrafts).forEach((k) => delete keywordDrafts[k]);
  working.value.rules.forEach((r) => {
    keywordDrafts[r.id] = "";
  });
}

const dirty = computed(
  () => JSON.stringify(working.value) !== JSON.stringify(original.value),
);

function ruleLabelFor(rule) {
  return (rule.label && rule.label.trim()) || rule.id || "(無題)";
}

// Validation: block save with inline messages rather than silently rejecting.
const errors = computed(() => {
  const list = [];
  const seen = new Set();
  for (const rule of working.value.rules) {
    const name = ruleLabelFor(rule);
    if (!rule.label || !rule.label.trim()) {
      list.push(`${rule.id || "(id未設定)"}: 表示名を入力してください`);
    }
    if (!rule.keywords || rule.keywords.length === 0) {
      list.push(`${name}: キーワードが空のルールは保存できません`);
    }
    if (!COLOR_RE.test(rule.color || "")) {
      list.push(`${name}: 色は #RRGGBB 形式で指定してください`);
    }
    if (seen.has(rule.id)) {
      list.push(`${name}: ID が重複しています`);
    }
    seen.add(rule.id);
  }
  if (!COLOR_RE.test(working.value.fallback?.color || "")) {
    list.push("既定色は #RRGGBB 形式で指定してください");
  }
  if (!COLOR_RE.test(working.value.edited?.color || "")) {
    list.push("編集済みの色は #RRGGBB 形式で指定してください");
  }
  return list;
});

const canSave = computed(() => dirty.value && errors.value.length === 0);

const commitUrl = computed(() => {
  const repo = resolveRepo();
  if (!repo || !opStatus.value.sha) return "";
  return `https://github.com/${repo.owner}/${repo.repo}/commit/${opStatus.value.sha}`;
});

const previewMatch = computed(() =>
  matchRule(previewSubject.value, working.value),
);
const previewColor = computed(
  () =>
    previewMatch.value?.color || working.value.fallback?.color || DEFAULT_COLOR,
);
const previewLabel = computed(() => previewMatch.value?.label || "既定");

async function load() {
  loading.value = true;
  loadError.value = "";
  try {
    const file = await getFile(EVENT_PATH);
    const data = file ? JSON.parse(file.content) : defaultEventConfig();
    original.value = normalize(data);
    working.value = normalize(data);
    resetKeywordDrafts();
  } catch (err) {
    loadError.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(load);

// --- reordering (drag-and-drop, plus ↑/↓ as a keyboard/touch fallback) ---

function onDragStart(i, event) {
  dragIndex.value = i;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", String(i));
  }
}

function onDrop(i) {
  const from = dragIndex.value;
  dragIndex.value = null;
  if (from === null || from === i) return;
  const arr = working.value.rules;
  const [moved] = arr.splice(from, 1);
  arr.splice(i, 0, moved);
}

function onDragEnd() {
  dragIndex.value = null;
}

function swapRules(i, j) {
  const arr = working.value.rules;
  [arr[i], arr[j]] = [arr[j], arr[i]];
}

function moveUp(i) {
  if (i <= 0) return;
  swapRules(i, i - 1);
}

function moveDown(i) {
  if (i >= working.value.rules.length - 1) return;
  swapRules(i, i + 1);
}

// --- keyword chip editing ---

function commitKeyword(rule) {
  const kw = (keywordDrafts[rule.id] || "").trim();
  keywordDrafts[rule.id] = "";
  if (!kw) return;
  if (rule.keywords.includes(kw)) return;
  rule.keywords.push(kw);
}

function removeKeyword(rule, kw) {
  rule.keywords = rule.keywords.filter((k) => k !== kw);
}

// --- add / remove rules ---

function nextRuleId() {
  const ids = new Set(working.value.rules.map((r) => r.id));
  let n = 1;
  while (ids.has(`rule${n}`)) n += 1;
  return `rule${n}`;
}

function addRule() {
  const id = nextRuleId();
  working.value.rules.push({
    id,
    label: "",
    keywords: [],
    color: DEFAULT_COLOR,
    freeAllDay: false,
  });
  keywordDrafts[id] = "";
}

function removeRule(i) {
  const rule = working.value.rules[i];
  if (
    !window.confirm(
      `ルール「${ruleLabelFor(rule)}」を削除します。よろしいですか？`,
    )
  ) {
    return;
  }
  working.value.rules.splice(i, 1);
  delete keywordDrafts[rule.id];
}

function reset() {
  working.value = normalize(original.value);
  resetKeywordDrafts();
}

async function save() {
  if (!canSave.value) return;
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  try {
    // Re-read immediately before writing so the PUT uses the freshest sha
    // (same read-modify-write-safety intent as useConfigEditor.commitConfig).
    // A genuine race still surfaces as a 409 from useGitHubApi's request(),
    // which lands in the catch below and shows the generic failure message —
    // the same way HolidaysManager (and every other admin section) handles
    // it, since none of them special-case a stale sha.
    const fresh = await getFile(EVENT_PATH);
    const content = JSON.stringify(working.value, null, 2) + "\n";
    const sha = await putFile({
      path: EVENT_PATH,
      content,
      message: "data(event): update calendar display rules",
      sha: fresh?.sha,
    });
    opStatus.value = { type: "ok", message: "保存しました。", sha };
    await load();
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
.evt {
  max-width: 760px;
  margin: 1.5rem auto 0;
  padding: 1.5rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 8px;
  background: var(--card-bg, #fff);
}

.evt h2 {
  margin-top: 0;
}

.evt-muted {
  opacity: 0.75;
  font-size: 0.9em;
}

.evt-error {
  color: #991b1b;
}

.evt-table-wrap {
  overflow-x: auto;
  margin: 1rem 0;
}

.evt-table {
  width: 100%;
  border-collapse: collapse;
}

.evt-table th,
.evt-table td {
  border-bottom: 1px solid var(--border-color, #eee);
  padding: 0.5rem;
  text-align: left;
  vertical-align: middle;
}

.evt-col-handle {
  width: 4.5rem;
  white-space: nowrap;
}

.evt-col-check {
  width: 4rem;
  text-align: center;
}

.evt-row.is-dragging {
  opacity: 0.4;
}

.evt-handle {
  cursor: grab;
  padding: 0 0.4rem;
  opacity: 0.6;
}

.evt-reorder-btns {
  display: inline-flex;
  gap: 0.15rem;
}

.evt-icon-btn {
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
  line-height: 1;
  padding: 0.2rem 0.4rem;
}

.evt-icon-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.evt-danger {
  color: #dc2626;
}

.evt-label-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.4rem;
  font: inherit;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
}

.evt-chips {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem;
  min-width: 12rem;
}

.evt-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(127, 127, 127, 0.15);
  font-size: 0.9em;
  white-space: nowrap;
}

.evt-x {
  border: none;
  background: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 1.1em;
  line-height: 1;
  padding: 0;
}

.evt-x:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.evt-chip-input {
  flex: 1 1 8rem;
  min-width: 6rem;
  padding: 0.3rem 0.4rem;
  font: inherit;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
}

.evt-color {
  width: 2.75rem;
  height: 2rem;
  padding: 0;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  cursor: pointer;
}

.is-invalid {
  outline: 2px solid #dc2626;
  outline-offset: 1px;
  border-radius: 4px;
}

.evt-secondary {
  padding: 0.5rem 1rem;
  border: 1px dashed var(--border-color, #bbb);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
}

.evt-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.evt-defaults {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin: 1.25rem 0;
}

.evt-color-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.evt-color-field span {
  font-weight: 600;
  font-size: 0.9em;
}

.evt-color-field input {
  width: 2.75rem;
  height: 2rem;
  padding: 0;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  cursor: pointer;
}

.evt-preview {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 1.25rem 0;
  padding: 0.75rem;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 6px;
}

.evt-field {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.evt-field span {
  font-weight: 600;
  font-size: 0.9em;
}

.evt-field input {
  padding: 0.4rem;
  font: inherit;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
}

.evt-preview-swatch {
  display: inline-block;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 4px;
  border: 1px solid var(--border-color, #ccc);
}

.evt-preview-label {
  font-weight: 600;
}

.evt-errors {
  margin: 1rem 0;
  padding: 0.5rem 1rem 0.5rem 1.5rem;
  border-radius: 4px;
  background: #fee2e2;
  color: #991b1b;
  font-size: 0.9em;
}

.evt-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.evt-primary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #16a34a;
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.evt-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.evt-link {
  border: none;
  background: none;
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
}

.evt-dirty {
  color: #854d0e;
  font-size: 0.85em;
}

.evt-status {
  margin-top: 1rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

.evt-status.is-ok {
  background: #dcfce7;
  color: #166534;
}

.evt-status.is-error {
  background: #fee2e2;
  color: #991b1b;
}
</style>
