<!-- src/components/EditScheduleModal.vue -->
<template>
  <div
    id="editScheduleModal"
    class="modal"
    :class="{ hidden: !show }"
    @click="closeModalOnOutsideClick"
  >
    <div class="modal-content edit-modal-content">
      <h3 class="modal-title">{{ modalTitle }}</h3>
      
      <div class="edit-form">
        <!-- Subject selector -->
        <div class="form-group">
          <label for="editSubject">予定名:</label>
          <select
            id="editSubject"
            v-model="selectedSubject"
            @change="handleSubjectChange"
            class="edit-select"
          >
            <option value="" disabled>予定を選択</option>
            <option :value="CUSTOM_VALUE">カスタム(自分で入力)</option>
            <option
              v-for="option in subjectOptions"
              :key="option.subject"
              :value="option.subject"
            >
              {{ option.subject }}
            </option>
          </select>
        </div>

        <!-- Time display (read-only, auto-filled) -->
        <div class="form-group time-display" v-if="selectedSubject && !isCustomSelected">
          <div class="time-info">
            <span class="time-label">開始:</span>
            <span class="time-value">{{ selectedStartTime || "なし" }}</span>
          </div>
          <div class="time-info">
            <span class="time-label">終了:</span>
            <span class="time-value">{{ selectedEndTime || "なし" }}</span>
          </div>
        </div>

        <!-- Custom inputs -->
        <div v-if="isCustomSelected" class="custom-inputs">
          <div class="form-group">
            <label for="customSubject">予定名:</label>
            <input
              id="customSubject"
              v-model="customSubject"
              type="text"
              class="edit-input"
              placeholder="予定名を入力"
            />
          </div>
          <div class="form-group time-inputs">
            <label for="customStartTime">開始時間:</label>
            <input
              id="customStartTime"
              v-model="customStartTime"
              type="time"
              class="edit-input"
            />
          </div>
          <div class="form-group time-inputs">
            <label for="customEndTime">終了時間:</label>
            <input
              id="customEndTime"
              v-model="customEndTime"
              type="time"
              class="edit-input"
            />
          </div>
        </div>

        <!-- Action buttons -->
        <div class="modal-actions">
          <button class="cancel-btn" @click="$emit('close')">
            キャンセル
          </button>
          <button 
            class="save-btn" 
            @click="handleSave"
            :disabled="!canSave"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { formatAsDisplayDate, getWeekdayName, createDate, isSameOrAfter } from "@/utils/date";
import { useSchedule } from "@/composables/useSchedule";

const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  date: {
    type: [String, Object],
    default: null,
  },
  dayType: {
    type: String,
    default: "weekday",
  },
  currentSchedule: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close", "save"]);

const { scheduleDataSets, scheduleUpdateDate } = useSchedule();

const CUSTOM_VALUE = "__custom__";
const selectedSubject = ref("");
const selectedStartTime = ref("");
const selectedEndTime = ref("");
const customSubject = ref("");
const customStartTime = ref("");
const customEndTime = ref("");

const isCustomSelected = computed(() => selectedSubject.value === CUSTOM_VALUE);
const canSave = computed(() => {
  if (isCustomSelected.value) {
    return customSubject.value.trim() !== "";
  }
  return selectedSubject.value !== "";
});

const modalTitle = computed(() => {
  if (!props.date) return "予定を編集";
  const dateObj = createDate(props.date);
  return `${formatAsDisplayDate(dateObj)}（${getWeekdayName(dateObj)}）`;
});

const activeScheduleData = computed(() => {
  if (!props.date || !scheduleDataSets.value) return null;
  
  const dateObj = createDate(props.date);
  
  if (scheduleUpdateDate.value && isSameOrAfter(dateObj, scheduleUpdateDate.value)) {
    return scheduleDataSets.value.next;
  }
  
  return scheduleDataSets.value.default;
});

const subjectOptions = computed(() => {
  if (!activeScheduleData.value) return [];
  
  let dayTypeData;
  switch (props.dayType) {
    case "saturday":
      dayTypeData = activeScheduleData.value.saturday || [];
      break;
    case "holiday":
      dayTypeData = activeScheduleData.value.holiday || [];
      break;
    default:
      dayTypeData = activeScheduleData.value.weekday || [];
  }
  
  const subjectMap = new Map();
  dayTypeData.forEach(item => {
    if (item.s && !subjectMap.has(item.s)) {
      subjectMap.set(item.s, {
        subject: item.s,
        startTime: item.sT || "",
        endTime: item.eT || "",
      });
    }
  });
  
  return Array.from(subjectMap.values()).sort((a, b) => 
    a.subject.localeCompare(b.subject, 'ja')
  );
});

function handleSubjectChange() {
  if (selectedSubject.value === CUSTOM_VALUE) {
    selectedStartTime.value = "";
    selectedEndTime.value = "";
    return;
  }
  const selected = subjectOptions.value.find(opt => opt.subject === selectedSubject.value);
  if (selected) {
    selectedStartTime.value = selected.startTime;
    selectedEndTime.value = selected.endTime;
  } else {
    selectedStartTime.value = "";
    selectedEndTime.value = "";
  }
}

function handleSave() {
  if (!canSave.value) return;

  const schedule = isCustomSelected.value
    ? {
        subject: customSubject.value.trim(),
        startTime: customStartTime.value,
        endTime: customEndTime.value,
      }
    : {
        subject: selectedSubject.value,
        startTime: selectedStartTime.value,
        endTime: selectedEndTime.value,
      };

  emit("save", {
    date: props.date,
    subject: schedule.subject,
    startTime: schedule.startTime,
    endTime: schedule.endTime,
  });
}

function closeModalOnOutsideClick(event) {
  if (event.target.id === "editScheduleModal") {
    emit("close");
  }
}

watch([() => props.show, () => props.date, subjectOptions], ([newShow]) => {
  if (newShow && props.currentSchedule) {
    const currentSubject = props.currentSchedule.subject || "";
    const matchingOption = subjectOptions.value.find(opt => opt.subject === currentSubject);
    const isKnownSubject = Boolean(matchingOption);
    const isCustomByTime =
      isKnownSubject &&
      ((props.currentSchedule.startTime || "") !== (matchingOption.startTime || "") ||
        (props.currentSchedule.endTime || "") !== (matchingOption.endTime || ""));

    if (currentSubject && (!isKnownSubject || isCustomByTime)) {
      selectedSubject.value = CUSTOM_VALUE;
      customSubject.value = currentSubject;
      customStartTime.value = props.currentSchedule.startTime || "";
      customEndTime.value = props.currentSchedule.endTime || "";
      selectedStartTime.value = "";
      selectedEndTime.value = "";
    } else {
      selectedSubject.value = currentSubject;
      selectedStartTime.value = matchingOption?.startTime || props.currentSchedule.startTime || "";
      selectedEndTime.value = matchingOption?.endTime || props.currentSchedule.endTime || "";
      customSubject.value = "";
      customStartTime.value = "";
      customEndTime.value = "";
    }
  } else if (!newShow) {
    selectedSubject.value = "";
    selectedStartTime.value = "";
    selectedEndTime.value = "";
    customSubject.value = "";
    customStartTime.value = "";
    customEndTime.value = "";
  }
});
</script>

<style scoped>
.edit-modal-content {
  max-width: 400px;
}

.modal-title {
  font-size: 1.3rem;
  color: var(--primary-color);
  margin-bottom: var(--spacing-lg);
  text-align: center;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.form-group label {
  font-weight: var(--font-weight-medium);
  color: var(--gray-700);
  font-size: 0.95rem;
}

.edit-select {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  background-color: var(--background-light);
  color: var(--text-color);
  font-size: 1rem;
}

.edit-input {
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--gray-300);
  border-radius: var(--border-radius-md);
  background-color: var(--background-light);
  color: var(--text-color);
  font-size: 1rem;
}

.edit-select:focus {
  border-color: var(--primary-light);
  outline: none;
  box-shadow: 0 0 0 3px rgba(72, 149, 239, 0.3);
}

.edit-input:focus {
  border-color: var(--primary-light);
  outline: none;
  box-shadow: 0 0 0 3px rgba(72, 149, 239, 0.3);
}

.custom-inputs {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.time-inputs {
  gap: var(--spacing-xs);
}

.time-display {
  background-color: var(--gray-100);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  display: flex;
  flex-direction: row;
  gap: var(--spacing-lg);
}

.time-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
}

.time-label {
  color: var(--gray-600);
  font-size: 0.9rem;
}

.time-value {
  font-weight: var(--font-weight-medium);
  color: var(--text-color);
}

.modal-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.cancel-btn,
.save-btn {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
  font-size: 1rem;
  cursor: pointer;
}

.cancel-btn {
  background-color: var(--gray-200);
  color: var(--gray-700);
  border: 1px solid var(--gray-300);
}

.cancel-btn:hover {
  background-color: var(--gray-300);
}

.save-btn {
  background-color: var(--primary-color);
  color: var(--text-light);
  border: none;
}

.save-btn:hover:not(:disabled) {
  background-color: var(--primary-light);
}

.save-btn:disabled {
  background-color: var(--gray-400);
  cursor: not-allowed;
  opacity: 0.6;
}

.hidden {
  display: none;
}
</style>
