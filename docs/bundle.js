/*! For license information please see bundle.js.LICENSE.txt */
(() => {
  var e = {
      216: (e, t, n) => {
        var r = n(995);
        e.exports = r;
      },
      353: function (e) {
        e.exports = (function () {
          "use strict";
          var e = 6e4,
            t = 36e5,
            n = "millisecond",
            r = "second",
            i = "minute",
            o = "hour",
            s = "day",
            a = "week",
            l = "month",
            c = "quarter",
            u = "year",
            d = "date",
            h = "Invalid Date",
            f =
              /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,
            p =
              /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,
            g = {
              name: "en",
              weekdays:
                "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split(
                  "_",
                ),
              months:
                "January_February_March_April_May_June_July_August_September_October_November_December".split(
                  "_",
                ),
              ordinal: function (e) {
                var t = ["th", "st", "nd", "rd"],
                  n = e % 100;
                return "[" + e + (t[(n - 20) % 10] || t[n] || t[0]) + "]";
              },
            },
            v = function (e, t, n) {
              var r = String(e);
              return !r || r.length >= t
                ? e
                : "" + Array(t + 1 - r.length).join(n) + e;
            },
            m = {
              s: v,
              z: function (e) {
                var t = -e.utcOffset(),
                  n = Math.abs(t),
                  r = Math.floor(n / 60),
                  i = n % 60;
                return (t <= 0 ? "+" : "-") + v(r, 2, "0") + ":" + v(i, 2, "0");
              },
              m: function e(t, n) {
                if (t.date() < n.date()) return -e(n, t);
                var r = 12 * (n.year() - t.year()) + (n.month() - t.month()),
                  i = t.clone().add(r, l),
                  o = n - i < 0,
                  s = t.clone().add(r + (o ? -1 : 1), l);
                return +(-(r + (n - i) / (o ? i - s : s - i)) || 0);
              },
              a: function (e) {
                return e < 0 ? Math.ceil(e) || 0 : Math.floor(e);
              },
              p: function (e) {
                return (
                  {
                    M: l,
                    y: u,
                    w: a,
                    d: s,
                    D: d,
                    h: o,
                    m: i,
                    s: r,
                    ms: n,
                    Q: c,
                  }[e] ||
                  String(e || "")
                    .toLowerCase()
                    .replace(/s$/, "")
                );
              },
              u: function (e) {
                return void 0 === e;
              },
            },
            y = "en",
            b = {};
          b[y] = g;
          var E = "$isDayjsObject",
            A = function (e) {
              return e instanceof _ || !(!e || !e[E]);
            },
            w = function e(t, n, r) {
              var i;
              if (!t) return y;
              if ("string" == typeof t) {
                var o = t.toLowerCase();
                b[o] && (i = o), n && ((b[o] = n), (i = o));
                var s = t.split("-");
                if (!i && s.length > 1) return e(s[0]);
              } else {
                var a = t.name;
                (b[a] = t), (i = a);
              }
              return !r && i && (y = i), i || (!r && y);
            },
            D = function (e, t) {
              if (A(e)) return e.clone();
              var n = "object" == typeof t ? t : {};
              return (n.date = e), (n.args = arguments), new _(n);
            },
            S = m;
          (S.l = w),
            (S.i = A),
            (S.w = function (e, t) {
              return D(e, {
                locale: t.$L,
                utc: t.$u,
                x: t.$x,
                $offset: t.$offset,
              });
            });
          var _ = (function () {
              function g(e) {
                (this.$L = w(e.locale, null, !0)),
                  this.parse(e),
                  (this.$x = this.$x || e.x || {}),
                  (this[E] = !0);
              }
              var v = g.prototype;
              return (
                (v.parse = function (e) {
                  (this.$d = (function (e) {
                    var t = e.date,
                      n = e.utc;
                    if (null === t) return new Date(NaN);
                    if (S.u(t)) return new Date();
                    if (t instanceof Date) return new Date(t);
                    if ("string" == typeof t && !/Z$/i.test(t)) {
                      var r = t.match(f);
                      if (r) {
                        var i = r[2] - 1 || 0,
                          o = (r[7] || "0").substring(0, 3);
                        return n
                          ? new Date(
                              Date.UTC(
                                r[1],
                                i,
                                r[3] || 1,
                                r[4] || 0,
                                r[5] || 0,
                                r[6] || 0,
                                o,
                              ),
                            )
                          : new Date(
                              r[1],
                              i,
                              r[3] || 1,
                              r[4] || 0,
                              r[5] || 0,
                              r[6] || 0,
                              o,
                            );
                      }
                    }
                    return new Date(t);
                  })(e)),
                    this.init();
                }),
                (v.init = function () {
                  var e = this.$d;
                  (this.$y = e.getFullYear()),
                    (this.$M = e.getMonth()),
                    (this.$D = e.getDate()),
                    (this.$W = e.getDay()),
                    (this.$H = e.getHours()),
                    (this.$m = e.getMinutes()),
                    (this.$s = e.getSeconds()),
                    (this.$ms = e.getMilliseconds());
                }),
                (v.$utils = function () {
                  return S;
                }),
                (v.isValid = function () {
                  return !(this.$d.toString() === h);
                }),
                (v.isSame = function (e, t) {
                  var n = D(e);
                  return this.startOf(t) <= n && n <= this.endOf(t);
                }),
                (v.isAfter = function (e, t) {
                  return D(e) < this.startOf(t);
                }),
                (v.isBefore = function (e, t) {
                  return this.endOf(t) < D(e);
                }),
                (v.$g = function (e, t, n) {
                  return S.u(e) ? this[t] : this.set(n, e);
                }),
                (v.unix = function () {
                  return Math.floor(this.valueOf() / 1e3);
                }),
                (v.valueOf = function () {
                  return this.$d.getTime();
                }),
                (v.startOf = function (e, t) {
                  var n = this,
                    c = !!S.u(t) || t,
                    h = S.p(e),
                    f = function (e, t) {
                      var r = S.w(
                        n.$u ? Date.UTC(n.$y, t, e) : new Date(n.$y, t, e),
                        n,
                      );
                      return c ? r : r.endOf(s);
                    },
                    p = function (e, t) {
                      return S.w(
                        n
                          .toDate()
                          [
                            e
                          ].apply(n.toDate("s"), (c ? [0, 0, 0, 0] : [23, 59,
                                  59, 999]).slice(t)),
                        n,
                      );
                    },
                    g = this.$W,
                    v = this.$M,
                    m = this.$D,
                    y = "set" + (this.$u ? "UTC" : "");
                  switch (h) {
                    case u:
                      return c ? f(1, 0) : f(31, 11);
                    case l:
                      return c ? f(1, v) : f(0, v + 1);
                    case a:
                      var b = this.$locale().weekStart || 0,
                        E = (g < b ? g + 7 : g) - b;
                      return f(c ? m - E : m + (6 - E), v);
                    case s:
                    case d:
                      return p(y + "Hours", 0);
                    case o:
                      return p(y + "Minutes", 1);
                    case i:
                      return p(y + "Seconds", 2);
                    case r:
                      return p(y + "Milliseconds", 3);
                    default:
                      return this.clone();
                  }
                }),
                (v.endOf = function (e) {
                  return this.startOf(e, !1);
                }),
                (v.$set = function (e, t) {
                  var a,
                    c = S.p(e),
                    h = "set" + (this.$u ? "UTC" : ""),
                    f = ((a = {}),
                    (a[s] = h + "Date"),
                    (a[d] = h + "Date"),
                    (a[l] = h + "Month"),
                    (a[u] = h + "FullYear"),
                    (a[o] = h + "Hours"),
                    (a[i] = h + "Minutes"),
                    (a[r] = h + "Seconds"),
                    (a[n] = h + "Milliseconds"),
                    a)[c],
                    p = c === s ? this.$D + (t - this.$W) : t;
                  if (c === l || c === u) {
                    var g = this.clone().set(d, 1);
                    g.$d[f](p),
                      g.init(),
                      (this.$d = g.set(
                        d,
                        Math.min(this.$D, g.daysInMonth()),
                      ).$d);
                  } else f && this.$d[f](p);
                  return this.init(), this;
                }),
                (v.set = function (e, t) {
                  return this.clone().$set(e, t);
                }),
                (v.get = function (e) {
                  return this[S.p(e)]();
                }),
                (v.add = function (n, c) {
                  var d,
                    h = this;
                  n = Number(n);
                  var f = S.p(c),
                    p = function (e) {
                      var t = D(h);
                      return S.w(t.date(t.date() + Math.round(e * n)), h);
                    };
                  if (f === l) return this.set(l, this.$M + n);
                  if (f === u) return this.set(u, this.$y + n);
                  if (f === s) return p(1);
                  if (f === a) return p(7);
                  var g =
                      ((d = {}), (d[i] = e), (d[o] = t), (d[r] = 1e3), d)[f] ||
                      1,
                    v = this.$d.getTime() + n * g;
                  return S.w(v, this);
                }),
                (v.subtract = function (e, t) {
                  return this.add(-1 * e, t);
                }),
                (v.format = function (e) {
                  var t = this,
                    n = this.$locale();
                  if (!this.isValid()) return n.invalidDate || h;
                  var r = e || "YYYY-MM-DDTHH:mm:ssZ",
                    i = S.z(this),
                    o = this.$H,
                    s = this.$m,
                    a = this.$M,
                    l = n.weekdays,
                    c = n.months,
                    u = n.meridiem,
                    d = function (e, n, i, o) {
                      return (e && (e[n] || e(t, r))) || i[n].slice(0, o);
                    },
                    f = function (e) {
                      return S.s(o % 12 || 12, e, "0");
                    },
                    g =
                      u ||
                      function (e, t, n) {
                        var r = e < 12 ? "AM" : "PM";
                        return n ? r.toLowerCase() : r;
                      };
                  return r.replace(p, function (e, r) {
                    return (
                      r ||
                      (function (e) {
                        switch (e) {
                          case "YY":
                            return String(t.$y).slice(-2);
                          case "YYYY":
                            return S.s(t.$y, 4, "0");
                          case "M":
                            return a + 1;
                          case "MM":
                            return S.s(a + 1, 2, "0");
                          case "MMM":
                            return d(n.monthsShort, a, c, 3);
                          case "MMMM":
                            return d(c, a);
                          case "D":
                            return t.$D;
                          case "DD":
                            return S.s(t.$D, 2, "0");
                          case "d":
                            return String(t.$W);
                          case "dd":
                            return d(n.weekdaysMin, t.$W, l, 2);
                          case "ddd":
                            return d(n.weekdaysShort, t.$W, l, 3);
                          case "dddd":
                            return l[t.$W];
                          case "H":
                            return String(o);
                          case "HH":
                            return S.s(o, 2, "0");
                          case "h":
                            return f(1);
                          case "hh":
                            return f(2);
                          case "a":
                            return g(o, s, !0);
                          case "A":
                            return g(o, s, !1);
                          case "m":
                            return String(s);
                          case "mm":
                            return S.s(s, 2, "0");
                          case "s":
                            return String(t.$s);
                          case "ss":
                            return S.s(t.$s, 2, "0");
                          case "SSS":
                            return S.s(t.$ms, 3, "0");
                          case "Z":
                            return i;
                        }
                        return null;
                      })(e) ||
                      i.replace(":", "")
                    );
                  });
                }),
                (v.utcOffset = function () {
                  return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
                }),
                (v.diff = function (n, d, h) {
                  var f,
                    p = this,
                    g = S.p(d),
                    v = D(n),
                    m = (v.utcOffset() - this.utcOffset()) * e,
                    y = this - v,
                    b = function () {
                      return S.m(p, v);
                    };
                  switch (g) {
                    case u:
                      f = b() / 12;
                      break;
                    case l:
                      f = b();
                      break;
                    case c:
                      f = b() / 3;
                      break;
                    case a:
                      f = (y - m) / 6048e5;
                      break;
                    case s:
                      f = (y - m) / 864e5;
                      break;
                    case o:
                      f = y / t;
                      break;
                    case i:
                      f = y / e;
                      break;
                    case r:
                      f = y / 1e3;
                      break;
                    default:
                      f = y;
                  }
                  return h ? f : S.a(f);
                }),
                (v.daysInMonth = function () {
                  return this.endOf(l).$D;
                }),
                (v.$locale = function () {
                  return b[this.$L];
                }),
                (v.locale = function (e, t) {
                  if (!e) return this.$L;
                  var n = this.clone(),
                    r = w(e, t, !0);
                  return r && (n.$L = r), n;
                }),
                (v.clone = function () {
                  return S.w(this.$d, this);
                }),
                (v.toDate = function () {
                  return new Date(this.valueOf());
                }),
                (v.toJSON = function () {
                  return this.isValid() ? this.toISOString() : null;
                }),
                (v.toISOString = function () {
                  return this.$d.toISOString();
                }),
                (v.toString = function () {
                  return this.$d.toUTCString();
                }),
                g
              );
            })(),
            C = _.prototype;
          return (
            (D.prototype = C),
            [
              ["$ms", n],
              ["$s", r],
              ["$m", i],
              ["$H", o],
              ["$W", s],
              ["$M", l],
              ["$y", u],
              ["$D", d],
            ].forEach(function (e) {
              C[e[1]] = function (t) {
                return this.$g(t, e[0], e[1]);
              };
            }),
            (D.extend = function (e, t) {
              return e.$i || (e(t, _, D), (e.$i = !0)), D;
            }),
            (D.locale = w),
            (D.isDayjs = A),
            (D.unix = function (e) {
              return D(1e3 * e);
            }),
            (D.en = b[y]),
            (D.Ls = b),
            (D.p = {}),
            D
          );
        })();
      },
      445: function (e) {
        e.exports = (function () {
          "use strict";
          var e = {
              LTS: "h:mm:ss A",
              LT: "h:mm A",
              L: "MM/DD/YYYY",
              LL: "MMMM D, YYYY",
              LLL: "MMMM D, YYYY h:mm A",
              LLLL: "dddd, MMMM D, YYYY h:mm A",
            },
            t =
              /(\[[^[]*\])|([-_:/.,()\s]+)|(A|a|Q|YYYY|YY?|ww?|MM?M?M?|Do|DD?|hh?|HH?|mm?|ss?|S{1,3}|z|ZZ?)/g,
            n = /\d/,
            r = /\d\d/,
            i = /\d\d?/,
            o = /\d*[^-_:/,()\s\d]+/,
            s = {},
            a = function (e) {
              return (e = +e) + (e > 68 ? 1900 : 2e3);
            },
            l = function (e) {
              return function (t) {
                this[e] = +t;
              };
            },
            c = [
              /[+-]\d\d:?(\d\d)?|Z/,
              function (e) {
                (this.zone || (this.zone = {})).offset = (function (e) {
                  if (!e) return 0;
                  if ("Z" === e) return 0;
                  var t = e.match(/([+-]|\d\d)/g),
                    n = 60 * t[1] + (+t[2] || 0);
                  return 0 === n ? 0 : "+" === t[0] ? -n : n;
                })(e);
              },
            ],
            u = function (e) {
              var t = s[e];
              return t && (t.indexOf ? t : t.s.concat(t.f));
            },
            d = function (e, t) {
              var n,
                r = s.meridiem;
              if (r) {
                for (var i = 1; i <= 24; i += 1)
                  if (e.indexOf(r(i, 0, t)) > -1) {
                    n = i > 12;
                    break;
                  }
              } else n = e === (t ? "pm" : "PM");
              return n;
            },
            h = {
              A: [
                o,
                function (e) {
                  this.afternoon = d(e, !1);
                },
              ],
              a: [
                o,
                function (e) {
                  this.afternoon = d(e, !0);
                },
              ],
              Q: [
                n,
                function (e) {
                  this.month = 3 * (e - 1) + 1;
                },
              ],
              S: [
                n,
                function (e) {
                  this.milliseconds = 100 * +e;
                },
              ],
              SS: [
                r,
                function (e) {
                  this.milliseconds = 10 * +e;
                },
              ],
              SSS: [
                /\d{3}/,
                function (e) {
                  this.milliseconds = +e;
                },
              ],
              s: [i, l("seconds")],
              ss: [i, l("seconds")],
              m: [i, l("minutes")],
              mm: [i, l("minutes")],
              H: [i, l("hours")],
              h: [i, l("hours")],
              HH: [i, l("hours")],
              hh: [i, l("hours")],
              D: [i, l("day")],
              DD: [r, l("day")],
              Do: [
                o,
                function (e) {
                  var t = s.ordinal,
                    n = e.match(/\d+/);
                  if (((this.day = n[0]), t))
                    for (var r = 1; r <= 31; r += 1)
                      t(r).replace(/\[|\]/g, "") === e && (this.day = r);
                },
              ],
              w: [i, l("week")],
              ww: [r, l("week")],
              M: [i, l("month")],
              MM: [r, l("month")],
              MMM: [
                o,
                function (e) {
                  var t = u("months"),
                    n =
                      (
                        u("monthsShort") ||
                        t.map(function (e) {
                          return e.slice(0, 3);
                        })
                      ).indexOf(e) + 1;
                  if (n < 1) throw new Error();
                  this.month = n % 12 || n;
                },
              ],
              MMMM: [
                o,
                function (e) {
                  var t = u("months").indexOf(e) + 1;
                  if (t < 1) throw new Error();
                  this.month = t % 12 || t;
                },
              ],
              Y: [/[+-]?\d+/, l("year")],
              YY: [
                r,
                function (e) {
                  this.year = a(e);
                },
              ],
              YYYY: [/\d{4}/, l("year")],
              Z: c,
              ZZ: c,
            };
          function f(n) {
            var r, i;
            (r = n), (i = s && s.formats);
            for (
              var o = (n = r.replace(
                  /(\[[^\]]+])|(LTS?|l{1,4}|L{1,4})/g,
                  function (t, n, r) {
                    var o = r && r.toUpperCase();
                    return (
                      n ||
                      i[r] ||
                      e[r] ||
                      i[o].replace(
                        /(\[[^\]]+])|(MMMM|MM|DD|dddd)/g,
                        function (e, t, n) {
                          return t || n.slice(1);
                        },
                      )
                    );
                  },
                )).match(t),
                a = o.length,
                l = 0;
              l < a;
              l += 1
            ) {
              var c = o[l],
                u = h[c],
                d = u && u[0],
                f = u && u[1];
              o[l] = f ? { regex: d, parser: f } : c.replace(/^\[|\]$/g, "");
            }
            return function (e) {
              for (var t = {}, n = 0, r = 0; n < a; n += 1) {
                var i = o[n];
                if ("string" == typeof i) r += i.length;
                else {
                  var s = i.regex,
                    l = i.parser,
                    c = e.slice(r),
                    u = s.exec(c)[0];
                  l.call(t, u), (e = e.replace(u, ""));
                }
              }
              return (
                (function (e) {
                  var t = e.afternoon;
                  if (void 0 !== t) {
                    var n = e.hours;
                    t ? n < 12 && (e.hours += 12) : 12 === n && (e.hours = 0),
                      delete e.afternoon;
                  }
                })(t),
                t
              );
            };
          }
          return function (e, t, n) {
            (n.p.customParseFormat = !0),
              e && e.parseTwoDigitYear && (a = e.parseTwoDigitYear);
            var r = t.prototype,
              i = r.parse;
            r.parse = function (e) {
              var t = e.date,
                r = e.utc,
                o = e.args;
              this.$u = r;
              var a = o[1];
              if ("string" == typeof a) {
                var l = !0 === o[2],
                  c = !0 === o[3],
                  u = l || c,
                  d = o[2];
                c && (d = o[2]),
                  (s = this.$locale()),
                  !l && d && (s = n.Ls[d]),
                  (this.$d = (function (e, t, n, r) {
                    try {
                      if (["x", "X"].indexOf(t) > -1)
                        return new Date(("X" === t ? 1e3 : 1) * e);
                      var i = f(t)(e),
                        o = i.year,
                        s = i.month,
                        a = i.day,
                        l = i.hours,
                        c = i.minutes,
                        u = i.seconds,
                        d = i.milliseconds,
                        h = i.zone,
                        p = i.week,
                        g = new Date(),
                        v = a || (o || s ? 1 : g.getDate()),
                        m = o || g.getFullYear(),
                        y = 0;
                      (o && !s) || (y = s > 0 ? s - 1 : g.getMonth());
                      var b,
                        E = l || 0,
                        A = c || 0,
                        w = u || 0,
                        D = d || 0;
                      return h
                        ? new Date(
                            Date.UTC(m, y, v, E, A, w, D + 60 * h.offset * 1e3),
                          )
                        : n
                          ? new Date(Date.UTC(m, y, v, E, A, w, D))
                          : ((b = new Date(m, y, v, E, A, w, D)),
                            p && (b = r(b).week(p).toDate()),
                            b);
                    } catch (e) {
                      return new Date("");
                    }
                  })(t, a, r, n)),
                  this.init(),
                  d && !0 !== d && (this.$L = this.locale(d).$L),
                  u && t != this.format(a) && (this.$d = new Date("")),
                  (s = {});
              } else if (a instanceof Array)
                for (var h = a.length, p = 1; p <= h; p += 1) {
                  o[1] = a[p - 1];
                  var g = n.apply(this, o);
                  if (g.isValid()) {
                    (this.$d = g.$d), (this.$L = g.$L), this.init();
                    break;
                  }
                  p === h && (this.$d = new Date(""));
                }
              else i.call(this, e);
            };
          };
        })();
      },
      867: function (e) {
        e.exports = (function () {
          "use strict";
          return function (e, t) {
            t.prototype.isSameOrAfter = function (e, t) {
              return this.isSame(e, t) || this.isAfter(e, t);
            };
          };
        })();
      },
      906: function (e) {
        e.exports = (function () {
          "use strict";
          return function (e, t) {
            t.prototype.isSameOrBefore = function (e, t) {
              return this.isSame(e, t) || this.isBefore(e, t);
            };
          };
        })();
      },
      995: function (e, t, n) {
        (e = n.nmd(e)),
          function () {
            "use strict";
            var t,
              n,
              r,
              i,
              o,
              s,
              a,
              l,
              c,
              u,
              d,
              h,
              f,
              p,
              g,
              v,
              m,
              y,
              b,
              E,
              A,
              w,
              D,
              S,
              _,
              C;
            (y = function (e, t, n, r, i, o, s, a) {
              var l;
              return (
                (l = new Date(2e3, 0, 1)).setTime(
                  e.getTime() +
                    1e3 *
                      (60 *
                        (60 * (24 * (null != r ? r : 0) + (null != i ? i : 0)) +
                          (null != o ? o : 0)) +
                        (null != s ? s : 0)) +
                    (null != a ? a : 0),
                ),
                l.setFullYear(
                  l.getFullYear() +
                    (null != t ? t : 0) +
                    Math.floor((l.getMonth() + (null != n ? n : 0)) / 12),
                ),
                l.setMonth(
                  (((l.getMonth() + (null != n ? n : 0)) % 12) + 12) % 12,
                ),
                l
              );
            }),
              (_ = function (e) {
                return y(e, 0, 0, 0, 9);
              }),
              (p = function (e) {
                return y(e, 0, 0, 0, -9);
              }),
              (C = function (e, t, n) {
                return new Date(Date.UTC(e, t, n));
              }),
              (g = function (e, t, n) {
                return p(C(e, t, n));
              }),
              (o = function (e) {
                return _(e).getUTCDay();
              }),
              (i = function (e) {
                return _(e).getUTCDate();
              }),
              (c = function (e) {
                return _(e).getUTCMonth();
              }),
              (s = function (e) {
                return _(e).getUTCFullYear();
              }),
              (a = function (e) {
                return _(e).getUTCHours();
              }),
              (l = function (e) {
                return _(e).getUTCMinutes();
              }),
              (u = function (e, t) {
                return function (n) {
                  var r;
                  return (
                    (r = g(n, e - 1, 1)),
                    y(r, 0, 0, ((7 - (o(r) - 1)) % 7) + 7 * (t - 1))
                  );
                };
              }),
              (w = function (e) {
                return new Date(31556940400 * (e - 1949) - 6558667e5);
              }),
              (A = function (e) {
                var t;
                return (t = w(e)), g(e, c(t), i(t));
              }),
              (E = function (e) {
                var t;
                return (t = { 1603: 23, 2074: 23, 2355: 23, 2384: 22 }[e])
                  ? g(e, 8, t)
                  : new Date(3155691e4 * (e - 1948) - 67131691e4);
              }),
              (b = function (e) {
                var t;
                return (t = E(e)), g(e, c(t), i(t));
              }),
              (t = [
                [
                  "元日",
                  (D = function (e, t) {
                    return function (n) {
                      return g(n, e - 1, t);
                    };
                  })(1, 1),
                  1949,
                ],
                ["成人の日", D(1, 15), 1949, 1999],
                ["成人の日", u(1, 2), 2e3],
                ["建国記念の日", D(2, 11), 1967],
                ["天皇誕生日", D(2, 23), 2020],
                ["昭和天皇の大喪の礼", D(2, 24), 1989, 1989],
                ["春分の日", A, 1949],
                ["皇太子明仁親王の結婚の儀", D(4, 10), 1959, 1959],
                ["天皇誕生日", D(4, 29), 1949, 1988],
                ["みどりの日", D(4, 29), 1989, 2006],
                ["昭和の日", D(4, 29), 2007],
                ["即位の日", D(5, 1), 2019, 2019],
                ["憲法記念日", D(5, 3), 1949],
                ["みどりの日", D(5, 4), 2007],
                ["こどもの日", D(5, 5), 1949],
                ["皇太子徳仁親王の結婚の儀", D(6, 9), 1993, 1993],
                ["海の日", D(7, 20), 1996, 2002],
                ["海の日", u(7, 3), 2003, 2019],
                ["海の日", D(7, 23), 2020, 2020],
                ["海の日", D(7, 22), 2021, 2021],
                ["海の日", u(7, 3), 2022],
                ["山の日", D(8, 11), 2016, 2019],
                ["山の日", D(8, 10), 2020, 2020],
                ["山の日", D(8, 8), 2021, 2021],
                ["山の日", D(8, 11), 2022],
                ["敬老の日", D(9, 15), 1966, 2002],
                ["敬老の日", u(9, 3), 2003],
                ["秋分の日", b, 1948],
                ["体育の日", D(10, 10), 1966, 1999],
                ["体育の日", u(10, 2), 2e3, 2019],
                ["スポーツの日", D(7, 24), 2020, 2020],
                ["スポーツの日", D(7, 23), 2021, 2021],
                ["スポーツの日", u(10, 2), 2022],
                ["即位礼正殿の儀", D(10, 22), 2019, 2019],
                ["文化の日", D(11, 3), 1948],
                ["即位礼正殿の儀", D(11, 12), 1990, 1990],
                ["勤労感謝の日", D(11, 23), 1948],
                ["天皇誕生日", D(12, 23), 1989, 2018],
              ]),
              (n = function (e) {
                var t;
                if (e < g(1973, 3, 29) || 0 !== o(e)) return null;
                if (((t = y(e, 0, 0, 1)), !f(t, !1))) return t;
                if (e < g(2007, 0, 1)) return null;
                for (;;) if (((t = y(t, 0, 0, 1)), !f(t, !1))) return t;
              }),
              (v = function (e) {
                var t;
                return s(e) < 1988
                  ? null
                  : f(y(e, 0, 0, 2), !1)
                    ? ((t = y(e, 0, 0, 1)),
                      f(t, !1) || 0 === o(t) || 1 === o(t) ? null : t)
                    : null;
              }),
              (d = { true: {}, false: {} }),
              (r = function (e, r) {
                var o, s, a, l, u, h, f, p, m, y, b, E, A, w;
                if (null != (o = d[(r = !(null != r && !r))][e])) return o;
                for (w = {}, u = 0, p = t.length; u < p; u++)
                  (null != (a = t[u])[2] && e < a[2]) ||
                    (null != a[3] && a[3] < e) ||
                    (null != (l = a[1](e)) &&
                      (w[[(y = c(l) + 1), (s = i(l))]] = a[0]));
                for (b in ((d[!1][e] = w), (f = []), w))
                  (b = b.split(",")),
                    null != (l = v(g(e, b[0] - 1, b[1]))) &&
                      ((y = c(l) + 1), (s = i(l)), f.push([y, s]));
                for (h = 0, m = f.length; h < m; h++)
                  w[(l = f[h])] = "国民の休日";
                for (b in ((A = {}), w))
                  (E = w[b]),
                    (A[b] = E),
                    (b = b.split(",")),
                    null != (l = n(g(e, b[0] - 1, b[1]))) &&
                      (A[[(y = c(l) + 1), (s = i(l))]] = "振替休日");
                return (d[!0][e] = A), d[r][e];
              }),
              ((S =
                null != (m = null !== e ? e.exports : void 0)
                  ? m
                  : (this.JapaneseHolidays = {})).getHolidaysOf = function (
                e,
                t,
              ) {
                var n, i, o, s;
                for (n in ((s = []), (o = r(e, t))))
                  (i = o[n]),
                    s.push({
                      month: parseInt(n.split(",")[0]),
                      date: parseInt(n.split(",")[1]),
                      name: i,
                    });
                return (
                  s.sort(function (e, t) {
                    return e.month - t.month || e.date - t.date;
                  }),
                  s
                );
              }),
              (h = function (e, t) {
                return r(e.getFullYear(), t)[[e.getMonth() + 1, e.getDate()]];
              }),
              (f = function (e, t) {
                return r(s(e), t)[[c(e) + 1, i(e)]];
              }),
              (S.isHoliday = h),
              (S.isHolidayAt = f),
              (S.shiftDate = y),
              (S.u2j = _),
              (S.j2u = p),
              (S.jDate = g),
              (S.uDate = C),
              (S.getJDay = o),
              (S.getJDate = i),
              (S.getJMonth = c),
              (S.getJFullYear = s),
              (S.getJHours = a),
              (S.getJMinutes = l),
              (S.__forTest = { shunbunWithTime: w, shubunWithTime: E });
          }.call(this);
      },
    },
    t = {};
  function n(r) {
    var i = t[r];
    if (void 0 !== i) return i.exports;
    var o = (t[r] = { id: r, loaded: !1, exports: {} });
    return e[r].call(o.exports, o, o.exports, n), (o.loaded = !0), o.exports;
  }
  (n.n = (e) => {
    var t = e && e.__esModule ? () => e.default : () => e;
    return n.d(t, { a: t }), t;
  }),
    (n.d = (e, t) => {
      for (var r in t)
        n.o(t, r) &&
          !n.o(e, r) &&
          Object.defineProperty(e, r, { enumerable: !0, get: t[r] });
    }),
    (n.o = (e, t) => Object.prototype.hasOwnProperty.call(e, t)),
    (n.nmd = (e) => ((e.paths = []), e.children || (e.children = []), e)),
    (() => {
      "use strict";
      var e = n(353),
        t = n.n(e),
        r = n(445),
        i = n.n(r),
        o = n(906),
        s = n.n(o),
        a = n(867),
        l = n.n(a);
      function c(e) {
        return (
          (c =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                }),
          c(e)
        );
      }
      function u() {
        u = function () {
          return t;
        };
        var e,
          t = {},
          n = Object.prototype,
          r = n.hasOwnProperty,
          i =
            Object.defineProperty ||
            function (e, t, n) {
              e[t] = n.value;
            },
          o = "function" == typeof Symbol ? Symbol : {},
          s = o.iterator || "@@iterator",
          a = o.asyncIterator || "@@asyncIterator",
          l = o.toStringTag || "@@toStringTag";
        function d(e, t, n) {
          return (
            Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            }),
            e[t]
          );
        }
        try {
          d({}, "");
        } catch (e) {
          d = function (e, t, n) {
            return (e[t] = n);
          };
        }
        function h(e, t, n, r) {
          var o = t && t.prototype instanceof b ? t : b,
            s = Object.create(o.prototype),
            a = new O(r || []);
          return i(s, "_invoke", { value: R(e, n, a) }), s;
        }
        function f(e, t, n) {
          try {
            return { type: "normal", arg: e.call(t, n) };
          } catch (e) {
            return { type: "throw", arg: e };
          }
        }
        t.wrap = h;
        var p = "suspendedStart",
          g = "suspendedYield",
          v = "executing",
          m = "completed",
          y = {};
        function b() {}
        function E() {}
        function A() {}
        var w = {};
        d(w, s, function () {
          return this;
        });
        var D = Object.getPrototypeOf,
          S = D && D(D(I([])));
        S && S !== n && r.call(S, s) && (w = S);
        var _ = (A.prototype = b.prototype = Object.create(w));
        function C(e) {
          ["next", "throw", "return"].forEach(function (t) {
            d(e, t, function (e) {
              return this._invoke(t, e);
            });
          });
        }
        function x(e, t) {
          function n(i, o, s, a) {
            var l = f(e[i], e, o);
            if ("throw" !== l.type) {
              var u = l.arg,
                d = u.value;
              return d && "object" == c(d) && r.call(d, "__await")
                ? t.resolve(d.__await).then(
                    function (e) {
                      n("next", e, s, a);
                    },
                    function (e) {
                      n("throw", e, s, a);
                    },
                  )
                : t.resolve(d).then(
                    function (e) {
                      (u.value = e), s(u);
                    },
                    function (e) {
                      return n("throw", e, s, a);
                    },
                  );
            }
            a(l.arg);
          }
          var o;
          i(this, "_invoke", {
            value: function (e, r) {
              function i() {
                return new t(function (t, i) {
                  n(e, r, t, i);
                });
              }
              return (o = o ? o.then(i, i) : i());
            },
          });
        }
        function R(t, n, r) {
          var i = p;
          return function (o, s) {
            if (i === v) throw Error("Generator is already running");
            if (i === m) {
              if ("throw" === o) throw s;
              return { value: e, done: !0 };
            }
            for (r.method = o, r.arg = s; ; ) {
              var a = r.delegate;
              if (a) {
                var l = T(a, r);
                if (l) {
                  if (l === y) continue;
                  return l;
                }
              }
              if ("next" === r.method) r.sent = r._sent = r.arg;
              else if ("throw" === r.method) {
                if (i === p) throw ((i = m), r.arg);
                r.dispatchException(r.arg);
              } else "return" === r.method && r.abrupt("return", r.arg);
              i = v;
              var c = f(t, n, r);
              if ("normal" === c.type) {
                if (((i = r.done ? m : g), c.arg === y)) continue;
                return { value: c.arg, done: r.done };
              }
              "throw" === c.type &&
                ((i = m), (r.method = "throw"), (r.arg = c.arg));
            }
          };
        }
        function T(t, n) {
          var r = n.method,
            i = t.iterator[r];
          if (i === e)
            return (
              (n.delegate = null),
              ("throw" === r &&
                t.iterator.return &&
                ((n.method = "return"),
                (n.arg = e),
                T(t, n),
                "throw" === n.method)) ||
                ("return" !== r &&
                  ((n.method = "throw"),
                  (n.arg = new TypeError(
                    "The iterator does not provide a '" + r + "' method",
                  )))),
              y
            );
          var o = f(i, t.iterator, n.arg);
          if ("throw" === o.type)
            return (
              (n.method = "throw"), (n.arg = o.arg), (n.delegate = null), y
            );
          var s = o.arg;
          return s
            ? s.done
              ? ((n[t.resultName] = s.value),
                (n.next = t.nextLoc),
                "return" !== n.method && ((n.method = "next"), (n.arg = e)),
                (n.delegate = null),
                y)
              : s
            : ((n.method = "throw"),
              (n.arg = new TypeError("iterator result is not an object")),
              (n.delegate = null),
              y);
        }
        function k(e) {
          var t = { tryLoc: e[0] };
          1 in e && (t.catchLoc = e[1]),
            2 in e && ((t.finallyLoc = e[2]), (t.afterLoc = e[3])),
            this.tryEntries.push(t);
        }
        function M(e) {
          var t = e.completion || {};
          (t.type = "normal"), delete t.arg, (e.completion = t);
        }
        function O(e) {
          (this.tryEntries = [{ tryLoc: "root" }]),
            e.forEach(k, this),
            this.reset(!0);
        }
        function I(t) {
          if (t || "" === t) {
            var n = t[s];
            if (n) return n.call(t);
            if ("function" == typeof t.next) return t;
            if (!isNaN(t.length)) {
              var i = -1,
                o = function n() {
                  for (; ++i < t.length; )
                    if (r.call(t, i)) return (n.value = t[i]), (n.done = !1), n;
                  return (n.value = e), (n.done = !0), n;
                };
              return (o.next = o);
            }
          }
          throw new TypeError(c(t) + " is not iterable");
        }
        return (
          (E.prototype = A),
          i(_, "constructor", { value: A, configurable: !0 }),
          i(A, "constructor", { value: E, configurable: !0 }),
          (E.displayName = d(A, l, "GeneratorFunction")),
          (t.isGeneratorFunction = function (e) {
            var t = "function" == typeof e && e.constructor;
            return (
              !!t &&
              (t === E || "GeneratorFunction" === (t.displayName || t.name))
            );
          }),
          (t.mark = function (e) {
            return (
              Object.setPrototypeOf
                ? Object.setPrototypeOf(e, A)
                : ((e.__proto__ = A), d(e, l, "GeneratorFunction")),
              (e.prototype = Object.create(_)),
              e
            );
          }),
          (t.awrap = function (e) {
            return { __await: e };
          }),
          C(x.prototype),
          d(x.prototype, a, function () {
            return this;
          }),
          (t.AsyncIterator = x),
          (t.async = function (e, n, r, i, o) {
            void 0 === o && (o = Promise);
            var s = new x(h(e, n, r, i), o);
            return t.isGeneratorFunction(n)
              ? s
              : s.next().then(function (e) {
                  return e.done ? e.value : s.next();
                });
          }),
          C(_),
          d(_, l, "Generator"),
          d(_, s, function () {
            return this;
          }),
          d(_, "toString", function () {
            return "[object Generator]";
          }),
          (t.keys = function (e) {
            var t = Object(e),
              n = [];
            for (var r in t) n.push(r);
            return (
              n.reverse(),
              function e() {
                for (; n.length; ) {
                  var r = n.pop();
                  if (r in t) return (e.value = r), (e.done = !1), e;
                }
                return (e.done = !0), e;
              }
            );
          }),
          (t.values = I),
          (O.prototype = {
            constructor: O,
            reset: function (t) {
              if (
                ((this.prev = 0),
                (this.next = 0),
                (this.sent = this._sent = e),
                (this.done = !1),
                (this.delegate = null),
                (this.method = "next"),
                (this.arg = e),
                this.tryEntries.forEach(M),
                !t)
              )
                for (var n in this)
                  "t" === n.charAt(0) &&
                    r.call(this, n) &&
                    !isNaN(+n.slice(1)) &&
                    (this[n] = e);
            },
            stop: function () {
              this.done = !0;
              var e = this.tryEntries[0].completion;
              if ("throw" === e.type) throw e.arg;
              return this.rval;
            },
            dispatchException: function (t) {
              if (this.done) throw t;
              var n = this;
              function i(r, i) {
                return (
                  (a.type = "throw"),
                  (a.arg = t),
                  (n.next = r),
                  i && ((n.method = "next"), (n.arg = e)),
                  !!i
                );
              }
              for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                var s = this.tryEntries[o],
                  a = s.completion;
                if ("root" === s.tryLoc) return i("end");
                if (s.tryLoc <= this.prev) {
                  var l = r.call(s, "catchLoc"),
                    c = r.call(s, "finallyLoc");
                  if (l && c) {
                    if (this.prev < s.catchLoc) return i(s.catchLoc, !0);
                    if (this.prev < s.finallyLoc) return i(s.finallyLoc);
                  } else if (l) {
                    if (this.prev < s.catchLoc) return i(s.catchLoc, !0);
                  } else {
                    if (!c)
                      throw Error("try statement without catch or finally");
                    if (this.prev < s.finallyLoc) return i(s.finallyLoc);
                  }
                }
              }
            },
            abrupt: function (e, t) {
              for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                var i = this.tryEntries[n];
                if (
                  i.tryLoc <= this.prev &&
                  r.call(i, "finallyLoc") &&
                  this.prev < i.finallyLoc
                ) {
                  var o = i;
                  break;
                }
              }
              o &&
                ("break" === e || "continue" === e) &&
                o.tryLoc <= t &&
                t <= o.finallyLoc &&
                (o = null);
              var s = o ? o.completion : {};
              return (
                (s.type = e),
                (s.arg = t),
                o
                  ? ((this.method = "next"), (this.next = o.finallyLoc), y)
                  : this.complete(s)
              );
            },
            complete: function (e, t) {
              if ("throw" === e.type) throw e.arg;
              return (
                "break" === e.type || "continue" === e.type
                  ? (this.next = e.arg)
                  : "return" === e.type
                    ? ((this.rval = this.arg = e.arg),
                      (this.method = "return"),
                      (this.next = "end"))
                    : "normal" === e.type && t && (this.next = t),
                y
              );
            },
            finish: function (e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var n = this.tryEntries[t];
                if (n.finallyLoc === e)
                  return this.complete(n.completion, n.afterLoc), M(n), y;
              }
            },
            catch: function (e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var n = this.tryEntries[t];
                if (n.tryLoc === e) {
                  var r = n.completion;
                  if ("throw" === r.type) {
                    var i = r.arg;
                    M(n);
                  }
                  return i;
                }
              }
              throw Error("illegal catch attempt");
            },
            delegateYield: function (t, n, r) {
              return (
                (this.delegate = { iterator: I(t), resultName: n, nextLoc: r }),
                "next" === this.method && (this.arg = e),
                y
              );
            },
          }),
          t
        );
      }
      function d(e, t) {
        return (
          (function (e) {
            if (Array.isArray(e)) return e;
          })(e) ||
          (function (e, t) {
            var n =
              null == e
                ? null
                : ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
                  e["@@iterator"];
            if (null != n) {
              var r,
                i,
                o,
                s,
                a = [],
                l = !0,
                c = !1;
              try {
                if (((o = (n = n.call(e)).next), 0 === t)) {
                  if (Object(n) !== n) return;
                  l = !1;
                } else
                  for (
                    ;
                    !(l = (r = o.call(n)).done) &&
                    (a.push(r.value), a.length !== t);
                    l = !0
                  );
              } catch (e) {
                (c = !0), (i = e);
              } finally {
                try {
                  if (
                    !l &&
                    null != n.return &&
                    ((s = n.return()), Object(s) !== s)
                  )
                    return;
                } finally {
                  if (c) throw i;
                }
              }
              return a;
            }
          })(e, t) ||
          (function (e, t) {
            if (e) {
              if ("string" == typeof e) return h(e, t);
              var n = {}.toString.call(e).slice(8, -1);
              return (
                "Object" === n && e.constructor && (n = e.constructor.name),
                "Map" === n || "Set" === n
                  ? Array.from(e)
                  : "Arguments" === n ||
                      /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                    ? h(e, t)
                    : void 0
              );
            }
          })(e, t) ||
          (function () {
            throw new TypeError(
              "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
            );
          })()
        );
      }
      function h(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
        return r;
      }
      function f(e, t, n, r, i, o, s) {
        try {
          var a = e[o](s),
            l = a.value;
        } catch (e) {
          return void n(e);
        }
        a.done ? t(l) : Promise.resolve(l).then(r, i);
      }
      function p(e) {
        return function () {
          var t = this,
            n = arguments;
          return new Promise(function (r, i) {
            var o = e.apply(t, n);
            function s(e) {
              f(o, r, i, s, a, "next", e);
            }
            function a(e) {
              f(o, r, i, s, a, "throw", e);
            }
            s(void 0);
          });
        };
      }
      t().extend(i()), t().extend(s()), t().extend(l());
      var g,
        v,
        m,
        y,
        b = [],
        E = [];
      function A() {
        return w.apply(this, arguments);
      }
      function w() {
        return (
          (w = p(
            u().mark(function e() {
              var n, r, i;
              return u().wrap(
                function (e) {
                  for (;;)
                    switch ((e.prev = e.next)) {
                      case 0:
                        return (
                          (e.prev = 0),
                          (e.next = 3),
                          fetch("./config/config.json")
                        );
                      case 3:
                        if ((n = e.sent).ok) {
                          e.next = 6;
                          break;
                        }
                        throw new Error("設定ファイルの取得に失敗しました");
                      case 6:
                        return (e.next = 8), n.json();
                      case 8:
                        if (!(r = e.sent).base_dates) {
                          e.next = 13;
                          break;
                        }
                        (b = r.base_dates
                          .map(function (e) {
                            return t()(e);
                          })
                          .sort(function (e, t) {
                            return e.unix() - t.unix();
                          })),
                          (e.next = 18);
                        break;
                      case 13:
                        if (!r.base_date) {
                          e.next = 17;
                          break;
                        }
                        (b = [t()(r.base_date)]), (e.next = 18);
                        break;
                      case 17:
                        throw new Error("基準日が設定されていません");
                      case 18:
                        return (
                          ((i = new URLSearchParams(
                            window.location.search,
                          )).has("baseDate") &&
                            (g = t()(i.get("baseDate"))).isValid()) ||
                            (g = b[0]),
                          (v = b[b.length - 1]),
                          (m = r.holiday_years_range),
                          (E = r.custom_holidays || []),
                          e.abrupt("return", {
                            baseDates: b,
                            currentBaseDate: g,
                            lastBaseDate: v,
                            holidayYearsRange: m,
                            userDefinedHolidays: E,
                          })
                        );
                      case 26:
                        throw (
                          ((e.prev = 26),
                          (e.t0 = e.catch(0)),
                          console.error(e.t0.message),
                          e.t0)
                        );
                      case 30:
                      case "end":
                        return e.stop();
                    }
                },
                e,
                null,
                [[0, 26]],
              );
            }),
          )),
          w.apply(this, arguments)
        );
      }
      function D() {
        return S.apply(this, arguments);
      }
      function S() {
        return (S = p(
          u().mark(function e() {
            var t;
            return u().wrap(
              function (e) {
                for (;;)
                  switch ((e.prev = e.next)) {
                    case 0:
                      return (
                        (e.prev = 0), (e.next = 3), fetch("./config/event.json")
                      );
                    case 3:
                      if ((t = e.sent).ok) {
                        e.next = 6;
                        break;
                      }
                      throw new Error(
                        "イベント設定ファイルの取得に失敗しました",
                      );
                    case 6:
                      return (e.next = 8), t.json();
                    case 8:
                      return (y = e.sent), e.abrupt("return", y);
                    case 12:
                      throw (
                        ((e.prev = 12),
                        (e.t0 = e.catch(0)),
                        console.error(e.t0.message),
                        e.t0)
                      );
                    case 16:
                    case "end":
                      return e.stop();
                  }
              },
              e,
              null,
              [[0, 12]],
            );
          }),
        )).apply(this, arguments);
      }
      function _(e) {
        for (
          var t = 0, n = Object.entries(y.specialEvents);
          t < n.length;
          t++
        ) {
          var r = d(n[t], 2),
            i = r[0],
            o = r[1];
          if (
            o.keywords.some(function (t) {
              return e.includes(t);
            })
          )
            return { type: i, config: o };
        }
        return { type: "default", config: y.defaultEvent };
      }
      var C = n(216),
        x = n.n(C);
      function R(e) {
        return (
          (R =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                }),
          R(e)
        );
      }
      function T(e, t) {
        return (
          (function (e) {
            if (Array.isArray(e)) return e;
          })(e) ||
          (function (e, t) {
            var n =
              null == e
                ? null
                : ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
                  e["@@iterator"];
            if (null != n) {
              var r,
                i,
                o,
                s,
                a = [],
                l = !0,
                c = !1;
              try {
                if (((o = (n = n.call(e)).next), 0 === t)) {
                  if (Object(n) !== n) return;
                  l = !1;
                } else
                  for (
                    ;
                    !(l = (r = o.call(n)).done) &&
                    (a.push(r.value), a.length !== t);
                    l = !0
                  );
              } catch (e) {
                (c = !0), (i = e);
              } finally {
                try {
                  if (
                    !l &&
                    null != n.return &&
                    ((s = n.return()), Object(s) !== s)
                  )
                    return;
                } finally {
                  if (c) throw i;
                }
              }
              return a;
            }
          })(e, t) ||
          (function (e, t) {
            if (e) {
              if ("string" == typeof e) return k(e, t);
              var n = {}.toString.call(e).slice(8, -1);
              return (
                "Object" === n && e.constructor && (n = e.constructor.name),
                "Map" === n || "Set" === n
                  ? Array.from(e)
                  : "Arguments" === n ||
                      /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                    ? k(e, t)
                    : void 0
              );
            }
          })(e, t) ||
          (function () {
            throw new TypeError(
              "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
            );
          })()
        );
      }
      function k(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
        return r;
      }
      function M() {
        M = function () {
          return t;
        };
        var e,
          t = {},
          n = Object.prototype,
          r = n.hasOwnProperty,
          i =
            Object.defineProperty ||
            function (e, t, n) {
              e[t] = n.value;
            },
          o = "function" == typeof Symbol ? Symbol : {},
          s = o.iterator || "@@iterator",
          a = o.asyncIterator || "@@asyncIterator",
          l = o.toStringTag || "@@toStringTag";
        function c(e, t, n) {
          return (
            Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            }),
            e[t]
          );
        }
        try {
          c({}, "");
        } catch (e) {
          c = function (e, t, n) {
            return (e[t] = n);
          };
        }
        function u(e, t, n, r) {
          var o = t && t.prototype instanceof m ? t : m,
            s = Object.create(o.prototype),
            a = new O(r || []);
          return i(s, "_invoke", { value: C(e, n, a) }), s;
        }
        function d(e, t, n) {
          try {
            return { type: "normal", arg: e.call(t, n) };
          } catch (e) {
            return { type: "throw", arg: e };
          }
        }
        t.wrap = u;
        var h = "suspendedStart",
          f = "suspendedYield",
          p = "executing",
          g = "completed",
          v = {};
        function m() {}
        function y() {}
        function b() {}
        var E = {};
        c(E, s, function () {
          return this;
        });
        var A = Object.getPrototypeOf,
          w = A && A(A(I([])));
        w && w !== n && r.call(w, s) && (E = w);
        var D = (b.prototype = m.prototype = Object.create(E));
        function S(e) {
          ["next", "throw", "return"].forEach(function (t) {
            c(e, t, function (e) {
              return this._invoke(t, e);
            });
          });
        }
        function _(e, t) {
          function n(i, o, s, a) {
            var l = d(e[i], e, o);
            if ("throw" !== l.type) {
              var c = l.arg,
                u = c.value;
              return u && "object" == R(u) && r.call(u, "__await")
                ? t.resolve(u.__await).then(
                    function (e) {
                      n("next", e, s, a);
                    },
                    function (e) {
                      n("throw", e, s, a);
                    },
                  )
                : t.resolve(u).then(
                    function (e) {
                      (c.value = e), s(c);
                    },
                    function (e) {
                      return n("throw", e, s, a);
                    },
                  );
            }
            a(l.arg);
          }
          var o;
          i(this, "_invoke", {
            value: function (e, r) {
              function i() {
                return new t(function (t, i) {
                  n(e, r, t, i);
                });
              }
              return (o = o ? o.then(i, i) : i());
            },
          });
        }
        function C(t, n, r) {
          var i = h;
          return function (o, s) {
            if (i === p) throw Error("Generator is already running");
            if (i === g) {
              if ("throw" === o) throw s;
              return { value: e, done: !0 };
            }
            for (r.method = o, r.arg = s; ; ) {
              var a = r.delegate;
              if (a) {
                var l = x(a, r);
                if (l) {
                  if (l === v) continue;
                  return l;
                }
              }
              if ("next" === r.method) r.sent = r._sent = r.arg;
              else if ("throw" === r.method) {
                if (i === h) throw ((i = g), r.arg);
                r.dispatchException(r.arg);
              } else "return" === r.method && r.abrupt("return", r.arg);
              i = p;
              var c = d(t, n, r);
              if ("normal" === c.type) {
                if (((i = r.done ? g : f), c.arg === v)) continue;
                return { value: c.arg, done: r.done };
              }
              "throw" === c.type &&
                ((i = g), (r.method = "throw"), (r.arg = c.arg));
            }
          };
        }
        function x(t, n) {
          var r = n.method,
            i = t.iterator[r];
          if (i === e)
            return (
              (n.delegate = null),
              ("throw" === r &&
                t.iterator.return &&
                ((n.method = "return"),
                (n.arg = e),
                x(t, n),
                "throw" === n.method)) ||
                ("return" !== r &&
                  ((n.method = "throw"),
                  (n.arg = new TypeError(
                    "The iterator does not provide a '" + r + "' method",
                  )))),
              v
            );
          var o = d(i, t.iterator, n.arg);
          if ("throw" === o.type)
            return (
              (n.method = "throw"), (n.arg = o.arg), (n.delegate = null), v
            );
          var s = o.arg;
          return s
            ? s.done
              ? ((n[t.resultName] = s.value),
                (n.next = t.nextLoc),
                "return" !== n.method && ((n.method = "next"), (n.arg = e)),
                (n.delegate = null),
                v)
              : s
            : ((n.method = "throw"),
              (n.arg = new TypeError("iterator result is not an object")),
              (n.delegate = null),
              v);
        }
        function T(e) {
          var t = { tryLoc: e[0] };
          1 in e && (t.catchLoc = e[1]),
            2 in e && ((t.finallyLoc = e[2]), (t.afterLoc = e[3])),
            this.tryEntries.push(t);
        }
        function k(e) {
          var t = e.completion || {};
          (t.type = "normal"), delete t.arg, (e.completion = t);
        }
        function O(e) {
          (this.tryEntries = [{ tryLoc: "root" }]),
            e.forEach(T, this),
            this.reset(!0);
        }
        function I(t) {
          if (t || "" === t) {
            var n = t[s];
            if (n) return n.call(t);
            if ("function" == typeof t.next) return t;
            if (!isNaN(t.length)) {
              var i = -1,
                o = function n() {
                  for (; ++i < t.length; )
                    if (r.call(t, i)) return (n.value = t[i]), (n.done = !1), n;
                  return (n.value = e), (n.done = !0), n;
                };
              return (o.next = o);
            }
          }
          throw new TypeError(R(t) + " is not iterable");
        }
        return (
          (y.prototype = b),
          i(D, "constructor", { value: b, configurable: !0 }),
          i(b, "constructor", { value: y, configurable: !0 }),
          (y.displayName = c(b, l, "GeneratorFunction")),
          (t.isGeneratorFunction = function (e) {
            var t = "function" == typeof e && e.constructor;
            return (
              !!t &&
              (t === y || "GeneratorFunction" === (t.displayName || t.name))
            );
          }),
          (t.mark = function (e) {
            return (
              Object.setPrototypeOf
                ? Object.setPrototypeOf(e, b)
                : ((e.__proto__ = b), c(e, l, "GeneratorFunction")),
              (e.prototype = Object.create(D)),
              e
            );
          }),
          (t.awrap = function (e) {
            return { __await: e };
          }),
          S(_.prototype),
          c(_.prototype, a, function () {
            return this;
          }),
          (t.AsyncIterator = _),
          (t.async = function (e, n, r, i, o) {
            void 0 === o && (o = Promise);
            var s = new _(u(e, n, r, i), o);
            return t.isGeneratorFunction(n)
              ? s
              : s.next().then(function (e) {
                  return e.done ? e.value : s.next();
                });
          }),
          S(D),
          c(D, l, "Generator"),
          c(D, s, function () {
            return this;
          }),
          c(D, "toString", function () {
            return "[object Generator]";
          }),
          (t.keys = function (e) {
            var t = Object(e),
              n = [];
            for (var r in t) n.push(r);
            return (
              n.reverse(),
              function e() {
                for (; n.length; ) {
                  var r = n.pop();
                  if (r in t) return (e.value = r), (e.done = !1), e;
                }
                return (e.done = !0), e;
              }
            );
          }),
          (t.values = I),
          (O.prototype = {
            constructor: O,
            reset: function (t) {
              if (
                ((this.prev = 0),
                (this.next = 0),
                (this.sent = this._sent = e),
                (this.done = !1),
                (this.delegate = null),
                (this.method = "next"),
                (this.arg = e),
                this.tryEntries.forEach(k),
                !t)
              )
                for (var n in this)
                  "t" === n.charAt(0) &&
                    r.call(this, n) &&
                    !isNaN(+n.slice(1)) &&
                    (this[n] = e);
            },
            stop: function () {
              this.done = !0;
              var e = this.tryEntries[0].completion;
              if ("throw" === e.type) throw e.arg;
              return this.rval;
            },
            dispatchException: function (t) {
              if (this.done) throw t;
              var n = this;
              function i(r, i) {
                return (
                  (a.type = "throw"),
                  (a.arg = t),
                  (n.next = r),
                  i && ((n.method = "next"), (n.arg = e)),
                  !!i
                );
              }
              for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                var s = this.tryEntries[o],
                  a = s.completion;
                if ("root" === s.tryLoc) return i("end");
                if (s.tryLoc <= this.prev) {
                  var l = r.call(s, "catchLoc"),
                    c = r.call(s, "finallyLoc");
                  if (l && c) {
                    if (this.prev < s.catchLoc) return i(s.catchLoc, !0);
                    if (this.prev < s.finallyLoc) return i(s.finallyLoc);
                  } else if (l) {
                    if (this.prev < s.catchLoc) return i(s.catchLoc, !0);
                  } else {
                    if (!c)
                      throw Error("try statement without catch or finally");
                    if (this.prev < s.finallyLoc) return i(s.finallyLoc);
                  }
                }
              }
            },
            abrupt: function (e, t) {
              for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                var i = this.tryEntries[n];
                if (
                  i.tryLoc <= this.prev &&
                  r.call(i, "finallyLoc") &&
                  this.prev < i.finallyLoc
                ) {
                  var o = i;
                  break;
                }
              }
              o &&
                ("break" === e || "continue" === e) &&
                o.tryLoc <= t &&
                t <= o.finallyLoc &&
                (o = null);
              var s = o ? o.completion : {};
              return (
                (s.type = e),
                (s.arg = t),
                o
                  ? ((this.method = "next"), (this.next = o.finallyLoc), v)
                  : this.complete(s)
              );
            },
            complete: function (e, t) {
              if ("throw" === e.type) throw e.arg;
              return (
                "break" === e.type || "continue" === e.type
                  ? (this.next = e.arg)
                  : "return" === e.type
                    ? ((this.rval = this.arg = e.arg),
                      (this.method = "return"),
                      (this.next = "end"))
                    : "normal" === e.type && t && (this.next = t),
                v
              );
            },
            finish: function (e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var n = this.tryEntries[t];
                if (n.finallyLoc === e)
                  return this.complete(n.completion, n.afterLoc), k(n), v;
              }
            },
            catch: function (e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var n = this.tryEntries[t];
                if (n.tryLoc === e) {
                  var r = n.completion;
                  if ("throw" === r.type) {
                    var i = r.arg;
                    k(n);
                  }
                  return i;
                }
              }
              throw Error("illegal catch attempt");
            },
            delegateYield: function (t, n, r) {
              return (
                (this.delegate = { iterator: I(t), resultName: n, nextLoc: r }),
                "next" === this.method && (this.arg = e),
                v
              );
            },
          }),
          t
        );
      }
      function O(e, t, n, r, i, o, s) {
        try {
          var a = e[o](s),
            l = a.value;
        } catch (e) {
          return void n(e);
        }
        a.done ? t(l) : Promise.resolve(l).then(r, i);
      }
      function I(e) {
        return function () {
          var t = this,
            n = arguments;
          return new Promise(function (r, i) {
            var o = e.apply(t, n);
            function s(e) {
              O(o, r, i, s, a, "next", e);
            }
            function a(e) {
              O(o, r, i, s, a, "throw", e);
            }
            s(void 0);
          });
        };
      }
      var N = {};
      function P(e) {
        return H.apply(this, arguments);
      }
      function H() {
        return (H = I(
          M().mark(function e(t) {
            var n;
            return M().wrap(
              function (e) {
                for (;;)
                  switch ((e.prev = e.next)) {
                    case 0:
                      return (e.prev = 0), (e.next = 3), fetch(t);
                    case 3:
                      if ((n = e.sent).ok) {
                        e.next = 6;
                        break;
                      }
                      throw new Error("".concat(t, " の取得に失敗しました"));
                    case 6:
                      return (e.next = 8), n.text();
                    case 8:
                      return e.abrupt("return", e.sent.trim().split("\n"));
                    case 11:
                      return (
                        (e.prev = 11),
                        (e.t0 = e.catch(0)),
                        console.error(e.t0.message),
                        e.abrupt("return", [])
                      );
                    case 15:
                    case "end":
                      return e.stop();
                  }
              },
              e,
              null,
              [[0, 11]],
            );
          }),
        )).apply(this, arguments);
      }
      function j(e, t) {
        return L.apply(this, arguments);
      }
      function L() {
        return (
          (L = I(
            M().mark(function e(n, r) {
              var i, o, s, a, l, c, u, d;
              return M().wrap(
                function (e) {
                  for (;;)
                    switch ((e.prev = e.next)) {
                      case 0:
                        for (
                          e.prev = 0, i = t()().year(), N = {}, o = i - n;
                          o <= i + n;
                          o++
                        )
                          for (
                            s = t()("".concat(o, "-01-01")),
                              a = t()("".concat(o, "-12-31")),
                              l = s;
                            l.isSameOrBefore(a);

                          )
                            (c = l.toDate()),
                              (u = x().isHoliday(c)) &&
                                ((d = l.format("YYYY-MM-DD")), (N[d] = u)),
                              (l = l.add(1, "day"));
                        return (
                          r.forEach(function (e) {
                            for (
                              var t = T(e.split("/"), 2),
                                r = t[0],
                                o = t[1],
                                s = i - n;
                              s <= i + n;
                              s++
                            ) {
                              var a = ""
                                .concat(s, "-")
                                .concat(r.padStart(2, "0"), "-")
                                .concat(o.padStart(2, "0"));
                              N[a] = "customholiday";
                            }
                          }),
                          e.abrupt("return", N)
                        );
                      case 8:
                        return (
                          (e.prev = 8),
                          (e.t0 = e.catch(0)),
                          console.error(
                            "祝日データの取得に失敗しました:",
                            e.t0,
                          ),
                          e.abrupt("return", {})
                        );
                      case 12:
                      case "end":
                        return e.stop();
                    }
                },
                e,
                null,
                [[0, 8]],
              );
            }),
          )),
          L.apply(this, arguments)
        );
      }
      function B() {
        return U.apply(this, arguments);
      }
      function U() {
        return (U = I(
          M().mark(function e() {
            var t, n, r, i, o, s, a;
            return M().wrap(
              function (e) {
                for (;;)
                  switch ((e.prev = e.next)) {
                    case 0:
                      return (
                        (e.prev = 0),
                        (e.next = 3),
                        Promise.all([
                          P("./data/holiday.csv"),
                          P("./data/saturday.csv"),
                          P("./data/weekday.csv"),
                        ])
                      );
                    case 3:
                      if (
                        ((t = e.sent),
                        (n = T(t, 3)),
                        (r = n[0]),
                        (i = n[1]),
                        (o = n[2]),
                        (s = r.length) === i.length && s === o.length)
                      ) {
                        e.next = 11;
                        break;
                      }
                      throw new Error("CSVファイルの行数が一致しません");
                    case 11:
                      return (
                        (a = s),
                        e.abrupt("return", {
                          holiday: r,
                          saturday: i,
                          weekday: o,
                          rotationCycleLength: a,
                        })
                      );
                    case 15:
                      throw (
                        ((e.prev = 15),
                        (e.t0 = e.catch(0)),
                        console.error(e.t0.message),
                        e.t0)
                      );
                    case 19:
                    case "end":
                      return e.stop();
                  }
              },
              e,
              null,
              [[0, 15]],
            );
          }),
        )).apply(this, arguments);
      }
      var z,
        W,
        Y,
        F,
        V,
        G,
        Q,
        $,
        q,
        Z = {},
        X = [],
        J = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i;
      function K(e, t) {
        for (var n in t) e[n] = t[n];
        return e;
      }
      function ee(e) {
        var t = e.parentNode;
        t && t.removeChild(e);
      }
      function te(e, t, n) {
        var r,
          i,
          o,
          s = {};
        for (o in t)
          "key" == o ? (r = t[o]) : "ref" == o ? (i = t[o]) : (s[o] = t[o]);
        if (
          (arguments.length > 2 &&
            (s.children = arguments.length > 3 ? z.call(arguments, 2) : n),
          "function" == typeof e && null != e.defaultProps)
        )
          for (o in e.defaultProps)
            void 0 === s[o] && (s[o] = e.defaultProps[o]);
        return ne(e, s, r, i, null);
      }
      function ne(e, t, n, r, i) {
        var o = {
          type: e,
          props: t,
          key: n,
          ref: r,
          __k: null,
          __: null,
          __b: 0,
          __e: null,
          __d: void 0,
          __c: null,
          __h: null,
          constructor: void 0,
          __v: null == i ? ++Y : i,
        };
        return null == i && null != W.vnode && W.vnode(o), o;
      }
      function re(e) {
        return e.children;
      }
      function ie(e, t, n) {
        "-" === t[0]
          ? e.setProperty(t, null == n ? "" : n)
          : (e[t] =
              null == n
                ? ""
                : "number" != typeof n || J.test(t)
                  ? n
                  : n + "px");
      }
      function oe(e, t, n, r, i) {
        var o;
        e: if ("style" === t)
          if ("string" == typeof n) e.style.cssText = n;
          else {
            if (("string" == typeof r && (e.style.cssText = r = ""), r))
              for (t in r) (n && t in n) || ie(e.style, t, "");
            if (n) for (t in n) (r && n[t] === r[t]) || ie(e.style, t, n[t]);
          }
        else if ("o" === t[0] && "n" === t[1])
          (o = t !== (t = t.replace(/Capture$/, ""))),
            (t = t.toLowerCase() in e ? t.toLowerCase().slice(2) : t.slice(2)),
            e.l || (e.l = {}),
            (e.l[t + o] = n),
            n
              ? r || e.addEventListener(t, o ? ae : se, o)
              : e.removeEventListener(t, o ? ae : se, o);
        else if ("dangerouslySetInnerHTML" !== t) {
          if (i) t = t.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
          else if (
            "width" !== t &&
            "height" !== t &&
            "href" !== t &&
            "list" !== t &&
            "form" !== t &&
            "tabIndex" !== t &&
            "download" !== t &&
            t in e
          )
            try {
              e[t] = null == n ? "" : n;
              break e;
            } catch (e) {}
          "function" == typeof n ||
            (null == n || (!1 === n && -1 == t.indexOf("-"))
              ? e.removeAttribute(t)
              : e.setAttribute(t, n));
        }
      }
      function se(e) {
        V = !0;
        try {
          return this.l[e.type + !1](W.event ? W.event(e) : e);
        } finally {
          V = !1;
        }
      }
      function ae(e) {
        V = !0;
        try {
          return this.l[e.type + !0](W.event ? W.event(e) : e);
        } finally {
          V = !1;
        }
      }
      function le(e, t) {
        (this.props = e), (this.context = t);
      }
      function ce(e, t) {
        if (null == t) return e.__ ? ce(e.__, e.__.__k.indexOf(e) + 1) : null;
        for (var n; t < e.__k.length; t++)
          if (null != (n = e.__k[t]) && null != n.__e) return n.__e;
        return "function" == typeof e.type ? ce(e) : null;
      }
      function ue(e) {
        var t, n;
        if (null != (e = e.__) && null != e.__c) {
          for (e.__e = e.__c.base = null, t = 0; t < e.__k.length; t++)
            if (null != (n = e.__k[t]) && null != n.__e) {
              e.__e = e.__c.base = n.__e;
              break;
            }
          return ue(e);
        }
      }
      function de(e) {
        V ? setTimeout(e) : $(e);
      }
      function he(e) {
        ((!e.__d && (e.__d = !0) && G.push(e) && !fe.__r++) ||
          Q !== W.debounceRendering) &&
          ((Q = W.debounceRendering) || de)(fe);
      }
      function fe() {
        var e, t, n, r, i, o, s, a;
        for (
          G.sort(function (e, t) {
            return e.__v.__b - t.__v.__b;
          });
          (e = G.shift());

        )
          e.__d &&
            ((t = G.length),
            (r = void 0),
            (i = void 0),
            (s = (o = (n = e).__v).__e),
            (a = n.__P) &&
              ((r = []),
              ((i = K({}, o)).__v = o.__v + 1),
              be(
                a,
                o,
                i,
                n.__n,
                void 0 !== a.ownerSVGElement,
                null != o.__h ? [s] : null,
                r,
                null == s ? ce(o) : s,
                o.__h,
              ),
              Ee(r, o),
              o.__e != s && ue(o)),
            G.length > t &&
              G.sort(function (e, t) {
                return e.__v.__b - t.__v.__b;
              }));
        fe.__r = 0;
      }
      function pe(e, t, n, r, i, o, s, a, l, c) {
        var u,
          d,
          h,
          f,
          p,
          g,
          v,
          m = (r && r.__k) || X,
          y = m.length;
        for (n.__k = [], u = 0; u < t.length; u++)
          if (
            null !=
            (f = n.__k[u] =
              null == (f = t[u]) || "boolean" == typeof f
                ? null
                : "string" == typeof f ||
                    "number" == typeof f ||
                    "bigint" == typeof f
                  ? ne(null, f, null, null, f)
                  : Array.isArray(f)
                    ? ne(re, { children: f }, null, null, null)
                    : f.__b > 0
                      ? ne(f.type, f.props, f.key, f.ref ? f.ref : null, f.__v)
                      : f)
          ) {
            if (
              ((f.__ = n),
              (f.__b = n.__b + 1),
              null === (h = m[u]) || (h && f.key == h.key && f.type === h.type))
            )
              m[u] = void 0;
            else
              for (d = 0; d < y; d++) {
                if ((h = m[d]) && f.key == h.key && f.type === h.type) {
                  m[d] = void 0;
                  break;
                }
                h = null;
              }
            be(e, f, (h = h || Z), i, o, s, a, l, c),
              (p = f.__e),
              (d = f.ref) &&
                h.ref != d &&
                (v || (v = []),
                h.ref && v.push(h.ref, null, f),
                v.push(d, f.__c || p, f)),
              null != p
                ? (null == g && (g = p),
                  "function" == typeof f.type && f.__k === h.__k
                    ? (f.__d = l = ge(f, l, e))
                    : (l = me(e, f, h, m, p, l)),
                  "function" == typeof n.type && (n.__d = l))
                : l && h.__e == l && l.parentNode != e && (l = ce(h));
          }
        for (n.__e = g, u = y; u--; )
          null != m[u] &&
            ("function" == typeof n.type &&
              null != m[u].__e &&
              m[u].__e == n.__d &&
              (n.__d = ye(r).nextSibling),
            De(m[u], m[u]));
        if (v) for (u = 0; u < v.length; u++) we(v[u], v[++u], v[++u]);
      }
      function ge(e, t, n) {
        for (var r, i = e.__k, o = 0; i && o < i.length; o++)
          (r = i[o]) &&
            ((r.__ = e),
            (t =
              "function" == typeof r.type
                ? ge(r, t, n)
                : me(n, r, r, i, r.__e, t)));
        return t;
      }
      function ve(e, t) {
        return (
          (t = t || []),
          null == e ||
            "boolean" == typeof e ||
            (Array.isArray(e)
              ? e.some(function (e) {
                  ve(e, t);
                })
              : t.push(e)),
          t
        );
      }
      function me(e, t, n, r, i, o) {
        var s, a, l;
        if (void 0 !== t.__d) (s = t.__d), (t.__d = void 0);
        else if (null == n || i != o || null == i.parentNode)
          e: if (null == o || o.parentNode !== e) e.appendChild(i), (s = null);
          else {
            for (a = o, l = 0; (a = a.nextSibling) && l < r.length; l += 1)
              if (a == i) break e;
            e.insertBefore(i, o), (s = o);
          }
        return void 0 !== s ? s : i.nextSibling;
      }
      function ye(e) {
        var t, n, r;
        if (null == e.type || "string" == typeof e.type) return e.__e;
        if (e.__k)
          for (t = e.__k.length - 1; t >= 0; t--)
            if ((n = e.__k[t]) && (r = ye(n))) return r;
        return null;
      }
      function be(e, t, n, r, i, o, s, a, l) {
        var c,
          u,
          d,
          h,
          f,
          p,
          g,
          v,
          m,
          y,
          b,
          E,
          A,
          w,
          D,
          S = t.type;
        if (void 0 !== t.constructor) return null;
        null != n.__h &&
          ((l = n.__h), (a = t.__e = n.__e), (t.__h = null), (o = [a])),
          (c = W.__b) && c(t);
        try {
          e: if ("function" == typeof S) {
            if (
              ((v = t.props),
              (m = (c = S.contextType) && r[c.__c]),
              (y = c ? (m ? m.props.value : c.__) : r),
              n.__c
                ? (g = (u = t.__c = n.__c).__ = u.__E)
                : ("prototype" in S && S.prototype.render
                    ? (t.__c = u = new S(v, y))
                    : ((t.__c = u = new le(v, y)),
                      (u.constructor = S),
                      (u.render = Se)),
                  m && m.sub(u),
                  (u.props = v),
                  u.state || (u.state = {}),
                  (u.context = y),
                  (u.__n = r),
                  (d = u.__d = !0),
                  (u.__h = []),
                  (u._sb = [])),
              null == u.__s && (u.__s = u.state),
              null != S.getDerivedStateFromProps &&
                (u.__s == u.state && (u.__s = K({}, u.__s)),
                K(u.__s, S.getDerivedStateFromProps(v, u.__s))),
              (h = u.props),
              (f = u.state),
              (u.__v = t),
              d)
            )
              null == S.getDerivedStateFromProps &&
                null != u.componentWillMount &&
                u.componentWillMount(),
                null != u.componentDidMount && u.__h.push(u.componentDidMount);
            else {
              if (
                (null == S.getDerivedStateFromProps &&
                  v !== h &&
                  null != u.componentWillReceiveProps &&
                  u.componentWillReceiveProps(v, y),
                (!u.__e &&
                  null != u.shouldComponentUpdate &&
                  !1 === u.shouldComponentUpdate(v, u.__s, y)) ||
                  t.__v === n.__v)
              ) {
                for (
                  t.__v !== n.__v &&
                    ((u.props = v), (u.state = u.__s), (u.__d = !1)),
                    t.__e = n.__e,
                    t.__k = n.__k,
                    t.__k.forEach(function (e) {
                      e && (e.__ = t);
                    }),
                    b = 0;
                  b < u._sb.length;
                  b++
                )
                  u.__h.push(u._sb[b]);
                (u._sb = []), u.__h.length && s.push(u);
                break e;
              }
              null != u.componentWillUpdate &&
                u.componentWillUpdate(v, u.__s, y),
                null != u.componentDidUpdate &&
                  u.__h.push(function () {
                    u.componentDidUpdate(h, f, p);
                  });
            }
            if (
              ((u.context = y),
              (u.props = v),
              (u.__P = e),
              (E = W.__r),
              (A = 0),
              "prototype" in S && S.prototype.render)
            ) {
              for (
                u.state = u.__s,
                  u.__d = !1,
                  E && E(t),
                  c = u.render(u.props, u.state, u.context),
                  w = 0;
                w < u._sb.length;
                w++
              )
                u.__h.push(u._sb[w]);
              u._sb = [];
            } else
              do {
                (u.__d = !1),
                  E && E(t),
                  (c = u.render(u.props, u.state, u.context)),
                  (u.state = u.__s);
              } while (u.__d && ++A < 25);
            (u.state = u.__s),
              null != u.getChildContext &&
                (r = K(K({}, r), u.getChildContext())),
              d ||
                null == u.getSnapshotBeforeUpdate ||
                (p = u.getSnapshotBeforeUpdate(h, f)),
              (D =
                null != c && c.type === re && null == c.key
                  ? c.props.children
                  : c),
              pe(e, Array.isArray(D) ? D : [D], t, n, r, i, o, s, a, l),
              (u.base = t.__e),
              (t.__h = null),
              u.__h.length && s.push(u),
              g && (u.__E = u.__ = null),
              (u.__e = !1);
          } else
            null == o && t.__v === n.__v
              ? ((t.__k = n.__k), (t.__e = n.__e))
              : (t.__e = Ae(n.__e, t, n, r, i, o, s, l));
          (c = W.diffed) && c(t);
        } catch (e) {
          (t.__v = null),
            (l || null != o) &&
              ((t.__e = a), (t.__h = !!l), (o[o.indexOf(a)] = null)),
            W.__e(e, t, n);
        }
      }
      function Ee(e, t) {
        W.__c && W.__c(t, e),
          e.some(function (t) {
            try {
              (e = t.__h),
                (t.__h = []),
                e.some(function (e) {
                  e.call(t);
                });
            } catch (e) {
              W.__e(e, t.__v);
            }
          });
      }
      function Ae(e, t, n, r, i, o, s, a) {
        var l,
          c,
          u,
          d = n.props,
          h = t.props,
          f = t.type,
          p = 0;
        if (("svg" === f && (i = !0), null != o))
          for (; p < o.length; p++)
            if (
              (l = o[p]) &&
              "setAttribute" in l == !!f &&
              (f ? l.localName === f : 3 === l.nodeType)
            ) {
              (e = l), (o[p] = null);
              break;
            }
        if (null == e) {
          if (null === f) return document.createTextNode(h);
          (e = i
            ? document.createElementNS("http://www.w3.org/2000/svg", f)
            : document.createElement(f, h.is && h)),
            (o = null),
            (a = !1);
        }
        if (null === f) d === h || (a && e.data === h) || (e.data = h);
        else {
          if (
            ((o = o && z.call(e.childNodes)),
            (c = (d = n.props || Z).dangerouslySetInnerHTML),
            (u = h.dangerouslySetInnerHTML),
            !a)
          ) {
            if (null != o)
              for (d = {}, p = 0; p < e.attributes.length; p++)
                d[e.attributes[p].name] = e.attributes[p].value;
            (u || c) &&
              ((u &&
                ((c && u.__html == c.__html) || u.__html === e.innerHTML)) ||
                (e.innerHTML = (u && u.__html) || ""));
          }
          if (
            ((function (e, t, n, r, i) {
              var o;
              for (o in n)
                "children" === o ||
                  "key" === o ||
                  o in t ||
                  oe(e, o, null, n[o], r);
              for (o in t)
                (i && "function" != typeof t[o]) ||
                  "children" === o ||
                  "key" === o ||
                  "value" === o ||
                  "checked" === o ||
                  n[o] === t[o] ||
                  oe(e, o, t[o], n[o], r);
            })(e, h, d, i, a),
            u)
          )
            t.__k = [];
          else if (
            ((p = t.props.children),
            pe(
              e,
              Array.isArray(p) ? p : [p],
              t,
              n,
              r,
              i && "foreignObject" !== f,
              o,
              s,
              o ? o[0] : n.__k && ce(n, 0),
              a,
            ),
            null != o)
          )
            for (p = o.length; p--; ) null != o[p] && ee(o[p]);
          a ||
            ("value" in h &&
              void 0 !== (p = h.value) &&
              (p !== e.value ||
                ("progress" === f && !p) ||
                ("option" === f && p !== d.value)) &&
              oe(e, "value", p, d.value, !1),
            "checked" in h &&
              void 0 !== (p = h.checked) &&
              p !== e.checked &&
              oe(e, "checked", p, d.checked, !1));
        }
        return e;
      }
      function we(e, t, n) {
        try {
          "function" == typeof e ? e(t) : (e.current = t);
        } catch (e) {
          W.__e(e, n);
        }
      }
      function De(e, t, n) {
        var r, i;
        if (
          (W.unmount && W.unmount(e),
          (r = e.ref) && ((r.current && r.current !== e.__e) || we(r, null, t)),
          null != (r = e.__c))
        ) {
          if (r.componentWillUnmount)
            try {
              r.componentWillUnmount();
            } catch (e) {
              W.__e(e, t);
            }
          (r.base = r.__P = null), (e.__c = void 0);
        }
        if ((r = e.__k))
          for (i = 0; i < r.length; i++)
            r[i] && De(r[i], t, n || "function" != typeof e.type);
        n || null == e.__e || ee(e.__e), (e.__ = e.__e = e.__d = void 0);
      }
      function Se(e, t, n) {
        return this.constructor(e, n);
      }
      function _e(e, t, n) {
        var r, i, o;
        W.__ && W.__(e, t),
          (i = (r = "function" == typeof n) ? null : (n && n.__k) || t.__k),
          (o = []),
          be(
            t,
            (e = ((!r && n) || t).__k = te(re, null, [e])),
            i || Z,
            Z,
            void 0 !== t.ownerSVGElement,
            !r && n
              ? [n]
              : i
                ? null
                : t.firstChild
                  ? z.call(t.childNodes)
                  : null,
            o,
            !r && n ? n : i ? i.__e : t.firstChild,
            r,
          ),
          Ee(o, e);
      }
      (z = X.slice),
        (W = {
          __e: function (e, t, n, r) {
            for (var i, o, s; (t = t.__); )
              if ((i = t.__c) && !i.__)
                try {
                  if (
                    ((o = i.constructor) &&
                      null != o.getDerivedStateFromError &&
                      (i.setState(o.getDerivedStateFromError(e)), (s = i.__d)),
                    null != i.componentDidCatch &&
                      (i.componentDidCatch(e, r || {}), (s = i.__d)),
                    s)
                  )
                    return (i.__E = i);
                } catch (t) {
                  e = t;
                }
            throw e;
          },
        }),
        (Y = 0),
        (F = function (e) {
          return null != e && void 0 === e.constructor;
        }),
        (V = !1),
        (le.prototype.setState = function (e, t) {
          var n;
          (n =
            null != this.__s && this.__s !== this.state
              ? this.__s
              : (this.__s = K({}, this.state))),
            "function" == typeof e && (e = e(K({}, n), this.props)),
            e && K(n, e),
            null != e && this.__v && (t && this._sb.push(t), he(this));
        }),
        (le.prototype.forceUpdate = function (e) {
          this.__v && ((this.__e = !0), e && this.__h.push(e), he(this));
        }),
        (le.prototype.render = re),
        (G = []),
        ($ =
          "function" == typeof Promise
            ? Promise.prototype.then.bind(Promise.resolve())
            : setTimeout),
        (fe.__r = 0),
        (q = 0);
      var Ce,
        xe,
        Re,
        Te = [],
        ke = [],
        Me = W.__b,
        Oe = W.__r,
        Ie = W.diffed,
        Ne = W.__c,
        Pe = W.unmount;
      function He() {
        for (var e; (e = Te.shift()); )
          if (e.__P && e.__H)
            try {
              e.__H.__h.forEach(Be), e.__H.__h.forEach(Ue), (e.__H.__h = []);
            } catch (t) {
              (e.__H.__h = []), W.__e(t, e.__v);
            }
      }
      (W.__b = function (e) {
        (Ce = null), Me && Me(e);
      }),
        (W.__r = function (e) {
          Oe && Oe(e);
          var t = (Ce = e.__c).__H;
          t &&
            (xe === Ce
              ? ((t.__h = []),
                (Ce.__h = []),
                t.__.forEach(function (e) {
                  e.__N && (e.__ = e.__N), (e.__V = ke), (e.__N = e.i = void 0);
                }))
              : (t.__h.forEach(Be), t.__h.forEach(Ue), (t.__h = []))),
            (xe = Ce);
        }),
        (W.diffed = function (e) {
          Ie && Ie(e);
          var t = e.__c;
          t &&
            t.__H &&
            (t.__H.__h.length &&
              ((1 !== Te.push(t) && Re === W.requestAnimationFrame) ||
                ((Re = W.requestAnimationFrame) || Le)(He)),
            t.__H.__.forEach(function (e) {
              e.i && (e.__H = e.i),
                e.__V !== ke && (e.__ = e.__V),
                (e.i = void 0),
                (e.__V = ke);
            })),
            (xe = Ce = null);
        }),
        (W.__c = function (e, t) {
          t.some(function (e) {
            try {
              e.__h.forEach(Be),
                (e.__h = e.__h.filter(function (e) {
                  return !e.__ || Ue(e);
                }));
            } catch (n) {
              t.some(function (e) {
                e.__h && (e.__h = []);
              }),
                (t = []),
                W.__e(n, e.__v);
            }
          }),
            Ne && Ne(e, t);
        }),
        (W.unmount = function (e) {
          Pe && Pe(e);
          var t,
            n = e.__c;
          n &&
            n.__H &&
            (n.__H.__.forEach(function (e) {
              try {
                Be(e);
              } catch (e) {
                t = e;
              }
            }),
            (n.__H = void 0),
            t && W.__e(t, n.__v));
        });
      var je = "function" == typeof requestAnimationFrame;
      function Le(e) {
        var t,
          n = function () {
            clearTimeout(r), je && cancelAnimationFrame(t), setTimeout(e);
          },
          r = setTimeout(n, 100);
        je && (t = requestAnimationFrame(n));
      }
      function Be(e) {
        var t = Ce,
          n = e.__c;
        "function" == typeof n && ((e.__c = void 0), n()), (Ce = t);
      }
      function Ue(e) {
        var t = Ce;
        (e.__c = e.__()), (Ce = t);
      }
      function ze(e, t) {
        for (var n in e) if ("__source" !== n && !(n in t)) return !0;
        for (var r in t) if ("__source" !== r && e[r] !== t[r]) return !0;
        return !1;
      }
      function We(e) {
        this.props = e;
      }
      ((We.prototype = new le()).isPureReactComponent = !0),
        (We.prototype.shouldComponentUpdate = function (e, t) {
          return ze(this.props, e) || ze(this.state, t);
        });
      var Ye = W.__b;
      (W.__b = function (e) {
        e.type &&
          e.type.__f &&
          e.ref &&
          ((e.props.ref = e.ref), (e.ref = null)),
          Ye && Ye(e);
      }),
        "undefined" != typeof Symbol &&
          Symbol.for &&
          Symbol.for("react.forward_ref");
      var Fe = W.__e;
      W.__e = function (e, t, n, r) {
        if (e.then)
          for (var i, o = t; (o = o.__); )
            if ((i = o.__c) && i.__c)
              return (
                null == t.__e && ((t.__e = n.__e), (t.__k = n.__k)), i.__c(e, t)
              );
        Fe(e, t, n, r);
      };
      var Ve = W.unmount;
      function Ge(e, t, n) {
        return (
          e &&
            (e.__c &&
              e.__c.__H &&
              (e.__c.__H.__.forEach(function (e) {
                "function" == typeof e.__c && e.__c();
              }),
              (e.__c.__H = null)),
            null !=
              (e = (function (e, t) {
                for (var n in t) e[n] = t[n];
                return e;
              })({}, e)).__c &&
              (e.__c.__P === n && (e.__c.__P = t), (e.__c = null)),
            (e.__k =
              e.__k &&
              e.__k.map(function (e) {
                return Ge(e, t, n);
              }))),
          e
        );
      }
      function Qe(e, t, n) {
        return (
          e &&
            ((e.__v = null),
            (e.__k =
              e.__k &&
              e.__k.map(function (e) {
                return Qe(e, t, n);
              })),
            e.__c &&
              e.__c.__P === t &&
              (e.__e && n.insertBefore(e.__e, e.__d),
              (e.__c.__e = !0),
              (e.__c.__P = n))),
          e
        );
      }
      function $e() {
        (this.__u = 0), (this.t = null), (this.__b = null);
      }
      function qe(e) {
        var t = e.__.__c;
        return t && t.__a && t.__a(e);
      }
      function Ze() {
        (this.u = null), (this.o = null);
      }
      (W.unmount = function (e) {
        var t = e.__c;
        t && t.__R && t.__R(),
          t && !0 === e.__h && (e.type = null),
          Ve && Ve(e);
      }),
        (($e.prototype = new le()).__c = function (e, t) {
          var n = t.__c,
            r = this;
          null == r.t && (r.t = []), r.t.push(n);
          var i = qe(r.__v),
            o = !1,
            s = function () {
              o || ((o = !0), (n.__R = null), i ? i(a) : a());
            };
          n.__R = s;
          var a = function () {
              if (!--r.__u) {
                if (r.state.__a) {
                  var e = r.state.__a;
                  r.__v.__k[0] = Qe(e, e.__c.__P, e.__c.__O);
                }
                var t;
                for (r.setState({ __a: (r.__b = null) }); (t = r.t.pop()); )
                  t.forceUpdate();
              }
            },
            l = !0 === t.__h;
          r.__u++ || l || r.setState({ __a: (r.__b = r.__v.__k[0]) }),
            e.then(s, s);
        }),
        ($e.prototype.componentWillUnmount = function () {
          this.t = [];
        }),
        ($e.prototype.render = function (e, t) {
          if (this.__b) {
            if (this.__v.__k) {
              var n = document.createElement("div"),
                r = this.__v.__k[0].__c;
              this.__v.__k[0] = Ge(this.__b, n, (r.__O = r.__P));
            }
            this.__b = null;
          }
          var i = t.__a && te(re, null, e.fallback);
          return (
            i && (i.__h = null), [te(re, null, t.__a ? null : e.children), i]
          );
        });
      var Xe = function (e, t, n) {
        if (
          (++n[1] === n[0] && e.o.delete(t),
          e.props.revealOrder && ("t" !== e.props.revealOrder[0] || !e.o.size))
        )
          for (n = e.u; n; ) {
            for (; n.length > 3; ) n.pop()();
            if (n[1] < n[0]) break;
            e.u = n = n[2];
          }
      };
      function Je(e) {
        return (
          (this.getChildContext = function () {
            return e.context;
          }),
          e.children
        );
      }
      function Ke(e) {
        var t = this,
          n = e.i;
        (t.componentWillUnmount = function () {
          _e(null, t.l), (t.l = null), (t.i = null);
        }),
          t.i && t.i !== n && t.componentWillUnmount(),
          e.__v
            ? (t.l ||
                ((t.i = n),
                (t.l = {
                  nodeType: 1,
                  parentNode: n,
                  childNodes: [],
                  appendChild: function (e) {
                    this.childNodes.push(e), t.i.appendChild(e);
                  },
                  insertBefore: function (e, n) {
                    this.childNodes.push(e), t.i.appendChild(e);
                  },
                  removeChild: function (e) {
                    this.childNodes.splice(this.childNodes.indexOf(e) >>> 1, 1),
                      t.i.removeChild(e);
                  },
                })),
              _e(te(Je, { context: t.context }, e.__v), t.l))
            : t.l && t.componentWillUnmount();
      }
      ((Ze.prototype = new le()).__a = function (e) {
        var t = this,
          n = qe(t.__v),
          r = t.o.get(e);
        return (
          r[0]++,
          function (i) {
            var o = function () {
              t.props.revealOrder ? (r.push(i), Xe(t, e, r)) : i();
            };
            n ? n(o) : o();
          }
        );
      }),
        (Ze.prototype.render = function (e) {
          (this.u = null), (this.o = new Map());
          var t = ve(e.children);
          e.revealOrder && "b" === e.revealOrder[0] && t.reverse();
          for (var n = t.length; n--; )
            this.o.set(t[n], (this.u = [1, 0, this.u]));
          return e.children;
        }),
        (Ze.prototype.componentDidUpdate = Ze.prototype.componentDidMount =
          function () {
            var e = this;
            this.o.forEach(function (t, n) {
              Xe(e, n, t);
            });
          });
      var et =
          ("undefined" != typeof Symbol &&
            Symbol.for &&
            Symbol.for("react.element")) ||
          60103,
        tt =
          /^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,
        nt = "undefined" != typeof document,
        rt = function (e) {
          return (
            "undefined" != typeof Symbol && "symbol" == typeof Symbol()
              ? /fil|che|rad/i
              : /fil|che|ra/i
          ).test(e);
        };
      (le.prototype.isReactComponent = {}),
        [
          "componentWillMount",
          "componentWillReceiveProps",
          "componentWillUpdate",
        ].forEach(function (e) {
          Object.defineProperty(le.prototype, e, {
            configurable: !0,
            get: function () {
              return this["UNSAFE_" + e];
            },
            set: function (t) {
              Object.defineProperty(this, e, {
                configurable: !0,
                writable: !0,
                value: t,
              });
            },
          });
        });
      var it = W.event;
      function ot() {}
      function st() {
        return this.cancelBubble;
      }
      function at() {
        return this.defaultPrevented;
      }
      W.event = function (e) {
        return (
          it && (e = it(e)),
          (e.persist = ot),
          (e.isPropagationStopped = st),
          (e.isDefaultPrevented = at),
          (e.nativeEvent = e)
        );
      };
      var lt = {
          configurable: !0,
          get: function () {
            return this.class;
          },
        },
        ct = W.vnode;
      W.vnode = function (e) {
        var t = e.type,
          n = e.props,
          r = n;
        if ("string" == typeof t) {
          var i = -1 === t.indexOf("-");
          for (var o in ((r = {}), n)) {
            var s = n[o];
            (nt && "children" === o && "noscript" === t) ||
              ("value" === o && "defaultValue" in n && null == s) ||
              ("defaultValue" === o && "value" in n && null == n.value
                ? (o = "value")
                : "download" === o && !0 === s
                  ? (s = "")
                  : /ondoubleclick/i.test(o)
                    ? (o = "ondblclick")
                    : /^onchange(textarea|input)/i.test(o + t) && !rt(n.type)
                      ? (o = "oninput")
                      : /^onfocus$/i.test(o)
                        ? (o = "onfocusin")
                        : /^onblur$/i.test(o)
                          ? (o = "onfocusout")
                          : /^on(Ani|Tra|Tou|BeforeInp|Compo)/.test(o)
                            ? (o = o.toLowerCase())
                            : i && tt.test(o)
                              ? (o = o
                                  .replace(/[A-Z0-9]/g, "-$&")
                                  .toLowerCase())
                              : null === s && (s = void 0),
              /^oninput$/i.test(o) &&
                ((o = o.toLowerCase()), r[o] && (o = "oninputCapture")),
              (r[o] = s));
          }
          "select" == t &&
            r.multiple &&
            Array.isArray(r.value) &&
            (r.value = ve(n.children).forEach(function (e) {
              e.props.selected = -1 != r.value.indexOf(e.props.value);
            })),
            "select" == t &&
              null != r.defaultValue &&
              (r.value = ve(n.children).forEach(function (e) {
                e.props.selected = r.multiple
                  ? -1 != r.defaultValue.indexOf(e.props.value)
                  : r.defaultValue == e.props.value;
              })),
            (e.props = r),
            n.class != n.className &&
              ((lt.enumerable = "className" in n),
              null != n.className && (r.class = n.className),
              Object.defineProperty(r, "className", lt));
        }
        (e.$$typeof = et), ct && ct(e);
      };
      var ut = W.__r;
      W.__r = function (e) {
        ut && ut(e), e.__c;
      };
      const dt = [],
        ht = new Map();
      function ft(e) {
        dt.push(e),
          ht.forEach((t) => {
            gt(t, e);
          });
      }
      function pt(e) {
        let t = ht.get(e);
        if (!t || !t.isConnected) {
          if (((t = e.querySelector("style[data-fullcalendar]")), !t)) {
            (t = document.createElement("style")),
              t.setAttribute("data-fullcalendar", "");
            const n =
              (void 0 === vt &&
                (vt = (function () {
                  const e = document.querySelector('meta[name="csp-nonce"]');
                  if (e && e.hasAttribute("content"))
                    return e.getAttribute("content");
                  const t = document.querySelector("script[nonce]");
                  return (t && t.nonce) || "";
                })()),
              vt);
            n && (t.nonce = n);
            const r = e === document ? document.head : e,
              i =
                e === document
                  ? r.querySelector(
                      "script,link[rel=stylesheet],link[as=style],style",
                    )
                  : r.firstChild;
            r.insertBefore(t, i);
          }
          ht.set(e, t),
            (function (e) {
              for (const t of dt) gt(e, t);
            })(t);
        }
      }
      function gt(e, t) {
        const { sheet: n } = e,
          r = n.cssRules.length;
        t.split("}").forEach((e, t) => {
          (e = e.trim()) && n.insertRule(e + "}", r + t);
        });
      }
      let vt;
      "undefined" != typeof document && pt(document),
        ft(
          ':root{--fc-small-font-size:.85em;--fc-page-bg-color:#fff;--fc-neutral-bg-color:hsla(0,0%,82%,.3);--fc-neutral-text-color:grey;--fc-border-color:#ddd;--fc-button-text-color:#fff;--fc-button-bg-color:#2c3e50;--fc-button-border-color:#2c3e50;--fc-button-hover-bg-color:#1e2b37;--fc-button-hover-border-color:#1a252f;--fc-button-active-bg-color:#1a252f;--fc-button-active-border-color:#151e27;--fc-event-bg-color:#3788d8;--fc-event-border-color:#3788d8;--fc-event-text-color:#fff;--fc-event-selected-overlay-color:rgba(0,0,0,.25);--fc-more-link-bg-color:#d0d0d0;--fc-more-link-text-color:inherit;--fc-event-resizer-thickness:8px;--fc-event-resizer-dot-total-width:8px;--fc-event-resizer-dot-border-width:1px;--fc-non-business-color:hsla(0,0%,84%,.3);--fc-bg-event-color:#8fdf82;--fc-bg-event-opacity:0.3;--fc-highlight-color:rgba(188,232,241,.3);--fc-today-bg-color:rgba(255,220,40,.15);--fc-now-indicator-color:red}.fc-not-allowed,.fc-not-allowed .fc-event{cursor:not-allowed}.fc{display:flex;flex-direction:column;font-size:1em}.fc,.fc *,.fc :after,.fc :before{box-sizing:border-box}.fc table{border-collapse:collapse;border-spacing:0;font-size:1em}.fc th{text-align:center}.fc td,.fc th{padding:0;vertical-align:top}.fc a[data-navlink]{cursor:pointer}.fc a[data-navlink]:hover{text-decoration:underline}.fc-direction-ltr{direction:ltr;text-align:left}.fc-direction-rtl{direction:rtl;text-align:right}.fc-theme-standard td,.fc-theme-standard th{border:1px solid var(--fc-border-color)}.fc-liquid-hack td,.fc-liquid-hack th{position:relative}@font-face{font-family:fcicons;font-style:normal;font-weight:400;src:url("data:application/x-font-ttf;charset=utf-8;base64,AAEAAAALAIAAAwAwT1MvMg8SBfAAAAC8AAAAYGNtYXAXVtKNAAABHAAAAFRnYXNwAAAAEAAAAXAAAAAIZ2x5ZgYydxIAAAF4AAAFNGhlYWQUJ7cIAAAGrAAAADZoaGVhB20DzAAABuQAAAAkaG10eCIABhQAAAcIAAAALGxvY2ED4AU6AAAHNAAAABhtYXhwAA8AjAAAB0wAAAAgbmFtZXsr690AAAdsAAABhnBvc3QAAwAAAAAI9AAAACAAAwPAAZAABQAAApkCzAAAAI8CmQLMAAAB6wAzAQkAAAAAAAAAAAAAAAAAAAABEAAAAAAAAAAAAAAAAAAAAABAAADpBgPA/8AAQAPAAEAAAAABAAAAAAAAAAAAAAAgAAAAAAADAAAAAwAAABwAAQADAAAAHAADAAEAAAAcAAQAOAAAAAoACAACAAIAAQAg6Qb//f//AAAAAAAg6QD//f//AAH/4xcEAAMAAQAAAAAAAAAAAAAAAQAB//8ADwABAAAAAAAAAAAAAgAANzkBAAAAAAEAAAAAAAAAAAACAAA3OQEAAAAAAQAAAAAAAAAAAAIAADc5AQAAAAABAWIAjQKeAskAEwAAJSc3NjQnJiIHAQYUFwEWMjc2NCcCnuLiDQ0MJAz/AA0NAQAMJAwNDcni4gwjDQwM/wANIwz/AA0NDCMNAAAAAQFiAI0CngLJABMAACUBNjQnASYiBwYUHwEHBhQXFjI3AZ4BAA0N/wAMJAwNDeLiDQ0MJAyNAQAMIw0BAAwMDSMM4uINIwwNDQAAAAIA4gC3Ax4CngATACcAACUnNzY0JyYiDwEGFB8BFjI3NjQnISc3NjQnJiIPAQYUHwEWMjc2NCcB87e3DQ0MIw3VDQ3VDSMMDQ0BK7e3DQ0MJAzVDQ3VDCQMDQ3zuLcMJAwNDdUNIwzWDAwNIwy4twwkDA0N1Q0jDNYMDA0jDAAAAgDiALcDHgKeABMAJwAAJTc2NC8BJiIHBhQfAQcGFBcWMjchNzY0LwEmIgcGFB8BBwYUFxYyNwJJ1Q0N1Q0jDA0Nt7cNDQwjDf7V1Q0N1QwkDA0Nt7cNDQwkDLfWDCMN1Q0NDCQMt7gMIw0MDNYMIw3VDQ0MJAy3uAwjDQwMAAADAFUAAAOrA1UAMwBoAHcAABMiBgcOAQcOAQcOARURFBYXHgEXHgEXHgEzITI2Nz4BNz4BNz4BNRE0JicuAScuAScuASMFITIWFx4BFx4BFx4BFREUBgcOAQcOAQcOASMhIiYnLgEnLgEnLgE1ETQ2Nz4BNz4BNz4BMxMhMjY1NCYjISIGFRQWM9UNGAwLFQkJDgUFBQUFBQ4JCRULDBgNAlYNGAwLFQkJDgUFBQUFBQ4JCRULDBgN/aoCVgQIBAQHAwMFAQIBAQIBBQMDBwQECAT9qgQIBAQHAwMFAQIBAQIBBQMDBwQECASAAVYRGRkR/qoRGRkRA1UFBAUOCQkVDAsZDf2rDRkLDBUJCA4FBQUFBQUOCQgVDAsZDQJVDRkLDBUJCQ4FBAVVAgECBQMCBwQECAX9qwQJAwQHAwMFAQICAgIBBQMDBwQDCQQCVQUIBAQHAgMFAgEC/oAZEhEZGRESGQAAAAADAFUAAAOrA1UAMwBoAIkAABMiBgcOAQcOAQcOARURFBYXHgEXHgEXHgEzITI2Nz4BNz4BNz4BNRE0JicuAScuAScuASMFITIWFx4BFx4BFx4BFREUBgcOAQcOAQcOASMhIiYnLgEnLgEnLgE1ETQ2Nz4BNz4BNz4BMxMzFRQWMzI2PQEzMjY1NCYrATU0JiMiBh0BIyIGFRQWM9UNGAwLFQkJDgUFBQUFBQ4JCRULDBgNAlYNGAwLFQkJDgUFBQUFBQ4JCRULDBgN/aoCVgQIBAQHAwMFAQIBAQIBBQMDBwQECAT9qgQIBAQHAwMFAQIBAQIBBQMDBwQECASAgBkSEhmAERkZEYAZEhIZgBEZGREDVQUEBQ4JCRUMCxkN/asNGQsMFQkIDgUFBQUFBQ4JCBUMCxkNAlUNGQsMFQkJDgUEBVUCAQIFAwIHBAQIBf2rBAkDBAcDAwUBAgICAgEFAwMHBAMJBAJVBQgEBAcCAwUCAQL+gIASGRkSgBkSERmAEhkZEoAZERIZAAABAOIAjQMeAskAIAAAExcHBhQXFjI/ARcWMjc2NC8BNzY0JyYiDwEnJiIHBhQX4uLiDQ0MJAzi4gwkDA0N4uINDQwkDOLiDCQMDQ0CjeLiDSMMDQ3h4Q0NDCMN4uIMIw0MDOLiDAwNIwwAAAABAAAAAQAAa5n0y18PPPUACwQAAAAAANivOVsAAAAA2K85WwAAAAADqwNVAAAACAACAAAAAAAAAAEAAAPA/8AAAAQAAAAAAAOrAAEAAAAAAAAAAAAAAAAAAAALBAAAAAAAAAAAAAAAAgAAAAQAAWIEAAFiBAAA4gQAAOIEAABVBAAAVQQAAOIAAAAAAAoAFAAeAEQAagCqAOoBngJkApoAAQAAAAsAigADAAAAAAACAAAAAAAAAAAAAAAAAAAAAAAAAA4ArgABAAAAAAABAAcAAAABAAAAAAACAAcAYAABAAAAAAADAAcANgABAAAAAAAEAAcAdQABAAAAAAAFAAsAFQABAAAAAAAGAAcASwABAAAAAAAKABoAigADAAEECQABAA4ABwADAAEECQACAA4AZwADAAEECQADAA4APQADAAEECQAEAA4AfAADAAEECQAFABYAIAADAAEECQAGAA4AUgADAAEECQAKADQApGZjaWNvbnMAZgBjAGkAYwBvAG4Ac1ZlcnNpb24gMS4wAFYAZQByAHMAaQBvAG4AIAAxAC4AMGZjaWNvbnMAZgBjAGkAYwBvAG4Ac2ZjaWNvbnMAZgBjAGkAYwBvAG4Ac1JlZ3VsYXIAUgBlAGcAdQBsAGEAcmZjaWNvbnMAZgBjAGkAYwBvAG4Ac0ZvbnQgZ2VuZXJhdGVkIGJ5IEljb01vb24uAEYAbwBuAHQAIABnAGUAbgBlAHIAYQB0AGUAZAAgAGIAeQAgAEkAYwBvAE0AbwBvAG4ALgAAAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=") format("truetype")}.fc-icon{speak:none;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;display:inline-block;font-family:fcicons!important;font-style:normal;font-variant:normal;font-weight:400;height:1em;line-height:1;text-align:center;text-transform:none;-moz-user-select:none;user-select:none;width:1em}.fc-icon-chevron-left:before{content:"\\e900"}.fc-icon-chevron-right:before{content:"\\e901"}.fc-icon-chevrons-left:before{content:"\\e902"}.fc-icon-chevrons-right:before{content:"\\e903"}.fc-icon-minus-square:before{content:"\\e904"}.fc-icon-plus-square:before{content:"\\e905"}.fc-icon-x:before{content:"\\e906"}.fc .fc-button{border-radius:0;font-family:inherit;font-size:inherit;line-height:inherit;margin:0;overflow:visible;text-transform:none}.fc .fc-button:focus{outline:1px dotted;outline:5px auto -webkit-focus-ring-color}.fc .fc-button{-webkit-appearance:button}.fc .fc-button:not(:disabled){cursor:pointer}.fc .fc-button{background-color:transparent;border:1px solid transparent;border-radius:.25em;display:inline-block;font-size:1em;font-weight:400;line-height:1.5;padding:.4em .65em;text-align:center;-moz-user-select:none;user-select:none;vertical-align:middle}.fc .fc-button:hover{text-decoration:none}.fc .fc-button:focus{box-shadow:0 0 0 .2rem rgba(44,62,80,.25);outline:0}.fc .fc-button:disabled{opacity:.65}.fc .fc-button-primary{background-color:var(--fc-button-bg-color);border-color:var(--fc-button-border-color);color:var(--fc-button-text-color)}.fc .fc-button-primary:hover{background-color:var(--fc-button-hover-bg-color);border-color:var(--fc-button-hover-border-color);color:var(--fc-button-text-color)}.fc .fc-button-primary:disabled{background-color:var(--fc-button-bg-color);border-color:var(--fc-button-border-color);color:var(--fc-button-text-color)}.fc .fc-button-primary:focus{box-shadow:0 0 0 .2rem rgba(76,91,106,.5)}.fc .fc-button-primary:not(:disabled).fc-button-active,.fc .fc-button-primary:not(:disabled):active{background-color:var(--fc-button-active-bg-color);border-color:var(--fc-button-active-border-color);color:var(--fc-button-text-color)}.fc .fc-button-primary:not(:disabled).fc-button-active:focus,.fc .fc-button-primary:not(:disabled):active:focus{box-shadow:0 0 0 .2rem rgba(76,91,106,.5)}.fc .fc-button .fc-icon{font-size:1.5em;vertical-align:middle}.fc .fc-button-group{display:inline-flex;position:relative;vertical-align:middle}.fc .fc-button-group>.fc-button{flex:1 1 auto;position:relative}.fc .fc-button-group>.fc-button.fc-button-active,.fc .fc-button-group>.fc-button:active,.fc .fc-button-group>.fc-button:focus,.fc .fc-button-group>.fc-button:hover{z-index:1}.fc-direction-ltr .fc-button-group>.fc-button:not(:first-child){border-bottom-left-radius:0;border-top-left-radius:0;margin-left:-1px}.fc-direction-ltr .fc-button-group>.fc-button:not(:last-child){border-bottom-right-radius:0;border-top-right-radius:0}.fc-direction-rtl .fc-button-group>.fc-button:not(:first-child){border-bottom-right-radius:0;border-top-right-radius:0;margin-right:-1px}.fc-direction-rtl .fc-button-group>.fc-button:not(:last-child){border-bottom-left-radius:0;border-top-left-radius:0}.fc .fc-toolbar{align-items:center;display:flex;justify-content:space-between}.fc .fc-toolbar.fc-header-toolbar{margin-bottom:1.5em}.fc .fc-toolbar.fc-footer-toolbar{margin-top:1.5em}.fc .fc-toolbar-title{font-size:1.75em;margin:0}.fc-direction-ltr .fc-toolbar>*>:not(:first-child){margin-left:.75em}.fc-direction-rtl .fc-toolbar>*>:not(:first-child){margin-right:.75em}.fc-direction-rtl .fc-toolbar-ltr{flex-direction:row-reverse}.fc .fc-scroller{-webkit-overflow-scrolling:touch;position:relative}.fc .fc-scroller-liquid{height:100%}.fc .fc-scroller-liquid-absolute{bottom:0;left:0;position:absolute;right:0;top:0}.fc .fc-scroller-harness{direction:ltr;overflow:hidden;position:relative}.fc .fc-scroller-harness-liquid{height:100%}.fc-direction-rtl .fc-scroller-harness>.fc-scroller{direction:rtl}.fc-theme-standard .fc-scrollgrid{border:1px solid var(--fc-border-color)}.fc .fc-scrollgrid,.fc .fc-scrollgrid table{table-layout:fixed;width:100%}.fc .fc-scrollgrid table{border-left-style:hidden;border-right-style:hidden;border-top-style:hidden}.fc .fc-scrollgrid{border-bottom-width:0;border-collapse:separate;border-right-width:0}.fc .fc-scrollgrid-liquid{height:100%}.fc .fc-scrollgrid-section,.fc .fc-scrollgrid-section table,.fc .fc-scrollgrid-section>td{height:1px}.fc .fc-scrollgrid-section-liquid>td{height:100%}.fc .fc-scrollgrid-section>*{border-left-width:0;border-top-width:0}.fc .fc-scrollgrid-section-footer>*,.fc .fc-scrollgrid-section-header>*{border-bottom-width:0}.fc .fc-scrollgrid-section-body table,.fc .fc-scrollgrid-section-footer table{border-bottom-style:hidden}.fc .fc-scrollgrid-section-sticky>*{background:var(--fc-page-bg-color);position:sticky;z-index:3}.fc .fc-scrollgrid-section-header.fc-scrollgrid-section-sticky>*{top:0}.fc .fc-scrollgrid-section-footer.fc-scrollgrid-section-sticky>*{bottom:0}.fc .fc-scrollgrid-sticky-shim{height:1px;margin-bottom:-1px}.fc-sticky{position:sticky}.fc .fc-view-harness{flex-grow:1;position:relative}.fc .fc-view-harness-active>.fc-view{bottom:0;left:0;position:absolute;right:0;top:0}.fc .fc-col-header-cell-cushion{display:inline-block;padding:2px 4px}.fc .fc-bg-event,.fc .fc-highlight,.fc .fc-non-business{bottom:0;left:0;position:absolute;right:0;top:0}.fc .fc-non-business{background:var(--fc-non-business-color)}.fc .fc-bg-event{background:var(--fc-bg-event-color);opacity:var(--fc-bg-event-opacity)}.fc .fc-bg-event .fc-event-title{font-size:var(--fc-small-font-size);font-style:italic;margin:.5em}.fc .fc-highlight{background:var(--fc-highlight-color)}.fc .fc-cell-shaded,.fc .fc-day-disabled{background:var(--fc-neutral-bg-color)}a.fc-event,a.fc-event:hover{text-decoration:none}.fc-event.fc-event-draggable,.fc-event[href]{cursor:pointer}.fc-event .fc-event-main{position:relative;z-index:2}.fc-event-dragging:not(.fc-event-selected){opacity:.75}.fc-event-dragging.fc-event-selected{box-shadow:0 2px 7px rgba(0,0,0,.3)}.fc-event .fc-event-resizer{display:none;position:absolute;z-index:4}.fc-event-selected .fc-event-resizer,.fc-event:hover .fc-event-resizer{display:block}.fc-event-selected .fc-event-resizer{background:var(--fc-page-bg-color);border-color:inherit;border-radius:calc(var(--fc-event-resizer-dot-total-width)/2);border-style:solid;border-width:var(--fc-event-resizer-dot-border-width);height:var(--fc-event-resizer-dot-total-width);width:var(--fc-event-resizer-dot-total-width)}.fc-event-selected .fc-event-resizer:before{bottom:-20px;content:"";left:-20px;position:absolute;right:-20px;top:-20px}.fc-event-selected,.fc-event:focus{box-shadow:0 2px 5px rgba(0,0,0,.2)}.fc-event-selected:before,.fc-event:focus:before{bottom:0;content:"";left:0;position:absolute;right:0;top:0;z-index:3}.fc-event-selected:after,.fc-event:focus:after{background:var(--fc-event-selected-overlay-color);bottom:-1px;content:"";left:-1px;position:absolute;right:-1px;top:-1px;z-index:1}.fc-h-event{background-color:var(--fc-event-bg-color);border:1px solid var(--fc-event-border-color);display:block}.fc-h-event .fc-event-main{color:var(--fc-event-text-color)}.fc-h-event .fc-event-main-frame{display:flex}.fc-h-event .fc-event-time{max-width:100%;overflow:hidden}.fc-h-event .fc-event-title-container{flex-grow:1;flex-shrink:1;min-width:0}.fc-h-event .fc-event-title{display:inline-block;left:0;max-width:100%;overflow:hidden;right:0;vertical-align:top}.fc-h-event.fc-event-selected:before{bottom:-10px;top:-10px}.fc-direction-ltr .fc-daygrid-block-event:not(.fc-event-start),.fc-direction-rtl .fc-daygrid-block-event:not(.fc-event-end){border-bottom-left-radius:0;border-left-width:0;border-top-left-radius:0}.fc-direction-ltr .fc-daygrid-block-event:not(.fc-event-end),.fc-direction-rtl .fc-daygrid-block-event:not(.fc-event-start){border-bottom-right-radius:0;border-right-width:0;border-top-right-radius:0}.fc-h-event:not(.fc-event-selected) .fc-event-resizer{bottom:0;top:0;width:var(--fc-event-resizer-thickness)}.fc-direction-ltr .fc-h-event:not(.fc-event-selected) .fc-event-resizer-start,.fc-direction-rtl .fc-h-event:not(.fc-event-selected) .fc-event-resizer-end{cursor:w-resize;left:calc(var(--fc-event-resizer-thickness)*-.5)}.fc-direction-ltr .fc-h-event:not(.fc-event-selected) .fc-event-resizer-end,.fc-direction-rtl .fc-h-event:not(.fc-event-selected) .fc-event-resizer-start{cursor:e-resize;right:calc(var(--fc-event-resizer-thickness)*-.5)}.fc-h-event.fc-event-selected .fc-event-resizer{margin-top:calc(var(--fc-event-resizer-dot-total-width)*-.5);top:50%}.fc-direction-ltr .fc-h-event.fc-event-selected .fc-event-resizer-start,.fc-direction-rtl .fc-h-event.fc-event-selected .fc-event-resizer-end{left:calc(var(--fc-event-resizer-dot-total-width)*-.5)}.fc-direction-ltr .fc-h-event.fc-event-selected .fc-event-resizer-end,.fc-direction-rtl .fc-h-event.fc-event-selected .fc-event-resizer-start{right:calc(var(--fc-event-resizer-dot-total-width)*-.5)}.fc .fc-popover{box-shadow:0 2px 6px rgba(0,0,0,.15);position:absolute;z-index:9999}.fc .fc-popover-header{align-items:center;display:flex;flex-direction:row;justify-content:space-between;padding:3px 4px}.fc .fc-popover-title{margin:0 2px}.fc .fc-popover-close{cursor:pointer;font-size:1.1em;opacity:.65}.fc-theme-standard .fc-popover{background:var(--fc-page-bg-color);border:1px solid var(--fc-border-color)}.fc-theme-standard .fc-popover-header{background:var(--fc-neutral-bg-color)}',
        );
      class mt {
        constructor(e) {
          (this.drainedOption = e),
            (this.isRunning = !1),
            (this.isDirty = !1),
            (this.pauseDepths = {}),
            (this.timeoutId = 0);
        }
        request(e) {
          (this.isDirty = !0),
            this.isPaused() ||
              (this.clearTimeout(),
              null == e
                ? this.tryDrain()
                : (this.timeoutId = setTimeout(this.tryDrain.bind(this), e)));
        }
        pause(e = "") {
          let { pauseDepths: t } = this;
          (t[e] = (t[e] || 0) + 1), this.clearTimeout();
        }
        resume(e = "", t) {
          let { pauseDepths: n } = this;
          e in n &&
            (t ? delete n[e] : ((n[e] -= 1), n[e] <= 0 && delete n[e]),
            this.tryDrain());
        }
        isPaused() {
          return Object.keys(this.pauseDepths).length;
        }
        tryDrain() {
          if (!this.isRunning && !this.isPaused()) {
            for (this.isRunning = !0; this.isDirty; )
              (this.isDirty = !1), this.drained();
            this.isRunning = !1;
          }
        }
        clear() {
          this.clearTimeout(), (this.isDirty = !1), (this.pauseDepths = {});
        }
        clearTimeout() {
          this.timeoutId &&
            (clearTimeout(this.timeoutId), (this.timeoutId = 0));
        }
        drained() {
          this.drainedOption && this.drainedOption();
        }
      }
      function yt(e) {
        e.parentNode && e.parentNode.removeChild(e);
      }
      function bt(e, t) {
        if (e.closest) return e.closest(t);
        if (!document.documentElement.contains(e)) return null;
        do {
          if (Et(e, t)) return e;
          e = e.parentElement || e.parentNode;
        } while (null !== e && 1 === e.nodeType);
        return null;
      }
      function Et(e, t) {
        return (e.matches || e.matchesSelector || e.msMatchesSelector).call(
          e,
          t,
        );
      }
      const At = /(top|left|right|bottom|width|height)$/i;
      function wt(e, t) {
        for (let n in t) Dt(e, n, t[n]);
      }
      function Dt(e, t, n) {
        null == n
          ? (e.style[t] = "")
          : "number" == typeof n && At.test(t)
            ? (e.style[t] = `${n}px`)
            : (e.style[t] = n);
      }
      function St(e) {
        var t, n;
        return null !==
          (n =
            null === (t = e.composedPath) || void 0 === t
              ? void 0
              : t.call(e)[0]) && void 0 !== n
          ? n
          : e.target;
      }
      let _t = 0;
      function Ct() {
        return (_t += 1), "fc-dom-" + _t;
      }
      function xt(e) {
        e.preventDefault();
      }
      function Rt(e, t, n, r) {
        let i = (function (e, t) {
          return (n) => {
            let r = bt(n.target, e);
            r && t.call(r, n, r);
          };
        })(n, r);
        return (
          e.addEventListener(t, i),
          () => {
            e.removeEventListener(t, i);
          }
        );
      }
      const Tt = [
        "webkitTransitionEnd",
        "otransitionend",
        "oTransitionEnd",
        "msTransitionEnd",
        "transitionend",
      ];
      function kt(e) {
        return Object.assign({ onClick: e }, Mt(e));
      }
      function Mt(e) {
        return {
          tabIndex: 0,
          onKeyDown(t) {
            ("Enter" !== t.key && " " !== t.key) || (e(t), t.preventDefault());
          },
        };
      }
      let Ot = 0;
      function It() {
        return (Ot += 1), String(Ot);
      }
      function Nt() {
        document.body.classList.add("fc-not-allowed");
      }
      function Pt() {
        document.body.classList.remove("fc-not-allowed");
      }
      function Ht(e, t, n) {
        return n.func
          ? n.func(e, t)
          : (function (e, t) {
              return e || t
                ? null == t
                  ? -1
                  : null == e
                    ? 1
                    : "string" == typeof e || "string" == typeof t
                      ? String(e).localeCompare(String(t))
                      : e - t
                : 0;
            })(e[n.field], t[n.field]) * (n.order || 1);
      }
      function jt(e, t) {
        let n = String(e);
        return "000".substr(0, t - n.length) + n;
      }
      function Lt(e, t, n) {
        return "function" == typeof e
          ? e(...t)
          : "string" == typeof e
            ? t.reduce((e, t, n) => e.replace("$" + n, t || ""), e)
            : n;
      }
      function Bt(e, t) {
        return e - t;
      }
      function Ut(e) {
        return e % 1 == 0;
      }
      function zt(e) {
        let t = e.querySelector(".fc-scrollgrid-shrink-frame"),
          n = e.querySelector(".fc-scrollgrid-shrink-cushion");
        if (!t) throw new Error("needs fc-scrollgrid-shrink-frame className");
        if (!n) throw new Error("needs fc-scrollgrid-shrink-cushion className");
        return (
          e.getBoundingClientRect().width -
          t.getBoundingClientRect().width +
          n.getBoundingClientRect().width
        );
      }
      const Wt = /^(-?)(?:(\d+)\.)?(\d+):(\d\d)(?::(\d\d)(?:\.(\d\d\d))?)?/;
      function Yt(e, t) {
        return "string" == typeof e
          ? (function (e) {
              let t = Wt.exec(e);
              if (t) {
                let e = t[1] ? -1 : 1;
                return {
                  years: 0,
                  months: 0,
                  days: e * (t[2] ? parseInt(t[2], 10) : 0),
                  milliseconds:
                    e *
                    (60 * (t[3] ? parseInt(t[3], 10) : 0) * 60 * 1e3 +
                      60 * (t[4] ? parseInt(t[4], 10) : 0) * 1e3 +
                      1e3 * (t[5] ? parseInt(t[5], 10) : 0) +
                      (t[6] ? parseInt(t[6], 10) : 0)),
                };
              }
              return null;
            })(e)
          : "object" == typeof e && e
            ? Ft(e)
            : "number" == typeof e
              ? Ft({ [t || "milliseconds"]: e })
              : null;
      }
      function Ft(e) {
        let t = {
            years: e.years || e.year || 0,
            months: e.months || e.month || 0,
            days: e.days || e.day || 0,
            milliseconds:
              60 * (e.hours || e.hour || 0) * 60 * 1e3 +
              60 * (e.minutes || e.minute || 0) * 1e3 +
              1e3 * (e.seconds || e.second || 0) +
              (e.milliseconds || e.millisecond || e.ms || 0),
          },
          n = e.weeks || e.week;
        return n && ((t.days += 7 * n), (t.specifiedWeeks = !0)), t;
      }
      function Vt(e) {
        return Gt(e) / 864e5;
      }
      function Gt(e) {
        return (
          31536e6 * e.years +
          2592e6 * e.months +
          864e5 * e.days +
          e.milliseconds
        );
      }
      function Qt(e) {
        let t = e.milliseconds;
        if (t) {
          if (t % 1e3 != 0) return { unit: "millisecond", value: t };
          if (t % 6e4 != 0) return { unit: "second", value: t / 1e3 };
          if (t % 36e5 != 0) return { unit: "minute", value: t / 6e4 };
          if (t) return { unit: "hour", value: t / 36e5 };
        }
        return e.days
          ? e.specifiedWeeks && e.days % 7 == 0
            ? { unit: "week", value: e.days / 7 }
            : { unit: "day", value: e.days }
          : e.months
            ? { unit: "month", value: e.months }
            : e.years
              ? { unit: "year", value: e.years }
              : { unit: "millisecond", value: 0 };
      }
      function $t(e, t, n) {
        if (e === t) return !0;
        let r,
          i = e.length;
        if (i !== t.length) return !1;
        for (r = 0; r < i; r += 1)
          if (!(n ? n(e[r], t[r]) : e[r] === t[r])) return !1;
        return !0;
      }
      const qt = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
      function Zt(e, t) {
        let n = an(e);
        return (n[2] += 7 * t), ln(n);
      }
      function Xt(e, t) {
        let n = an(e);
        return (n[2] += t), ln(n);
      }
      function Jt(e, t) {
        let n = an(e);
        return (n[6] += t), ln(n);
      }
      function Kt(e, t) {
        return (t.valueOf() - e.valueOf()) / 864e5;
      }
      function en(e, t) {
        return un(e) === un(t) ? Math.round(Kt(e, t)) : null;
      }
      function tn(e) {
        return ln([e.getUTCFullYear(), e.getUTCMonth(), e.getUTCDate()]);
      }
      function nn(e, t, n, r) {
        let i = ln([t, 0, 1 + rn(t, n, r)]),
          o = tn(e),
          s = Math.round(Kt(i, o));
        return Math.floor(s / 7) + 1;
      }
      function rn(e, t, n) {
        let r = 7 + t - n;
        return (-(7 + ln([e, 0, r]).getUTCDay() - t) % 7) + r - 1;
      }
      function on(e) {
        return [
          e.getFullYear(),
          e.getMonth(),
          e.getDate(),
          e.getHours(),
          e.getMinutes(),
          e.getSeconds(),
          e.getMilliseconds(),
        ];
      }
      function sn(e) {
        return new Date(
          e[0],
          e[1] || 0,
          null == e[2] ? 1 : e[2],
          e[3] || 0,
          e[4] || 0,
          e[5] || 0,
        );
      }
      function an(e) {
        return [
          e.getUTCFullYear(),
          e.getUTCMonth(),
          e.getUTCDate(),
          e.getUTCHours(),
          e.getUTCMinutes(),
          e.getUTCSeconds(),
          e.getUTCMilliseconds(),
        ];
      }
      function ln(e) {
        return 1 === e.length && (e = e.concat([0])), new Date(Date.UTC(...e));
      }
      function cn(e) {
        return !isNaN(e.valueOf());
      }
      function un(e) {
        return (
          1e3 * e.getUTCHours() * 60 * 60 +
          1e3 * e.getUTCMinutes() * 60 +
          1e3 * e.getUTCSeconds() +
          e.getUTCMilliseconds()
        );
      }
      function dn(e) {
        return e.toISOString().replace(/T.*$/, "");
      }
      function hn(e, t = !1) {
        let n = e < 0 ? "-" : "+",
          r = Math.abs(e),
          i = Math.floor(r / 60),
          o = Math.round(r % 60);
        return t
          ? `${n + jt(i, 2)}:${jt(o, 2)}`
          : `GMT${n}${i}${o ? `:${jt(o, 2)}` : ""}`;
      }
      function fn(e, t, n) {
        let r, i;
        return function (...o) {
          if (r) {
            if (!$t(r, o)) {
              n && n(i);
              let r = e.apply(this, o);
              (t && t(r, i)) || (i = r);
            }
          } else i = e.apply(this, o);
          return (r = o), i;
        };
      }
      function pn(e, t, n) {
        let r, i;
        return (o) => {
          if (r) {
            if (!Gn(r, o)) {
              n && n(i);
              let r = e.call(this, o);
              (t && t(r, i)) || (i = r);
            }
          } else i = e.call(this, o);
          return (r = o), i;
        };
      }
      const gn = {
          week: 3,
          separator: 0,
          omitZeroMinute: 0,
          meridiem: 0,
          omitCommas: 0,
        },
        vn = {
          timeZoneName: 7,
          era: 6,
          year: 5,
          month: 4,
          day: 2,
          weekday: 2,
          hour: 1,
          minute: 1,
          second: 1,
        },
        mn = /\s*([ap])\.?m\.?/i,
        yn = /,/g,
        bn = /\s+/g,
        En = /\u200e/g,
        An = /UTC|GMT/;
      class wn {
        constructor(e) {
          let t = {},
            n = {},
            r = 0;
          for (let i in e)
            i in gn
              ? ((n[i] = e[i]), (r = Math.max(gn[i], r)))
              : ((t[i] = e[i]), i in vn && (r = Math.max(vn[i], r)));
          (this.standardDateProps = t),
            (this.extendedSettings = n),
            (this.severity = r),
            (this.buildFormattingFunc = fn(Dn));
        }
        format(e, t) {
          return this.buildFormattingFunc(
            this.standardDateProps,
            this.extendedSettings,
            t,
          )(e);
        }
        formatRange(e, t, n, r) {
          let { standardDateProps: i, extendedSettings: o } = this,
            s =
              ((a = e.marker),
              (l = t.marker),
              (c = n.calendarSystem).getMarkerYear(a) !== c.getMarkerYear(l)
                ? 5
                : c.getMarkerMonth(a) !== c.getMarkerMonth(l)
                  ? 4
                  : c.getMarkerDay(a) !== c.getMarkerDay(l)
                    ? 2
                    : un(a) !== un(l)
                      ? 1
                      : 0);
          var a, l, c;
          if (!s) return this.format(e, n);
          let u = s;
          !(u > 1) ||
            ("numeric" !== i.year && "2-digit" !== i.year) ||
            ("numeric" !== i.month && "2-digit" !== i.month) ||
            ("numeric" !== i.day && "2-digit" !== i.day) ||
            (u = 1);
          let d = this.format(e, n),
            h = this.format(t, n);
          if (d === h) return d;
          let f = Dn(
              (function (e, t) {
                let n = {};
                for (let r in e) (!(r in vn) || vn[r] <= t) && (n[r] = e[r]);
                return n;
              })(i, u),
              o,
              n,
            ),
            p = f(e),
            g = f(t),
            v = (function (e, t, n, r) {
              let i = 0;
              for (; i < e.length; ) {
                let o = e.indexOf(t, i);
                if (-1 === o) break;
                let s = e.substr(0, o);
                i = o + t.length;
                let a = e.substr(i),
                  l = 0;
                for (; l < n.length; ) {
                  let e = n.indexOf(r, l);
                  if (-1 === e) break;
                  let t = n.substr(0, e);
                  l = e + r.length;
                  let i = n.substr(l);
                  if (s === t && a === i) return { before: s, after: a };
                }
              }
              return null;
            })(d, p, h, g),
            m = o.separator || r || n.defaultSeparator || "";
          return v ? v.before + p + m + g + v.after : d + m + h;
        }
        getLargestUnit() {
          switch (this.severity) {
            case 7:
            case 6:
            case 5:
              return "year";
            case 4:
              return "month";
            case 3:
              return "week";
            case 2:
              return "day";
            default:
              return "time";
          }
        }
      }
      function Dn(e, t, n) {
        let r = Object.keys(e).length;
        return 1 === r && "short" === e.timeZoneName
          ? (e) => hn(e.timeZoneOffset)
          : 0 === r && t.week
            ? (e) =>
                (function (e, t, n, r, i) {
                  let o = [];
                  return (
                    "long" === i
                      ? o.push(n)
                      : ("short" !== i && "narrow" !== i) || o.push(t),
                    ("long" !== i && "short" !== i) || o.push(" "),
                    o.push(r.simpleNumberFormat.format(e)),
                    "rtl" === r.options.direction && o.reverse(),
                    o.join("")
                  );
                })(
                  n.computeWeekNumber(e.marker),
                  n.weekText,
                  n.weekTextLong,
                  n.locale,
                  t.week,
                )
            : (function (e, t, n) {
                (e = Object.assign({}, e)),
                  (t = Object.assign({}, t)),
                  (function (e, t) {
                    e.timeZoneName &&
                      (e.hour || (e.hour = "2-digit"),
                      e.minute || (e.minute = "2-digit")),
                      "long" === e.timeZoneName && (e.timeZoneName = "short"),
                      t.omitZeroMinute &&
                        (e.second || e.millisecond) &&
                        delete t.omitZeroMinute;
                  })(e, t),
                  (e.timeZone = "UTC");
                let r,
                  i = new Intl.DateTimeFormat(n.locale.codes, e);
                if (t.omitZeroMinute) {
                  let t = Object.assign({}, e);
                  delete t.minute,
                    (r = new Intl.DateTimeFormat(n.locale.codes, t));
                }
                return (o) => {
                  let s,
                    { marker: a } = o;
                  return (
                    (s = r && !a.getUTCMinutes() ? r : i),
                    (function (e, t, n, r, i) {
                      return (
                        (e = e.replace(En, "")),
                        "short" === n.timeZoneName &&
                          (e = (function (e, t) {
                            let n = !1;
                            return (
                              (e = e.replace(An, () => ((n = !0), t))),
                              n || (e += ` ${t}`),
                              e
                            );
                          })(
                            e,
                            "UTC" === i.timeZone || null == t.timeZoneOffset
                              ? "UTC"
                              : hn(t.timeZoneOffset),
                          )),
                        r.omitCommas && (e = e.replace(yn, "").trim()),
                        r.omitZeroMinute && (e = e.replace(":00", "")),
                        !1 === r.meridiem
                          ? (e = e.replace(mn, "").trim())
                          : "narrow" === r.meridiem
                            ? (e = e.replace(mn, (e, t) =>
                                t.toLocaleLowerCase(),
                              ))
                            : "short" === r.meridiem
                              ? (e = e.replace(
                                  mn,
                                  (e, t) => `${t.toLocaleLowerCase()}m`,
                                ))
                              : "lowercase" === r.meridiem &&
                                (e = e.replace(mn, (e) =>
                                  e.toLocaleLowerCase(),
                                )),
                        (e = (e = e.replace(bn, " ")).trim())
                      );
                    })(s.format(a), o, e, t, n)
                  );
                };
              })(e, t, n);
      }
      function Sn(e, t) {
        let n = t.markerToArray(e.marker);
        return {
          marker: e.marker,
          timeZoneOffset: e.timeZoneOffset,
          array: n,
          year: n[0],
          month: n[1],
          day: n[2],
          hour: n[3],
          minute: n[4],
          second: n[5],
          millisecond: n[6],
        };
      }
      function _n(e, t, n, r) {
        let i = Sn(e, n.calendarSystem);
        return {
          date: i,
          start: i,
          end: t ? Sn(t, n.calendarSystem) : null,
          timeZone: n.timeZone,
          localeCodes: n.locale.codes,
          defaultSeparator: r || n.defaultSeparator,
        };
      }
      class Cn {
        constructor(e) {
          this.cmdStr = e;
        }
        format(e, t, n) {
          return t.cmdFormatter(this.cmdStr, _n(e, null, t, n));
        }
        formatRange(e, t, n, r) {
          return n.cmdFormatter(this.cmdStr, _n(e, t, n, r));
        }
      }
      class xn {
        constructor(e) {
          this.func = e;
        }
        format(e, t, n) {
          return this.func(_n(e, null, t, n));
        }
        formatRange(e, t, n, r) {
          return this.func(_n(e, t, n, r));
        }
      }
      function Rn(e) {
        return "object" == typeof e && e
          ? new wn(e)
          : "string" == typeof e
            ? new Cn(e)
            : "function" == typeof e
              ? new xn(e)
              : null;
      }
      const Tn = {
          navLinkDayClick: Bn,
          navLinkWeekClick: Bn,
          duration: Yt,
          bootstrapFontAwesome: Bn,
          buttonIcons: Bn,
          customButtons: Bn,
          defaultAllDayEventDuration: Yt,
          defaultTimedEventDuration: Yt,
          nextDayThreshold: Yt,
          scrollTime: Yt,
          scrollTimeReset: Boolean,
          slotMinTime: Yt,
          slotMaxTime: Yt,
          dayPopoverFormat: Rn,
          slotDuration: Yt,
          snapDuration: Yt,
          headerToolbar: Bn,
          footerToolbar: Bn,
          defaultRangeSeparator: String,
          titleRangeSeparator: String,
          forceEventDuration: Boolean,
          dayHeaders: Boolean,
          dayHeaderFormat: Rn,
          dayHeaderClassNames: Bn,
          dayHeaderContent: Bn,
          dayHeaderDidMount: Bn,
          dayHeaderWillUnmount: Bn,
          dayCellClassNames: Bn,
          dayCellContent: Bn,
          dayCellDidMount: Bn,
          dayCellWillUnmount: Bn,
          initialView: String,
          aspectRatio: Number,
          weekends: Boolean,
          weekNumberCalculation: Bn,
          weekNumbers: Boolean,
          weekNumberClassNames: Bn,
          weekNumberContent: Bn,
          weekNumberDidMount: Bn,
          weekNumberWillUnmount: Bn,
          editable: Boolean,
          viewClassNames: Bn,
          viewDidMount: Bn,
          viewWillUnmount: Bn,
          nowIndicator: Boolean,
          nowIndicatorClassNames: Bn,
          nowIndicatorContent: Bn,
          nowIndicatorDidMount: Bn,
          nowIndicatorWillUnmount: Bn,
          showNonCurrentDates: Boolean,
          lazyFetching: Boolean,
          startParam: String,
          endParam: String,
          timeZoneParam: String,
          timeZone: String,
          locales: Bn,
          locale: Bn,
          themeSystem: String,
          dragRevertDuration: Number,
          dragScroll: Boolean,
          allDayMaintainDuration: Boolean,
          unselectAuto: Boolean,
          dropAccept: Bn,
          eventOrder: function (e) {
            let t,
              n,
              r = [],
              i = [];
            for (
              "string" == typeof e
                ? (i = e.split(/\s*,\s*/))
                : "function" == typeof e
                  ? (i = [e])
                  : Array.isArray(e) && (i = e),
                t = 0;
              t < i.length;
              t += 1
            )
              (n = i[t]),
                "string" == typeof n
                  ? r.push(
                      "-" === n.charAt(0)
                        ? { field: n.substring(1), order: -1 }
                        : { field: n, order: 1 },
                    )
                  : "function" == typeof n && r.push({ func: n });
            return r;
          },
          eventOrderStrict: Boolean,
          handleWindowResize: Boolean,
          windowResizeDelay: Number,
          longPressDelay: Number,
          eventDragMinDistance: Number,
          expandRows: Boolean,
          height: Bn,
          contentHeight: Bn,
          direction: String,
          weekNumberFormat: Rn,
          eventResizableFromStart: Boolean,
          displayEventTime: Boolean,
          displayEventEnd: Boolean,
          weekText: String,
          weekTextLong: String,
          progressiveEventRendering: Boolean,
          businessHours: Bn,
          initialDate: Bn,
          now: Bn,
          eventDataTransform: Bn,
          stickyHeaderDates: Bn,
          stickyFooterScrollbar: Bn,
          viewHeight: Bn,
          defaultAllDay: Boolean,
          eventSourceFailure: Bn,
          eventSourceSuccess: Bn,
          eventDisplay: String,
          eventStartEditable: Boolean,
          eventDurationEditable: Boolean,
          eventOverlap: Bn,
          eventConstraint: Bn,
          eventAllow: Bn,
          eventBackgroundColor: String,
          eventBorderColor: String,
          eventTextColor: String,
          eventColor: String,
          eventClassNames: Bn,
          eventContent: Bn,
          eventDidMount: Bn,
          eventWillUnmount: Bn,
          selectConstraint: Bn,
          selectOverlap: Bn,
          selectAllow: Bn,
          droppable: Boolean,
          unselectCancel: String,
          slotLabelFormat: Bn,
          slotLaneClassNames: Bn,
          slotLaneContent: Bn,
          slotLaneDidMount: Bn,
          slotLaneWillUnmount: Bn,
          slotLabelClassNames: Bn,
          slotLabelContent: Bn,
          slotLabelDidMount: Bn,
          slotLabelWillUnmount: Bn,
          dayMaxEvents: Bn,
          dayMaxEventRows: Bn,
          dayMinWidth: Number,
          slotLabelInterval: Yt,
          allDayText: String,
          allDayClassNames: Bn,
          allDayContent: Bn,
          allDayDidMount: Bn,
          allDayWillUnmount: Bn,
          slotMinWidth: Number,
          navLinks: Boolean,
          eventTimeFormat: Rn,
          rerenderDelay: Number,
          moreLinkText: Bn,
          moreLinkHint: Bn,
          selectMinDistance: Number,
          selectable: Boolean,
          selectLongPressDelay: Number,
          eventLongPressDelay: Number,
          selectMirror: Boolean,
          eventMaxStack: Number,
          eventMinHeight: Number,
          eventMinWidth: Number,
          eventShortHeight: Number,
          slotEventOverlap: Boolean,
          plugins: Bn,
          firstDay: Number,
          dayCount: Number,
          dateAlignment: String,
          dateIncrement: Yt,
          hiddenDays: Bn,
          fixedWeekCount: Boolean,
          validRange: Bn,
          visibleRange: Bn,
          titleFormat: Bn,
          eventInteractive: Boolean,
          noEventsText: String,
          viewHint: Bn,
          navLinkHint: Bn,
          closeHint: String,
          timeHint: String,
          eventHint: String,
          moreLinkClick: Bn,
          moreLinkClassNames: Bn,
          moreLinkContent: Bn,
          moreLinkDidMount: Bn,
          moreLinkWillUnmount: Bn,
          monthStartFormat: Rn,
          handleCustomRendering: Bn,
          customRenderingMetaMap: Bn,
          customRenderingReplaces: Boolean,
        },
        kn = {
          eventDisplay: "auto",
          defaultRangeSeparator: " - ",
          titleRangeSeparator: " – ",
          defaultTimedEventDuration: "01:00:00",
          defaultAllDayEventDuration: { day: 1 },
          forceEventDuration: !1,
          nextDayThreshold: "00:00:00",
          dayHeaders: !0,
          initialView: "",
          aspectRatio: 1.35,
          headerToolbar: { start: "title", center: "", end: "today prev,next" },
          weekends: !0,
          weekNumbers: !1,
          weekNumberCalculation: "local",
          editable: !1,
          nowIndicator: !1,
          scrollTime: "06:00:00",
          scrollTimeReset: !0,
          slotMinTime: "00:00:00",
          slotMaxTime: "24:00:00",
          showNonCurrentDates: !0,
          lazyFetching: !0,
          startParam: "start",
          endParam: "end",
          timeZoneParam: "timeZone",
          timeZone: "local",
          locales: [],
          locale: "",
          themeSystem: "standard",
          dragRevertDuration: 500,
          dragScroll: !0,
          allDayMaintainDuration: !1,
          unselectAuto: !0,
          dropAccept: "*",
          eventOrder: "start,-duration,allDay,title",
          dayPopoverFormat: { month: "long", day: "numeric", year: "numeric" },
          handleWindowResize: !0,
          windowResizeDelay: 100,
          longPressDelay: 1e3,
          eventDragMinDistance: 5,
          expandRows: !1,
          navLinks: !1,
          selectable: !1,
          eventMinHeight: 15,
          eventMinWidth: 30,
          eventShortHeight: 30,
          monthStartFormat: { month: "long", day: "numeric" },
        },
        Mn = {
          datesSet: Bn,
          eventsSet: Bn,
          eventAdd: Bn,
          eventChange: Bn,
          eventRemove: Bn,
          windowResize: Bn,
          eventClick: Bn,
          eventMouseEnter: Bn,
          eventMouseLeave: Bn,
          select: Bn,
          unselect: Bn,
          loading: Bn,
          _unmount: Bn,
          _beforeprint: Bn,
          _afterprint: Bn,
          _noEventDrop: Bn,
          _noEventResize: Bn,
          _resize: Bn,
          _scrollRequest: Bn,
        },
        On = {
          buttonText: Bn,
          buttonHints: Bn,
          views: Bn,
          plugins: Bn,
          initialEvents: Bn,
          events: Bn,
          eventSources: Bn,
        },
        In = {
          headerToolbar: Nn,
          footerToolbar: Nn,
          buttonText: Nn,
          buttonHints: Nn,
          buttonIcons: Nn,
          dateIncrement: Nn,
          plugins: Pn,
          events: Pn,
          eventSources: Pn,
          resources: Pn,
        };
      function Nn(e, t) {
        return "object" == typeof e && "object" == typeof t && e && t
          ? Gn(e, t)
          : e === t;
      }
      function Pn(e, t) {
        return Array.isArray(e) && Array.isArray(t) ? $t(e, t) : e === t;
      }
      const Hn = {
        type: String,
        component: Bn,
        buttonText: String,
        buttonTextKey: String,
        dateProfileGeneratorClass: Bn,
        usesMinMaxTime: Boolean,
        classNames: Bn,
        content: Bn,
        didMount: Bn,
        willUnmount: Bn,
      };
      function jn(e) {
        return zn(e, In);
      }
      function Ln(e, t) {
        let n = {},
          r = {};
        for (let r in t) r in e && (n[r] = t[r](e[r]));
        for (let n in e) n in t || (r[n] = e[n]);
        return { refined: n, extra: r };
      }
      function Bn(e) {
        return e;
      }
      const { hasOwnProperty: Un } = Object.prototype;
      function zn(e, t) {
        let n = {};
        if (t)
          for (let r in t)
            if (t[r] === Nn) {
              let t = [];
              for (let i = e.length - 1; i >= 0; i -= 1) {
                let o = e[i][r];
                if ("object" == typeof o && o) t.unshift(o);
                else if (void 0 !== o) {
                  n[r] = o;
                  break;
                }
              }
              t.length && (n[r] = zn(t));
            }
        for (let t = e.length - 1; t >= 0; t -= 1) {
          let r = e[t];
          for (let e in r) e in n || (n[e] = r[e]);
        }
        return n;
      }
      function Wn(e, t) {
        let n = {};
        for (let r in e) t(e[r], r) && (n[r] = e[r]);
        return n;
      }
      function Yn(e, t) {
        let n = {};
        for (let r in e) n[r] = t(e[r], r);
        return n;
      }
      function Fn(e) {
        let t = {};
        for (let n of e) t[n] = !0;
        return t;
      }
      function Vn(e) {
        let t = [];
        for (let n in e) t.push(e[n]);
        return t;
      }
      function Gn(e, t) {
        if (e === t) return !0;
        for (let n in e) if (Un.call(e, n) && !(n in t)) return !1;
        for (let n in t) if (Un.call(t, n) && e[n] !== t[n]) return !1;
        return !0;
      }
      const Qn = /^on[A-Z]/;
      function $n(e, t) {
        let n = [];
        for (let r in e) Un.call(e, r) && (r in t || n.push(r));
        for (let r in t) Un.call(t, r) && e[r] !== t[r] && n.push(r);
        return n;
      }
      function qn(e, t, n = {}) {
        if (e === t) return !0;
        for (let s in t)
          if (
            !(
              s in e &&
              ((r = e[s]),
              (i = t[s]),
              (o = n[s]),
              r === i || !0 === o || (o && o(r, i)))
            )
          )
            return !1;
        var r, i, o;
        for (let n in e) if (!(n in t)) return !1;
        return !0;
      }
      let Zn = {};
      var Xn;
      (Xn = class {
        getMarkerYear(e) {
          return e.getUTCFullYear();
        }
        getMarkerMonth(e) {
          return e.getUTCMonth();
        }
        getMarkerDay(e) {
          return e.getUTCDate();
        }
        arrayToMarker(e) {
          return ln(e);
        }
        markerToArray(e) {
          return an(e);
        }
      }),
        (Zn.gregory = Xn);
      const Jn =
        /^\s*(\d{4})(-?(\d{2})(-?(\d{2})([T ](\d{2}):?(\d{2})(:?(\d{2})(\.(\d+))?)?(Z|(([-+])(\d{2})(:?(\d{2}))?))?)?)?)?$/;
      class Kn {
        constructor(e) {
          let t = (this.timeZone = e.timeZone),
            n = "local" !== t && "UTC" !== t;
          e.namedTimeZoneImpl &&
            n &&
            (this.namedTimeZoneImpl = new e.namedTimeZoneImpl(t)),
            (this.canComputeOffset = Boolean(!n || this.namedTimeZoneImpl)),
            (this.calendarSystem = (function (e) {
              return new Zn[e]();
            })(e.calendarSystem)),
            (this.locale = e.locale),
            (this.weekDow = e.locale.week.dow),
            (this.weekDoy = e.locale.week.doy),
            "ISO" === e.weekNumberCalculation &&
              ((this.weekDow = 1), (this.weekDoy = 4)),
            "number" == typeof e.firstDay && (this.weekDow = e.firstDay),
            "function" == typeof e.weekNumberCalculation &&
              (this.weekNumberFunc = e.weekNumberCalculation),
            (this.weekText =
              null != e.weekText ? e.weekText : e.locale.options.weekText),
            (this.weekTextLong =
              (null != e.weekTextLong
                ? e.weekTextLong
                : e.locale.options.weekTextLong) || this.weekText),
            (this.cmdFormatter = e.cmdFormatter),
            (this.defaultSeparator = e.defaultSeparator);
        }
        createMarker(e) {
          let t = this.createMarkerMeta(e);
          return null === t ? null : t.marker;
        }
        createNowMarker() {
          return this.canComputeOffset
            ? this.timestampToMarker(new Date().valueOf())
            : ln(on(new Date()));
        }
        createMarkerMeta(e) {
          if ("string" == typeof e) return this.parse(e);
          let t = null;
          return (
            "number" == typeof e
              ? (t = this.timestampToMarker(e))
              : e instanceof Date
                ? ((e = e.valueOf()),
                  isNaN(e) || (t = this.timestampToMarker(e)))
                : Array.isArray(e) && (t = ln(e)),
            null !== t && cn(t)
              ? { marker: t, isTimeUnspecified: !1, forcedTzo: null }
              : null
          );
        }
        parse(e) {
          let t = (function (e) {
            let t = Jn.exec(e);
            if (t) {
              let e = new Date(
                Date.UTC(
                  Number(t[1]),
                  t[3] ? Number(t[3]) - 1 : 0,
                  Number(t[5] || 1),
                  Number(t[7] || 0),
                  Number(t[8] || 0),
                  Number(t[10] || 0),
                  t[12] ? 1e3 * Number(`0.${t[12]}`) : 0,
                ),
              );
              if (cn(e)) {
                let n = null;
                return (
                  t[13] &&
                    (n =
                      ("-" === t[15] ? -1 : 1) *
                      (60 * Number(t[16] || 0) + Number(t[18] || 0))),
                  { marker: e, isTimeUnspecified: !t[6], timeZoneOffset: n }
                );
              }
            }
            return null;
          })(e);
          if (null === t) return null;
          let { marker: n } = t,
            r = null;
          return (
            null !== t.timeZoneOffset &&
              (this.canComputeOffset
                ? (n = this.timestampToMarker(
                    n.valueOf() - 60 * t.timeZoneOffset * 1e3,
                  ))
                : (r = t.timeZoneOffset)),
            { marker: n, isTimeUnspecified: t.isTimeUnspecified, forcedTzo: r }
          );
        }
        getYear(e) {
          return this.calendarSystem.getMarkerYear(e);
        }
        getMonth(e) {
          return this.calendarSystem.getMarkerMonth(e);
        }
        getDay(e) {
          return this.calendarSystem.getMarkerDay(e);
        }
        add(e, t) {
          let n = this.calendarSystem.markerToArray(e);
          return (
            (n[0] += t.years),
            (n[1] += t.months),
            (n[2] += t.days),
            (n[6] += t.milliseconds),
            this.calendarSystem.arrayToMarker(n)
          );
        }
        subtract(e, t) {
          let n = this.calendarSystem.markerToArray(e);
          return (
            (n[0] -= t.years),
            (n[1] -= t.months),
            (n[2] -= t.days),
            (n[6] -= t.milliseconds),
            this.calendarSystem.arrayToMarker(n)
          );
        }
        addYears(e, t) {
          let n = this.calendarSystem.markerToArray(e);
          return (n[0] += t), this.calendarSystem.arrayToMarker(n);
        }
        addMonths(e, t) {
          let n = this.calendarSystem.markerToArray(e);
          return (n[1] += t), this.calendarSystem.arrayToMarker(n);
        }
        diffWholeYears(e, t) {
          let { calendarSystem: n } = this;
          return un(e) === un(t) &&
            n.getMarkerDay(e) === n.getMarkerDay(t) &&
            n.getMarkerMonth(e) === n.getMarkerMonth(t)
            ? n.getMarkerYear(t) - n.getMarkerYear(e)
            : null;
        }
        diffWholeMonths(e, t) {
          let { calendarSystem: n } = this;
          return un(e) === un(t) && n.getMarkerDay(e) === n.getMarkerDay(t)
            ? n.getMarkerMonth(t) -
                n.getMarkerMonth(e) +
                12 * (n.getMarkerYear(t) - n.getMarkerYear(e))
            : null;
        }
        greatestWholeUnit(e, t) {
          let n = this.diffWholeYears(e, t);
          return null !== n
            ? { unit: "year", value: n }
            : ((n = this.diffWholeMonths(e, t)),
              null !== n
                ? { unit: "month", value: n }
                : ((n = (function (e, t) {
                    let n = en(e, t);
                    return null !== n && n % 7 == 0 ? n / 7 : null;
                  })(e, t)),
                  null !== n
                    ? { unit: "week", value: n }
                    : ((n = en(e, t)),
                      null !== n
                        ? { unit: "day", value: n }
                        : ((n = (function (e, t) {
                            return (t.valueOf() - e.valueOf()) / 36e5;
                          })(e, t)),
                          Ut(n)
                            ? { unit: "hour", value: n }
                            : ((n = (function (e, t) {
                                return (t.valueOf() - e.valueOf()) / 6e4;
                              })(e, t)),
                              Ut(n)
                                ? { unit: "minute", value: n }
                                : ((n = (function (e, t) {
                                    return (t.valueOf() - e.valueOf()) / 1e3;
                                  })(e, t)),
                                  Ut(n)
                                    ? { unit: "second", value: n }
                                    : {
                                        unit: "millisecond",
                                        value: t.valueOf() - e.valueOf(),
                                      }))))));
        }
        countDurationsBetween(e, t, n) {
          let r;
          return n.years && ((r = this.diffWholeYears(e, t)), null !== r)
            ? r / (Vt(n) / 365)
            : n.months && ((r = this.diffWholeMonths(e, t)), null !== r)
              ? r / (Vt(n) / 30)
              : n.days && ((r = en(e, t)), null !== r)
                ? r / Vt(n)
                : (t.valueOf() - e.valueOf()) / Gt(n);
        }
        startOf(e, t) {
          return "year" === t
            ? this.startOfYear(e)
            : "month" === t
              ? this.startOfMonth(e)
              : "week" === t
                ? this.startOfWeek(e)
                : "day" === t
                  ? tn(e)
                  : "hour" === t
                    ? (function (e) {
                        return ln([
                          e.getUTCFullYear(),
                          e.getUTCMonth(),
                          e.getUTCDate(),
                          e.getUTCHours(),
                        ]);
                      })(e)
                    : "minute" === t
                      ? (function (e) {
                          return ln([
                            e.getUTCFullYear(),
                            e.getUTCMonth(),
                            e.getUTCDate(),
                            e.getUTCHours(),
                            e.getUTCMinutes(),
                          ]);
                        })(e)
                      : "second" === t
                        ? (function (e) {
                            return ln([
                              e.getUTCFullYear(),
                              e.getUTCMonth(),
                              e.getUTCDate(),
                              e.getUTCHours(),
                              e.getUTCMinutes(),
                              e.getUTCSeconds(),
                            ]);
                          })(e)
                        : null;
        }
        startOfYear(e) {
          return this.calendarSystem.arrayToMarker([
            this.calendarSystem.getMarkerYear(e),
          ]);
        }
        startOfMonth(e) {
          return this.calendarSystem.arrayToMarker([
            this.calendarSystem.getMarkerYear(e),
            this.calendarSystem.getMarkerMonth(e),
          ]);
        }
        startOfWeek(e) {
          return this.calendarSystem.arrayToMarker([
            this.calendarSystem.getMarkerYear(e),
            this.calendarSystem.getMarkerMonth(e),
            e.getUTCDate() - ((e.getUTCDay() - this.weekDow + 7) % 7),
          ]);
        }
        computeWeekNumber(e) {
          return this.weekNumberFunc
            ? this.weekNumberFunc(this.toDate(e))
            : (function (e, t, n) {
                let r = e.getUTCFullYear(),
                  i = nn(e, r, t, n);
                if (i < 1) return nn(e, r - 1, t, n);
                let o = nn(e, r + 1, t, n);
                return o >= 1 ? Math.min(i, o) : i;
              })(e, this.weekDow, this.weekDoy);
        }
        format(e, t, n = {}) {
          return t.format(
            {
              marker: e,
              timeZoneOffset:
                null != n.forcedTzo ? n.forcedTzo : this.offsetForMarker(e),
            },
            this,
          );
        }
        formatRange(e, t, n, r = {}) {
          return (
            r.isEndExclusive && (t = Jt(t, -1)),
            n.formatRange(
              {
                marker: e,
                timeZoneOffset:
                  null != r.forcedStartTzo
                    ? r.forcedStartTzo
                    : this.offsetForMarker(e),
              },
              {
                marker: t,
                timeZoneOffset:
                  null != r.forcedEndTzo
                    ? r.forcedEndTzo
                    : this.offsetForMarker(t),
              },
              this,
              r.defaultSeparator,
            )
          );
        }
        formatIso(e, t = {}) {
          let n = null;
          return (
            t.omitTimeZoneOffset ||
              (n = null != t.forcedTzo ? t.forcedTzo : this.offsetForMarker(e)),
            (function (e, t, n = !1) {
              let r = e.toISOString();
              return (
                (r = r.replace(".000", "")),
                n && (r = r.replace("T00:00:00Z", "")),
                r.length > 10 &&
                  (null == t
                    ? (r = r.replace("Z", ""))
                    : 0 !== t && (r = r.replace("Z", hn(t, !0)))),
                r
              );
            })(e, n, t.omitTime)
          );
        }
        timestampToMarker(e) {
          return "local" === this.timeZone
            ? ln(on(new Date(e)))
            : "UTC" !== this.timeZone && this.namedTimeZoneImpl
              ? ln(this.namedTimeZoneImpl.timestampToArray(e))
              : new Date(e);
        }
        offsetForMarker(e) {
          return "local" === this.timeZone
            ? -sn(an(e)).getTimezoneOffset()
            : "UTC" === this.timeZone
              ? 0
              : this.namedTimeZoneImpl
                ? this.namedTimeZoneImpl.offsetForArray(an(e))
                : null;
        }
        toDate(e, t) {
          return "local" === this.timeZone
            ? sn(an(e))
            : "UTC" === this.timeZone
              ? new Date(e.valueOf())
              : this.namedTimeZoneImpl
                ? new Date(
                    e.valueOf() -
                      1e3 * this.namedTimeZoneImpl.offsetForArray(an(e)) * 60,
                  )
                : new Date(e.valueOf() - (t || 0));
        }
      }
      class er {
        constructor(e) {
          this.iconOverrideOption &&
            this.setIconOverride(e[this.iconOverrideOption]);
        }
        setIconOverride(e) {
          let t, n;
          if ("object" == typeof e && e) {
            for (n in ((t = Object.assign({}, this.iconClasses)), e))
              t[n] = this.applyIconOverridePrefix(e[n]);
            this.iconClasses = t;
          } else !1 === e && (this.iconClasses = {});
        }
        applyIconOverridePrefix(e) {
          let t = this.iconOverridePrefix;
          return t && 0 !== e.indexOf(t) && (e = t + e), e;
        }
        getClass(e) {
          return this.classes[e] || "";
        }
        getIconClass(e, t) {
          let n;
          return (
            (n =
              (t && this.rtlIconClasses && this.rtlIconClasses[e]) ||
              this.iconClasses[e]),
            n ? `${this.baseIconClass} ${n}` : ""
          );
        }
        getCustomButtonIconClass(e) {
          let t;
          return this.iconOverrideCustomButtonOption &&
            ((t = e[this.iconOverrideCustomButtonOption]), t)
            ? `${this.baseIconClass} ${this.applyIconOverridePrefix(t)}`
            : "";
        }
      }
      function tr(e) {
        e();
        let t = W.debounceRendering,
          n = [];
        for (
          W.debounceRendering = function (e) {
            n.push(e);
          },
            _e(te(nr, {}), document.createElement("div"));
          n.length;

        )
          n.shift()();
        W.debounceRendering = t;
      }
      (er.prototype.classes = {}),
        (er.prototype.iconClasses = {}),
        (er.prototype.baseIconClass = ""),
        (er.prototype.iconOverridePrefix = "");
      class nr extends le {
        render() {
          return te("div", {});
        }
        componentDidMount() {
          this.setState({});
        }
      }
      function rr(e) {
        let t = (function (e, t) {
            var n = {
              __c: (t = "__cC" + q++),
              __: e,
              Consumer: function (e, t) {
                return e.children(t);
              },
              Provider: function (e) {
                var n, r;
                return (
                  this.getChildContext ||
                    ((n = []),
                    ((r = {})[t] = this),
                    (this.getChildContext = function () {
                      return r;
                    }),
                    (this.shouldComponentUpdate = function (e) {
                      this.props.value !== e.value &&
                        n.some(function (e) {
                          (e.__e = !0), he(e);
                        });
                    }),
                    (this.sub = function (e) {
                      n.push(e);
                      var t = e.componentWillUnmount;
                      e.componentWillUnmount = function () {
                        n.splice(n.indexOf(e), 1), t && t.call(e);
                      };
                    })),
                  e.children
                );
              },
            };
            return (n.Provider.__ = n.Consumer.contextType = n);
          })(e),
          n = t.Provider;
        return (
          (t.Provider = function () {
            let e = !this.getChildContext,
              t = n.apply(this, arguments);
            if (e) {
              let e = [];
              (this.shouldComponentUpdate = (t) => {
                this.props.value !== t.value &&
                  e.forEach((e) => {
                    (e.context = t.value), e.forceUpdate();
                  });
              }),
                (this.sub = (t) => {
                  e.push(t);
                  let n = t.componentWillUnmount;
                  t.componentWillUnmount = () => {
                    e.splice(e.indexOf(t), 1), n && n.call(t);
                  };
                });
            }
            return t;
          }),
          t
        );
      }
      class ir {
        constructor(e, t, n, r) {
          (this.execFunc = e),
            (this.emitter = t),
            (this.scrollTime = n),
            (this.scrollTimeReset = r),
            (this.handleScrollRequest = (e) => {
              (this.queuedRequest = Object.assign(
                {},
                this.queuedRequest || {},
                e,
              )),
                this.drain();
            }),
            t.on("_scrollRequest", this.handleScrollRequest),
            this.fireInitialScroll();
        }
        detach() {
          this.emitter.off("_scrollRequest", this.handleScrollRequest);
        }
        update(e) {
          e && this.scrollTimeReset ? this.fireInitialScroll() : this.drain();
        }
        fireInitialScroll() {
          this.handleScrollRequest({ time: this.scrollTime });
        }
        drain() {
          this.queuedRequest &&
            this.execFunc(this.queuedRequest) &&
            (this.queuedRequest = null);
        }
      }
      const or = rr({});
      function sr(e, t, n, r, i, o, s, a, l, c, u, d, h) {
        return {
          dateEnv: i,
          options: n,
          pluginHooks: s,
          emitter: c,
          dispatch: a,
          getCurrentData: l,
          calendarApi: u,
          viewSpec: e,
          viewApi: t,
          dateProfileGenerator: r,
          theme: o,
          isRtl: "rtl" === n.direction,
          addResizeHandler(e) {
            c.on("_resize", e);
          },
          removeResizeHandler(e) {
            c.off("_resize", e);
          },
          createScrollResponder: (e) =>
            new ir(e, c, Yt(n.scrollTime), n.scrollTimeReset),
          registerInteractiveComponent: d,
          unregisterInteractiveComponent: h,
        };
      }
      class ar extends le {
        shouldComponentUpdate(e, t) {
          return (
            this.debug && console.log($n(e, this.props), $n(t, this.state)),
            !qn(this.props, e, this.propEquality) ||
              !qn(this.state, t, this.stateEquality)
          );
        }
        safeSetState(e) {
          qn(
            this.state,
            Object.assign(Object.assign({}, this.state), e),
            this.stateEquality,
          ) || this.setState(e);
        }
      }
      (ar.addPropsEquality = function (e) {
        let t = Object.create(this.prototype.propEquality);
        Object.assign(t, e), (this.prototype.propEquality = t);
      }),
        (ar.addStateEquality = function (e) {
          let t = Object.create(this.prototype.stateEquality);
          Object.assign(t, e), (this.prototype.stateEquality = t);
        }),
        (ar.contextType = or),
        (ar.prototype.propEquality = {}),
        (ar.prototype.stateEquality = {});
      class lr extends ar {}
      function cr(e, t) {
        "function" == typeof e ? e(t) : e && (e.current = t);
      }
      lr.contextType = or;
      class ur extends lr {
        constructor() {
          super(...arguments),
            (this.id = It()),
            (this.queuedDomNodes = []),
            (this.currentDomNodes = []),
            (this.handleEl = (e) => {
              const { options: t } = this.context,
                { generatorName: n } = this.props;
              (t.customRenderingReplaces && dr(n, t)) || this.updateElRef(e);
            }),
            (this.updateElRef = (e) => {
              this.props.elRef && cr(this.props.elRef, e);
            });
        }
        render() {
          const { props: e, context: t } = this,
            { options: n } = t,
            { customGenerator: r, defaultGenerator: i, renderProps: o } = e,
            s = hr(e, [], this.handleEl);
          let a,
            l,
            c = !1,
            u = [];
          if (null != r) {
            const e = "function" == typeof r ? r(o, te) : r;
            if (!0 === e) c = !0;
            else {
              const t = e && "object" == typeof e;
              t && "html" in e
                ? (s.dangerouslySetInnerHTML = { __html: e.html })
                : t && "domNodes" in e
                  ? (u = Array.prototype.slice.call(e.domNodes))
                  : (t ? F(e) : "function" != typeof e)
                    ? (a = e)
                    : (l = e);
            }
          } else c = !dr(e.generatorName, n);
          return (
            c && i && (a = i(o)),
            (this.queuedDomNodes = u),
            (this.currentGeneratorMeta = l),
            te(e.elTag, s, a)
          );
        }
        componentDidMount() {
          this.applyQueueudDomNodes(), this.triggerCustomRendering(!0);
        }
        componentDidUpdate() {
          this.applyQueueudDomNodes(), this.triggerCustomRendering(!0);
        }
        componentWillUnmount() {
          this.triggerCustomRendering(!1);
        }
        triggerCustomRendering(e) {
          var t;
          const { props: n, context: r } = this,
            { handleCustomRendering: i, customRenderingMetaMap: o } = r.options;
          if (i) {
            const r =
              null !== (t = this.currentGeneratorMeta) && void 0 !== t
                ? t
                : null == o
                  ? void 0
                  : o[n.generatorName];
            r &&
              i(
                Object.assign(
                  Object.assign(
                    {
                      id: this.id,
                      isActive: e,
                      containerEl: this.base,
                      reportNewContainerEl: this.updateElRef,
                      generatorMeta: r,
                    },
                    n,
                  ),
                  { elClasses: (n.elClasses || []).filter(fr) },
                ),
              );
          }
        }
        applyQueueudDomNodes() {
          const { queuedDomNodes: e, currentDomNodes: t } = this,
            n = this.base;
          if (!$t(e, t)) {
            t.forEach(yt);
            for (let t of e) n.appendChild(t);
            this.currentDomNodes = e;
          }
        }
      }
      function dr(e, t) {
        var n;
        return Boolean(
          t.handleCustomRendering &&
            e &&
            (null === (n = t.customRenderingMetaMap) || void 0 === n
              ? void 0
              : n[e]),
        );
      }
      function hr(e, t, n) {
        const r = Object.assign(Object.assign({}, e.elAttrs), { ref: n });
        return (
          (e.elClasses || t) &&
            (r.className = (e.elClasses || [])
              .concat(t || [])
              .concat(r.className || [])
              .filter(Boolean)
              .join(" ")),
          e.elStyle && (r.style = e.elStyle),
          r
        );
      }
      function fr(e) {
        return Boolean(e);
      }
      ur.addPropsEquality({
        elClasses: $t,
        elStyle: Gn,
        elAttrs: function (e, t) {
          const n = $n(e, t);
          for (let e of n) if (!Qn.test(e)) return !1;
          return !0;
        },
        renderProps: Gn,
      });
      const pr = rr(0);
      class gr extends le {
        constructor() {
          super(...arguments),
            (this.InnerContent = vr.bind(void 0, this)),
            (this.handleEl = (e) => {
              (this.el = e),
                this.props.elRef &&
                  (cr(this.props.elRef, e),
                  e && this.didMountMisfire && this.componentDidMount());
            });
        }
        render() {
          const { props: e } = this,
            t = (function (e, t) {
              const n = "function" == typeof e ? e(t) : e || [];
              return "string" == typeof n ? [n] : n;
            })(e.classNameGenerator, e.renderProps);
          if (e.children) {
            const n = hr(e, t, this.handleEl),
              r = e.children(this.InnerContent, e.renderProps, n);
            return e.elTag ? te(e.elTag, n, r) : r;
          }
          return te(
            ur,
            Object.assign(Object.assign({}, e), {
              elRef: this.handleEl,
              elTag: e.elTag || "div",
              elClasses: (e.elClasses || []).concat(t),
              renderId: this.context,
            }),
          );
        }
        componentDidMount() {
          var e, t;
          this.el
            ? null === (t = (e = this.props).didMount) ||
              void 0 === t ||
              t.call(
                e,
                Object.assign(Object.assign({}, this.props.renderProps), {
                  el: this.el,
                }),
              )
            : (this.didMountMisfire = !0);
        }
        componentWillUnmount() {
          var e, t;
          null === (t = (e = this.props).willUnmount) ||
            void 0 === t ||
            t.call(
              e,
              Object.assign(Object.assign({}, this.props.renderProps), {
                el: this.el,
              }),
            );
        }
      }
      function vr(e, t) {
        const n = e.props;
        return te(
          ur,
          Object.assign(
            {
              renderProps: n.renderProps,
              generatorName: n.generatorName,
              customGenerator: n.customGenerator,
              defaultGenerator: n.defaultGenerator,
              renderId: e.context,
            },
            t,
          ),
        );
      }
      gr.contextType = pr;
      class mr extends lr {
        render() {
          let { props: e, context: t } = this,
            { options: n } = t,
            r = { view: t.viewApi };
          return te(
            gr,
            Object.assign({}, e, {
              elTag: e.elTag || "div",
              elClasses: [...yr(e.viewSpec), ...(e.elClasses || [])],
              renderProps: r,
              classNameGenerator: n.viewClassNames,
              generatorName: void 0,
              didMount: n.viewDidMount,
              willUnmount: n.viewWillUnmount,
            }),
            () => e.children,
          );
        }
      }
      function yr(e) {
        return [`fc-${e.type}-view`, "fc-view"];
      }
      function br(e, t) {
        let n,
          r,
          i = [],
          { start: o } = t;
        for (e.sort(Er), n = 0; n < e.length; n += 1)
          (r = e[n]),
            r.start > o && i.push({ start: o, end: r.start }),
            r.end > o && (o = r.end);
        return o < t.end && i.push({ start: o, end: t.end }), i;
      }
      function Er(e, t) {
        return e.start.valueOf() - t.start.valueOf();
      }
      function Ar(e, t) {
        let { start: n, end: r } = e,
          i = null;
        return (
          null !== t.start &&
            (n =
              null === n
                ? t.start
                : new Date(Math.max(n.valueOf(), t.start.valueOf()))),
          null != t.end &&
            (r =
              null === r
                ? t.end
                : new Date(Math.min(r.valueOf(), t.end.valueOf()))),
          (null === n || null === r || n < r) && (i = { start: n, end: r }),
          i
        );
      }
      function wr(e, t) {
        return (
          (null === e.end || null === t.start || e.end > t.start) &&
          (null === e.start || null === t.end || e.start < t.end)
        );
      }
      function Dr(e, t) {
        return (
          (null === e.start || (null !== t.start && t.start >= e.start)) &&
          (null === e.end || (null !== t.end && t.end <= e.end))
        );
      }
      function Sr(e, t) {
        return (
          (null === e.start || t >= e.start) && (null === e.end || t < e.end)
        );
      }
      function _r(e) {
        let t = Math.floor(Kt(e.start, e.end)) || 1,
          n = tn(e.start);
        return { start: n, end: Xt(n, t) };
      }
      function Cr(e, t = Yt(0)) {
        let n = null,
          r = null;
        if (e.end) {
          r = tn(e.end);
          let n = e.end.valueOf() - r.valueOf();
          n && n >= Gt(t) && (r = Xt(r, 1));
        }
        return (
          e.start && ((n = tn(e.start)), r && r <= n && (r = Xt(n, 1))),
          { start: n, end: r }
        );
      }
      function xr(e, t, n, r) {
        return "year" === r
          ? Yt(n.diffWholeYears(e, t), "year")
          : "month" === r
            ? Yt(n.diffWholeMonths(e, t), "month")
            : (function (e, t) {
                let n = tn(e),
                  r = tn(t);
                return {
                  years: 0,
                  months: 0,
                  days: Math.round(Kt(n, r)),
                  milliseconds:
                    t.valueOf() - r.valueOf() - (e.valueOf() - n.valueOf()),
                };
              })(e, t);
      }
      function Rr(e, t) {
        return (
          "function" == typeof e && (e = e()),
          null == e ? t.createNowMarker() : t.createMarker(e)
        );
      }
      class Tr {
        constructor(e) {
          (this.props = e),
            (this.nowDate = Rr(e.nowInput, e.dateEnv)),
            this.initHiddenDays();
        }
        buildPrev(e, t, n) {
          let { dateEnv: r } = this.props,
            i = r.subtract(r.startOf(t, e.currentRangeUnit), e.dateIncrement);
          return this.build(i, -1, n);
        }
        buildNext(e, t, n) {
          let { dateEnv: r } = this.props,
            i = r.add(r.startOf(t, e.currentRangeUnit), e.dateIncrement);
          return this.build(i, 1, n);
        }
        build(e, t, n = !0) {
          let r,
            i,
            o,
            s,
            a,
            l,
            { props: c } = this;
          var u, d;
          return (
            (r = this.buildValidRange()),
            (r = this.trimHiddenDays(r)),
            n &&
              ((u = e),
              (e =
                null != (d = r).start && u < d.start
                  ? d.start
                  : null != d.end && u >= d.end
                    ? new Date(d.end.valueOf() - 1)
                    : u)),
            (i = this.buildCurrentRangeInfo(e, t)),
            (o = /^(year|month|week|day)$/.test(i.unit)),
            (s = this.buildRenderRange(
              this.trimHiddenDays(i.range),
              i.unit,
              o,
            )),
            (s = this.trimHiddenDays(s)),
            (a = s),
            c.showNonCurrentDates || (a = Ar(a, i.range)),
            (a = this.adjustActiveRange(a)),
            (a = Ar(a, r)),
            (l = wr(i.range, r)),
            Sr(s, e) || (e = s.start),
            {
              currentDate: e,
              validRange: r,
              currentRange: i.range,
              currentRangeUnit: i.unit,
              isRangeAllDay: o,
              activeRange: a,
              renderRange: s,
              slotMinTime: c.slotMinTime,
              slotMaxTime: c.slotMaxTime,
              isValid: l,
              dateIncrement: this.buildDateIncrement(i.duration),
            }
          );
        }
        buildValidRange() {
          let e = this.props.validRangeInput,
            t =
              "function" == typeof e
                ? e.call(this.props.calendarApi, this.nowDate)
                : e;
          return this.refineRange(t) || { start: null, end: null };
        }
        buildCurrentRangeInfo(e, t) {
          let n,
            { props: r } = this,
            i = null,
            o = null,
            s = null;
          return (
            r.duration
              ? ((i = r.duration),
                (o = r.durationUnit),
                (s = this.buildRangeFromDuration(e, t, i, o)))
              : (n = this.props.dayCount)
                ? ((o = "day"), (s = this.buildRangeFromDayCount(e, t, n)))
                : (s = this.buildCustomVisibleRange(e))
                  ? (o = r.dateEnv.greatestWholeUnit(s.start, s.end).unit)
                  : ((i = this.getFallbackDuration()),
                    (o = Qt(i).unit),
                    (s = this.buildRangeFromDuration(e, t, i, o))),
            { duration: i, unit: o, range: s }
          );
        }
        getFallbackDuration() {
          return Yt({ day: 1 });
        }
        adjustActiveRange(e) {
          let {
              dateEnv: t,
              usesMinMaxTime: n,
              slotMinTime: r,
              slotMaxTime: i,
            } = this.props,
            { start: o, end: s } = e;
          return (
            n &&
              (Vt(r) < 0 && ((o = tn(o)), (o = t.add(o, r))),
              Vt(i) > 1 && ((s = tn(s)), (s = Xt(s, -1)), (s = t.add(s, i)))),
            { start: o, end: s }
          );
        }
        buildRangeFromDuration(e, t, n, r) {
          let i,
            o,
            s,
            { dateEnv: a, dateAlignment: l } = this.props;
          if (!l) {
            let { dateIncrement: e } = this.props;
            l = e && Gt(e) < Gt(n) ? Qt(e).unit : r;
          }
          function c() {
            (i = a.startOf(e, l)),
              (o = a.add(i, n)),
              (s = { start: i, end: o });
          }
          return (
            Vt(n) <= 1 &&
              this.isHiddenDay(i) &&
              ((i = this.skipHiddenDays(i, t)), (i = tn(i))),
            c(),
            this.trimHiddenDays(s) || ((e = this.skipHiddenDays(e, t)), c()),
            s
          );
        }
        buildRangeFromDayCount(e, t, n) {
          let r,
            { dateEnv: i, dateAlignment: o } = this.props,
            s = 0,
            a = e;
          o && (a = i.startOf(a, o)),
            (a = tn(a)),
            (a = this.skipHiddenDays(a, t)),
            (r = a);
          do {
            (r = Xt(r, 1)), this.isHiddenDay(r) || (s += 1);
          } while (s < n);
          return { start: a, end: r };
        }
        buildCustomVisibleRange(e) {
          let { props: t } = this,
            n = t.visibleRangeInput,
            r =
              "function" == typeof n
                ? n.call(t.calendarApi, t.dateEnv.toDate(e))
                : n,
            i = this.refineRange(r);
          return !i || (null != i.start && null != i.end) ? i : null;
        }
        buildRenderRange(e, t, n) {
          return e;
        }
        buildDateIncrement(e) {
          let t,
            { dateIncrement: n } = this.props;
          return (
            n ||
            ((t = this.props.dateAlignment) ? Yt(1, t) : e || Yt({ days: 1 }))
          );
        }
        refineRange(e) {
          if (e) {
            let t = (function (e, t) {
              let n = null,
                r = null;
              return (
                e.start && (n = t.createMarker(e.start)),
                e.end && (r = t.createMarker(e.end)),
                n || r ? (n && r && r < n ? null : { start: n, end: r }) : null
              );
            })(e, this.props.dateEnv);
            return t && (t = Cr(t)), t;
          }
          return null;
        }
        initHiddenDays() {
          let e,
            t = this.props.hiddenDays || [],
            n = [],
            r = 0;
          for (!1 === this.props.weekends && t.push(0, 6), e = 0; e < 7; e += 1)
            (n[e] = -1 !== t.indexOf(e)) || (r += 1);
          if (!r) throw new Error("invalid hiddenDays");
          this.isHiddenDayHash = n;
        }
        trimHiddenDays(e) {
          let { start: t, end: n } = e;
          return (
            t && (t = this.skipHiddenDays(t)),
            n && (n = this.skipHiddenDays(n, -1, !0)),
            null == t || null == n || t < n ? { start: t, end: n } : null
          );
        }
        isHiddenDay(e) {
          return (
            e instanceof Date && (e = e.getUTCDay()), this.isHiddenDayHash[e]
          );
        }
        skipHiddenDays(e, t = 1, n = !1) {
          for (; this.isHiddenDayHash[(e.getUTCDay() + (n ? t : 0) + 7) % 7]; )
            e = Xt(e, t);
          return e;
        }
      }
      function kr(e, t, n, r) {
        return {
          instanceId: It(),
          defId: e,
          range: t,
          forcedStartTzo: null == n ? null : n,
          forcedEndTzo: null == r ? null : r,
        };
      }
      function Mr(e, t, n) {
        let { dateEnv: r, pluginHooks: i, options: o } = n,
          { defs: s, instances: a } = e;
        a = Wn(a, (e) => !s[e.defId].recurringDef);
        for (let e in s) {
          let n = s[e];
          if (n.recurringDef) {
            let { duration: s } = n.recurringDef;
            s ||
              (s = n.allDay
                ? o.defaultAllDayEventDuration
                : o.defaultTimedEventDuration);
            let l = Or(n, s, t, r, i.recurringTypes);
            for (let t of l) {
              let n = kr(e, { start: t, end: r.add(t, s) });
              a[n.instanceId] = n;
            }
          }
        }
        return { defs: s, instances: a };
      }
      function Or(e, t, n, r, i) {
        let o = i[e.recurringDef.typeId].expand(
          e.recurringDef.typeData,
          { start: r.subtract(n.start, t), end: n.end },
          r,
        );
        return e.allDay && (o = o.map(tn)), o;
      }
      const Ir = {
          id: String,
          groupId: String,
          title: String,
          url: String,
          interactive: Boolean,
        },
        Nr = { start: Bn, end: Bn, date: Bn, allDay: Boolean },
        Pr = Object.assign(Object.assign(Object.assign({}, Ir), Nr), {
          extendedProps: Bn,
        });
      function Hr(e, t, n, r, i = Lr(n), o, s) {
        let { refined: a, extra: l } = jr(e, n, i),
          c = (function (e, t) {
            let n = null;
            return (
              e && (n = e.defaultAllDay),
              null == n && (n = t.options.defaultAllDay),
              n
            );
          })(t, n),
          u = (function (e, t, n, r) {
            for (let i = 0; i < r.length; i += 1) {
              let o = r[i].parse(e, n);
              if (o) {
                let { allDay: n } = e;
                return (
                  null == n &&
                    ((n = t),
                    null == n && ((n = o.allDayGuess), null == n && (n = !1))),
                  {
                    allDay: n,
                    duration: o.duration,
                    typeData: o.typeData,
                    typeId: i,
                  }
                );
              }
            }
            return null;
          })(a, c, n.dateEnv, n.pluginHooks.recurringTypes);
        if (u) {
          let e = Br(
            a,
            l,
            t ? t.sourceId : "",
            u.allDay,
            Boolean(u.duration),
            n,
            o,
          );
          return (
            (e.recurringDef = {
              typeId: u.typeId,
              typeData: u.typeData,
              duration: u.duration,
            }),
            { def: e, instance: null }
          );
        }
        let d = (function (e, t, n, r) {
          let i,
            o,
            { allDay: s } = e,
            a = null,
            l = !1,
            c = null,
            u = null != e.start ? e.start : e.date;
          if (((i = n.dateEnv.createMarkerMeta(u)), i)) a = i.marker;
          else if (!r) return null;
          return (
            null != e.end && (o = n.dateEnv.createMarkerMeta(e.end)),
            null == s &&
              (s =
                null != t
                  ? t
                  : (!i || i.isTimeUnspecified) && (!o || o.isTimeUnspecified)),
            s && a && (a = tn(a)),
            o && ((c = o.marker), s && (c = tn(c)), a && c <= a && (c = null)),
            c
              ? (l = !0)
              : r ||
                ((l = n.options.forceEventDuration || !1),
                (c = n.dateEnv.add(
                  a,
                  s
                    ? n.options.defaultAllDayEventDuration
                    : n.options.defaultTimedEventDuration,
                ))),
            {
              allDay: s,
              hasEnd: l,
              range: { start: a, end: c },
              forcedStartTzo: i ? i.forcedTzo : null,
              forcedEndTzo: o ? o.forcedTzo : null,
            }
          );
        })(a, c, n, r);
        if (d) {
          let e = Br(a, l, t ? t.sourceId : "", d.allDay, d.hasEnd, n, o),
            r = kr(e.defId, d.range, d.forcedStartTzo, d.forcedEndTzo);
          return (
            s && e.publicId && s[e.publicId] && (r.instanceId = s[e.publicId]),
            { def: e, instance: r }
          );
        }
        return null;
      }
      function jr(e, t, n = Lr(t)) {
        return Ln(e, n);
      }
      function Lr(e) {
        return Object.assign(
          Object.assign(Object.assign({}, Gr), Pr),
          e.pluginHooks.eventRefiners,
        );
      }
      function Br(e, t, n, r, i, o, s) {
        let a = {
          title: e.title || "",
          groupId: e.groupId || "",
          publicId: e.id || "",
          url: e.url || "",
          recurringDef: null,
          defId: (s && e.id ? s[e.id] : "") || It(),
          sourceId: n,
          allDay: r,
          hasEnd: i,
          interactive: e.interactive,
          ui: $r(e, o),
          extendedProps: Object.assign(
            Object.assign({}, e.extendedProps || {}),
            t,
          ),
        };
        for (let t of o.pluginHooks.eventDefMemberAdders)
          Object.assign(a, t(e));
        return (
          Object.freeze(a.ui.classNames), Object.freeze(a.extendedProps), a
        );
      }
      function Ur(e, t, n, r, i, o) {
        let s = { defs: {}, instances: {} },
          a = Lr(n);
        for (let l of e) {
          let e = Hr(l, t, n, r, a, i, o);
          e && zr(e, s);
        }
        return s;
      }
      function zr(e, t = { defs: {}, instances: {} }) {
        return (
          (t.defs[e.def.defId] = e.def),
          e.instance && (t.instances[e.instance.instanceId] = e.instance),
          t
        );
      }
      function Wr(e, t) {
        let n = e.instances[t];
        if (n) {
          let t = e.defs[n.defId],
            r = Fr(e, (e) => {
              return (
                (n = t), (r = e), Boolean(n.groupId && n.groupId === r.groupId)
              );
              var n, r;
            });
          return (r.defs[t.defId] = t), (r.instances[n.instanceId] = n), r;
        }
        return { defs: {}, instances: {} };
      }
      function Yr(e, t) {
        return {
          defs: Object.assign(Object.assign({}, e.defs), t.defs),
          instances: Object.assign(Object.assign({}, e.instances), t.instances),
        };
      }
      function Fr(e, t) {
        let n = Wn(e.defs, t),
          r = Wn(e.instances, (e) => n[e.defId]);
        return { defs: n, instances: r };
      }
      function Vr(e) {
        return Array.isArray(e)
          ? e
          : "string" == typeof e
            ? e.split(/\s+/)
            : [];
      }
      const Gr = {
          display: String,
          editable: Boolean,
          startEditable: Boolean,
          durationEditable: Boolean,
          constraint: Bn,
          overlap: Bn,
          allow: Bn,
          className: Vr,
          classNames: Vr,
          color: String,
          backgroundColor: String,
          borderColor: String,
          textColor: String,
        },
        Qr = {
          display: null,
          startEditable: null,
          durationEditable: null,
          constraints: [],
          overlap: null,
          allows: [],
          backgroundColor: "",
          borderColor: "",
          textColor: "",
          classNames: [],
        };
      function $r(e, t) {
        let n = (function (e, t) {
          return Array.isArray(e)
            ? Ur(e, null, t, !0)
            : "object" == typeof e && e
              ? Ur([e], null, t, !0)
              : null != e
                ? String(e)
                : null;
        })(e.constraint, t);
        return {
          display: e.display || null,
          startEditable: null != e.startEditable ? e.startEditable : e.editable,
          durationEditable:
            null != e.durationEditable ? e.durationEditable : e.editable,
          constraints: null != n ? [n] : [],
          overlap: null != e.overlap ? e.overlap : null,
          allows: null != e.allow ? [e.allow] : [],
          backgroundColor: e.backgroundColor || e.color || "",
          borderColor: e.borderColor || e.color || "",
          textColor: e.textColor || "",
          classNames: (e.className || []).concat(e.classNames || []),
        };
      }
      function qr(e, t) {
        return {
          display: null != t.display ? t.display : e.display,
          startEditable:
            null != t.startEditable ? t.startEditable : e.startEditable,
          durationEditable:
            null != t.durationEditable
              ? t.durationEditable
              : e.durationEditable,
          constraints: e.constraints.concat(t.constraints),
          overlap: "boolean" == typeof t.overlap ? t.overlap : e.overlap,
          allows: e.allows.concat(t.allows),
          backgroundColor: t.backgroundColor || e.backgroundColor,
          borderColor: t.borderColor || e.borderColor,
          textColor: t.textColor || e.textColor,
          classNames: e.classNames.concat(t.classNames),
        };
      }
      const Zr = {
        id: String,
        defaultAllDay: Boolean,
        url: String,
        format: String,
        events: Bn,
        eventDataTransform: Bn,
        success: Bn,
        failure: Bn,
      };
      function Xr(e, t, n = Jr(t)) {
        let r;
        if (
          ("string" == typeof e
            ? (r = { url: e })
            : "function" == typeof e || Array.isArray(e)
              ? (r = { events: e })
              : "object" == typeof e && e && (r = e),
          r)
        ) {
          let { refined: i, extra: o } = Ln(r, n),
            s = (function (e, t) {
              let n = t.pluginHooks.eventSourceDefs;
              for (let t = n.length - 1; t >= 0; t -= 1) {
                let r = n[t].parseMeta(e);
                if (r) return { sourceDefId: t, meta: r };
              }
              return null;
            })(i, t);
          if (s)
            return {
              _raw: e,
              isFetching: !1,
              latestFetchId: "",
              fetchRange: null,
              defaultAllDay: i.defaultAllDay,
              eventDataTransform: i.eventDataTransform,
              success: i.success,
              failure: i.failure,
              publicId: i.id || "",
              sourceId: It(),
              sourceDefId: s.sourceDefId,
              meta: s.meta,
              ui: $r(i, t),
              extendedProps: o,
            };
        }
        return null;
      }
      function Jr(e) {
        return Object.assign(
          Object.assign(Object.assign({}, Gr), Zr),
          e.pluginHooks.eventSourceRefiners,
        );
      }
      function Kr(e, t, n) {
        let r = n.options.eventDataTransform,
          i = t ? t.eventDataTransform : null;
        return i && (e = ei(e, i)), r && (e = ei(e, r)), e;
      }
      function ei(e, t) {
        let n;
        if (t) {
          n = [];
          for (let r of e) {
            let e = t(r);
            e ? n.push(e) : null == e && n.push(r);
          }
        } else n = e;
        return n;
      }
      function ti(e, t, n) {
        let { defs: r } = e,
          i = Yn(e.instances, (e) =>
            r[e.defId].allDay
              ? e
              : Object.assign(Object.assign({}, e), {
                  range: {
                    start: n.createMarker(
                      t.toDate(e.range.start, e.forcedStartTzo),
                    ),
                    end: n.createMarker(t.toDate(e.range.end, e.forcedEndTzo)),
                  },
                  forcedStartTzo: n.canComputeOffset ? null : e.forcedStartTzo,
                  forcedEndTzo: n.canComputeOffset ? null : e.forcedEndTzo,
                }),
          );
        return { defs: r, instances: i };
      }
      function ni(e, t) {
        return Fr(e, (e) => e.sourceId !== t);
      }
      class ri {
        constructor() {
          (this.handlers = {}), (this.thisContext = null);
        }
        setThisContext(e) {
          this.thisContext = e;
        }
        setOptions(e) {
          this.options = e;
        }
        on(e, t) {
          !(function (e, t, n) {
            (e[t] || (e[t] = [])).push(n);
          })(this.handlers, e, t);
        }
        off(e, t) {
          !(function (e, t, n) {
            n ? e[t] && (e[t] = e[t].filter((e) => e !== n)) : delete e[t];
          })(this.handlers, e, t);
        }
        trigger(e, ...t) {
          let n = this.handlers[e] || [],
            r = this.options && this.options[e],
            i = [].concat(r || [], n);
          for (let e of i) e.apply(this.thisContext, t);
        }
        hasHandlers(e) {
          return Boolean(
            (this.handlers[e] && this.handlers[e].length) ||
              (this.options && this.options[e]),
          );
        }
      }
      const ii = {
        startTime: "09:00",
        endTime: "17:00",
        daysOfWeek: [1, 2, 3, 4, 5],
        display: "inverse-background",
        classNames: "fc-non-business",
        groupId: "_businessHours",
      };
      function oi(e, t, n) {
        n.emitter.trigger(
          "select",
          Object.assign(Object.assign({}, si(e, n)), {
            jsEvent: t ? t.origEvent : null,
            view: n.viewApi || n.calendarApi.view,
          }),
        );
      }
      function si(e, t) {
        let n = {};
        for (let r of t.pluginHooks.dateSpanTransforms)
          Object.assign(n, r(e, t));
        var r, i;
        return (
          Object.assign(
            n,
            ((r = e),
            (i = t.dateEnv),
            Object.assign(Object.assign({}, ki(r.range, i, r.allDay)), {
              allDay: r.allDay,
            })),
          ),
          n
        );
      }
      function ai(e, t, n) {
        let { dateEnv: r, options: i } = n,
          o = t;
        return (
          e
            ? ((o = tn(o)), (o = r.add(o, i.defaultAllDayEventDuration)))
            : (o = r.add(o, i.defaultTimedEventDuration)),
          o
        );
      }
      function li(e, t, n, r) {
        let i = yi(e.defs, t),
          o = { defs: {}, instances: {} };
        for (let t in e.defs) {
          let s = e.defs[t];
          o.defs[t] = ci(s, i[t], n, r);
        }
        for (let t in e.instances) {
          let s = e.instances[t],
            a = o.defs[s.defId];
          o.instances[t] = ui(s, a, i[s.defId], n, r);
        }
        return o;
      }
      function ci(e, t, n, r) {
        let i = n.standardProps || {};
        null == i.hasEnd &&
          t.durationEditable &&
          (n.startDelta || n.endDelta) &&
          (i.hasEnd = !0);
        let o = Object.assign(Object.assign(Object.assign({}, e), i), {
          ui: Object.assign(Object.assign({}, e.ui), i.ui),
        });
        n.extendedProps &&
          (o.extendedProps = Object.assign(
            Object.assign({}, o.extendedProps),
            n.extendedProps,
          ));
        for (let e of r.pluginHooks.eventDefMutationAppliers) e(o, n, r);
        return !o.hasEnd && r.options.forceEventDuration && (o.hasEnd = !0), o;
      }
      function ui(e, t, n, r, i) {
        let { dateEnv: o } = i,
          s = r.standardProps && !0 === r.standardProps.allDay,
          a = r.standardProps && !1 === r.standardProps.hasEnd,
          l = Object.assign({}, e);
        return (
          s && (l.range = _r(l.range)),
          r.datesDelta &&
            n.startEditable &&
            (l.range = {
              start: o.add(l.range.start, r.datesDelta),
              end: o.add(l.range.end, r.datesDelta),
            }),
          r.startDelta &&
            n.durationEditable &&
            (l.range = {
              start: o.add(l.range.start, r.startDelta),
              end: l.range.end,
            }),
          r.endDelta &&
            n.durationEditable &&
            (l.range = {
              start: l.range.start,
              end: o.add(l.range.end, r.endDelta),
            }),
          a &&
            (l.range = {
              start: l.range.start,
              end: ai(t.allDay, l.range.start, i),
            }),
          t.allDay &&
            (l.range = { start: tn(l.range.start), end: tn(l.range.end) }),
          l.range.end < l.range.start &&
            (l.range.end = ai(t.allDay, l.range.start, i)),
          l
        );
      }
      class di {
        constructor(e, t) {
          (this.context = e), (this.internalEventSource = t);
        }
        remove() {
          this.context.dispatch({
            type: "REMOVE_EVENT_SOURCE",
            sourceId: this.internalEventSource.sourceId,
          });
        }
        refetch() {
          this.context.dispatch({
            type: "FETCH_EVENT_SOURCES",
            sourceIds: [this.internalEventSource.sourceId],
            isRefetch: !0,
          });
        }
        get id() {
          return this.internalEventSource.publicId;
        }
        get url() {
          return this.internalEventSource.meta.url;
        }
        get format() {
          return this.internalEventSource.meta.format;
        }
      }
      class hi {
        constructor(e, t, n) {
          (this._context = e), (this._def = t), (this._instance = n || null);
        }
        setProp(e, t) {
          if (e in Nr)
            console.warn(
              "Could not set date-related prop 'name'. Use one of the date-related methods instead.",
            );
          else if ("id" === e)
            (t = Ir[e](t)), this.mutate({ standardProps: { publicId: t } });
          else if (e in Ir)
            (t = Ir[e](t)), this.mutate({ standardProps: { [e]: t } });
          else if (e in Gr) {
            let n = Gr[e](t);
            (n =
              "color" === e
                ? { backgroundColor: t, borderColor: t }
                : "editable" === e
                  ? { startEditable: t, durationEditable: t }
                  : { [e]: t }),
              this.mutate({ standardProps: { ui: n } });
          } else
            console.warn(
              `Could not set prop '${e}'. Use setExtendedProp instead.`,
            );
        }
        setExtendedProp(e, t) {
          this.mutate({ extendedProps: { [e]: t } });
        }
        setStart(e, t = {}) {
          let { dateEnv: n } = this._context,
            r = n.createMarker(e);
          if (r && this._instance) {
            let e = xr(this._instance.range.start, r, n, t.granularity);
            t.maintainDuration
              ? this.mutate({ datesDelta: e })
              : this.mutate({ startDelta: e });
          }
        }
        setEnd(e, t = {}) {
          let n,
            { dateEnv: r } = this._context;
          if ((null == e || ((n = r.createMarker(e)), n)) && this._instance)
            if (n) {
              let e = xr(this._instance.range.end, n, r, t.granularity);
              this.mutate({ endDelta: e });
            } else this.mutate({ standardProps: { hasEnd: !1 } });
        }
        setDates(e, t, n = {}) {
          let r,
            { dateEnv: i } = this._context,
            o = { allDay: n.allDay },
            s = i.createMarker(e);
          var a, l;
          if (
            s &&
            (null == t || ((r = i.createMarker(t)), r)) &&
            this._instance
          ) {
            let e = this._instance.range;
            !0 === n.allDay && (e = _r(e));
            let t = xr(e.start, s, i, n.granularity);
            if (r) {
              let s = xr(e.end, r, i, n.granularity);
              (l = s),
                (a = t).years === l.years &&
                a.months === l.months &&
                a.days === l.days &&
                a.milliseconds === l.milliseconds
                  ? this.mutate({ datesDelta: t, standardProps: o })
                  : this.mutate({
                      startDelta: t,
                      endDelta: s,
                      standardProps: o,
                    });
            } else
              (o.hasEnd = !1), this.mutate({ datesDelta: t, standardProps: o });
          }
        }
        moveStart(e) {
          let t = Yt(e);
          t && this.mutate({ startDelta: t });
        }
        moveEnd(e) {
          let t = Yt(e);
          t && this.mutate({ endDelta: t });
        }
        moveDates(e) {
          let t = Yt(e);
          t && this.mutate({ datesDelta: t });
        }
        setAllDay(e, t = {}) {
          let n = { allDay: e },
            { maintainDuration: r } = t;
          null == r && (r = this._context.options.allDayMaintainDuration),
            this._def.allDay !== e && (n.hasEnd = r),
            this.mutate({ standardProps: n });
        }
        formatRange(e) {
          let { dateEnv: t } = this._context,
            n = this._instance,
            r = Rn(e);
          return this._def.hasEnd
            ? t.formatRange(n.range.start, n.range.end, r, {
                forcedStartTzo: n.forcedStartTzo,
                forcedEndTzo: n.forcedEndTzo,
              })
            : t.format(n.range.start, r, { forcedTzo: n.forcedStartTzo });
        }
        mutate(e) {
          let t = this._instance;
          if (t) {
            let n = this._def,
              r = this._context,
              { eventStore: i } = r.getCurrentData(),
              o = Wr(i, t.instanceId);
            o = li(
              o,
              {
                "": {
                  display: "",
                  startEditable: !0,
                  durationEditable: !0,
                  constraints: [],
                  overlap: null,
                  allows: [],
                  backgroundColor: "",
                  borderColor: "",
                  textColor: "",
                  classNames: [],
                },
              },
              e,
              r,
            );
            let s = new hi(r, n, t);
            (this._def = o.defs[n.defId]),
              (this._instance = o.instances[t.instanceId]),
              r.dispatch({ type: "MERGE_EVENTS", eventStore: o }),
              r.emitter.trigger("eventChange", {
                oldEvent: s,
                event: this,
                relatedEvents: pi(o, r, t),
                revert() {
                  r.dispatch({ type: "RESET_EVENTS", eventStore: i });
                },
              });
          }
        }
        remove() {
          let e = this._context,
            t = fi(this);
          e.dispatch({ type: "REMOVE_EVENTS", eventStore: t }),
            e.emitter.trigger("eventRemove", {
              event: this,
              relatedEvents: [],
              revert() {
                e.dispatch({ type: "MERGE_EVENTS", eventStore: t });
              },
            });
        }
        get source() {
          let { sourceId: e } = this._def;
          return e
            ? new di(
                this._context,
                this._context.getCurrentData().eventSources[e],
              )
            : null;
        }
        get start() {
          return this._instance
            ? this._context.dateEnv.toDate(this._instance.range.start)
            : null;
        }
        get end() {
          return this._instance && this._def.hasEnd
            ? this._context.dateEnv.toDate(this._instance.range.end)
            : null;
        }
        get startStr() {
          let e = this._instance;
          return e
            ? this._context.dateEnv.formatIso(e.range.start, {
                omitTime: this._def.allDay,
                forcedTzo: e.forcedStartTzo,
              })
            : "";
        }
        get endStr() {
          let e = this._instance;
          return e && this._def.hasEnd
            ? this._context.dateEnv.formatIso(e.range.end, {
                omitTime: this._def.allDay,
                forcedTzo: e.forcedEndTzo,
              })
            : "";
        }
        get id() {
          return this._def.publicId;
        }
        get groupId() {
          return this._def.groupId;
        }
        get allDay() {
          return this._def.allDay;
        }
        get title() {
          return this._def.title;
        }
        get url() {
          return this._def.url;
        }
        get display() {
          return this._def.ui.display || "auto";
        }
        get startEditable() {
          return this._def.ui.startEditable;
        }
        get durationEditable() {
          return this._def.ui.durationEditable;
        }
        get constraint() {
          return this._def.ui.constraints[0] || null;
        }
        get overlap() {
          return this._def.ui.overlap;
        }
        get allow() {
          return this._def.ui.allows[0] || null;
        }
        get backgroundColor() {
          return this._def.ui.backgroundColor;
        }
        get borderColor() {
          return this._def.ui.borderColor;
        }
        get textColor() {
          return this._def.ui.textColor;
        }
        get classNames() {
          return this._def.ui.classNames;
        }
        get extendedProps() {
          return this._def.extendedProps;
        }
        toPlainObject(e = {}) {
          let t = this._def,
            { ui: n } = t,
            { startStr: r, endStr: i } = this,
            o = { allDay: t.allDay };
          return (
            t.title && (o.title = t.title),
            r && (o.start = r),
            i && (o.end = i),
            t.publicId && (o.id = t.publicId),
            t.groupId && (o.groupId = t.groupId),
            t.url && (o.url = t.url),
            n.display && "auto" !== n.display && (o.display = n.display),
            e.collapseColor &&
            n.backgroundColor &&
            n.backgroundColor === n.borderColor
              ? (o.color = n.backgroundColor)
              : (n.backgroundColor && (o.backgroundColor = n.backgroundColor),
                n.borderColor && (o.borderColor = n.borderColor)),
            n.textColor && (o.textColor = n.textColor),
            n.classNames.length && (o.classNames = n.classNames),
            Object.keys(t.extendedProps).length &&
              (e.collapseExtendedProps
                ? Object.assign(o, t.extendedProps)
                : (o.extendedProps = t.extendedProps)),
            o
          );
        }
        toJSON() {
          return this.toPlainObject();
        }
      }
      function fi(e) {
        let t = e._def,
          n = e._instance;
        return {
          defs: { [t.defId]: t },
          instances: n ? { [n.instanceId]: n } : {},
        };
      }
      function pi(e, t, n) {
        let { defs: r, instances: i } = e,
          o = [],
          s = n ? n.instanceId : "";
        for (let e in i) {
          let n = i[e],
            a = r[n.defId];
          n.instanceId !== s && o.push(new hi(t, a, n));
        }
        return o;
      }
      function gi(e, t, n, r) {
        let i = {},
          o = {},
          s = {},
          a = [],
          l = [],
          c = yi(e.defs, t);
        for (let t in e.defs) {
          let n = e.defs[t];
          "inverse-background" === c[n.defId].display &&
            (n.groupId
              ? ((i[n.groupId] = []), s[n.groupId] || (s[n.groupId] = n))
              : (o[t] = []));
        }
        for (let t in e.instances) {
          let s = e.instances[t],
            u = e.defs[s.defId],
            d = c[u.defId],
            h = s.range,
            f = !u.allDay && r ? Cr(h, r) : h,
            p = Ar(f, n);
          p &&
            ("inverse-background" === d.display
              ? u.groupId
                ? i[u.groupId].push(p)
                : o[s.defId].push(p)
              : "none" !== d.display &&
                ("background" === d.display ? a : l).push({
                  def: u,
                  ui: d,
                  instance: s,
                  range: p,
                  isStart: f.start && f.start.valueOf() === p.start.valueOf(),
                  isEnd: f.end && f.end.valueOf() === p.end.valueOf(),
                }));
        }
        for (let e in i) {
          let t = br(i[e], n);
          for (let n of t) {
            let t = s[e],
              r = c[t.defId];
            a.push({
              def: t,
              ui: r,
              instance: null,
              range: n,
              isStart: !1,
              isEnd: !1,
            });
          }
        }
        for (let t in o) {
          let r = br(o[t], n);
          for (let n of r)
            a.push({
              def: e.defs[t],
              ui: c[t],
              instance: null,
              range: n,
              isStart: !1,
              isEnd: !1,
            });
        }
        return { bg: a, fg: l };
      }
      function vi(e, t) {
        e.fcSeg = t;
      }
      function mi(e) {
        return e.fcSeg || e.parentNode.fcSeg || null;
      }
      function yi(e, t) {
        return Yn(e, (e) => bi(e, t));
      }
      function bi(e, t) {
        let n = [];
        return (
          t[""] && n.push(t[""]),
          t[e.defId] && n.push(t[e.defId]),
          n.push(e.ui),
          (function (e) {
            return e.reduce(qr, Qr);
          })(n)
        );
      }
      function Ei(e) {
        let { eventRange: t } = e,
          n = t.def,
          r = t.instance ? t.instance.range : t.range,
          i = r.start ? r.start.valueOf() : 0,
          o = r.end ? r.end.valueOf() : 0;
        return Object.assign(
          Object.assign(Object.assign({}, n.extendedProps), n),
          {
            id: n.publicId,
            start: i,
            end: o,
            duration: o - i,
            allDay: Number(n.allDay),
            _seg: e,
          },
        );
      }
      function Ai(e, t) {
        let { pluginHooks: n } = t,
          r = n.isDraggableTransformers,
          { def: i, ui: o } = e.eventRange,
          s = o.startEditable;
        for (let e of r) s = e(s, i, o, t);
        return s;
      }
      function wi(e, t) {
        return (
          e.isStart &&
          e.eventRange.ui.durationEditable &&
          t.options.eventResizableFromStart
        );
      }
      function Di(e, t) {
        return e.isEnd && e.eventRange.ui.durationEditable;
      }
      function Si(e, t, n, r, i, o, s) {
        let { dateEnv: a, options: l } = n,
          { displayEventTime: c, displayEventEnd: u } = l,
          d = e.eventRange.def,
          h = e.eventRange.instance;
        null == c && (c = !1 !== r), null == u && (u = !1 !== i);
        let f = h.range.start,
          p = h.range.end,
          g = o || e.start || e.eventRange.range.start,
          v = s || e.end || e.eventRange.range.end,
          m = tn(f).valueOf() === tn(g).valueOf(),
          y = tn(Jt(p, -1)).valueOf() === tn(Jt(v, -1)).valueOf();
        return c && !d.allDay && (m || y)
          ? ((g = m ? f : g),
            (v = y ? p : v),
            u && d.hasEnd
              ? a.formatRange(g, v, t, {
                  forcedStartTzo: o ? null : h.forcedStartTzo,
                  forcedEndTzo: s ? null : h.forcedEndTzo,
                })
              : a.format(g, t, { forcedTzo: o ? null : h.forcedStartTzo }))
          : "";
      }
      function _i(e, t, n) {
        let r = e.eventRange.range;
        return {
          isPast: r.end <= (n || t.start),
          isFuture: r.start >= (n || t.end),
          isToday: t && Sr(t, r.start),
        };
      }
      function Ci(e) {
        let t = ["fc-event"];
        return (
          e.isMirror && t.push("fc-event-mirror"),
          e.isDraggable && t.push("fc-event-draggable"),
          (e.isStartResizable || e.isEndResizable) &&
            t.push("fc-event-resizable"),
          e.isDragging && t.push("fc-event-dragging"),
          e.isResizing && t.push("fc-event-resizing"),
          e.isSelected && t.push("fc-event-selected"),
          e.isStart && t.push("fc-event-start"),
          e.isEnd && t.push("fc-event-end"),
          e.isPast && t.push("fc-event-past"),
          e.isToday && t.push("fc-event-today"),
          e.isFuture && t.push("fc-event-future"),
          t
        );
      }
      function xi(e, t) {
        let { def: n, instance: r } = e.eventRange,
          { url: i } = n;
        if (i) return { href: i };
        let { emitter: o, options: s } = t,
          { eventInteractive: a } = s;
        return (
          null == a &&
            ((a = n.interactive),
            null == a && (a = Boolean(o.hasHandlers("eventClick")))),
          a
            ? Mt((e) => {
                o.trigger("eventClick", {
                  el: e.target,
                  event: new hi(t, n, r),
                  jsEvent: e,
                  view: t.viewApi,
                });
              })
            : {}
        );
      }
      const Ri = { start: Bn, end: Bn, allDay: Boolean };
      function Ti(e, t, n) {
        return Object.assign(Object.assign({}, ki(e, t, n)), {
          timeZone: t.timeZone,
        });
      }
      function ki(e, t, n) {
        return {
          start: t.toDate(e.start),
          end: t.toDate(e.end),
          startStr: t.formatIso(e.start, { omitTime: n }),
          endStr: t.formatIso(e.end, { omitTime: n }),
        };
      }
      class Mi extends Error {
        constructor(e, t) {
          super(e), (this.response = t);
        }
      }
      let Oi;
      function Ii() {
        return (
          null == Oi &&
            (Oi = (function () {
              if ("undefined" == typeof document) return !0;
              let e = document.createElement("div");
              (e.style.position = "absolute"),
                (e.style.top = "0px"),
                (e.style.left = "0px"),
                (e.innerHTML = "<table><tr><td><div></div></td></tr></table>"),
                (e.querySelector("table").style.height = "100px"),
                (e.querySelector("div").style.height = "100%"),
                document.body.appendChild(e);
              let t = e.querySelector("div").offsetHeight > 0;
              return document.body.removeChild(e), t;
            })()),
          Oi
        );
      }
      class Ni extends lr {
        constructor() {
          super(...arguments),
            (this.state = { forPrint: !1 }),
            (this.handleBeforePrint = () => {
              tr(() => {
                this.setState({ forPrint: !0 });
              });
            }),
            (this.handleAfterPrint = () => {
              tr(() => {
                this.setState({ forPrint: !1 });
              });
            });
        }
        render() {
          let { props: e } = this,
            { options: t } = e,
            { forPrint: n } = this.state,
            r = n || "auto" === t.height || "auto" === t.contentHeight,
            i = r || null == t.height ? "" : t.height,
            o = [
              "fc",
              n ? "fc-media-print" : "fc-media-screen",
              `fc-direction-${t.direction}`,
              e.theme.getClass("root"),
            ];
          return Ii() || o.push("fc-liquid-hack"), e.children(o, i, r, n);
        }
        componentDidMount() {
          let { emitter: e } = this.props;
          e.on("_beforeprint", this.handleBeforePrint),
            e.on("_afterprint", this.handleAfterPrint);
        }
        componentWillUnmount() {
          let { emitter: e } = this.props;
          e.off("_beforeprint", this.handleBeforePrint),
            e.off("_afterprint", this.handleAfterPrint);
        }
      }
      class Pi {
        constructor(e) {
          (this.component = e.component),
            (this.isHitComboAllowed = e.isHitComboAllowed || null);
        }
        destroy() {}
      }
      function Hi(e) {
        return { [e.component.uid]: e };
      }
      const ji = {};
      class Li {
        getCurrentData() {
          return this.currentDataManager.getCurrentData();
        }
        dispatch(e) {
          this.currentDataManager.dispatch(e);
        }
        get view() {
          return this.getCurrentData().viewApi;
        }
        batchRendering(e) {
          e();
        }
        updateSize() {
          this.trigger("_resize", !0);
        }
        setOption(e, t) {
          this.dispatch({
            type: "SET_OPTION",
            optionName: e,
            rawOptionValue: t,
          });
        }
        getOption(e) {
          return this.currentDataManager.currentCalendarOptionsInput[e];
        }
        getAvailableLocaleCodes() {
          return Object.keys(this.getCurrentData().availableRawLocales);
        }
        on(e, t) {
          let { currentDataManager: n } = this;
          n.currentCalendarOptionsRefiners[e]
            ? n.emitter.on(e, t)
            : console.warn(`Unknown listener name '${e}'`);
        }
        off(e, t) {
          this.currentDataManager.emitter.off(e, t);
        }
        trigger(e, ...t) {
          this.currentDataManager.emitter.trigger(e, ...t);
        }
        changeView(e, t) {
          this.batchRendering(() => {
            if ((this.unselect(), t))
              if (t.start && t.end)
                this.dispatch({ type: "CHANGE_VIEW_TYPE", viewType: e }),
                  this.dispatch({
                    type: "SET_OPTION",
                    optionName: "visibleRange",
                    rawOptionValue: t,
                  });
              else {
                let { dateEnv: n } = this.getCurrentData();
                this.dispatch({
                  type: "CHANGE_VIEW_TYPE",
                  viewType: e,
                  dateMarker: n.createMarker(t),
                });
              }
            else this.dispatch({ type: "CHANGE_VIEW_TYPE", viewType: e });
          });
        }
        zoomTo(e, t) {
          let n;
          (t = t || "day"),
            (n = this.getCurrentData().viewSpecs[t] || this.getUnitViewSpec(t)),
            this.unselect(),
            n
              ? this.dispatch({
                  type: "CHANGE_VIEW_TYPE",
                  viewType: n.type,
                  dateMarker: e,
                })
              : this.dispatch({ type: "CHANGE_DATE", dateMarker: e });
        }
        getUnitViewSpec(e) {
          let t,
            n,
            { viewSpecs: r, toolbarConfig: i } = this.getCurrentData(),
            o = [].concat(
              i.header ? i.header.viewsWithButtons : [],
              i.footer ? i.footer.viewsWithButtons : [],
            );
          for (let e in r) o.push(e);
          for (t = 0; t < o.length; t += 1)
            if (((n = r[o[t]]), n && n.singleUnit === e)) return n;
          return null;
        }
        prev() {
          this.unselect(), this.dispatch({ type: "PREV" });
        }
        next() {
          this.unselect(), this.dispatch({ type: "NEXT" });
        }
        prevYear() {
          let e = this.getCurrentData();
          this.unselect(),
            this.dispatch({
              type: "CHANGE_DATE",
              dateMarker: e.dateEnv.addYears(e.currentDate, -1),
            });
        }
        nextYear() {
          let e = this.getCurrentData();
          this.unselect(),
            this.dispatch({
              type: "CHANGE_DATE",
              dateMarker: e.dateEnv.addYears(e.currentDate, 1),
            });
        }
        today() {
          let e = this.getCurrentData();
          this.unselect(),
            this.dispatch({
              type: "CHANGE_DATE",
              dateMarker: Rr(e.calendarOptions.now, e.dateEnv),
            });
        }
        gotoDate(e) {
          let t = this.getCurrentData();
          this.unselect(),
            this.dispatch({
              type: "CHANGE_DATE",
              dateMarker: t.dateEnv.createMarker(e),
            });
        }
        incrementDate(e) {
          let t = this.getCurrentData(),
            n = Yt(e);
          n &&
            (this.unselect(),
            this.dispatch({
              type: "CHANGE_DATE",
              dateMarker: t.dateEnv.add(t.currentDate, n),
            }));
        }
        getDate() {
          let e = this.getCurrentData();
          return e.dateEnv.toDate(e.currentDate);
        }
        formatDate(e, t) {
          let { dateEnv: n } = this.getCurrentData();
          return n.format(n.createMarker(e), Rn(t));
        }
        formatRange(e, t, n) {
          let { dateEnv: r } = this.getCurrentData();
          return r.formatRange(r.createMarker(e), r.createMarker(t), Rn(n), n);
        }
        formatIso(e, t) {
          let { dateEnv: n } = this.getCurrentData();
          return n.formatIso(n.createMarker(e), { omitTime: t });
        }
        select(e, t) {
          let n;
          n =
            null == t
              ? null != e.start
                ? e
                : { start: e, end: null }
              : { start: e, end: t };
          let r = this.getCurrentData(),
            i = (function (e, t, n) {
              let r = (function (e, t) {
                  let { refined: n, extra: r } = Ln(e, Ri),
                    i = n.start ? t.createMarkerMeta(n.start) : null,
                    o = n.end ? t.createMarkerMeta(n.end) : null,
                    { allDay: s } = n;
                  return (
                    null == s &&
                      (s =
                        i &&
                        i.isTimeUnspecified &&
                        (!o || o.isTimeUnspecified)),
                    Object.assign(
                      {
                        range: {
                          start: i ? i.marker : null,
                          end: o ? o.marker : null,
                        },
                        allDay: s,
                      },
                      r,
                    )
                  );
                })(e, t),
                { range: i } = r;
              if (!i.start) return null;
              if (!i.end) {
                if (null == n) return null;
                i.end = t.add(i.start, n);
              }
              return r;
            })(n, r.dateEnv, Yt({ days: 1 }));
          i &&
            (this.dispatch({ type: "SELECT_DATES", selection: i }),
            oi(i, null, r));
        }
        unselect(e) {
          let t = this.getCurrentData();
          t.dateSelection &&
            (this.dispatch({ type: "UNSELECT_DATES" }),
            (function (e, t) {
              t.emitter.trigger("unselect", {
                jsEvent: e ? e.origEvent : null,
                view: t.viewApi || t.calendarApi.view,
              });
            })(e, t));
        }
        addEvent(e, t) {
          if (e instanceof hi) {
            let t = e._def,
              n = e._instance;
            return (
              this.getCurrentData().eventStore.defs[t.defId] ||
                (this.dispatch({
                  type: "ADD_EVENTS",
                  eventStore: zr({ def: t, instance: n }),
                }),
                this.triggerEventAdd(e)),
              e
            );
          }
          let n,
            r = this.getCurrentData();
          if (t instanceof di) n = t.internalEventSource;
          else if ("boolean" == typeof t) t && ([n] = Vn(r.eventSources));
          else if (null != t) {
            let e = this.getEventSourceById(t);
            if (!e)
              return (
                console.warn(`Could not find an event source with ID "${t}"`),
                null
              );
            n = e.internalEventSource;
          }
          let i = Hr(e, n, r, !1);
          if (i) {
            let e = new hi(r, i.def, i.def.recurringDef ? null : i.instance);
            return (
              this.dispatch({ type: "ADD_EVENTS", eventStore: zr(i) }),
              this.triggerEventAdd(e),
              e
            );
          }
          return null;
        }
        triggerEventAdd(e) {
          let { emitter: t } = this.getCurrentData();
          t.trigger("eventAdd", {
            event: e,
            relatedEvents: [],
            revert: () => {
              this.dispatch({ type: "REMOVE_EVENTS", eventStore: fi(e) });
            },
          });
        }
        getEventById(e) {
          let t = this.getCurrentData(),
            { defs: n, instances: r } = t.eventStore;
          e = String(e);
          for (let i in n) {
            let o = n[i];
            if (o.publicId === e) {
              if (o.recurringDef) return new hi(t, o, null);
              for (let e in r) {
                let n = r[e];
                if (n.defId === o.defId) return new hi(t, o, n);
              }
            }
          }
          return null;
        }
        getEvents() {
          let e = this.getCurrentData();
          return pi(e.eventStore, e);
        }
        removeAllEvents() {
          this.dispatch({ type: "REMOVE_ALL_EVENTS" });
        }
        getEventSources() {
          let e = this.getCurrentData(),
            t = e.eventSources,
            n = [];
          for (let r in t) n.push(new di(e, t[r]));
          return n;
        }
        getEventSourceById(e) {
          let t = this.getCurrentData(),
            n = t.eventSources;
          e = String(e);
          for (let r in n) if (n[r].publicId === e) return new di(t, n[r]);
          return null;
        }
        addEventSource(e) {
          let t = this.getCurrentData();
          if (e instanceof di)
            return (
              t.eventSources[e.internalEventSource.sourceId] ||
                this.dispatch({
                  type: "ADD_EVENT_SOURCES",
                  sources: [e.internalEventSource],
                }),
              e
            );
          let n = Xr(e, t);
          return n
            ? (this.dispatch({ type: "ADD_EVENT_SOURCES", sources: [n] }),
              new di(t, n))
            : null;
        }
        removeAllEventSources() {
          this.dispatch({ type: "REMOVE_ALL_EVENT_SOURCES" });
        }
        refetchEvents() {
          this.dispatch({ type: "FETCH_EVENT_SOURCES", isRefetch: !0 });
        }
        scrollToTime(e) {
          let t = Yt(e);
          t && this.trigger("_scrollRequest", { time: t });
        }
      }
      function Bi(e, t) {
        return (
          e.left >= t.left &&
          e.left < t.right &&
          e.top >= t.top &&
          e.top < t.bottom
        );
      }
      function Ui(e, t) {
        let n = {
          left: Math.max(e.left, t.left),
          right: Math.min(e.right, t.right),
          top: Math.max(e.top, t.top),
          bottom: Math.min(e.bottom, t.bottom),
        };
        return n.left < n.right && n.top < n.bottom && n;
      }
      function zi(e, t, n, r) {
        return {
          dow: e.getUTCDay(),
          isDisabled: Boolean(r && !Sr(r.activeRange, e)),
          isOther: Boolean(r && !Sr(r.currentRange, e)),
          isToday: Boolean(t && Sr(t, e)),
          isPast: Boolean(n ? e < n : !!t && e < t.start),
          isFuture: Boolean(n ? e > n : !!t && e >= t.end),
        };
      }
      function Wi(e, t) {
        let n = ["fc-day", `fc-day-${qt[e.dow]}`];
        return (
          e.isDisabled
            ? n.push("fc-day-disabled")
            : (e.isToday &&
                (n.push("fc-day-today"), n.push(t.getClass("today"))),
              e.isPast && n.push("fc-day-past"),
              e.isFuture && n.push("fc-day-future"),
              e.isOther && n.push("fc-day-other")),
          n
        );
      }
      const Yi = Rn({ year: "numeric", month: "long", day: "numeric" }),
        Fi = Rn({ week: "long" });
      function Vi(e, t, n = "day", r = !0) {
        const { dateEnv: i, options: o, calendarApi: s } = e;
        let a = i.format(t, "week" === n ? Fi : Yi);
        if (o.navLinks) {
          let e = i.toDate(t);
          const l = (e) => {
            let r =
              "day" === n
                ? o.navLinkDayClick
                : "week" === n
                  ? o.navLinkWeekClick
                  : null;
            "function" == typeof r
              ? r.call(s, i.toDate(t), e)
              : ("string" == typeof r && (n = r), s.zoomTo(t, n));
          };
          return Object.assign(
            { title: Lt(o.navLinkHint, [a, e], a), "data-navlink": "" },
            r ? kt(l) : { onClick: l },
          );
        }
        return { "aria-label": a };
      }
      let Gi,
        Qi = null;
      function $i(e) {
        return {
          x: e.offsetHeight - e.clientHeight,
          y: e.offsetWidth - e.clientWidth,
        };
      }
      function qi(e, t = !1, n) {
        let r = n ? e.getBoundingClientRect() : Zi(e),
          i = (function (e, t = !1) {
            let n = window.getComputedStyle(e),
              r = parseInt(n.borderLeftWidth, 10) || 0,
              i = parseInt(n.borderRightWidth, 10) || 0,
              o = parseInt(n.borderTopWidth, 10) || 0,
              s = parseInt(n.borderBottomWidth, 10) || 0,
              a = $i(e),
              l = a.y - r - i,
              c = {
                borderLeft: r,
                borderRight: i,
                borderTop: o,
                borderBottom: s,
                scrollbarBottom: a.x - o - s,
                scrollbarLeft: 0,
                scrollbarRight: 0,
              };
            return (
              null === Qi &&
                (Qi = (function () {
                  let e = document.createElement("div");
                  wt(e, {
                    position: "absolute",
                    top: -1e3,
                    left: 0,
                    border: 0,
                    padding: 0,
                    overflow: "scroll",
                    direction: "rtl",
                  }),
                    (e.innerHTML = "<div></div>"),
                    document.body.appendChild(e);
                  let t =
                    e.firstChild.getBoundingClientRect().left >
                    e.getBoundingClientRect().left;
                  return yt(e), t;
                })()),
              Qi && "rtl" === n.direction
                ? (c.scrollbarLeft = l)
                : (c.scrollbarRight = l),
              t &&
                ((c.paddingLeft = parseInt(n.paddingLeft, 10) || 0),
                (c.paddingRight = parseInt(n.paddingRight, 10) || 0),
                (c.paddingTop = parseInt(n.paddingTop, 10) || 0),
                (c.paddingBottom = parseInt(n.paddingBottom, 10) || 0)),
              c
            );
          })(e, t),
          o = {
            left: r.left + i.borderLeft + i.scrollbarLeft,
            right: r.right - i.borderRight - i.scrollbarRight,
            top: r.top + i.borderTop,
            bottom: r.bottom - i.borderBottom - i.scrollbarBottom,
          };
        return (
          t &&
            ((o.left += i.paddingLeft),
            (o.right -= i.paddingRight),
            (o.top += i.paddingTop),
            (o.bottom -= i.paddingBottom)),
          o
        );
      }
      function Zi(e) {
        let t = e.getBoundingClientRect();
        return {
          left: t.left + window.scrollX,
          top: t.top + window.scrollY,
          right: t.right + window.scrollX,
          bottom: t.bottom + window.scrollY,
        };
      }
      function Xi(e) {
        let t = [];
        for (; e instanceof HTMLElement; ) {
          let n = window.getComputedStyle(e);
          if ("fixed" === n.position) break;
          /(auto|scroll)/.test(n.overflow + n.overflowY + n.overflowX) &&
            t.push(e),
            (e = e.parentNode);
        }
        return t;
      }
      class Ji {
        constructor(e, t, n, r) {
          this.els = t;
          let i = (this.originClientRect = e.getBoundingClientRect());
          n && this.buildElHorizontals(i.left),
            r && this.buildElVerticals(i.top);
        }
        buildElHorizontals(e) {
          let t = [],
            n = [];
          for (let r of this.els) {
            let i = r.getBoundingClientRect();
            t.push(i.left - e), n.push(i.right - e);
          }
          (this.lefts = t), (this.rights = n);
        }
        buildElVerticals(e) {
          let t = [],
            n = [];
          for (let r of this.els) {
            let i = r.getBoundingClientRect();
            t.push(i.top - e), n.push(i.bottom - e);
          }
          (this.tops = t), (this.bottoms = n);
        }
        leftToIndex(e) {
          let t,
            { lefts: n, rights: r } = this,
            i = n.length;
          for (t = 0; t < i; t += 1) if (e >= n[t] && e < r[t]) return t;
        }
        topToIndex(e) {
          let t,
            { tops: n, bottoms: r } = this,
            i = n.length;
          for (t = 0; t < i; t += 1) if (e >= n[t] && e < r[t]) return t;
        }
        getWidth(e) {
          return this.rights[e] - this.lefts[e];
        }
        getHeight(e) {
          return this.bottoms[e] - this.tops[e];
        }
        similarTo(e) {
          return (
            Ki(this.tops || [], e.tops || []) &&
            Ki(this.bottoms || [], e.bottoms || []) &&
            Ki(this.lefts || [], e.lefts || []) &&
            Ki(this.rights || [], e.rights || [])
          );
        }
      }
      function Ki(e, t) {
        const n = e.length;
        if (n !== t.length) return !1;
        for (let r = 0; r < n; r++)
          if (Math.round(e[r]) !== Math.round(t[r])) return !1;
        return !0;
      }
      class eo {
        getMaxScrollTop() {
          return this.getScrollHeight() - this.getClientHeight();
        }
        getMaxScrollLeft() {
          return this.getScrollWidth() - this.getClientWidth();
        }
        canScrollVertically() {
          return this.getMaxScrollTop() > 0;
        }
        canScrollHorizontally() {
          return this.getMaxScrollLeft() > 0;
        }
        canScrollUp() {
          return this.getScrollTop() > 0;
        }
        canScrollDown() {
          return this.getScrollTop() < this.getMaxScrollTop();
        }
        canScrollLeft() {
          return this.getScrollLeft() > 0;
        }
        canScrollRight() {
          return this.getScrollLeft() < this.getMaxScrollLeft();
        }
      }
      class to extends eo {
        constructor(e) {
          super(), (this.el = e);
        }
        getScrollTop() {
          return this.el.scrollTop;
        }
        getScrollLeft() {
          return this.el.scrollLeft;
        }
        setScrollTop(e) {
          this.el.scrollTop = e;
        }
        setScrollLeft(e) {
          this.el.scrollLeft = e;
        }
        getScrollWidth() {
          return this.el.scrollWidth;
        }
        getScrollHeight() {
          return this.el.scrollHeight;
        }
        getClientHeight() {
          return this.el.clientHeight;
        }
        getClientWidth() {
          return this.el.clientWidth;
        }
      }
      class no extends eo {
        getScrollTop() {
          return window.scrollY;
        }
        getScrollLeft() {
          return window.scrollX;
        }
        setScrollTop(e) {
          window.scroll(window.scrollX, e);
        }
        setScrollLeft(e) {
          window.scroll(e, window.scrollY);
        }
        getScrollWidth() {
          return document.documentElement.scrollWidth;
        }
        getScrollHeight() {
          return document.documentElement.scrollHeight;
        }
        getClientHeight() {
          return document.documentElement.clientHeight;
        }
        getClientWidth() {
          return document.documentElement.clientWidth;
        }
      }
      class ro extends lr {
        constructor() {
          super(...arguments), (this.uid = It());
        }
        prepareHits() {}
        queryHit(e, t, n, r) {
          return null;
        }
        isValidSegDownEl(e) {
          return (
            !this.props.eventDrag &&
            !this.props.eventResize &&
            !bt(e, ".fc-event-mirror")
          );
        }
        isValidDateDownEl(e) {
          return !(
            bt(e, ".fc-event:not(.fc-bg-event)") ||
            bt(e, ".fc-more-link") ||
            bt(e, "a[data-navlink]") ||
            bt(e, ".fc-popover")
          );
        }
      }
      class io {
        constructor(e = (e) => e.thickness || 1) {
          (this.getEntryThickness = e),
            (this.strictOrder = !1),
            (this.allowReslicing = !1),
            (this.maxCoord = -1),
            (this.maxStackCnt = -1),
            (this.levelCoords = []),
            (this.entriesByLevel = []),
            (this.stackCnts = {});
        }
        addSegs(e) {
          let t = [];
          for (let n of e) this.insertEntry(n, t);
          return t;
        }
        insertEntry(e, t) {
          let n = this.findInsertion(e);
          this.isInsertionValid(n, e)
            ? this.insertEntryAt(e, n)
            : this.handleInvalidInsertion(n, e, t);
        }
        isInsertionValid(e, t) {
          return (
            (-1 === this.maxCoord ||
              e.levelCoord + this.getEntryThickness(t) <= this.maxCoord) &&
            (-1 === this.maxStackCnt || e.stackCnt < this.maxStackCnt)
          );
        }
        handleInvalidInsertion(e, t, n) {
          if (this.allowReslicing && e.touchingEntry) {
            const r = Object.assign(Object.assign({}, t), {
              span: ao(t.span, e.touchingEntry.span),
            });
            n.push(r), this.splitEntry(t, e.touchingEntry, n);
          } else n.push(t);
        }
        splitEntry(e, t, n) {
          let r = e.span,
            i = t.span;
          r.start < i.start &&
            this.insertEntry(
              {
                index: e.index,
                thickness: e.thickness,
                span: { start: r.start, end: i.start },
              },
              n,
            ),
            r.end > i.end &&
              this.insertEntry(
                {
                  index: e.index,
                  thickness: e.thickness,
                  span: { start: i.end, end: r.end },
                },
                n,
              );
        }
        insertEntryAt(e, t) {
          let { entriesByLevel: n, levelCoords: r } = this;
          -1 === t.lateral
            ? (lo(r, t.level, t.levelCoord), lo(n, t.level, [e]))
            : lo(n[t.level], t.lateral, e),
            (this.stackCnts[so(e)] = t.stackCnt);
        }
        findInsertion(e) {
          let {
              levelCoords: t,
              entriesByLevel: n,
              strictOrder: r,
              stackCnts: i,
            } = this,
            o = t.length,
            s = 0,
            a = -1,
            l = -1,
            c = null,
            u = 0;
          for (let d = 0; d < o; d += 1) {
            const o = t[d];
            if (!r && o >= s + this.getEntryThickness(e)) break;
            let h,
              f = n[d],
              p = co(f, e.span.start, oo),
              g = p[0] + p[1];
            for (; (h = f[g]) && h.span.start < e.span.end; ) {
              let e = o + this.getEntryThickness(h);
              e > s && ((s = e), (c = h), (a = d), (l = g)),
                e === s && (u = Math.max(u, i[so(h)] + 1)),
                (g += 1);
            }
          }
          let d = 0;
          if (c) for (d = a + 1; d < o && t[d] < s; ) d += 1;
          let h = -1;
          return (
            d < o && t[d] === s && (h = co(n[d], e.span.end, oo)[0]),
            {
              touchingLevel: a,
              touchingLateral: l,
              touchingEntry: c,
              stackCnt: u,
              levelCoord: s,
              level: d,
              lateral: h,
            }
          );
        }
        toRects() {
          let { entriesByLevel: e, levelCoords: t } = this,
            n = e.length,
            r = [];
          for (let i = 0; i < n; i += 1) {
            let n = e[i],
              o = t[i];
            for (let e of n)
              r.push(
                Object.assign(Object.assign({}, e), {
                  thickness: this.getEntryThickness(e),
                  levelCoord: o,
                }),
              );
          }
          return r;
        }
      }
      function oo(e) {
        return e.span.end;
      }
      function so(e) {
        return e.index + ":" + e.span.start;
      }
      function ao(e, t) {
        let n = Math.max(e.start, t.start),
          r = Math.min(e.end, t.end);
        return n < r ? { start: n, end: r } : null;
      }
      function lo(e, t, n) {
        e.splice(t, 0, n);
      }
      function co(e, t, n) {
        let r = 0,
          i = e.length;
        if (!i || t < n(e[r])) return [0, 0];
        if (t > n(e[i - 1])) return [i, 0];
        for (; r < i; ) {
          let o = Math.floor(r + (i - r) / 2),
            s = n(e[o]);
          if (t < s) i = o;
          else {
            if (!(t > s)) return [o, 1];
            r = o + 1;
          }
        }
        return [r, 0];
      }
      class uo {
        constructor(e, t) {
          this.emitter = new ri();
        }
        destroy() {}
        setMirrorIsVisible(e) {}
        setMirrorNeedsRevert(e) {}
        setAutoScrollEnabled(e) {}
      }
      const ho = {};
      Boolean;
      const fo = "fc-col-header-cell";
      function po(e) {
        return e.text;
      }
      class go extends lr {
        render() {
          let { dateEnv: e, options: t, theme: n, viewApi: r } = this.context,
            { props: i } = this,
            { date: o, dateProfile: s } = i,
            a = zi(o, i.todayRange, null, s),
            l = [fo].concat(Wi(a, n)),
            c = e.format(o, i.dayHeaderFormat),
            u = !a.isDisabled && i.colCnt > 1 ? Vi(this.context, o) : {},
            d = Object.assign(
              Object.assign(
                Object.assign(
                  { date: e.toDate(o), view: r },
                  i.extraRenderProps,
                ),
                { text: c },
              ),
              a,
            );
          return te(
            gr,
            {
              elTag: "th",
              elClasses: l,
              elAttrs: Object.assign(
                {
                  role: "columnheader",
                  colSpan: i.colSpan,
                  "data-date": a.isDisabled ? void 0 : dn(o),
                },
                i.extraDataAttrs,
              ),
              renderProps: d,
              generatorName: "dayHeaderContent",
              customGenerator: t.dayHeaderContent,
              defaultGenerator: po,
              classNameGenerator: t.dayHeaderClassNames,
              didMount: t.dayHeaderDidMount,
              willUnmount: t.dayHeaderWillUnmount,
            },
            (e) =>
              te(
                "div",
                { className: "fc-scrollgrid-sync-inner" },
                !a.isDisabled &&
                  te(e, {
                    elTag: "a",
                    elAttrs: u,
                    elClasses: [
                      "fc-col-header-cell-cushion",
                      i.isSticky && "fc-sticky",
                    ],
                  }),
              ),
          );
        }
      }
      const vo = Rn({ weekday: "long" });
      class mo extends lr {
        render() {
          let { props: e } = this,
            { dateEnv: t, theme: n, viewApi: r, options: i } = this.context,
            o = Xt(new Date(2592e5), e.dow),
            s = {
              dow: e.dow,
              isDisabled: !1,
              isFuture: !1,
              isPast: !1,
              isToday: !1,
              isOther: !1,
            },
            a = t.format(o, e.dayHeaderFormat),
            l = Object.assign(
              Object.assign(
                Object.assign(Object.assign({ date: o }, s), { view: r }),
                e.extraRenderProps,
              ),
              { text: a },
            );
          return te(
            gr,
            {
              elTag: "th",
              elClasses: [fo, ...Wi(s, n), ...(e.extraClassNames || [])],
              elAttrs: Object.assign(
                { role: "columnheader", colSpan: e.colSpan },
                e.extraDataAttrs,
              ),
              renderProps: l,
              generatorName: "dayHeaderContent",
              customGenerator: i.dayHeaderContent,
              defaultGenerator: po,
              classNameGenerator: i.dayHeaderClassNames,
              didMount: i.dayHeaderDidMount,
              willUnmount: i.dayHeaderWillUnmount,
            },
            (n) =>
              te(
                "div",
                { className: "fc-scrollgrid-sync-inner" },
                te(n, {
                  elTag: "a",
                  elClasses: [
                    "fc-col-header-cell-cushion",
                    e.isSticky && "fc-sticky",
                  ],
                  elAttrs: { "aria-label": t.format(o, vo) },
                }),
              ),
          );
        }
      }
      class yo extends le {
        constructor(e, t) {
          super(e, t),
            (this.initialNowDate = Rr(t.options.now, t.dateEnv)),
            (this.initialNowQueriedMs = new Date().valueOf()),
            (this.state = this.computeTiming().currentState);
        }
        render() {
          let { props: e, state: t } = this;
          return e.children(t.nowDate, t.todayRange);
        }
        componentDidMount() {
          this.setTimeout();
        }
        componentDidUpdate(e) {
          e.unit !== this.props.unit &&
            (this.clearTimeout(), this.setTimeout());
        }
        componentWillUnmount() {
          this.clearTimeout();
        }
        computeTiming() {
          let { props: e, context: t } = this,
            n = Jt(
              this.initialNowDate,
              new Date().valueOf() - this.initialNowQueriedMs,
            ),
            r = t.dateEnv.startOf(n, e.unit),
            i = t.dateEnv.add(r, Yt(1, e.unit)),
            o = i.valueOf() - n.valueOf();
          return (
            (o = Math.min(864e5, o)),
            {
              currentState: { nowDate: r, todayRange: bo(r) },
              nextState: { nowDate: i, todayRange: bo(i) },
              waitMs: o,
            }
          );
        }
        setTimeout() {
          let { nextState: e, waitMs: t } = this.computeTiming();
          this.timeoutId = setTimeout(() => {
            this.setState(e, () => {
              this.setTimeout();
            });
          }, t);
        }
        clearTimeout() {
          this.timeoutId && clearTimeout(this.timeoutId);
        }
      }
      function bo(e) {
        let t = tn(e);
        return { start: t, end: Xt(t, 1) };
      }
      yo.contextType = or;
      class Eo extends lr {
        constructor() {
          super(...arguments), (this.createDayHeaderFormatter = fn(Ao));
        }
        render() {
          let { context: e } = this,
            {
              dates: t,
              dateProfile: n,
              datesRepDistinctDays: r,
              renderIntro: i,
            } = this.props,
            o = this.createDayHeaderFormatter(
              e.options.dayHeaderFormat,
              r,
              t.length,
            );
          return te(yo, { unit: "day" }, (e, s) =>
            te(
              "tr",
              { role: "row" },
              i && i("day"),
              t.map((e) =>
                r
                  ? te(go, {
                      key: e.toISOString(),
                      date: e,
                      dateProfile: n,
                      todayRange: s,
                      colCnt: t.length,
                      dayHeaderFormat: o,
                    })
                  : te(mo, {
                      key: e.getUTCDay(),
                      dow: e.getUTCDay(),
                      dayHeaderFormat: o,
                    }),
              ),
            ),
          );
        }
      }
      function Ao(e, t, n) {
        return (
          e ||
          (function (e, t) {
            return Rn(
              !e || t > 10
                ? { weekday: "short" }
                : t > 1
                  ? {
                      weekday: "short",
                      month: "numeric",
                      day: "numeric",
                      omitCommas: !0,
                    }
                  : { weekday: "long" },
            );
          })(t, n)
        );
      }
      class wo {
        constructor(e, t) {
          let n = e.start,
            { end: r } = e,
            i = [],
            o = [],
            s = -1;
          for (; n < r; )
            t.isHiddenDay(n)
              ? i.push(s + 0.5)
              : ((s += 1), i.push(s), o.push(n)),
              (n = Xt(n, 1));
          (this.dates = o), (this.indices = i), (this.cnt = o.length);
        }
        sliceRange(e) {
          let t = this.getDateDayIndex(e.start),
            n = this.getDateDayIndex(Xt(e.end, -1)),
            r = Math.max(0, t),
            i = Math.min(this.cnt - 1, n);
          return (
            (r = Math.ceil(r)),
            (i = Math.floor(i)),
            r <= i
              ? {
                  firstIndex: r,
                  lastIndex: i,
                  isStart: t === r,
                  isEnd: n === i,
                }
              : null
          );
        }
        getDateDayIndex(e) {
          let { indices: t } = this,
            n = Math.floor(Kt(this.dates[0], e));
          return n < 0 ? t[0] - 1 : n >= t.length ? t[t.length - 1] + 1 : t[n];
        }
      }
      class Do {
        constructor(e, t) {
          let n,
            r,
            i,
            { dates: o } = e;
          if (t) {
            for (
              r = o[0].getUTCDay(), n = 1;
              n < o.length && o[n].getUTCDay() !== r;
              n += 1
            );
            i = Math.ceil(o.length / n);
          } else (i = 1), (n = o.length);
          (this.rowCnt = i),
            (this.colCnt = n),
            (this.daySeries = e),
            (this.cells = this.buildCells()),
            (this.headerDates = this.buildHeaderDates());
        }
        buildCells() {
          let e = [];
          for (let t = 0; t < this.rowCnt; t += 1) {
            let n = [];
            for (let e = 0; e < this.colCnt; e += 1)
              n.push(this.buildCell(t, e));
            e.push(n);
          }
          return e;
        }
        buildCell(e, t) {
          let n = this.daySeries.dates[e * this.colCnt + t];
          return { key: n.toISOString(), date: n };
        }
        buildHeaderDates() {
          let e = [];
          for (let t = 0; t < this.colCnt; t += 1)
            e.push(this.cells[0][t].date);
          return e;
        }
        sliceRange(e) {
          let { colCnt: t } = this,
            n = this.daySeries.sliceRange(e),
            r = [];
          if (n) {
            let { firstIndex: e, lastIndex: i } = n,
              o = e;
            for (; o <= i; ) {
              let s = Math.floor(o / t),
                a = Math.min((s + 1) * t, i + 1);
              r.push({
                row: s,
                firstCol: o % t,
                lastCol: (a - 1) % t,
                isStart: n.isStart && o === e,
                isEnd: n.isEnd && a - 1 === i,
              }),
                (o = a);
            }
          }
          return r;
        }
      }
      class So {
        constructor() {
          (this.sliceBusinessHours = fn(this._sliceBusinessHours)),
            (this.sliceDateSelection = fn(this._sliceDateSpan)),
            (this.sliceEventStore = fn(this._sliceEventStore)),
            (this.sliceEventDrag = fn(this._sliceInteraction)),
            (this.sliceEventResize = fn(this._sliceInteraction)),
            (this.forceDayIfListItem = !1);
        }
        sliceProps(e, t, n, r, ...i) {
          let { eventUiBases: o } = e,
            s = this.sliceEventStore(e.eventStore, o, t, n, ...i);
          return {
            dateSelectionSegs: this.sliceDateSelection(
              e.dateSelection,
              t,
              n,
              o,
              r,
              ...i,
            ),
            businessHourSegs: this.sliceBusinessHours(
              e.businessHours,
              t,
              n,
              r,
              ...i,
            ),
            fgEventSegs: s.fg,
            bgEventSegs: s.bg,
            eventDrag: this.sliceEventDrag(e.eventDrag, o, t, n, ...i),
            eventResize: this.sliceEventResize(e.eventResize, o, t, n, ...i),
            eventSelection: e.eventSelection,
          };
        }
        sliceNowDate(e, t, n, r, ...i) {
          return this._sliceDateSpan(
            { range: { start: e, end: Jt(e, 1) }, allDay: !1 },
            t,
            n,
            {},
            r,
            ...i,
          );
        }
        _sliceBusinessHours(e, t, n, r, ...i) {
          return e
            ? this._sliceEventStore(Mr(e, _o(t, Boolean(n)), r), {}, t, n, ...i)
                .bg
            : [];
        }
        _sliceEventStore(e, t, n, r, ...i) {
          if (e) {
            let o = gi(e, t, _o(n, Boolean(r)), r);
            return {
              bg: this.sliceEventRanges(o.bg, i),
              fg: this.sliceEventRanges(o.fg, i),
            };
          }
          return { bg: [], fg: [] };
        }
        _sliceInteraction(e, t, n, r, ...i) {
          if (!e) return null;
          let o = gi(e.mutatedEvents, t, _o(n, Boolean(r)), r);
          return {
            segs: this.sliceEventRanges(o.fg, i),
            affectedInstances: e.affectedEvents.instances,
            isEvent: e.isEvent,
          };
        }
        _sliceDateSpan(e, t, n, r, i, ...o) {
          if (!e) return [];
          let s = _o(t, Boolean(n)),
            a = Ar(e.range, s);
          if (a) {
            let t = (function (e, t, n) {
                let r = jr({ editable: !1 }, n),
                  i = Br(r.refined, r.extra, "", e.allDay, !0, n);
                return {
                  def: i,
                  ui: bi(i, t),
                  instance: kr(i.defId, e.range),
                  range: e.range,
                  isStart: !0,
                  isEnd: !0,
                };
              })((e = Object.assign(Object.assign({}, e), { range: a })), r, i),
              n = this.sliceRange(e.range, ...o);
            for (let e of n) e.eventRange = t;
            return n;
          }
          return [];
        }
        sliceEventRanges(e, t) {
          let n = [];
          for (let r of e) n.push(...this.sliceEventRange(r, t));
          return n;
        }
        sliceEventRange(e, t) {
          let n = e.range;
          this.forceDayIfListItem &&
            "list-item" === e.ui.display &&
            (n = { start: n.start, end: Xt(n.start, 1) });
          let r = this.sliceRange(n, ...t);
          for (let t of r)
            (t.eventRange = e),
              (t.isStart = e.isStart && t.isStart),
              (t.isEnd = e.isEnd && t.isEnd);
          return r;
        }
      }
      function _o(e, t) {
        let n = e.activeRange;
        return t
          ? n
          : {
              start: Jt(n.start, e.slotMinTime.milliseconds),
              end: Jt(n.end, e.slotMaxTime.milliseconds - 864e5),
            };
      }
      function Co(e, t, n) {
        let { instances: r } = e.mutatedEvents;
        for (let e in r) if (!Dr(t.validRange, r[e].range)) return !1;
        return xo({ eventDrag: e }, n);
      }
      function xo(e, t) {
        let n = t.getCurrentData(),
          r = Object.assign(
            {
              businessHours: n.businessHours,
              dateSelection: "",
              eventStore: n.eventStore,
              eventUiBases: n.eventUiBases,
              eventSelection: "",
              eventDrag: null,
              eventResize: null,
            },
            e,
          );
        return (t.pluginHooks.isPropsValid || Ro)(r, t);
      }
      function Ro(e, t, n = {}, r) {
        return !(
          (e.eventDrag &&
            !(function (e, t, n, r) {
              let i = t.getCurrentData(),
                o = e.eventDrag,
                s = o.mutatedEvents,
                a = s.defs,
                l = s.instances,
                c = yi(
                  a,
                  o.isEvent ? e.eventUiBases : { "": i.selectionConfig },
                );
              r && (c = Yn(c, r));
              let u =
                  ((p = e.eventStore),
                  (g = o.affectedEvents.instances),
                  {
                    defs: p.defs,
                    instances: Wn(p.instances, (e) => !g[e.instanceId]),
                  }),
                d = u.defs,
                h = u.instances,
                f = yi(d, e.eventUiBases);
              var p, g;
              for (let r in l) {
                let s = l[r],
                  p = s.range,
                  g = c[s.defId],
                  v = a[s.defId];
                if (!To(g.constraints, p, u, e.businessHours, t)) return !1;
                let { eventOverlap: m } = t.options,
                  y = "function" == typeof m ? m : null;
                for (let e in h) {
                  let n = h[e];
                  if (wr(p, n.range)) {
                    if (!1 === f[n.defId].overlap && o.isEvent) return !1;
                    if (!1 === g.overlap) return !1;
                    if (y && !y(new hi(t, d[n.defId], n), new hi(t, v, s)))
                      return !1;
                  }
                }
                let b = i.eventStore;
                for (let e of g.allows) {
                  let i,
                    o = Object.assign(Object.assign({}, n), {
                      range: s.range,
                      allDay: v.allDay,
                    }),
                    a = b.defs[v.defId],
                    l = b.instances[r];
                  if (
                    ((i = a ? new hi(t, a, l) : new hi(t, v)), !e(si(o, t), i))
                  )
                    return !1;
                }
              }
              return !0;
            })(e, t, n, r)) ||
          (e.dateSelection &&
            !(function (e, t, n, r) {
              let i = e.eventStore,
                o = i.defs,
                s = i.instances,
                a = e.dateSelection,
                l = a.range,
                { selectionConfig: c } = t.getCurrentData();
              if (
                (r && (c = r(c)), !To(c.constraints, l, i, e.businessHours, t))
              )
                return !1;
              let { selectOverlap: u } = t.options,
                d = "function" == typeof u ? u : null;
              for (let e in s) {
                let n = s[e];
                if (wr(l, n.range)) {
                  if (!1 === c.overlap) return !1;
                  if (d && !d(new hi(t, o[n.defId], n), null)) return !1;
                }
              }
              for (let e of c.allows)
                if (!e(si(Object.assign(Object.assign({}, n), a), t), null))
                  return !1;
              return !0;
            })(e, t, n, r))
        );
      }
      function To(e, t, n, r, i) {
        for (let o of e) if (!Oo(ko(o, t, n, r, i), t)) return !1;
        return !0;
      }
      function ko(e, t, n, r, i) {
        return "businessHours" === e
          ? Mo(Mr(r, t, i))
          : "string" == typeof e
            ? Mo(Fr(n, (t) => t.groupId === e))
            : "object" == typeof e && e
              ? Mo(Mr(e, t, i))
              : [];
      }
      function Mo(e) {
        let { instances: t } = e,
          n = [];
        for (let e in t) n.push(t[e].range);
        return n;
      }
      function Oo(e, t) {
        for (let n of e) if (Dr(n, t)) return !0;
        return !1;
      }
      const Io = /^(visible|hidden)$/;
      class No extends lr {
        constructor() {
          super(...arguments),
            (this.handleEl = (e) => {
              (this.el = e), cr(this.props.elRef, e);
            });
        }
        render() {
          let { props: e } = this,
            { liquid: t, liquidIsAbsolute: n } = e,
            r = t && n,
            i = ["fc-scroller"];
          return (
            t &&
              (n
                ? i.push("fc-scroller-liquid-absolute")
                : i.push("fc-scroller-liquid")),
            te(
              "div",
              {
                ref: this.handleEl,
                className: i.join(" "),
                style: {
                  overflowX: e.overflowX,
                  overflowY: e.overflowY,
                  left: (r && -(e.overcomeLeft || 0)) || "",
                  right: (r && -(e.overcomeRight || 0)) || "",
                  bottom: (r && -(e.overcomeBottom || 0)) || "",
                  marginLeft: (!r && -(e.overcomeLeft || 0)) || "",
                  marginRight: (!r && -(e.overcomeRight || 0)) || "",
                  marginBottom: (!r && -(e.overcomeBottom || 0)) || "",
                  maxHeight: e.maxHeight || "",
                },
              },
              e.children,
            )
          );
        }
        needsXScrolling() {
          if (Io.test(this.props.overflowX)) return !1;
          let { el: e } = this,
            t =
              this.el.getBoundingClientRect().width - this.getYScrollbarWidth(),
            { children: n } = e;
          for (let e = 0; e < n.length; e += 1)
            if (n[e].getBoundingClientRect().width > t) return !0;
          return !1;
        }
        needsYScrolling() {
          if (Io.test(this.props.overflowY)) return !1;
          let { el: e } = this,
            t =
              this.el.getBoundingClientRect().height -
              this.getXScrollbarWidth(),
            { children: n } = e;
          for (let e = 0; e < n.length; e += 1)
            if (n[e].getBoundingClientRect().height > t) return !0;
          return !1;
        }
        getXScrollbarWidth() {
          return Io.test(this.props.overflowX)
            ? 0
            : this.el.offsetHeight - this.el.clientHeight;
        }
        getYScrollbarWidth() {
          return Io.test(this.props.overflowY)
            ? 0
            : this.el.offsetWidth - this.el.clientWidth;
        }
      }
      class Po {
        constructor(e) {
          (this.masterCallback = e),
            (this.currentMap = {}),
            (this.depths = {}),
            (this.callbackMap = {}),
            (this.handleValue = (e, t) => {
              let { depths: n, currentMap: r } = this,
                i = !1,
                o = !1;
              null !== e
                ? ((i = t in r), (r[t] = e), (n[t] = (n[t] || 0) + 1), (o = !0))
                : ((n[t] -= 1),
                  n[t] || (delete r[t], delete this.callbackMap[t], (i = !0))),
                this.masterCallback &&
                  (i && this.masterCallback(null, String(t)),
                  o && this.masterCallback(e, String(t)));
            });
        }
        createRef(e) {
          let t = this.callbackMap[e];
          return (
            t ||
              (t = this.callbackMap[e] =
                (t) => {
                  this.handleValue(t, String(e));
                }),
            t
          );
        }
        collect(e, t, n) {
          return (function (e, t = 0, n, r = 1) {
            let i = [];
            null == n && (n = Object.keys(e).length);
            for (let o = t; o < n; o += r) {
              let t = e[o];
              void 0 !== t && i.push(t);
            }
            return i;
          })(this.currentMap, e, t, n);
        }
        getAll() {
          return Vn(this.currentMap);
        }
      }
      function Ho(e, t) {
        return e.liquid && t.liquid;
      }
      function jo(e, t) {
        return $t(e, t, Gn);
      }
      function Lo(e, t) {
        let n = [];
        for (let r of e) {
          let e = r.span || 1;
          for (let i = 0; i < e; i += 1)
            n.push(
              te("col", {
                style: {
                  width: "shrink" === r.width ? Bo(t) : r.width || "",
                  minWidth: r.minWidth || "",
                },
              }),
            );
        }
        return te("colgroup", {}, ...n);
      }
      function Bo(e) {
        return null == e ? 4 : e;
      }
      function Uo(e, t) {
        let n = [
          "fc-scrollgrid-section",
          `fc-scrollgrid-section-${e.type}`,
          e.className,
        ];
        return (
          t &&
            e.liquid &&
            null == e.maxHeight &&
            n.push("fc-scrollgrid-section-liquid"),
          e.isSticky && n.push("fc-scrollgrid-section-sticky"),
          n
        );
      }
      function zo(e) {
        return te("div", {
          className: "fc-scrollgrid-sticky-shim",
          style: { width: e.clientWidth, minWidth: e.tableMinWidth },
        });
      }
      function Wo(e) {
        let { stickyHeaderDates: t } = e;
        return (
          (null != t && "auto" !== t) ||
            (t = "auto" === e.height || "auto" === e.viewHeight),
          t
        );
      }
      class Yo extends lr {
        constructor() {
          super(...arguments),
            (this.processCols = fn((e) => e, jo)),
            (this.renderMicroColGroup = fn(Lo)),
            (this.scrollerRefs = new Po()),
            (this.scrollerElRefs = new Po(this._handleScrollerEl.bind(this))),
            (this.state = {
              shrinkWidth: null,
              forceYScrollbars: !1,
              scrollerClientWidths: {},
              scrollerClientHeights: {},
            }),
            (this.handleSizing = () => {
              this.safeSetState(
                Object.assign(
                  { shrinkWidth: this.computeShrinkWidth() },
                  this.computeScrollerDims(),
                ),
              );
            });
        }
        render() {
          let { props: e, state: t, context: n } = this,
            r = e.sections || [],
            i = this.processCols(e.cols),
            o = this.renderMicroColGroup(i, t.shrinkWidth),
            s = (function (e, t) {
              let n = ["fc-scrollgrid", t.theme.getClass("table")];
              return e && n.push("fc-scrollgrid-liquid"), n;
            })(e.liquid, n);
          e.collapsibleWidth && s.push("fc-scrollgrid-collapsible");
          let a,
            l = r.length,
            c = 0,
            u = [],
            d = [],
            h = [];
          for (; c < l && "header" === (a = r[c]).type; )
            u.push(this.renderSection(a, o, !0)), (c += 1);
          for (; c < l && "body" === (a = r[c]).type; )
            d.push(this.renderSection(a, o, !1)), (c += 1);
          for (; c < l && "footer" === (a = r[c]).type; )
            h.push(this.renderSection(a, o, !0)), (c += 1);
          let f = !Ii();
          const p = { role: "rowgroup" };
          return te(
            "table",
            {
              role: "grid",
              className: s.join(" "),
              style: { height: e.height },
            },
            Boolean(!f && u.length) && te("thead", p, ...u),
            Boolean(!f && d.length) && te("tbody", p, ...d),
            Boolean(!f && h.length) && te("tfoot", p, ...h),
            f && te("tbody", p, ...u, ...d, ...h),
          );
        }
        renderSection(e, t, n) {
          return "outerContent" in e
            ? te(re, { key: e.key }, e.outerContent)
            : te(
                "tr",
                {
                  key: e.key,
                  role: "presentation",
                  className: Uo(e, this.props.liquid).join(" "),
                },
                this.renderChunkTd(e, t, e.chunk, n),
              );
        }
        renderChunkTd(e, t, n, r) {
          if ("outerContent" in n) return n.outerContent;
          let { props: i } = this,
            {
              forceYScrollbars: o,
              scrollerClientWidths: s,
              scrollerClientHeights: a,
            } = this.state,
            l = (function (e, t) {
              return null != t.maxHeight || Ho(e, t);
            })(i, e),
            c = Ho(i, e),
            u = i.liquid ? (o ? "scroll" : l ? "auto" : "hidden") : "visible",
            d = e.key,
            h = (function (e, t, n, r) {
              let { expandRows: i } = n;
              return "function" == typeof t.content
                ? t.content(n)
                : te(
                    "table",
                    {
                      role: "presentation",
                      className: [
                        t.tableClassName,
                        e.syncRowHeights ? "fc-scrollgrid-sync-table" : "",
                      ].join(" "),
                      style: {
                        minWidth: n.tableMinWidth,
                        width: n.clientWidth,
                        height: i ? n.clientHeight : "",
                      },
                    },
                    n.tableColGroupNode,
                    te(
                      r ? "thead" : "tbody",
                      { role: "presentation" },
                      "function" == typeof t.rowContent
                        ? t.rowContent(n)
                        : t.rowContent,
                    ),
                  );
            })(
              e,
              n,
              {
                tableColGroupNode: t,
                tableMinWidth: "",
                clientWidth:
                  i.collapsibleWidth || void 0 === s[d] ? null : s[d],
                clientHeight: void 0 !== a[d] ? a[d] : null,
                expandRows: e.expandRows,
                syncRowHeights: !1,
                rowSyncHeights: [],
                reportRowHeightChange: () => {},
              },
              r,
            );
          return te(
            r ? "th" : "td",
            { ref: n.elRef, role: "presentation" },
            te(
              "div",
              {
                className:
                  "fc-scroller-harness" +
                  (c ? " fc-scroller-harness-liquid" : ""),
              },
              te(
                No,
                {
                  ref: this.scrollerRefs.createRef(d),
                  elRef: this.scrollerElRefs.createRef(d),
                  overflowY: u,
                  overflowX: i.liquid ? "hidden" : "visible",
                  maxHeight: e.maxHeight,
                  liquid: c,
                  liquidIsAbsolute: !0,
                },
                h,
              ),
            ),
          );
        }
        _handleScrollerEl(e, t) {
          let n = (function (e, t) {
            for (let n of e) if (n.key === t) return n;
            return null;
          })(this.props.sections, t);
          n && cr(n.chunk.scrollerElRef, e);
        }
        componentDidMount() {
          this.handleSizing(), this.context.addResizeHandler(this.handleSizing);
        }
        componentDidUpdate() {
          this.handleSizing();
        }
        componentWillUnmount() {
          this.context.removeResizeHandler(this.handleSizing);
        }
        computeShrinkWidth() {
          return (function (e) {
            for (let t of e) if ("shrink" === t.width) return !0;
            return !1;
          })(this.props.cols)
            ? (function (e) {
                let t = (function (e) {
                    let t = e instanceof HTMLElement ? [e] : e,
                      n = [];
                    for (let e = 0; e < t.length; e += 1) {
                      let r = t[e].querySelectorAll(".fc-scrollgrid-shrink");
                      for (let e = 0; e < r.length; e += 1) n.push(r[e]);
                    }
                    return n;
                  })(e),
                  n = 0;
                for (let e of t) n = Math.max(n, zt(e));
                return Math.ceil(n);
              })(this.scrollerElRefs.getAll())
            : 0;
        }
        computeScrollerDims() {
          let e =
              (Gi ||
                (Gi = (function () {
                  let e = document.createElement("div");
                  (e.style.overflow = "scroll"),
                    (e.style.position = "absolute"),
                    (e.style.top = "-9999px"),
                    (e.style.left = "-9999px"),
                    document.body.appendChild(e);
                  let t = $i(e);
                  return document.body.removeChild(e), t;
                })()),
              Gi),
            { scrollerRefs: t, scrollerElRefs: n } = this,
            r = !1,
            i = {},
            o = {};
          for (let e in t.currentMap) {
            let n = t.currentMap[e];
            if (n && n.needsYScrolling()) {
              r = !0;
              break;
            }
          }
          for (let t of this.props.sections) {
            let s = t.key,
              a = n.currentMap[s];
            if (a) {
              let t = a.parentNode;
              (i[s] = Math.floor(
                t.getBoundingClientRect().width - (r ? e.y : 0),
              )),
                (o[s] = Math.floor(t.getBoundingClientRect().height));
            }
          }
          return {
            forceYScrollbars: r,
            scrollerClientWidths: i,
            scrollerClientHeights: o,
          };
        }
      }
      Yo.addStateEquality({
        scrollerClientWidths: Gn,
        scrollerClientHeights: Gn,
      });
      class Fo extends lr {
        constructor() {
          super(...arguments),
            (this.handleEl = (e) => {
              (this.el = e), e && vi(e, this.props.seg);
            });
        }
        render() {
          const { props: e, context: t } = this,
            { options: n } = t,
            { seg: r } = e,
            { eventRange: i } = r,
            { ui: o } = i,
            s = {
              event: new hi(t, i.def, i.instance),
              view: t.viewApi,
              timeText: e.timeText,
              textColor: o.textColor,
              backgroundColor: o.backgroundColor,
              borderColor: o.borderColor,
              isDraggable: !e.disableDragging && Ai(r, t),
              isStartResizable: !e.disableResizing && wi(r, t),
              isEndResizable: !e.disableResizing && Di(r),
              isMirror: Boolean(
                e.isDragging || e.isResizing || e.isDateSelecting,
              ),
              isStart: Boolean(r.isStart),
              isEnd: Boolean(r.isEnd),
              isPast: Boolean(e.isPast),
              isFuture: Boolean(e.isFuture),
              isToday: Boolean(e.isToday),
              isSelected: Boolean(e.isSelected),
              isDragging: Boolean(e.isDragging),
              isResizing: Boolean(e.isResizing),
            };
          return te(
            gr,
            Object.assign({}, e, {
              elRef: this.handleEl,
              elClasses: [
                ...Ci(s),
                ...r.eventRange.ui.classNames,
                ...(e.elClasses || []),
              ],
              renderProps: s,
              generatorName: "eventContent",
              customGenerator: n.eventContent,
              defaultGenerator: e.defaultGenerator,
              classNameGenerator: n.eventClassNames,
              didMount: n.eventDidMount,
              willUnmount: n.eventWillUnmount,
            }),
          );
        }
        componentDidUpdate(e) {
          this.el && this.props.seg !== e.seg && vi(this.el, this.props.seg);
        }
      }
      class Vo extends lr {
        render() {
          let { props: e, context: t } = this,
            { options: n } = t,
            { seg: r } = e,
            { ui: i } = r.eventRange,
            o = Si(
              r,
              n.eventTimeFormat || e.defaultTimeFormat,
              t,
              e.defaultDisplayEventTime,
              e.defaultDisplayEventEnd,
            );
          return te(
            Fo,
            Object.assign({}, e, {
              elTag: "a",
              elStyle: {
                borderColor: i.borderColor,
                backgroundColor: i.backgroundColor,
              },
              elAttrs: xi(r, t),
              defaultGenerator: Go,
              timeText: o,
            }),
            (e, t) =>
              te(
                re,
                null,
                te(e, {
                  elTag: "div",
                  elClasses: ["fc-event-main"],
                  elStyle: { color: t.textColor },
                }),
                Boolean(t.isStartResizable) &&
                  te("div", {
                    className: "fc-event-resizer fc-event-resizer-start",
                  }),
                Boolean(t.isEndResizable) &&
                  te("div", {
                    className: "fc-event-resizer fc-event-resizer-end",
                  }),
              ),
          );
        }
      }
      function Go(e) {
        return te(
          "div",
          { className: "fc-event-main-frame" },
          e.timeText && te("div", { className: "fc-event-time" }, e.timeText),
          te(
            "div",
            { className: "fc-event-title-container" },
            te(
              "div",
              { className: "fc-event-title fc-sticky" },
              e.event.title || te(re, null, " "),
            ),
          ),
        );
      }
      const Qo = Rn({ day: "numeric" });
      class $o extends lr {
        constructor() {
          super(...arguments), (this.refineRenderProps = pn(Zo));
        }
        render() {
          let { props: e, context: t } = this,
            { options: n } = t,
            r = this.refineRenderProps({
              date: e.date,
              dateProfile: e.dateProfile,
              todayRange: e.todayRange,
              isMonthStart: e.isMonthStart || !1,
              showDayNumber: e.showDayNumber,
              extraRenderProps: e.extraRenderProps,
              viewApi: t.viewApi,
              dateEnv: t.dateEnv,
              monthStartFormat: n.monthStartFormat,
            });
          return te(
            gr,
            Object.assign({}, e, {
              elClasses: [...Wi(r, t.theme), ...(e.elClasses || [])],
              elAttrs: Object.assign(
                Object.assign({}, e.elAttrs),
                r.isDisabled ? {} : { "data-date": dn(e.date) },
              ),
              renderProps: r,
              generatorName: "dayCellContent",
              customGenerator: n.dayCellContent,
              defaultGenerator: e.defaultGenerator,
              classNameGenerator: r.isDisabled ? void 0 : n.dayCellClassNames,
              didMount: n.dayCellDidMount,
              willUnmount: n.dayCellWillUnmount,
            }),
          );
        }
      }
      function qo(e) {
        return Boolean(e.dayCellContent || dr("dayCellContent", e));
      }
      function Zo(e) {
        let { date: t, dateEnv: n, dateProfile: r, isMonthStart: i } = e,
          o = zi(t, e.todayRange, null, r),
          s = e.showDayNumber ? n.format(t, i ? e.monthStartFormat : Qo) : "";
        return Object.assign(
          Object.assign(
            Object.assign({ date: n.toDate(t), view: e.viewApi }, o),
            { isMonthStart: i, dayNumberText: s },
          ),
          e.extraRenderProps,
        );
      }
      class Xo extends lr {
        render() {
          let { props: e } = this,
            { seg: t } = e;
          return te(Fo, {
            elTag: "div",
            elClasses: ["fc-bg-event"],
            elStyle: { backgroundColor: t.eventRange.ui.backgroundColor },
            defaultGenerator: Jo,
            seg: t,
            timeText: "",
            isDragging: !1,
            isResizing: !1,
            isDateSelecting: !1,
            isSelected: !1,
            isPast: e.isPast,
            isFuture: e.isFuture,
            isToday: e.isToday,
            disableDragging: !0,
            disableResizing: !0,
          });
        }
      }
      function Jo(e) {
        let { title: t } = e.event;
        return t && te("div", { className: "fc-event-title" }, e.event.title);
      }
      function Ko(e) {
        return te("div", { className: `fc-${e}` });
      }
      const es = (e) =>
        te(or.Consumer, null, (t) => {
          let { dateEnv: n, options: r } = t,
            { date: i } = e,
            o = r.weekNumberFormat || e.defaultFormat,
            s = { num: n.computeWeekNumber(i), text: n.format(i, o), date: i };
          return te(
            gr,
            Object.assign({}, e, {
              renderProps: s,
              generatorName: "weekNumberContent",
              customGenerator: r.weekNumberContent,
              defaultGenerator: ts,
              classNameGenerator: r.weekNumberClassNames,
              didMount: r.weekNumberDidMount,
              willUnmount: r.weekNumberWillUnmount,
            }),
          );
        });
      function ts(e) {
        return e.text;
      }
      class ns extends lr {
        constructor() {
          super(...arguments),
            (this.state = { titleId: Ct() }),
            (this.handleRootEl = (e) => {
              (this.rootEl = e), this.props.elRef && cr(this.props.elRef, e);
            }),
            (this.handleDocumentMouseDown = (e) => {
              const t = St(e);
              this.rootEl.contains(t) || this.handleCloseClick();
            }),
            (this.handleDocumentKeyDown = (e) => {
              "Escape" === e.key && this.handleCloseClick();
            }),
            (this.handleCloseClick = () => {
              let { onClose: e } = this.props;
              e && e();
            });
        }
        render() {
          let { theme: e, options: t } = this.context,
            { props: n, state: r } = this,
            i = ["fc-popover", e.getClass("popover")].concat(
              n.extraClassNames || [],
            );
          return (function (e, t) {
            var n = te(Ke, { __v: e, i: t });
            return (n.containerInfo = t), n;
          })(
            te(
              "div",
              Object.assign({}, n.extraAttrs, {
                id: n.id,
                className: i.join(" "),
                "aria-labelledby": r.titleId,
                ref: this.handleRootEl,
              }),
              te(
                "div",
                {
                  className: "fc-popover-header " + e.getClass("popoverHeader"),
                },
                te(
                  "span",
                  { className: "fc-popover-title", id: r.titleId },
                  n.title,
                ),
                te("span", {
                  className: "fc-popover-close " + e.getIconClass("close"),
                  title: t.closeHint,
                  onClick: this.handleCloseClick,
                }),
              ),
              te(
                "div",
                {
                  className: "fc-popover-body " + e.getClass("popoverContent"),
                },
                n.children,
              ),
            ),
            n.parentEl,
          );
        }
        componentDidMount() {
          document.addEventListener("mousedown", this.handleDocumentMouseDown),
            document.addEventListener("keydown", this.handleDocumentKeyDown),
            this.updateSize();
        }
        componentWillUnmount() {
          document.removeEventListener(
            "mousedown",
            this.handleDocumentMouseDown,
          ),
            document.removeEventListener("keydown", this.handleDocumentKeyDown);
        }
        updateSize() {
          let { isRtl: e } = this.context,
            { alignmentEl: t, alignGridTop: n } = this.props,
            { rootEl: r } = this,
            i = (function (e) {
              let t = Xi(e),
                n = e.getBoundingClientRect();
              for (let e of t) {
                let t = Ui(n, e.getBoundingClientRect());
                if (!t) return null;
                n = t;
              }
              return n;
            })(t);
          if (i) {
            let o = r.getBoundingClientRect(),
              s = n
                ? bt(t, ".fc-scrollgrid").getBoundingClientRect().top
                : i.top,
              a = e ? i.right - o.width : i.left;
            (s = Math.max(s, 10)),
              (a = Math.min(
                a,
                document.documentElement.clientWidth - 10 - o.width,
              )),
              (a = Math.max(a, 10));
            let l = r.offsetParent.getBoundingClientRect();
            wt(r, { top: s - l.top, left: a - l.left });
          }
        }
      }
      class rs extends ro {
        constructor() {
          super(...arguments),
            (this.handleRootEl = (e) => {
              (this.rootEl = e),
                e
                  ? this.context.registerInteractiveComponent(this, {
                      el: e,
                      useEventCenter: !1,
                    })
                  : this.context.unregisterInteractiveComponent(this);
            });
        }
        render() {
          let { options: e, dateEnv: t } = this.context,
            { props: n } = this,
            { startDate: r, todayRange: i, dateProfile: o } = n,
            s = t.format(r, e.dayPopoverFormat);
          return te(
            $o,
            {
              elRef: this.handleRootEl,
              date: r,
              dateProfile: o,
              todayRange: i,
            },
            (t, r, i) =>
              te(
                ns,
                {
                  elRef: i.ref,
                  id: n.id,
                  title: s,
                  extraClassNames: ["fc-more-popover"].concat(
                    i.className || [],
                  ),
                  extraAttrs: i,
                  parentEl: n.parentEl,
                  alignmentEl: n.alignmentEl,
                  alignGridTop: n.alignGridTop,
                  onClose: n.onClose,
                },
                qo(e) &&
                  te(t, { elTag: "div", elClasses: ["fc-more-popover-misc"] }),
                n.children,
              ),
          );
        }
        queryHit(e, t, n, r) {
          let { rootEl: i, props: o } = this;
          return e >= 0 && e < n && t >= 0 && t < r
            ? {
                dateProfile: o.dateProfile,
                dateSpan: Object.assign(
                  {
                    allDay: !o.forceTimed,
                    range: { start: o.startDate, end: o.endDate },
                  },
                  o.extraDateSpan,
                ),
                dayEl: i,
                rect: { left: 0, top: 0, right: n, bottom: r },
                layer: 1,
              }
            : null;
        }
      }
      class is extends lr {
        constructor() {
          super(...arguments),
            (this.state = { isPopoverOpen: !1, popoverId: Ct() }),
            (this.handleLinkEl = (e) => {
              (this.linkEl = e), this.props.elRef && cr(this.props.elRef, e);
            }),
            (this.handleClick = (e) => {
              let { props: t, context: n } = this,
                { moreLinkClick: r } = n.options,
                i = ss(t).start;
              function o(e) {
                let { def: t, instance: r, range: i } = e.eventRange;
                return {
                  event: new hi(n, t, r),
                  start: n.dateEnv.toDate(i.start),
                  end: n.dateEnv.toDate(i.end),
                  isStart: e.isStart,
                  isEnd: e.isEnd,
                };
              }
              "function" == typeof r &&
                (r = r({
                  date: i,
                  allDay: Boolean(t.allDayDate),
                  allSegs: t.allSegs.map(o),
                  hiddenSegs: t.hiddenSegs.map(o),
                  jsEvent: e,
                  view: n.viewApi,
                })),
                r && "popover" !== r
                  ? "string" == typeof r && n.calendarApi.zoomTo(i, r)
                  : this.setState({ isPopoverOpen: !0 });
            }),
            (this.handlePopoverClose = () => {
              this.setState({ isPopoverOpen: !1 });
            });
        }
        render() {
          let { props: e, state: t } = this;
          return te(or.Consumer, null, (n) => {
            let { viewApi: r, options: i, calendarApi: o } = n,
              { moreLinkText: s } = i,
              { moreCnt: a } = e,
              l = ss(e),
              c = "function" == typeof s ? s.call(o, a) : `+${a} ${s}`,
              u = Lt(i.moreLinkHint, [a], c),
              d = { num: a, shortText: `+${a}`, text: c, view: r };
            return te(
              re,
              null,
              Boolean(e.moreCnt) &&
                te(
                  gr,
                  {
                    elTag: e.elTag || "a",
                    elRef: this.handleLinkEl,
                    elClasses: [...(e.elClasses || []), "fc-more-link"],
                    elStyle: e.elStyle,
                    elAttrs: Object.assign(
                      Object.assign(
                        Object.assign({}, e.elAttrs),
                        kt(this.handleClick),
                      ),
                      {
                        title: u,
                        "aria-expanded": t.isPopoverOpen,
                        "aria-controls": t.isPopoverOpen ? t.popoverId : "",
                      },
                    ),
                    renderProps: d,
                    generatorName: "moreLinkContent",
                    customGenerator: i.moreLinkContent,
                    defaultGenerator: e.defaultGenerator || os,
                    classNameGenerator: i.moreLinkClassNames,
                    didMount: i.moreLinkDidMount,
                    willUnmount: i.moreLinkWillUnmount,
                  },
                  e.children,
                ),
              t.isPopoverOpen &&
                te(
                  rs,
                  {
                    id: t.popoverId,
                    startDate: l.start,
                    endDate: l.end,
                    dateProfile: e.dateProfile,
                    todayRange: e.todayRange,
                    extraDateSpan: e.extraDateSpan,
                    parentEl: this.parentEl,
                    alignmentEl: e.alignmentElRef
                      ? e.alignmentElRef.current
                      : this.linkEl,
                    alignGridTop: e.alignGridTop,
                    forceTimed: e.forceTimed,
                    onClose: this.handlePopoverClose,
                  },
                  e.popoverContent(),
                ),
            );
          });
        }
        componentDidMount() {
          this.updateParentEl();
        }
        componentDidUpdate() {
          this.updateParentEl();
        }
        updateParentEl() {
          this.linkEl && (this.parentEl = bt(this.linkEl, ".fc-view-harness"));
        }
      }
      function os(e) {
        return e.text;
      }
      function ss(e) {
        if (e.allDayDate)
          return { start: e.allDayDate, end: Xt(e.allDayDate, 1) };
        let { hiddenSegs: t } = e;
        return {
          start: ((n = t), n.reduce(as).eventRange.range.start),
          end: ls(t),
        };
        var n;
      }
      function as(e, t) {
        return e.eventRange.range.start < t.eventRange.range.start ? e : t;
      }
      function ls(e) {
        return e.reduce(cs).eventRange.range.end;
      }
      function cs(e, t) {
        return e.eventRange.range.end > t.eventRange.range.end ? e : t;
      }
      const us = [],
        ds = {
          code: "en",
          week: { dow: 0, doy: 4 },
          direction: "ltr",
          buttonText: {
            prev: "prev",
            next: "next",
            prevYear: "prev year",
            nextYear: "next year",
            year: "year",
            today: "today",
            month: "month",
            week: "week",
            day: "day",
            list: "list",
          },
          weekText: "W",
          weekTextLong: "Week",
          closeHint: "Close",
          timeHint: "Time",
          eventHint: "Event",
          allDayText: "all-day",
          moreLinkText: "more",
          noEventsText: "No events to display",
        },
        hs = Object.assign(Object.assign({}, ds), {
          buttonHints: {
            prev: "Previous $0",
            next: "Next $0",
            today: (e, t) => ("day" === t ? "Today" : `This ${e}`),
          },
          viewHint: "$0 view",
          navLinkHint: "Go to $0",
          moreLinkHint: (e) => `Show ${e} more event${1 === e ? "" : "s"}`,
        });
      function fs(e) {
        let t = e.length > 0 ? e[0].code : "en",
          n = us.concat(e),
          r = { en: hs };
        for (let e of n) r[e.code] = e;
        return { map: r, defaultCode: t };
      }
      function ps(e, t) {
        return "object" != typeof e || Array.isArray(e)
          ? (function (e, t) {
              let n = [].concat(e || []),
                r =
                  (function (e, t) {
                    for (let n = 0; n < e.length; n += 1) {
                      let r = e[n].toLocaleLowerCase().split("-");
                      for (let e = r.length; e > 0; e -= 1) {
                        let n = r.slice(0, e).join("-");
                        if (t[n]) return t[n];
                      }
                    }
                    return null;
                  })(n, t) || hs;
              return gs(e, n, r);
            })(e, t)
          : gs(e.code, [e.code], e);
      }
      function gs(e, t, n) {
        let r = zn([ds, n], ["buttonText"]);
        delete r.code;
        let { week: i } = r;
        return (
          delete r.week,
          {
            codeArg: e,
            codes: t,
            week: i,
            simpleNumberFormat: new Intl.NumberFormat(e),
            options: r,
          }
        );
      }
      function vs(e) {
        return {
          id: It(),
          name: e.name,
          premiumReleaseDate: e.premiumReleaseDate
            ? new Date(e.premiumReleaseDate)
            : void 0,
          deps: e.deps || [],
          reducers: e.reducers || [],
          isLoadingFuncs: e.isLoadingFuncs || [],
          contextInit: [].concat(e.contextInit || []),
          eventRefiners: e.eventRefiners || {},
          eventDefMemberAdders: e.eventDefMemberAdders || [],
          eventSourceRefiners: e.eventSourceRefiners || {},
          isDraggableTransformers: e.isDraggableTransformers || [],
          eventDragMutationMassagers: e.eventDragMutationMassagers || [],
          eventDefMutationAppliers: e.eventDefMutationAppliers || [],
          dateSelectionTransformers: e.dateSelectionTransformers || [],
          datePointTransforms: e.datePointTransforms || [],
          dateSpanTransforms: e.dateSpanTransforms || [],
          views: e.views || {},
          viewPropsTransformers: e.viewPropsTransformers || [],
          isPropsValid: e.isPropsValid || null,
          externalDefTransforms: e.externalDefTransforms || [],
          viewContainerAppends: e.viewContainerAppends || [],
          eventDropTransformers: e.eventDropTransformers || [],
          componentInteractions: e.componentInteractions || [],
          calendarInteractions: e.calendarInteractions || [],
          themeClasses: e.themeClasses || {},
          eventSourceDefs: e.eventSourceDefs || [],
          cmdFormatter: e.cmdFormatter,
          recurringTypes: e.recurringTypes || [],
          namedTimeZonedImpl: e.namedTimeZonedImpl,
          initialView: e.initialView || "",
          elementDraggingImpl: e.elementDraggingImpl,
          optionChangeHandlers: e.optionChangeHandlers || {},
          scrollGridImpl: e.scrollGridImpl || null,
          listenerRefiners: e.listenerRefiners || {},
          optionRefiners: e.optionRefiners || {},
          propSetHandlers: e.propSetHandlers || {},
        };
      }
      class ms extends er {}
      function ys(e, t, n, r) {
        if (t[e]) return t[e];
        let i = (function (e, t, n, r) {
          let i = n[e],
            o = r[e],
            s = (e) =>
              i && null !== i[e] ? i[e] : o && null !== o[e] ? o[e] : null,
            a = s("component"),
            l = s("superType"),
            c = null;
          if (l) {
            if (l === e)
              throw new Error(
                "Can't have a custom view type that references itself",
              );
            c = ys(l, t, n, r);
          }
          return (
            !a && c && (a = c.component),
            a
              ? {
                  type: e,
                  component: a,
                  defaults: Object.assign(
                    Object.assign({}, c ? c.defaults : {}),
                    i ? i.rawOptions : {},
                  ),
                  overrides: Object.assign(
                    Object.assign({}, c ? c.overrides : {}),
                    o ? o.rawOptions : {},
                  ),
                }
              : null
          );
        })(e, t, n, r);
        return i && (t[e] = i), i;
      }
      function bs(e) {
        return Yn(e, Es);
      }
      function Es(e) {
        let t = "function" == typeof e ? { component: e } : e,
          { component: n } = t;
        return (
          t.content
            ? (n = As(t))
            : !n ||
              n.prototype instanceof lr ||
              (n = As(Object.assign(Object.assign({}, t), { content: n }))),
          { superType: t.type, component: n, rawOptions: t }
        );
      }
      function As(e) {
        return (t) =>
          te(or.Consumer, null, (n) =>
            te(gr, {
              elTag: "div",
              elClasses: yr(n.viewSpec),
              renderProps: Object.assign(Object.assign({}, t), {
                nextDayThreshold: n.options.nextDayThreshold,
              }),
              generatorName: void 0,
              customGenerator: e.content,
              classNameGenerator: e.classNames,
              didMount: e.didMount,
              willUnmount: e.willUnmount,
            }),
          );
      }
      function ws(e, t, n, r) {
        let i = bs(e),
          o = bs(t.views),
          s = (function (e, t) {
            let n,
              r = {};
            for (n in e) ys(n, r, e, t);
            for (n in t) ys(n, r, e, t);
            return r;
          })(i, o);
        return Yn(s, (e) =>
          (function (e, t, n, r, i) {
            let o =
                e.overrides.duration ||
                e.defaults.duration ||
                r.duration ||
                n.duration,
              s = null,
              a = "",
              l = "",
              c = {};
            if (
              o &&
              ((s = (function (e) {
                let t = JSON.stringify(e),
                  n = Ds[t];
                return void 0 === n && ((n = Yt(e)), (Ds[t] = n)), n;
              })(o)),
              s)
            ) {
              let e = Qt(s);
              (a = e.unit),
                1 === e.value && ((l = a), (c = t[a] ? t[a].rawOptions : {}));
            }
            let u = (t) => {
                let n = t.buttonText || {},
                  r = e.defaults.buttonTextKey;
                return null != r && null != n[r]
                  ? n[r]
                  : null != n[e.type]
                    ? n[e.type]
                    : null != n[l]
                      ? n[l]
                      : null;
              },
              d = (t) => {
                let n = t.buttonHints || {},
                  r = e.defaults.buttonTextKey;
                return null != r && null != n[r]
                  ? n[r]
                  : null != n[e.type]
                    ? n[e.type]
                    : null != n[l]
                      ? n[l]
                      : null;
              };
            return {
              type: e.type,
              component: e.component,
              duration: s,
              durationUnit: a,
              singleUnit: l,
              optionDefaults: e.defaults,
              optionOverrides: Object.assign(Object.assign({}, c), e.overrides),
              buttonTextOverride: u(r) || u(n) || e.overrides.buttonText,
              buttonTextDefault:
                u(i) || e.defaults.buttonText || u(kn) || e.type,
              buttonTitleOverride: d(r) || d(n) || e.overrides.buttonHint,
              buttonTitleDefault: d(i) || e.defaults.buttonHint || d(kn),
            };
          })(e, o, t, n, r),
        );
      }
      (ms.prototype.classes = {
        root: "fc-theme-standard",
        tableCellShaded: "fc-cell-shaded",
        buttonGroup: "fc-button-group",
        button: "fc-button fc-button-primary",
        buttonActive: "fc-button-active",
      }),
        (ms.prototype.baseIconClass = "fc-icon"),
        (ms.prototype.iconClasses = {
          close: "fc-icon-x",
          prev: "fc-icon-chevron-left",
          next: "fc-icon-chevron-right",
          prevYear: "fc-icon-chevrons-left",
          nextYear: "fc-icon-chevrons-right",
        }),
        (ms.prototype.rtlIconClasses = {
          prev: "fc-icon-chevron-right",
          next: "fc-icon-chevron-left",
          prevYear: "fc-icon-chevrons-right",
          nextYear: "fc-icon-chevrons-left",
        }),
        (ms.prototype.iconOverrideOption = "buttonIcons"),
        (ms.prototype.iconOverrideCustomButtonOption = "icon"),
        (ms.prototype.iconOverridePrefix = "fc-icon-");
      let Ds = {};
      function Ss(e) {
        for (let t in e) if (e[t].isFetching) return !0;
        return !1;
      }
      function _s(e, t, n, r) {
        let i = {};
        for (let e of t) i[e.sourceId] = e;
        return n && (i = Cs(i, n, r)), Object.assign(Object.assign({}, e), i);
      }
      function Cs(e, t, n) {
        return xs(
          e,
          Wn(e, (e) =>
            (function (e, t, n) {
              return ks(e, n)
                ? !n.options.lazyFetching ||
                    !e.fetchRange ||
                    e.isFetching ||
                    t.start < e.fetchRange.start ||
                    t.end > e.fetchRange.end
                : !e.latestFetchId;
            })(e, t, n),
          ),
          t,
          !1,
          n,
        );
      }
      function xs(e, t, n, r, i) {
        let o = {};
        for (let s in e) {
          let a = e[s];
          t[s] ? (o[s] = Rs(a, n, r, i)) : (o[s] = a);
        }
        return o;
      }
      function Rs(e, t, n, r) {
        let { options: i, calendarApi: o } = r,
          s = r.pluginHooks.eventSourceDefs[e.sourceDefId],
          a = It();
        return (
          s.fetch(
            { eventSource: e, range: t, isRefetch: n, context: r },
            (n) => {
              let { rawEvents: s } = n;
              i.eventSourceSuccess &&
                (s = i.eventSourceSuccess.call(o, s, n.response) || s),
                e.success && (s = e.success.call(o, s, n.response) || s),
                r.dispatch({
                  type: "RECEIVE_EVENTS",
                  sourceId: e.sourceId,
                  fetchId: a,
                  fetchRange: t,
                  rawEvents: s,
                });
            },
            (n) => {
              let s = !1;
              i.eventSourceFailure &&
                (i.eventSourceFailure.call(o, n), (s = !0)),
                e.failure && (e.failure(n), (s = !0)),
                s || console.warn(n.message, n),
                r.dispatch({
                  type: "RECEIVE_EVENT_ERROR",
                  sourceId: e.sourceId,
                  fetchId: a,
                  fetchRange: t,
                  error: n,
                });
            },
          ),
          Object.assign(Object.assign({}, e), {
            isFetching: !0,
            latestFetchId: a,
          })
        );
      }
      function Ts(e, t) {
        return Wn(e, (e) => ks(e, t));
      }
      function ks(e, t) {
        return !t.pluginHooks.eventSourceDefs[e.sourceDefId].ignoreRange;
      }
      function Ms(e, t) {
        switch (t.type) {
          case "UNSELECT_DATES":
            return null;
          case "SELECT_DATES":
            return t.selection;
          default:
            return e;
        }
      }
      function Os(e, t) {
        switch (t.type) {
          case "UNSELECT_EVENT":
            return "";
          case "SELECT_EVENT":
            return t.eventInstanceId;
          default:
            return e;
        }
      }
      function Is(e, t) {
        let n;
        switch (t.type) {
          case "UNSET_EVENT_DRAG":
            return null;
          case "SET_EVENT_DRAG":
            return (
              (n = t.state),
              {
                affectedEvents: n.affectedEvents,
                mutatedEvents: n.mutatedEvents,
                isEvent: n.isEvent,
              }
            );
          default:
            return e;
        }
      }
      function Ns(e, t) {
        let n;
        switch (t.type) {
          case "UNSET_EVENT_RESIZE":
            return null;
          case "SET_EVENT_RESIZE":
            return (
              (n = t.state),
              {
                affectedEvents: n.affectedEvents,
                mutatedEvents: n.mutatedEvents,
                isEvent: n.isEvent,
              }
            );
          default:
            return e;
        }
      }
      function Ps(e, t, n, r, i) {
        return {
          header: e.headerToolbar ? Hs(e.headerToolbar, e, t, n, r, i) : null,
          footer: e.footerToolbar ? Hs(e.footerToolbar, e, t, n, r, i) : null,
        };
      }
      function Hs(e, t, n, r, i, o) {
        let s = {},
          a = [],
          l = !1;
        for (let c in e) {
          let u = js(e[c], t, n, r, i, o);
          (s[c] = u.widgets),
            a.push(...u.viewsWithButtons),
            (l = l || u.hasTitle);
        }
        return { sectionWidgets: s, viewsWithButtons: a, hasTitle: l };
      }
      function js(e, t, n, r, i, o) {
        let s = "rtl" === t.direction,
          a = t.customButtons || {},
          l = n.buttonText || {},
          c = t.buttonText || {},
          u = n.buttonHints || {},
          d = t.buttonHints || {},
          h = e ? e.split(" ") : [],
          f = [],
          p = !1;
        return {
          widgets: h.map((e) =>
            e.split(",").map((e) => {
              if ("title" === e) return (p = !0), { buttonName: e };
              let n, h, g, v, m, y;
              if ((n = a[e]))
                (g = (e) => {
                  n.click && n.click.call(e.target, e, e.target);
                }),
                  (v = r.getCustomButtonIconClass(n)) ||
                    (v = r.getIconClass(e, s)) ||
                    (m = n.text),
                  (y = n.hint || n.text);
              else if ((h = i[e])) {
                f.push(e),
                  (g = () => {
                    o.changeView(e);
                  }),
                  (m = h.buttonTextOverride) ||
                    (v = r.getIconClass(e, s)) ||
                    (m = h.buttonTextDefault);
                let n = h.buttonTextOverride || h.buttonTextDefault;
                y = Lt(
                  h.buttonTitleOverride || h.buttonTitleDefault || t.viewHint,
                  [n, e],
                  n,
                );
              } else if (o[e])
                if (
                  ((g = () => {
                    o[e]();
                  }),
                  (m = l[e]) || (v = r.getIconClass(e, s)) || (m = c[e]),
                  "prevYear" === e || "nextYear" === e)
                ) {
                  let t = "prevYear" === e ? "prev" : "next";
                  y = Lt(u[t] || d[t], [c.year || "year", "year"], c[e]);
                } else y = (t) => Lt(u[e] || d[e], [c[t] || t, t], c[e]);
              return {
                buttonName: e,
                buttonClick: g,
                buttonIcon: v,
                buttonText: m,
                buttonHint: y,
              };
            }),
          ),
          viewsWithButtons: f,
          hasTitle: p,
        };
      }
      class Ls {
        constructor(e, t, n) {
          (this.type = e), (this.getCurrentData = t), (this.dateEnv = n);
        }
        get calendar() {
          return this.getCurrentData().calendarApi;
        }
        get title() {
          return this.getCurrentData().viewTitle;
        }
        get activeStart() {
          return this.dateEnv.toDate(
            this.getCurrentData().dateProfile.activeRange.start,
          );
        }
        get activeEnd() {
          return this.dateEnv.toDate(
            this.getCurrentData().dateProfile.activeRange.end,
          );
        }
        get currentStart() {
          return this.dateEnv.toDate(
            this.getCurrentData().dateProfile.currentRange.start,
          );
        }
        get currentEnd() {
          return this.dateEnv.toDate(
            this.getCurrentData().dateProfile.currentRange.end,
          );
        }
        getOption(e) {
          return this.getCurrentData().options[e];
        }
      }
      const Bs = {
        daysOfWeek: Bn,
        startTime: Yt,
        endTime: Yt,
        duration: Yt,
        startRecur: Bn,
        endRecur: Bn,
      };
      function Us(e, t) {
        let n = Vn(t.getCurrentData().eventSources);
        if (
          1 === n.length &&
          1 === e.length &&
          Array.isArray(n[0]._raw) &&
          Array.isArray(e[0])
        )
          return void t.dispatch({
            type: "RESET_RAW_EVENTS",
            sourceId: n[0].sourceId,
            rawEvents: e[0],
          });
        let r = [];
        for (let t of e) {
          let e = !1;
          for (let r = 0; r < n.length; r += 1)
            if (n[r]._raw === t) {
              n.splice(r, 1), (e = !0);
              break;
            }
          e || r.push(t);
        }
        for (let e of n)
          t.dispatch({ type: "REMOVE_EVENT_SOURCE", sourceId: e.sourceId });
        for (let e of r) t.calendarApi.addEventSource(e);
      }
      const zs = [
        vs({
          name: "array-event-source",
          eventSourceDefs: [
            {
              ignoreRange: !0,
              parseMeta: (e) => (Array.isArray(e.events) ? e.events : null),
              fetch(e, t) {
                t({ rawEvents: e.eventSource.meta });
              },
            },
          ],
        }),
        vs({
          name: "func-event-source",
          eventSourceDefs: [
            {
              parseMeta: (e) =>
                "function" == typeof e.events ? e.events : null,
              fetch(e, t, n) {
                const { dateEnv: r } = e.context;
                !(function (e, n, r) {
                  let i = !1,
                    o = function (e) {
                      i || ((i = !0), t({ rawEvents: e }));
                    },
                    s = function (e) {
                      i || ((i = !0), r(e));
                    },
                    a = e(o, s);
                  a && "function" == typeof a.then && a.then(o, s);
                })(e.eventSource.meta.bind(null, Ti(e.range, r)), 0, n);
              },
            },
          ],
        }),
        vs({
          name: "json-event-source",
          eventSourceRefiners: {
            method: String,
            extraParams: Bn,
            startParam: String,
            endParam: String,
            timeZoneParam: String,
          },
          eventSourceDefs: [
            {
              parseMeta: (e) =>
                !e.url || ("json" !== e.format && e.format)
                  ? null
                  : {
                      url: e.url,
                      format: "json",
                      method: (e.method || "GET").toUpperCase(),
                      extraParams: e.extraParams,
                      startParam: e.startParam,
                      endParam: e.endParam,
                      timeZoneParam: e.timeZoneParam,
                    },
              fetch(e, t, n) {
                const { meta: r } = e.eventSource,
                  i = (function (e, t, n) {
                    let r,
                      i,
                      o,
                      s,
                      { dateEnv: a, options: l } = n,
                      c = {};
                    return (
                      (r = e.startParam),
                      null == r && (r = l.startParam),
                      (i = e.endParam),
                      null == i && (i = l.endParam),
                      (o = e.timeZoneParam),
                      null == o && (o = l.timeZoneParam),
                      (s =
                        "function" == typeof e.extraParams
                          ? e.extraParams()
                          : e.extraParams || {}),
                      Object.assign(c, s),
                      (c[r] = a.formatIso(t.start)),
                      (c[i] = a.formatIso(t.end)),
                      "local" !== a.timeZone && (c[o] = a.timeZone),
                      c
                    );
                  })(r, e.range, e.context);
                (function (e, t, n) {
                  const r = { method: (e = e.toUpperCase()) };
                  return (
                    "GET" === e
                      ? (t +=
                          (-1 === t.indexOf("?") ? "?" : "&") +
                          new URLSearchParams(n))
                      : ((r.body = new URLSearchParams(n)),
                        (r.headers = {
                          "Content-Type": "application/x-www-form-urlencoded",
                        })),
                    fetch(t, r).then((e) => {
                      if (e.ok)
                        return e.json().then(
                          (t) => [t, e],
                          () => {
                            throw new Mi("Failure parsing JSON", e);
                          },
                        );
                      throw new Mi("Request failed", e);
                    })
                  );
                })(r.method, r.url, i).then(([e, n]) => {
                  t({ rawEvents: e, response: n });
                }, n);
              },
            },
          ],
        }),
        vs({
          name: "simple-recurring-event",
          recurringTypes: [
            {
              parse(e, t) {
                if (
                  e.daysOfWeek ||
                  e.startTime ||
                  e.endTime ||
                  e.startRecur ||
                  e.endRecur
                ) {
                  let i,
                    o = {
                      daysOfWeek: e.daysOfWeek || null,
                      startTime: e.startTime || null,
                      endTime: e.endTime || null,
                      startRecur: e.startRecur
                        ? t.createMarker(e.startRecur)
                        : null,
                      endRecur: e.endRecur ? t.createMarker(e.endRecur) : null,
                    };
                  return (
                    e.duration && (i = e.duration),
                    !i &&
                      e.startTime &&
                      e.endTime &&
                      ((n = e.endTime),
                      (r = e.startTime),
                      (i = {
                        years: n.years - r.years,
                        months: n.months - r.months,
                        days: n.days - r.days,
                        milliseconds: n.milliseconds - r.milliseconds,
                      })),
                    {
                      allDayGuess: Boolean(!e.startTime && !e.endTime),
                      duration: i,
                      typeData: o,
                    }
                  );
                }
                var n, r;
                return null;
              },
              expand(e, t, n) {
                let r = Ar(t, { start: e.startRecur, end: e.endRecur });
                return r
                  ? (function (e, t, n, r) {
                      let i = e ? Fn(e) : null,
                        o = tn(n.start),
                        s = n.end,
                        a = [];
                      for (; o < s; ) {
                        let e;
                        (i && !i[o.getUTCDay()]) ||
                          ((e = t ? r.add(o, t) : o), a.push(e)),
                          (o = Xt(o, 1));
                      }
                      return a;
                    })(e.daysOfWeek, e.startTime, r, n)
                  : [];
              },
            },
          ],
          eventRefiners: Bs,
        }),
        vs({
          name: "change-handler",
          optionChangeHandlers: {
            events(e, t) {
              Us([e], t);
            },
            eventSources: Us,
          },
        }),
        vs({
          name: "misc",
          isLoadingFuncs: [(e) => Ss(e.eventSources)],
          propSetHandlers: {
            dateProfile: function (e, t) {
              t.emitter.trigger(
                "datesSet",
                Object.assign(Object.assign({}, Ti(e.activeRange, t.dateEnv)), {
                  view: t.viewApi,
                }),
              );
            },
            eventStore: function (e, t) {
              let { emitter: n } = t;
              n.hasHandlers("eventsSet") && n.trigger("eventsSet", pi(e, t));
            },
          },
        }),
      ];
      class Ws {
        constructor(e, t) {
          (this.runTaskOption = e),
            (this.drainedOption = t),
            (this.queue = []),
            (this.delayedRunner = new mt(this.drain.bind(this)));
        }
        request(e, t) {
          this.queue.push(e), this.delayedRunner.request(t);
        }
        pause(e) {
          this.delayedRunner.pause(e);
        }
        resume(e, t) {
          this.delayedRunner.resume(e, t);
        }
        drain() {
          let { queue: e } = this;
          for (; e.length; ) {
            let t,
              n = [];
            for (; (t = e.shift()); ) this.runTask(t), n.push(t);
            this.drained(n);
          }
        }
        runTask(e) {
          this.runTaskOption && this.runTaskOption(e);
        }
        drained(e) {
          this.drainedOption && this.drainedOption(e);
        }
      }
      function Ys(e, t, n) {
        let r;
        return (
          (r = /^(year|month)$/.test(e.currentRangeUnit)
            ? e.currentRange
            : e.activeRange),
          n.formatRange(
            r.start,
            r.end,
            Rn(
              t.titleFormat ||
                (function (e) {
                  let { currentRangeUnit: t } = e;
                  if ("year" === t) return { year: "numeric" };
                  if ("month" === t) return { year: "numeric", month: "long" };
                  let n = en(e.currentRange.start, e.currentRange.end);
                  return null !== n && n > 1
                    ? { year: "numeric", month: "short", day: "numeric" }
                    : { year: "numeric", month: "long", day: "numeric" };
                })(e),
            ),
            {
              isEndExclusive: e.isRangeAllDay,
              defaultSeparator: t.titleRangeSeparator,
            },
          )
        );
      }
      class Fs {
        constructor(e) {
          (this.computeCurrentViewData = fn(this._computeCurrentViewData)),
            (this.organizeRawLocales = fn(fs)),
            (this.buildLocale = fn(ps)),
            (this.buildPluginHooks = (function () {
              let e,
                t = [],
                n = [];
              return (r, i) => (
                (e && $t(r, t) && $t(i, n)) ||
                  (e = (function (e, t) {
                    let n = {},
                      r = {
                        premiumReleaseDate: void 0,
                        reducers: [],
                        isLoadingFuncs: [],
                        contextInit: [],
                        eventRefiners: {},
                        eventDefMemberAdders: [],
                        eventSourceRefiners: {},
                        isDraggableTransformers: [],
                        eventDragMutationMassagers: [],
                        eventDefMutationAppliers: [],
                        dateSelectionTransformers: [],
                        datePointTransforms: [],
                        dateSpanTransforms: [],
                        views: {},
                        viewPropsTransformers: [],
                        isPropsValid: null,
                        externalDefTransforms: [],
                        viewContainerAppends: [],
                        eventDropTransformers: [],
                        componentInteractions: [],
                        calendarInteractions: [],
                        themeClasses: {},
                        eventSourceDefs: [],
                        cmdFormatter: null,
                        recurringTypes: [],
                        namedTimeZonedImpl: null,
                        initialView: "",
                        elementDraggingImpl: null,
                        optionChangeHandlers: {},
                        scrollGridImpl: null,
                        listenerRefiners: {},
                        optionRefiners: {},
                        propSetHandlers: {},
                      };
                    function i(e) {
                      for (let l of e) {
                        const e = l.name,
                          c = n[e];
                        void 0 === c
                          ? ((n[e] = l.id),
                            i(l.deps),
                            (a = l),
                            (r = {
                              premiumReleaseDate:
                                ((t = (s = r).premiumReleaseDate),
                                (o = a.premiumReleaseDate),
                                void 0 === t
                                  ? o
                                  : void 0 === o
                                    ? t
                                    : new Date(
                                        Math.max(t.valueOf(), o.valueOf()),
                                      )),
                              reducers: s.reducers.concat(a.reducers),
                              isLoadingFuncs: s.isLoadingFuncs.concat(
                                a.isLoadingFuncs,
                              ),
                              contextInit: s.contextInit.concat(a.contextInit),
                              eventRefiners: Object.assign(
                                Object.assign({}, s.eventRefiners),
                                a.eventRefiners,
                              ),
                              eventDefMemberAdders:
                                s.eventDefMemberAdders.concat(
                                  a.eventDefMemberAdders,
                                ),
                              eventSourceRefiners: Object.assign(
                                Object.assign({}, s.eventSourceRefiners),
                                a.eventSourceRefiners,
                              ),
                              isDraggableTransformers:
                                s.isDraggableTransformers.concat(
                                  a.isDraggableTransformers,
                                ),
                              eventDragMutationMassagers:
                                s.eventDragMutationMassagers.concat(
                                  a.eventDragMutationMassagers,
                                ),
                              eventDefMutationAppliers:
                                s.eventDefMutationAppliers.concat(
                                  a.eventDefMutationAppliers,
                                ),
                              dateSelectionTransformers:
                                s.dateSelectionTransformers.concat(
                                  a.dateSelectionTransformers,
                                ),
                              datePointTransforms: s.datePointTransforms.concat(
                                a.datePointTransforms,
                              ),
                              dateSpanTransforms: s.dateSpanTransforms.concat(
                                a.dateSpanTransforms,
                              ),
                              views: Object.assign(
                                Object.assign({}, s.views),
                                a.views,
                              ),
                              viewPropsTransformers:
                                s.viewPropsTransformers.concat(
                                  a.viewPropsTransformers,
                                ),
                              isPropsValid: a.isPropsValid || s.isPropsValid,
                              externalDefTransforms:
                                s.externalDefTransforms.concat(
                                  a.externalDefTransforms,
                                ),
                              viewContainerAppends:
                                s.viewContainerAppends.concat(
                                  a.viewContainerAppends,
                                ),
                              eventDropTransformers:
                                s.eventDropTransformers.concat(
                                  a.eventDropTransformers,
                                ),
                              calendarInteractions:
                                s.calendarInteractions.concat(
                                  a.calendarInteractions,
                                ),
                              componentInteractions:
                                s.componentInteractions.concat(
                                  a.componentInteractions,
                                ),
                              themeClasses: Object.assign(
                                Object.assign({}, s.themeClasses),
                                a.themeClasses,
                              ),
                              eventSourceDefs: s.eventSourceDefs.concat(
                                a.eventSourceDefs,
                              ),
                              cmdFormatter: a.cmdFormatter || s.cmdFormatter,
                              recurringTypes: s.recurringTypes.concat(
                                a.recurringTypes,
                              ),
                              namedTimeZonedImpl:
                                a.namedTimeZonedImpl || s.namedTimeZonedImpl,
                              initialView: s.initialView || a.initialView,
                              elementDraggingImpl:
                                s.elementDraggingImpl || a.elementDraggingImpl,
                              optionChangeHandlers: Object.assign(
                                Object.assign({}, s.optionChangeHandlers),
                                a.optionChangeHandlers,
                              ),
                              scrollGridImpl:
                                a.scrollGridImpl || s.scrollGridImpl,
                              listenerRefiners: Object.assign(
                                Object.assign({}, s.listenerRefiners),
                                a.listenerRefiners,
                              ),
                              optionRefiners: Object.assign(
                                Object.assign({}, s.optionRefiners),
                                a.optionRefiners,
                              ),
                              propSetHandlers: Object.assign(
                                Object.assign({}, s.propSetHandlers),
                                a.propSetHandlers,
                              ),
                            }))
                          : c !== l.id &&
                            console.warn(`Duplicate plugin '${e}'`);
                      }
                      var t, o, s, a;
                    }
                    return e && i(e), i(t), r;
                  })(r, i)),
                (t = r),
                (n = i),
                e
              );
            })()),
            (this.buildDateEnv = fn(Vs)),
            (this.buildTheme = fn(Gs)),
            (this.parseToolbars = fn(Ps)),
            (this.buildViewSpecs = fn(ws)),
            (this.buildDateProfileGenerator = pn(Qs)),
            (this.buildViewApi = fn($s)),
            (this.buildViewUiProps = pn(Xs)),
            (this.buildEventUiBySource = fn(qs, Gn)),
            (this.buildEventUiBases = fn(Zs)),
            (this.parseContextBusinessHours = pn(Ks)),
            (this.buildTitle = fn(Ys)),
            (this.emitter = new ri()),
            (this.actionRunner = new Ws(
              this._handleAction.bind(this),
              this.updateData.bind(this),
            )),
            (this.currentCalendarOptionsInput = {}),
            (this.currentCalendarOptionsRefined = {}),
            (this.currentViewOptionsInput = {}),
            (this.currentViewOptionsRefined = {}),
            (this.currentCalendarOptionsRefiners = {}),
            (this.optionsForRefining = []),
            (this.optionsForHandling = []),
            (this.getCurrentData = () => this.data),
            (this.dispatch = (e) => {
              this.actionRunner.request(e);
            }),
            (this.props = e),
            this.actionRunner.pause();
          let t = {},
            n = this.computeOptionsData(e.optionOverrides, t, e.calendarApi),
            r = n.calendarOptions.initialView || n.pluginHooks.initialView,
            i = this.computeCurrentViewData(r, n, e.optionOverrides, t);
          (e.calendarApi.currentDataManager = this),
            this.emitter.setThisContext(e.calendarApi),
            this.emitter.setOptions(i.options);
          let o = (function (e, t) {
              let n = e.initialDate;
              return null != n ? t.createMarker(n) : Rr(e.now, t);
            })(n.calendarOptions, n.dateEnv),
            s = i.dateProfileGenerator.build(o);
          Sr(s.activeRange, o) || (o = s.currentRange.start);
          let a = {
            dateEnv: n.dateEnv,
            options: n.calendarOptions,
            pluginHooks: n.pluginHooks,
            calendarApi: e.calendarApi,
            dispatch: this.dispatch,
            emitter: this.emitter,
            getCurrentData: this.getCurrentData,
          };
          for (let e of n.pluginHooks.contextInit) e(a);
          let l = (function (e, t, n) {
              let r = t ? t.activeRange : null;
              return _s(
                {},
                (function (e, t) {
                  let n = Jr(t),
                    r = [].concat(e.eventSources || []),
                    i = [];
                  e.initialEvents && r.unshift(e.initialEvents),
                    e.events && r.unshift(e.events);
                  for (let e of r) {
                    let r = Xr(e, t, n);
                    r && i.push(r);
                  }
                  return i;
                })(e, n),
                r,
                n,
              );
            })(n.calendarOptions, s, a),
            c = {
              dynamicOptionOverrides: t,
              currentViewType: r,
              currentDate: o,
              dateProfile: s,
              businessHours: this.parseContextBusinessHours(a),
              eventSources: l,
              eventUiBases: {},
              eventStore: { defs: {}, instances: {} },
              renderableEventStore: { defs: {}, instances: {} },
              dateSelection: null,
              eventSelection: "",
              eventDrag: null,
              eventResize: null,
              selectionConfig: this.buildViewUiProps(a).selectionConfig,
            },
            u = Object.assign(Object.assign({}, a), c);
          for (let e of n.pluginHooks.reducers)
            Object.assign(c, e(null, null, u));
          Js(c, a) && this.emitter.trigger("loading", !0),
            (this.state = c),
            this.updateData(),
            this.actionRunner.resume();
        }
        resetOptions(e, t) {
          let { props: n } = this;
          void 0 === t
            ? (n.optionOverrides = e)
            : ((n.optionOverrides = Object.assign(
                Object.assign({}, n.optionOverrides || {}),
                e,
              )),
              this.optionsForRefining.push(...t)),
            (void 0 === t || t.length) &&
              this.actionRunner.request({ type: "NOTHING" });
        }
        _handleAction(e) {
          let { props: t, state: n, emitter: r } = this,
            i = (function (e, t) {
              return "SET_OPTION" === t.type
                ? Object.assign(Object.assign({}, e), {
                    [t.optionName]: t.rawOptionValue,
                  })
                : e;
            })(n.dynamicOptionOverrides, e),
            o = this.computeOptionsData(t.optionOverrides, i, t.calendarApi),
            s = (function (e, t) {
              return "CHANGE_VIEW_TYPE" === t.type && (e = t.viewType), e;
            })(n.currentViewType, e),
            a = this.computeCurrentViewData(s, o, t.optionOverrides, i);
          (t.calendarApi.currentDataManager = this),
            r.setThisContext(t.calendarApi),
            r.setOptions(a.options);
          let l = {
              dateEnv: o.dateEnv,
              options: o.calendarOptions,
              pluginHooks: o.pluginHooks,
              calendarApi: t.calendarApi,
              dispatch: this.dispatch,
              emitter: r,
              getCurrentData: this.getCurrentData,
            },
            { currentDate: c, dateProfile: u } = n;
          this.data &&
            this.data.dateProfileGenerator !== a.dateProfileGenerator &&
            (u = a.dateProfileGenerator.build(c)),
            (c = (function (e, t) {
              return "CHANGE_DATE" === t.type ? t.dateMarker : e;
            })(c, e)),
            (u = (function (e, t, n, r) {
              let i;
              switch (t.type) {
                case "CHANGE_VIEW_TYPE":
                  return r.build(t.dateMarker || n);
                case "CHANGE_DATE":
                  return r.build(t.dateMarker);
                case "PREV":
                  if (((i = r.buildPrev(e, n)), i.isValid)) return i;
                  break;
                case "NEXT":
                  if (((i = r.buildNext(e, n)), i.isValid)) return i;
              }
              return e;
            })(u, e, c, a.dateProfileGenerator)),
            ("PREV" !== e.type && "NEXT" !== e.type && Sr(u.currentRange, c)) ||
              (c = u.currentRange.start);
          let d = (function (e, t, n, r) {
              let i = n ? n.activeRange : null;
              switch (t.type) {
                case "ADD_EVENT_SOURCES":
                  return _s(e, t.sources, i, r);
                case "REMOVE_EVENT_SOURCE":
                  return (
                    (o = e), (s = t.sourceId), Wn(o, (e) => e.sourceId !== s)
                  );
                case "PREV":
                case "NEXT":
                case "CHANGE_DATE":
                case "CHANGE_VIEW_TYPE":
                  return n ? Cs(e, i, r) : e;
                case "FETCH_EVENT_SOURCES":
                  return xs(
                    e,
                    t.sourceIds ? Fn(t.sourceIds) : Ts(e, r),
                    i,
                    t.isRefetch || !1,
                    r,
                  );
                case "RECEIVE_EVENTS":
                case "RECEIVE_EVENT_ERROR":
                  return (function (e, t, n, r) {
                    let i = e[t];
                    return i && n === i.latestFetchId
                      ? Object.assign(Object.assign({}, e), {
                          [t]: Object.assign(Object.assign({}, i), {
                            isFetching: !1,
                            fetchRange: r,
                          }),
                        })
                      : e;
                  })(e, t.sourceId, t.fetchId, t.fetchRange);
                case "REMOVE_ALL_EVENT_SOURCES":
                  return {};
                default:
                  return e;
              }
              var o, s;
            })(n.eventSources, e, u, l),
            h = (function (e, t, n, r, i) {
              switch (t.type) {
                case "RECEIVE_EVENTS":
                  return (function (e, t, n, r, i, o) {
                    if (t && n === t.latestFetchId) {
                      let n = Ur(Kr(i, t, o), t, o);
                      return r && (n = Mr(n, r, o)), Yr(ni(e, t.sourceId), n);
                    }
                    return e;
                  })(e, n[t.sourceId], t.fetchId, t.fetchRange, t.rawEvents, i);
                case "RESET_RAW_EVENTS":
                  return (function (e, t, n, r, i) {
                    const { defIdMap: o, instanceIdMap: s } = (function (e) {
                      const { defs: t, instances: n } = e,
                        r = {},
                        i = {};
                      for (let e in t) {
                        const n = t[e],
                          { publicId: i } = n;
                        i && (r[i] = e);
                      }
                      for (let e in n) {
                        const r = t[n[e].defId],
                          { publicId: o } = r;
                        o && (i[o] = e);
                      }
                      return { defIdMap: r, instanceIdMap: i };
                    })(e);
                    return Mr(Ur(Kr(n, t, i), t, i, !1, o, s), r, i);
                  })(e, n[t.sourceId], t.rawEvents, r.activeRange, i);
                case "ADD_EVENTS":
                  return (function (e, t, n, r) {
                    return n && (t = Mr(t, n, r)), Yr(e, t);
                  })(e, t.eventStore, r ? r.activeRange : null, i);
                case "RESET_EVENTS":
                  return t.eventStore;
                case "MERGE_EVENTS":
                  return Yr(e, t.eventStore);
                case "PREV":
                case "NEXT":
                case "CHANGE_DATE":
                case "CHANGE_VIEW_TYPE":
                  return r ? Mr(e, r.activeRange, i) : e;
                case "REMOVE_EVENTS":
                  return (function (e, t) {
                    let { defs: n, instances: r } = e,
                      i = {},
                      o = {};
                    for (let e in n) t.defs[e] || (i[e] = n[e]);
                    for (let e in r)
                      !t.instances[e] && i[r[e].defId] && (o[e] = r[e]);
                    return { defs: i, instances: o };
                  })(e, t.eventStore);
                case "REMOVE_EVENT_SOURCE":
                  return ni(e, t.sourceId);
                case "REMOVE_ALL_EVENT_SOURCES":
                  return Fr(e, (e) => !e.sourceId);
                case "REMOVE_ALL_EVENTS":
                  return { defs: {}, instances: {} };
                default:
                  return e;
              }
            })(n.eventStore, e, d, u, l),
            f =
              (Ss(d) &&
                !a.options.progressiveEventRendering &&
                n.renderableEventStore) ||
              h,
            { eventUiSingleBase: p, selectionConfig: g } =
              this.buildViewUiProps(l),
            v = this.buildEventUiBySource(d),
            m = {
              dynamicOptionOverrides: i,
              currentViewType: s,
              currentDate: c,
              dateProfile: u,
              eventSources: d,
              eventStore: h,
              renderableEventStore: f,
              selectionConfig: g,
              eventUiBases: this.buildEventUiBases(f.defs, p, v),
              businessHours: this.parseContextBusinessHours(l),
              dateSelection: Ms(n.dateSelection, e),
              eventSelection: Os(n.eventSelection, e),
              eventDrag: Is(n.eventDrag, e),
              eventResize: Ns(n.eventResize, e),
            },
            y = Object.assign(Object.assign({}, l), m);
          for (let t of o.pluginHooks.reducers) Object.assign(m, t(n, e, y));
          let b = Js(n, l),
            E = Js(m, l);
          !b && E
            ? r.trigger("loading", !0)
            : b && !E && r.trigger("loading", !1),
            (this.state = m),
            t.onAction && t.onAction(e);
        }
        updateData() {
          let { props: e, state: t } = this,
            n = this.data,
            r = this.computeOptionsData(
              e.optionOverrides,
              t.dynamicOptionOverrides,
              e.calendarApi,
            ),
            i = this.computeCurrentViewData(
              t.currentViewType,
              r,
              e.optionOverrides,
              t.dynamicOptionOverrides,
            ),
            o = (this.data = Object.assign(
              Object.assign(
                Object.assign(
                  {
                    viewTitle: this.buildTitle(
                      t.dateProfile,
                      i.options,
                      r.dateEnv,
                    ),
                    calendarApi: e.calendarApi,
                    dispatch: this.dispatch,
                    emitter: this.emitter,
                    getCurrentData: this.getCurrentData,
                  },
                  r,
                ),
                i,
              ),
              t,
            )),
            s = r.pluginHooks.optionChangeHandlers,
            a = n && n.calendarOptions,
            l = r.calendarOptions;
          if (a && a !== l) {
            a.timeZone !== l.timeZone &&
              ((t.eventSources = o.eventSources =
                (function (e, t, n) {
                  let r = t ? t.activeRange : null;
                  return xs(e, Ts(e, n), r, !0, n);
                })(o.eventSources, t.dateProfile, o)),
              (t.eventStore = o.eventStore =
                ti(o.eventStore, n.dateEnv, o.dateEnv)),
              (t.renderableEventStore = o.renderableEventStore =
                ti(o.renderableEventStore, n.dateEnv, o.dateEnv)));
            for (let e in s)
              (-1 === this.optionsForHandling.indexOf(e) && a[e] === l[e]) ||
                s[e](l[e], o);
          }
          (this.optionsForHandling = []), e.onData && e.onData(o);
        }
        computeOptionsData(e, t, n) {
          if (
            !this.optionsForRefining.length &&
            e === this.stableOptionOverrides &&
            t === this.stableDynamicOptionOverrides
          )
            return this.stableCalendarOptionsData;
          let {
            refinedOptions: r,
            pluginHooks: i,
            localeDefaults: o,
            availableLocaleData: s,
            extra: a,
          } = this.processRawCalendarOptions(e, t);
          ea(a);
          let l = this.buildDateEnv(
              r.timeZone,
              r.locale,
              r.weekNumberCalculation,
              r.firstDay,
              r.weekText,
              i,
              s,
              r.defaultRangeSeparator,
            ),
            c = this.buildViewSpecs(
              i.views,
              this.stableOptionOverrides,
              this.stableDynamicOptionOverrides,
              o,
            ),
            u = this.buildTheme(r, i),
            d = this.parseToolbars(r, this.stableOptionOverrides, u, c, n);
          return (this.stableCalendarOptionsData = {
            calendarOptions: r,
            pluginHooks: i,
            dateEnv: l,
            viewSpecs: c,
            theme: u,
            toolbarConfig: d,
            localeDefaults: o,
            availableRawLocales: s.map,
          });
        }
        processRawCalendarOptions(e, t) {
          let { locales: n, locale: r } = jn([kn, e, t]),
            i = this.organizeRawLocales(n),
            o = i.map,
            s = this.buildLocale(r || i.defaultCode, o).options,
            a = this.buildPluginHooks(e.plugins || [], zs),
            l = (this.currentCalendarOptionsRefiners = Object.assign(
              Object.assign(
                Object.assign(Object.assign(Object.assign({}, Tn), Mn), On),
                a.listenerRefiners,
              ),
              a.optionRefiners,
            )),
            c = {},
            u = jn([kn, s, e, t]),
            d = {},
            h = this.currentCalendarOptionsInput,
            f = this.currentCalendarOptionsRefined,
            p = !1;
          for (let e in u)
            -1 === this.optionsForRefining.indexOf(e) &&
            (u[e] === h[e] || (In[e] && e in h && In[e](h[e], u[e])))
              ? (d[e] = f[e])
              : l[e]
                ? ((d[e] = l[e](u[e])), (p = !0))
                : (c[e] = h[e]);
          return (
            p &&
              ((this.currentCalendarOptionsInput = u),
              (this.currentCalendarOptionsRefined = d),
              (this.stableOptionOverrides = e),
              (this.stableDynamicOptionOverrides = t)),
            this.optionsForHandling.push(...this.optionsForRefining),
            (this.optionsForRefining = []),
            {
              rawOptions: this.currentCalendarOptionsInput,
              refinedOptions: this.currentCalendarOptionsRefined,
              pluginHooks: a,
              availableLocaleData: i,
              localeDefaults: s,
              extra: c,
            }
          );
        }
        _computeCurrentViewData(e, t, n, r) {
          let i = t.viewSpecs[e];
          if (!i)
            throw new Error(
              `viewType "${e}" is not available. Please make sure you've loaded all neccessary plugins`,
            );
          let { refinedOptions: o, extra: s } = this.processRawViewOptions(
            i,
            t.pluginHooks,
            t.localeDefaults,
            n,
            r,
          );
          return (
            ea(s),
            {
              viewSpec: i,
              options: o,
              dateProfileGenerator: this.buildDateProfileGenerator({
                dateProfileGeneratorClass:
                  i.optionDefaults.dateProfileGeneratorClass,
                duration: i.duration,
                durationUnit: i.durationUnit,
                usesMinMaxTime: i.optionDefaults.usesMinMaxTime,
                dateEnv: t.dateEnv,
                calendarApi: this.props.calendarApi,
                slotMinTime: o.slotMinTime,
                slotMaxTime: o.slotMaxTime,
                showNonCurrentDates: o.showNonCurrentDates,
                dayCount: o.dayCount,
                dateAlignment: o.dateAlignment,
                dateIncrement: o.dateIncrement,
                hiddenDays: o.hiddenDays,
                weekends: o.weekends,
                nowInput: o.now,
                validRangeInput: o.validRange,
                visibleRangeInput: o.visibleRange,
                fixedWeekCount: o.fixedWeekCount,
              }),
              viewApi: this.buildViewApi(e, this.getCurrentData, t.dateEnv),
            }
          );
        }
        processRawViewOptions(e, t, n, r, i) {
          let o = jn([kn, e.optionDefaults, n, r, e.optionOverrides, i]),
            s = Object.assign(
              Object.assign(
                Object.assign(
                  Object.assign(Object.assign(Object.assign({}, Tn), Mn), On),
                  Hn,
                ),
                t.listenerRefiners,
              ),
              t.optionRefiners,
            ),
            a = {},
            l = this.currentViewOptionsInput,
            c = this.currentViewOptionsRefined,
            u = !1,
            d = {};
          for (let e in o)
            o[e] === l[e] || (In[e] && In[e](o[e], l[e]))
              ? (a[e] = c[e])
              : (o[e] === this.currentCalendarOptionsInput[e] ||
                (In[e] && In[e](o[e], this.currentCalendarOptionsInput[e]))
                  ? e in this.currentCalendarOptionsRefined &&
                    (a[e] = this.currentCalendarOptionsRefined[e])
                  : s[e]
                    ? (a[e] = s[e](o[e]))
                    : (d[e] = o[e]),
                (u = !0));
          return (
            u &&
              ((this.currentViewOptionsInput = o),
              (this.currentViewOptionsRefined = a)),
            {
              rawOptions: this.currentViewOptionsInput,
              refinedOptions: this.currentViewOptionsRefined,
              extra: d,
            }
          );
        }
      }
      function Vs(e, t, n, r, i, o, s, a) {
        let l = ps(t || s.defaultCode, s.map);
        return new Kn({
          calendarSystem: "gregory",
          timeZone: e,
          namedTimeZoneImpl: o.namedTimeZonedImpl,
          locale: l,
          weekNumberCalculation: n,
          firstDay: r,
          weekText: i,
          cmdFormatter: o.cmdFormatter,
          defaultSeparator: a,
        });
      }
      function Gs(e, t) {
        return new (t.themeClasses[e.themeSystem] || ms)(e);
      }
      function Qs(e) {
        return new (e.dateProfileGeneratorClass || Tr)(e);
      }
      function $s(e, t, n) {
        return new Ls(e, t, n);
      }
      function qs(e) {
        return Yn(e, (e) => e.ui);
      }
      function Zs(e, t, n) {
        let r = { "": t };
        for (let t in e) {
          let i = e[t];
          i.sourceId && n[i.sourceId] && (r[t] = n[i.sourceId]);
        }
        return r;
      }
      function Xs(e) {
        let { options: t } = e;
        return {
          eventUiSingleBase: $r(
            {
              display: t.eventDisplay,
              editable: t.editable,
              startEditable: t.eventStartEditable,
              durationEditable: t.eventDurationEditable,
              constraint: t.eventConstraint,
              overlap:
                "boolean" == typeof t.eventOverlap ? t.eventOverlap : void 0,
              allow: t.eventAllow,
              backgroundColor: t.eventBackgroundColor,
              borderColor: t.eventBorderColor,
              textColor: t.eventTextColor,
              color: t.eventColor,
            },
            e,
          ),
          selectionConfig: $r(
            {
              constraint: t.selectConstraint,
              overlap:
                "boolean" == typeof t.selectOverlap ? t.selectOverlap : void 0,
              allow: t.selectAllow,
            },
            e,
          ),
        };
      }
      function Js(e, t) {
        for (let n of t.pluginHooks.isLoadingFuncs) if (n(e)) return !0;
        return !1;
      }
      function Ks(e) {
        return (
          (t = e.options.businessHours),
          (n = e),
          Ur(
            (function (e) {
              let t;
              return (
                (t =
                  !0 === e
                    ? [{}]
                    : Array.isArray(e)
                      ? e.filter((e) => e.daysOfWeek)
                      : "object" == typeof e && e
                        ? [e]
                        : []),
                (t = t.map((e) => Object.assign(Object.assign({}, ii), e))),
                t
              );
            })(t),
            null,
            n,
          )
        );
        var t, n;
      }
      function ea(e, t) {
        for (let n in e)
          console.warn(`Unknown option '${n}'` + (t ? ` for view '${t}'` : ""));
      }
      class ta extends lr {
        render() {
          return te(
            "div",
            { className: "fc-toolbar-chunk" },
            ...this.props.widgetGroups.map((e) => this.renderWidgetGroup(e)),
          );
        }
        renderWidgetGroup(e) {
          let { props: t } = this,
            { theme: n } = this.context,
            r = [],
            i = !0;
          for (let o of e) {
            let {
              buttonName: e,
              buttonClick: s,
              buttonText: a,
              buttonIcon: l,
              buttonHint: c,
            } = o;
            if ("title" === e)
              (i = !1),
                r.push(
                  te(
                    "h2",
                    { className: "fc-toolbar-title", id: t.titleId },
                    t.title,
                  ),
                );
            else {
              let i = e === t.activeButton,
                o =
                  (!t.isTodayEnabled && "today" === e) ||
                  (!t.isPrevEnabled && "prev" === e) ||
                  (!t.isNextEnabled && "next" === e),
                u = [`fc-${e}-button`, n.getClass("button")];
              i && u.push(n.getClass("buttonActive")),
                r.push(
                  te(
                    "button",
                    {
                      type: "button",
                      title: "function" == typeof c ? c(t.navUnit) : c,
                      disabled: o,
                      "aria-pressed": i,
                      className: u.join(" "),
                      onClick: s,
                    },
                    a || (l ? te("span", { className: l, role: "img" }) : ""),
                  ),
                );
            }
          }
          return r.length > 1
            ? te(
                "div",
                { className: (i && n.getClass("buttonGroup")) || "" },
                ...r,
              )
            : r[0];
        }
      }
      class na extends lr {
        render() {
          let e,
            t,
            { model: n, extraClassName: r } = this.props,
            i = !1,
            o = n.sectionWidgets,
            s = o.center;
          return (
            o.left ? ((i = !0), (e = o.left)) : (e = o.start),
            o.right ? ((i = !0), (t = o.right)) : (t = o.end),
            te(
              "div",
              {
                className: [
                  r || "",
                  "fc-toolbar",
                  i ? "fc-toolbar-ltr" : "",
                ].join(" "),
              },
              this.renderSection("start", e || []),
              this.renderSection("center", s || []),
              this.renderSection("end", t || []),
            )
          );
        }
        renderSection(e, t) {
          let { props: n } = this;
          return te(ta, {
            key: e,
            widgetGroups: t,
            title: n.title,
            navUnit: n.navUnit,
            activeButton: n.activeButton,
            isTodayEnabled: n.isTodayEnabled,
            isPrevEnabled: n.isPrevEnabled,
            isNextEnabled: n.isNextEnabled,
            titleId: n.titleId,
          });
        }
      }
      class ra extends lr {
        constructor() {
          super(...arguments),
            (this.state = { availableWidth: null }),
            (this.handleEl = (e) => {
              (this.el = e),
                cr(this.props.elRef, e),
                this.updateAvailableWidth();
            }),
            (this.handleResize = () => {
              this.updateAvailableWidth();
            });
        }
        render() {
          let { props: e, state: t } = this,
            { aspectRatio: n } = e,
            r = [
              "fc-view-harness",
              n || e.liquid || e.height
                ? "fc-view-harness-active"
                : "fc-view-harness-passive",
            ],
            i = "",
            o = "";
          return (
            n
              ? null !== t.availableWidth
                ? (i = t.availableWidth / n)
                : (o = (1 / n) * 100 + "%")
              : (i = e.height || ""),
            te(
              "div",
              {
                "aria-labelledby": e.labeledById,
                ref: this.handleEl,
                className: r.join(" "),
                style: { height: i, paddingBottom: o },
              },
              e.children,
            )
          );
        }
        componentDidMount() {
          this.context.addResizeHandler(this.handleResize);
        }
        componentWillUnmount() {
          this.context.removeResizeHandler(this.handleResize);
        }
        updateAvailableWidth() {
          this.el &&
            this.props.aspectRatio &&
            this.setState({ availableWidth: this.el.offsetWidth });
        }
      }
      class ia extends Pi {
        constructor(e) {
          super(e),
            (this.handleSegClick = (e, t) => {
              let { component: n } = this,
                { context: r } = n,
                i = mi(t);
              if (i && n.isValidSegDownEl(e.target)) {
                let o = bt(e.target, ".fc-event-forced-url"),
                  s = o ? o.querySelector("a[href]").href : "";
                r.emitter.trigger("eventClick", {
                  el: t,
                  event: new hi(
                    n.context,
                    i.eventRange.def,
                    i.eventRange.instance,
                  ),
                  jsEvent: e,
                  view: r.viewApi,
                }),
                  s && !e.defaultPrevented && (window.location.href = s);
              }
            }),
            (this.destroy = Rt(
              e.el,
              "click",
              ".fc-event",
              this.handleSegClick,
            ));
        }
      }
      class oa extends Pi {
        constructor(e) {
          super(e),
            (this.handleEventElRemove = (e) => {
              e === this.currentSegEl &&
                this.handleSegLeave(null, this.currentSegEl);
            }),
            (this.handleSegEnter = (e, t) => {
              mi(t) &&
                ((this.currentSegEl = t),
                this.triggerEvent("eventMouseEnter", e, t));
            }),
            (this.handleSegLeave = (e, t) => {
              this.currentSegEl &&
                ((this.currentSegEl = null),
                this.triggerEvent("eventMouseLeave", e, t));
            }),
            (this.removeHoverListeners = (function (e, t, n, r) {
              let i;
              return Rt(e, "mouseover", ".fc-event", (e, t) => {
                if (t !== i) {
                  (i = t), n(e, t);
                  let o = (e) => {
                    (i = null), r(e, t), t.removeEventListener("mouseleave", o);
                  };
                  t.addEventListener("mouseleave", o);
                }
              });
            })(e.el, 0, this.handleSegEnter, this.handleSegLeave));
        }
        destroy() {
          this.removeHoverListeners();
        }
        triggerEvent(e, t, n) {
          let { component: r } = this,
            { context: i } = r,
            o = mi(n);
          (t && !r.isValidSegDownEl(t.target)) ||
            i.emitter.trigger(e, {
              el: n,
              event: new hi(i, o.eventRange.def, o.eventRange.instance),
              jsEvent: t,
              view: i.viewApi,
            });
        }
      }
      class sa extends ar {
        constructor() {
          super(...arguments),
            (this.buildViewContext = fn(sr)),
            (this.buildViewPropTransformers = fn(la)),
            (this.buildToolbarProps = fn(aa)),
            (this.headerRef = { current: null }),
            (this.footerRef = { current: null }),
            (this.interactionsStore = {}),
            (this.state = { viewLabelId: Ct() }),
            (this.registerInteractiveComponent = (e, t) => {
              let n = (function (e, t) {
                  return {
                    component: e,
                    el: t.el,
                    useEventCenter:
                      null == t.useEventCenter || t.useEventCenter,
                    isHitComboAllowed: t.isHitComboAllowed || null,
                  };
                })(e, t),
                r = [ia, oa]
                  .concat(this.props.pluginHooks.componentInteractions)
                  .map((e) => new e(n));
              (this.interactionsStore[e.uid] = r), (ji[e.uid] = n);
            }),
            (this.unregisterInteractiveComponent = (e) => {
              let t = this.interactionsStore[e.uid];
              if (t) {
                for (let e of t) e.destroy();
                delete this.interactionsStore[e.uid];
              }
              delete ji[e.uid];
            }),
            (this.resizeRunner = new mt(() => {
              this.props.emitter.trigger("_resize", !0),
                this.props.emitter.trigger("windowResize", {
                  view: this.props.viewApi,
                });
            })),
            (this.handleWindowResize = (e) => {
              let { options: t } = this.props;
              t.handleWindowResize &&
                e.target === window &&
                this.resizeRunner.request(t.windowResizeDelay);
            });
        }
        render() {
          let e,
            { props: t } = this,
            { toolbarConfig: n, options: r } = t,
            i = this.buildToolbarProps(
              t.viewSpec,
              t.dateProfile,
              t.dateProfileGenerator,
              t.currentDate,
              Rr(t.options.now, t.dateEnv),
              t.viewTitle,
            ),
            o = !1,
            s = "";
          t.isHeightAuto || t.forPrint
            ? (s = "")
            : null != r.height
              ? (o = !0)
              : null != r.contentHeight
                ? (s = r.contentHeight)
                : (e = Math.max(r.aspectRatio, 0.5));
          let a = this.buildViewContext(
              t.viewSpec,
              t.viewApi,
              t.options,
              t.dateProfileGenerator,
              t.dateEnv,
              t.theme,
              t.pluginHooks,
              t.dispatch,
              t.getCurrentData,
              t.emitter,
              t.calendarApi,
              this.registerInteractiveComponent,
              this.unregisterInteractiveComponent,
            ),
            l = n.header && n.header.hasTitle ? this.state.viewLabelId : void 0;
          return te(
            or.Provider,
            { value: a },
            n.header &&
              te(
                na,
                Object.assign(
                  {
                    ref: this.headerRef,
                    extraClassName: "fc-header-toolbar",
                    model: n.header,
                    titleId: l,
                  },
                  i,
                ),
              ),
            te(
              ra,
              { liquid: o, height: s, aspectRatio: e, labeledById: l },
              this.renderView(t),
              this.buildAppendContent(),
            ),
            n.footer &&
              te(
                na,
                Object.assign(
                  {
                    ref: this.footerRef,
                    extraClassName: "fc-footer-toolbar",
                    model: n.footer,
                    titleId: "",
                  },
                  i,
                ),
              ),
          );
        }
        componentDidMount() {
          let { props: e } = this;
          (this.calendarInteractions = e.pluginHooks.calendarInteractions.map(
            (t) => new t(e),
          )),
            window.addEventListener("resize", this.handleWindowResize);
          let { propSetHandlers: t } = e.pluginHooks;
          for (let n in t) t[n](e[n], e);
        }
        componentDidUpdate(e) {
          let { props: t } = this,
            { propSetHandlers: n } = t.pluginHooks;
          for (let r in n) t[r] !== e[r] && n[r](t[r], t);
        }
        componentWillUnmount() {
          window.removeEventListener("resize", this.handleWindowResize),
            this.resizeRunner.clear();
          for (let e of this.calendarInteractions) e.destroy();
          this.props.emitter.trigger("_unmount");
        }
        buildAppendContent() {
          let { props: e } = this;
          return te(
            re,
            {},
            ...e.pluginHooks.viewContainerAppends.map((t) => t(e)),
          );
        }
        renderView(e) {
          let { pluginHooks: t } = e,
            { viewSpec: n } = e,
            r = {
              dateProfile: e.dateProfile,
              businessHours: e.businessHours,
              eventStore: e.renderableEventStore,
              eventUiBases: e.eventUiBases,
              dateSelection: e.dateSelection,
              eventSelection: e.eventSelection,
              eventDrag: e.eventDrag,
              eventResize: e.eventResize,
              isHeightAuto: e.isHeightAuto,
              forPrint: e.forPrint,
            },
            i = this.buildViewPropTransformers(t.viewPropsTransformers);
          for (let t of i) Object.assign(r, t.transform(r, e));
          return te(n.component, Object.assign({}, r));
        }
      }
      function aa(e, t, n, r, i, o) {
        let s = n.build(i, void 0, !1),
          a = n.buildPrev(t, r, !1),
          l = n.buildNext(t, r, !1);
        return {
          title: o,
          activeButton: e.type,
          navUnit: e.singleUnit,
          isTodayEnabled: s.isValid && !Sr(t.currentRange, i),
          isPrevEnabled: a.isValid,
          isNextEnabled: l.isValid,
        };
      }
      function la(e) {
        return e.map((e) => new e());
      }
      class ca extends Li {
        constructor(e, t = {}) {
          super(),
            (this.isRendering = !1),
            (this.isRendered = !1),
            (this.currentClassNames = []),
            (this.customContentRenderId = 0),
            (this.handleAction = (e) => {
              switch (e.type) {
                case "SET_EVENT_DRAG":
                case "SET_EVENT_RESIZE":
                  this.renderRunner.tryDrain();
              }
            }),
            (this.handleData = (e) => {
              (this.currentData = e),
                this.renderRunner.request(e.calendarOptions.rerenderDelay);
            }),
            (this.handleRenderRequest = () => {
              if (this.isRendering) {
                this.isRendered = !0;
                let { currentData: e } = this;
                tr(() => {
                  _e(
                    te(
                      Ni,
                      {
                        options: e.calendarOptions,
                        theme: e.theme,
                        emitter: e.emitter,
                      },
                      (t, n, r, i) => (
                        this.setClassNames(t),
                        this.setHeight(n),
                        te(
                          pr.Provider,
                          { value: this.customContentRenderId },
                          te(
                            sa,
                            Object.assign({ isHeightAuto: r, forPrint: i }, e),
                          ),
                        )
                      ),
                    ),
                    this.el,
                  );
                });
              } else
                this.isRendered &&
                  ((this.isRendered = !1),
                  _e(null, this.el),
                  this.setClassNames([]),
                  this.setHeight(""));
            }),
            (function (e) {
              e.isConnected && e.getRootNode && pt(e.getRootNode());
            })(e),
            (this.el = e),
            (this.renderRunner = new mt(this.handleRenderRequest)),
            new Fs({
              optionOverrides: t,
              calendarApi: this,
              onAction: this.handleAction,
              onData: this.handleData,
            });
        }
        render() {
          let e = this.isRendering;
          e ? (this.customContentRenderId += 1) : (this.isRendering = !0),
            this.renderRunner.request(),
            e && this.updateSize();
        }
        destroy() {
          this.isRendering &&
            ((this.isRendering = !1), this.renderRunner.request());
        }
        updateSize() {
          tr(() => {
            super.updateSize();
          });
        }
        batchRendering(e) {
          this.renderRunner.pause("batchRendering"),
            e(),
            this.renderRunner.resume("batchRendering");
        }
        pauseRendering() {
          this.renderRunner.pause("pauseRendering");
        }
        resumeRendering() {
          this.renderRunner.resume("pauseRendering", !0);
        }
        resetOptions(e, t) {
          this.currentDataManager.resetOptions(e, t);
        }
        setClassNames(e) {
          if (!$t(e, this.currentClassNames)) {
            let { classList: t } = this.el;
            for (let e of this.currentClassNames) t.remove(e);
            for (let n of e) t.add(n);
            this.currentClassNames = e;
          }
        }
        setHeight(e) {
          Dt(this.el, "height", e);
        }
      }
      class ua extends ro {
        constructor() {
          super(...arguments), (this.headerElRef = { current: null });
        }
        renderSimpleLayout(e, t) {
          let { props: n, context: r } = this,
            i = [],
            o = Wo(r.options);
          return (
            e &&
              i.push({
                type: "header",
                key: "header",
                isSticky: o,
                chunk: {
                  elRef: this.headerElRef,
                  tableClassName: "fc-col-header",
                  rowContent: e,
                },
              }),
            i.push({
              type: "body",
              key: "body",
              liquid: !0,
              chunk: { content: t },
            }),
            te(
              mr,
              { elClasses: ["fc-daygrid"], viewSpec: r.viewSpec },
              te(Yo, {
                liquid: !n.isHeightAuto && !n.forPrint,
                collapsibleWidth: n.forPrint,
                cols: [],
                sections: i,
              }),
            )
          );
        }
        renderHScrollLayout(e, t, n, r) {
          let i = this.context.pluginHooks.scrollGridImpl;
          if (!i) throw new Error("No ScrollGrid implementation");
          let { props: o, context: s } = this,
            a = !o.forPrint && Wo(s.options),
            l =
              !o.forPrint &&
              (function (e) {
                let { stickyFooterScrollbar: t } = e;
                return (
                  (null != t && "auto" !== t) ||
                    (t = "auto" === e.height || "auto" === e.viewHeight),
                  t
                );
              })(s.options),
            c = [];
          return (
            e &&
              c.push({
                type: "header",
                key: "header",
                isSticky: a,
                chunks: [
                  {
                    key: "main",
                    elRef: this.headerElRef,
                    tableClassName: "fc-col-header",
                    rowContent: e,
                  },
                ],
              }),
            c.push({
              type: "body",
              key: "body",
              liquid: !0,
              chunks: [{ key: "main", content: t }],
            }),
            l &&
              c.push({
                type: "footer",
                key: "footer",
                isSticky: !0,
                chunks: [{ key: "main", content: zo }],
              }),
            te(
              mr,
              { elClasses: ["fc-daygrid"], viewSpec: s.viewSpec },
              te(i, {
                liquid: !o.isHeightAuto && !o.forPrint,
                forPrint: o.forPrint,
                collapsibleWidth: o.forPrint,
                colGroups: [{ cols: [{ span: n, minWidth: r }] }],
                sections: c,
              }),
            )
          );
        }
      }
      function da(e, t) {
        let n = [];
        for (let e = 0; e < t; e += 1) n[e] = [];
        for (let t of e) n[t.row].push(t);
        return n;
      }
      function ha(e, t) {
        let n = [];
        for (let e = 0; e < t; e += 1) n[e] = [];
        for (let t of e) n[t.firstCol].push(t);
        return n;
      }
      function fa(e, t) {
        let n = [];
        if (e) {
          for (let r = 0; r < t; r += 1)
            n[r] = {
              affectedInstances: e.affectedInstances,
              isEvent: e.isEvent,
              segs: [],
            };
          for (let t of e.segs) n[t.row].segs.push(t);
        } else for (let e = 0; e < t; e += 1) n[e] = null;
        return n;
      }
      const pa = Rn({
        hour: "numeric",
        minute: "2-digit",
        omitZeroMinute: !0,
        meridiem: "narrow",
      });
      function ga(e) {
        let { display: t } = e.eventRange.ui;
        return (
          "list-item" === t ||
          ("auto" === t &&
            !e.eventRange.def.allDay &&
            e.firstCol === e.lastCol &&
            e.isStart &&
            e.isEnd)
        );
      }
      class va extends lr {
        render() {
          let { props: e } = this;
          return te(
            Vo,
            Object.assign({}, e, {
              elClasses: [
                "fc-daygrid-event",
                "fc-daygrid-block-event",
                "fc-h-event",
              ],
              defaultTimeFormat: pa,
              defaultDisplayEventEnd: e.defaultDisplayEventEnd,
              disableResizing: !e.seg.eventRange.def.allDay,
            }),
          );
        }
      }
      class ma extends lr {
        render() {
          let { props: e, context: t } = this,
            { options: n } = t,
            { seg: r } = e,
            i = Si(r, n.eventTimeFormat || pa, t, !0, e.defaultDisplayEventEnd);
          return te(
            Fo,
            Object.assign({}, e, {
              elTag: "a",
              elClasses: ["fc-daygrid-event", "fc-daygrid-dot-event"],
              elAttrs: xi(e.seg, t),
              defaultGenerator: ya,
              timeText: i,
              isResizing: !1,
              isDateSelecting: !1,
            }),
          );
        }
      }
      function ya(e) {
        return te(
          re,
          null,
          te("div", {
            className: "fc-daygrid-event-dot",
            style: { borderColor: e.borderColor || e.backgroundColor },
          }),
          e.timeText && te("div", { className: "fc-event-time" }, e.timeText),
          te(
            "div",
            { className: "fc-event-title" },
            e.event.title || te(re, null, " "),
          ),
        );
      }
      class ba extends lr {
        constructor() {
          super(...arguments), (this.compileSegs = fn(Ea));
        }
        render() {
          let { props: e } = this,
            { allSegs: t, invisibleSegs: n } = this.compileSegs(
              e.singlePlacements,
            );
          return te(is, {
            elClasses: ["fc-daygrid-more-link"],
            dateProfile: e.dateProfile,
            todayRange: e.todayRange,
            allDayDate: e.allDayDate,
            moreCnt: e.moreCnt,
            allSegs: t,
            hiddenSegs: n,
            alignmentElRef: e.alignmentElRef,
            alignGridTop: e.alignGridTop,
            extraDateSpan: e.extraDateSpan,
            popoverContent: () => {
              let n =
                (e.eventDrag ? e.eventDrag.affectedInstances : null) ||
                (e.eventResize ? e.eventResize.affectedInstances : null) ||
                {};
              return te(
                re,
                null,
                t.map((t) => {
                  let r = t.eventRange.instance.instanceId;
                  return te(
                    "div",
                    {
                      className: "fc-daygrid-event-harness",
                      key: r,
                      style: { visibility: n[r] ? "hidden" : "" },
                    },
                    ga(t)
                      ? te(
                          ma,
                          Object.assign(
                            {
                              seg: t,
                              isDragging: !1,
                              isSelected: r === e.eventSelection,
                              defaultDisplayEventEnd: !1,
                            },
                            _i(t, e.todayRange),
                          ),
                        )
                      : te(
                          va,
                          Object.assign(
                            {
                              seg: t,
                              isDragging: !1,
                              isResizing: !1,
                              isDateSelecting: !1,
                              isSelected: r === e.eventSelection,
                              defaultDisplayEventEnd: !1,
                            },
                            _i(t, e.todayRange),
                          ),
                        ),
                  );
                }),
              );
            },
          });
        }
      }
      function Ea(e) {
        let t = [],
          n = [];
        for (let r of e) t.push(r.seg), r.isVisible || n.push(r.seg);
        return { allSegs: t, invisibleSegs: n };
      }
      const Aa = Rn({ week: "narrow" });
      class wa extends ro {
        constructor() {
          super(...arguments),
            (this.rootElRef = { current: null }),
            (this.state = { dayNumberId: Ct() }),
            (this.handleRootEl = (e) => {
              cr(this.rootElRef, e), cr(this.props.elRef, e);
            });
        }
        render() {
          let { context: e, props: t, state: n, rootElRef: r } = this,
            { options: i, dateEnv: o } = e,
            { date: s, dateProfile: a } = t;
          const l =
            t.showDayNumber &&
            (function (e, t, n) {
              const { start: r, end: i } = t,
                o = Jt(i, -1),
                s = n.getYear(r),
                a = n.getMonth(r),
                l = n.getYear(o),
                c = n.getMonth(o);
              return (
                !(s === l && a === c) &&
                Boolean(
                  e.valueOf() === r.valueOf() ||
                    (1 === n.getDay(e) && e.valueOf() < i.valueOf()),
                )
              );
            })(s, a.currentRange, o);
          return te(
            $o,
            {
              elTag: "td",
              elRef: this.handleRootEl,
              elClasses: ["fc-daygrid-day", ...(t.extraClassNames || [])],
              elAttrs: Object.assign(
                Object.assign(
                  Object.assign({}, t.extraDataAttrs),
                  t.showDayNumber ? { "aria-labelledby": n.dayNumberId } : {},
                ),
                { role: "gridcell" },
              ),
              defaultGenerator: Da,
              date: s,
              dateProfile: a,
              todayRange: t.todayRange,
              showDayNumber: t.showDayNumber,
              isMonthStart: l,
              extraRenderProps: t.extraRenderProps,
            },
            (o, a) =>
              te(
                "div",
                {
                  ref: t.innerElRef,
                  className: "fc-daygrid-day-frame fc-scrollgrid-sync-inner",
                  style: { minHeight: t.minHeight },
                },
                t.showWeekNumber &&
                  te(es, {
                    elTag: "a",
                    elClasses: ["fc-daygrid-week-number"],
                    elAttrs: Vi(e, s, "week"),
                    date: s,
                    defaultFormat: Aa,
                  }),
                !a.isDisabled && (t.showDayNumber || qo(i) || t.forceDayTop)
                  ? te(
                      "div",
                      { className: "fc-daygrid-day-top" },
                      te(o, {
                        elTag: "a",
                        elClasses: [
                          "fc-daygrid-day-number",
                          l && "fc-daygrid-month-start",
                        ],
                        elAttrs: Object.assign(Object.assign({}, Vi(e, s)), {
                          id: n.dayNumberId,
                        }),
                      }),
                    )
                  : t.showDayNumber
                    ? te(
                        "div",
                        {
                          className: "fc-daygrid-day-top",
                          style: { visibility: "hidden" },
                        },
                        te("a", { className: "fc-daygrid-day-number" }, " "),
                      )
                    : void 0,
                te(
                  "div",
                  { className: "fc-daygrid-day-events", ref: t.fgContentElRef },
                  t.fgContent,
                  te(
                    "div",
                    {
                      className: "fc-daygrid-day-bottom",
                      style: { marginTop: t.moreMarginTop },
                    },
                    te(ba, {
                      allDayDate: s,
                      singlePlacements: t.singlePlacements,
                      moreCnt: t.moreCnt,
                      alignmentElRef: r,
                      alignGridTop: !t.showDayNumber,
                      extraDateSpan: t.extraDateSpan,
                      dateProfile: t.dateProfile,
                      eventSelection: t.eventSelection,
                      eventDrag: t.eventDrag,
                      eventResize: t.eventResize,
                      todayRange: t.todayRange,
                    }),
                  ),
                ),
                te("div", { className: "fc-daygrid-day-bg" }, t.bgContent),
              ),
          );
        }
      }
      function Da(e) {
        return e.dayNumberText || te(re, null, " ");
      }
      function Sa(e) {
        return e.eventRange.instance.instanceId + ":" + e.firstCol;
      }
      function _a(e) {
        return Sa(e) + ":" + e.lastCol;
      }
      function Ca(e, t, n, r) {
        if (e.firstCol === t && e.lastCol === n - 1) return e;
        let i = e.eventRange,
          o = i.range,
          s = Ar(o, { start: r[t].date, end: Xt(r[n - 1].date, 1) });
        return Object.assign(Object.assign({}, e), {
          firstCol: t,
          lastCol: n - 1,
          eventRange: {
            def: i.def,
            ui: Object.assign(Object.assign({}, i.ui), {
              durationEditable: !1,
            }),
            instance: i.instance,
            range: s,
          },
          isStart: e.isStart && s.start.valueOf() === o.start.valueOf(),
          isEnd: e.isEnd && s.end.valueOf() === o.end.valueOf(),
        });
      }
      class xa extends io {
        constructor() {
          super(...arguments),
            (this.hiddenConsumes = !1),
            (this.forceHidden = {});
        }
        addSegs(e) {
          const t = super.addSegs(e),
            { entriesByLevel: n } = this,
            r = (e) => !this.forceHidden[so(e)];
          for (let e = 0; e < n.length; e += 1) n[e] = n[e].filter(r);
          return t;
        }
        handleInvalidInsertion(e, t, n) {
          const { entriesByLevel: r, forceHidden: i } = this,
            { touchingEntry: o, touchingLevel: s, touchingLateral: a } = e;
          if (this.hiddenConsumes && o) {
            const e = so(o);
            if (!i[e])
              if (this.allowReslicing) {
                const e = Object.assign(Object.assign({}, o), {
                  span: ao(o.span, t.span),
                });
                (i[so(e)] = !0),
                  (r[s][a] = e),
                  n.push(e),
                  this.splitEntry(o, t, n);
              } else (i[e] = !0), n.push(o);
          }
          super.handleInvalidInsertion(e, t, n);
        }
      }
      class Ra extends ro {
        constructor() {
          super(...arguments),
            (this.cellElRefs = new Po()),
            (this.frameElRefs = new Po()),
            (this.fgElRefs = new Po()),
            (this.segHarnessRefs = new Po()),
            (this.rootElRef = { current: null }),
            (this.state = {
              framePositions: null,
              maxContentHeight: null,
              segHeights: {},
            }),
            (this.handleResize = (e) => {
              e && this.updateSizing(!0);
            });
        }
        render() {
          let { props: e, state: t, context: n } = this,
            { options: r } = n,
            i = e.cells.length,
            o = ha(e.businessHourSegs, i),
            s = ha(e.bgEventSegs, i),
            a = ha(this.getHighlightSegs(), i),
            l = ha(this.getMirrorSegs(), i),
            {
              singleColPlacements: c,
              multiColPlacements: u,
              moreCnts: d,
              moreMarginTops: h,
            } = (function (e, t, n, r, i, o, s) {
              let a = new xa((t) => {
                let n =
                  e[t.index].eventRange.instance.instanceId +
                  ":" +
                  t.span.start +
                  ":" +
                  (t.span.end - 1);
                return i[n] || 1;
              });
              (a.allowReslicing = !0),
                (a.strictOrder = r),
                !0 === t || !0 === n
                  ? ((a.maxCoord = o), (a.hiddenConsumes = !0))
                  : "number" == typeof t
                    ? (a.maxStackCnt = t)
                    : "number" == typeof n &&
                      ((a.maxStackCnt = n), (a.hiddenConsumes = !0));
              let l = [],
                c = [];
              for (let t = 0; t < e.length; t += 1) {
                let n = e[t],
                  r = _a(n);
                null != i[r]
                  ? l.push({
                      index: t,
                      span: { start: n.firstCol, end: n.lastCol + 1 },
                    })
                  : c.push(n);
              }
              let u = a.addSegs(l),
                d = a.toRects(),
                {
                  singleColPlacements: h,
                  multiColPlacements: f,
                  leftoverMargins: p,
                } = (function (e, t, n) {
                  let r = (function (e, t) {
                      let n = [];
                      for (let e = 0; e < t; e += 1) n.push([]);
                      for (let t of e)
                        for (let e = t.span.start; e < t.span.end; e += 1)
                          n[e].push(t);
                      return n;
                    })(e, n.length),
                    i = [],
                    o = [],
                    s = [];
                  for (let e = 0; e < n.length; e += 1) {
                    let a = r[e],
                      l = [],
                      c = 0,
                      u = 0;
                    for (let r of a) {
                      let i = t[r.index];
                      l.push({
                        seg: Ca(i, e, e + 1, n),
                        isVisible: !0,
                        isAbsolute: !1,
                        absoluteTop: r.levelCoord,
                        marginTop: r.levelCoord - c,
                      }),
                        (c = r.levelCoord + r.thickness);
                    }
                    let d = [];
                    (c = 0), (u = 0);
                    for (let r of a) {
                      let i = t[r.index],
                        o = r.span.end - r.span.start > 1,
                        s = r.span.start === e;
                      (u += r.levelCoord - c),
                        (c = r.levelCoord + r.thickness),
                        o
                          ? ((u += r.thickness),
                            s &&
                              d.push({
                                seg: Ca(i, r.span.start, r.span.end, n),
                                isVisible: !0,
                                isAbsolute: !0,
                                absoluteTop: r.levelCoord,
                                marginTop: 0,
                              }))
                          : s &&
                            (d.push({
                              seg: Ca(i, r.span.start, r.span.end, n),
                              isVisible: !0,
                              isAbsolute: !1,
                              absoluteTop: r.levelCoord,
                              marginTop: u,
                            }),
                            (u = 0));
                    }
                    i.push(l), o.push(d), s.push(u);
                  }
                  return {
                    singleColPlacements: i,
                    multiColPlacements: o,
                    leftoverMargins: s,
                  };
                })(d, e, s),
                g = [],
                v = [];
              for (let e of c) {
                f[e.firstCol].push({
                  seg: e,
                  isVisible: !1,
                  isAbsolute: !0,
                  absoluteTop: 0,
                  marginTop: 0,
                });
                for (let t = e.firstCol; t <= e.lastCol; t += 1)
                  h[t].push({
                    seg: Ca(e, t, t + 1, s),
                    isVisible: !1,
                    isAbsolute: !1,
                    absoluteTop: 0,
                    marginTop: 0,
                  });
              }
              for (let e = 0; e < s.length; e += 1) g.push(0);
              for (let t of u) {
                let n = e[t.index],
                  r = t.span;
                f[r.start].push({
                  seg: Ca(n, r.start, r.end, s),
                  isVisible: !1,
                  isAbsolute: !0,
                  absoluteTop: 0,
                  marginTop: 0,
                });
                for (let e = r.start; e < r.end; e += 1)
                  (g[e] += 1),
                    h[e].push({
                      seg: Ca(n, e, e + 1, s),
                      isVisible: !1,
                      isAbsolute: !1,
                      absoluteTop: 0,
                      marginTop: 0,
                    });
              }
              for (let e = 0; e < s.length; e += 1) v.push(p[e]);
              return {
                singleColPlacements: h,
                multiColPlacements: f,
                moreCnts: g,
                moreMarginTops: v,
              };
            })(
              (function (e, t) {
                let n = e.map(Ei);
                return (
                  n.sort((e, n) =>
                    (function (e, t, n) {
                      let r, i;
                      for (r = 0; r < n.length; r += 1)
                        if (((i = Ht(e, t, n[r])), i)) return i;
                      return 0;
                    })(e, n, t),
                  ),
                  n.map((e) => e._seg)
                );
              })(e.fgEventSegs, r.eventOrder),
              e.dayMaxEvents,
              e.dayMaxEventRows,
              r.eventOrderStrict,
              t.segHeights,
              t.maxContentHeight,
              e.cells,
            ),
            f =
              (e.eventDrag && e.eventDrag.affectedInstances) ||
              (e.eventResize && e.eventResize.affectedInstances) ||
              {};
          return te(
            "tr",
            { ref: this.rootElRef, role: "row" },
            e.renderIntro && e.renderIntro(),
            e.cells.map((t, n) => {
              let r = this.renderFgSegs(
                  n,
                  e.forPrint ? c[n] : u[n],
                  e.todayRange,
                  f,
                ),
                i = this.renderFgSegs(
                  n,
                  (function (e, t) {
                    if (!e.length) return [];
                    let n = (function (e) {
                      let t = {};
                      for (let n of e)
                        for (let e of n)
                          t[e.seg.eventRange.instance.instanceId] =
                            e.absoluteTop;
                      return t;
                    })(t);
                    return e.map((e) => ({
                      seg: e,
                      isVisible: !0,
                      isAbsolute: !0,
                      absoluteTop: n[e.eventRange.instance.instanceId],
                      marginTop: 0,
                    }));
                  })(l[n], u),
                  e.todayRange,
                  {},
                  Boolean(e.eventDrag),
                  Boolean(e.eventResize),
                  !1,
                );
              return te(wa, {
                key: t.key,
                elRef: this.cellElRefs.createRef(t.key),
                innerElRef: this.frameElRefs.createRef(t.key),
                dateProfile: e.dateProfile,
                date: t.date,
                showDayNumber: e.showDayNumbers,
                showWeekNumber: e.showWeekNumbers && 0 === n,
                forceDayTop: e.showWeekNumbers,
                todayRange: e.todayRange,
                eventSelection: e.eventSelection,
                eventDrag: e.eventDrag,
                eventResize: e.eventResize,
                extraRenderProps: t.extraRenderProps,
                extraDataAttrs: t.extraDataAttrs,
                extraClassNames: t.extraClassNames,
                extraDateSpan: t.extraDateSpan,
                moreCnt: d[n],
                moreMarginTop: h[n],
                singlePlacements: c[n],
                fgContentElRef: this.fgElRefs.createRef(t.key),
                fgContent: te(re, null, te(re, null, r), te(re, null, i)),
                bgContent: te(
                  re,
                  null,
                  this.renderFillSegs(a[n], "highlight"),
                  this.renderFillSegs(o[n], "non-business"),
                  this.renderFillSegs(s[n], "bg-event"),
                ),
                minHeight: e.cellMinHeight,
              });
            }),
          );
        }
        componentDidMount() {
          this.updateSizing(!0),
            this.context.addResizeHandler(this.handleResize);
        }
        componentDidUpdate(e, t) {
          let n = this.props;
          this.updateSizing(!Gn(e, n));
        }
        componentWillUnmount() {
          this.context.removeResizeHandler(this.handleResize);
        }
        getHighlightSegs() {
          let { props: e } = this;
          return e.eventDrag && e.eventDrag.segs.length
            ? e.eventDrag.segs
            : e.eventResize && e.eventResize.segs.length
              ? e.eventResize.segs
              : e.dateSelectionSegs;
        }
        getMirrorSegs() {
          let { props: e } = this;
          return e.eventResize && e.eventResize.segs.length
            ? e.eventResize.segs
            : [];
        }
        renderFgSegs(e, t, n, r, i, o, s) {
          let { context: a } = this,
            { eventSelection: l } = this.props,
            { framePositions: c } = this.state,
            u = 1 === this.props.cells.length,
            d = i || o || s,
            h = [];
          if (c)
            for (let e of t) {
              let { seg: t } = e,
                { instanceId: f } = t.eventRange.instance,
                p = e.isVisible && !r[f],
                g = e.isAbsolute,
                v = "",
                m = "";
              g &&
                (a.isRtl
                  ? ((m = 0), (v = c.lefts[t.lastCol] - c.lefts[t.firstCol]))
                  : ((v = 0),
                    (m = c.rights[t.firstCol] - c.rights[t.lastCol]))),
                h.push(
                  te(
                    "div",
                    {
                      className:
                        "fc-daygrid-event-harness" +
                        (g ? " fc-daygrid-event-harness-abs" : ""),
                      key: Sa(t),
                      ref: d ? null : this.segHarnessRefs.createRef(_a(t)),
                      style: {
                        visibility: p ? "" : "hidden",
                        marginTop: g ? "" : e.marginTop,
                        top: g ? e.absoluteTop : "",
                        left: v,
                        right: m,
                      },
                    },
                    ga(t)
                      ? te(
                          ma,
                          Object.assign(
                            {
                              seg: t,
                              isDragging: i,
                              isSelected: f === l,
                              defaultDisplayEventEnd: u,
                            },
                            _i(t, n),
                          ),
                        )
                      : te(
                          va,
                          Object.assign(
                            {
                              seg: t,
                              isDragging: i,
                              isResizing: o,
                              isDateSelecting: s,
                              isSelected: f === l,
                              defaultDisplayEventEnd: u,
                            },
                            _i(t, n),
                          ),
                        ),
                  ),
                );
            }
          return h;
        }
        renderFillSegs(e, t) {
          let { isRtl: n } = this.context,
            { todayRange: r } = this.props,
            { framePositions: i } = this.state,
            o = [];
          if (i)
            for (let a of e) {
              let e = n
                ? { right: 0, left: i.lefts[a.lastCol] - i.lefts[a.firstCol] }
                : {
                    left: 0,
                    right: i.rights[a.firstCol] - i.rights[a.lastCol],
                  };
              o.push(
                te(
                  "div",
                  {
                    key:
                      ((s = a.eventRange),
                      s.instance
                        ? s.instance.instanceId
                        : `${s.def.defId}:${s.range.start.toISOString()}`),
                    className: "fc-daygrid-bg-harness",
                    style: e,
                  },
                  "bg-event" === t
                    ? te(Xo, Object.assign({ seg: a }, _i(a, r)))
                    : Ko(t),
                ),
              );
            }
          var s;
          return te(re, {}, ...o);
        }
        updateSizing(e) {
          let { props: t, state: n, frameElRefs: r } = this;
          if (!t.forPrint && null !== t.clientWidth) {
            if (e) {
              let e = t.cells.map((e) => r.currentMap[e.key]);
              if (e.length) {
                let t = this.rootElRef.current,
                  r = new Ji(t, e, !0, !1);
                (n.framePositions && n.framePositions.similarTo(r)) ||
                  this.setState({ framePositions: new Ji(t, e, !0, !1) });
              }
            }
            const i = this.state.segHeights,
              o = this.querySegHeights(),
              s = !0 === t.dayMaxEvents || !0 === t.dayMaxEventRows;
            this.safeSetState({
              segHeights: Object.assign(Object.assign({}, i), o),
              maxContentHeight: s ? this.computeMaxContentHeight() : null,
            });
          }
        }
        querySegHeights() {
          let e = this.segHarnessRefs.currentMap,
            t = {};
          for (let n in e) {
            let r = Math.round(e[n].getBoundingClientRect().height);
            t[n] = Math.max(t[n] || 0, r);
          }
          return t;
        }
        computeMaxContentHeight() {
          let e = this.props.cells[0].key,
            t = this.cellElRefs.currentMap[e],
            n = this.fgElRefs.currentMap[e];
          return (
            t.getBoundingClientRect().bottom - n.getBoundingClientRect().top
          );
        }
        getCellEls() {
          let e = this.cellElRefs.currentMap;
          return this.props.cells.map((t) => e[t.key]);
        }
      }
      Ra.addStateEquality({ segHeights: Gn });
      class Ta extends ro {
        constructor() {
          super(...arguments),
            (this.splitBusinessHourSegs = fn(da)),
            (this.splitBgEventSegs = fn(da)),
            (this.splitFgEventSegs = fn(da)),
            (this.splitDateSelectionSegs = fn(da)),
            (this.splitEventDrag = fn(fa)),
            (this.splitEventResize = fn(fa)),
            (this.rowRefs = new Po());
        }
        render() {
          let { props: e, context: t } = this,
            n = e.cells.length,
            r = this.splitBusinessHourSegs(e.businessHourSegs, n),
            i = this.splitBgEventSegs(e.bgEventSegs, n),
            o = this.splitFgEventSegs(e.fgEventSegs, n),
            s = this.splitDateSelectionSegs(e.dateSelectionSegs, n),
            a = this.splitEventDrag(e.eventDrag, n),
            l = this.splitEventResize(e.eventResize, n),
            c =
              n >= 7 && e.clientWidth
                ? e.clientWidth / t.options.aspectRatio / 6
                : null;
          return te(yo, { unit: "day" }, (t, u) =>
            te(
              re,
              null,
              e.cells.map((t, d) =>
                te(Ra, {
                  ref: this.rowRefs.createRef(d),
                  key: t.length ? t[0].date.toISOString() : d,
                  showDayNumbers: n > 1,
                  showWeekNumbers: e.showWeekNumbers,
                  todayRange: u,
                  dateProfile: e.dateProfile,
                  cells: t,
                  renderIntro: e.renderRowIntro,
                  businessHourSegs: r[d],
                  eventSelection: e.eventSelection,
                  bgEventSegs: i[d].filter(ka),
                  fgEventSegs: o[d],
                  dateSelectionSegs: s[d],
                  eventDrag: a[d],
                  eventResize: l[d],
                  dayMaxEvents: e.dayMaxEvents,
                  dayMaxEventRows: e.dayMaxEventRows,
                  clientWidth: e.clientWidth,
                  clientHeight: e.clientHeight,
                  cellMinHeight: c,
                  forPrint: e.forPrint,
                }),
              ),
            ),
          );
        }
        componentDidMount() {
          this.registerInteractiveComponent();
        }
        componentDidUpdate() {
          this.registerInteractiveComponent();
        }
        registerInteractiveComponent() {
          if (!this.rootEl) {
            const e = this.rowRefs.currentMap[0].getCellEls()[0],
              t = e ? e.closest(".fc-daygrid-body") : null;
            t &&
              ((this.rootEl = t),
              this.context.registerInteractiveComponent(this, {
                el: t,
                isHitComboAllowed: this.props.isHitComboAllowed,
              }));
          }
        }
        componentWillUnmount() {
          this.rootEl &&
            (this.context.unregisterInteractiveComponent(this),
            (this.rootEl = null));
        }
        prepareHits() {
          (this.rowPositions = new Ji(
            this.rootEl,
            this.rowRefs.collect().map((e) => e.getCellEls()[0]),
            !1,
            !0,
          )),
            (this.colPositions = new Ji(
              this.rootEl,
              this.rowRefs.currentMap[0].getCellEls(),
              !0,
              !1,
            ));
        }
        queryHit(e, t) {
          let { colPositions: n, rowPositions: r } = this,
            i = n.leftToIndex(e),
            o = r.topToIndex(t);
          if (null != o && null != i) {
            let e = this.props.cells[o][i];
            return {
              dateProfile: this.props.dateProfile,
              dateSpan: Object.assign(
                { range: this.getCellRange(o, i), allDay: !0 },
                e.extraDateSpan,
              ),
              dayEl: this.getCellEl(o, i),
              rect: {
                left: n.lefts[i],
                right: n.rights[i],
                top: r.tops[o],
                bottom: r.bottoms[o],
              },
              layer: 0,
            };
          }
          return null;
        }
        getCellEl(e, t) {
          return this.rowRefs.currentMap[e].getCellEls()[t];
        }
        getCellRange(e, t) {
          let n = this.props.cells[e][t].date;
          return { start: n, end: Xt(n, 1) };
        }
      }
      function ka(e) {
        return e.eventRange.def.allDay;
      }
      class Ma extends ro {
        constructor() {
          super(...arguments),
            (this.elRef = { current: null }),
            (this.needsScrollReset = !1);
        }
        render() {
          let { props: e } = this,
            { dayMaxEventRows: t, dayMaxEvents: n, expandRows: r } = e,
            i = !0 === n || !0 === t;
          i && !r && ((i = !1), (t = null), (n = null));
          let o = [
            "fc-daygrid-body",
            i ? "fc-daygrid-body-balanced" : "fc-daygrid-body-unbalanced",
            r ? "" : "fc-daygrid-body-natural",
          ];
          return te(
            "div",
            {
              ref: this.elRef,
              className: o.join(" "),
              style: { width: e.clientWidth, minWidth: e.tableMinWidth },
            },
            te(
              "table",
              {
                role: "presentation",
                className: "fc-scrollgrid-sync-table",
                style: {
                  width: e.clientWidth,
                  minWidth: e.tableMinWidth,
                  height: r ? e.clientHeight : "",
                },
              },
              e.colGroupNode,
              te(
                "tbody",
                { role: "presentation" },
                te(Ta, {
                  dateProfile: e.dateProfile,
                  cells: e.cells,
                  renderRowIntro: e.renderRowIntro,
                  showWeekNumbers: e.showWeekNumbers,
                  clientWidth: e.clientWidth,
                  clientHeight: e.clientHeight,
                  businessHourSegs: e.businessHourSegs,
                  bgEventSegs: e.bgEventSegs,
                  fgEventSegs: e.fgEventSegs,
                  dateSelectionSegs: e.dateSelectionSegs,
                  eventSelection: e.eventSelection,
                  eventDrag: e.eventDrag,
                  eventResize: e.eventResize,
                  dayMaxEvents: n,
                  dayMaxEventRows: t,
                  forPrint: e.forPrint,
                  isHitComboAllowed: e.isHitComboAllowed,
                }),
              ),
            ),
          );
        }
        componentDidMount() {
          this.requestScrollReset();
        }
        componentDidUpdate(e) {
          e.dateProfile !== this.props.dateProfile
            ? this.requestScrollReset()
            : this.flushScrollReset();
        }
        requestScrollReset() {
          (this.needsScrollReset = !0), this.flushScrollReset();
        }
        flushScrollReset() {
          if (this.needsScrollReset && this.props.clientWidth) {
            const e = (function (e, t) {
              let n;
              var r;
              return (
                t.currentRangeUnit.match(/year|month/) &&
                  (n = e.querySelector(
                    `[data-date="${((r = t.currentDate), r.toISOString().match(/^\d{4}-\d{2}/)[0])}-01"]`,
                  )),
                n ||
                  (n = e.querySelector(`[data-date="${dn(t.currentDate)}"]`)),
                n
              );
            })(this.elRef.current, this.props.dateProfile);
            if (e) {
              const t = e.closest(".fc-daygrid-body"),
                n = t.closest(".fc-scroller"),
                r =
                  e.getBoundingClientRect().top - t.getBoundingClientRect().top;
              n.scrollTop = r ? r + 1 : 0;
            }
            this.needsScrollReset = !1;
          }
        }
      }
      class Oa extends So {
        constructor() {
          super(...arguments), (this.forceDayIfListItem = !0);
        }
        sliceRange(e, t) {
          return t.sliceRange(e);
        }
      }
      class Ia extends ro {
        constructor() {
          super(...arguments),
            (this.slicer = new Oa()),
            (this.tableRef = { current: null });
        }
        render() {
          let { props: e, context: t } = this;
          return te(
            Ma,
            Object.assign(
              { ref: this.tableRef },
              this.slicer.sliceProps(
                e,
                e.dateProfile,
                e.nextDayThreshold,
                t,
                e.dayTableModel,
              ),
              {
                dateProfile: e.dateProfile,
                cells: e.dayTableModel.cells,
                colGroupNode: e.colGroupNode,
                tableMinWidth: e.tableMinWidth,
                renderRowIntro: e.renderRowIntro,
                dayMaxEvents: e.dayMaxEvents,
                dayMaxEventRows: e.dayMaxEventRows,
                showWeekNumbers: e.showWeekNumbers,
                expandRows: e.expandRows,
                headerAlignElRef: e.headerAlignElRef,
                clientWidth: e.clientWidth,
                clientHeight: e.clientHeight,
                forPrint: e.forPrint,
              },
            ),
          );
        }
      }
      function Na(e, t) {
        let n = new wo(e.renderRange, t);
        return new Do(n, /year|month|week/.test(e.currentRangeUnit));
      }
      ft(
        ':root{--fc-daygrid-event-dot-width:8px}.fc-daygrid-day-events:after,.fc-daygrid-day-events:before,.fc-daygrid-day-frame:after,.fc-daygrid-day-frame:before,.fc-daygrid-event-harness:after,.fc-daygrid-event-harness:before{clear:both;content:"";display:table}.fc .fc-daygrid-body{position:relative;z-index:1}.fc .fc-daygrid-day.fc-day-today{background-color:var(--fc-today-bg-color)}.fc .fc-daygrid-day-frame{min-height:100%;position:relative}.fc .fc-daygrid-day-top{display:flex;flex-direction:row-reverse}.fc .fc-day-other .fc-daygrid-day-top{opacity:.3}.fc .fc-daygrid-day-number{padding:4px;position:relative;z-index:4}.fc .fc-daygrid-month-start{font-size:1.1em;font-weight:700}.fc .fc-daygrid-day-events{margin-top:1px}.fc .fc-daygrid-body-balanced .fc-daygrid-day-events{left:0;position:absolute;right:0}.fc .fc-daygrid-body-unbalanced .fc-daygrid-day-events{min-height:2em;position:relative}.fc .fc-daygrid-body-natural .fc-daygrid-day-events{margin-bottom:1em}.fc .fc-daygrid-event-harness{position:relative}.fc .fc-daygrid-event-harness-abs{left:0;position:absolute;right:0;top:0}.fc .fc-daygrid-bg-harness{bottom:0;position:absolute;top:0}.fc .fc-daygrid-day-bg .fc-non-business{z-index:1}.fc .fc-daygrid-day-bg .fc-bg-event{z-index:2}.fc .fc-daygrid-day-bg .fc-highlight{z-index:3}.fc .fc-daygrid-event{margin-top:1px;z-index:6}.fc .fc-daygrid-event.fc-event-mirror{z-index:7}.fc .fc-daygrid-day-bottom{font-size:.85em;margin:0 2px}.fc .fc-daygrid-day-bottom:after,.fc .fc-daygrid-day-bottom:before{clear:both;content:"";display:table}.fc .fc-daygrid-more-link{border-radius:3px;cursor:pointer;line-height:1;margin-top:1px;max-width:100%;overflow:hidden;padding:2px;position:relative;white-space:nowrap;z-index:4}.fc .fc-daygrid-more-link:hover{background-color:rgba(0,0,0,.1)}.fc .fc-daygrid-week-number{background-color:var(--fc-neutral-bg-color);color:var(--fc-neutral-text-color);min-width:1.5em;padding:2px;position:absolute;text-align:center;top:0;z-index:5}.fc .fc-more-popover .fc-popover-body{min-width:220px;padding:10px}.fc-direction-ltr .fc-daygrid-event.fc-event-start,.fc-direction-rtl .fc-daygrid-event.fc-event-end{margin-left:2px}.fc-direction-ltr .fc-daygrid-event.fc-event-end,.fc-direction-rtl .fc-daygrid-event.fc-event-start{margin-right:2px}.fc-direction-ltr .fc-daygrid-more-link{float:left}.fc-direction-ltr .fc-daygrid-week-number{border-radius:0 0 3px 0;left:0}.fc-direction-rtl .fc-daygrid-more-link{float:right}.fc-direction-rtl .fc-daygrid-week-number{border-radius:0 0 0 3px;right:0}.fc-liquid-hack .fc-daygrid-day-frame{position:static}.fc-daygrid-event{border-radius:3px;font-size:var(--fc-small-font-size);position:relative;white-space:nowrap}.fc-daygrid-block-event .fc-event-time{font-weight:700}.fc-daygrid-block-event .fc-event-time,.fc-daygrid-block-event .fc-event-title{padding:1px}.fc-daygrid-dot-event{align-items:center;display:flex;padding:2px 0}.fc-daygrid-dot-event .fc-event-title{flex-grow:1;flex-shrink:1;font-weight:700;min-width:0;overflow:hidden}.fc-daygrid-dot-event.fc-event-mirror,.fc-daygrid-dot-event:hover{background:rgba(0,0,0,.1)}.fc-daygrid-dot-event.fc-event-selected:before{bottom:-10px;top:-10px}.fc-daygrid-event-dot{border:calc(var(--fc-daygrid-event-dot-width)/2) solid var(--fc-event-border-color);border-radius:calc(var(--fc-daygrid-event-dot-width)/2);box-sizing:content-box;height:0;margin:0 4px;width:0}.fc-direction-ltr .fc-daygrid-event .fc-event-time{margin-right:3px}.fc-direction-rtl .fc-daygrid-event .fc-event-time{margin-left:3px}',
      );
      var Pa = vs({
        name: "@fullcalendar/daygrid",
        initialView: "dayGridMonth",
        views: {
          dayGrid: {
            component: class extends ua {
              constructor() {
                super(...arguments),
                  (this.buildDayTableModel = fn(Na)),
                  (this.headerRef = { current: null }),
                  (this.tableRef = { current: null });
              }
              render() {
                let { options: e, dateProfileGenerator: t } = this.context,
                  { props: n } = this,
                  r = this.buildDayTableModel(n.dateProfile, t),
                  i =
                    e.dayHeaders &&
                    te(Eo, {
                      ref: this.headerRef,
                      dateProfile: n.dateProfile,
                      dates: r.headerDates,
                      datesRepDistinctDays: 1 === r.rowCnt,
                    }),
                  o = (t) =>
                    te(Ia, {
                      ref: this.tableRef,
                      dateProfile: n.dateProfile,
                      dayTableModel: r,
                      businessHours: n.businessHours,
                      dateSelection: n.dateSelection,
                      eventStore: n.eventStore,
                      eventUiBases: n.eventUiBases,
                      eventSelection: n.eventSelection,
                      eventDrag: n.eventDrag,
                      eventResize: n.eventResize,
                      nextDayThreshold: e.nextDayThreshold,
                      colGroupNode: t.tableColGroupNode,
                      tableMinWidth: t.tableMinWidth,
                      dayMaxEvents: e.dayMaxEvents,
                      dayMaxEventRows: e.dayMaxEventRows,
                      showWeekNumbers: e.weekNumbers,
                      expandRows: !n.isHeightAuto,
                      headerAlignElRef: this.headerElRef,
                      clientWidth: t.clientWidth,
                      clientHeight: t.clientHeight,
                      forPrint: n.forPrint,
                    });
                return e.dayMinWidth
                  ? this.renderHScrollLayout(i, o, r.colCnt, e.dayMinWidth)
                  : this.renderSimpleLayout(i, o);
              }
            },
            dateProfileGeneratorClass: class extends Tr {
              buildRenderRange(e, t, n) {
                let r = super.buildRenderRange(e, t, n),
                  { props: i } = this;
                return (function (e) {
                  let t,
                    { dateEnv: n, currentRange: r } = e,
                    { start: i, end: o } = r;
                  if (
                    (e.snapToWeek &&
                      ((i = n.startOfWeek(i)),
                      (t = n.startOfWeek(o)),
                      t.valueOf() !== o.valueOf() && (o = Zt(t, 1))),
                    e.fixedWeekCount)
                  ) {
                    let e = n.startOfWeek(n.startOfMonth(Xt(r.end, -1)));
                    o = Zt(o, 6 - Math.ceil(Kt(e, o) / 7));
                  }
                  return { start: i, end: o };
                })({
                  currentRange: r,
                  snapToWeek: /^(year|month)$/.test(t),
                  fixedWeekCount: i.fixedWeekCount,
                  dateEnv: i.dateEnv,
                });
              }
            },
          },
          dayGridDay: { type: "dayGrid", duration: { days: 1 } },
          dayGridWeek: { type: "dayGrid", duration: { weeks: 1 } },
          dayGridMonth: {
            type: "dayGrid",
            duration: { months: 1 },
            fixedWeekCount: !0,
          },
          dayGridYear: { type: "dayGrid", duration: { years: 1 } },
        },
      });
      ho.touchMouseIgnoreWait = 500;
      let Ha = 0,
        ja = 0,
        La = !1;
      class Ba {
        constructor(e) {
          (this.subjectEl = null),
            (this.selector = ""),
            (this.handleSelector = ""),
            (this.shouldIgnoreMove = !1),
            (this.shouldWatchScroll = !0),
            (this.isDragging = !1),
            (this.isTouchDragging = !1),
            (this.wasTouchScroll = !1),
            (this.handleMouseDown = (e) => {
              if (
                !this.shouldIgnoreMouse() &&
                (function (e) {
                  return 0 === e.button && !e.ctrlKey;
                })(e) &&
                this.tryStart(e)
              ) {
                let t = this.createEventFromMouse(e, !0);
                this.emitter.trigger("pointerdown", t),
                  this.initScrollWatch(t),
                  this.shouldIgnoreMove ||
                    document.addEventListener(
                      "mousemove",
                      this.handleMouseMove,
                    ),
                  document.addEventListener("mouseup", this.handleMouseUp);
              }
            }),
            (this.handleMouseMove = (e) => {
              let t = this.createEventFromMouse(e);
              this.recordCoords(t), this.emitter.trigger("pointermove", t);
            }),
            (this.handleMouseUp = (e) => {
              document.removeEventListener("mousemove", this.handleMouseMove),
                document.removeEventListener("mouseup", this.handleMouseUp),
                this.emitter.trigger("pointerup", this.createEventFromMouse(e)),
                this.cleanup();
            }),
            (this.handleTouchStart = (e) => {
              if (this.tryStart(e)) {
                this.isTouchDragging = !0;
                let t = this.createEventFromTouch(e, !0);
                this.emitter.trigger("pointerdown", t), this.initScrollWatch(t);
                let n = e.target;
                this.shouldIgnoreMove ||
                  n.addEventListener("touchmove", this.handleTouchMove),
                  n.addEventListener("touchend", this.handleTouchEnd),
                  n.addEventListener("touchcancel", this.handleTouchEnd),
                  window.addEventListener("scroll", this.handleTouchScroll, !0);
              }
            }),
            (this.handleTouchMove = (e) => {
              let t = this.createEventFromTouch(e);
              this.recordCoords(t), this.emitter.trigger("pointermove", t);
            }),
            (this.handleTouchEnd = (e) => {
              if (this.isDragging) {
                let t = e.target;
                t.removeEventListener("touchmove", this.handleTouchMove),
                  t.removeEventListener("touchend", this.handleTouchEnd),
                  t.removeEventListener("touchcancel", this.handleTouchEnd),
                  window.removeEventListener(
                    "scroll",
                    this.handleTouchScroll,
                    !0,
                  ),
                  this.emitter.trigger(
                    "pointerup",
                    this.createEventFromTouch(e),
                  ),
                  this.cleanup(),
                  (this.isTouchDragging = !1),
                  (Ha += 1),
                  setTimeout(() => {
                    Ha -= 1;
                  }, ho.touchMouseIgnoreWait);
              }
            }),
            (this.handleTouchScroll = () => {
              this.wasTouchScroll = !0;
            }),
            (this.handleScroll = (e) => {
              if (!this.shouldIgnoreMove) {
                let t = window.scrollX - this.prevScrollX + this.prevPageX,
                  n = window.scrollY - this.prevScrollY + this.prevPageY;
                this.emitter.trigger("pointermove", {
                  origEvent: e,
                  isTouch: this.isTouchDragging,
                  subjectEl: this.subjectEl,
                  pageX: t,
                  pageY: n,
                  deltaX: t - this.origPageX,
                  deltaY: n - this.origPageY,
                });
              }
            }),
            (this.containerEl = e),
            (this.emitter = new ri()),
            e.addEventListener("mousedown", this.handleMouseDown),
            e.addEventListener("touchstart", this.handleTouchStart, {
              passive: !0,
            }),
            (ja += 1),
            1 === ja &&
              window.addEventListener("touchmove", Ua, { passive: !1 });
        }
        destroy() {
          this.containerEl.removeEventListener(
            "mousedown",
            this.handleMouseDown,
          ),
            this.containerEl.removeEventListener(
              "touchstart",
              this.handleTouchStart,
              { passive: !0 },
            ),
            (ja -= 1),
            ja || window.removeEventListener("touchmove", Ua, { passive: !1 });
        }
        tryStart(e) {
          let t = this.querySubjectEl(e),
            n = e.target;
          return !(
            !t ||
            (this.handleSelector && !bt(n, this.handleSelector)) ||
            ((this.subjectEl = t),
            (this.isDragging = !0),
            (this.wasTouchScroll = !1),
            0)
          );
        }
        cleanup() {
          (La = !1),
            (this.isDragging = !1),
            (this.subjectEl = null),
            this.destroyScrollWatch();
        }
        querySubjectEl(e) {
          return this.selector ? bt(e.target, this.selector) : this.containerEl;
        }
        shouldIgnoreMouse() {
          return Ha || this.isTouchDragging;
        }
        cancelTouchScroll() {
          this.isDragging && (La = !0);
        }
        initScrollWatch(e) {
          this.shouldWatchScroll &&
            (this.recordCoords(e),
            window.addEventListener("scroll", this.handleScroll, !0));
        }
        recordCoords(e) {
          this.shouldWatchScroll &&
            ((this.prevPageX = e.pageX),
            (this.prevPageY = e.pageY),
            (this.prevScrollX = window.scrollX),
            (this.prevScrollY = window.scrollY));
        }
        destroyScrollWatch() {
          this.shouldWatchScroll &&
            window.removeEventListener("scroll", this.handleScroll, !0);
        }
        createEventFromMouse(e, t) {
          let n = 0,
            r = 0;
          return (
            t
              ? ((this.origPageX = e.pageX), (this.origPageY = e.pageY))
              : ((n = e.pageX - this.origPageX),
                (r = e.pageY - this.origPageY)),
            {
              origEvent: e,
              isTouch: !1,
              subjectEl: this.subjectEl,
              pageX: e.pageX,
              pageY: e.pageY,
              deltaX: n,
              deltaY: r,
            }
          );
        }
        createEventFromTouch(e, t) {
          let n,
            r,
            i = e.touches,
            o = 0,
            s = 0;
          return (
            i && i.length
              ? ((n = i[0].pageX), (r = i[0].pageY))
              : ((n = e.pageX), (r = e.pageY)),
            t
              ? ((this.origPageX = n), (this.origPageY = r))
              : ((o = n - this.origPageX), (s = r - this.origPageY)),
            {
              origEvent: e,
              isTouch: !0,
              subjectEl: this.subjectEl,
              pageX: n,
              pageY: r,
              deltaX: o,
              deltaY: s,
            }
          );
        }
      }
      function Ua(e) {
        La && e.preventDefault();
      }
      class za {
        constructor() {
          (this.isVisible = !1),
            (this.sourceEl = null),
            (this.mirrorEl = null),
            (this.sourceElRect = null),
            (this.parentNode = document.body),
            (this.zIndex = 9999),
            (this.revertDuration = 0);
        }
        start(e, t, n) {
          (this.sourceEl = e),
            (this.sourceElRect = this.sourceEl.getBoundingClientRect()),
            (this.origScreenX = t - window.scrollX),
            (this.origScreenY = n - window.scrollY),
            (this.deltaX = 0),
            (this.deltaY = 0),
            this.updateElPosition();
        }
        handleMove(e, t) {
          (this.deltaX = e - window.scrollX - this.origScreenX),
            (this.deltaY = t - window.scrollY - this.origScreenY),
            this.updateElPosition();
        }
        setIsVisible(e) {
          e
            ? this.isVisible ||
              (this.mirrorEl && (this.mirrorEl.style.display = ""),
              (this.isVisible = e),
              this.updateElPosition())
            : this.isVisible &&
              (this.mirrorEl && (this.mirrorEl.style.display = "none"),
              (this.isVisible = e));
        }
        stop(e, t) {
          let n = () => {
            this.cleanup(), t();
          };
          e &&
          this.mirrorEl &&
          this.isVisible &&
          this.revertDuration &&
          (this.deltaX || this.deltaY)
            ? this.doRevertAnimation(n, this.revertDuration)
            : setTimeout(n, 0);
        }
        doRevertAnimation(e, t) {
          let n = this.mirrorEl,
            r = this.sourceEl.getBoundingClientRect();
          (n.style.transition = "top " + t + "ms,left " + t + "ms"),
            wt(n, { left: r.left, top: r.top }),
            (function (e, t) {
              let n = (r) => {
                t(),
                  Tt.forEach((t) => {
                    e.removeEventListener(t, n);
                  });
              };
              Tt.forEach((t) => {
                e.addEventListener(t, n);
              });
            })(n, () => {
              (n.style.transition = ""), e();
            });
        }
        cleanup() {
          this.mirrorEl && (yt(this.mirrorEl), (this.mirrorEl = null)),
            (this.sourceEl = null);
        }
        updateElPosition() {
          this.sourceEl &&
            this.isVisible &&
            wt(this.getMirrorEl(), {
              left: this.sourceElRect.left + this.deltaX,
              top: this.sourceElRect.top + this.deltaY,
            });
        }
        getMirrorEl() {
          let e = this.sourceElRect,
            t = this.mirrorEl;
          return (
            t ||
              ((t = this.mirrorEl = this.sourceEl.cloneNode(!0)),
              (t.style.userSelect = "none"),
              (t.style.webkitUserSelect = "none"),
              (t.style.pointerEvents = "none"),
              t.classList.add("fc-event-dragging"),
              wt(t, {
                position: "fixed",
                zIndex: this.zIndex,
                visibility: "",
                boxSizing: "border-box",
                width: e.right - e.left,
                height: e.bottom - e.top,
                right: "auto",
                bottom: "auto",
                margin: 0,
              }),
              this.parentNode.appendChild(t)),
            t
          );
        }
      }
      class Wa extends eo {
        constructor(e, t) {
          super(),
            (this.handleScroll = () => {
              (this.scrollTop = this.scrollController.getScrollTop()),
                (this.scrollLeft = this.scrollController.getScrollLeft()),
                this.handleScrollChange();
            }),
            (this.scrollController = e),
            (this.doesListening = t),
            (this.scrollTop = this.origScrollTop = e.getScrollTop()),
            (this.scrollLeft = this.origScrollLeft = e.getScrollLeft()),
            (this.scrollWidth = e.getScrollWidth()),
            (this.scrollHeight = e.getScrollHeight()),
            (this.clientWidth = e.getClientWidth()),
            (this.clientHeight = e.getClientHeight()),
            (this.clientRect = this.computeClientRect()),
            this.doesListening &&
              this.getEventTarget().addEventListener(
                "scroll",
                this.handleScroll,
              );
        }
        destroy() {
          this.doesListening &&
            this.getEventTarget().removeEventListener(
              "scroll",
              this.handleScroll,
            );
        }
        getScrollTop() {
          return this.scrollTop;
        }
        getScrollLeft() {
          return this.scrollLeft;
        }
        setScrollTop(e) {
          this.scrollController.setScrollTop(e),
            this.doesListening ||
              ((this.scrollTop = Math.max(
                Math.min(e, this.getMaxScrollTop()),
                0,
              )),
              this.handleScrollChange());
        }
        setScrollLeft(e) {
          this.scrollController.setScrollLeft(e),
            this.doesListening ||
              ((this.scrollLeft = Math.max(
                Math.min(e, this.getMaxScrollLeft()),
                0,
              )),
              this.handleScrollChange());
        }
        getClientWidth() {
          return this.clientWidth;
        }
        getClientHeight() {
          return this.clientHeight;
        }
        getScrollWidth() {
          return this.scrollWidth;
        }
        getScrollHeight() {
          return this.scrollHeight;
        }
        handleScrollChange() {}
      }
      class Ya extends Wa {
        constructor(e, t) {
          super(new to(e), t);
        }
        getEventTarget() {
          return this.scrollController.el;
        }
        computeClientRect() {
          return qi(this.scrollController.el);
        }
      }
      class Fa extends Wa {
        constructor(e) {
          super(new no(), e);
        }
        getEventTarget() {
          return window;
        }
        computeClientRect() {
          return {
            left: this.scrollLeft,
            right: this.scrollLeft + this.clientWidth,
            top: this.scrollTop,
            bottom: this.scrollTop + this.clientHeight,
          };
        }
        handleScrollChange() {
          this.clientRect = this.computeClientRect();
        }
      }
      const Va = "function" == typeof performance ? performance.now : Date.now;
      class Ga {
        constructor() {
          (this.isEnabled = !0),
            (this.scrollQuery = [window, ".fc-scroller"]),
            (this.edgeThreshold = 50),
            (this.maxVelocity = 300),
            (this.pointerScreenX = null),
            (this.pointerScreenY = null),
            (this.isAnimating = !1),
            (this.scrollCaches = null),
            (this.everMovedUp = !1),
            (this.everMovedDown = !1),
            (this.everMovedLeft = !1),
            (this.everMovedRight = !1),
            (this.animate = () => {
              if (this.isAnimating) {
                let e = this.computeBestEdge(
                  this.pointerScreenX + window.scrollX,
                  this.pointerScreenY + window.scrollY,
                );
                if (e) {
                  let t = Va();
                  this.handleSide(e, (t - this.msSinceRequest) / 1e3),
                    this.requestAnimation(t);
                } else this.isAnimating = !1;
              }
            });
        }
        start(e, t, n) {
          this.isEnabled &&
            ((this.scrollCaches = this.buildCaches(n)),
            (this.pointerScreenX = null),
            (this.pointerScreenY = null),
            (this.everMovedUp = !1),
            (this.everMovedDown = !1),
            (this.everMovedLeft = !1),
            (this.everMovedRight = !1),
            this.handleMove(e, t));
        }
        handleMove(e, t) {
          if (this.isEnabled) {
            let n = e - window.scrollX,
              r = t - window.scrollY,
              i = null === this.pointerScreenY ? 0 : r - this.pointerScreenY,
              o = null === this.pointerScreenX ? 0 : n - this.pointerScreenX;
            i < 0
              ? (this.everMovedUp = !0)
              : i > 0 && (this.everMovedDown = !0),
              o < 0
                ? (this.everMovedLeft = !0)
                : o > 0 && (this.everMovedRight = !0),
              (this.pointerScreenX = n),
              (this.pointerScreenY = r),
              this.isAnimating ||
                ((this.isAnimating = !0), this.requestAnimation(Va()));
          }
        }
        stop() {
          if (this.isEnabled) {
            this.isAnimating = !1;
            for (let e of this.scrollCaches) e.destroy();
            this.scrollCaches = null;
          }
        }
        requestAnimation(e) {
          (this.msSinceRequest = e), requestAnimationFrame(this.animate);
        }
        handleSide(e, t) {
          let { scrollCache: n } = e,
            { edgeThreshold: r } = this,
            i = r - e.distance,
            o = ((i * i) / (r * r)) * this.maxVelocity * t,
            s = 1;
          switch (e.name) {
            case "left":
              s = -1;
            case "right":
              n.setScrollLeft(n.getScrollLeft() + o * s);
              break;
            case "top":
              s = -1;
            case "bottom":
              n.setScrollTop(n.getScrollTop() + o * s);
          }
        }
        computeBestEdge(e, t) {
          let { edgeThreshold: n } = this,
            r = null,
            i = this.scrollCaches || [];
          for (let o of i) {
            let i = o.clientRect,
              s = e - i.left,
              a = i.right - e,
              l = t - i.top,
              c = i.bottom - t;
            s >= 0 &&
              a >= 0 &&
              l >= 0 &&
              c >= 0 &&
              (l <= n &&
                this.everMovedUp &&
                o.canScrollUp() &&
                (!r || r.distance > l) &&
                (r = { scrollCache: o, name: "top", distance: l }),
              c <= n &&
                this.everMovedDown &&
                o.canScrollDown() &&
                (!r || r.distance > c) &&
                (r = { scrollCache: o, name: "bottom", distance: c }),
              s <= n &&
                this.everMovedLeft &&
                o.canScrollLeft() &&
                (!r || r.distance > s) &&
                (r = { scrollCache: o, name: "left", distance: s }),
              a <= n &&
                this.everMovedRight &&
                o.canScrollRight() &&
                (!r || r.distance > a) &&
                (r = { scrollCache: o, name: "right", distance: a }));
          }
          return r;
        }
        buildCaches(e) {
          return this.queryScrollEls(e).map((e) =>
            e === window ? new Fa(!1) : new Ya(e, !1),
          );
        }
        queryScrollEls(e) {
          let t = [];
          for (let n of this.scrollQuery)
            "object" == typeof n
              ? t.push(n)
              : t.push(
                  ...Array.prototype.slice.call(
                    e.getRootNode().querySelectorAll(n),
                  ),
                );
          return t;
        }
      }
      class Qa extends uo {
        constructor(e, t) {
          super(e),
            (this.containerEl = e),
            (this.delay = null),
            (this.minDistance = 0),
            (this.touchScrollAllowed = !0),
            (this.mirrorNeedsRevert = !1),
            (this.isInteracting = !1),
            (this.isDragging = !1),
            (this.isDelayEnded = !1),
            (this.isDistanceSurpassed = !1),
            (this.delayTimeoutId = null),
            (this.onPointerDown = (e) => {
              var t;
              this.isDragging ||
                ((this.isInteracting = !0),
                (this.isDelayEnded = !1),
                (this.isDistanceSurpassed = !1),
                ((t = document.body).style.userSelect = "none"),
                (t.style.webkitUserSelect = "none"),
                t.addEventListener("selectstart", xt),
                document.body.addEventListener("contextmenu", xt),
                e.isTouch || e.origEvent.preventDefault(),
                this.emitter.trigger("pointerdown", e),
                this.isInteracting &&
                  !this.pointer.shouldIgnoreMove &&
                  (this.mirror.setIsVisible(!1),
                  this.mirror.start(e.subjectEl, e.pageX, e.pageY),
                  this.startDelay(e),
                  this.minDistance || this.handleDistanceSurpassed(e)));
            }),
            (this.onPointerMove = (e) => {
              if (this.isInteracting) {
                if (
                  (this.emitter.trigger("pointermove", e),
                  !this.isDistanceSurpassed)
                ) {
                  let t,
                    n = this.minDistance,
                    { deltaX: r, deltaY: i } = e;
                  (t = r * r + i * i),
                    t >= n * n && this.handleDistanceSurpassed(e);
                }
                this.isDragging &&
                  ("scroll" !== e.origEvent.type &&
                    (this.mirror.handleMove(e.pageX, e.pageY),
                    this.autoScroller.handleMove(e.pageX, e.pageY)),
                  this.emitter.trigger("dragmove", e));
              }
            }),
            (this.onPointerUp = (e) => {
              var t;
              this.isInteracting &&
                ((this.isInteracting = !1),
                ((t = document.body).style.userSelect = ""),
                (t.style.webkitUserSelect = ""),
                t.removeEventListener("selectstart", xt),
                document.body.removeEventListener("contextmenu", xt),
                this.emitter.trigger("pointerup", e),
                this.isDragging &&
                  (this.autoScroller.stop(), this.tryStopDrag(e)),
                this.delayTimeoutId &&
                  (clearTimeout(this.delayTimeoutId),
                  (this.delayTimeoutId = null)));
            });
          let n = (this.pointer = new Ba(e));
          n.emitter.on("pointerdown", this.onPointerDown),
            n.emitter.on("pointermove", this.onPointerMove),
            n.emitter.on("pointerup", this.onPointerUp),
            t && (n.selector = t),
            (this.mirror = new za()),
            (this.autoScroller = new Ga());
        }
        destroy() {
          this.pointer.destroy(), this.onPointerUp({});
        }
        startDelay(e) {
          "number" == typeof this.delay
            ? (this.delayTimeoutId = setTimeout(() => {
                (this.delayTimeoutId = null), this.handleDelayEnd(e);
              }, this.delay))
            : this.handleDelayEnd(e);
        }
        handleDelayEnd(e) {
          (this.isDelayEnded = !0), this.tryStartDrag(e);
        }
        handleDistanceSurpassed(e) {
          (this.isDistanceSurpassed = !0), this.tryStartDrag(e);
        }
        tryStartDrag(e) {
          this.isDelayEnded &&
            this.isDistanceSurpassed &&
            ((this.pointer.wasTouchScroll && !this.touchScrollAllowed) ||
              ((this.isDragging = !0),
              (this.mirrorNeedsRevert = !1),
              this.autoScroller.start(e.pageX, e.pageY, this.containerEl),
              this.emitter.trigger("dragstart", e),
              !1 === this.touchScrollAllowed &&
                this.pointer.cancelTouchScroll()));
        }
        tryStopDrag(e) {
          this.mirror.stop(this.mirrorNeedsRevert, this.stopDrag.bind(this, e));
        }
        stopDrag(e) {
          (this.isDragging = !1), this.emitter.trigger("dragend", e);
        }
        setIgnoreMove(e) {
          this.pointer.shouldIgnoreMove = e;
        }
        setMirrorIsVisible(e) {
          this.mirror.setIsVisible(e);
        }
        setMirrorNeedsRevert(e) {
          this.mirrorNeedsRevert = e;
        }
        setAutoScrollEnabled(e) {
          this.autoScroller.isEnabled = e;
        }
      }
      class $a {
        constructor(e) {
          (this.el = e),
            (this.origRect = Zi(e)),
            (this.scrollCaches = Xi(e).map((e) => new Ya(e, !0)));
        }
        destroy() {
          for (let e of this.scrollCaches) e.destroy();
        }
        computeLeft() {
          let e = this.origRect.left;
          for (let t of this.scrollCaches)
            e += t.origScrollLeft - t.getScrollLeft();
          return e;
        }
        computeTop() {
          let e = this.origRect.top;
          for (let t of this.scrollCaches)
            e += t.origScrollTop - t.getScrollTop();
          return e;
        }
        isWithinClipping(e, t) {
          let n = { left: e, top: t };
          for (let e of this.scrollCaches)
            if (!qa(e.getEventTarget()) && !Bi(n, e.clientRect)) return !1;
          return !0;
        }
      }
      function qa(e) {
        let t = e.tagName;
        return "HTML" === t || "BODY" === t;
      }
      class Za {
        constructor(e, t) {
          (this.useSubjectCenter = !1),
            (this.requireInitial = !0),
            (this.disablePointCheck = !1),
            (this.initialHit = null),
            (this.movingHit = null),
            (this.finalHit = null),
            (this.handlePointerDown = (e) => {
              let { dragging: t } = this;
              (this.initialHit = null),
                (this.movingHit = null),
                (this.finalHit = null),
                this.prepareHits(),
                this.processFirstCoord(e),
                this.initialHit || !this.requireInitial
                  ? (t.setIgnoreMove(!1),
                    this.emitter.trigger("pointerdown", e))
                  : t.setIgnoreMove(!0);
            }),
            (this.handleDragStart = (e) => {
              this.emitter.trigger("dragstart", e), this.handleMove(e, !0);
            }),
            (this.handleDragMove = (e) => {
              this.emitter.trigger("dragmove", e), this.handleMove(e);
            }),
            (this.handlePointerUp = (e) => {
              this.releaseHits(), this.emitter.trigger("pointerup", e);
            }),
            (this.handleDragEnd = (e) => {
              this.movingHit && this.emitter.trigger("hitupdate", null, !0, e),
                (this.finalHit = this.movingHit),
                (this.movingHit = null),
                this.emitter.trigger("dragend", e);
            }),
            (this.droppableStore = t),
            e.emitter.on("pointerdown", this.handlePointerDown),
            e.emitter.on("dragstart", this.handleDragStart),
            e.emitter.on("dragmove", this.handleDragMove),
            e.emitter.on("pointerup", this.handlePointerUp),
            e.emitter.on("dragend", this.handleDragEnd),
            (this.dragging = e),
            (this.emitter = new ri());
        }
        processFirstCoord(e) {
          let t,
            n = { left: e.pageX, top: e.pageY },
            r = n,
            i = e.subjectEl;
          var o, s;
          i instanceof HTMLElement &&
            ((t = Zi(i)),
            (o = r),
            (s = t),
            (r = {
              left: Math.min(Math.max(o.left, s.left), s.right),
              top: Math.min(Math.max(o.top, s.top), s.bottom),
            }));
          let a = (this.initialHit = this.queryHitForOffset(r.left, r.top));
          if (a) {
            if (this.useSubjectCenter && t) {
              let e = Ui(t, a.rect);
              e &&
                (r = (function (e) {
                  return {
                    left: (e.left + e.right) / 2,
                    top: (e.top + e.bottom) / 2,
                  };
                })(e));
            }
            this.coordAdjust =
              ((c = n), { left: (l = r).left - c.left, top: l.top - c.top });
          } else this.coordAdjust = { left: 0, top: 0 };
          var l, c;
        }
        handleMove(e, t) {
          let n = this.queryHitForOffset(
            e.pageX + this.coordAdjust.left,
            e.pageY + this.coordAdjust.top,
          );
          (!t && Xa(this.movingHit, n)) ||
            ((this.movingHit = n), this.emitter.trigger("hitupdate", n, !1, e));
        }
        prepareHits() {
          this.offsetTrackers = Yn(
            this.droppableStore,
            (e) => (e.component.prepareHits(), new $a(e.el)),
          );
        }
        releaseHits() {
          let { offsetTrackers: e } = this;
          for (let t in e) e[t].destroy();
          this.offsetTrackers = {};
        }
        queryHitForOffset(e, t) {
          let { droppableStore: n, offsetTrackers: r } = this,
            i = null;
          for (let o in n) {
            let s = n[o].component,
              a = r[o];
            if (a && a.isWithinClipping(e, t)) {
              let n = a.computeLeft(),
                r = a.computeTop(),
                l = e - n,
                c = t - r,
                { origRect: u } = a,
                d = u.right - u.left,
                h = u.bottom - u.top;
              if (l >= 0 && l < d && c >= 0 && c < h) {
                let e = s.queryHit(l, c, d, h);
                e &&
                  Dr(e.dateProfile.activeRange, e.dateSpan.range) &&
                  (this.disablePointCheck ||
                    a.el.contains(
                      a.el
                        .getRootNode()
                        .elementFromPoint(
                          l + n - window.scrollX,
                          c + r - window.scrollY,
                        ),
                    )) &&
                  (!i || e.layer > i.layer) &&
                  ((e.componentId = o),
                  (e.context = s.context),
                  (e.rect.left += n),
                  (e.rect.right += n),
                  (e.rect.top += r),
                  (e.rect.bottom += r),
                  (i = e));
              }
            }
          }
          return i;
        }
      }
      function Xa(e, t) {
        return (
          (!e && !t) ||
          (Boolean(e) === Boolean(t) &&
            ((n = e.dateSpan),
            (r = t.dateSpan),
            (i = n.range),
            (o = r.range),
            (null === i.start ? null : i.start.valueOf()) ===
              (null === o.start ? null : o.start.valueOf()) &&
              (null === i.end ? null : i.end.valueOf()) ===
                (null === o.end ? null : o.end.valueOf()) &&
              n.allDay === r.allDay &&
              (function (e, t) {
                for (let n in t)
                  if ("range" !== n && "allDay" !== n && e[n] !== t[n])
                    return !1;
                for (let n in e) if (!(n in t)) return !1;
                return !0;
              })(n, r)))
        );
        var n, r, i, o;
      }
      function Ja(e, t) {
        let n = {};
        for (let r of t.pluginHooks.datePointTransforms)
          Object.assign(n, r(e, t));
        var r, i;
        return (
          Object.assign(
            n,
            ((r = e),
            {
              date: (i = t.dateEnv).toDate(r.range.start),
              dateStr: i.formatIso(r.range.start, { omitTime: r.allDay }),
              allDay: r.allDay,
            }),
          ),
          n
        );
      }
      class Ka extends Pi {
        constructor(e) {
          super(e),
            (this.subjectEl = null),
            (this.subjectSeg = null),
            (this.isDragging = !1),
            (this.eventRange = null),
            (this.relevantEvents = null),
            (this.receivingContext = null),
            (this.validMutation = null),
            (this.mutatedRelevantEvents = null),
            (this.handlePointerDown = (e) => {
              let t = e.origEvent.target,
                { component: n, dragging: r } = this,
                { mirror: i } = r,
                { options: o } = n.context,
                s = n.context;
              this.subjectEl = e.subjectEl;
              let a = (this.subjectSeg = mi(e.subjectEl)),
                l = (this.eventRange = a.eventRange).instance.instanceId;
              (this.relevantEvents = Wr(s.getCurrentData().eventStore, l)),
                (r.minDistance = e.isTouch ? 0 : o.eventDragMinDistance),
                (r.delay =
                  e.isTouch && l !== n.props.eventSelection
                    ? (function (e) {
                        let { options: t } = e.context,
                          n = t.eventLongPressDelay;
                        return null == n && (n = t.longPressDelay), n;
                      })(n)
                    : null),
                o.fixedMirrorParent
                  ? (i.parentNode = o.fixedMirrorParent)
                  : (i.parentNode = bt(t, ".fc")),
                (i.revertDuration = o.dragRevertDuration);
              let c = n.isValidSegDownEl(t) && !bt(t, ".fc-event-resizer");
              r.setIgnoreMove(!c),
                (this.isDragging =
                  c && e.subjectEl.classList.contains("fc-event-draggable"));
            }),
            (this.handleDragStart = (e) => {
              let t = this.component.context,
                n = this.eventRange,
                r = n.instance.instanceId;
              e.isTouch
                ? r !== this.component.props.eventSelection &&
                  t.dispatch({ type: "SELECT_EVENT", eventInstanceId: r })
                : t.dispatch({ type: "UNSELECT_EVENT" }),
                this.isDragging &&
                  (t.calendarApi.unselect(e),
                  t.emitter.trigger("eventDragStart", {
                    el: this.subjectEl,
                    event: new hi(t, n.def, n.instance),
                    jsEvent: e.origEvent,
                    view: t.viewApi,
                  }));
            }),
            (this.handleHitUpdate = (e, t) => {
              if (!this.isDragging) return;
              let n = this.relevantEvents,
                r = this.hitDragging.initialHit,
                i = this.component.context,
                o = null,
                s = null,
                a = null,
                l = !1,
                c = {
                  affectedEvents: n,
                  mutatedEvents: { defs: {}, instances: {} },
                  isEvent: !0,
                };
              if (e) {
                o = e.context;
                let t = o.options;
                i === o || (t.editable && t.droppable)
                  ? ((s = (function (e, t, n, r) {
                      let i = e.dateSpan,
                        o = t.dateSpan,
                        s = i.range.start,
                        a = o.range.start,
                        l = {};
                      i.allDay !== o.allDay &&
                        ((l.allDay = o.allDay),
                        (l.hasEnd = t.context.options.allDayMaintainDuration),
                        (s = o.allDay ? tn(n) : n));
                      let c = xr(
                        s,
                        a,
                        e.context.dateEnv,
                        e.componentId === t.componentId ? e.largeUnit : null,
                      );
                      c.milliseconds && (l.allDay = !1);
                      let u = { datesDelta: c, standardProps: l };
                      for (let n of r) n(u, e, t);
                      return u;
                    })(
                      r,
                      e,
                      this.eventRange.instance.range.start,
                      o.getCurrentData().pluginHooks.eventDragMutationMassagers,
                    )),
                    s &&
                      ((a = li(n, o.getCurrentData().eventUiBases, s, o)),
                      (c.mutatedEvents = a),
                      Co(c, e.dateProfile, o) ||
                        ((l = !0),
                        (s = null),
                        (a = null),
                        (c.mutatedEvents = { defs: {}, instances: {} }))))
                  : (o = null);
              }
              this.displayDrag(o, c),
                l ? Nt() : Pt(),
                t ||
                  (i === o && Xa(r, e) && (s = null),
                  this.dragging.setMirrorNeedsRevert(!s),
                  this.dragging.setMirrorIsVisible(
                    !e ||
                      !this.subjectEl
                        .getRootNode()
                        .querySelector(".fc-event-mirror"),
                  ),
                  (this.receivingContext = o),
                  (this.validMutation = s),
                  (this.mutatedRelevantEvents = a));
            }),
            (this.handlePointerUp = () => {
              this.isDragging || this.cleanup();
            }),
            (this.handleDragEnd = (e) => {
              if (this.isDragging) {
                let t = this.component.context,
                  n = t.viewApi,
                  { receivingContext: r, validMutation: i } = this,
                  o = this.eventRange.def,
                  s = this.eventRange.instance,
                  a = new hi(t, o, s),
                  l = this.relevantEvents,
                  c = this.mutatedRelevantEvents,
                  { finalHit: u } = this.hitDragging;
                if (
                  (this.clearDrag(),
                  t.emitter.trigger("eventDragStop", {
                    el: this.subjectEl,
                    event: a,
                    jsEvent: e.origEvent,
                    view: n,
                  }),
                  i)
                ) {
                  if (r === t) {
                    let r = new hi(
                      t,
                      c.defs[o.defId],
                      s ? c.instances[s.instanceId] : null,
                    );
                    t.dispatch({ type: "MERGE_EVENTS", eventStore: c });
                    let u = {
                        oldEvent: a,
                        event: r,
                        relatedEvents: pi(c, t, s),
                        revert() {
                          t.dispatch({ type: "MERGE_EVENTS", eventStore: l });
                        },
                      },
                      d = {};
                    for (let e of t.getCurrentData().pluginHooks
                      .eventDropTransformers)
                      Object.assign(d, e(i, t));
                    t.emitter.trigger(
                      "eventDrop",
                      Object.assign(Object.assign(Object.assign({}, u), d), {
                        el: e.subjectEl,
                        delta: i.datesDelta,
                        jsEvent: e.origEvent,
                        view: n,
                      }),
                    ),
                      t.emitter.trigger("eventChange", u);
                  } else if (r) {
                    let i = {
                      event: a,
                      relatedEvents: pi(l, t, s),
                      revert() {
                        t.dispatch({ type: "MERGE_EVENTS", eventStore: l });
                      },
                    };
                    t.emitter.trigger(
                      "eventLeave",
                      Object.assign(Object.assign({}, i), {
                        draggedEl: e.subjectEl,
                        view: n,
                      }),
                    ),
                      t.dispatch({ type: "REMOVE_EVENTS", eventStore: l }),
                      t.emitter.trigger("eventRemove", i);
                    let d = c.defs[o.defId],
                      h = c.instances[s.instanceId],
                      f = new hi(r, d, h);
                    r.dispatch({ type: "MERGE_EVENTS", eventStore: c });
                    let p = {
                      event: f,
                      relatedEvents: pi(c, r, h),
                      revert() {
                        r.dispatch({ type: "REMOVE_EVENTS", eventStore: c });
                      },
                    };
                    r.emitter.trigger("eventAdd", p),
                      e.isTouch &&
                        r.dispatch({
                          type: "SELECT_EVENT",
                          eventInstanceId: s.instanceId,
                        }),
                      r.emitter.trigger(
                        "drop",
                        Object.assign(Object.assign({}, Ja(u.dateSpan, r)), {
                          draggedEl: e.subjectEl,
                          jsEvent: e.origEvent,
                          view: u.context.viewApi,
                        }),
                      ),
                      r.emitter.trigger(
                        "eventReceive",
                        Object.assign(Object.assign({}, p), {
                          draggedEl: e.subjectEl,
                          view: u.context.viewApi,
                        }),
                      );
                  }
                } else t.emitter.trigger("_noEventDrop");
              }
              this.cleanup();
            });
          let { component: t } = this,
            { options: n } = t.context,
            r = (this.dragging = new Qa(e.el));
          (r.pointer.selector = Ka.SELECTOR),
            (r.touchScrollAllowed = !1),
            (r.autoScroller.isEnabled = n.dragScroll);
          let i = (this.hitDragging = new Za(this.dragging, ji));
          (i.useSubjectCenter = e.useEventCenter),
            i.emitter.on("pointerdown", this.handlePointerDown),
            i.emitter.on("dragstart", this.handleDragStart),
            i.emitter.on("hitupdate", this.handleHitUpdate),
            i.emitter.on("pointerup", this.handlePointerUp),
            i.emitter.on("dragend", this.handleDragEnd);
        }
        destroy() {
          this.dragging.destroy();
        }
        displayDrag(e, t) {
          let n = this.component.context,
            r = this.receivingContext;
          r &&
            r !== e &&
            (r === n
              ? r.dispatch({
                  type: "SET_EVENT_DRAG",
                  state: {
                    affectedEvents: t.affectedEvents,
                    mutatedEvents: { defs: {}, instances: {} },
                    isEvent: !0,
                  },
                })
              : r.dispatch({ type: "UNSET_EVENT_DRAG" })),
            e && e.dispatch({ type: "SET_EVENT_DRAG", state: t });
        }
        clearDrag() {
          let e = this.component.context,
            { receivingContext: t } = this;
          t && t.dispatch({ type: "UNSET_EVENT_DRAG" }),
            e !== t && e.dispatch({ type: "UNSET_EVENT_DRAG" });
        }
        cleanup() {
          (this.subjectSeg = null),
            (this.isDragging = !1),
            (this.eventRange = null),
            (this.relevantEvents = null),
            (this.receivingContext = null),
            (this.validMutation = null),
            (this.mutatedRelevantEvents = null);
        }
      }
      Ka.SELECTOR = ".fc-event-draggable, .fc-event-resizable";
      const el = { fixedMirrorParent: Bn },
        tl = {
          dateClick: Bn,
          eventDragStart: Bn,
          eventDragStop: Bn,
          eventDrop: Bn,
          eventResizeStart: Bn,
          eventResizeStop: Bn,
          eventResize: Bn,
          drop: Bn,
          eventReceive: Bn,
          eventLeave: Bn,
        };
      ho.dataAttrPrefix = "";
      var nl,
        rl = vs({
          name: "@fullcalendar/interaction",
          componentInteractions: [
            class extends Pi {
              constructor(e) {
                super(e),
                  (this.handlePointerDown = (e) => {
                    let { dragging: t } = this,
                      n = e.origEvent.target;
                    t.setIgnoreMove(!this.component.isValidDateDownEl(n));
                  }),
                  (this.handleDragEnd = (e) => {
                    let { component: t } = this,
                      { pointer: n } = this.dragging;
                    if (!n.wasTouchScroll) {
                      let { initialHit: n, finalHit: r } = this.hitDragging;
                      if (n && r && Xa(n, r)) {
                        let { context: r } = t,
                          i = Object.assign(
                            Object.assign({}, Ja(n.dateSpan, r)),
                            {
                              dayEl: n.dayEl,
                              jsEvent: e.origEvent,
                              view: r.viewApi || r.calendarApi.view,
                            },
                          );
                        r.emitter.trigger("dateClick", i);
                      }
                    }
                  }),
                  (this.dragging = new Qa(e.el)),
                  (this.dragging.autoScroller.isEnabled = !1);
                let t = (this.hitDragging = new Za(this.dragging, Hi(e)));
                t.emitter.on("pointerdown", this.handlePointerDown),
                  t.emitter.on("dragend", this.handleDragEnd);
              }
              destroy() {
                this.dragging.destroy();
              }
            },
            class extends Pi {
              constructor(e) {
                super(e),
                  (this.dragSelection = null),
                  (this.handlePointerDown = (e) => {
                    let { component: t, dragging: n } = this,
                      { options: r } = t.context,
                      i =
                        r.selectable && t.isValidDateDownEl(e.origEvent.target);
                    n.setIgnoreMove(!i),
                      (n.delay = e.isTouch
                        ? (function (e) {
                            let { options: t } = e.context,
                              n = t.selectLongPressDelay;
                            return null == n && (n = t.longPressDelay), n;
                          })(t)
                        : null);
                  }),
                  (this.handleDragStart = (e) => {
                    this.component.context.calendarApi.unselect(e);
                  }),
                  (this.handleHitUpdate = (e, t) => {
                    let { context: n } = this.component,
                      r = null,
                      i = !1;
                    if (e) {
                      let t = this.hitDragging.initialHit;
                      (e.componentId === t.componentId &&
                        this.isHitComboAllowed &&
                        !this.isHitComboAllowed(t, e)) ||
                        (r = (function (e, t, n) {
                          let r = e.dateSpan,
                            i = t.dateSpan,
                            o = [
                              r.range.start,
                              r.range.end,
                              i.range.start,
                              i.range.end,
                            ];
                          o.sort(Bt);
                          let s = {};
                          for (let r of n) {
                            let n = r(e, t);
                            if (!1 === n) return null;
                            n && Object.assign(s, n);
                          }
                          return (
                            (s.range = { start: o[0], end: o[3] }),
                            (s.allDay = r.allDay),
                            s
                          );
                        })(t, e, n.pluginHooks.dateSelectionTransformers)),
                        (r &&
                          (function (e, t, n) {
                            return (
                              !!Dr(t.validRange, e.range) &&
                              xo({ dateSelection: e }, n)
                            );
                          })(r, e.dateProfile, n)) ||
                          ((i = !0), (r = null));
                    }
                    r
                      ? n.dispatch({ type: "SELECT_DATES", selection: r })
                      : t || n.dispatch({ type: "UNSELECT_DATES" }),
                      i ? Nt() : Pt(),
                      t || (this.dragSelection = r);
                  }),
                  (this.handlePointerUp = (e) => {
                    this.dragSelection &&
                      (oi(this.dragSelection, e, this.component.context),
                      (this.dragSelection = null));
                  });
                let { component: t } = e,
                  { options: n } = t.context,
                  r = (this.dragging = new Qa(e.el));
                (r.touchScrollAllowed = !1),
                  (r.minDistance = n.selectMinDistance || 0),
                  (r.autoScroller.isEnabled = n.dragScroll);
                let i = (this.hitDragging = new Za(this.dragging, Hi(e)));
                i.emitter.on("pointerdown", this.handlePointerDown),
                  i.emitter.on("dragstart", this.handleDragStart),
                  i.emitter.on("hitupdate", this.handleHitUpdate),
                  i.emitter.on("pointerup", this.handlePointerUp);
              }
              destroy() {
                this.dragging.destroy();
              }
            },
            Ka,
            class extends Pi {
              constructor(e) {
                super(e),
                  (this.draggingSegEl = null),
                  (this.draggingSeg = null),
                  (this.eventRange = null),
                  (this.relevantEvents = null),
                  (this.validMutation = null),
                  (this.mutatedRelevantEvents = null),
                  (this.handlePointerDown = (e) => {
                    let { component: t } = this,
                      n = mi(this.querySegEl(e)),
                      r = (this.eventRange = n.eventRange);
                    (this.dragging.minDistance =
                      t.context.options.eventDragMinDistance),
                      this.dragging.setIgnoreMove(
                        !this.component.isValidSegDownEl(e.origEvent.target) ||
                          (e.isTouch &&
                            this.component.props.eventSelection !==
                              r.instance.instanceId),
                      );
                  }),
                  (this.handleDragStart = (e) => {
                    let { context: t } = this.component,
                      n = this.eventRange;
                    this.relevantEvents = Wr(
                      t.getCurrentData().eventStore,
                      this.eventRange.instance.instanceId,
                    );
                    let r = this.querySegEl(e);
                    (this.draggingSegEl = r),
                      (this.draggingSeg = mi(r)),
                      t.calendarApi.unselect(),
                      t.emitter.trigger("eventResizeStart", {
                        el: r,
                        event: new hi(t, n.def, n.instance),
                        jsEvent: e.origEvent,
                        view: t.viewApi,
                      });
                  }),
                  (this.handleHitUpdate = (e, t, n) => {
                    let { context: r } = this.component,
                      i = this.relevantEvents,
                      o = this.hitDragging.initialHit,
                      s = this.eventRange.instance,
                      a = null,
                      l = null,
                      c = !1,
                      u = {
                        affectedEvents: i,
                        mutatedEvents: { defs: {}, instances: {} },
                        isEvent: !0,
                      };
                    e &&
                      ((e.componentId === o.componentId &&
                        this.isHitComboAllowed &&
                        !this.isHitComboAllowed(o, e)) ||
                        (a = (function (e, t, n, r) {
                          let i = e.context.dateEnv,
                            o = xr(
                              e.dateSpan.range.start,
                              t.dateSpan.range.start,
                              i,
                              e.largeUnit,
                            );
                          if (n) {
                            if (i.add(r.start, o) < r.end)
                              return { startDelta: o };
                          } else if (i.add(r.end, o) > r.start)
                            return { endDelta: o };
                          return null;
                        })(
                          o,
                          e,
                          n.subjectEl.classList.contains(
                            "fc-event-resizer-start",
                          ),
                          s.range,
                        ))),
                      a &&
                        ((l = li(i, r.getCurrentData().eventUiBases, a, r)),
                        (u.mutatedEvents = l),
                        Co(u, e.dateProfile, r) ||
                          ((c = !0),
                          (a = null),
                          (l = null),
                          (u.mutatedEvents = null))),
                      l
                        ? r.dispatch({ type: "SET_EVENT_RESIZE", state: u })
                        : r.dispatch({ type: "UNSET_EVENT_RESIZE" }),
                      c ? Nt() : Pt(),
                      t ||
                        (a && Xa(o, e) && (a = null),
                        (this.validMutation = a),
                        (this.mutatedRelevantEvents = l));
                  }),
                  (this.handleDragEnd = (e) => {
                    let { context: t } = this.component,
                      n = this.eventRange.def,
                      r = this.eventRange.instance,
                      i = new hi(t, n, r),
                      o = this.relevantEvents,
                      s = this.mutatedRelevantEvents;
                    if (
                      (t.emitter.trigger("eventResizeStop", {
                        el: this.draggingSegEl,
                        event: i,
                        jsEvent: e.origEvent,
                        view: t.viewApi,
                      }),
                      this.validMutation)
                    ) {
                      let a = new hi(
                        t,
                        s.defs[n.defId],
                        r ? s.instances[r.instanceId] : null,
                      );
                      t.dispatch({ type: "MERGE_EVENTS", eventStore: s });
                      let l = {
                        oldEvent: i,
                        event: a,
                        relatedEvents: pi(s, t, r),
                        revert() {
                          t.dispatch({ type: "MERGE_EVENTS", eventStore: o });
                        },
                      };
                      t.emitter.trigger(
                        "eventResize",
                        Object.assign(Object.assign({}, l), {
                          el: this.draggingSegEl,
                          startDelta: this.validMutation.startDelta || Yt(0),
                          endDelta: this.validMutation.endDelta || Yt(0),
                          jsEvent: e.origEvent,
                          view: t.viewApi,
                        }),
                      ),
                        t.emitter.trigger("eventChange", l);
                    } else t.emitter.trigger("_noEventResize");
                    (this.draggingSeg = null),
                      (this.relevantEvents = null),
                      (this.validMutation = null);
                  });
                let { component: t } = e,
                  n = (this.dragging = new Qa(e.el));
                (n.pointer.selector = ".fc-event-resizer"),
                  (n.touchScrollAllowed = !1),
                  (n.autoScroller.isEnabled = t.context.options.dragScroll);
                let r = (this.hitDragging = new Za(this.dragging, Hi(e)));
                r.emitter.on("pointerdown", this.handlePointerDown),
                  r.emitter.on("dragstart", this.handleDragStart),
                  r.emitter.on("hitupdate", this.handleHitUpdate),
                  r.emitter.on("dragend", this.handleDragEnd);
              }
              destroy() {
                this.dragging.destroy();
              }
              querySegEl(e) {
                return bt(e.subjectEl, ".fc-event");
              }
            },
          ],
          calendarInteractions: [
            class {
              constructor(e) {
                (this.context = e),
                  (this.isRecentPointerDateSelect = !1),
                  (this.matchesCancel = !1),
                  (this.matchesEvent = !1),
                  (this.onSelect = (e) => {
                    e.jsEvent && (this.isRecentPointerDateSelect = !0);
                  }),
                  (this.onDocumentPointerDown = (e) => {
                    let t = this.context.options.unselectCancel,
                      n = St(e.origEvent);
                    (this.matchesCancel = !!bt(n, t)),
                      (this.matchesEvent = !!bt(n, Ka.SELECTOR));
                  }),
                  (this.onDocumentPointerUp = (e) => {
                    let { context: t } = this,
                      { documentPointer: n } = this,
                      r = t.getCurrentData();
                    if (!n.wasTouchScroll) {
                      if (r.dateSelection && !this.isRecentPointerDateSelect) {
                        let n = t.options.unselectAuto;
                        !n ||
                          (n && this.matchesCancel) ||
                          t.calendarApi.unselect(e);
                      }
                      r.eventSelection &&
                        !this.matchesEvent &&
                        t.dispatch({ type: "UNSELECT_EVENT" });
                    }
                    this.isRecentPointerDateSelect = !1;
                  });
                let t = (this.documentPointer = new Ba(document));
                (t.shouldIgnoreMove = !0),
                  (t.shouldWatchScroll = !1),
                  t.emitter.on("pointerdown", this.onDocumentPointerDown),
                  t.emitter.on("pointerup", this.onDocumentPointerUp),
                  e.emitter.on("select", this.onSelect);
              }
              destroy() {
                this.context.emitter.off("select", this.onSelect),
                  this.documentPointer.destroy();
              }
            },
          ],
          elementDraggingImpl: Qa,
          optionRefiners: el,
          listenerRefiners: tl,
        });
      function il(e, t) {
        return (
          (function (e) {
            if (Array.isArray(e)) return e;
          })(e) ||
          (function (e, t) {
            var n =
              null == e
                ? null
                : ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
                  e["@@iterator"];
            if (null != n) {
              var r,
                i,
                o,
                s,
                a = [],
                l = !0,
                c = !1;
              try {
                if (((o = (n = n.call(e)).next), 0 === t)) {
                  if (Object(n) !== n) return;
                  l = !1;
                } else
                  for (
                    ;
                    !(l = (r = o.call(n)).done) &&
                    (a.push(r.value), a.length !== t);
                    l = !0
                  );
              } catch (e) {
                (c = !0), (i = e);
              } finally {
                try {
                  if (
                    !l &&
                    null != n.return &&
                    ((s = n.return()), Object(s) !== s)
                  )
                    return;
                } finally {
                  if (c) throw i;
                }
              }
              return a;
            }
          })(e, t) ||
          (function (e, t) {
            if (e) {
              if ("string" == typeof e) return ol(e, t);
              var n = {}.toString.call(e).slice(8, -1);
              return (
                "Object" === n && e.constructor && (n = e.constructor.name),
                "Map" === n || "Set" === n
                  ? Array.from(e)
                  : "Arguments" === n ||
                      /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                    ? ol(e, t)
                    : void 0
              );
            }
          })(e, t) ||
          (function () {
            throw new TypeError(
              "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
            );
          })()
        );
      }
      function ol(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
        return r;
      }
      var sl,
        al,
        ll = { holiday: [], saturday: [], weekday: [], rotationCycleLength: 0 };
      function cl(e) {
        ll = e;
      }
      function ul(e, t, n, r) {
        var i = e.format("YYYY-MM-DD"),
          o = (function (e) {
            var t = e.format("YYYY-MM-DD");
            return void 0 !== N[t] || 0 === e.day();
          })(e),
          s = 6 === e.day(),
          a = n.format("YYYY-MM-DD"),
          l = r.format("YYYY-MM-DD");
        if ((n.unix() !== r.unix() && i >= l) || i < a)
          return {
            dateStr: i,
            subject: "-",
            startTime: "",
            endTime: "",
            isHoliday: o,
            isSaturday: s,
          };
        var c,
          u =
            (((t - 1 + e.diff(n, "day")) % ll.rotationCycleLength) +
              ll.rotationCycleLength) %
            ll.rotationCycleLength;
        if (!(c = o ? ll.holiday[u] : s ? ll.saturday[u] : ll.weekday[u]))
          return null;
        var d = il(c.split(","), 3);
        return {
          dateStr: i,
          subject: d[0],
          startTime: d[1],
          endTime: d[2],
          isHoliday: o,
          isSaturday: s,
        };
      }
      function dl(e, t) {
        var n = document.getElementById("baseDate");
        (n.innerHTML = ""),
          e.forEach(function (e) {
            var t = document.createElement("option"),
              r = e.format("YYYY-MM-DD");
            (t.value = r), (t.text = r), n.appendChild(t);
          });
        var r = t.format("YYYY-MM-DD");
        n.value = r;
      }
      function hl(e) {
        e &&
          (document
            .getElementById("baseDateSection")
            .classList.remove("hidden"),
          document
            .getElementById("startNumberSection")
            .classList.remove("hidden"),
          document.getElementById("exportSection").classList.remove("hidden"));
      }
      function fl(e) {
        var t = document.getElementById("startNumber");
        t.innerHTML = "";
        for (var n = 1; n <= e; n++) {
          var r = document.createElement("option");
          (r.value = n), (r.text = n), t.appendChild(r);
        }
        var i = new URLSearchParams(window.location.search);
        i.has("startNumber") && (t.value = i.get("startNumber"));
      }
      function pl(e) {
        return (
          (pl =
            "function" == typeof Symbol && "symbol" == typeof Symbol.iterator
              ? function (e) {
                  return typeof e;
                }
              : function (e) {
                  return e &&
                    "function" == typeof Symbol &&
                    e.constructor === Symbol &&
                    e !== Symbol.prototype
                    ? "symbol"
                    : typeof e;
                }),
          pl(e)
        );
      }
      function gl() {
        gl = function () {
          return t;
        };
        var e,
          t = {},
          n = Object.prototype,
          r = n.hasOwnProperty,
          i =
            Object.defineProperty ||
            function (e, t, n) {
              e[t] = n.value;
            },
          o = "function" == typeof Symbol ? Symbol : {},
          s = o.iterator || "@@iterator",
          a = o.asyncIterator || "@@asyncIterator",
          l = o.toStringTag || "@@toStringTag";
        function c(e, t, n) {
          return (
            Object.defineProperty(e, t, {
              value: n,
              enumerable: !0,
              configurable: !0,
              writable: !0,
            }),
            e[t]
          );
        }
        try {
          c({}, "");
        } catch (e) {
          c = function (e, t, n) {
            return (e[t] = n);
          };
        }
        function u(e, t, n, r) {
          var o = t && t.prototype instanceof m ? t : m,
            s = Object.create(o.prototype),
            a = new k(r || []);
          return i(s, "_invoke", { value: C(e, n, a) }), s;
        }
        function d(e, t, n) {
          try {
            return { type: "normal", arg: e.call(t, n) };
          } catch (e) {
            return { type: "throw", arg: e };
          }
        }
        t.wrap = u;
        var h = "suspendedStart",
          f = "suspendedYield",
          p = "executing",
          g = "completed",
          v = {};
        function m() {}
        function y() {}
        function b() {}
        var E = {};
        c(E, s, function () {
          return this;
        });
        var A = Object.getPrototypeOf,
          w = A && A(A(M([])));
        w && w !== n && r.call(w, s) && (E = w);
        var D = (b.prototype = m.prototype = Object.create(E));
        function S(e) {
          ["next", "throw", "return"].forEach(function (t) {
            c(e, t, function (e) {
              return this._invoke(t, e);
            });
          });
        }
        function _(e, t) {
          function n(i, o, s, a) {
            var l = d(e[i], e, o);
            if ("throw" !== l.type) {
              var c = l.arg,
                u = c.value;
              return u && "object" == pl(u) && r.call(u, "__await")
                ? t.resolve(u.__await).then(
                    function (e) {
                      n("next", e, s, a);
                    },
                    function (e) {
                      n("throw", e, s, a);
                    },
                  )
                : t.resolve(u).then(
                    function (e) {
                      (c.value = e), s(c);
                    },
                    function (e) {
                      return n("throw", e, s, a);
                    },
                  );
            }
            a(l.arg);
          }
          var o;
          i(this, "_invoke", {
            value: function (e, r) {
              function i() {
                return new t(function (t, i) {
                  n(e, r, t, i);
                });
              }
              return (o = o ? o.then(i, i) : i());
            },
          });
        }
        function C(t, n, r) {
          var i = h;
          return function (o, s) {
            if (i === p) throw Error("Generator is already running");
            if (i === g) {
              if ("throw" === o) throw s;
              return { value: e, done: !0 };
            }
            for (r.method = o, r.arg = s; ; ) {
              var a = r.delegate;
              if (a) {
                var l = x(a, r);
                if (l) {
                  if (l === v) continue;
                  return l;
                }
              }
              if ("next" === r.method) r.sent = r._sent = r.arg;
              else if ("throw" === r.method) {
                if (i === h) throw ((i = g), r.arg);
                r.dispatchException(r.arg);
              } else "return" === r.method && r.abrupt("return", r.arg);
              i = p;
              var c = d(t, n, r);
              if ("normal" === c.type) {
                if (((i = r.done ? g : f), c.arg === v)) continue;
                return { value: c.arg, done: r.done };
              }
              "throw" === c.type &&
                ((i = g), (r.method = "throw"), (r.arg = c.arg));
            }
          };
        }
        function x(t, n) {
          var r = n.method,
            i = t.iterator[r];
          if (i === e)
            return (
              (n.delegate = null),
              ("throw" === r &&
                t.iterator.return &&
                ((n.method = "return"),
                (n.arg = e),
                x(t, n),
                "throw" === n.method)) ||
                ("return" !== r &&
                  ((n.method = "throw"),
                  (n.arg = new TypeError(
                    "The iterator does not provide a '" + r + "' method",
                  )))),
              v
            );
          var o = d(i, t.iterator, n.arg);
          if ("throw" === o.type)
            return (
              (n.method = "throw"), (n.arg = o.arg), (n.delegate = null), v
            );
          var s = o.arg;
          return s
            ? s.done
              ? ((n[t.resultName] = s.value),
                (n.next = t.nextLoc),
                "return" !== n.method && ((n.method = "next"), (n.arg = e)),
                (n.delegate = null),
                v)
              : s
            : ((n.method = "throw"),
              (n.arg = new TypeError("iterator result is not an object")),
              (n.delegate = null),
              v);
        }
        function R(e) {
          var t = { tryLoc: e[0] };
          1 in e && (t.catchLoc = e[1]),
            2 in e && ((t.finallyLoc = e[2]), (t.afterLoc = e[3])),
            this.tryEntries.push(t);
        }
        function T(e) {
          var t = e.completion || {};
          (t.type = "normal"), delete t.arg, (e.completion = t);
        }
        function k(e) {
          (this.tryEntries = [{ tryLoc: "root" }]),
            e.forEach(R, this),
            this.reset(!0);
        }
        function M(t) {
          if (t || "" === t) {
            var n = t[s];
            if (n) return n.call(t);
            if ("function" == typeof t.next) return t;
            if (!isNaN(t.length)) {
              var i = -1,
                o = function n() {
                  for (; ++i < t.length; )
                    if (r.call(t, i)) return (n.value = t[i]), (n.done = !1), n;
                  return (n.value = e), (n.done = !0), n;
                };
              return (o.next = o);
            }
          }
          throw new TypeError(pl(t) + " is not iterable");
        }
        return (
          (y.prototype = b),
          i(D, "constructor", { value: b, configurable: !0 }),
          i(b, "constructor", { value: y, configurable: !0 }),
          (y.displayName = c(b, l, "GeneratorFunction")),
          (t.isGeneratorFunction = function (e) {
            var t = "function" == typeof e && e.constructor;
            return (
              !!t &&
              (t === y || "GeneratorFunction" === (t.displayName || t.name))
            );
          }),
          (t.mark = function (e) {
            return (
              Object.setPrototypeOf
                ? Object.setPrototypeOf(e, b)
                : ((e.__proto__ = b), c(e, l, "GeneratorFunction")),
              (e.prototype = Object.create(D)),
              e
            );
          }),
          (t.awrap = function (e) {
            return { __await: e };
          }),
          S(_.prototype),
          c(_.prototype, a, function () {
            return this;
          }),
          (t.AsyncIterator = _),
          (t.async = function (e, n, r, i, o) {
            void 0 === o && (o = Promise);
            var s = new _(u(e, n, r, i), o);
            return t.isGeneratorFunction(n)
              ? s
              : s.next().then(function (e) {
                  return e.done ? e.value : s.next();
                });
          }),
          S(D),
          c(D, l, "Generator"),
          c(D, s, function () {
            return this;
          }),
          c(D, "toString", function () {
            return "[object Generator]";
          }),
          (t.keys = function (e) {
            var t = Object(e),
              n = [];
            for (var r in t) n.push(r);
            return (
              n.reverse(),
              function e() {
                for (; n.length; ) {
                  var r = n.pop();
                  if (r in t) return (e.value = r), (e.done = !1), e;
                }
                return (e.done = !0), e;
              }
            );
          }),
          (t.values = M),
          (k.prototype = {
            constructor: k,
            reset: function (t) {
              if (
                ((this.prev = 0),
                (this.next = 0),
                (this.sent = this._sent = e),
                (this.done = !1),
                (this.delegate = null),
                (this.method = "next"),
                (this.arg = e),
                this.tryEntries.forEach(T),
                !t)
              )
                for (var n in this)
                  "t" === n.charAt(0) &&
                    r.call(this, n) &&
                    !isNaN(+n.slice(1)) &&
                    (this[n] = e);
            },
            stop: function () {
              this.done = !0;
              var e = this.tryEntries[0].completion;
              if ("throw" === e.type) throw e.arg;
              return this.rval;
            },
            dispatchException: function (t) {
              if (this.done) throw t;
              var n = this;
              function i(r, i) {
                return (
                  (a.type = "throw"),
                  (a.arg = t),
                  (n.next = r),
                  i && ((n.method = "next"), (n.arg = e)),
                  !!i
                );
              }
              for (var o = this.tryEntries.length - 1; o >= 0; --o) {
                var s = this.tryEntries[o],
                  a = s.completion;
                if ("root" === s.tryLoc) return i("end");
                if (s.tryLoc <= this.prev) {
                  var l = r.call(s, "catchLoc"),
                    c = r.call(s, "finallyLoc");
                  if (l && c) {
                    if (this.prev < s.catchLoc) return i(s.catchLoc, !0);
                    if (this.prev < s.finallyLoc) return i(s.finallyLoc);
                  } else if (l) {
                    if (this.prev < s.catchLoc) return i(s.catchLoc, !0);
                  } else {
                    if (!c)
                      throw Error("try statement without catch or finally");
                    if (this.prev < s.finallyLoc) return i(s.finallyLoc);
                  }
                }
              }
            },
            abrupt: function (e, t) {
              for (var n = this.tryEntries.length - 1; n >= 0; --n) {
                var i = this.tryEntries[n];
                if (
                  i.tryLoc <= this.prev &&
                  r.call(i, "finallyLoc") &&
                  this.prev < i.finallyLoc
                ) {
                  var o = i;
                  break;
                }
              }
              o &&
                ("break" === e || "continue" === e) &&
                o.tryLoc <= t &&
                t <= o.finallyLoc &&
                (o = null);
              var s = o ? o.completion : {};
              return (
                (s.type = e),
                (s.arg = t),
                o
                  ? ((this.method = "next"), (this.next = o.finallyLoc), v)
                  : this.complete(s)
              );
            },
            complete: function (e, t) {
              if ("throw" === e.type) throw e.arg;
              return (
                "break" === e.type || "continue" === e.type
                  ? (this.next = e.arg)
                  : "return" === e.type
                    ? ((this.rval = this.arg = e.arg),
                      (this.method = "return"),
                      (this.next = "end"))
                    : "normal" === e.type && t && (this.next = t),
                v
              );
            },
            finish: function (e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var n = this.tryEntries[t];
                if (n.finallyLoc === e)
                  return this.complete(n.completion, n.afterLoc), T(n), v;
              }
            },
            catch: function (e) {
              for (var t = this.tryEntries.length - 1; t >= 0; --t) {
                var n = this.tryEntries[t];
                if (n.tryLoc === e) {
                  var r = n.completion;
                  if ("throw" === r.type) {
                    var i = r.arg;
                    T(n);
                  }
                  return i;
                }
              }
              throw Error("illegal catch attempt");
            },
            delegateYield: function (t, n, r) {
              return (
                (this.delegate = { iterator: M(t), resultName: n, nextLoc: r }),
                "next" === this.method && (this.arg = e),
                v
              );
            },
          }),
          t
        );
      }
      function vl(e, t) {
        return (
          (function (e) {
            if (Array.isArray(e)) return e;
          })(e) ||
          (function (e, t) {
            var n =
              null == e
                ? null
                : ("undefined" != typeof Symbol && e[Symbol.iterator]) ||
                  e["@@iterator"];
            if (null != n) {
              var r,
                i,
                o,
                s,
                a = [],
                l = !0,
                c = !1;
              try {
                if (((o = (n = n.call(e)).next), 0 === t)) {
                  if (Object(n) !== n) return;
                  l = !1;
                } else
                  for (
                    ;
                    !(l = (r = o.call(n)).done) &&
                    (a.push(r.value), a.length !== t);
                    l = !0
                  );
              } catch (e) {
                (c = !0), (i = e);
              } finally {
                try {
                  if (
                    !l &&
                    null != n.return &&
                    ((s = n.return()), Object(s) !== s)
                  )
                    return;
                } finally {
                  if (c) throw i;
                }
              }
              return a;
            }
          })(e, t) ||
          (function (e, t) {
            if (e) {
              if ("string" == typeof e) return ml(e, t);
              var n = {}.toString.call(e).slice(8, -1);
              return (
                "Object" === n && e.constructor && (n = e.constructor.name),
                "Map" === n || "Set" === n
                  ? Array.from(e)
                  : "Arguments" === n ||
                      /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)
                    ? ml(e, t)
                    : void 0
              );
            }
          })(e, t) ||
          (function () {
            throw new TypeError(
              "Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.",
            );
          })()
        );
      }
      function ml(e, t) {
        (null == t || t > e.length) && (t = e.length);
        for (var n = 0, r = Array(t); n < t; n++) r[n] = e[n];
        return r;
      }
      function yl(e, t, n, r, i, o, s) {
        try {
          var a = e[o](s),
            l = a.value;
        } catch (e) {
          return void n(e);
        }
        a.done ? t(l) : Promise.resolve(l).then(r, i);
      }
      function bl() {
        !(function (e, n) {
          if (
            e &&
            0 !== ll.holiday.length &&
            0 !== ll.saturday.length &&
            0 !== ll.weekday.length
          ) {
            for (
              var r = parseInt(document.getElementById("startNumber").value),
                i = t()(nl.view.activeStart),
                o = t()(nl.view.activeEnd),
                s = [],
                a = t()().startOf("day"),
                l = i;
              l.isBefore(o);

            ) {
              var c = ul(l, r, e, n);
              if (c) {
                var u = c.dateStr,
                  d = c.subject,
                  h = c.startTime,
                  f = c.endTime,
                  p = c.isHoliday,
                  g = c.isSaturday,
                  v = document.querySelector("[data-date='".concat(u, "']"));
                v &&
                  (v.classList.remove("holiday", "fc-day-sat", "fc-day-sun"),
                  l.isSame(a, "day") ||
                    (p && v.classList.add("holiday"),
                    g && v.classList.add("fc-day-sat"),
                    0 === l.day() && v.classList.add("fc-day-sun")));
                var m = _(d).config;
                s.push({
                  title: m.showTime
                    ? "".concat(d, "\n").concat(h, " - \n").concat(f)
                    : d,
                  start: u,
                  color: m.color,
                }),
                  (l = l.add(1, "day"));
              } else l = l.add(1, "day");
            }
            nl.removeAllEvents(), nl.addEventSource(s);
          }
        })(g, v);
      }
      function El() {
        var e,
          n = document.getElementById("baseDate");
        (e = t()(n.value)), (g = e), Al();
      }
      function Al() {
        var e = document.getElementById("startNumber").value;
        !(function (e, t) {
          var n = e.format("YYYY-MM-DD");
          window.history.pushState(
            {},
            "",
            "?baseDate=".concat(n, "&startNumber=").concat(t),
          );
        })(g, e),
          bl();
      }
      function wl() {
        !(function (e, n, r, i) {
          for (
            var o = t()().startOf("day"),
              s = o.add(e, "month"),
              a = "Subject,Start Date,Start Time,End Time\n",
              l = o;
            l.isBefore(s);

          ) {
            var c = ul(l, n, r, i);
            if (c) {
              var u = c.subject,
                d = c.startTime,
                h = c.endTime,
                f = l.format("YYYY/MM/DD");
              (a += ""
                .concat(u, ",")
                .concat(f, ",")
                .concat(d, ",")
                .concat(h, "\n")),
                (l = l.add(1, "day"));
            } else l = l.add(1, "day");
          }
          var p = new Uint8Array([239, 187, 191]),
            g = new Blob([p, a], { type: "text/csv;charset=utf-8" }),
            v = window.URL.createObjectURL(g),
            m = document.createElement("a"),
            y = t()().format("YYYY-MM-DD");
          (m.href = v),
            (m.download = "schedule_".concat(y, ".csv")),
            document.body.appendChild(m),
            m.click(),
            document.body.removeChild(m),
            window.URL.revokeObjectURL(v);
        })(
          parseInt(document.getElementById("exportMonths").value),
          parseInt(document.getElementById("startNumber").value),
          g,
          v,
        );
      }
      function Dl() {
        return (
          (Dl = (function (e) {
            return function () {
              var t = this,
                n = arguments;
              return new Promise(function (r, i) {
                var o = e.apply(t, n);
                function s(e) {
                  yl(o, r, i, s, a, "next", e);
                }
                function a(e) {
                  yl(o, r, i, s, a, "throw", e);
                }
                s(void 0);
              });
            };
          })(
            gl().mark(function e() {
              var t, n, r;
              return gl().wrap(
                function (e) {
                  for (;;)
                    switch ((e.prev = e.next)) {
                      case 0:
                        return (
                          (e.prev = 0), (e.next = 3), Promise.all([A(), D()])
                        );
                      case 3:
                        return (
                          (t = e.sent),
                          (n = vl(t, 2)),
                          (r = n[0]),
                          n[1],
                          (sl = r),
                          (e.next = 10),
                          B()
                        );
                      case 10:
                        return (
                          cl((al = e.sent)),
                          (e.next = 14),
                          j(sl.holidayYearsRange, sl.userDefinedHolidays)
                        );
                      case 14:
                        dl(b, g),
                          hl(g),
                          fl(al.rotationCycleLength),
                          (i = bl),
                          void 0,
                          (o = document.getElementById("calendar")),
                          (nl = new ca(o, {
                            plugins: [Pa, rl],
                            initialView: "dayGridMonth",
                            locale: "ja",
                            events: [],
                            datesSet: i,
                            aspectRatio: 1.35,
                            height: "auto",
                            eventDidMount: function (e) {
                              for (
                                var t = e.event,
                                  n = e.el,
                                  r = il(t.title.split("\n"), 3),
                                  i = r[0],
                                  o = r[1],
                                  s = void 0 === o ? "" : o,
                                  a = r[2],
                                  l = void 0 === a ? "" : a;
                                n.firstChild;

                              )
                                n.removeChild(n.firstChild);
                              var c = document.createElement("div");
                              if (
                                ((c.className = "event-title"),
                                (c.textContent = i),
                                n.appendChild(c),
                                s)
                              ) {
                                var u = document.createElement("div");
                                (u.className = "event-time"),
                                  (u.textContent = s),
                                  n.appendChild(u);
                              }
                              if (l) {
                                var d = document.createElement("div");
                                (d.className = "event-time"),
                                  (d.textContent = l),
                                  n.appendChild(d);
                              }
                            },
                          })).render(),
                          document
                            .getElementById("baseDate")
                            .addEventListener("change", El),
                          document
                            .getElementById("startNumber")
                            .addEventListener("change", Al),
                          document
                            .getElementById("exportButton")
                            .addEventListener("click", wl),
                          (e.next = 24);
                        break;
                      case 21:
                        (e.prev = 21),
                          (e.t0 = e.catch(0)),
                          console.error(
                            "アプリケーションの初期化に失敗しました:",
                            e.t0,
                          );
                      case 24:
                      case "end":
                        return e.stop();
                    }
                  var i, o;
                },
                e,
                null,
                [[0, 21]],
              );
            }),
          )),
          Dl.apply(this, arguments)
        );
      }
      window.onload = function () {
        return Dl.apply(this, arguments);
      };
    })();
})();
