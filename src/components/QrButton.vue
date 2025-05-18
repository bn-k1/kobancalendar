<!-- src/components/QrButton.vue -->
<template>
  <button
    class="qr-button"
    @click="showModal = true"
    aria-label="QRコードを表示"
  >
    <svg
      class="qr-icon"
      viewBox="0 0 24 24"
      width="22"
      height="22"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 2H10V10H2V2ZM14 2H22V10H14V2ZM2 14H10V22H2V14Z"
        stroke="white"
        stroke-width="2"
        fill="none"
      />
      <rect x="14" y="14" width="2" height="2" fill="white" />
      <rect x="18" y="14" width="2" height="2" fill="white" />
      <rect x="22" y="14" width="2" height="2" fill="white" />
      <rect x="14" y="18" width="2" height="2" fill="white" />
      <rect x="18" y="18" width="2" height="2" fill="white" />
      <rect x="22" y="18" width="2" height="2" fill="white" />
      <rect x="4" y="4" width="4" height="4" fill="white" />
      <rect x="16" y="4" width="4" height="4" fill="white" />
      <rect x="4" y="16" width="4" height="4" fill="white" />
    </svg>
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
        <img src="/data/qr.png" alt="QRコード" class="qr-image" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import config from "@config/config.json";

const showModal = ref(false);
const url = ref("");

onMounted(() => {
  // Get URL from config file
  if (config && config.url) {
    url.value = config.url;
  } else {
    url.value = "URL not found in config";
  }
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
  background: none;
  border: none;
  color: var(--text-light);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-fast);
  padding: 0;
  background-color: rgba(255, 255, 255, 0.2);
  box-shadow: none;
}
.qr-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
.qr-icon {
  width: 24px;
  height: 24px;
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
