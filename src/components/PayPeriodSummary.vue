<!-- src/components/PayPeriodSummary.vue -->
<template>
  <p v-if="summary" class="pay-period-summary">
    {{ summary.label }}　拘束 {{ formatMinutes(summary.binding) }}・超勤
    {{ formatMinutes(summary.overtime) }}・中休
    {{ formatMinutes(summary.midBreak) }}・深夜P {{ summary.nightPoints }}
    <span v-if="summary.unknownOvertimeDays" class="pay-period-note"
      >（超勤が分からない日 {{ summary.unknownOvertimeDays }}日）</span
    >
    <span v-if="summary.noTableDays" class="pay-period-note"
      >（表の期間外 {{ summary.noTableDays }}日）</span
    >
    <span class="pay-period-note">（実験中）</span>
  </p>
</template>

<script setup>
import { computed } from "vue";
import {
  usePayPeriod,
  payPeriodClosingIn,
  formatMinutes,
} from "@/composables/usePayPeriod";

const props = defineProps({
  // Any day in the month the calendar is showing.
  month: {
    type: Object,
    default: null,
  },
  startPosition: {
    type: Number,
    default: null,
  },
});

const { summarizePeriod, periodHasMetrics } = usePayPeriod();

const summary = computed(() => {
  if (!props.month || !Number.isInteger(props.startPosition)) return null;
  const period = payPeriodClosingIn(props.month);
  if (!periodHasMetrics(period)) return null;
  return {
    label: `${period.start.format("M/D")} ~ ${period.end.format("M/D")}`,
    ...summarizePeriod(period),
  };
});
</script>

<style scoped>
.pay-period-summary {
  margin: var(--spacing-sm) 0 var(--spacing-md);
  padding: 0 var(--spacing-xs);
  font-size: 0.9em;
  line-height: 1.6;
}

.pay-period-note {
  color: var(--text-muted);
}
</style>
