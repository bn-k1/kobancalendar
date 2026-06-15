<!-- src/components/PromptHelper.vue -->
<!--
  Admin Phase 4: hand the admin the AI prompt that turns a posted roster
  (Excel / PDF / photo) into the three CSVs the importer accepts. The app does
  NOT call any AI itself — this is just a copy button for a prompt the admin
  pastes into a chat AI (ChatGPT / Claude / Gemini) alongside the roster file.
  The prompt text is the single source in src/utils/prompts.js.
-->
<template>
  <section class="ph">
    <h2>交番表 → CSV 変換プロンプト</h2>
    <p class="ph-lead">
      掲示物（Excel・PDF・写真）から weekday / saturday / holiday の3つの CSV
      を作るための、AI 会話画面用プロンプトです。下のボタンでコピーし、ChatGPT・
      Claude・Gemini などの会話に交番表ファイルと一緒に貼り付けてください（API
      や課金は不要）。出てきた3つの CSV を、下の「交番表の管理」で世代として
      取り込みます。読めなかった欄は <code>?</code> で返るので、取り込み前に
      正しい値へ直してください。
    </p>

    <div class="ph-actions">
      <button type="button" class="ph-primary" @click="copyPrompt">
        {{ copied ? "コピーしました ✓" : "プロンプトをコピー" }}
      </button>
    </div>

    <p v-if="copyFailed" class="ph-warn">
      コピーできませんでした。下の「プロンプト全文を表示」から手動で選択して
      コピーしてください。
    </p>

    <details class="ph-details">
      <summary>プロンプト全文を表示</summary>
      <pre class="ph-pre">{{ prompt }}</pre>
    </details>
  </section>
</template>

<script setup>
import { ref, onBeforeUnmount } from "vue";
import { SCHEDULE_CSV_PROMPT } from "@/utils/prompts";

const prompt = SCHEDULE_CSV_PROMPT;
const copied = ref(false);
const copyFailed = ref(false);
let timer = null;

async function copyPrompt() {
  copyFailed.value = false;
  const ok = await copyText(prompt);
  if (!ok) {
    copyFailed.value = true;
    return;
  }
  copied.value = true;
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => (copied.value = false), 2000);
}

// Prefer the async Clipboard API; fall back to a hidden textarea + execCommand
// for older/insecure-context browsers. Returns whether the copy succeeded.
async function copyText(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
</script>

<style scoped>
.ph {
  max-width: 760px;
  margin: 1.5rem auto 0;
  padding: 1.5rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 8px;
  background: var(--card-bg, #fff);
}

.ph h2 {
  margin-top: 0;
}

.ph-lead {
  margin: 0.5rem 0 1rem;
  line-height: 1.7;
}

.ph-lead code {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  background: var(--code-bg, rgba(127, 127, 127, 0.15));
  padding: 0 0.25em;
  border-radius: 3px;
}

.ph-actions {
  margin: 0.5rem 0;
}

.ph-primary {
  cursor: pointer;
  font: inherit;
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  background: #2563eb;
  color: #fff;
}

.ph-warn {
  margin: 0.75rem 0 0;
  color: #b45309;
  font-size: 0.9em;
}

.ph-details {
  margin-top: 1rem;
}

.ph-details summary {
  cursor: pointer;
}

.ph-pre {
  margin-top: 0.75rem;
  max-height: 22rem;
  overflow: auto;
  padding: 0.75rem;
  border: 1px solid var(--border-color, #ccc);
  border-radius: 4px;
  background: var(--code-bg, rgba(127, 127, 127, 0.08));
  white-space: pre-wrap;
  word-break: break-word;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 0.82em;
  line-height: 1.55;
}
</style>
