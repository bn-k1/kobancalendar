<!-- src/views/HomeView.vue -->
<template>
  <CalendarPageLayout>
    <!-- Controls section -->
    <template #controls>
      <div class="horizontal-fields" v-if="isLoaded">
        <BaseDateSelector
          v-model="selectedBaseDate"
          :available-dates="baseDates"
          @change="handleBaseDateChange"
        />
        
       	<PositionSelector
	  :modelValue="startPosition"
	  :max-positions="rotationCycleLength"
	  @update:modelValue="setStartPosition"
	  @change="handlePositionChange"
	/>
      </div>
    </template>
    
    <!-- Calendar section -->
    <template #calendar>
      <CalendarView
        ref="calendarRef"
        :initial-date="initialDate"
        :start-position="startPosition"
        :events="calendarEvents"
        @dates-set="handleDatesSet"
      />
    </template>
    
    <!-- Export section -->
    <template #export>
      <ExportSection
        v-if="isLoaded"
        :base-date="currentBaseDate"
        :last-base-date="lastBaseDate"
        :start-position="startPosition"
        @export="handleExport"
        @export-complete="handleExportComplete"
      />
    </template>
  </CalendarPageLayout>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

// Components
import CalendarPageLayout from '@/layouts/CalendarPageLayout.vue';
import BaseDateSelector from '@/components/Controls/BaseDateSelector.vue';
import PositionSelector from '@/components/Controls/PositionSelector.vue';
import CalendarView from '@/components/Calendar/CalendarView.vue';
import ExportSection from '@/components/ExportSection.vue';

// Composables
import { useCalendar } from '@/composables/useCalendar';
import { useSchedule } from '@/composables/useSchedule';
import { useHolidays } from '@/composables/useHolidays';

// Utils
import { getURLParam, getNumberParam, updateURLParams } from '@/utils/url-params';
import { 
  createDate,
  formatAsISODate, 
  formatAsDisplayDate, 
  today, 
  isSameOrAfter, 
  isSameDay,
  toDate, 
  toUnix
} from '@/utils/date';

// Config
import { APP_CONFIG, ERROR_MESSAGES } from '@/config/constants';
import holidayData from '@/data/holiday.csv?raw';
import saturdayData from '@/data/saturday.csv?raw';
import weekdayData from '@/data/weekday.csv?raw';
import eventConfig from '@/config/event.json';
import config from '@/config/config.json';

// Local state
const isLoaded = ref(false);
const calendarRef = ref(null);
const selectedBaseDate = ref(null);

// Composables - すべてのストア関連の操作を提供
const { 
  calendarEvents, 
  startPosition, 
  generateCalendarEvents, 
  setStartPosition, 
  setEventConfig, 
  setICSExportConfig 
} = useCalendar();

const { 
  scheduleData, 
  baseDates, 
  currentBaseDate, 
  lastBaseDate, 
  loadScheduleData, 
  setBaseDates, 
  updateCurrentBaseDate, 
  setLastBaseDate, 
} = useSchedule();

const { 
  setHolidayYearsRange, 
  setUserDefinedHolidays, 
  loadHolidays 
} = useHolidays();

// Computed values
const rotationCycleLength = computed(() => scheduleData.value.rotationCycleLength);

// Initial date for the calendar
const initialDate = computed(() => {
  if (!currentBaseDate.value) return null;

  const currentDay = today();
  return isSameOrAfter(currentBaseDate.value, currentDay)
    ? toDate(currentBaseDate.value)
    : toDate(currentDay);
});

// Event handlers
function handleBaseDateChange(newDate) {
  updateCurrentBaseDate(newDate);
  
  // Update URL params
  updateURLParams({
    baseDate: formatAsISODate(newDate),
    startNumber: startPosition.value,
  });
  
  // Navigate calendar if needed
  const currentDay = today();
  if (isSameOrAfter(newDate, currentDay)) {
    calendarRef.value?.gotoDate(newDate);
  } else {
    calendarRef.value?.gotoDate(currentDay);
  }
}

function handlePositionChange(newPosition) {
  setStartPosition(newPosition);
  
  // Update URL params
  updateURLParams({
    baseDate: selectedBaseDate.value,
    startNumber: newPosition,
  });
  
  // Regenerate calendar events if view is available
  if (calendarRef.value && calendarRef.value.getApi) {
      const api = calendarRef.value.getApi();
      generateCalendarEvents(
        createDate(api.view.activeStart),
        createDate(api.view.activeEnd)
      );
  }
}

function handleDatesSet({ start, end }) {
  const events = generateCalendarEvents(start, end);
}

function handleExport({ months }) {
  // Implementation remains unchanged
}

function handleExportComplete({ success, error }) {
  if (!success && error) {
    alert(ERROR_MESSAGES.ICS_EXPORT_ERROR);
  }
}

/**
 * Debug version of initializeApp for troubleshooting initialization failures
 * This function provides detailed logging at each step
 */
async function initializeApp() {
  console.log("🔍 Starting application initialization debugging...");
  
  try {
    // STEP 1: Holiday Configuration
    console.log("🔍 STEP 1: Setting up holiday configuration");
    try {
      const holidayYearsRange = config.holiday_years_range || 5;
      console.log(`   Setting holiday years range: ${holidayYearsRange}`);
      setHolidayYearsRange(holidayYearsRange);
      
      const customHolidays = config.custom_holidays || [];
      console.log(`   Setting ${customHolidays.length} custom holidays`);
      setUserDefinedHolidays(customHolidays);
      
      console.log("   Loading holidays data...");
      const holidays = loadHolidays();
      console.log(`   ✅ Loaded ${Object.keys(holidays).length} holidays`);
    } catch (error) {
      console.error("❌ Holiday configuration failed:", error);
      throw new Error(`Holiday configuration error: ${error.message}`);
    }
    
    // STEP 2: Calendar Configuration
    console.log("🔍 STEP 2: Setting up calendar configuration");
    try {
      console.log("   Loading event configuration...");
      console.log("   Event config:", JSON.stringify(eventConfig).substring(0, 100) + "...");
      setEventConfig(eventConfig);
      
      console.log("   Setting ICS export configuration...");
      setICSExportConfig(config.info);
      console.log("   ✅ Calendar configuration complete");
    } catch (error) {
      console.error("❌ Calendar configuration failed:", error);
      throw new Error(`Calendar configuration error: ${error.message}`);
    }
    
    // STEP 3: Schedule Data Loading
    console.log("🔍 STEP 3: Loading schedule data");
    let scheduleData;
    try {
      console.log("   Loading CSV data lengths:");
      console.log(`   - Holiday data: ${holidayData.length} characters`);
      console.log(`   - Saturday data: ${saturdayData.length} characters`);
      console.log(`   - Weekday data: ${weekdayData.length} characters`);
      
      scheduleData = loadScheduleData(holidayData, saturdayData, weekdayData);
      console.log("   ✅ Schedule data loaded successfully");
      console.log(`   - Rotation cycle length: ${scheduleData.rotationCycleLength}`);
      console.log(`   - Holiday entries: ${scheduleData.holiday.length}`);
      console.log(`   - Saturday entries: ${scheduleData.saturday.length}`);
      console.log(`   - Weekday entries: ${scheduleData.weekday.length}`);
    } catch (error) {
      console.error("❌ Schedule data loading failed:", error);
      console.error("CSV parsing error details:", error.message);
      throw new Error(`Schedule data error: ${error.message}`);
    }
    
    // STEP 4: Base Date Configuration
    console.log("🔍 STEP 4: Setting up base dates");
    try {
      console.log(`   Raw base dates from config: ${JSON.stringify(config.base_dates)}`);
      
      // Important: Check if base_dates exists and is an array
      if (!config.base_dates || !Array.isArray(config.base_dates)) {
        console.error("❌ base_dates in config is missing or not an array");
        throw new Error("Invalid base_dates configuration");
      }
      
      if (config.base_dates.length === 0) {
        console.error("❌ base_dates array is empty");
        throw new Error("No base dates configured");
      }
      
      const configBaseDates = config.base_dates.map(dateStr => {
        try {
          const date = createDate(dateStr);
          if (!date.isValid()) {
            console.error(`❌ Invalid date string in config: ${dateStr}`);
            throw new Error(`Invalid date string: ${dateStr}`);
          }
          return date;
        } catch (error) {
          console.error(`❌ Failed to parse date: ${dateStr}`, error);
          throw new Error(`Date parsing error: ${error.message}`);
        }
      });
      
      console.log(`   Successfully parsed ${configBaseDates.length} base dates`);
      
      // Sort the dates
      configBaseDates.sort((a, b) => toUnix(a) - toUnix(b));
      
      console.log("   Setting base dates in store...");
      setBaseDates(configBaseDates);
      
      console.log("   Setting last base date...");
      const lastBaseDate = configBaseDates[configBaseDates.length - 1];
      console.log(`   Last base date: ${formatAsDisplayDate(lastBaseDate)}`);
      setLastBaseDate(lastBaseDate);
      
      // STEP 5: URL Parameter Handling
      console.log("🔍 STEP 5: Processing URL parameters");
      
      // Try to get base date from URL
      const baseDateParam = getURLParam('baseDate', null);
      console.log(`   Base date param from URL: ${baseDateParam || 'not provided'}`);
      
      // Try to get start number from URL
      let startNumberValue = APP_CONFIG.DEFAULT_START_POSITION;
      try {
        const startNumberParam = getNumberParam(
          'startNumber',
          APP_CONFIG.DEFAULT_START_POSITION,
          1,
          scheduleData.rotationCycleLength
        );
        startNumberValue = startNumberParam;
        console.log(`   Start number: ${startNumberValue}`);
      } catch (error) {
        console.warn("⚠️ Using default start number due to error:", error);
      }
      
      // STEP 6: Current Base Date Handling
      console.log("🔍 STEP 6: Setting current base date");
      
      let validBaseDate;
      if (baseDateParam) {
        try {
          const dateObj = createDate(baseDateParam);
          
          if (!dateObj.isValid()) {
            console.warn(`⚠️ Invalid base date from URL: ${baseDateParam}, using default`);
            validBaseDate = configBaseDates[0];
          } else {
            console.log(`   Validating date: ${formatAsDisplayDate(dateObj)}`);
            
            // Find matching date in valid dates
            const matchingDate = configBaseDates.find(
              date => isSameDay(date, dateObj)
            );
            
            if (matchingDate) {
              validBaseDate = matchingDate;
              console.log(`   ✅ Found matching base date: ${formatAsDisplayDate(validBaseDate)}`);
            } else {
              console.warn("⚠️ Date from URL not found in valid dates, using default");
              validBaseDate = configBaseDates[0];
            }
          }
        } catch (error) {
          console.error("❌ Error processing base date parameter:", error);
          validBaseDate = configBaseDates[0];
        }
      } else {
        console.log("   No base date in URL, using first config date");
        validBaseDate = configBaseDates[0];
      }
      
      console.log(`   Setting current base date: ${formatAsDisplayDate(validBaseDate)}`);
      updateCurrentBaseDate(validBaseDate);
      
      // Set the selected base date for UI
      console.log("   Setting selected base date for UI");
      selectedBaseDate.value = formatAsISODate(validBaseDate);
      
      // STEP 7: Setting Start Position
      console.log("🔍 STEP 7: Setting start position");
      console.log(`   Setting start position to: ${startNumberValue}`);
      setStartPosition(startNumberValue);
      
      // All done!
      console.log("🎉 Initialization completed successfully!");
      isLoaded.value = true;
      
      return true;
    } catch (error) {
      console.error("❌ Base date configuration failed:", error);
      throw new Error(`Base date configuration error: ${error.message}`);
    }
  } catch (error) {
    // Detailed error logging
    console.error("❌ INITIALIZATION FAILED");
    console.error("Detailed error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Attempt to output relevant state for debugging
    try {
      console.log("Current state dump for debugging:");
    } catch (stateError) {
      console.error("Failed to dump state:", stateError);
    }
    
    // Show user-friendly error but with more details
    const errorMessage = `${ERROR_MESSAGES.INIT_FAILED}\nDetails: ${error.message || 'Unknown error'}`;
    alert(errorMessage);
    
    return false;
  }
}

// Watch for base date changes from composable
watch(currentBaseDate, (newBaseDate) => {
  if (newBaseDate) {
    selectedBaseDate.value = formatAsISODate(newBaseDate);
  }
});

// Initialize on mount
onMounted(async () => {
  await initializeApp();
});
</script>
