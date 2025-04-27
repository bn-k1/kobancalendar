<!-- src/components/Controls/ParticipantsList.vue -->
<template>
  <fieldset id="participantsSection" class="control-group">
    <legend>参加者(コマ位置)</legend>
    <div id="participantsList">
      <div
        v-for="(participant, index) in localParticipants"
        :key="index"
        class="participant-entry"
      >
        <select
          class="participant-position"
          aria-label="参加者のコマ位置"
          v-model="participant.position"
          @change="handleParticipantChange"
        >
          <option value="" disabled>コマ位置を選択</option>
          <option v-for="i in rotationCycleLength" :key="i" :value="i">
            {{ i }}
          </option>
        </select>
        <button
          class="remove-participant"
          aria-label="この参加者を削除"
          @click="removeParticipant(index)"
        >
          ✕
        </button>
      </div>
    </div>
    <button id="addParticipantBtn" class="primary-btn" @click="addParticipant">
      参加者を追加
    </button>
  </fieldset>
</template>

<script setup>
import { ref, watch, onMounted } from "vue";

const props = defineProps({
  modelValue: {
    type: Array,
    default: () => [{ position: "" }],
  },
  rotationCycleLength: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue", "change"]);

// Local copy of participants list
const localParticipants = ref([...props.modelValue]);

// Add a new participant
function addParticipant() {
  localParticipants.value.push({ position: "" });
  emitParticipantsUpdate();
}

// Remove a participant
function removeParticipant(index) {
  localParticipants.value.splice(index, 1);
  emitParticipantsUpdate();
}

// Handle participant selection change
function handleParticipantChange() {
  emitParticipantsUpdate();
}

// Emit updated participants list
function emitParticipantsUpdate() {
  const validParticipants = localParticipants.value.filter((p) => p.position);
  emit("update:modelValue", [...localParticipants.value]);
  emit("change", validParticipants);
}

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(localParticipants.value)) {
      localParticipants.value = [...newValue];
    }
  },
  { deep: true },
);

// Initialize with at least one empty participant if none provided
onMounted(() => {
  if (localParticipants.value.length === 0) {
    localParticipants.value = [{ position: "" }];
  }
});
</script>

<style scoped>
/* Reuse global styles from original app */
</style>
