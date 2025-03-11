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

// ラベルを更新
function updateLabel(currentBaseDate) {
    if (currentBaseDate) {
        document.getElementById("baseDateSection").style.display = "block";
        document.getElementById("startNumberSection").style.display = "block";
        document.querySelector("label[for='baseDate']").textContent = "基準日:";
        document.querySelector("label[for='startNumber']").textContent = "コマ位置:";
        document.getElementById("exportSection").style.display = "block";
    }
}

// スタート番号選択の初期化
function initializeStartNumberSelection(maxScheduleCycle) {
    let select = document.getElementById("startNumber");
    select.innerHTML = ""; // 選択肢をクリア
    
    for (let i = 1; i <= maxScheduleCycle; i++) {
        let option = document.createElement("option");
        option.value = i;
        option.text = i;
        select.appendChild(option);
    }

    let params = new URLSearchParams(window.location.search);
    if (params.has("startNumber")) {
        select.value = params.get("startNumber");
    }
}

// エクスポート
export {
    updateBaseDateSection,
    updateLabel,
    initializeStartNumberSelection
};