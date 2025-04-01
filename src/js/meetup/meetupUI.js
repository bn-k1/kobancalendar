// meetup/meetupUI.js - meetupページ専用のUI初期化関数

/**
 * 基準日セクションを更新する関数
 * @param {Array} baseDates - 基準日の配列
 * @param {dayjs} currentBaseDate - 現在選択されている基準日
 */
function updateMeetupBaseDateSection(baseDates, currentBaseDate) {
  const baseDateSelect = document.getElementById("baseDate");
  if (!baseDateSelect) return; // 要素が存在しない場合は何もしない

  const currentBaseDateStr = currentBaseDate.format("YYYY-MM-DD");

  // 既存のオプションと新しいオプションの数が一致し、現在の値も正しければ更新しない
  if (
    baseDateSelect.options.length === baseDates.length &&
    baseDateSelect.value === currentBaseDateStr
  ) {
    return;
  }

  // 値が異なる場合は更新
  baseDateSelect.innerHTML = "";

  // DocumentFragmentを使用
  const fragment = document.createDocumentFragment();

  baseDates.forEach((date) => {
    const option = document.createElement("option");
    const dateStr = date.format("YYYY-MM-DD");
    option.value = dateStr;
    option.text = dateStr;
    fragment.appendChild(option);
  });

  baseDateSelect.appendChild(fragment);
  baseDateSelect.value = currentBaseDateStr;
}

/**
 * meetupページ専用のUI初期化
 * @param {Array} baseDates - 基準日の配列
 * @param {dayjs} currentBaseDate - 現在選択されている基準日
 */
function initializeMeetupUI(baseDates, currentBaseDate) {
  // 基準日セクションを更新
  updateMeetupBaseDateSection(baseDates, currentBaseDate);

  // コントロールセクションを表示
  const sections = [
    "baseDateSection",
    "meetupSettingsSection",
    "participantsSection",
  ];

  sections.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      element.classList.remove("hidden");
    }
  });
}

export { initializeMeetupUI, updateMeetupBaseDateSection };
