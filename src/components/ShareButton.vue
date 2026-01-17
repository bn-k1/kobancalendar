<!-- src/components/ShareButton.vue -->
<template>
  <button
    class="share-button"
    @click="shareCurrentPage"
    aria-label="現在のページを共有"
  >
    <ShareIcon />
  </button>
</template>

<script setup>
import ShareIcon from "@/components/Icons/ShareIcon.vue";

// Share current page using Web Share API
async function shareCurrentPage() {
  if (!navigator.share) return;
  
  await navigator.share({
    title: document.title,
    url: window.location.href
  });
}
</script>

<style scoped>
.share-button {
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

.share-button:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}
</style>
