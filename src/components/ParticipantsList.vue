<template>
  <fieldset id="participantsSection" class="control-group" v-if="isLoaded">
    <legend>参加者(コマ位置)</legend>
    <div id="participantsList">
      <div 
        v-for="(participant, index) in participants" 
        :key="index"
        class="participant-entry"
      >
        <select
          class="participant-position"
          aria-label="参加者のコマ位置"
          v-model="participant.position"
        >
          <option value="" disabled>コマ位置を選択</option>
          <option 
            v-for="i in rotationCycleLength" 
            :key="i"
            :value="i"
          >
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
    <button
      id="addParticipantBtn"
      class="primary-btn"
      @click="addParticipant"
    >
      参加者を追加
    </button>
  </fieldset>
</template>

<script setup>
import { ref } from 'vue';

// プロップス
const props = defineProps({
  isLoaded: {
    type: Boolean,
    default: false
  },
  rotationCycleLength: {
    type: Number,
    required: true
  }
});

// エミット
const emit = defineEmits(['update:participants']);

// ローカル状態
const participants = ref([{ position: '' }]);

// 参加者を追加
function addParticipant() {
  participants.value.push({ position: '' });
  emitParticipantsUpdate();
}

// 参加者を削除
function removeParticipant(index) {
  participants.value.splice(index, 1);
  emitParticipantsUpdate();
}

// 参加者情報の更新を通知
function emitParticipantsUpdate() {
  emit('update:participants', participants.value);
}
</script>

<style scoped>
/* コンポーネント固有のスタイル */
</style>
