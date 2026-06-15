<!-- src/components/ScheduleManager.vue -->
<!--
  Admin Phase 3: manage schedule generations from the browser — add, edit
  (content fix), and delete — plus clean up orphan data/ folders. Owns the
  config.json fetch and all GitHub IO; ScheduleEditor is the shared trio UI.

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
          <tr v-for="row in rows" :key="row.index">
            <td>{{ row.from }}</td>
            <td>
              {{ row.effectiveData
              }}<span v-if="row.inherited" class="mgr-inherit">（継承）</span>
            </td>
            <td>
              <span :class="['mgr-badge', `badge-${row.badge}`]">{{
                row.label
              }}</span>
            </td>
            <td class="mgr-row-actions">
              <button
                type="button"
                class="mgr-link"
                :disabled="busy"
                @click="startEdit(row)"
              >
                編集
              </button>
              <button
                type="button"
                class="mgr-link mgr-danger"
                :disabled="busy || !row.canDelete"
                :title="row.canDelete ? '' : '現行世代や継承元は削除できません'"
                @click="deleteGeneration(row)"
              >
                削除
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- edit panel -->
      <div v-if="editing" class="mgr-panel">
        <h3>世代を編集: {{ editing.from }} → {{ editing.folder }}</h3>
        <ScheduleEditor
          :key="`edit-${editing.index}`"
          mode="edit"
          :busy="busy"
          :initial-from="editing.from"
          :initial-folder="editing.folder"
          :initial-texts="editing.texts"
          @submit="onEditSubmit"
          @cancel="editing = null"
        />
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
const showAdd = ref(false);
const addKey = ref(0);

const epochs = computed(() => config.value?.schedules || []);

// Folders referenced by a given schedules array, honoring data inheritance.
function referencedFolders(schedules) {
  let carry = null;
  const set = new Set();
  for (const e of schedules) {
    const eff = e.data || carry;
    carry = eff;
    if (eff) set.add(eff);
  }
  return set;
}

// Normalized rows: effective data, current/past/future label, delete guard.
const rows = computed(() => {
  const today0 = today();
  let carry = null;
  const items = epochs.value.map((e, i) => {
    const eff = e.data || carry;
    carry = eff;
    return {
      from: e.from,
      data: e.data,
      effectiveData: eff,
      inherited: !e.data,
      index: i,
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
    const nextInherits = items[i + 1] && !items[i + 1].data;
    const canDelete = i !== currentIndex && !nextInherits;
    return { ...it, label, badge, canDelete };
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

async function startEdit(row) {
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  try {
    const base = `data/${row.effectiveData}`;
    const [w, s, h] = await Promise.all([
      getFile(`${base}/weekday.csv`),
      getFile(`${base}/saturday.csv`),
      getFile(`${base}/holiday.csv`),
    ]);
    editing.value = {
      index: row.index,
      from: row.from,
      folder: row.effectiveData,
      texts: {
        weekday: w?.content || "",
        saturday: s?.content || "",
        holiday: h?.content || "",
      },
    };
    showAdd.value = false;
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

async function deleteGeneration(row) {
  if (!row.canDelete) return;
  if (
    !window.confirm(
      `世代「${row.from} → ${row.effectiveData}」を削除します。よろしいですか？`,
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
          (e) => e.from !== row.from,
        );
        const extraFiles = [];
        // If this epoch owned its folder and nothing else references it, delete it.
        if (row.data && !referencedFolders(cfg.schedules).has(row.data)) {
          const entries = await listDir(`data/${row.data}`);
          for (const e of entries.filter((x) => x.type === "file")) {
            extraFiles.push({ path: e.path, delete: true });
          }
        }
        return {
          config: cfg,
          message: `data: ${row.from} → ${row.effectiveData} 世代を削除`,
          extraFiles,
        };
      },
    });
    await afterCommit(sha, `世代 ${row.from} を削除しました`);
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
