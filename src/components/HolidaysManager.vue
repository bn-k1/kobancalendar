<!-- src/components/HolidaysManager.vue -->
<!--
  Admin Phase 3: edit config.custom_holidays — recurring office holidays not in
  the japanese-holidays library, stored as MM-DD and applied every year.

  Edits are staged locally (add/remove chips) and committed in one go via
  useConfigEditor.commitConfig, which re-reads the freshest config so this never
  clobbers a schedule change made in ScheduleManager.
-->
<template>
  <section class="hol">
    <h2>独自の休日</h2>
    <p class="hol-muted">
      祝日ライブラリに無い職場独自の休日（毎年くり返し適用、MM-DD）。
    </p>

    <p v-if="loading" class="hol-muted">読み込み中…</p>
    <p v-else-if="loadError" class="hol-error">
      読み込みに失敗しました: {{ loadError }}
    </p>

    <template v-else>
      <div class="hol-chips">
        <span v-for="md in working" :key="md" class="hol-chip">
          {{ formatMd(md) }}
          <button
            type="button"
            class="hol-x"
            :disabled="busy"
            aria-label="削除"
            @click="remove(md)"
          >
            ×
          </button>
        </span>
        <span v-if="working.length === 0" class="hol-muted">（なし）</span>
      </div>

      <div class="hol-add">
        <input v-model="pickDate" type="date" :disabled="busy" />
        <button
          type="button"
          class="hol-secondary"
          :disabled="busy || !canAdd"
          @click="addPicked"
        >
          追加
        </button>
        <small class="hol-muted">年は無視され、月日だけ登録されます</small>
      </div>

      <div class="hol-actions">
        <button
          type="button"
          class="hol-primary"
          :disabled="busy || !dirty"
          @click="save"
        >
          {{ busy ? "保存中…" : "保存して配信する" }}
        </button>
        <button
          v-if="dirty"
          type="button"
          class="hol-link"
          :disabled="busy"
          @click="reset"
        >
          変更を取り消す
        </button>
        <span v-if="dirty" class="hol-dirty">未保存の変更があります</span>
      </div>

      <p v-if="opStatus.message" :class="['hol-status', `is-${opStatus.type}`]">
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
import { useConfigEditor } from "@/composables/useConfigEditor";

const { resolveRepo } = useGitHubApi();
const { readConfig, commitConfig } = useConfigEditor();

const MD_RE = /^(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;

const loading = ref(true);
const loadError = ref("");
const busy = ref(false);
const original = ref([]);
const working = ref([]);
const pickDate = ref("");
const opStatus = ref({ type: "", message: "", sha: "" });

const dirty = computed(
  () => JSON.stringify(working.value) !== JSON.stringify(original.value),
);

const pickedMd = computed(() =>
  pickDate.value && pickDate.value.length >= 10 ? pickDate.value.slice(5) : "",
);
const canAdd = computed(
  () => MD_RE.test(pickedMd.value) && !working.value.includes(pickedMd.value),
);

const commitUrl = computed(() => {
  const repo = resolveRepo();
  if (!repo || !opStatus.value.sha) return "";
  return `https://github.com/${repo.owner}/${repo.repo}/commit/${opStatus.value.sha}`;
});

function formatMd(md) {
  const [m, d] = md.split("-");
  return `${Number(m)}月${Number(d)}日`;
}

function sortMd(list) {
  return [...list].sort();
}

async function load() {
  loading.value = true;
  loadError.value = "";
  try {
    const cfg = await readConfig();
    const list = Array.isArray(cfg.custom_holidays)
      ? cfg.custom_holidays.filter((md) => MD_RE.test(md))
      : [];
    original.value = sortMd(list);
    working.value = sortMd(list);
  } catch (err) {
    loadError.value = err.message;
  } finally {
    loading.value = false;
  }
}

onMounted(load);

function addPicked() {
  if (!canAdd.value) return;
  working.value = sortMd([...working.value, pickedMd.value]);
  pickDate.value = "";
}

function remove(md) {
  working.value = working.value.filter((x) => x !== md);
}

function reset() {
  working.value = sortMd(original.value);
}

async function save() {
  if (!dirty.value) return;
  busy.value = true;
  opStatus.value = { type: "", message: "", sha: "" };
  try {
    const sha = await commitConfig({
      build: (cfg) => {
        cfg.custom_holidays = sortMd(working.value);
        return { config: cfg, message: "config: 独自休日を更新" };
      },
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
.hol {
  max-width: 760px;
  margin: 1.5rem auto 0;
  padding: 1.5rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 8px;
  background: var(--card-bg, #fff);
}

.hol h2 {
  margin-top: 0;
}

.hol-muted {
  opacity: 0.75;
  font-size: 0.9em;
}

.hol-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 1rem 0;
}

.hol-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  padding: 0.2rem 0.6rem;
  border-radius: 999px;
  background: rgba(127, 127, 127, 0.15);
  font-size: 0.9em;
}

.hol-x {
  border: none;
  background: none;
  color: #dc2626;
  cursor: pointer;
  font-size: 1.1em;
  line-height: 1;
  padding: 0;
}

.hol-x:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.hol-add {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin: 1rem 0;
}

.hol-add input {
  padding: 0.5rem;
  font: inherit;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
}

.hol-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.hol-primary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #16a34a;
  color: #fff;
  font: inherit;
  cursor: pointer;
}

.hol-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hol-secondary {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.hol-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.hol-link {
  border: none;
  background: none;
  color: #2563eb;
  text-decoration: underline;
  cursor: pointer;
  font: inherit;
}

.hol-dirty {
  color: #854d0e;
  font-size: 0.85em;
}

.hol-status {
  margin-top: 1rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

.hol-status.is-ok {
  background: #dcfce7;
  color: #166534;
}

.hol-status.is-error {
  background: #fee2e2;
  color: #991b1b;
}

.hol-error {
  color: #991b1b;
}
</style>
