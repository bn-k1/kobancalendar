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
import { ref, onMounted } from "vue";
import { updateURLParams, getURLParam } from "@/utils/params-utils";

// プロップス
const props = defineProps({
  isLoaded: {
    type: Boolean,
    default: false,
  },
  rotationCycleLength: {
    type: Number,
    required: true,
  },
});

// エミット
const emit = defineEmits(["update:participants"]);

// ローカル状態
const participants = ref([{ position: "" }]);

// 参加者を追加
function addParticipant() {
  participants.value.push({ position: "" });
  emitParticipantsUpdate();
}

// 参加者を削除
function removeParticipant(index) {
  participants.value.splice(index, 1);
  emitParticipantsUpdate();
}

// 参加者の選択が変更されたとき
function handleParticipantChange() {
  emitParticipantsUpdate();
}

// 参加者情報の更新を通知
function emitParticipantsUpdate() {
  emit("update:participants", participants.value);
  
  // 有効な参加者（positionが設定されている）のみを抽出
  const validParticipants = participants.value
    .filter(p => p.position)
    .map(p => p.position)
    .join(',');
  
  // URLを更新
  updateURLParams({
    participants: validParticipants
  });
}

// 初期化
onMounted(() => {
  // URLから参加者情報を取得
  const participantsParam = getURLParam('participants', '');
  if (participantsParam) {
    const positionList = participantsParam.split(',').map(p => parseInt(p)).filter(p => !isNaN(p));
    if (positionList.length > 0) {
      // 既存の有効なpositionリストがある場合は置き換え
      participants.value = positionList.map(position => ({ position }));
    }
  }
});
</script>
