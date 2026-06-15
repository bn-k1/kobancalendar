<!-- src/views/AdminView.vue -->
<!--
  Admin foundation (Phase 1): connect a fine-grained GitHub PAT and confirm the
  app can authenticate + push to the resolved repo. Reachable only by typing
  #/admin — there is intentionally no link from the user-facing UI.

  Phases 2/3 will add drag-and-drop import and config forms on top of the
  GitHub API client wired up here.
-->
<template>
  <UnifiedPageLayout title="管理画面🔧">
    <div class="admin-page">
      <section class="admin-card">
        <h2>GitHub 接続</h2>

        <p class="admin-repo">
          対象リポジトリ:
          <strong v-if="repo">{{ repo.owner }}/{{ repo.repo }}</strong>
          <span v-else class="admin-warn">未特定</span>
          <span v-if="repo" class="admin-source"
            >（{{ repoSourceLabel }}）</span
          >
        </p>

        <label v-if="!repo || showRepoOverride" class="admin-field">
          <span>リポジトリ (owner/repo)</span>
          <input
            v-model="repoInput"
            type="text"
            placeholder="bn-k1/kobancalendar"
            autocomplete="off"
            spellcheck="false"
          />
          <small
            >URL
            から自動特定できない環境（ローカル開発・独自ドメイン）でのみ入力します。</small
          >
        </label>
        <button
          v-else
          type="button"
          class="admin-link-btn"
          @click="showRepoOverride = true"
        >
          リポジトリを手動指定する
        </button>

        <label class="admin-field">
          <span>Personal Access Token (fine-grained)</span>
          <input
            v-model="tokenInput"
            type="password"
            placeholder="github_pat_..."
            autocomplete="off"
            spellcheck="false"
          />
          <small
            >Contents の Read and write 権限を持つトークン。この端末の
            localStorage にのみ保存され、共有・送信されません。</small
          >
        </label>

        <div class="admin-actions">
          <button
            type="button"
            class="admin-primary"
            :disabled="testing || !tokenInput"
            @click="testConnection"
          >
            {{ testing ? "確認中…" : "保存して接続テスト" }}
          </button>
          <button
            type="button"
            class="admin-secondary"
            :disabled="testing"
            @click="clearStored"
          >
            保存済みトークンを削除
          </button>
        </div>

        <p v-if="status.type" :class="['admin-status', `is-${status.type}`]">
          {{ status.message }}
        </p>

        <ul v-if="result" class="admin-result">
          <li>
            認証ユーザー: <strong>{{ result.login }}</strong>
          </li>
          <li>
            リポジトリ: <strong>{{ result.owner }}/{{ result.repo }}</strong>
          </li>
          <li>
            書き込み権限:
            <strong :class="result.canPush ? 'admin-ok' : 'admin-warn'">
              {{ result.canPush ? "あり" : "なし" }}
            </strong>
          </li>
          <li>
            既定ブランチ: <strong>{{ result.defaultBranch }}</strong>
          </li>
        </ul>
      </section>

      <ScheduleManager v-if="connected" />
      <HolidaysManager v-if="connected" />
    </div>
  </UnifiedPageLayout>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import UnifiedPageLayout from "@/layouts/UnifiedPageLayout.vue";
import ScheduleManager from "@/components/ScheduleManager.vue";
import HolidaysManager from "@/components/HolidaysManager.vue";
import { useAdminToken } from "@/composables/useAdminToken";
import { useGitHubApi } from "@/composables/useGitHubApi";

const {
  readToken,
  saveToken,
  clearToken,
  hasToken,
  readRepoOverride,
  saveRepoOverride,
} = useAdminToken();
const { resolveRepo, verifyToken } = useGitHubApi();

// Show the importer once a token is stored and a repo is resolvable. Becomes
// true after a successful connection test, or on mount if both already exist.
const connected = ref(false);

const tokenInput = ref("");
const repoInput = ref("");
const showRepoOverride = ref(false);
const testing = ref(false);
const status = ref({ type: "", message: "" });
const result = ref(null);

const repo = computed(() => resolveRepoReactive.value);
// resolveRepo() reads localStorage/window; recompute on demand via a bumped ref.
const repoTick = ref(0);
const resolveRepoReactive = computed(() => {
  // touch repoTick so saving an override re-resolves
  void repoTick.value;
  return resolveRepo();
});

const repoSourceLabel = computed(() =>
  repo.value?.source === "override" ? "手動指定" : "URLから自動特定",
);

onMounted(() => {
  // Prefill from what is already stored (token shown masked by the password field).
  tokenInput.value = readToken();
  const override = readRepoOverride();
  if (override) {
    repoInput.value = `${override.owner}/${override.repo}`;
    showRepoOverride.value = true;
  }
  connected.value = hasToken() && !!resolveRepo();
});

async function testConnection() {
  status.value = { type: "", message: "" };
  result.value = null;
  testing.value = true;
  try {
    // Persist repo override first so resolveRepo() inside verifyToken sees it.
    saveRepoOverride(repoInput.value || null);
    repoTick.value += 1;

    const info = await verifyToken(tokenInput.value);
    // Only persist the token once it actually authenticated.
    saveToken(tokenInput.value);
    result.value = info;
    connected.value = info.canPush;
    status.value = info.canPush
      ? { type: "ok", message: "接続成功。トークンを保存しました。" }
      : {
          type: "warn",
          message:
            "認証はできましたが、このリポジトリへの書き込み権限がありません。トークンの権限を確認してください。",
        };
  } catch (err) {
    status.value = {
      type: "error",
      message: `接続失敗: ${err.message}`,
    };
  } finally {
    testing.value = false;
  }
}

function clearStored() {
  clearToken();
  tokenInput.value = "";
  result.value = null;
  connected.value = false;
  status.value = { type: "ok", message: "保存済みトークンを削除しました。" };
}
</script>

<style scoped>
.admin-page {
  max-width: 640px;
  margin: 0 auto;
  padding: 1rem;
}

.admin-card {
  border: 1px solid var(--border-color, #ccc);
  border-radius: 8px;
  padding: 1.5rem;
  background: var(--card-bg, #fff);
}

.admin-card h2 {
  margin-top: 0;
}

.admin-repo {
  margin: 0.5rem 0 1rem;
}

.admin-source {
  font-size: 0.85em;
  opacity: 0.7;
}

.admin-field {
  display: block;
  margin: 1rem 0;
}

.admin-field > span {
  display: block;
  font-weight: 600;
  margin-bottom: 0.25rem;
}

.admin-field input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.5rem;
  font-family: inherit;
  font-size: 1rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
}

.admin-field small {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.8em;
  opacity: 0.75;
}

.admin-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.admin-actions button,
.admin-link-btn {
  cursor: pointer;
  font: inherit;
}

.admin-primary {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #2563eb;
  color: #fff;
}

.admin-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.admin-secondary {
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  background: transparent;
  color: inherit;
}

.admin-link-btn {
  border: none;
  background: none;
  color: #2563eb;
  text-decoration: underline;
  padding: 0;
  margin: 0.5rem 0;
}

.admin-status {
  margin-top: 1rem;
  padding: 0.5rem 0.75rem;
  border-radius: 4px;
}

.admin-status.is-ok {
  background: #dcfce7;
  color: #166534;
}

.admin-status.is-warn {
  background: #fef9c3;
  color: #854d0e;
}

.admin-status.is-error {
  background: #fee2e2;
  color: #991b1b;
}

.admin-result {
  margin-top: 1rem;
  padding-left: 1.25rem;
  line-height: 1.7;
}

.admin-ok {
  color: #166534;
}

.admin-warn {
  color: #b45309;
}
</style>
