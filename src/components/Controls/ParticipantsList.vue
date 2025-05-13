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
import { ref, watch } from "vue";

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
</script>

<style scoped>
/* Participants list specific styles */
.participant-entry {
  display: flex;
  align-items: center;
  margin-bottom: var(--spacing-sm);
  width: 100%;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.participant-position {
  flex-grow: 1;
  min-width: 0;
}

.remove-participant {
  background-color: var(--error-color);
  color: white;
  width: 34px;
  height: 34px;
  min-width: 34px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: var(--font-weight-bold);
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.remove-participant:hover {
  background-color: var(--error-color);
  transform: scale(1.1);
}

#addParticipantBtn {
  background-color: var(--success-color);
  margin-top: var(--spacing-sm);
  width: 100%;
  border-radius: var(--border-radius-md);
  transition: all var(--transition-normal);
  font-size: 1.05rem;
}

#addParticipantBtn:hover {
  background-color: var(--success-color);
  box-shadow: var(--shadow-md);
}
</style>
