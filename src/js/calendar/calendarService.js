// calendar/calendarService.js - カレンダーインスタンス管理サービス
let calendarInstance = null;

function getCalendarInstance() {
  return calendarInstance;
}

function setCalendarInstance(instance) {
  calendarInstance = instance;
}

export { getCalendarInstance, setCalendarInstance };
