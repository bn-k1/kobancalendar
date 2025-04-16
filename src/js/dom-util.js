// dom-util.js - DOM操作ユーティリティ

/**
 * 要素を作成し、属性を設定する
 * @param {string} tag - 作成する要素のタグ名
 * @param {Object} attrs - 要素に設定する属性
 * @param {Array|string} children - 子要素または文字列
 * @returns {HTMLElement} - 作成された要素
 */
function createElement(tag, attrs = {}, children = []) {
  const element = document.createElement(tag);

  // 属性を設定
  Object.entries(attrs).forEach(([name, value]) => {
    if (name === "style" && typeof value === "object") {
      Object.entries(value).forEach(([prop, val]) => {
        element.style[prop] = val;
      });
    } else if (name === "className") {
      element.className = value;
    } else if (name.startsWith("on") && typeof value === "function") {
      const eventName = name.toLowerCase().substring(2);
      element.addEventListener(eventName, value);
    } else {
      element.setAttribute(name, value);
    }
  });

  // 子要素を追加
  if (Array.isArray(children)) {
    children.forEach((child) => {
      appendToElement(element, child);
    });
  } else if (children) {
    appendToElement(element, children);
  }

  return element;
}

/**
 * 子要素を親要素に追加する
 * @param {HTMLElement} parent - 親要素
 * @param {HTMLElement|string} child - 追加する子要素または文字列
 */
function appendToElement(parent, child) {
  if (child === null || child === undefined) return;

  if (typeof child === "string" || typeof child === "number") {
    parent.appendChild(document.createTextNode(child));
  } else if (child instanceof Node) {
    parent.appendChild(child);
  }
}

/**
 * 要素の子要素をすべて削除
 * @param {HTMLElement} element - 子要素を削除する要素
 */
function clearElement(element) {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

/**
 * 要素の子要素として新しい要素群を描画
 * @param {HTMLElement} parent - 親要素
 * @param {Array|HTMLElement} elements - 描画する要素または要素の配列
 */
function render(elements, parent) {
  // 親要素を空にする
  clearElement(parent);

  // 新しい要素を追加
  if (Array.isArray(elements)) {
    elements.forEach((element) => {
      appendToElement(parent, element);
    });
  } else {
    appendToElement(parent, elements);
  }
}

/**
 * オプション要素を作成
 * @param {string} value - オプションの値
 * @param {string} text - オプションのテキスト
 * @param {boolean} selected - 選択状態
 * @param {boolean} disabled - 無効状態
 * @returns {HTMLOptionElement} - 作成されたオプション要素
 */
function createOption(value, text, selected = false, disabled = false) {
  const option = document.createElement("option");
  option.value = value;
  option.textContent = text;
  if (selected) option.selected = true;
  if (disabled) option.disabled = true;
  return option;
}

export { createElement, clearElement, render, createOption };
