import { ref } from "vue";
import { defineStore } from "pinia";

export const ALERT_MODAL_SUGGESTED_NUMBER_EVENT =
  "alert-modal:suggested-start-number";

export const useAlertModalStore = defineStore("alertModal", () => {
  const isVisible = ref(false);
  const title = ref("Notification");
  const message = ref("");
  const suggestedNumber = ref(null);

  function open({
    title: nextTitle = "Notification",
    message: nextMessage = "",
    suggestedNumber: nextSuggestedNumber = null,
  } = {}) {
    title.value = nextTitle;
    message.value = nextMessage;
    suggestedNumber.value = Number.isInteger(nextSuggestedNumber)
      ? nextSuggestedNumber
      : null;
    isVisible.value = true;
  }

  function close() {
    isVisible.value = false;
    suggestedNumber.value = null;
  }

  return {
    isVisible,
    title,
    message,
    suggestedNumber,
    open,
    close,
  };
});
