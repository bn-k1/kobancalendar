import { ref } from "vue";
import { defineStore } from "pinia";

export const useAlertModalStore = defineStore("alertModal", () => {
  const isVisible = ref(false);
  const title = ref("Notification");
  const message = ref("");
  const suggestedNumber = ref(null);
  const suggestedNumberHandler = ref(null);

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

  function setSuggestedNumberHandler(handler) {
    suggestedNumberHandler.value =
      typeof handler === "function" ? handler : null;
  }

  function clearSuggestedNumberHandler() {
    suggestedNumberHandler.value = null;
  }

  function applySuggestedNumber() {
    if (!Number.isInteger(suggestedNumber.value)) return;
    suggestedNumberHandler.value?.(suggestedNumber.value);
  }

  return {
    isVisible,
    title,
    message,
    suggestedNumber,
    open,
    close,
    setSuggestedNumberHandler,
    clearSuggestedNumberHandler,
    applySuggestedNumber,
  };
});
