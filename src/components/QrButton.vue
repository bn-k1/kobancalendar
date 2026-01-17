<!-- src/components/QrButton.vue -->
<template>
  <button
    class="qr-button"
    @click="showModal = true"
    aria-label="QRコードを表示"
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
        <img src="/data/qr.png" alt="QRコード" class="qr-image" />
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import config from "@config/config.json";
import QrIcon from "@/components/icons/QrIcon.vue";

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
