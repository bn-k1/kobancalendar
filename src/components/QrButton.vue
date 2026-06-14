<!-- src/components/QrButton.vue -->
<template>
  <button
    class="qr-button"
    aria-label="QRコードを表示"
    @click="showModal = true"
  >
    <QrIcon />
  </button>

  <!-- Integrated QR Modal -->
  <div
    id="qrModal"
    class="modal"
    :class="{ hidden: !showModal }"
    @click="closeModalOnOutsideClick"
  >
    <div class="modal-content">
      <span class="close-modal" @click="showModal = false">&times;</span>
      <h3>{{ url }}</h3>
      <div class="qr-container">
        <img :src="qrDataUrl" alt="QRコード" class="qr-image" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, watch } from "vue";
import QRCode from "qrcode";
import QrIcon from "@/components/Icons/QrIcon.vue";

const showModal = ref(false);
// The app already knows its own deployed URL, so derive the shareable link and
// QR image from window.location instead of a hard-coded config value. This keeps
// the QR correct for any fork/deployment with zero configuration.
const url = ref(window.location.href);
const qrDataUrl = ref("");

// Render the QR lazily the first time the modal opens.
watch(showModal, async (open) => {
  if (!open || qrDataUrl.value) return;
  url.value = window.location.href;
  qrDataUrl.value = await QRCode.toDataURL(url.value, {
    errorCorrectionLevel: "H",
    width: 500,
    margin: 4,
  });
});

// Close modal when clicking outside
function closeModalOnOutsideClick(event) {
  if (event.target.id === "qrModal") {
    showModal.value = false;
  }
}
</script>
<style scoped>
.qr-button {
  background-color: rgba(255, 255, 255, 0.12);
  border: none;
  color: var(--text-light);
  width: 40px;
  height: 40px;
  min-height: unset;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background var(--transition-fast);
  padding: 0;
  box-shadow: none;
}
.qr-button:hover {
  background-color: rgba(255, 255, 255, 0.22);
  transform: none;
  box-shadow: none;
}
.qr-container {
  margin: var(--spacing-lg) auto;
  display: flex;
  justify-content: center;
  align-items: center;
}
.qr-image {
  max-width: 100%;
  height: auto;
  max-height: 300px;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-md);
}
h3 {
  font-size: 1.2rem;
  color: var(--primary-color);
  margin-bottom: var(--spacing-md);
  text-align: center;
  word-break: break-all; /* Ensures long URLs wrap properly */
}
.hidden {
  display: none;
}
</style>
