<!-- src/components/ScheduleEditor.vue -->
<!--
  Reusable CSV-trio editor: drop/paste weekday+saturday+holiday, hard-validate,
  preview the rotation table, then emit `submit` with the parsed data. It does no
  GitHub IO — the parent (ScheduleManager) owns config + commits, so the same
  component serves both "add a generation" and "edit an existing one".

  mode="add"  — from/folder are editable; full epoch-metadata validation runs.
  mode="edit" — from/folder are locked (content-only fix); only the CSVs validate.
-->
<template>
  <div class="editor">
    <div class="ed-slots">
      <div v-for="slot in SLOTS" :key="slot.key" class="ed-slot">
        <label>{{ slot.label }}</label>
        <div
          class="ed-drop"
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
        <small class="ed-count">{{ rowCount(slot.key) }} 行</small>
      </div>
    </div>

    <div class="ed-meta">
      <label class="ed-field">
        <span>有効日 (from)</span>
        <input v-model="fromStr" type="date" :disabled="mode === 'edit'" />
        <small v-if="mode === 'edit'">編集では変更できません</small>
        <small v-else>この日からこの交番表が「いまの世代」になります</small>
      </label>
      <label class="ed-field">
        <span>フォルダ名</span>
        <input
          v-model="folder"
          type="text"
          placeholder="rev20260801"
          spellcheck="false"
          :disabled="mode === 'edit'"
          @input="folderTouched = true"
        />
        <small v-if="mode === 'edit'">編集では変更できません</small>
        <small v-else>data/&lt;フォルダ名&gt;/ に3つのCSVが保存されます</small>
      </label>
    </div>

    <ul v-if="showValidation && errors.length" class="ed-error-list">
      <li v-for="(e, i) in errors" :key="i">{{ e }}</li>
    </ul>
    <ul v-if="showValidation && warnings.length" class="ed-warn-list">
      <li v-for="(w, i) in warnings" :key="i">⚠ {{ w }}</li>
    </ul>

    <div v-if="previewRows.length" class="ed-preview">
      <p class="ed-preview-title">
        プレビュー（コマ {{ previewRows.length }} 周期）—
        掲示物と見比べてください
      </p>
      <div class="ed-table-wrap">
        <table class="ed-table">
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
              <td class="ed-num">{{ row.n }}</td>
              <td>{{ row.weekday }}</td>
              <td>{{ row.saturday }}</td>
              <td>{{ row.holiday }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="ed-actions">
      <button
        type="button"
        class="ed-primary"
        :disabled="!canSubmit"
        @click="submit"
      >
        {{ busy ? "コミット中…" : submitLabel }}
      </button>
      <button
        v-if="mode === 'edit'"
        type="button"
        class="ed-secondary"
        :disabled="busy"
        @click="$emit('cancel')"
      >
        キャンセル
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from "vue";
import {
  validateTrio,
  validateEpochMeta,
  suggestFolderName,
} from "@/composables/useScheduleImport";

const SLOTS = [
  { key: "weekday", label: "平日", file: "weekday.csv" },
  { key: "saturday", label: "土曜", file: "saturday.csv" },
  { key: "holiday", label: "日祝", file: "holiday.csv" },
];

const props = defineProps({
  mode: { type: String, default: "add" }, // 'add' | 'edit'
  busy: { type: Boolean, default: false },
  existingFroms: { type: Array, default: () => [] },
  existingFolders: { type: Array, default: () => [] },
  initialFrom: { type: String, default: "" },
  initialFolder: { type: String, default: "" },
  initialTexts: {
    type: Object,
    default: () => ({ weekday: "", saturday: "", holiday: "" }),
  },
});

const emit = defineEmits(["submit", "cancel"]);

const texts = reactive({
  weekday: props.initialTexts.weekday || "",
  saturday: props.initialTexts.saturday || "",
  holiday: props.initialTexts.holiday || "",
});
const fromStr = ref(props.initialFrom);
const folder = ref(props.initialFolder);
const folderTouched = ref(props.mode === "edit");
const dragOver = ref("");

const submitLabel = computed(() =>
  props.mode === "edit" ? "修正を配信する" : "この内容で配信する",
);

const trioResult = computed(() => validateTrio(texts));
const epochResult = computed(() =>
  props.mode === "edit"
    ? { ok: true, errors: [], warnings: [] }
    : validateEpochMeta({
        fromStr: fromStr.value,
        folder: folder.value,
        existingFroms: props.existingFroms,
        existingFolders: props.existingFolders,
      }),
);

const hasInput = computed(
  () =>
    !!texts.weekday ||
    !!texts.saturday ||
    !!texts.holiday ||
    !!fromStr.value ||
    !!folder.value,
);
// Edit mode is always prefilled, so surface validation immediately; add mode
// stays quiet until the admin starts entering data.
const showValidation = computed(() => props.mode === "edit" || hasInput.value);

const errors = computed(() => [
  ...trioResult.value.errors,
  ...epochResult.value.errors,
]);
const warnings = computed(() => epochResult.value.warnings);

const canSubmit = computed(
  () => trioResult.value.ok && epochResult.value.ok && !props.busy,
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

function rowCount(key) {
  return trioResult.value.trio[key]?.length ?? 0;
}

// Auto-suggest the folder name from the date (add mode, until the admin edits).
watch(fromStr, (val) => {
  if (props.mode === "add" && !folderTouched.value) {
    folder.value = suggestFolderName(val);
  }
});

async function onDrop(key, event) {
  dragOver.value = "";
  const file = event.dataTransfer?.files?.[0];
  if (file) texts[key] = await file.text();
}

function submit() {
  if (!canSubmit.value) return;
  emit("submit", {
    fromStr: fromStr.value,
    folder: folder.value,
    trio: trioResult.value.trio,
  });
}
</script>

<style scoped>
.ed-slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  margin: 0.5rem 0 1rem;
}

.ed-slot label {
  font-weight: 600;
  display: block;
  margin-bottom: 0.25rem;
}

.ed-drop {
  border: 2px dashed var(--border-color, #bbb);
  border-radius: 6px;
  transition: border-color 0.15s;
}

.ed-drop.is-over {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.06);
}

.ed-drop textarea {
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

.ed-count {
  opacity: 0.7;
}

.ed-meta {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin: 1rem 0;
}

.ed-field {
  flex: 1 1 200px;
}

.ed-field > span {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.ed-field input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem;
  font: inherit;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
}

.ed-field input:disabled {
  opacity: 0.6;
}

.ed-field small {
  display: block;
  margin-top: 0.25rem;
  opacity: 0.75;
  font-size: 0.8em;
}

.ed-error-list,
.ed-warn-list {
  margin: 0.75rem 0;
  padding: 0.5rem 0.75rem 0.5rem 1.5rem;
  border-radius: 4px;
}

.ed-error-list {
  background: #fee2e2;
  color: #991b1b;
}

.ed-warn-list {
  background: #fef9c3;
  color: #854d0e;
}

.ed-preview {
  margin: 1rem 0;
}

.ed-preview-title {
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.ed-table-wrap {
  max-height: 360px;
  overflow: auto;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 4px;
}

.ed-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.ed-table th,
.ed-table td {
  border-bottom: 1px solid var(--border-color, #eee);
  padding: 0.3rem 0.5rem;
  text-align: left;
}

.ed-table thead th {
  position: sticky;
  top: 0;
  background: var(--card-bg, #fff);
}

.ed-num {
  opacity: 0.6;
  text-align: right;
  width: 3em;
}

.ed-actions {
  margin-top: 1rem;
  display: flex;
  gap: 0.75rem;
}

.ed-primary {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  background: #16a34a;
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.ed-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.ed-secondary {
  padding: 0.6rem 1.2rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}
</style>
