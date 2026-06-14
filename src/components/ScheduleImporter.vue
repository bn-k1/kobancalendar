<!-- src/components/ScheduleImporter.vue -->
<!--
  Admin Phase 2: import a new schedule generation from the three shift-table CSVs.

  Flow: drop/paste weekday+saturday+holiday CSVs -> hard validation ->
  rotation-table preview -> one atomic commit (the 3 CSVs + an appended epoch in
  config.json) -> CI builds & deploys. The app never calls an LLM; how the admin
  produced the CSVs is their business.
-->
<template>
  <section class="importer">
    <h2>交番表の取り込み（新しい世代）</h2>

    <p v-if="loadingConfig" class="imp-muted">config.json を読み込み中…</p>
    <p v-else-if="configError" class="imp-error">
      config.json を読めませんでした: {{ configError }}
    </p>

    <template v-else>
      <p class="imp-muted">
        既存の世代:
        <span v-for="(e, i) in existingEpochs" :key="i" class="imp-chip">
          {{ e.from }}{{ e.data ? `→${e.data}` : "（継承）" }}
        </span>
      </p>

      <!-- CSV inputs -->
      <div class="imp-slots">
        <div v-for="slot in SLOTS" :key="slot.key" class="imp-slot">
          <label>{{ slot.label }}</label>
          <div
            class="imp-drop"
            :class="{ 'is-over': dragOver === slot.key }"
            @dragover.prevent="dragOver = slot.key"
            @dragleave.prevent="dragOver = ''"
            @drop.prevent="onDrop(slot.key, $event)"
          >
            <textarea
              v-model="texts[slot.key]"
              :placeholder="`${slot.file} をドロップ、または内容を貼り付け`"
              spellcheck="false"
              rows="6"
            ></textarea>
          </div>
          <small class="imp-count">{{ rowCount(slot.key) }} 行</small>
        </div>
      </div>

      <!-- generation metadata -->
      <div class="imp-meta">
        <label class="imp-field">
          <span>有効日 (from)</span>
          <input v-model="fromStr" type="date" />
          <small>この日からこの交番表が「いまの世代」になります</small>
        </label>
        <label class="imp-field">
          <span>フォルダ名</span>
          <input
            v-model="folder"
            type="text"
            placeholder="rev20260801"
            spellcheck="false"
            @input="folderTouched = true"
          />
          <small>data/&lt;フォルダ名&gt;/ に3つのCSVが保存されます</small>
        </label>
      </div>

      <!-- validation -->
      <ul v-if="errors.length" class="imp-error-list">
        <li v-for="(e, i) in errors" :key="i">{{ e }}</li>
      </ul>
      <ul v-if="warnings.length" class="imp-warn-list">
        <li v-for="(w, i) in warnings" :key="i">⚠ {{ w }}</li>
      </ul>

      <!-- rotation preview -->
      <div v-if="previewRows.length" class="imp-preview">
        <p class="imp-preview-title">
          プレビュー（コマ {{ previewRows.length }} 周期）—
          掲示物と見比べてください
        </p>
        <div class="imp-table-wrap">
          <table class="imp-table">
            <thead>
              <tr>
                <th>コマ</th>
                <th>平日</th>
                <th>土曜</th>
                <th>日祝</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in previewRows" :key="row.n">
                <td class="imp-num">{{ row.n }}</td>
                <td>{{ row.weekday }}</td>
                <td>{{ row.saturday }}</td>
                <td>{{ row.holiday }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- commit -->
      <div class="imp-actions">
        <button
          type="button"
          class="imp-primary"
          :disabled="!canCommit"
          @click="commit"
        >
          {{ committing ? "コミット中…" : "この内容で配信する" }}
        </button>
      </div>

      <p v-if="commitError" class="imp-error">
        コミット失敗: {{ commitError }}
      </p>
      <p v-if="commitResult" class="imp-ok">
        コミットしました（{{ commitResult.sha.slice(0, 7) }}）。GitHub Actions
        がビルド・配信します。数分後に反映されます。
        <a v-if="commitUrl" :href="commitUrl" target="_blank" rel="noopener"
          >コミットを見る</a
        >
      </p>
    </template>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from "vue";
import { useGitHubApi } from "@/composables/useGitHubApi";
import {
  validateTrio,
  validateEpochMeta,
  buildPreviewData,
  serializeCsv,
  suggestFolderName,
} from "@/composables/useScheduleImport";

const SLOTS = [
  { key: "weekday", label: "平日", file: "weekday.csv" },
  { key: "saturday", label: "土曜", file: "saturday.csv" },
  { key: "holiday", label: "日祝", file: "holiday.csv" },
];

const { resolveRepo, getFile, commitFiles } = useGitHubApi();

const texts = reactive({ weekday: "", saturday: "", holiday: "" });
const fromStr = ref("");
const folder = ref("");
const folderTouched = ref(false);
const dragOver = ref("");

const loadingConfig = ref(true);
const configError = ref("");
const config = ref(null);

const committing = ref(false);
const commitError = ref("");
const commitResult = ref(null);

const existingEpochs = computed(() => config.value?.schedules || []);
const existingFroms = computed(() => existingEpochs.value.map((e) => e.from));
const existingFolders = computed(() => [
  ...new Set(existingEpochs.value.map((e) => e.data).filter(Boolean)),
]);

const trioResult = computed(() => validateTrio(texts));
const epochResult = computed(() =>
  validateEpochMeta({
    fromStr: fromStr.value,
    folder: folder.value,
    existingFroms: existingFroms.value,
    existingFolders: existingFolders.value,
  }),
);

const errors = computed(() => [
  ...trioResult.value.errors,
  ...epochResult.value.errors,
]);
const warnings = computed(() => epochResult.value.warnings);

const canCommit = computed(
  () =>
    trioResult.value.ok &&
    epochResult.value.ok &&
    !committing.value &&
    !loadingConfig.value &&
    !configError.value,
);

const previewRows = computed(() => {
  if (!trioResult.value.ok) return [];
  const { weekday, saturday, holiday } = trioResult.value.trio;
  const fmt = (r) =>
    r
      ? r.startTime
        ? `${r.subject} ${r.startTime}-${r.endTime}`
        : r.subject
      : "";
  return weekday.map((w, i) => ({
    n: i + 1,
    weekday: fmt(w),
    saturday: fmt(saturday[i]),
    holiday: fmt(holiday[i]),
  }));
});

const commitUrl = computed(() => {
  const repo = resolveRepo();
  if (!repo || !commitResult.value) return "";
  return `https://github.com/${repo.owner}/${repo.repo}/commit/${commitResult.value.sha}`;
});

function rowCount(key) {
  return trioResult.value.trio[key]?.length ?? 0;
}

// Auto-suggest the folder name from the date until the admin edits it.
watch(fromStr, (val) => {
  if (!folderTouched.value) folder.value = suggestFolderName(val);
});

async function onDrop(key, event) {
  dragOver.value = "";
  const file = event.dataTransfer?.files?.[0];
  if (file) texts[key] = await file.text();
}

onMounted(async () => {
  try {
    const file = await getFile("config/config.json");
    config.value = file ? JSON.parse(file.content) : { schedules: [] };
  } catch (err) {
    configError.value = err.message;
  } finally {
    loadingConfig.value = false;
  }
});

async function commit() {
  commitError.value = "";
  commitResult.value = null;
  committing.value = true;
  try {
    // Re-validate the data shape (defensive — canCommit already gates this).
    buildPreviewData(trioResult.value.trio);

    const cfg = JSON.parse(JSON.stringify(config.value || { schedules: [] }));
    cfg.schedules = [
      ...(cfg.schedules || []),
      { from: fromStr.value, data: folder.value },
    ];

    const files = [
      {
        path: `data/${folder.value}/weekday.csv`,
        content: serializeCsv(trioResult.value.trio.weekday),
      },
      {
        path: `data/${folder.value}/saturday.csv`,
        content: serializeCsv(trioResult.value.trio.saturday),
      },
      {
        path: `data/${folder.value}/holiday.csv`,
        content: serializeCsv(trioResult.value.trio.holiday),
      },
      {
        path: "config/config.json",
        content: JSON.stringify(cfg, null, 2) + "\n",
      },
    ];

    const sha = await commitFiles({
      message: `data: ${folder.value} 世代を追加 (from ${fromStr.value})`,
      files,
    });
    commitResult.value = { sha };
    // Reflect the new epoch locally so a second import validates against it.
    config.value = cfg;
  } catch (err) {
    commitError.value = err.message;
  } finally {
    committing.value = false;
  }
}
</script>

<style scoped>
.importer {
  max-width: 760px;
  margin: 1.5rem auto 0;
  padding: 1.5rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 8px;
  background: var(--card-bg, #fff);
}

.importer h2 {
  margin-top: 0;
}

.imp-muted {
  opacity: 0.75;
  font-size: 0.9em;
}

.imp-chip {
  display: inline-block;
  margin: 0 0.25rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: rgba(127, 127, 127, 0.15);
  font-size: 0.85em;
}

.imp-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin: 1rem 0;
}

.imp-slot label {
  font-weight: 600;
  display: block;
  margin-bottom: 0.25rem;
}

.imp-drop {
  border: 2px dashed var(--border-color, #bbb);
  border-radius: 6px;
  transition: border-color 0.15s;
}

.imp-drop.is-over {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.06);
}

.imp-drop textarea {
  width: 100%;
  box-sizing: border-box;
  border: none;
  background: transparent;
  padding: 0.5rem;
  font-family: ui-monospace, monospace;
  font-size: 0.85rem;
  resize: vertical;
  color: inherit;
}

.imp-count {
  opacity: 0.7;
}

.imp-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 1rem 0;
}

.imp-field {
  flex: 1 1 200px;
}

.imp-field > span {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.imp-field input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem;
  font: inherit;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
}

.imp-field small {
  display: block;
  margin-top: 0.25rem;
  opacity: 0.75;
  font-size: 0.8em;
}

.imp-error-list,
.imp-warn-list {
  margin: 0.75rem 0;
  padding: 0.5rem 0.75rem 0.5rem 1.5rem;
  border-radius: 4px;
}

.imp-error-list {
  background: #fee2e2;
  color: #991b1b;
}

.imp-warn-list {
  background: #fef9c3;
  color: #854d0e;
}

.imp-preview {
  margin: 1rem 0;
}

.imp-preview-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.imp-table-wrap {
  max-height: 360px;
  overflow: auto;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 4px;
}

.imp-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.imp-table th,
.imp-table td {
  border-bottom: 1px solid var(--border-color, #eee);
  padding: 0.3rem 0.5rem;
  text-align: left;
}

.imp-table thead th {
  position: sticky;
  top: 0;
  background: var(--card-bg, #fff);
}

.imp-num {
  opacity: 0.6;
  text-align: right;
  width: 3em;
}

.imp-actions {
  margin-top: 1rem;
}

.imp-primary {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  background: #16a34a;
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.imp-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.imp-error {
  color: #991b1b;
}

.imp-ok {
  margin-top: 1rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
  background: #dcfce7;
  color: #166534;
}
</style>
