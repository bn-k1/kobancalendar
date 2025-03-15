// ui.js - ユーザーインターフェース関連の機能を提供

// 基準日選択セクションを更新
function updateBaseDateSection(baseDates, currentBaseDate) {
    const baseDateSelect = document.getElementById("baseDate");
    
    baseDateSelect.innerHTML = "";
    
    baseDates.forEach(date => {
        const option = document.createElement("option");
        const dateStr = date.toISOString().split("T")[0];
        option.value = dateStr;
        option.text = dateStr;
        baseDateSelect.appendChild(option);
    });
    
    const currentBaseDateStr = currentBaseDate.toISOString().split("T")[0];
    baseDateSelect.value = currentBaseDateStr;
}

// コントロールセクションを表示する
function showControlSections(currentBaseDate) {
    if (currentBaseDate) {
        document.getElementById("baseDateSection").style.display = "block";
        document.getElementById("startNumberSection").style.display = "block";
        document.getElementById("exportSection").style.display = "block";
    }
}

// スタート番号選択の初期化
function initializeStartNumberSelection(rotationCycleLength) {
    let startPositionSelect = document.getElementById("startNumber");
    startPositionSelect.innerHTML = ""; // 選択肢をクリア
    
    for (let i = 1; i <= rotationCycleLength; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = i;
        startPositionSelect.appendChild(option);
    }

    let urlParameters = new URLSearchParams(window.location.search);
    if (urlParameters.has("startNumber")) {
        startPositionSelect.value = urlParameters.get("startNumber");
    }
}

// エクスポート
export {
    updateBaseDateSection,
    showControlSections,
    initializeStartNumberSelection
};