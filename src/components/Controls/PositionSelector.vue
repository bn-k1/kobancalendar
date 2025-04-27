<!-- src/components/Controls/PositionSelector.vue -->
<template>
  <fieldset id="startNumberSection" class="control-group">
    <legend>基準日のコマ位置</legend>
    <div class="form-group">
      <select
        id="startNumber"
        aria-label="コマ位置を選択"
        :value="modelValue"
        @change="handleChange"
      >
        <option v-for="i in maxPositions" :key="i" :value="i">
          {{ i }}
        </option>
      </select>
    </div>
  </fieldset>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  },
  maxPositions: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

// Handle position selection change
function handleChange(event) {
  const newPosition = parseInt(event.target.value, 10);
  emit("update:modelValue", newPosition);
  emit("change", newPosition);
}
</script>

<style scoped>
/* Reuse global styles from original app */
</style>
