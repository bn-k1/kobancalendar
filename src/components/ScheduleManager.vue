<!-- src/components/ScheduleManager.vue -->
<!--
  Admin Phase 3: manage schedule generations from the browser — add, edit
  (content fix), and delete — plus clean up orphan data/ folders. Owns the
  config.json fetch and all GitHub IO; ScheduleEditor is the shared trio UI.

  A generation may also carry in-epoch "table swaps" (`data` as an array): the
  anchor/rotation stays fixed and only the CSV table changes on a date. These
  show as indented sub-rows with a "＋ 途中で表を差し替え" affordance, and are
  added/edited/deleted independently of the generation itself.

  Safety: the *current* generation can be edited but not deleted (deleting it
  would blank today's calendar). To retire the current table, add a newer
  generation that supersedes it, then prune the old one. Deleting a generation
  whose successor inherits its data (a position-shift transition) is also
  blocked, since that would break the inheritance chain at build time.
-->
<template>
  <section class="mgr">
    <h2>交番表の管理</h2>

    <p v-if="loadingConfig" class="mgr-muted">読み込み中…</p>
    <p v-else-if="configError" class="mgr-error">
      読み込みに失敗しました: {{ configError }}
    </p>

    <template v-else>
      <!-- operation result -->
      <p v-if="opStatus.message" :class="['mgr-status', `is-${opStatus.type}`]">
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

      <!-- generations list -->
      <table class="mgr-table">
        <thead>
          <tr>
            <th>有効日 (from)</th>
            <th>データ</th>
            <th>状態</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <template v-for="gen in generations" :key="gen.index">
            <!-- generation base row -->
            <tr>
              <td>{{ gen.from }}</td>
              <td>
                {{ gen.baseFolder
                }}<span v-if="gen.inherited" class="mgr-inherit">（継承）</span>
              </td>
              <td>
                <span :class="['mgr-badge', `badge-${gen.badge}`]">{{
                  gen.label
                }}</span>
              </td>
              <td class="mgr-row-actions">
                <button
                  type="button"
                  class="mgr-link"
                  :disabled="busy"
                  @click="
                    startEdit({
                      index: gen.index,
                      from: gen.from,
                      folder: gen.baseFolder,
                    })
                  "
                >
                  編集
                </button>
                <button
                  type="button"
                  class="mgr-link mgr-danger"
                  :disabled="busy || !gen.canDelete"
                  :title="
                    gen.canDelete ? '' : '現行世代や継承元は削除できません'
                  "
                  @click="deleteGeneration(gen)"
                >
                  削除
                </button>
              </td>
            </tr>
            <!-- in-epoch table-swap segments -->
            <tr
              v-for="seg in gen.swapSegments"
              :key="`${gen.index}-${seg.segIndex}`"
              class="mgr-seg-row"
            >
              <td class="mgr-seg-from">└ {{ seg.from }}〜</td>
              <td>
                {{ seg.folder
                }}<span class="mgr-badge badge-swap">表差し替え</span>
              </td>
              <td></td>
              <td class="mgr-row-actions">
                <button
                  type="button"
                  class="mgr-link"
                  :disabled="busy"
                  @click="
                    startEdit({
                      index: gen.index,
                      from: seg.from,
                      folder: seg.folder,
                      isSegment: true,
                    })
                  "
                >
                  編集
                </button>
                <button
                  type="button"
                  class="mgr-link mgr-danger"
                  :disabled="busy"
                  @click="deleteSegment(gen, seg)"
                >
                  削除
                </button>
              </td>
            </tr>
            <!-- add an in-epoch swap to this generation -->
            <tr v-if="gen.canAddSegment" class="mgr-seg-add-row">
              <td colspan="4">
                <button
                  type="button"
                  class="mgr-link mgr-seg-add"
                  :disabled="busy"
                  @click="openAddSegment(gen)"
                >
                  ＋ 途中で表を差し替え
                </button>
              </td>
            </tr>
          </template>
        </tbody>
      </table>

      <!-- edit panel -->
      <div v-if="editing" class="mgr-panel">
        <h3>
          {{ editing.isSegment ? "差し替えを編集" : "世代を編集" }}:
          {{ editing.from }} → {{ editing.folder }}
        </h3>
        <ScheduleEditor
          :key="`edit-${editing.index}-${editing.from}`"
          mode="edit"
          :busy="busy"
          :initial-from="editing.from"
          :initial-folder="editing.folder"
          :initial-texts="editing.texts"
          @submit="onEditSubmit"
          @cancel="editing = null"
        />
      </div>

      <!-- add in-epoch swap panel -->
      <div v-else-if="addingSegment" class="mgr-panel">
        <h3>途中で表を差し替え（{{ addingSegment.genFrom }} 世代）</h3>
        <p class="mgr-muted">
          回転・コマ位置はそのまま、指定日から交番表（CSV）だけが切り替わります。コマ数は世代と同じ
          {{ addingSegment.requiredCycleLength }} 行にしてください。
        </p>
        <ScheduleEditor
          :key="`seg-${addingSegment.genIndex}-${addKey}`"
          mode="add-segment"
          :busy="busy"
          :window-start="addingSegment.genFrom"
          :window-end="addingSegment.windowEnd"
          :existing-segment-froms="addingSegment.existingSegmentFroms"
          :existing-folders="existingFolders"
          :required-cycle-length="addingSegment.requiredCycleLength"
          @submit="onAddSegmentSubmit"
          @cancel="addingSegment = null"
        />
        <button
          type="button"
          class="mgr-link"
          :disabled="busy"
          @click="addingSegment = null"
        >
          閉じる
        </button>
      </div>

      <!-- add panel -->
      <div v-else class="mgr-add">
        <button
          v-if="!showAdd"
          type="button"
          class="mgr-add-toggle"
          :disabled="busy"
          @click="showAdd = true"
        >
          ＋ 新しい世代を追加
        </button>
        <div v-else class="mgr-panel">
          <h3>新しい世代を追加</h3>
          <ScheduleEditor
            :key="`add-${addKey}`"
            mode="add"
            :busy="busy"
            :existing-froms="existingFroms"
            :existing-folders="existingFolders"
            @submit="onAddSubmit"
            @cancel="showAdd = false"
          />
          <button
            type="button"
            class="mgr-link"
            :disabled="busy"
            @click="showAdd = false"
          >
            閉じる
          </button>
        </div>
      </div>

      <!-- orphan folder cleanup -->
      <div v-if="orphanFolders.length" class="mgr-orphans">
        <h3>未使用のデータフォルダ</h3>
        <p class="mgr-muted">
          どの世代からも参照されていないフォルダです。削除できます。
        </p>
        <ul>
          <li v-for="name in orphanFolders" :key="name">
            <code>data/{{ name }}/</code>
            <button
              type="button"
              class="mgr-link mgr-danger"
              :disabled="busy"
              @click="deleteOrphan(name)"
            >
              削除
            </button>
          </li>
        </ul>
      </div>
    </template>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import ScheduleEditor from "@/components/ScheduleEditor.vue";
import { useGitHubApi } from "@/composables/useGitHubApi";
import { useConfigEditor } from "@/composables/useConfigEditor";
import { serializeCsv } from "@/composables/useScheduleImport";
import { createDate, today } from "@/utils/date";

const { resolveRepo, getFile, listDir, commitFiles } = useGitHubApi();
const { commitConfig } = useConfigEditor();

const config = ref(null);
const dataDirs = ref([]);
const loadingConfig = ref(true);
const configError = ref("");

const busy = ref(false);
const opStatus = ref({ type: "", message: "", sha: "" });

const editing = ref(null);
const addingSegment = ref(null);
const showAdd = ref(false);
const addKey = ref(0);

const epochs = computed(() => config.value?.schedules || []);

// Folders referenced by a given schedules array, honoring data inheritance and
// the array (in-epoch swap) form where one entry references several folders.
function referencedFolders(schedules) {
  let carry = null;
  const set = new Set();
  for (const e of schedules) {
    if (Array.isArray(e.data)) {
      for (const seg of e.data) {
        if (seg?.data) {
          set.add(seg.data);
          carry = seg.data;
        }
      }
    } else {
      const eff = e.data || carry;
      carry = eff;
      if (eff) set.add(eff);
    }
  }
  return set;
}

// Expand a schedules entry into its display segments. The base segment anchors
// at the generation's `from`; array form adds later in-epoch swap segments.
function entrySegments(entry, baseFolder) {
  if (Array.isArray(entry.data)) {
    return entry.data.map((seg, si) => ({
      from: si === 0 ? entry.from : seg.from,
      folder: seg.data,
      segIndex: si,
    }));
  }
  return [{ from: entry.from, folder: baseFolder, segIndex: 0 }];
}

// Normalized generations: base folder (resolving inheritance), in-epoch swap
// segments, current/past/future label, and add/delete guards.
const generations = computed(() => {
  const today0 = today();
  let carry = null;
  const items = epochs.value.map((e, i) => {
    let baseFolder;
    if (Array.isArray(e.data)) {
      baseFolder = e.data[0]?.data;
      carry = e.data[e.data.length - 1]?.data ?? carry;
    } else {
      baseFolder = e.data || carry;
      carry = baseFolder;
    }
    const segments = entrySegments(e, baseFolder);
    return {
      index: i,
      from: e.from,
      baseFolder,
      inherited: !Array.isArray(e.data) && !e.data,
      segments,
      swapSegments: segments.filter((s) => s.segIndex >= 1),
    };
  });
  let currentIndex = -1;
  items.forEach((it, i) => {
    if (createDate(it.from).isSameOrBefore(today0, "day")) currentIndex = i;
  });
  return items.map((it, i) => {
    let label, badge;
    if (i === currentIndex) {
      label = "現行";
      badge = "current";
    } else if (i < currentIndex) {
      label = "過去";
      badge = "past";
    } else {
      label = "未来（新版）";
      badge = "future";
    }
    const next = epochs.value[i + 1];
    const nextInherits = next && !Array.isArray(next.data) && !next.data;
    const canDelete = i !== currentIndex && !nextInherits;
    // In-epoch swaps only make sense for the current/future generations.
    const canAddSegment = i >= currentIndex;
    const windowEnd = next?.from || "";
    return { ...it, label, badge, canDelete, canAddSegment, windowEnd };
  });
});

const existingFroms = computed(() => epochs.value.map((e) => e.from));
const existingFolders = computed(() => [
  ...new Set([...dataDirs.value, ...referencedFolders(epochs.value)]),
]);

const orphanFolders = computed(() => {
  const ref = referencedFolders(epochs.value);
  return dataDirs.value.filter((n) => n !== "menu" && !ref.has(n));
});

const commitUrl = computed(() => {
  const repo = resolveRepo();
  if (!repo || !opStatus.value.sha) return "";
  return `https://github.com/${repo.owner}/${repo.repo}/commit/${opStatus.value.sha}`;
});

const csvFile = (folder, kind, rowsArr) => ({
  path: `data/${folder}/${kind}.csv`,
  content: serializeCsv(rowsArr),
});

async function load() {
  loadingConfig.value = true;
  configError.value = "";
  try {
    const file = await getFile("config/config.json");
    config.value = file ? JSON.parse(file.content) : { schedules: [] };
    const entries = await listDir("data");
    dataDirs.value = entries.filter((e) => e.type === "dir").map((e) => e.name);
  } catch (err) {
    configError.value = err.message;
  } finally {
    loadingConfig.value = false;
  }
}

onMounted(load);

function fail(err) {
  opStatus.value = { type: "error", message: `失敗: ${err.message}`, sha: "" };
}

async function afterCommit(sha, message) {
  opStatus.value = { type: "ok", message, sha };
  await load();
}

async function onAddSubmit({ fromStr, folder, trio }) {
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  try {
    const sha = await commitConfig({
      build: (cfg) => {
        cfg.schedules = [
          ...(cfg.schedules || []),
          { from: fromStr, data: folder },
        ];
        return {
          config: cfg,
          message: `data: ${folder} 世代を追加 (from ${fromStr})`,
          extraFiles: [
            csvFile(folder, "weekday", trio.weekday),
            csvFile(folder, "saturday", trio.saturday),
            csvFile(folder, "holiday", trio.holiday),
          ],
        };
      },
    });
    showAdd.value = false;
    addKey.value += 1;
    await afterCommit(sha, `世代 ${fromStr} → ${folder} を追加しました`);
  } catch (err) {
    fail(err);
  } finally {
    busy.value = false;
  }
}

// Edit the CSV content of a generation's base folder or one of its swap
// segments. Both just need the target folder; content-only (from/folder locked).
async function startEdit({ index, from, folder, isSegment = false }) {
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  try {
    const base = `data/${folder}`;
    const [w, s, h] = await Promise.all([
      getFile(`${base}/weekday.csv`),
      getFile(`${base}/saturday.csv`),
      getFile(`${base}/holiday.csv`),
    ]);
    editing.value = {
      index,
      from,
      folder,
      isSegment,
      texts: {
        weekday: w?.content || "",
        saturday: s?.content || "",
        holiday: h?.content || "",
      },
    };
    showAdd.value = false;
    addingSegment.value = null;
  } catch (err) {
    fail(err);
  } finally {
    busy.value = false;
  }
}

// Count non-blank CSV rows = コマ数 (cycle length), matching convertCsv.js.
function countCsvRows(text) {
  return (text || "").split(/\r?\n/).filter((l) => l.trim() !== "").length;
}

// Open the "in-epoch table swap" editor for a generation. Fetches the base
// folder's コマ数 so the new CSV can be validated against it client-side.
async function openAddSegment(gen) {
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  try {
    const h = await getFile(`data/${gen.baseFolder}/holiday.csv`);
    addingSegment.value = {
      genIndex: gen.index,
      genFrom: gen.from,
      baseFolder: gen.baseFolder,
      windowEnd: gen.windowEnd,
      existingSegmentFroms: gen.segments.map((s) => s.from),
      requiredCycleLength: h ? countCsvRows(h.content) : 0,
    };
    editing.value = null;
    showAdd.value = false;
  } catch (err) {
    fail(err);
  } finally {
    busy.value = false;
  }
}

async function onAddSegmentSubmit({ fromStr, folder, trio }) {
  const ctx = addingSegment.value;
  if (!ctx) return;
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  try {
    const sha = await commitConfig({
      build: (cfg) => {
        const list = cfg.schedules || [];
        const e = list[ctx.genIndex];
        // Materialize the generation into segment-array form, then append.
        const arr = Array.isArray(e.data)
          ? e.data.map((seg) => ({ ...seg }))
          : [{ data: ctx.baseFolder }];
        arr.push({ from: fromStr, data: folder });
        e.data = arr;
        cfg.schedules = list;
        return {
          config: cfg,
          message: `data: ${ctx.genFrom} 世代に ${fromStr}〜 ${folder} の表差し替えを追加`,
          extraFiles: [
            csvFile(folder, "weekday", trio.weekday),
            csvFile(folder, "saturday", trio.saturday),
            csvFile(folder, "holiday", trio.holiday),
          ],
        };
      },
    });
    addingSegment.value = null;
    addKey.value += 1;
    await afterCommit(
      sha,
      `${ctx.genFrom} 世代に ${fromStr}〜 表差し替えを追加しました`,
    );
  } catch (err) {
    fail(err);
  } finally {
    busy.value = false;
  }
}

async function deleteSegment(gen, seg) {
  if (
    !window.confirm(
      `差し替え「${seg.from}〜 ${seg.folder}」を削除します。よろしいですか？`,
    )
  ) {
    return;
  }
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  try {
    const sha = await commitConfig({
      build: async (cfg) => {
        const list = cfg.schedules || [];
        const e = list[gen.index];
        const extraFiles = [];
        if (Array.isArray(e.data)) {
          const arr = e.data.filter((_, i) => i !== seg.segIndex);
          // Collapse back to a plain string when only the base segment remains.
          e.data = arr.length === 1 ? arr[0].data : arr;
          if (seg.folder && !referencedFolders(list).has(seg.folder)) {
            const entries = await listDir(`data/${seg.folder}`);
            for (const x of entries.filter((x) => x.type === "file")) {
              extraFiles.push({ path: x.path, delete: true });
            }
          }
        }
        return {
          config: cfg,
          message: `data: ${gen.from} 世代の差し替え（${seg.from}〜 ${seg.folder}）を削除`,
          extraFiles,
        };
      },
    });
    await afterCommit(sha, `差し替え ${seg.from}〜 を削除しました`);
  } catch (err) {
    fail(err);
  } finally {
    busy.value = false;
  }
}

async function onEditSubmit({ trio }) {
  const target = editing.value;
  if (!target) return;
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  try {
    const folder = target.folder;
    const sha = await commitFiles({
      message: `data: ${folder} の交番表を修正`,
      files: [
        csvFile(folder, "weekday", trio.weekday),
        csvFile(folder, "saturday", trio.saturday),
        csvFile(folder, "holiday", trio.holiday),
      ],
    });
    editing.value = null;
    await afterCommit(sha, `世代 ${target.from} → ${folder} を修正しました`);
  } catch (err) {
    fail(err);
  } finally {
    busy.value = false;
  }
}

async function deleteGeneration(gen) {
  if (!gen.canDelete) return;
  if (
    !window.confirm(
      `世代「${gen.from} → ${gen.baseFolder}」を削除します。よろしいですか？`,
    )
  ) {
    return;
  }
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  try {
    const sha = await commitConfig({
      build: async (cfg) => {
        // Identify by `from` (unique), not index — the fresh config may differ
        // from what's displayed if another section committed in the meantime.
        cfg.schedules = (cfg.schedules || []).filter(
          (e) => e.from !== gen.from,
        );
        const extraFiles = [];
        // Delete each folder this generation owned (base + swap segments) that
        // is no longer referenced after the removal.
        const stillRef = referencedFolders(cfg.schedules);
        const ownFolders = [
          ...new Set(gen.segments.map((s) => s.folder).filter(Boolean)),
        ];
        for (const folder of ownFolders) {
          if (stillRef.has(folder)) continue;
          const entries = await listDir(`data/${folder}`);
          for (const x of entries.filter((e) => e.type === "file")) {
            extraFiles.push({ path: x.path, delete: true });
          }
        }
        return {
          config: cfg,
          message: `data: ${gen.from} → ${gen.baseFolder} 世代を削除`,
          extraFiles,
        };
      },
    });
    await afterCommit(sha, `世代 ${gen.from} を削除しました`);
  } catch (err) {
    fail(err);
  } finally {
    busy.value = false;
  }
}

async function deleteOrphan(name) {
  if (
    !window.confirm(
      `未使用フォルダ data/${name}/ を削除します。よろしいですか？`,
    )
  ) {
    return;
  }
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  try {
    const entries = await listDir(`data/${name}`);
    const files = entries
      .filter((x) => x.type === "file")
      .map((e) => ({ path: e.path, delete: true }));
    if (files.length === 0) {
      opStatus.value = {
        type: "warn",
        message: `data/${name}/ に削除対象のファイルがありません`,
        sha: "",
      };
      return;
    }
    const sha = await commitFiles({
      message: `data: 未使用フォルダ ${name} を削除`,
      files,
    });
    await afterCommit(sha, `フォルダ ${name} を削除しました`);
  } catch (err) {
    fail(err);
  } finally {
    busy.value = false;
  }
}
</script>

<style scoped>
.mgr {
  max-width: 760px;
  margin: 1.5rem auto 0;
  padding: 1.5rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 8px;
  background: var(--card-bg, #fff);
}

.mgr h2 {
  margin-top: 0;
}

.mgr-muted {
  opacity: 0.75;
  font-size: 0.9em;
}

.mgr-table {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.mgr-table th,
.mgr-table td {
  border-bottom: 1px solid var(--border-color, #eee);
  padding: 0.5rem;
  text-align: left;
}

.mgr-inherit {
  opacity: 0.6;
  font-size: 0.85em;
}

.mgr-badge {
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8em;
}

.badge-current {
  background: #dcfce7;
  color: #166534;
}

.badge-past {
  background: rgba(127, 127, 127, 0.18);
}

.badge-future {
  background: #dbeafe;
  color: #1e40af;
}

.badge-swap {
  background: #fef3c7;
  color: #92400e;
  margin-left: 0.4rem;
}

/* In-epoch table-swap segment rows, indented under their generation. */
.mgr-seg-row td {
  border-top: none;
  background: rgba(127, 127, 127, 0.04);
}

.mgr-seg-from {
  padding-left: 1.25rem;
  opacity: 0.8;
  white-space: nowrap;
}

.mgr-seg-add-row td {
  border-top: none;
  padding-top: 0.1rem;
  padding-bottom: 0.5rem;
}

.mgr-seg-add {
  font-size: 0.85em;
  padding-left: 1.25rem;
}

.mgr-row-actions {
  white-space: nowrap;
  text-align: right;
}

.mgr-link {
  border: none;
  background: none;
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
  padding: 0 0.4rem;
}

.mgr-link:disabled {
  opacity: 0.4;
  cursor: not-allowed;
  text-decoration: none;
}

.mgr-danger {
  color: #dc2626;
}

.mgr-panel {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color, #ddd);
  border-radius: 6px;
}

.mgr-panel h3 {
  margin-top: 0;
}

.mgr-add-toggle {
  margin-top: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px dashed var(--border-color, #bbb);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font: inherit;
}

.mgr-orphans {
  margin-top: 1.5rem;
}

.mgr-orphans ul {
  list-style: none;
  padding: 0;
}

.mgr-orphans li {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0;
}

.mgr-status {
  margin: 0.5rem 0;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

.mgr-status.is-ok {
  background: #dcfce7;
  color: #166534;
}

.mgr-status.is-warn {
  background: #fef9c3;
  color: #854d0e;
}

.mgr-status.is-error {
  background: #fee2e2;
  color: #991b1b;
}

.mgr-error {
  color: #991b1b;
}
</style>
