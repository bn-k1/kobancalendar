// URL params: canonical (hash query) のみ扱う。
//   Home   #/?b=2026-05-16&p=N
//   Meetup #/meetup （状態は URL に載せない）
// b = 世代の from。p はその世代のコマ番号なので、世代を取り違えないよう
// 常に対で書く（解決は useSchedule の resolveLinkedBaseDate）。

const HOME_PATH = "/";

function getHashRoute() {
  const raw = window.location.hash || "";
  if (!raw || raw === "#" || raw === "#/") {
    return { path: HOME_PATH, query: new URLSearchParams() };
  }
  const stripped = raw.startsWith("#") ? raw.slice(1) : raw;
  const qIdx = stripped.indexOf("?");
  if (qIdx === -1) {
    return { path: stripped || HOME_PATH, query: new URLSearchParams() };
  }
  return {
    path: stripped.slice(0, qIdx) || HOME_PATH,
    query: new URLSearchParams(stripped.slice(qIdx + 1)),
  };
}

function writeHashQuery(updater, { push = false } = {}) {
  const { path, query } = getHashRoute();
  updater(query);
  const qs = query.toString();
  const newHash = qs ? `#${path}?${qs}` : `#${path}`;
  const url = `${window.location.pathname}${window.location.search}${newHash}`;
  // push のときだけ、かつ実際に URL が変わるときだけ履歴エントリを積む。
  // 同値を push すると「戻る」が一度空振りするため差分があるときに限定する。
  if (push && newHash !== window.location.hash) {
    window.history.pushState({}, "", url);
  } else {
    window.history.replaceState({}, "", url);
  }
}

function parseIntOrNull(value) {
  const n = parseInt(value, 10);
  return isNaN(n) ? null : n;
}

export function useUrlParams() {
  // ----- canonical: Home -----

  function readCanonicalCalendar() {
    const { path, query } = getHashRoute();
    if (path !== HOME_PATH) return { position: null, baseDate: null };
    return {
      position: parseIntOrNull(query.get("p")),
      baseDate: query.get("b"),
    };
  }

  function writeCalendarUrl({ position, baseDate } = {}, { push = false } = {}) {
    writeHashQuery(
      (q) => {
        // b を先頭に置くため、p は消してから書き直す。
        q.delete("p");
        if (baseDate) q.set("b", baseDate);
        else q.delete("b");
        if (typeof position === "number" && !isNaN(position)) {
          q.set("p", String(position));
        }
        // 旧形式（世代を b= でなく新/旧で指していた）の名残を消す。
        q.delete("v");
      },
      { push },
    );
  }

  // 現在の hash route が Home（カレンダー）かどうか。popstate ハンドラが
  // 自分の担当ルートのときだけ反応するためのガード。
  function isCalendarRoute() {
    return getHashRoute().path === HOME_PATH;
  }

  function clearCalendarUrl() {
    writeHashQuery((q) => {
      q.delete("b");
      q.delete("p");
      q.delete("v");
    });
  }

  // ----- Meetup -----
  // Meetup state lives only in localStorage; old shared URLs still carry
  // b/ps/t/d, which are stripped on load.
  function clearMeetupUrl() {
    writeHashQuery((q) => {
      q.delete("b");
      q.delete("ps");
      q.delete("t");
      q.delete("d");
    });
  }

  return {
    readCanonicalCalendar,
    writeCalendarUrl,
    clearCalendarUrl,
    isCalendarRoute,
    clearMeetupUrl,
  };
}
