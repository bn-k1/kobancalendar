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

<script setup>
import { storeToRefs } from "pinia";
import {
  ALERT_MODAL_SUGGESTED_NUMBER_EVENT,
  useAlertModalStore,
} from "@/stores/alertModal";

const alertModalStore = useAlertModalStore();
const {
  isVisible: isAlertModalVisible,
  title: alertModalTitle,
  message: alertModalMessage,
  suggestedNumber: alertModalSuggestedNumber,
} = storeToRefs(alertModalStore);
const { close: closeAlertModal } = alertModalStore;

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
