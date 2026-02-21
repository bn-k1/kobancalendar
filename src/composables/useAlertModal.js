// src/composables/useAlertModal.js
import { ref } from "vue";

export const ALERT_MODAL_SUGGESTED_NUMBER_EVENT =
  "alert-modal:suggested-start-number";

const isAlertModalVisible = ref(false);
const alertModalTitle = ref("お知らせ");
const alertModalMessage = ref("");
const alertModalSuggestedNumber = ref(null);

export function useAlertModal() {
  function openAlertModal({
    title = "お知らせ",
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
