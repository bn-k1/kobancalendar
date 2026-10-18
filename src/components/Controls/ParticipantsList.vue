<!-- src/components/Controls/ParticipantsList.vue -->
<template>
  <fieldset id="participantsSection" class="control-group">
    <legend>参加者(コマ位置・名前)</legend>
    <div id="participantsList">
      <div
        v-for="(participant, index) in localParticipants"
        :key="index"
        class="participant-entry"
      >
        <select
          v-model="participant.position"
          class="participant-position"
          aria-label="参加者のコマ位置"
          @change="handleParticipantChange"
        >
          <option value="" disabled>コマ位置を選択</option>
          <option v-for="i in rotationCycleLength" :key="i" :value="i">
            {{ i }}
          </option>
        </select>
        <input
          v-model="participant.name"
          type="text"
          class="participant-name"
          placeholder="名前"
          maxlength="12"
          aria-label="参加者の名前"
          @input="handleParticipantChange"
        />
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
    default: () => [{ position: "", name: "" }],
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
  localParticipants.value.push({ position: "", name: "" });
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
  flex: 0 0 6.5rem;
  min-width: 0;
}

/* Matches the global select look; 1rem keeps iOS from zooming on focus. */
.participant-name {
  flex: 1 1 6rem;
  min-width: 0;
  min-height: 44px;
  padding: var(--spacing-sm) var(--spacing-md);
  font-family: var(--font-family);
  font-size: 1rem;
  border: 1.5px solid var(--border-color);
  border-radius: var(--border-radius-md);
  background-color: var(--background-light);
  color: var(--text-color);
  transition: all var(--transition-normal);
}

.participant-name:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
}

.remove-participant {
  background-color: var(--error-color);
  color: white;
  width: 40px;
  height: 40px;
  min-height: unset;
  min-width: 40px;
  border-radius: 50%;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  font-weight: var(--font-weight-bold);
  transition: background var(--transition-fast);
  flex-shrink: 0;
}

.remove-participant:hover {
  background-color: #dc2626;
  transform: none;
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
