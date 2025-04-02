// htm-util.js - HTMライブラリの設定と共通ユーティリティ
import htm from "htm";

// htmとpreactのスタンドアロン実装
const html = htm.bind(function (type, props, ...children) {
  // h関数のシンプルな実装
  return { type, props: props || {}, children };
});

// HTM要素をDOMに描画する関数
function render(vnode, container) {
  if (typeof vnode === "string" || typeof vnode === "number") {
    container.textContent = vnode;
    return;
  }

  // コンテナをクリア
  if (container.innerHTML !== undefined) {
    container.innerHTML = "";
  }

  // 要素の生成
  const element = createElement(vnode);

  // コンテナに追加
  if (element) {
    container.appendChild(element);
  }
}

// 仮想DOMからDOM要素を生成
function createElement(vnode) {
  if (!vnode || typeof vnode === "boolean") return null;

  // テキストノード
  if (typeof vnode === "string" || typeof vnode === "number") {
    return document.createTextNode(vnode);
  }

  // 配列の場合（フラグメント）
  if (Array.isArray(vnode)) {
    const fragment = document.createDocumentFragment();
    vnode.forEach((child) => {
      const el = createElement(child);
      if (el) fragment.appendChild(el);
    });
    return fragment;
  }

  // 関数コンポーネント
  if (typeof vnode.type === "function") {
    const result = vnode.type(vnode.props);
    return createElement(result);
  }

  // HTML要素
  const element = document.createElement(vnode.type);

  // プロパティとイベントハンドラの設定
  if (vnode.props) {
    Object.entries(vnode.props).forEach(([name, value]) => {
      if (name === "style" && typeof value === "object") {
        // スタイルオブジェクトの処理
        Object.entries(value).forEach(([prop, val]) => {
          element.style[prop] = val;
        });
      } else if (name === "className") {
        // className -> class
        element.setAttribute("class", value);
      } else if (name === "dangerouslySetInnerHTML" && value.__html) {
        // innerHTML
        element.innerHTML = value.__html;
      } else if (name.startsWith("on") && typeof value === "function") {
        // イベントハンドラ
        const eventName = name.toLowerCase().substring(2);
        element.addEventListener(eventName, value);
      } else if (name !== "children") {
        // 通常の属性
        element.setAttribute(name, value);
      }
    });
  }

  // 子要素の追加
  if (vnode.children) {
    vnode.children.forEach((child) => {
      const childElement = createElement(child);
      if (childElement) element.appendChild(childElement);
    });
  }

  return element;
}

export { html, render };
