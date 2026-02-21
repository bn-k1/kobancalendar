<!-- src/components/AlertModal.vue -->
<template>
  <div
    v-if="isAlertModalVisible"
    id="alertModal"
    class="modal"
    @click="closeOnOutsideClick"
  >
    <div
      class="modal-content alert-modal-content"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="alertModalTitle"
    >
      <span class="close-modal" @click="closeAlertModal">&times;</span>
      <h3 id="alertModalTitle">{{ alertModalTitle }}</h3>
      <p class="alert-message">{{ alertModalMessage }}</p>
      <p
        v-if="Number.isInteger(alertModalSuggestedNumber)"
        class="alert-suggestion"
      >
        多分ですが番号は
        <a href="#" class="suggested-number-link" @click.prevent="applySuggestedNumber">
          {{ alertModalSuggestedNumber }}
        </a>
        です。
      </p>
      <div class="alert-actions">
        <button class="primary-btn" @click="closeAlertModal">閉じる</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";

export const ALERT_MODAL_SUGGESTED_NUMBER_EVENT =
  "alert-modal:suggested-start-number";

const isAlertModalVisible = ref(false);
const alertModalTitle = ref("Notification");
const alertModalMessage = ref("");
const alertModalSuggestedNumber = ref(null);

export function useAlertModal() {
  function openAlertModal({
    title = "Notification",
    message = "",
    suggestedNumber = null,
  } = {}) {
    alertModalTitle.value = title;
    alertModalMessage.value = message;
    alertModalSuggestedNumber.value = Number.isInteger(suggestedNumber)
      ? suggestedNumber
      : null;
    isAlertModalVisible.value = true;
  }

  function closeAlertModal() {
    isAlertModalVisible.value = false;
    alertModalSuggestedNumber.value = null;
  }

  function emitSuggestedStartNumber() {
    if (!Number.isInteger(alertModalSuggestedNumber.value)) {
      return;
    }

    window.dispatchEvent(
      new CustomEvent(ALERT_MODAL_SUGGESTED_NUMBER_EVENT, {
        detail: { startNumber: alertModalSuggestedNumber.value },
      }),
    );
  }

  return {
    isAlertModalVisible,
    alertModalTitle,
    alertModalMessage,
    alertModalSuggestedNumber,
    openAlertModal,
    closeAlertModal,
    emitSuggestedStartNumber,
  };
}
</script>

<script setup>

const {
  isAlertModalVisible,
  alertModalTitle,
  alertModalMessage,
  alertModalSuggestedNumber,
  closeAlertModal,
  emitSuggestedStartNumber,
} = useAlertModal();

function applySuggestedNumber() {
  emitSuggestedStartNumber();
  closeAlertModal();
}

function closeOnOutsideClick(event) {
  if (event.target.id === "alertModal") {
    closeAlertModal();
  }
}
</script>

<style scoped>
.alert-modal-content {
  width: min(90vw, 480px);
}

.alert-message {
  margin: var(--spacing-md) 0;
  line-height: 1.7;
}

.alert-suggestion {
  margin: 0 0 var(--spacing-md);
}

.suggested-number-link {
  color: var(--primary-color);
  font-weight: var(--font-weight-bold);
  text-decoration: underline;
}

.alert-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
