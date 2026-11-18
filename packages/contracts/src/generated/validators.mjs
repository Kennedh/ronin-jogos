/* Generated standalone validators. Do not edit. */
var e = Object.create,
  t = Object.defineProperty,
  n = Object.getOwnPropertyDescriptor,
  r = Object.getOwnPropertyNames,
  i = Object.getPrototypeOf,
  a = Object.prototype.hasOwnProperty,
  o = (e, t) => () => (
    t || (e((t = { exports: {} }).exports, t, t.exports), (e = null)),
    t.exports
  ),
  s = (e, i, o, s) => {
    if ((i && typeof i == `object`) || typeof i == `function`)
      for (var c = r(i), l = 0, u = c.length, d; l < u; l++)
        ((d = c[l]),
          !a.call(e, d) &&
            d !== o &&
            t(e, d, {
              get: ((e) => i[e]).bind(null, d),
              enumerable: !(s = n(i, d)) || s.enumerable,
            }));
    return e;
  },
  c = (n, r, o) => (
    (o = n == null ? {} : e(i(n))),
    s(
      r || !n || !n.__esModule || !a.call(n, `default`)
        ? t(o, `default`, { value: n, enumerable: !0 })
        : o,
      n,
    )
  ),
  l = o((e) => {
    Object.defineProperty(e, "__esModule", { value: !0 });
    function t(e) {
      let t = e.length,
        n = 0,
        r = 0,
        i;
      for (; r < t;)
        (n++,
          (i = e.charCodeAt(r++)),
          i >= 55296 &&
            i <= 56319 &&
            r < t &&
            ((i = e.charCodeAt(r)), (i & 64512) == 56320 && r++));
      return n;
    }
    ((e.default = t),
      (t.code = `require("ajv/dist/runtime/ucs2length").default`));
  }),
  u = o((e) => {
    (Object.defineProperty(e, "__esModule", { value: !0 }),
      (e.formatNames = e.fastFormats = e.fullFormats = void 0));
    function t(e, t) {
      return { validate: e, compare: t };
    }
    ((e.fullFormats = {
      date: t(a, o),
      time: t(c(!0), l),
      "date-time": t(f(!0), p),
      "iso-time": t(c(), u),
      "iso-date-time": t(f(), m),
      duration:
        /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
      uri: _,
      "uri-reference":
        /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
      "uri-template":
        /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
      url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
      email:
        /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
      hostname:
        /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
      ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
      ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
      regex: E,
      uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
      "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
      "json-pointer-uri-fragment":
        /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
      "relative-json-pointer":
        /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
      byte: y,
      int32: { type: `number`, validate: S },
      int64: { type: `number`, validate: C },
      float: { type: `number`, validate: w },
      double: { type: `number`, validate: w },
      password: !0,
      binary: !0,
    }),
      (e.fastFormats = {
        ...e.fullFormats,
        date: t(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, o),
        time: t(
          /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i,
          l,
        ),
        "date-time": t(
          /^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i,
          p,
        ),
        "iso-time": t(
          /^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i,
          u,
        ),
        "iso-date-time": t(
          /^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i,
          m,
        ),
        uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
        "uri-reference":
          /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
        email:
          /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
      }),
      (e.formatNames = Object.keys(e.fullFormats)));
    function n(e) {
      return e % 4 == 0 && (e % 100 != 0 || e % 400 == 0);
    }
    let r = /^(\d\d\d\d)-(\d\d)-(\d\d)$/,
      i = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    function a(e) {
      let t = r.exec(e);
      if (!t) return !1;
      let a = +t[1],
        o = +t[2],
        s = +t[3];
      return o >= 1 && o <= 12 && s >= 1 && s <= (o === 2 && n(a) ? 29 : i[o]);
    }
    function o(e, t) {
      if (e && t) return e > t ? 1 : e < t ? -1 : 0;
    }
    let s = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
    function c(e) {
      return function (t) {
        let n = s.exec(t);
        if (!n) return !1;
        let r = +n[1],
          i = +n[2],
          a = +n[3],
          o = n[4],
          c = n[5] === `-` ? -1 : 1,
          l = +(n[6] || 0),
          u = +(n[7] || 0);
        if (l > 23 || u > 59 || (e && !o)) return !1;
        if (r <= 23 && i <= 59 && a < 60) return !0;
        let d = i - u * c,
          f = r - l * c - +(d < 0);
        return (f === 23 || f === -1) && (d === 59 || d === -1) && a < 61;
      };
    }
    function l(e, t) {
      if (!(e && t)) return;
      let n = new Date(`2020-01-01T` + e).valueOf(),
        r = new Date(`2020-01-01T` + t).valueOf();
      if (n && r) return n - r;
    }
    function u(e, t) {
      if (!(e && t)) return;
      let n = s.exec(e),
        r = s.exec(t);
      if (n && r)
        return (
          (e = n[1] + n[2] + n[3]),
          (t = r[1] + r[2] + r[3]),
          e > t ? 1 : e < t ? -1 : 0
        );
    }
    let d = /t|\s/i;
    function f(e) {
      let t = c(e);
      return function (e) {
        let n = e.split(d);
        return n.length === 2 && a(n[0]) && t(n[1]);
      };
    }
    function p(e, t) {
      if (!(e && t)) return;
      let n = new Date(e).valueOf(),
        r = new Date(t).valueOf();
      if (n && r) return n - r;
    }
    function m(e, t) {
      if (!(e && t)) return;
      let [n, r] = e.split(d),
        [i, a] = t.split(d),
        s = o(n, i);
      if (s !== void 0) return s || l(r, a);
    }
    let h = /\/|:/,
      g =
        /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
    function _(e) {
      return h.test(e) && g.test(e);
    }
    let v =
      /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
    function y(e) {
      return ((v.lastIndex = 0), v.test(e));
    }
    let b = -(2 ** 31),
      x = 2 ** 31 - 1;
    function S(e) {
      return Number.isInteger(e) && e <= x && e >= b;
    }
    function C(e) {
      return Number.isInteger(e);
    }
    function w() {
      return !0;
    }
    let T = /[^\\]\\Z/;
    function E(e) {
      if (T.test(e)) return !1;
      try {
        return (new RegExp(e), !0);
      } catch {
        return !1;
      }
    }
  }),
  d = c(
    o((e) => {
      e.RunMode = n;
      let t = { type: `string`, enum: [`FULL`, `REGIONAL`] };
      function n(
        e,
        {
          instancePath: r = ``,
          parentData: i,
          parentDataProperty: a,
          rootData: o = e,
          dynamicAnchors: s = {},
        } = {},
      ) {
        let c = null,
          l = 0,
          u = n.evaluated;
        if (
          (u.dynamicProps && (u.props = void 0),
          u.dynamicItems && (u.items = void 0),
          typeof e != `string`)
        ) {
          let e = {
            instancePath: r,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `string` },
            message: `must be string`,
          };
          (c === null ? (c = [e]) : c.push(e), l++);
        }
        if (e !== `FULL` && e !== `REGIONAL`) {
          let e = {
            instancePath: r,
            schemaPath: `#/enum`,
            keyword: `enum`,
            params: { allowedValues: t.enum },
            message: `must be equal to one of the allowed values`,
          };
          (c === null ? (c = [e]) : c.push(e), l++);
        }
        return ((n.errors = c), l === 0);
      }
      ((n.evaluated = { dynamicProps: !1, dynamicItems: !1 }),
        (e.PlayerSummary = a));
      let r = {
          type: `object`,
          required: [`player_id`, `account_type`, `nickname`, `locale`],
          properties: {
            player_id: { type: `string`, format: `uuid` },
            account_type: {
              type: `string`,
              enum: [`GUEST`, `EMAIL`, `GOOGLE`, `MULTI`],
            },
            nickname: { type: [`string`, `null`] },
            locale: { type: `string`, enum: [`pt-BR`, `en`] },
            email_verified: { type: `boolean` },
            region_unlocks: { type: `array`, items: { type: `string` } },
          },
        },
        i = /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
      function a(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: o,
          rootData: s = e,
          dynamicAnchors: c = {},
        } = {},
      ) {
        let l = null,
          u = 0,
          d = a.evaluated;
        if (
          (d.dynamicProps && (d.props = void 0),
          d.dynamicItems && (d.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.player_id === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `player_id` },
              message: `must have required property 'player_id'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.account_type === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `account_type` },
              message: `must have required property 'account_type'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.nickname === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `nickname` },
              message: `must have required property 'nickname'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.locale === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `locale` },
              message: `must have required property 'locale'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.player_id !== void 0) {
            let n = e.player_id;
            if (typeof n == `string`) {
              if (!i.test(n)) {
                let e = {
                  instancePath: t + `/player_id`,
                  schemaPath: `#/properties/player_id/format`,
                  keyword: `format`,
                  params: { format: `uuid` },
                  message: `must match format "uuid"`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
            } else {
              let e = {
                instancePath: t + `/player_id`,
                schemaPath: `#/properties/player_id/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (e.account_type !== void 0) {
            let n = e.account_type;
            if (typeof n != `string`) {
              let e = {
                instancePath: t + `/account_type`,
                schemaPath: `#/properties/account_type/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
            if (
              n !== `GUEST` &&
              n !== `EMAIL` &&
              n !== `GOOGLE` &&
              n !== `MULTI`
            ) {
              let e = {
                instancePath: t + `/account_type`,
                schemaPath: `#/properties/account_type/enum`,
                keyword: `enum`,
                params: { allowedValues: r.properties.account_type.enum },
                message: `must be equal to one of the allowed values`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (e.nickname !== void 0) {
            let n = e.nickname;
            if (typeof n != `string` && n !== null) {
              let e = {
                instancePath: t + `/nickname`,
                schemaPath: `#/properties/nickname/type`,
                keyword: `type`,
                params: { type: r.properties.nickname.type },
                message: `must be string,null`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (e.locale !== void 0) {
            let n = e.locale;
            if (typeof n != `string`) {
              let e = {
                instancePath: t + `/locale`,
                schemaPath: `#/properties/locale/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
            if (n !== `pt-BR` && n !== `en`) {
              let e = {
                instancePath: t + `/locale`,
                schemaPath: `#/properties/locale/enum`,
                keyword: `enum`,
                params: { allowedValues: r.properties.locale.enum },
                message: `must be equal to one of the allowed values`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (
            e.email_verified !== void 0 &&
            typeof e.email_verified != `boolean`
          ) {
            let e = {
              instancePath: t + `/email_verified`,
              schemaPath: `#/properties/email_verified/type`,
              keyword: `type`,
              params: { type: `boolean` },
              message: `must be boolean`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.region_unlocks !== void 0) {
            let n = e.region_unlocks;
            if (Array.isArray(n)) {
              let e = n.length;
              for (let r = 0; r < e; r++)
                if (typeof n[r] != `string`) {
                  let e = {
                    instancePath: t + `/region_unlocks/` + r,
                    schemaPath: `#/properties/region_unlocks/items/type`,
                    keyword: `type`,
                    params: { type: `string` },
                    message: `must be string`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
            } else {
              let e = {
                instancePath: t + `/region_unlocks`,
                schemaPath: `#/properties/region_unlocks/type`,
                keyword: `type`,
                params: { type: `array` },
                message: `must be array`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (l === null ? (l = [e]) : l.push(e), u++);
        }
        return ((a.errors = l), u === 0);
      }
      ((a.evaluated = {
        props: {
          player_id: !0,
          account_type: !0,
          nickname: !0,
          locale: !0,
          email_verified: !0,
          region_unlocks: !0,
        },
        dynamicProps: !1,
        dynamicItems: !1,
      }),
        (e.RegisterRequest = c));
      let o =
          /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
        s = l().default;
      function c(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let l = null,
          u = 0,
          d = c.evaluated;
        if (
          (d.dynamicProps && (d.props = void 0),
          d.dynamicItems && (d.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.email === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `email` },
              message: `must have required property 'email'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.password === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `password` },
              message: `must have required property 'password'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          for (let n in e)
            if (n !== `email` && n !== `password` && n !== `nickname`) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          if (e.email !== void 0) {
            let n = e.email;
            if (typeof n == `string`) {
              if (!o.test(n)) {
                let e = {
                  instancePath: t + `/email`,
                  schemaPath: `#/properties/email/format`,
                  keyword: `format`,
                  params: { format: `email` },
                  message: `must match format "email"`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
            } else {
              let e = {
                instancePath: t + `/email`,
                schemaPath: `#/properties/email/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (e.password !== void 0) {
            let n = e.password;
            if (typeof n == `string`) {
              if (s(n) > 256) {
                let e = {
                  instancePath: t + `/password`,
                  schemaPath: `#/properties/password/maxLength`,
                  keyword: `maxLength`,
                  params: { limit: 256 },
                  message: `must NOT have more than 256 characters`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (s(n) < 12) {
                let e = {
                  instancePath: t + `/password`,
                  schemaPath: `#/properties/password/minLength`,
                  keyword: `minLength`,
                  params: { limit: 12 },
                  message: `must NOT have fewer than 12 characters`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
            } else {
              let e = {
                instancePath: t + `/password`,
                schemaPath: `#/properties/password/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (e.nickname !== void 0) {
            let n = e.nickname;
            if (typeof n == `string`) {
              if (s(n) > 20) {
                let e = {
                  instancePath: t + `/nickname`,
                  schemaPath: `#/properties/nickname/maxLength`,
                  keyword: `maxLength`,
                  params: { limit: 20 },
                  message: `must NOT have more than 20 characters`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (s(n) < 3) {
                let e = {
                  instancePath: t + `/nickname`,
                  schemaPath: `#/properties/nickname/minLength`,
                  keyword: `minLength`,
                  params: { limit: 3 },
                  message: `must NOT have fewer than 3 characters`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
            } else {
              let e = {
                instancePath: t + `/nickname`,
                schemaPath: `#/properties/nickname/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (l === null ? (l = [e]) : l.push(e), u++);
        }
        return ((c.errors = l), u === 0);
      }
      ((c.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.EmailLoginRequest = d));
      function d(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let s = null,
          c = 0,
          l = d.evaluated;
        if (
          (l.dynamicProps && (l.props = void 0),
          l.dynamicItems && (l.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.email === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `email` },
              message: `must have required property 'email'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.password === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `password` },
              message: `must have required property 'password'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          for (let n in e)
            if (n !== `email` && n !== `password`) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          if (e.email !== void 0) {
            let n = e.email;
            if (typeof n == `string`) {
              if (!o.test(n)) {
                let e = {
                  instancePath: t + `/email`,
                  schemaPath: `#/properties/email/format`,
                  keyword: `format`,
                  params: { format: `email` },
                  message: `must match format "email"`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/email`,
                schemaPath: `#/properties/email/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.password !== void 0 && typeof e.password != `string`) {
            let e = {
              instancePath: t + `/password`,
              schemaPath: `#/properties/password/type`,
              keyword: `type`,
              params: { type: `string` },
              message: `must be string`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (s === null ? (s = [e]) : s.push(e), c++);
        }
        return ((d.errors = s), c === 0);
      }
      ((d.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.CharacterPart = p));
      let f = {
        type: `object`,
        required: [`part_id`, `slot`, `is_basic_free`, `rig_version`],
        properties: {
          part_id: { type: `string` },
          slot: { type: `string` },
          is_basic_free: { type: `boolean` },
          unlock_requirement_id: { type: [`string`, `null`] },
          rig_version: { type: `string` },
          locale_key: { type: `string` },
        },
      };
      function p(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          s = 0,
          c = p.evaluated;
        if (
          (c.dynamicProps && (c.props = void 0),
          c.dynamicItems && (c.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.part_id === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `part_id` },
              message: `must have required property 'part_id'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.slot === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `slot` },
              message: `must have required property 'slot'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.is_basic_free === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `is_basic_free` },
              message: `must have required property 'is_basic_free'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.rig_version === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `rig_version` },
              message: `must have required property 'rig_version'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.part_id !== void 0 && typeof e.part_id != `string`) {
            let e = {
              instancePath: t + `/part_id`,
              schemaPath: `#/properties/part_id/type`,
              keyword: `type`,
              params: { type: `string` },
              message: `must be string`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.slot !== void 0 && typeof e.slot != `string`) {
            let e = {
              instancePath: t + `/slot`,
              schemaPath: `#/properties/slot/type`,
              keyword: `type`,
              params: { type: `string` },
              message: `must be string`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (
            e.is_basic_free !== void 0 &&
            typeof e.is_basic_free != `boolean`
          ) {
            let e = {
              instancePath: t + `/is_basic_free`,
              schemaPath: `#/properties/is_basic_free/type`,
              keyword: `type`,
              params: { type: `boolean` },
              message: `must be boolean`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.unlock_requirement_id !== void 0) {
            let n = e.unlock_requirement_id;
            if (typeof n != `string` && n !== null) {
              let e = {
                instancePath: t + `/unlock_requirement_id`,
                schemaPath: `#/properties/unlock_requirement_id/type`,
                keyword: `type`,
                params: { type: f.properties.unlock_requirement_id.type },
                message: `must be string,null`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          if (e.rig_version !== void 0 && typeof e.rig_version != `string`) {
            let e = {
              instancePath: t + `/rig_version`,
              schemaPath: `#/properties/rig_version/type`,
              keyword: `type`,
              params: { type: `string` },
              message: `must be string`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.locale_key !== void 0 && typeof e.locale_key != `string`) {
            let e = {
              instancePath: t + `/locale_key`,
              schemaPath: `#/properties/locale_key/type`,
              keyword: `type`,
              params: { type: `string` },
              message: `must be string`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), s++);
        }
        return ((p.errors = o), s === 0);
      }
      ((p.evaluated = {
        props: {
          part_id: !0,
          slot: !0,
          is_basic_free: !0,
          unlock_requirement_id: !0,
          rig_version: !0,
          locale_key: !0,
        },
        dynamicProps: !1,
        dynamicItems: !1,
      }),
        (e.Character = m));
      function m(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: a = e,
          dynamicAnchors: o = {},
        } = {},
      ) {
        let s = null,
          c = 0,
          l = m.evaluated;
        if (
          (l.dynamicProps && (l.props = void 0),
          l.dynamicItems && (l.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.player_id === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `player_id` },
              message: `must have required property 'player_id'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.appearance_version === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `appearance_version` },
              message: `must have required property 'appearance_version'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.slots === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `slots` },
              message: `must have required property 'slots'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.player_id !== void 0) {
            let n = e.player_id;
            if (typeof n == `string`) {
              if (!i.test(n)) {
                let e = {
                  instancePath: t + `/player_id`,
                  schemaPath: `#/properties/player_id/format`,
                  keyword: `format`,
                  params: { format: `uuid` },
                  message: `must match format "uuid"`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/player_id`,
                schemaPath: `#/properties/player_id/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.appearance_version !== void 0) {
            let n = e.appearance_version;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/appearance_version`,
                schemaPath: `#/properties/appearance_version/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n) && (n < 1 || isNaN(n))) {
              let e = {
                instancePath: t + `/appearance_version`,
                schemaPath: `#/properties/appearance_version/minimum`,
                keyword: `minimum`,
                params: { comparison: `>=`, limit: 1 },
                message: `must be >= 1`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.slots !== void 0) {
            let n = e.slots;
            if (n && typeof n == `object` && !Array.isArray(n)) {
              for (let e in n)
                if (typeof n[e] != `string`) {
                  let n = {
                    instancePath:
                      t +
                      `/slots/` +
                      e.replace(/~/g, `~0`).replace(/\//g, `~1`),
                    schemaPath: `#/properties/slots/additionalProperties/type`,
                    keyword: `type`,
                    params: { type: `string` },
                    message: `must be string`,
                  };
                  (s === null ? (s = [n]) : s.push(n), c++);
                }
            } else {
              let e = {
                instancePath: t + `/slots`,
                schemaPath: `#/properties/slots/type`,
                keyword: `type`,
                params: { type: `object` },
                message: `must be object`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (s === null ? (s = [e]) : s.push(e), c++);
        }
        return ((m.errors = s), c === 0);
      }
      ((m.evaluated = {
        props: { player_id: !0, appearance_version: !0, slots: !0 },
        dynamicProps: !1,
        dynamicItems: !1,
      }),
        (e.CharacterUpdate = h));
      function h(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          s = 0,
          c = h.evaluated;
        if (
          (c.dynamicProps && (c.props = void 0),
          c.dynamicItems && (c.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.expected_appearance_version === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `expected_appearance_version` },
              message: `must have required property 'expected_appearance_version'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.slots === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `slots` },
              message: `must have required property 'slots'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          for (let n in e)
            if (n !== `expected_appearance_version` && n !== `slots`) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          if (e.expected_appearance_version !== void 0) {
            let n = e.expected_appearance_version;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/expected_appearance_version`,
                schemaPath: `#/properties/expected_appearance_version/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n) && (n < 1 || isNaN(n))) {
              let e = {
                instancePath: t + `/expected_appearance_version`,
                schemaPath: `#/properties/expected_appearance_version/minimum`,
                keyword: `minimum`,
                params: { comparison: `>=`, limit: 1 },
                message: `must be >= 1`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          if (e.slots !== void 0) {
            let n = e.slots;
            if (n && typeof n == `object` && !Array.isArray(n)) {
              for (let e in n)
                if (typeof n[e] != `string`) {
                  let n = {
                    instancePath:
                      t +
                      `/slots/` +
                      e.replace(/~/g, `~0`).replace(/\//g, `~1`),
                    schemaPath: `#/properties/slots/additionalProperties/type`,
                    keyword: `type`,
                    params: { type: `string` },
                    message: `must be string`,
                  };
                  (o === null ? (o = [n]) : o.push(n), s++);
                }
            } else {
              let e = {
                instancePath: t + `/slots`,
                schemaPath: `#/properties/slots/type`,
                keyword: `type`,
                params: { type: `object` },
                message: `must be object`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), s++);
        }
        return ((h.errors = o), s === 0);
      }
      ((h.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.RunTicket = S));
      let g = {
          type: `object`,
          properties: {
            run_id: { type: `string`, format: `uuid` },
            mode: { $ref: `#/$defs/RunMode` },
            starting_region_id: {
              type: `string`,
              enum: [`BAMBOO`, `TEMPLE`, `MOUNTAINS`, `CASTLE`],
            },
            seed: { type: `string`, pattern: `^[a-f0-9]{32}$` },
            versions: { $ref: `#/$defs/RunVersions` },
            started_at: { type: `string`, format: `date-time` },
            expires_at: { type: `string`, format: `date-time` },
            limits: { $ref: `#/$defs/RunLimits` },
            server_time: { type: `string`, format: `date-time` },
          },
          required: [
            `run_id`,
            `mode`,
            `starting_region_id`,
            `seed`,
            `versions`,
            `started_at`,
            `expires_at`,
            `limits`,
            `server_time`,
          ],
          additionalProperties: !1,
          oneOf: [
            {
              properties: {
                mode: { const: `FULL` },
                starting_region_id: { const: `BAMBOO` },
              },
            },
            { properties: { mode: { const: `REGIONAL` } } },
          ],
        },
        _ = {
          type: `object`,
          properties: {
            segment_ticks: { type: `integer`, const: 3600 },
            max_encoded_bytes: { type: `integer`, const: 262144 },
            max_decoded_bytes: { type: `integer`, const: 1048576 },
            max_actions_per_tick: { type: `integer`, const: 2 },
            upload_grace_seconds: { type: `integer`, const: 86400 },
            max_run_encoded_bytes: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
              description: `Política imutável de transporte/recursos por tentativa; baseline inicial 134217728, não limite de distância/fase.`,
            },
            max_player_encoded_bytes: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
              description: `Política imutável de transporte/recursos por tentativa; baseline inicial 536870912, não limite de distância/fase.`,
            },
            max_segments_per_run: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
              description: `Política imutável de transporte/recursos por tentativa; baseline inicial 10000, não limite de distância/fase.`,
            },
            max_active_runs: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
              description: `Política imutável de transporte/recursos por tentativa; baseline inicial 3, não limite de distância/fase.`,
            },
            wall_time_tolerance_ticks: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
              description: `Política imutável de transporte/recursos por tentativa; baseline inicial 120, não limite de distância/fase.`,
            },
          },
          required: [
            `segment_ticks`,
            `max_encoded_bytes`,
            `max_decoded_bytes`,
            `max_actions_per_tick`,
            `upload_grace_seconds`,
            `max_run_encoded_bytes`,
            `max_player_encoded_bytes`,
            `max_segments_per_run`,
            `max_active_runs`,
            `wall_time_tolerance_ticks`,
          ],
          additionalProperties: !1,
        },
        v = Object.prototype.hasOwnProperty,
        y = u().fullFormats[`date-time`],
        b = RegExp(`^[a-f0-9]{32}$`, `u`),
        x = RegExp(`^[a-f0-9]{64}$`, `u`);
      function S(
        e,
        {
          instancePath: n = ``,
          parentData: r,
          parentDataProperty: a,
          rootData: o = e,
          dynamicAnchors: c = {},
        } = {},
      ) {
        let l = null,
          u = 0,
          d = S.evaluated;
        (d.dynamicProps && (d.props = void 0),
          d.dynamicItems && (d.items = void 0));
        let f = u,
          p = !1,
          m = null,
          h = u;
        if (e && typeof e == `object` && !Array.isArray(e)) {
          if (e.mode !== void 0 && e.mode !== `FULL`) {
            let e = {
              instancePath: n + `/mode`,
              schemaPath: `#/oneOf/0/properties/mode/const`,
              keyword: `const`,
              params: { allowedValue: `FULL` },
              message: `must be equal to constant`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (
            e.starting_region_id !== void 0 &&
            e.starting_region_id !== `BAMBOO`
          ) {
            let e = {
              instancePath: n + `/starting_region_id`,
              schemaPath: `#/oneOf/0/properties/starting_region_id/const`,
              keyword: `const`,
              params: { allowedValue: `BAMBOO` },
              message: `must be equal to constant`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
        }
        var C = h === u;
        if (C) {
          ((p = !0), (m = 0));
          var w = {};
          ((w.mode = !0), (w.starting_region_id = !0));
        }
        let T = u;
        if (
          e &&
          typeof e == `object` &&
          !Array.isArray(e) &&
          e.mode !== void 0 &&
          e.mode !== `REGIONAL`
        ) {
          let e = {
            instancePath: n + `/mode`,
            schemaPath: `#/oneOf/1/properties/mode/const`,
            keyword: `const`,
            params: { allowedValue: `REGIONAL` },
            message: `must be equal to constant`,
          };
          (l === null ? (l = [e]) : l.push(e), u++);
        }
        var C = T === u;
        if (
          (C && p
            ? ((p = !1), (m = [m, 1]))
            : C && ((p = !0), (m = 1), w !== !0 && ((w ||= {}), (w.mode = !0))),
          p)
        )
          ((u = f), l !== null && (f ? (l.length = f) : (l = null)));
        else {
          let e = {
            instancePath: n,
            schemaPath: `#/oneOf`,
            keyword: `oneOf`,
            params: { passingSchemas: m },
            message: `must match exactly one schema in oneOf`,
          };
          (l === null ? (l = [e]) : l.push(e), u++);
        }
        if (e && typeof e == `object` && !Array.isArray(e)) {
          if (e.run_id === void 0) {
            let e = {
              instancePath: n,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `run_id` },
              message: `must have required property 'run_id'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.mode === void 0) {
            let e = {
              instancePath: n,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `mode` },
              message: `must have required property 'mode'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.starting_region_id === void 0) {
            let e = {
              instancePath: n,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `starting_region_id` },
              message: `must have required property 'starting_region_id'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.seed === void 0) {
            let e = {
              instancePath: n,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `seed` },
              message: `must have required property 'seed'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.versions === void 0) {
            let e = {
              instancePath: n,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `versions` },
              message: `must have required property 'versions'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.started_at === void 0) {
            let e = {
              instancePath: n,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `started_at` },
              message: `must have required property 'started_at'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.expires_at === void 0) {
            let e = {
              instancePath: n,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `expires_at` },
              message: `must have required property 'expires_at'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.limits === void 0) {
            let e = {
              instancePath: n,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `limits` },
              message: `must have required property 'limits'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          if (e.server_time === void 0) {
            let e = {
              instancePath: n,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `server_time` },
              message: `must have required property 'server_time'`,
            };
            (l === null ? (l = [e]) : l.push(e), u++);
          }
          for (let t in e)
            if (!v.call(g.properties, t)) {
              let e = {
                instancePath: n,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: t },
                message: `must NOT have additional properties`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          if (e.run_id !== void 0) {
            let t = e.run_id;
            if (typeof t == `string`) {
              if (!i.test(t)) {
                let e = {
                  instancePath: n + `/run_id`,
                  schemaPath: `#/properties/run_id/format`,
                  keyword: `format`,
                  params: { format: `uuid` },
                  message: `must match format "uuid"`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
            } else {
              let e = {
                instancePath: n + `/run_id`,
                schemaPath: `#/properties/run_id/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (e.mode !== void 0) {
            let r = e.mode;
            if (typeof r != `string`) {
              let e = {
                instancePath: n + `/mode`,
                schemaPath: `#/$defs/RunMode/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
            if (r !== `FULL` && r !== `REGIONAL`) {
              let e = {
                instancePath: n + `/mode`,
                schemaPath: `#/$defs/RunMode/enum`,
                keyword: `enum`,
                params: { allowedValues: t.enum },
                message: `must be equal to one of the allowed values`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (e.starting_region_id !== void 0) {
            let t = e.starting_region_id;
            if (typeof t != `string`) {
              let e = {
                instancePath: n + `/starting_region_id`,
                schemaPath: `#/properties/starting_region_id/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
            if (
              t !== `BAMBOO` &&
              t !== `TEMPLE` &&
              t !== `MOUNTAINS` &&
              t !== `CASTLE`
            ) {
              let e = {
                instancePath: n + `/starting_region_id`,
                schemaPath: `#/properties/starting_region_id/enum`,
                keyword: `enum`,
                params: { allowedValues: g.properties.starting_region_id.enum },
                message: `must be equal to one of the allowed values`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (e.seed !== void 0) {
            let t = e.seed;
            if (typeof t == `string`) {
              if (!b.test(t)) {
                let e = {
                  instancePath: n + `/seed`,
                  schemaPath: `#/properties/seed/pattern`,
                  keyword: `pattern`,
                  params: { pattern: `^[a-f0-9]{32}$` },
                  message: `must match pattern "^[a-f0-9]{32}$"`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
            } else {
              let e = {
                instancePath: n + `/seed`,
                schemaPath: `#/properties/seed/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (e.versions !== void 0) {
            let t = e.versions;
            if (t && typeof t == `object` && !Array.isArray(t)) {
              if (t.rules_major === void 0) {
                let e = {
                  instancePath: n + `/versions`,
                  schemaPath: `#/$defs/RunVersions/required`,
                  keyword: `required`,
                  params: { missingProperty: `rules_major` },
                  message: `must have required property 'rules_major'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.rules_patch === void 0) {
                let e = {
                  instancePath: n + `/versions`,
                  schemaPath: `#/$defs/RunVersions/required`,
                  keyword: `required`,
                  params: { missingProperty: `rules_patch` },
                  message: `must have required property 'rules_patch'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.generator_version === void 0) {
                let e = {
                  instancePath: n + `/versions`,
                  schemaPath: `#/$defs/RunVersions/required`,
                  keyword: `required`,
                  params: { missingProperty: `generator_version` },
                  message: `must have required property 'generator_version'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.scoring_version === void 0) {
                let e = {
                  instancePath: n + `/versions`,
                  schemaPath: `#/$defs/RunVersions/required`,
                  keyword: `required`,
                  params: { missingProperty: `scoring_version` },
                  message: `must have required property 'scoring_version'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.replay_protocol_version === void 0) {
                let e = {
                  instancePath: n + `/versions`,
                  schemaPath: `#/$defs/RunVersions/required`,
                  keyword: `required`,
                  params: { missingProperty: `replay_protocol_version` },
                  message: `must have required property 'replay_protocol_version'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.rules_manifest_hash === void 0) {
                let e = {
                  instancePath: n + `/versions`,
                  schemaPath: `#/$defs/RunVersions/required`,
                  keyword: `required`,
                  params: { missingProperty: `rules_manifest_hash` },
                  message: `must have required property 'rules_manifest_hash'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.assets_manifest_version === void 0) {
                let e = {
                  instancePath: n + `/versions`,
                  schemaPath: `#/$defs/RunVersions/required`,
                  keyword: `required`,
                  params: { missingProperty: `assets_manifest_version` },
                  message: `must have required property 'assets_manifest_version'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              for (let e in t)
                if (
                  e !== `rules_major` &&
                  e !== `rules_patch` &&
                  e !== `generator_version` &&
                  e !== `scoring_version` &&
                  e !== `replay_protocol_version` &&
                  e !== `rules_manifest_hash` &&
                  e !== `assets_manifest_version`
                ) {
                  let t = {
                    instancePath: n + `/versions`,
                    schemaPath: `#/$defs/RunVersions/additionalProperties`,
                    keyword: `additionalProperties`,
                    params: { additionalProperty: e },
                    message: `must NOT have additional properties`,
                  };
                  (l === null ? (l = [t]) : l.push(t), u++);
                }
              if (t.rules_major !== void 0) {
                let e = t.rules_major;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: n + `/versions/rules_major`,
                    schemaPath: `#/$defs/RunVersions/properties/rules_major/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/versions/rules_major`,
                      schemaPath: `#/$defs/RunVersions/properties/rules_major/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/versions/rules_major`,
                      schemaPath: `#/$defs/RunVersions/properties/rules_major/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                }
              }
              if (t.rules_patch !== void 0) {
                let e = t.rules_patch;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: n + `/versions/rules_patch`,
                    schemaPath: `#/$defs/RunVersions/properties/rules_patch/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 2147483647 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/versions/rules_patch`,
                      schemaPath: `#/$defs/RunVersions/properties/rules_patch/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 2147483647 },
                      message: `must be <= 2147483647`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                  if (e < 0 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/versions/rules_patch`,
                      schemaPath: `#/$defs/RunVersions/properties/rules_patch/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 0 },
                      message: `must be >= 0`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                }
              }
              if (t.generator_version !== void 0) {
                let e = t.generator_version;
                if (typeof e == `string`) {
                  if (s(e) < 1) {
                    let e = {
                      instancePath: n + `/versions/generator_version`,
                      schemaPath: `#/$defs/RunVersions/properties/generator_version/minLength`,
                      keyword: `minLength`,
                      params: { limit: 1 },
                      message: `must NOT have fewer than 1 characters`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                } else {
                  let e = {
                    instancePath: n + `/versions/generator_version`,
                    schemaPath: `#/$defs/RunVersions/properties/generator_version/type`,
                    keyword: `type`,
                    params: { type: `string` },
                    message: `must be string`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
              }
              if (t.scoring_version !== void 0) {
                let e = t.scoring_version;
                if (typeof e == `string`) {
                  if (s(e) < 1) {
                    let e = {
                      instancePath: n + `/versions/scoring_version`,
                      schemaPath: `#/$defs/RunVersions/properties/scoring_version/minLength`,
                      keyword: `minLength`,
                      params: { limit: 1 },
                      message: `must NOT have fewer than 1 characters`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                } else {
                  let e = {
                    instancePath: n + `/versions/scoring_version`,
                    schemaPath: `#/$defs/RunVersions/properties/scoring_version/type`,
                    keyword: `type`,
                    params: { type: `string` },
                    message: `must be string`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
              }
              if (t.replay_protocol_version !== void 0) {
                let e = t.replay_protocol_version;
                if (typeof e != `string`) {
                  let e = {
                    instancePath: n + `/versions/replay_protocol_version`,
                    schemaPath: `#/$defs/RunVersions/properties/replay_protocol_version/type`,
                    keyword: `type`,
                    params: { type: `string` },
                    message: `must be string`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
                if (e !== `rr-input-v1`) {
                  let e = {
                    instancePath: n + `/versions/replay_protocol_version`,
                    schemaPath: `#/$defs/RunVersions/properties/replay_protocol_version/const`,
                    keyword: `const`,
                    params: { allowedValue: `rr-input-v1` },
                    message: `must be equal to constant`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
              }
              if (t.rules_manifest_hash !== void 0) {
                let e = t.rules_manifest_hash;
                if (typeof e == `string`) {
                  if (!x.test(e)) {
                    let e = {
                      instancePath: n + `/versions/rules_manifest_hash`,
                      schemaPath: `#/$defs/RunVersions/properties/rules_manifest_hash/pattern`,
                      keyword: `pattern`,
                      params: { pattern: `^[a-f0-9]{64}$` },
                      message: `must match pattern "^[a-f0-9]{64}$"`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                } else {
                  let e = {
                    instancePath: n + `/versions/rules_manifest_hash`,
                    schemaPath: `#/$defs/RunVersions/properties/rules_manifest_hash/type`,
                    keyword: `type`,
                    params: { type: `string` },
                    message: `must be string`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
              }
              if (t.assets_manifest_version !== void 0) {
                let e = t.assets_manifest_version;
                if (typeof e == `string`) {
                  if (s(e) < 1) {
                    let e = {
                      instancePath: n + `/versions/assets_manifest_version`,
                      schemaPath: `#/$defs/RunVersions/properties/assets_manifest_version/minLength`,
                      keyword: `minLength`,
                      params: { limit: 1 },
                      message: `must NOT have fewer than 1 characters`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                } else {
                  let e = {
                    instancePath: n + `/versions/assets_manifest_version`,
                    schemaPath: `#/$defs/RunVersions/properties/assets_manifest_version/type`,
                    keyword: `type`,
                    params: { type: `string` },
                    message: `must be string`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
              }
            } else {
              let e = {
                instancePath: n + `/versions`,
                schemaPath: `#/$defs/RunVersions/type`,
                keyword: `type`,
                params: { type: `object` },
                message: `must be object`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (e.started_at !== void 0) {
            let t = e.started_at;
            if (typeof t == `string`) {
              if (!y.validate(t)) {
                let e = {
                  instancePath: n + `/started_at`,
                  schemaPath: `#/properties/started_at/format`,
                  keyword: `format`,
                  params: { format: `date-time` },
                  message: `must match format "date-time"`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
            } else {
              let e = {
                instancePath: n + `/started_at`,
                schemaPath: `#/properties/started_at/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (e.expires_at !== void 0) {
            let t = e.expires_at;
            if (typeof t == `string`) {
              if (!y.validate(t)) {
                let e = {
                  instancePath: n + `/expires_at`,
                  schemaPath: `#/properties/expires_at/format`,
                  keyword: `format`,
                  params: { format: `date-time` },
                  message: `must match format "date-time"`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
            } else {
              let e = {
                instancePath: n + `/expires_at`,
                schemaPath: `#/properties/expires_at/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (e.limits !== void 0) {
            let t = e.limits;
            if (t && typeof t == `object` && !Array.isArray(t)) {
              if (t.segment_ticks === void 0) {
                let e = {
                  instancePath: n + `/limits`,
                  schemaPath: `#/$defs/RunLimits/required`,
                  keyword: `required`,
                  params: { missingProperty: `segment_ticks` },
                  message: `must have required property 'segment_ticks'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.max_encoded_bytes === void 0) {
                let e = {
                  instancePath: n + `/limits`,
                  schemaPath: `#/$defs/RunLimits/required`,
                  keyword: `required`,
                  params: { missingProperty: `max_encoded_bytes` },
                  message: `must have required property 'max_encoded_bytes'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.max_decoded_bytes === void 0) {
                let e = {
                  instancePath: n + `/limits`,
                  schemaPath: `#/$defs/RunLimits/required`,
                  keyword: `required`,
                  params: { missingProperty: `max_decoded_bytes` },
                  message: `must have required property 'max_decoded_bytes'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.max_actions_per_tick === void 0) {
                let e = {
                  instancePath: n + `/limits`,
                  schemaPath: `#/$defs/RunLimits/required`,
                  keyword: `required`,
                  params: { missingProperty: `max_actions_per_tick` },
                  message: `must have required property 'max_actions_per_tick'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.upload_grace_seconds === void 0) {
                let e = {
                  instancePath: n + `/limits`,
                  schemaPath: `#/$defs/RunLimits/required`,
                  keyword: `required`,
                  params: { missingProperty: `upload_grace_seconds` },
                  message: `must have required property 'upload_grace_seconds'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.max_run_encoded_bytes === void 0) {
                let e = {
                  instancePath: n + `/limits`,
                  schemaPath: `#/$defs/RunLimits/required`,
                  keyword: `required`,
                  params: { missingProperty: `max_run_encoded_bytes` },
                  message: `must have required property 'max_run_encoded_bytes'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.max_player_encoded_bytes === void 0) {
                let e = {
                  instancePath: n + `/limits`,
                  schemaPath: `#/$defs/RunLimits/required`,
                  keyword: `required`,
                  params: { missingProperty: `max_player_encoded_bytes` },
                  message: `must have required property 'max_player_encoded_bytes'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.max_segments_per_run === void 0) {
                let e = {
                  instancePath: n + `/limits`,
                  schemaPath: `#/$defs/RunLimits/required`,
                  keyword: `required`,
                  params: { missingProperty: `max_segments_per_run` },
                  message: `must have required property 'max_segments_per_run'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.max_active_runs === void 0) {
                let e = {
                  instancePath: n + `/limits`,
                  schemaPath: `#/$defs/RunLimits/required`,
                  keyword: `required`,
                  params: { missingProperty: `max_active_runs` },
                  message: `must have required property 'max_active_runs'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              if (t.wall_time_tolerance_ticks === void 0) {
                let e = {
                  instancePath: n + `/limits`,
                  schemaPath: `#/$defs/RunLimits/required`,
                  keyword: `required`,
                  params: { missingProperty: `wall_time_tolerance_ticks` },
                  message: `must have required property 'wall_time_tolerance_ticks'`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
              for (let e in t)
                if (!v.call(_.properties, e)) {
                  let t = {
                    instancePath: n + `/limits`,
                    schemaPath: `#/$defs/RunLimits/additionalProperties`,
                    keyword: `additionalProperties`,
                    params: { additionalProperty: e },
                    message: `must NOT have additional properties`,
                  };
                  (l === null ? (l = [t]) : l.push(t), u++);
                }
              if (t.segment_ticks !== void 0) {
                let e = t.segment_ticks;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: n + `/limits/segment_ticks`,
                    schemaPath: `#/$defs/RunLimits/properties/segment_ticks/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
                if (e !== 3600) {
                  let e = {
                    instancePath: n + `/limits/segment_ticks`,
                    schemaPath: `#/$defs/RunLimits/properties/segment_ticks/const`,
                    keyword: `const`,
                    params: { allowedValue: 3600 },
                    message: `must be equal to constant`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
              }
              if (t.max_encoded_bytes !== void 0) {
                let e = t.max_encoded_bytes;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: n + `/limits/max_encoded_bytes`,
                    schemaPath: `#/$defs/RunLimits/properties/max_encoded_bytes/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
                if (e !== 262144) {
                  let e = {
                    instancePath: n + `/limits/max_encoded_bytes`,
                    schemaPath: `#/$defs/RunLimits/properties/max_encoded_bytes/const`,
                    keyword: `const`,
                    params: { allowedValue: 262144 },
                    message: `must be equal to constant`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
              }
              if (t.max_decoded_bytes !== void 0) {
                let e = t.max_decoded_bytes;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: n + `/limits/max_decoded_bytes`,
                    schemaPath: `#/$defs/RunLimits/properties/max_decoded_bytes/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
                if (e !== 1048576) {
                  let e = {
                    instancePath: n + `/limits/max_decoded_bytes`,
                    schemaPath: `#/$defs/RunLimits/properties/max_decoded_bytes/const`,
                    keyword: `const`,
                    params: { allowedValue: 1048576 },
                    message: `must be equal to constant`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
              }
              if (t.max_actions_per_tick !== void 0) {
                let e = t.max_actions_per_tick;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: n + `/limits/max_actions_per_tick`,
                    schemaPath: `#/$defs/RunLimits/properties/max_actions_per_tick/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
                if (e !== 2) {
                  let e = {
                    instancePath: n + `/limits/max_actions_per_tick`,
                    schemaPath: `#/$defs/RunLimits/properties/max_actions_per_tick/const`,
                    keyword: `const`,
                    params: { allowedValue: 2 },
                    message: `must be equal to constant`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
              }
              if (t.upload_grace_seconds !== void 0) {
                let e = t.upload_grace_seconds;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: n + `/limits/upload_grace_seconds`,
                    schemaPath: `#/$defs/RunLimits/properties/upload_grace_seconds/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
                if (e !== 86400) {
                  let e = {
                    instancePath: n + `/limits/upload_grace_seconds`,
                    schemaPath: `#/$defs/RunLimits/properties/upload_grace_seconds/const`,
                    keyword: `const`,
                    params: { allowedValue: 86400 },
                    message: `must be equal to constant`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
              }
              if (t.max_run_encoded_bytes !== void 0) {
                let e = t.max_run_encoded_bytes;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: n + `/limits/max_run_encoded_bytes`,
                    schemaPath: `#/$defs/RunLimits/properties/max_run_encoded_bytes/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/limits/max_run_encoded_bytes`,
                      schemaPath: `#/$defs/RunLimits/properties/max_run_encoded_bytes/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/limits/max_run_encoded_bytes`,
                      schemaPath: `#/$defs/RunLimits/properties/max_run_encoded_bytes/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                }
              }
              if (t.max_player_encoded_bytes !== void 0) {
                let e = t.max_player_encoded_bytes;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: n + `/limits/max_player_encoded_bytes`,
                    schemaPath: `#/$defs/RunLimits/properties/max_player_encoded_bytes/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/limits/max_player_encoded_bytes`,
                      schemaPath: `#/$defs/RunLimits/properties/max_player_encoded_bytes/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/limits/max_player_encoded_bytes`,
                      schemaPath: `#/$defs/RunLimits/properties/max_player_encoded_bytes/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                }
              }
              if (t.max_segments_per_run !== void 0) {
                let e = t.max_segments_per_run;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: n + `/limits/max_segments_per_run`,
                    schemaPath: `#/$defs/RunLimits/properties/max_segments_per_run/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/limits/max_segments_per_run`,
                      schemaPath: `#/$defs/RunLimits/properties/max_segments_per_run/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/limits/max_segments_per_run`,
                      schemaPath: `#/$defs/RunLimits/properties/max_segments_per_run/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                }
              }
              if (t.max_active_runs !== void 0) {
                let e = t.max_active_runs;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: n + `/limits/max_active_runs`,
                    schemaPath: `#/$defs/RunLimits/properties/max_active_runs/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/limits/max_active_runs`,
                      schemaPath: `#/$defs/RunLimits/properties/max_active_runs/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/limits/max_active_runs`,
                      schemaPath: `#/$defs/RunLimits/properties/max_active_runs/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                }
              }
              if (t.wall_time_tolerance_ticks !== void 0) {
                let e = t.wall_time_tolerance_ticks;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: n + `/limits/wall_time_tolerance_ticks`,
                    schemaPath: `#/$defs/RunLimits/properties/wall_time_tolerance_ticks/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (l === null ? (l = [e]) : l.push(e), u++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/limits/wall_time_tolerance_ticks`,
                      schemaPath: `#/$defs/RunLimits/properties/wall_time_tolerance_ticks/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: n + `/limits/wall_time_tolerance_ticks`,
                      schemaPath: `#/$defs/RunLimits/properties/wall_time_tolerance_ticks/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (l === null ? (l = [e]) : l.push(e), u++);
                  }
                }
              }
            } else {
              let e = {
                instancePath: n + `/limits`,
                schemaPath: `#/$defs/RunLimits/type`,
                keyword: `type`,
                params: { type: `object` },
                message: `must be object`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
          if (e.server_time !== void 0) {
            let t = e.server_time;
            if (typeof t == `string`) {
              if (!y.validate(t)) {
                let e = {
                  instancePath: n + `/server_time`,
                  schemaPath: `#/properties/server_time/format`,
                  keyword: `format`,
                  params: { format: `date-time` },
                  message: `must match format "date-time"`,
                };
                (l === null ? (l = [e]) : l.push(e), u++);
              }
            } else {
              let e = {
                instancePath: n + `/server_time`,
                schemaPath: `#/properties/server_time/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (l === null ? (l = [e]) : l.push(e), u++);
            }
          }
        } else {
          let e = {
            instancePath: n,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (l === null ? (l = [e]) : l.push(e), u++);
        }
        return ((S.errors = l), u === 0);
      }
      ((S.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.SegmentAck = C));
      function C(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: a = e,
          dynamicAnchors: o = {},
        } = {},
      ) {
        let s = null,
          c = 0,
          l = C.evaluated;
        if (
          (l.dynamicProps && (l.props = void 0),
          l.dynamicItems && (l.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.run_id === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `run_id` },
              message: `must have required property 'run_id'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.index === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `index` },
              message: `must have required property 'index'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.segment_hash === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `segment_hash` },
              message: `must have required property 'segment_hash'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.persisted === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `persisted` },
              message: `must have required property 'persisted'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          for (let n in e)
            if (
              n !== `run_id` &&
              n !== `index` &&
              n !== `segment_hash` &&
              n !== `persisted`
            ) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          if (e.run_id !== void 0) {
            let n = e.run_id;
            if (typeof n == `string`) {
              if (!i.test(n)) {
                let e = {
                  instancePath: t + `/run_id`,
                  schemaPath: `#/properties/run_id/format`,
                  keyword: `format`,
                  params: { format: `uuid` },
                  message: `must match format "uuid"`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/run_id`,
                schemaPath: `#/properties/run_id/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.index !== void 0) {
            let n = e.index;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/index`,
                schemaPath: `#/properties/index/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n) && (n < 0 || isNaN(n))) {
              let e = {
                instancePath: t + `/index`,
                schemaPath: `#/properties/index/minimum`,
                keyword: `minimum`,
                params: { comparison: `>=`, limit: 0 },
                message: `must be >= 0`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.segment_hash !== void 0) {
            let n = e.segment_hash;
            if (typeof n == `string`) {
              if (!x.test(n)) {
                let e = {
                  instancePath: t + `/segment_hash`,
                  schemaPath: `#/properties/segment_hash/pattern`,
                  keyword: `pattern`,
                  params: { pattern: `^[a-f0-9]{64}$` },
                  message: `must match pattern "^[a-f0-9]{64}$"`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/segment_hash`,
                schemaPath: `#/properties/segment_hash/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.persisted !== void 0) {
            let n = e.persisted;
            if (typeof n != `boolean`) {
              let e = {
                instancePath: t + `/persisted`,
                schemaPath: `#/properties/persisted/type`,
                keyword: `type`,
                params: { type: `boolean` },
                message: `must be boolean`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (!0 !== n) {
              let e = {
                instancePath: t + `/persisted`,
                schemaPath: `#/properties/persisted/const`,
                keyword: `const`,
                params: { allowedValue: !0 },
                message: `must be equal to constant`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (s === null ? (s = [e]) : s.push(e), c++);
        }
        return ((C.errors = s), c === 0);
      }
      ((C.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.RunStatus = E));
      let w = {
          type: `object`,
          required: [`run_id`, `status`],
          properties: {
            run_id: { type: `string`, format: `uuid` },
            status: {
              type: `string`,
              enum: [
                `CREATED`,
                `ACTIVE`,
                `AWAITING_SEGMENTS`,
                `PENDING`,
                `VERIFYING`,
                `VERIFIED`,
                `REJECTED`,
                `ABANDONED`,
                `EXPIRED`,
              ],
            },
            score: { type: [`string`, `null`], pattern: `^(0|[1-9][0-9]*)$` },
            distance_m: { type: [`integer`, `null`], minimum: 0 },
            verified_at: { type: [`string`, `null`], format: `date-time` },
            rejection_code: { type: [`string`, `null`] },
            end_reason: {
              type: [`string`, `null`],
              enum: [`HP_ZERO`, `ABYSS`, `QUIT`, null],
            },
            ranked: { type: [`boolean`, `null`] },
            expires_at: { type: `string`, format: `date-time` },
            upload_deadline: { type: [`string`, `null`], format: `date-time` },
            submitted_complete_at: {
              type: [`string`, `null`],
              format: `date-time`,
            },
          },
          additionalProperties: !1,
          allOf: [
            {
              if: { properties: { status: { const: `VERIFIED` } } },
              then: {
                required: [
                  `score`,
                  `distance_m`,
                  `verified_at`,
                  `end_reason`,
                  `ranked`,
                ],
                properties: {
                  score: { type: `string` },
                  distance_m: { type: `integer` },
                  verified_at: { type: `string` },
                  end_reason: { type: `string` },
                  ranked: { type: `boolean` },
                },
              },
              else: {
                properties: {
                  score: { type: `null` },
                  distance_m: { type: `null` },
                  verified_at: { type: `null` },
                  ranked: { type: `null` },
                },
              },
            },
            {
              if: {
                properties: { end_reason: { const: `QUIT` } },
                required: [`end_reason`],
              },
              then: { properties: { ranked: { enum: [!1, null] } } },
            },
          ],
        },
        T = RegExp(`^(0|[1-9][0-9]*)$`, `u`);
      function E(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: a = e,
          dynamicAnchors: o = {},
        } = {},
      ) {
        let s = null,
          c = 0,
          l = E.evaluated;
        (l.dynamicProps && (l.props = void 0),
          l.dynamicItems && (l.items = void 0));
        let u = c,
          d = !0,
          f = c;
        if (
          e &&
          typeof e == `object` &&
          !Array.isArray(e) &&
          e.status !== void 0 &&
          e.status !== `VERIFIED`
        ) {
          let e = {};
          (s === null ? (s = [e]) : s.push(e), c++);
        }
        var p = f === c;
        ((c = u), s !== null && (u ? (s.length = u) : (s = null)));
        let m;
        if (p) {
          let n = c;
          if (e && typeof e == `object` && !Array.isArray(e)) {
            if (e.score === void 0) {
              let e = {
                instancePath: t,
                schemaPath: `#/allOf/0/then/required`,
                keyword: `required`,
                params: { missingProperty: `score` },
                message: `must have required property 'score'`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (e.distance_m === void 0) {
              let e = {
                instancePath: t,
                schemaPath: `#/allOf/0/then/required`,
                keyword: `required`,
                params: { missingProperty: `distance_m` },
                message: `must have required property 'distance_m'`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (e.verified_at === void 0) {
              let e = {
                instancePath: t,
                schemaPath: `#/allOf/0/then/required`,
                keyword: `required`,
                params: { missingProperty: `verified_at` },
                message: `must have required property 'verified_at'`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (e.end_reason === void 0) {
              let e = {
                instancePath: t,
                schemaPath: `#/allOf/0/then/required`,
                keyword: `required`,
                params: { missingProperty: `end_reason` },
                message: `must have required property 'end_reason'`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (e.ranked === void 0) {
              let e = {
                instancePath: t,
                schemaPath: `#/allOf/0/then/required`,
                keyword: `required`,
                params: { missingProperty: `ranked` },
                message: `must have required property 'ranked'`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (e.score !== void 0 && typeof e.score != `string`) {
              let e = {
                instancePath: t + `/score`,
                schemaPath: `#/allOf/0/then/properties/score/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (e.distance_m !== void 0) {
              let n = e.distance_m;
              if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
                let e = {
                  instancePath: t + `/distance_m`,
                  schemaPath: `#/allOf/0/then/properties/distance_m/type`,
                  keyword: `type`,
                  params: { type: `integer` },
                  message: `must be integer`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
            }
            if (e.verified_at !== void 0 && typeof e.verified_at != `string`) {
              let e = {
                instancePath: t + `/verified_at`,
                schemaPath: `#/allOf/0/then/properties/verified_at/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (e.end_reason !== void 0 && typeof e.end_reason != `string`) {
              let e = {
                instancePath: t + `/end_reason`,
                schemaPath: `#/allOf/0/then/properties/end_reason/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (e.ranked !== void 0 && typeof e.ranked != `boolean`) {
              let e = {
                instancePath: t + `/ranked`,
                schemaPath: `#/allOf/0/then/properties/ranked/type`,
                keyword: `type`,
                params: { type: `boolean` },
                message: `must be boolean`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          var p = n === c;
          if (((d = p), d)) {
            var h = {};
            ((h.score = !0),
              (h.distance_m = !0),
              (h.verified_at = !0),
              (h.end_reason = !0),
              (h.ranked = !0),
              (h.status = !0));
          }
          m = `then`;
        } else {
          let n = c;
          if (e && typeof e == `object` && !Array.isArray(e)) {
            if (e.score !== void 0 && e.score !== null) {
              let e = {
                instancePath: t + `/score`,
                schemaPath: `#/allOf/0/else/properties/score/type`,
                keyword: `type`,
                params: { type: `null` },
                message: `must be null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (e.distance_m !== void 0 && e.distance_m !== null) {
              let e = {
                instancePath: t + `/distance_m`,
                schemaPath: `#/allOf/0/else/properties/distance_m/type`,
                keyword: `type`,
                params: { type: `null` },
                message: `must be null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (e.verified_at !== void 0 && e.verified_at !== null) {
              let e = {
                instancePath: t + `/verified_at`,
                schemaPath: `#/allOf/0/else/properties/verified_at/type`,
                keyword: `type`,
                params: { type: `null` },
                message: `must be null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (e.ranked !== void 0 && e.ranked !== null) {
              let e = {
                instancePath: t + `/ranked`,
                schemaPath: `#/allOf/0/else/properties/ranked/type`,
                keyword: `type`,
                params: { type: `null` },
                message: `must be null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          var p = n === c;
          ((d = p),
            d &&
              h !== !0 &&
              ((h ||= {}),
              (h.score = !0),
              (h.distance_m = !0),
              (h.verified_at = !0),
              (h.ranked = !0)),
            (m = `else`));
        }
        if (!d) {
          let e = {
            instancePath: t,
            schemaPath: `#/allOf/0/if`,
            keyword: `if`,
            params: { failingKeyword: m },
            message: `must match "` + m + `" schema`,
          };
          (s === null ? (s = [e]) : s.push(e), c++);
        }
        let g = c,
          _ = !0,
          b = c;
        if (e && typeof e == `object` && !Array.isArray(e)) {
          if (e.end_reason === void 0) {
            let e = {};
            (s === null ? (s = [e]) : s.push(e), c++);
          } else if (e.end_reason !== void 0 && e.end_reason !== `QUIT`) {
            let e = {};
            (s === null ? (s = [e]) : s.push(e), c++);
          }
        }
        var x = b === c;
        if (((c = g), s !== null && (g ? (s.length = g) : (s = null)), x)) {
          let n = c;
          if (
            e &&
            typeof e == `object` &&
            !Array.isArray(e) &&
            e.ranked !== void 0
          ) {
            let n = e.ranked;
            if (n !== !1 && n !== null) {
              let e = {
                instancePath: t + `/ranked`,
                schemaPath: `#/allOf/1/then/properties/ranked/enum`,
                keyword: `enum`,
                params: {
                  allowedValues: w.allOf[1].then.properties.ranked.enum,
                },
                message: `must be equal to one of the allowed values`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          var x = n === c;
          if (((_ = x), _)) {
            var S = {};
            ((S.ranked = !0), (S.end_reason = !0));
          }
        }
        if (!_) {
          let e = {
            instancePath: t,
            schemaPath: `#/allOf/1/if`,
            keyword: `if`,
            params: { failingKeyword: `then` },
            message: `must match "then" schema`,
          };
          (s === null ? (s = [e]) : s.push(e), c++);
        }
        if (
          (h !== !0 &&
            S !== void 0 &&
            (S === !0 ? (h = !0) : ((h ||= {}), Object.assign(h, S))),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.run_id === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `run_id` },
              message: `must have required property 'run_id'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.status === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `status` },
              message: `must have required property 'status'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          for (let n in e)
            if (!v.call(w.properties, n)) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          if (e.run_id !== void 0) {
            let n = e.run_id;
            if (typeof n == `string`) {
              if (!i.test(n)) {
                let e = {
                  instancePath: t + `/run_id`,
                  schemaPath: `#/properties/run_id/format`,
                  keyword: `format`,
                  params: { format: `uuid` },
                  message: `must match format "uuid"`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/run_id`,
                schemaPath: `#/properties/run_id/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.status !== void 0) {
            let n = e.status;
            if (typeof n != `string`) {
              let e = {
                instancePath: t + `/status`,
                schemaPath: `#/properties/status/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (
              n !== `CREATED` &&
              n !== `ACTIVE` &&
              n !== `AWAITING_SEGMENTS` &&
              n !== `PENDING` &&
              n !== `VERIFYING` &&
              n !== `VERIFIED` &&
              n !== `REJECTED` &&
              n !== `ABANDONED` &&
              n !== `EXPIRED`
            ) {
              let e = {
                instancePath: t + `/status`,
                schemaPath: `#/properties/status/enum`,
                keyword: `enum`,
                params: { allowedValues: w.properties.status.enum },
                message: `must be equal to one of the allowed values`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.score !== void 0) {
            let n = e.score;
            if (typeof n != `string` && n !== null) {
              let e = {
                instancePath: t + `/score`,
                schemaPath: `#/properties/score/type`,
                keyword: `type`,
                params: { type: w.properties.score.type },
                message: `must be string,null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `string` && !T.test(n)) {
              let e = {
                instancePath: t + `/score`,
                schemaPath: `#/properties/score/pattern`,
                keyword: `pattern`,
                params: { pattern: `^(0|[1-9][0-9]*)$` },
                message: `must match pattern "^(0|[1-9][0-9]*)$"`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.distance_m !== void 0) {
            let n = e.distance_m;
            if (
              (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) &&
              n !== null
            ) {
              let e = {
                instancePath: t + `/distance_m`,
                schemaPath: `#/properties/distance_m/type`,
                keyword: `type`,
                params: { type: w.properties.distance_m.type },
                message: `must be integer,null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n) && (n < 0 || isNaN(n))) {
              let e = {
                instancePath: t + `/distance_m`,
                schemaPath: `#/properties/distance_m/minimum`,
                keyword: `minimum`,
                params: { comparison: `>=`, limit: 0 },
                message: `must be >= 0`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.verified_at !== void 0) {
            let n = e.verified_at;
            if (typeof n != `string` && n !== null) {
              let e = {
                instancePath: t + `/verified_at`,
                schemaPath: `#/properties/verified_at/type`,
                keyword: `type`,
                params: { type: w.properties.verified_at.type },
                message: `must be string,null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `string` && !y.validate(n)) {
              let e = {
                instancePath: t + `/verified_at`,
                schemaPath: `#/properties/verified_at/format`,
                keyword: `format`,
                params: { format: `date-time` },
                message: `must match format "date-time"`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.rejection_code !== void 0) {
            let n = e.rejection_code;
            if (typeof n != `string` && n !== null) {
              let e = {
                instancePath: t + `/rejection_code`,
                schemaPath: `#/properties/rejection_code/type`,
                keyword: `type`,
                params: { type: w.properties.rejection_code.type },
                message: `must be string,null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.end_reason !== void 0) {
            let n = e.end_reason;
            if (typeof n != `string` && n !== null) {
              let e = {
                instancePath: t + `/end_reason`,
                schemaPath: `#/properties/end_reason/type`,
                keyword: `type`,
                params: { type: w.properties.end_reason.type },
                message: `must be string,null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (
              n !== `HP_ZERO` &&
              n !== `ABYSS` &&
              n !== `QUIT` &&
              n !== null
            ) {
              let e = {
                instancePath: t + `/end_reason`,
                schemaPath: `#/properties/end_reason/enum`,
                keyword: `enum`,
                params: { allowedValues: w.properties.end_reason.enum },
                message: `must be equal to one of the allowed values`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.ranked !== void 0) {
            let n = e.ranked;
            if (typeof n != `boolean` && n !== null) {
              let e = {
                instancePath: t + `/ranked`,
                schemaPath: `#/properties/ranked/type`,
                keyword: `type`,
                params: { type: w.properties.ranked.type },
                message: `must be boolean,null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.expires_at !== void 0) {
            let n = e.expires_at;
            if (typeof n == `string`) {
              if (!y.validate(n)) {
                let e = {
                  instancePath: t + `/expires_at`,
                  schemaPath: `#/properties/expires_at/format`,
                  keyword: `format`,
                  params: { format: `date-time` },
                  message: `must match format "date-time"`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/expires_at`,
                schemaPath: `#/properties/expires_at/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.upload_deadline !== void 0) {
            let n = e.upload_deadline;
            if (typeof n != `string` && n !== null) {
              let e = {
                instancePath: t + `/upload_deadline`,
                schemaPath: `#/properties/upload_deadline/type`,
                keyword: `type`,
                params: { type: w.properties.upload_deadline.type },
                message: `must be string,null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `string` && !y.validate(n)) {
              let e = {
                instancePath: t + `/upload_deadline`,
                schemaPath: `#/properties/upload_deadline/format`,
                keyword: `format`,
                params: { format: `date-time` },
                message: `must match format "date-time"`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.submitted_complete_at !== void 0) {
            let n = e.submitted_complete_at;
            if (typeof n != `string` && n !== null) {
              let e = {
                instancePath: t + `/submitted_complete_at`,
                schemaPath: `#/properties/submitted_complete_at/type`,
                keyword: `type`,
                params: { type: w.properties.submitted_complete_at.type },
                message: `must be string,null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `string` && !y.validate(n)) {
              let e = {
                instancePath: t + `/submitted_complete_at`,
                schemaPath: `#/properties/submitted_complete_at/format`,
                keyword: `format`,
                params: { format: `date-time` },
                message: `must match format "date-time"`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (s === null ? (s = [e]) : s.push(e), c++);
        }
        return ((E.errors = s), c === 0);
      }
      ((E.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.LeaderboardEntry = D));
      function D(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: a = e,
          dynamicAnchors: o = {},
        } = {},
      ) {
        let s = null,
          c = 0,
          l = D.evaluated;
        if (
          (l.dynamicProps && (l.props = void 0),
          l.dynamicItems && (l.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.rank === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `rank` },
              message: `must have required property 'rank'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.public_name === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `public_name` },
              message: `must have required property 'public_name'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.score === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `score` },
              message: `must have required property 'score'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.distance_m === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `distance_m` },
              message: `must have required property 'distance_m'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.rules_major === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `rules_major` },
              message: `must have required property 'rules_major'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.rank !== void 0) {
            let n = e.rank;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/rank`,
                schemaPath: `#/properties/rank/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n) && (n < 1 || isNaN(n))) {
              let e = {
                instancePath: t + `/rank`,
                schemaPath: `#/properties/rank/minimum`,
                keyword: `minimum`,
                params: { comparison: `>=`, limit: 1 },
                message: `must be >= 1`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.player_id !== void 0) {
            let n = e.player_id;
            if (typeof n == `string`) {
              if (!i.test(n)) {
                let e = {
                  instancePath: t + `/player_id`,
                  schemaPath: `#/properties/player_id/format`,
                  keyword: `format`,
                  params: { format: `uuid` },
                  message: `must match format "uuid"`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/player_id`,
                schemaPath: `#/properties/player_id/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.public_name !== void 0 && typeof e.public_name != `string`) {
            let e = {
              instancePath: t + `/public_name`,
              schemaPath: `#/properties/public_name/type`,
              keyword: `type`,
              params: { type: `string` },
              message: `must be string`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.avatar_parts !== void 0) {
            let n = e.avatar_parts;
            if (n && typeof n == `object` && !Array.isArray(n)) {
              for (let e in n)
                if (typeof n[e] != `string`) {
                  let n = {
                    instancePath:
                      t +
                      `/avatar_parts/` +
                      e.replace(/~/g, `~0`).replace(/\//g, `~1`),
                    schemaPath: `#/properties/avatar_parts/additionalProperties/type`,
                    keyword: `type`,
                    params: { type: `string` },
                    message: `must be string`,
                  };
                  (s === null ? (s = [n]) : s.push(n), c++);
                }
            } else {
              let e = {
                instancePath: t + `/avatar_parts`,
                schemaPath: `#/properties/avatar_parts/type`,
                keyword: `type`,
                params: { type: `object` },
                message: `must be object`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.score !== void 0 && typeof e.score != `string`) {
            let e = {
              instancePath: t + `/score`,
              schemaPath: `#/properties/score/type`,
              keyword: `type`,
              params: { type: `string` },
              message: `must be string`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.distance_m !== void 0) {
            let n = e.distance_m;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/distance_m`,
                schemaPath: `#/properties/distance_m/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n) && (n < 0 || isNaN(n))) {
              let e = {
                instancePath: t + `/distance_m`,
                schemaPath: `#/properties/distance_m/minimum`,
                keyword: `minimum`,
                params: { comparison: `>=`, limit: 0 },
                message: `must be >= 0`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.rules_major !== void 0) {
            let n = e.rules_major;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/rules_major`,
                schemaPath: `#/properties/rules_major/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n) && (n < 1 || isNaN(n))) {
              let e = {
                instancePath: t + `/rules_major`,
                schemaPath: `#/properties/rules_major/minimum`,
                keyword: `minimum`,
                params: { comparison: `>=`, limit: 1 },
                message: `must be >= 1`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (s === null ? (s = [e]) : s.push(e), c++);
        }
        return ((D.errors = s), c === 0);
      }
      ((D.evaluated = {
        props: {
          rank: !0,
          player_id: !0,
          public_name: !0,
          avatar_parts: !0,
          score: !0,
          distance_m: !0,
          rules_major: !0,
        },
        dynamicProps: !1,
        dynamicItems: !1,
      }),
        (e.LeaderboardPage = k));
      let O = {
        type: `object`,
        required: [`entries`, `rules_major`],
        properties: {
          entries: {
            type: `array`,
            items: { $ref: `#/$defs/LeaderboardEntry` },
          },
          next_cursor: { type: [`string`, `null`] },
          rules_major: { type: `integer`, minimum: 1 },
        },
      };
      function k(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: a = e,
          dynamicAnchors: o = {},
        } = {},
      ) {
        let s = null,
          c = 0,
          l = k.evaluated;
        if (
          (l.dynamicProps && (l.props = void 0),
          l.dynamicItems && (l.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.entries === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `entries` },
              message: `must have required property 'entries'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.rules_major === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `rules_major` },
              message: `must have required property 'rules_major'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.entries !== void 0) {
            let n = e.entries;
            if (Array.isArray(n)) {
              let e = n.length;
              for (let r = 0; r < e; r++) {
                let e = n[r];
                if (e && typeof e == `object` && !Array.isArray(e)) {
                  if (e.rank === void 0) {
                    let e = {
                      instancePath: t + `/entries/` + r,
                      schemaPath: `#/$defs/LeaderboardEntry/required`,
                      keyword: `required`,
                      params: { missingProperty: `rank` },
                      message: `must have required property 'rank'`,
                    };
                    (s === null ? (s = [e]) : s.push(e), c++);
                  }
                  if (e.public_name === void 0) {
                    let e = {
                      instancePath: t + `/entries/` + r,
                      schemaPath: `#/$defs/LeaderboardEntry/required`,
                      keyword: `required`,
                      params: { missingProperty: `public_name` },
                      message: `must have required property 'public_name'`,
                    };
                    (s === null ? (s = [e]) : s.push(e), c++);
                  }
                  if (e.score === void 0) {
                    let e = {
                      instancePath: t + `/entries/` + r,
                      schemaPath: `#/$defs/LeaderboardEntry/required`,
                      keyword: `required`,
                      params: { missingProperty: `score` },
                      message: `must have required property 'score'`,
                    };
                    (s === null ? (s = [e]) : s.push(e), c++);
                  }
                  if (e.distance_m === void 0) {
                    let e = {
                      instancePath: t + `/entries/` + r,
                      schemaPath: `#/$defs/LeaderboardEntry/required`,
                      keyword: `required`,
                      params: { missingProperty: `distance_m` },
                      message: `must have required property 'distance_m'`,
                    };
                    (s === null ? (s = [e]) : s.push(e), c++);
                  }
                  if (e.rules_major === void 0) {
                    let e = {
                      instancePath: t + `/entries/` + r,
                      schemaPath: `#/$defs/LeaderboardEntry/required`,
                      keyword: `required`,
                      params: { missingProperty: `rules_major` },
                      message: `must have required property 'rules_major'`,
                    };
                    (s === null ? (s = [e]) : s.push(e), c++);
                  }
                  if (e.rank !== void 0) {
                    let n = e.rank;
                    if (
                      typeof n != `number` ||
                      n % 1 ||
                      isNaN(n) ||
                      !isFinite(n)
                    ) {
                      let e = {
                        instancePath: t + `/entries/` + r + `/rank`,
                        schemaPath: `#/$defs/LeaderboardEntry/properties/rank/type`,
                        keyword: `type`,
                        params: { type: `integer` },
                        message: `must be integer`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                    if (
                      typeof n == `number` &&
                      isFinite(n) &&
                      (n < 1 || isNaN(n))
                    ) {
                      let e = {
                        instancePath: t + `/entries/` + r + `/rank`,
                        schemaPath: `#/$defs/LeaderboardEntry/properties/rank/minimum`,
                        keyword: `minimum`,
                        params: { comparison: `>=`, limit: 1 },
                        message: `must be >= 1`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                  }
                  if (e.player_id !== void 0) {
                    let n = e.player_id;
                    if (typeof n == `string`) {
                      if (!i.test(n)) {
                        let e = {
                          instancePath: t + `/entries/` + r + `/player_id`,
                          schemaPath: `#/$defs/LeaderboardEntry/properties/player_id/format`,
                          keyword: `format`,
                          params: { format: `uuid` },
                          message: `must match format "uuid"`,
                        };
                        (s === null ? (s = [e]) : s.push(e), c++);
                      }
                    } else {
                      let e = {
                        instancePath: t + `/entries/` + r + `/player_id`,
                        schemaPath: `#/$defs/LeaderboardEntry/properties/player_id/type`,
                        keyword: `type`,
                        params: { type: `string` },
                        message: `must be string`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                  }
                  if (
                    e.public_name !== void 0 &&
                    typeof e.public_name != `string`
                  ) {
                    let e = {
                      instancePath: t + `/entries/` + r + `/public_name`,
                      schemaPath: `#/$defs/LeaderboardEntry/properties/public_name/type`,
                      keyword: `type`,
                      params: { type: `string` },
                      message: `must be string`,
                    };
                    (s === null ? (s = [e]) : s.push(e), c++);
                  }
                  if (e.avatar_parts !== void 0) {
                    let n = e.avatar_parts;
                    if (n && typeof n == `object` && !Array.isArray(n)) {
                      for (let e in n)
                        if (typeof n[e] != `string`) {
                          let n = {
                            instancePath:
                              t +
                              `/entries/` +
                              r +
                              `/avatar_parts/` +
                              e.replace(/~/g, `~0`).replace(/\//g, `~1`),
                            schemaPath: `#/$defs/LeaderboardEntry/properties/avatar_parts/additionalProperties/type`,
                            keyword: `type`,
                            params: { type: `string` },
                            message: `must be string`,
                          };
                          (s === null ? (s = [n]) : s.push(n), c++);
                        }
                    } else {
                      let e = {
                        instancePath: t + `/entries/` + r + `/avatar_parts`,
                        schemaPath: `#/$defs/LeaderboardEntry/properties/avatar_parts/type`,
                        keyword: `type`,
                        params: { type: `object` },
                        message: `must be object`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                  }
                  if (e.score !== void 0 && typeof e.score != `string`) {
                    let e = {
                      instancePath: t + `/entries/` + r + `/score`,
                      schemaPath: `#/$defs/LeaderboardEntry/properties/score/type`,
                      keyword: `type`,
                      params: { type: `string` },
                      message: `must be string`,
                    };
                    (s === null ? (s = [e]) : s.push(e), c++);
                  }
                  if (e.distance_m !== void 0) {
                    let n = e.distance_m;
                    if (
                      typeof n != `number` ||
                      n % 1 ||
                      isNaN(n) ||
                      !isFinite(n)
                    ) {
                      let e = {
                        instancePath: t + `/entries/` + r + `/distance_m`,
                        schemaPath: `#/$defs/LeaderboardEntry/properties/distance_m/type`,
                        keyword: `type`,
                        params: { type: `integer` },
                        message: `must be integer`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                    if (
                      typeof n == `number` &&
                      isFinite(n) &&
                      (n < 0 || isNaN(n))
                    ) {
                      let e = {
                        instancePath: t + `/entries/` + r + `/distance_m`,
                        schemaPath: `#/$defs/LeaderboardEntry/properties/distance_m/minimum`,
                        keyword: `minimum`,
                        params: { comparison: `>=`, limit: 0 },
                        message: `must be >= 0`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                  }
                  if (e.rules_major !== void 0) {
                    let n = e.rules_major;
                    if (
                      typeof n != `number` ||
                      n % 1 ||
                      isNaN(n) ||
                      !isFinite(n)
                    ) {
                      let e = {
                        instancePath: t + `/entries/` + r + `/rules_major`,
                        schemaPath: `#/$defs/LeaderboardEntry/properties/rules_major/type`,
                        keyword: `type`,
                        params: { type: `integer` },
                        message: `must be integer`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                    if (
                      typeof n == `number` &&
                      isFinite(n) &&
                      (n < 1 || isNaN(n))
                    ) {
                      let e = {
                        instancePath: t + `/entries/` + r + `/rules_major`,
                        schemaPath: `#/$defs/LeaderboardEntry/properties/rules_major/minimum`,
                        keyword: `minimum`,
                        params: { comparison: `>=`, limit: 1 },
                        message: `must be >= 1`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                  }
                } else {
                  let e = {
                    instancePath: t + `/entries/` + r,
                    schemaPath: `#/$defs/LeaderboardEntry/type`,
                    keyword: `type`,
                    params: { type: `object` },
                    message: `must be object`,
                  };
                  (s === null ? (s = [e]) : s.push(e), c++);
                }
              }
            } else {
              let e = {
                instancePath: t + `/entries`,
                schemaPath: `#/properties/entries/type`,
                keyword: `type`,
                params: { type: `array` },
                message: `must be array`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.next_cursor !== void 0) {
            let n = e.next_cursor;
            if (typeof n != `string` && n !== null) {
              let e = {
                instancePath: t + `/next_cursor`,
                schemaPath: `#/properties/next_cursor/type`,
                keyword: `type`,
                params: { type: O.properties.next_cursor.type },
                message: `must be string,null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.rules_major !== void 0) {
            let n = e.rules_major;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/rules_major`,
                schemaPath: `#/properties/rules_major/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n) && (n < 1 || isNaN(n))) {
              let e = {
                instancePath: t + `/rules_major`,
                schemaPath: `#/properties/rules_major/minimum`,
                keyword: `minimum`,
                params: { comparison: `>=`, limit: 1 },
                message: `must be >= 1`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (s === null ? (s = [e]) : s.push(e), c++);
        }
        return ((k.errors = s), c === 0);
      }
      ((k.evaluated = {
        props: { entries: !0, next_cursor: !0, rules_major: !0 },
        dynamicProps: !1,
        dynamicItems: !1,
      }),
        (e.WeeklyEdition = j));
      let A = {
        type: `object`,
        required: [`week_id`, `starts_at`, `ends_at`, `challenges`],
        properties: {
          week_id: { type: `string` },
          starts_at: { type: `string`, format: `date-time` },
          ends_at: { type: `string`, format: `date-time` },
          challenges: {
            type: `array`,
            minItems: 5,
            maxItems: 5,
            items: {
              type: `object`,
              required: [
                `challenge_id`,
                `tier`,
                `metric`,
                `target`,
                `locale_key`,
              ],
              properties: {
                challenge_id: { type: `string` },
                tier: { type: `string`, enum: [`EASY`, `MEDIUM`, `HARD`] },
                metric: { type: `string` },
                target: { type: `integer`, minimum: 1 },
                locale_key: { type: `string` },
              },
            },
          },
        },
      };
      function j(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          s = 0,
          c = j.evaluated;
        if (
          (c.dynamicProps && (c.props = void 0),
          c.dynamicItems && (c.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.week_id === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `week_id` },
              message: `must have required property 'week_id'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.starts_at === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `starts_at` },
              message: `must have required property 'starts_at'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.ends_at === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `ends_at` },
              message: `must have required property 'ends_at'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.challenges === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `challenges` },
              message: `must have required property 'challenges'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.week_id !== void 0 && typeof e.week_id != `string`) {
            let e = {
              instancePath: t + `/week_id`,
              schemaPath: `#/properties/week_id/type`,
              keyword: `type`,
              params: { type: `string` },
              message: `must be string`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.starts_at !== void 0) {
            let n = e.starts_at;
            if (typeof n == `string`) {
              if (!y.validate(n)) {
                let e = {
                  instancePath: t + `/starts_at`,
                  schemaPath: `#/properties/starts_at/format`,
                  keyword: `format`,
                  params: { format: `date-time` },
                  message: `must match format "date-time"`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            } else {
              let e = {
                instancePath: t + `/starts_at`,
                schemaPath: `#/properties/starts_at/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          if (e.ends_at !== void 0) {
            let n = e.ends_at;
            if (typeof n == `string`) {
              if (!y.validate(n)) {
                let e = {
                  instancePath: t + `/ends_at`,
                  schemaPath: `#/properties/ends_at/format`,
                  keyword: `format`,
                  params: { format: `date-time` },
                  message: `must match format "date-time"`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            } else {
              let e = {
                instancePath: t + `/ends_at`,
                schemaPath: `#/properties/ends_at/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          if (e.challenges !== void 0) {
            let n = e.challenges;
            if (Array.isArray(n)) {
              if (n.length > 5) {
                let e = {
                  instancePath: t + `/challenges`,
                  schemaPath: `#/properties/challenges/maxItems`,
                  keyword: `maxItems`,
                  params: { limit: 5 },
                  message: `must NOT have more than 5 items`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n.length < 5) {
                let e = {
                  instancePath: t + `/challenges`,
                  schemaPath: `#/properties/challenges/minItems`,
                  keyword: `minItems`,
                  params: { limit: 5 },
                  message: `must NOT have fewer than 5 items`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              let e = n.length;
              for (let r = 0; r < e; r++) {
                let e = n[r];
                if (e && typeof e == `object` && !Array.isArray(e)) {
                  if (e.challenge_id === void 0) {
                    let e = {
                      instancePath: t + `/challenges/` + r,
                      schemaPath: `#/properties/challenges/items/required`,
                      keyword: `required`,
                      params: { missingProperty: `challenge_id` },
                      message: `must have required property 'challenge_id'`,
                    };
                    (o === null ? (o = [e]) : o.push(e), s++);
                  }
                  if (e.tier === void 0) {
                    let e = {
                      instancePath: t + `/challenges/` + r,
                      schemaPath: `#/properties/challenges/items/required`,
                      keyword: `required`,
                      params: { missingProperty: `tier` },
                      message: `must have required property 'tier'`,
                    };
                    (o === null ? (o = [e]) : o.push(e), s++);
                  }
                  if (e.metric === void 0) {
                    let e = {
                      instancePath: t + `/challenges/` + r,
                      schemaPath: `#/properties/challenges/items/required`,
                      keyword: `required`,
                      params: { missingProperty: `metric` },
                      message: `must have required property 'metric'`,
                    };
                    (o === null ? (o = [e]) : o.push(e), s++);
                  }
                  if (e.target === void 0) {
                    let e = {
                      instancePath: t + `/challenges/` + r,
                      schemaPath: `#/properties/challenges/items/required`,
                      keyword: `required`,
                      params: { missingProperty: `target` },
                      message: `must have required property 'target'`,
                    };
                    (o === null ? (o = [e]) : o.push(e), s++);
                  }
                  if (e.locale_key === void 0) {
                    let e = {
                      instancePath: t + `/challenges/` + r,
                      schemaPath: `#/properties/challenges/items/required`,
                      keyword: `required`,
                      params: { missingProperty: `locale_key` },
                      message: `must have required property 'locale_key'`,
                    };
                    (o === null ? (o = [e]) : o.push(e), s++);
                  }
                  if (
                    e.challenge_id !== void 0 &&
                    typeof e.challenge_id != `string`
                  ) {
                    let e = {
                      instancePath: t + `/challenges/` + r + `/challenge_id`,
                      schemaPath: `#/properties/challenges/items/properties/challenge_id/type`,
                      keyword: `type`,
                      params: { type: `string` },
                      message: `must be string`,
                    };
                    (o === null ? (o = [e]) : o.push(e), s++);
                  }
                  if (e.tier !== void 0) {
                    let n = e.tier;
                    if (typeof n != `string`) {
                      let e = {
                        instancePath: t + `/challenges/` + r + `/tier`,
                        schemaPath: `#/properties/challenges/items/properties/tier/type`,
                        keyword: `type`,
                        params: { type: `string` },
                        message: `must be string`,
                      };
                      (o === null ? (o = [e]) : o.push(e), s++);
                    }
                    if (n !== `EASY` && n !== `MEDIUM` && n !== `HARD`) {
                      let e = {
                        instancePath: t + `/challenges/` + r + `/tier`,
                        schemaPath: `#/properties/challenges/items/properties/tier/enum`,
                        keyword: `enum`,
                        params: {
                          allowedValues:
                            A.properties.challenges.items.properties.tier.enum,
                        },
                        message: `must be equal to one of the allowed values`,
                      };
                      (o === null ? (o = [e]) : o.push(e), s++);
                    }
                  }
                  if (e.metric !== void 0 && typeof e.metric != `string`) {
                    let e = {
                      instancePath: t + `/challenges/` + r + `/metric`,
                      schemaPath: `#/properties/challenges/items/properties/metric/type`,
                      keyword: `type`,
                      params: { type: `string` },
                      message: `must be string`,
                    };
                    (o === null ? (o = [e]) : o.push(e), s++);
                  }
                  if (e.target !== void 0) {
                    let n = e.target;
                    if (
                      typeof n != `number` ||
                      n % 1 ||
                      isNaN(n) ||
                      !isFinite(n)
                    ) {
                      let e = {
                        instancePath: t + `/challenges/` + r + `/target`,
                        schemaPath: `#/properties/challenges/items/properties/target/type`,
                        keyword: `type`,
                        params: { type: `integer` },
                        message: `must be integer`,
                      };
                      (o === null ? (o = [e]) : o.push(e), s++);
                    }
                    if (
                      typeof n == `number` &&
                      isFinite(n) &&
                      (n < 1 || isNaN(n))
                    ) {
                      let e = {
                        instancePath: t + `/challenges/` + r + `/target`,
                        schemaPath: `#/properties/challenges/items/properties/target/minimum`,
                        keyword: `minimum`,
                        params: { comparison: `>=`, limit: 1 },
                        message: `must be >= 1`,
                      };
                      (o === null ? (o = [e]) : o.push(e), s++);
                    }
                  }
                  if (
                    e.locale_key !== void 0 &&
                    typeof e.locale_key != `string`
                  ) {
                    let e = {
                      instancePath: t + `/challenges/` + r + `/locale_key`,
                      schemaPath: `#/properties/challenges/items/properties/locale_key/type`,
                      keyword: `type`,
                      params: { type: `string` },
                      message: `must be string`,
                    };
                    (o === null ? (o = [e]) : o.push(e), s++);
                  }
                } else {
                  let e = {
                    instancePath: t + `/challenges/` + r,
                    schemaPath: `#/properties/challenges/items/type`,
                    keyword: `type`,
                    params: { type: `object` },
                    message: `must be object`,
                  };
                  (o === null ? (o = [e]) : o.push(e), s++);
                }
              }
            } else {
              let e = {
                instancePath: t + `/challenges`,
                schemaPath: `#/properties/challenges/type`,
                keyword: `type`,
                params: { type: `array` },
                message: `must be array`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), s++);
        }
        return ((j.errors = o), s === 0);
      }
      ((j.evaluated = {
        props: { week_id: !0, starts_at: !0, ends_at: !0, challenges: !0 },
        dynamicProps: !1,
        dynamicItems: !1,
      }),
        (e.ApiError = M));
      function M(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          s = 0,
          c = M.evaluated;
        if (
          (c.dynamicProps && (c.props = void 0),
          c.dynamicItems && (c.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.error === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `error` },
              message: `must have required property 'error'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.error !== void 0) {
            let n = e.error;
            if (n && typeof n == `object` && !Array.isArray(n)) {
              if (n.code === void 0) {
                let e = {
                  instancePath: t + `/error`,
                  schemaPath: `#/properties/error/required`,
                  keyword: `required`,
                  params: { missingProperty: `code` },
                  message: `must have required property 'code'`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n.message_key === void 0) {
                let e = {
                  instancePath: t + `/error`,
                  schemaPath: `#/properties/error/required`,
                  keyword: `required`,
                  params: { missingProperty: `message_key` },
                  message: `must have required property 'message_key'`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n.request_id === void 0) {
                let e = {
                  instancePath: t + `/error`,
                  schemaPath: `#/properties/error/required`,
                  keyword: `required`,
                  params: { missingProperty: `request_id` },
                  message: `must have required property 'request_id'`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n.code !== void 0 && typeof n.code != `string`) {
                let e = {
                  instancePath: t + `/error/code`,
                  schemaPath: `#/properties/error/properties/code/type`,
                  keyword: `type`,
                  params: { type: `string` },
                  message: `must be string`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (
                n.message_key !== void 0 &&
                typeof n.message_key != `string`
              ) {
                let e = {
                  instancePath: t + `/error/message_key`,
                  schemaPath: `#/properties/error/properties/message_key/type`,
                  keyword: `type`,
                  params: { type: `string` },
                  message: `must be string`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n.request_id !== void 0 && typeof n.request_id != `string`) {
                let e = {
                  instancePath: t + `/error/request_id`,
                  schemaPath: `#/properties/error/properties/request_id/type`,
                  keyword: `type`,
                  params: { type: `string` },
                  message: `must be string`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n.details !== void 0) {
                let e = n.details;
                if (!e || typeof e != `object` || Array.isArray(e)) {
                  let e = {
                    instancePath: t + `/error/details`,
                    schemaPath: `#/properties/error/properties/details/type`,
                    keyword: `type`,
                    params: { type: `object` },
                    message: `must be object`,
                  };
                  (o === null ? (o = [e]) : o.push(e), s++);
                }
              }
            } else {
              let e = {
                instancePath: t + `/error`,
                schemaPath: `#/properties/error/type`,
                keyword: `type`,
                params: { type: `object` },
                message: `must be object`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), s++);
        }
        return ((M.errors = o), s === 0);
      }
      ((M.evaluated = {
        props: { error: !0 },
        dynamicProps: !1,
        dynamicItems: !1,
      }),
        (e.Health = N));
      function N(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          s = 0,
          c = N.evaluated;
        if (
          (c.dynamicProps && (c.props = void 0),
          c.dynamicItems && (c.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.status === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `status` },
              message: `must have required property 'status'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.service === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `service` },
              message: `must have required property 'service'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          for (let n in e)
            if (n !== `status` && n !== `service`) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          if (e.status !== void 0) {
            let n = e.status;
            if (typeof n != `string`) {
              let e = {
                instancePath: t + `/status`,
                schemaPath: `#/properties/status/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (n !== `ok`) {
              let e = {
                instancePath: t + `/status`,
                schemaPath: `#/properties/status/const`,
                keyword: `const`,
                params: { allowedValue: `ok` },
                message: `must be equal to constant`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          if (e.service !== void 0) {
            let n = e.service;
            if (typeof n != `string`) {
              let e = {
                instancePath: t + `/service`,
                schemaPath: `#/properties/service/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (n !== `ronin-play-api`) {
              let e = {
                instancePath: t + `/service`,
                schemaPath: `#/properties/service/const`,
                keyword: `const`,
                params: { allowedValue: `ronin-play-api` },
                message: `must be equal to constant`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), s++);
        }
        return ((N.errors = o), s === 0);
      }
      ((N.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.RunStart = F));
      let P = {
        type: `object`,
        properties: {
          mode: { $ref: `#/$defs/RunMode` },
          region_id: {
            type: `string`,
            enum: [`BAMBOO`, `TEMPLE`, `MOUNTAINS`, `CASTLE`],
          },
        },
        required: [`mode`],
        additionalProperties: !1,
        oneOf: [
          { properties: { mode: { const: `FULL` }, region_id: !1 } },
          {
            properties: {
              mode: { const: `REGIONAL` },
              region_id: {
                type: `string`,
                enum: [`BAMBOO`, `TEMPLE`, `MOUNTAINS`, `CASTLE`],
              },
            },
            required: [`region_id`],
          },
        ],
      };
      function F(
        e,
        {
          instancePath: n = ``,
          parentData: r,
          parentDataProperty: i,
          rootData: a = e,
          dynamicAnchors: o = {},
        } = {},
      ) {
        let s = null,
          c = 0,
          l = F.evaluated;
        (l.dynamicProps && (l.props = void 0),
          l.dynamicItems && (l.items = void 0));
        let u = c,
          d = !1,
          f = null,
          p = c;
        if (e && typeof e == `object` && !Array.isArray(e)) {
          if (e.mode !== void 0 && e.mode !== `FULL`) {
            let e = {
              instancePath: n + `/mode`,
              schemaPath: `#/oneOf/0/properties/mode/const`,
              keyword: `const`,
              params: { allowedValue: `FULL` },
              message: `must be equal to constant`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.region_id !== void 0) {
            let e = {
              instancePath: n + `/region_id`,
              schemaPath: `#/oneOf/0/properties/region_id/false schema`,
              keyword: `false schema`,
              params: {},
              message: `boolean schema is false`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
        }
        var m = p === c;
        if (m) {
          ((d = !0), (f = 0));
          var h = {};
          ((h.mode = !0), (h.region_id = !0));
        }
        let g = c;
        if (e && typeof e == `object` && !Array.isArray(e)) {
          if (e.region_id === void 0) {
            let e = {
              instancePath: n,
              schemaPath: `#/oneOf/1/required`,
              keyword: `required`,
              params: { missingProperty: `region_id` },
              message: `must have required property 'region_id'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.mode !== void 0 && e.mode !== `REGIONAL`) {
            let e = {
              instancePath: n + `/mode`,
              schemaPath: `#/oneOf/1/properties/mode/const`,
              keyword: `const`,
              params: { allowedValue: `REGIONAL` },
              message: `must be equal to constant`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.region_id !== void 0) {
            let t = e.region_id;
            if (typeof t != `string`) {
              let e = {
                instancePath: n + `/region_id`,
                schemaPath: `#/oneOf/1/properties/region_id/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (
              t !== `BAMBOO` &&
              t !== `TEMPLE` &&
              t !== `MOUNTAINS` &&
              t !== `CASTLE`
            ) {
              let e = {
                instancePath: n + `/region_id`,
                schemaPath: `#/oneOf/1/properties/region_id/enum`,
                keyword: `enum`,
                params: { allowedValues: P.oneOf[1].properties.region_id.enum },
                message: `must be equal to one of the allowed values`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
        }
        var m = g === c;
        if (
          (m && d
            ? ((d = !1), (f = [f, 1]))
            : m &&
              ((d = !0),
              (f = 1),
              h !== !0 && ((h ||= {}), (h.mode = !0), (h.region_id = !0))),
          d)
        )
          ((c = u), s !== null && (u ? (s.length = u) : (s = null)));
        else {
          let e = {
            instancePath: n,
            schemaPath: `#/oneOf`,
            keyword: `oneOf`,
            params: { passingSchemas: f },
            message: `must match exactly one schema in oneOf`,
          };
          (s === null ? (s = [e]) : s.push(e), c++);
        }
        if (e && typeof e == `object` && !Array.isArray(e)) {
          if (e.mode === void 0) {
            let e = {
              instancePath: n,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `mode` },
              message: `must have required property 'mode'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          for (let t in e)
            if (t !== `mode` && t !== `region_id`) {
              let e = {
                instancePath: n,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: t },
                message: `must NOT have additional properties`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          if (e.mode !== void 0) {
            let r = e.mode;
            if (typeof r != `string`) {
              let e = {
                instancePath: n + `/mode`,
                schemaPath: `#/$defs/RunMode/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (r !== `FULL` && r !== `REGIONAL`) {
              let e = {
                instancePath: n + `/mode`,
                schemaPath: `#/$defs/RunMode/enum`,
                keyword: `enum`,
                params: { allowedValues: t.enum },
                message: `must be equal to one of the allowed values`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.region_id !== void 0) {
            let t = e.region_id;
            if (typeof t != `string`) {
              let e = {
                instancePath: n + `/region_id`,
                schemaPath: `#/properties/region_id/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (
              t !== `BAMBOO` &&
              t !== `TEMPLE` &&
              t !== `MOUNTAINS` &&
              t !== `CASTLE`
            ) {
              let e = {
                instancePath: n + `/region_id`,
                schemaPath: `#/properties/region_id/enum`,
                keyword: `enum`,
                params: { allowedValues: P.properties.region_id.enum },
                message: `must be equal to one of the allowed values`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
        } else {
          let e = {
            instancePath: n,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (s === null ? (s = [e]) : s.push(e), c++);
        }
        return ((F.errors = s), c === 0);
      }
      ((F.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.RunVersions = I));
      function I(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          c = 0,
          l = I.evaluated;
        if (
          (l.dynamicProps && (l.props = void 0),
          l.dynamicItems && (l.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.rules_major === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `rules_major` },
              message: `must have required property 'rules_major'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          if (e.rules_patch === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `rules_patch` },
              message: `must have required property 'rules_patch'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          if (e.generator_version === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `generator_version` },
              message: `must have required property 'generator_version'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          if (e.scoring_version === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `scoring_version` },
              message: `must have required property 'scoring_version'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          if (e.replay_protocol_version === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `replay_protocol_version` },
              message: `must have required property 'replay_protocol_version'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          if (e.rules_manifest_hash === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `rules_manifest_hash` },
              message: `must have required property 'rules_manifest_hash'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          if (e.assets_manifest_version === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `assets_manifest_version` },
              message: `must have required property 'assets_manifest_version'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          for (let n in e)
            if (
              n !== `rules_major` &&
              n !== `rules_patch` &&
              n !== `generator_version` &&
              n !== `scoring_version` &&
              n !== `replay_protocol_version` &&
              n !== `rules_manifest_hash` &&
              n !== `assets_manifest_version`
            ) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          if (e.rules_major !== void 0) {
            let n = e.rules_major;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/rules_major`,
                schemaPath: `#/properties/rules_major/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/rules_major`,
                  schemaPath: `#/properties/rules_major/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/rules_major`,
                  schemaPath: `#/properties/rules_major/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
            }
          }
          if (e.rules_patch !== void 0) {
            let n = e.rules_patch;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/rules_patch`,
                schemaPath: `#/properties/rules_patch/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 2147483647 || isNaN(n)) {
                let e = {
                  instancePath: t + `/rules_patch`,
                  schemaPath: `#/properties/rules_patch/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 2147483647 },
                  message: `must be <= 2147483647`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n < 0 || isNaN(n)) {
                let e = {
                  instancePath: t + `/rules_patch`,
                  schemaPath: `#/properties/rules_patch/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 0 },
                  message: `must be >= 0`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
            }
          }
          if (e.generator_version !== void 0) {
            let n = e.generator_version;
            if (typeof n == `string`) {
              if (s(n) < 1) {
                let e = {
                  instancePath: t + `/generator_version`,
                  schemaPath: `#/properties/generator_version/minLength`,
                  keyword: `minLength`,
                  params: { limit: 1 },
                  message: `must NOT have fewer than 1 characters`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/generator_version`,
                schemaPath: `#/properties/generator_version/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          }
          if (e.scoring_version !== void 0) {
            let n = e.scoring_version;
            if (typeof n == `string`) {
              if (s(n) < 1) {
                let e = {
                  instancePath: t + `/scoring_version`,
                  schemaPath: `#/properties/scoring_version/minLength`,
                  keyword: `minLength`,
                  params: { limit: 1 },
                  message: `must NOT have fewer than 1 characters`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/scoring_version`,
                schemaPath: `#/properties/scoring_version/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          }
          if (e.replay_protocol_version !== void 0) {
            let n = e.replay_protocol_version;
            if (typeof n != `string`) {
              let e = {
                instancePath: t + `/replay_protocol_version`,
                schemaPath: `#/properties/replay_protocol_version/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
            if (n !== `rr-input-v1`) {
              let e = {
                instancePath: t + `/replay_protocol_version`,
                schemaPath: `#/properties/replay_protocol_version/const`,
                keyword: `const`,
                params: { allowedValue: `rr-input-v1` },
                message: `must be equal to constant`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          }
          if (e.rules_manifest_hash !== void 0) {
            let n = e.rules_manifest_hash;
            if (typeof n == `string`) {
              if (!x.test(n)) {
                let e = {
                  instancePath: t + `/rules_manifest_hash`,
                  schemaPath: `#/properties/rules_manifest_hash/pattern`,
                  keyword: `pattern`,
                  params: { pattern: `^[a-f0-9]{64}$` },
                  message: `must match pattern "^[a-f0-9]{64}$"`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/rules_manifest_hash`,
                schemaPath: `#/properties/rules_manifest_hash/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          }
          if (e.assets_manifest_version !== void 0) {
            let n = e.assets_manifest_version;
            if (typeof n == `string`) {
              if (s(n) < 1) {
                let e = {
                  instancePath: t + `/assets_manifest_version`,
                  schemaPath: `#/properties/assets_manifest_version/minLength`,
                  keyword: `minLength`,
                  params: { limit: 1 },
                  message: `must NOT have fewer than 1 characters`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/assets_manifest_version`,
                schemaPath: `#/properties/assets_manifest_version/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), c++);
        }
        return ((I.errors = o), c === 0);
      }
      ((I.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.RunLimits = L));
      function L(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          s = 0,
          c = L.evaluated;
        if (
          (c.dynamicProps && (c.props = void 0),
          c.dynamicItems && (c.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.segment_ticks === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `segment_ticks` },
              message: `must have required property 'segment_ticks'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.max_encoded_bytes === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `max_encoded_bytes` },
              message: `must have required property 'max_encoded_bytes'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.max_decoded_bytes === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `max_decoded_bytes` },
              message: `must have required property 'max_decoded_bytes'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.max_actions_per_tick === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `max_actions_per_tick` },
              message: `must have required property 'max_actions_per_tick'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.upload_grace_seconds === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `upload_grace_seconds` },
              message: `must have required property 'upload_grace_seconds'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.max_run_encoded_bytes === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `max_run_encoded_bytes` },
              message: `must have required property 'max_run_encoded_bytes'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.max_player_encoded_bytes === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `max_player_encoded_bytes` },
              message: `must have required property 'max_player_encoded_bytes'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.max_segments_per_run === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `max_segments_per_run` },
              message: `must have required property 'max_segments_per_run'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.max_active_runs === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `max_active_runs` },
              message: `must have required property 'max_active_runs'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.wall_time_tolerance_ticks === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `wall_time_tolerance_ticks` },
              message: `must have required property 'wall_time_tolerance_ticks'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          for (let n in e)
            if (!v.call(_.properties, n)) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          if (e.segment_ticks !== void 0) {
            let n = e.segment_ticks;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/segment_ticks`,
                schemaPath: `#/properties/segment_ticks/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (n !== 3600) {
              let e = {
                instancePath: t + `/segment_ticks`,
                schemaPath: `#/properties/segment_ticks/const`,
                keyword: `const`,
                params: { allowedValue: 3600 },
                message: `must be equal to constant`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          if (e.max_encoded_bytes !== void 0) {
            let n = e.max_encoded_bytes;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/max_encoded_bytes`,
                schemaPath: `#/properties/max_encoded_bytes/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (n !== 262144) {
              let e = {
                instancePath: t + `/max_encoded_bytes`,
                schemaPath: `#/properties/max_encoded_bytes/const`,
                keyword: `const`,
                params: { allowedValue: 262144 },
                message: `must be equal to constant`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          if (e.max_decoded_bytes !== void 0) {
            let n = e.max_decoded_bytes;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/max_decoded_bytes`,
                schemaPath: `#/properties/max_decoded_bytes/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (n !== 1048576) {
              let e = {
                instancePath: t + `/max_decoded_bytes`,
                schemaPath: `#/properties/max_decoded_bytes/const`,
                keyword: `const`,
                params: { allowedValue: 1048576 },
                message: `must be equal to constant`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          if (e.max_actions_per_tick !== void 0) {
            let n = e.max_actions_per_tick;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/max_actions_per_tick`,
                schemaPath: `#/properties/max_actions_per_tick/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (n !== 2) {
              let e = {
                instancePath: t + `/max_actions_per_tick`,
                schemaPath: `#/properties/max_actions_per_tick/const`,
                keyword: `const`,
                params: { allowedValue: 2 },
                message: `must be equal to constant`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          if (e.upload_grace_seconds !== void 0) {
            let n = e.upload_grace_seconds;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/upload_grace_seconds`,
                schemaPath: `#/properties/upload_grace_seconds/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (n !== 86400) {
              let e = {
                instancePath: t + `/upload_grace_seconds`,
                schemaPath: `#/properties/upload_grace_seconds/const`,
                keyword: `const`,
                params: { allowedValue: 86400 },
                message: `must be equal to constant`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          if (e.max_run_encoded_bytes !== void 0) {
            let n = e.max_run_encoded_bytes;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/max_run_encoded_bytes`,
                schemaPath: `#/properties/max_run_encoded_bytes/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/max_run_encoded_bytes`,
                  schemaPath: `#/properties/max_run_encoded_bytes/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/max_run_encoded_bytes`,
                  schemaPath: `#/properties/max_run_encoded_bytes/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.max_player_encoded_bytes !== void 0) {
            let n = e.max_player_encoded_bytes;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/max_player_encoded_bytes`,
                schemaPath: `#/properties/max_player_encoded_bytes/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/max_player_encoded_bytes`,
                  schemaPath: `#/properties/max_player_encoded_bytes/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/max_player_encoded_bytes`,
                  schemaPath: `#/properties/max_player_encoded_bytes/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.max_segments_per_run !== void 0) {
            let n = e.max_segments_per_run;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/max_segments_per_run`,
                schemaPath: `#/properties/max_segments_per_run/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/max_segments_per_run`,
                  schemaPath: `#/properties/max_segments_per_run/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/max_segments_per_run`,
                  schemaPath: `#/properties/max_segments_per_run/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.max_active_runs !== void 0) {
            let n = e.max_active_runs;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/max_active_runs`,
                schemaPath: `#/properties/max_active_runs/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/max_active_runs`,
                  schemaPath: `#/properties/max_active_runs/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/max_active_runs`,
                  schemaPath: `#/properties/max_active_runs/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.wall_time_tolerance_ticks !== void 0) {
            let n = e.wall_time_tolerance_ticks;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/wall_time_tolerance_ticks`,
                schemaPath: `#/properties/wall_time_tolerance_ticks/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/wall_time_tolerance_ticks`,
                  schemaPath: `#/properties/wall_time_tolerance_ticks/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/wall_time_tolerance_ticks`,
                  schemaPath: `#/properties/wall_time_tolerance_ticks/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), s++);
        }
        return ((L.errors = o), s === 0);
      }
      ((L.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.FinishRequest = z));
      let R = {
        type: `object`,
        properties: {
          final_segment_index: {
            type: `integer`,
            minimum: 0,
            maximum: 9007199254740991,
          },
          final_tick: {
            type: `integer`,
            minimum: 0,
            maximum: 9007199254740991,
          },
          final_hash: { type: `string`, pattern: `^[a-f0-9]{64}$` },
          end_reason: { type: `string`, enum: [`HP_ZERO`, `ABYSS`, `QUIT`] },
        },
        required: [
          `final_segment_index`,
          `final_tick`,
          `final_hash`,
          `end_reason`,
        ],
        additionalProperties: !1,
      };
      function z(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          s = 0,
          c = z.evaluated;
        if (
          (c.dynamicProps && (c.props = void 0),
          c.dynamicItems && (c.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.final_segment_index === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `final_segment_index` },
              message: `must have required property 'final_segment_index'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.final_tick === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `final_tick` },
              message: `must have required property 'final_tick'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.final_hash === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `final_hash` },
              message: `must have required property 'final_hash'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.end_reason === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `end_reason` },
              message: `must have required property 'end_reason'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          for (let n in e)
            if (
              n !== `final_segment_index` &&
              n !== `final_tick` &&
              n !== `final_hash` &&
              n !== `end_reason`
            ) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          if (e.final_segment_index !== void 0) {
            let n = e.final_segment_index;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/final_segment_index`,
                schemaPath: `#/properties/final_segment_index/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/final_segment_index`,
                  schemaPath: `#/properties/final_segment_index/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 0 || isNaN(n)) {
                let e = {
                  instancePath: t + `/final_segment_index`,
                  schemaPath: `#/properties/final_segment_index/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 0 },
                  message: `must be >= 0`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.final_tick !== void 0) {
            let n = e.final_tick;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/final_tick`,
                schemaPath: `#/properties/final_tick/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/final_tick`,
                  schemaPath: `#/properties/final_tick/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 0 || isNaN(n)) {
                let e = {
                  instancePath: t + `/final_tick`,
                  schemaPath: `#/properties/final_tick/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 0 },
                  message: `must be >= 0`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.final_hash !== void 0) {
            let n = e.final_hash;
            if (typeof n == `string`) {
              if (!x.test(n)) {
                let e = {
                  instancePath: t + `/final_hash`,
                  schemaPath: `#/properties/final_hash/pattern`,
                  keyword: `pattern`,
                  params: { pattern: `^[a-f0-9]{64}$` },
                  message: `must match pattern "^[a-f0-9]{64}$"`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            } else {
              let e = {
                instancePath: t + `/final_hash`,
                schemaPath: `#/properties/final_hash/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          if (e.end_reason !== void 0) {
            let n = e.end_reason;
            if (typeof n != `string`) {
              let e = {
                instancePath: t + `/end_reason`,
                schemaPath: `#/properties/end_reason/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (n !== `HP_ZERO` && n !== `ABYSS` && n !== `QUIT`) {
              let e = {
                instancePath: t + `/end_reason`,
                schemaPath: `#/properties/end_reason/enum`,
                keyword: `enum`,
                params: { allowedValues: R.properties.end_reason.enum },
                message: `must be equal to one of the allowed values`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), s++);
        }
        return ((z.errors = o), s === 0);
      }
      ((z.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.ReplayAction = V));
      let B = {
        type: `object`,
        properties: {
          tick: { type: `integer`, minimum: 0, maximum: 9007199254740991 },
          action: { type: `string`, enum: [`JUMP`, `SLIDE`, `ATTACK`] },
        },
        required: [`tick`, `action`],
        additionalProperties: !1,
      };
      function V(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          s = 0,
          c = V.evaluated;
        if (
          (c.dynamicProps && (c.props = void 0),
          c.dynamicItems && (c.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.tick === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `tick` },
              message: `must have required property 'tick'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.action === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `action` },
              message: `must have required property 'action'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          for (let n in e)
            if (n !== `tick` && n !== `action`) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          if (e.tick !== void 0) {
            let n = e.tick;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/tick`,
                schemaPath: `#/properties/tick/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/tick`,
                  schemaPath: `#/properties/tick/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 0 || isNaN(n)) {
                let e = {
                  instancePath: t + `/tick`,
                  schemaPath: `#/properties/tick/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 0 },
                  message: `must be >= 0`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.action !== void 0) {
            let n = e.action;
            if (typeof n != `string`) {
              let e = {
                instancePath: t + `/action`,
                schemaPath: `#/properties/action/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (n !== `JUMP` && n !== `SLIDE` && n !== `ATTACK`) {
              let e = {
                instancePath: t + `/action`,
                schemaPath: `#/properties/action/enum`,
                keyword: `enum`,
                params: { allowedValues: B.properties.action.enum },
                message: `must be equal to one of the allowed values`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), s++);
        }
        return ((V.errors = o), s === 0);
      }
      ((V.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.ReplayControl = U));
      let H = {
        type: `object`,
        properties: {
          tick: { type: `integer`, minimum: 0, maximum: 9007199254740991 },
          sequence: { type: `integer`, minimum: 0, maximum: 9007199254740991 },
          action: { type: `string`, enum: [`PAUSE`, `RESUME`, `QUIT`] },
        },
        required: [`tick`, `sequence`, `action`],
        additionalProperties: !1,
      };
      function U(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          s = 0,
          c = U.evaluated;
        if (
          (c.dynamicProps && (c.props = void 0),
          c.dynamicItems && (c.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.tick === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `tick` },
              message: `must have required property 'tick'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.sequence === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `sequence` },
              message: `must have required property 'sequence'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.action === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `action` },
              message: `must have required property 'action'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          for (let n in e)
            if (n !== `tick` && n !== `sequence` && n !== `action`) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          if (e.tick !== void 0) {
            let n = e.tick;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/tick`,
                schemaPath: `#/properties/tick/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/tick`,
                  schemaPath: `#/properties/tick/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 0 || isNaN(n)) {
                let e = {
                  instancePath: t + `/tick`,
                  schemaPath: `#/properties/tick/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 0 },
                  message: `must be >= 0`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.sequence !== void 0) {
            let n = e.sequence;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/sequence`,
                schemaPath: `#/properties/sequence/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/sequence`,
                  schemaPath: `#/properties/sequence/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 0 || isNaN(n)) {
                let e = {
                  instancePath: t + `/sequence`,
                  schemaPath: `#/properties/sequence/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 0 },
                  message: `must be >= 0`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.action !== void 0) {
            let n = e.action;
            if (typeof n != `string`) {
              let e = {
                instancePath: t + `/action`,
                schemaPath: `#/properties/action/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (n !== `PAUSE` && n !== `RESUME` && n !== `QUIT`) {
              let e = {
                instancePath: t + `/action`,
                schemaPath: `#/properties/action/enum`,
                keyword: `enum`,
                params: { allowedValues: H.properties.action.enum },
                message: `must be equal to one of the allowed values`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), s++);
        }
        return ((U.errors = o), s === 0);
      }
      ((U.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.ReplaySegment = W));
      function W(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: a = e,
          dynamicAnchors: o = {},
        } = {},
      ) {
        let s = null,
          c = 0,
          l = W.evaluated;
        if (
          (l.dynamicProps && (l.props = void 0),
          l.dynamicItems && (l.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.protocol === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `protocol` },
              message: `must have required property 'protocol'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.run_id === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `run_id` },
              message: `must have required property 'run_id'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.index === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `index` },
              message: `must have required property 'index'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.start_tick === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `start_tick` },
              message: `must have required property 'start_tick'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.end_tick === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `end_tick` },
              message: `must have required property 'end_tick'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.previous_hash === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `previous_hash` },
              message: `must have required property 'previous_hash'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.actions === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `actions` },
              message: `must have required property 'actions'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          if (e.controls === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `controls` },
              message: `must have required property 'controls'`,
            };
            (s === null ? (s = [e]) : s.push(e), c++);
          }
          for (let n in e)
            if (
              n !== `protocol` &&
              n !== `run_id` &&
              n !== `index` &&
              n !== `start_tick` &&
              n !== `end_tick` &&
              n !== `previous_hash` &&
              n !== `actions` &&
              n !== `controls`
            ) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          if (e.protocol !== void 0) {
            let n = e.protocol;
            if (typeof n != `string`) {
              let e = {
                instancePath: t + `/protocol`,
                schemaPath: `#/properties/protocol/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (n !== `rr-input-v1`) {
              let e = {
                instancePath: t + `/protocol`,
                schemaPath: `#/properties/protocol/const`,
                keyword: `const`,
                params: { allowedValue: `rr-input-v1` },
                message: `must be equal to constant`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.run_id !== void 0) {
            let n = e.run_id;
            if (typeof n == `string`) {
              if (!i.test(n)) {
                let e = {
                  instancePath: t + `/run_id`,
                  schemaPath: `#/properties/run_id/format`,
                  keyword: `format`,
                  params: { format: `uuid` },
                  message: `must match format "uuid"`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/run_id`,
                schemaPath: `#/properties/run_id/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.index !== void 0) {
            let n = e.index;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/index`,
                schemaPath: `#/properties/index/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/index`,
                  schemaPath: `#/properties/index/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
              if (n < 0 || isNaN(n)) {
                let e = {
                  instancePath: t + `/index`,
                  schemaPath: `#/properties/index/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 0 },
                  message: `must be >= 0`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
            }
          }
          if (e.start_tick !== void 0) {
            let n = e.start_tick;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/start_tick`,
                schemaPath: `#/properties/start_tick/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/start_tick`,
                  schemaPath: `#/properties/start_tick/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
              if (n < 0 || isNaN(n)) {
                let e = {
                  instancePath: t + `/start_tick`,
                  schemaPath: `#/properties/start_tick/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 0 },
                  message: `must be >= 0`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
            }
          }
          if (e.end_tick !== void 0) {
            let n = e.end_tick;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/end_tick`,
                schemaPath: `#/properties/end_tick/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/end_tick`,
                  schemaPath: `#/properties/end_tick/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
              if (n < 0 || isNaN(n)) {
                let e = {
                  instancePath: t + `/end_tick`,
                  schemaPath: `#/properties/end_tick/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 0 },
                  message: `must be >= 0`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
            }
          }
          if (e.previous_hash !== void 0) {
            let n = e.previous_hash,
              r = c,
              i = !1,
              a = c;
            if (typeof n == `string`) {
              if (!x.test(n)) {
                let e = {
                  instancePath: t + `/previous_hash`,
                  schemaPath: `#/properties/previous_hash/anyOf/0/pattern`,
                  keyword: `pattern`,
                  params: { pattern: `^[a-f0-9]{64}$` },
                  message: `must match pattern "^[a-f0-9]{64}$"`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/previous_hash`,
                schemaPath: `#/properties/previous_hash/anyOf/0/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            var u = a === c;
            i ||= u;
            let o = c;
            if (n !== null) {
              let e = {
                instancePath: t + `/previous_hash`,
                schemaPath: `#/properties/previous_hash/anyOf/1/type`,
                keyword: `type`,
                params: { type: `null` },
                message: `must be null`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
            var u = o === c;
            if (((i ||= u), i))
              ((c = r), s !== null && (r ? (s.length = r) : (s = null)));
            else {
              let e = {
                instancePath: t + `/previous_hash`,
                schemaPath: `#/properties/previous_hash/anyOf`,
                keyword: `anyOf`,
                params: {},
                message: `must match a schema in anyOf`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.actions !== void 0) {
            let n = e.actions;
            if (Array.isArray(n)) {
              if (n.length > 7200) {
                let e = {
                  instancePath: t + `/actions`,
                  schemaPath: `#/properties/actions/maxItems`,
                  keyword: `maxItems`,
                  params: { limit: 7200 },
                  message: `must NOT have more than 7200 items`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
              let e = n.length;
              for (let r = 0; r < e; r++) {
                let e = n[r];
                if (e && typeof e == `object` && !Array.isArray(e)) {
                  if (e.tick === void 0) {
                    let e = {
                      instancePath: t + `/actions/` + r,
                      schemaPath: `#/$defs/ReplayAction/required`,
                      keyword: `required`,
                      params: { missingProperty: `tick` },
                      message: `must have required property 'tick'`,
                    };
                    (s === null ? (s = [e]) : s.push(e), c++);
                  }
                  if (e.action === void 0) {
                    let e = {
                      instancePath: t + `/actions/` + r,
                      schemaPath: `#/$defs/ReplayAction/required`,
                      keyword: `required`,
                      params: { missingProperty: `action` },
                      message: `must have required property 'action'`,
                    };
                    (s === null ? (s = [e]) : s.push(e), c++);
                  }
                  for (let n in e)
                    if (n !== `tick` && n !== `action`) {
                      let e = {
                        instancePath: t + `/actions/` + r,
                        schemaPath: `#/$defs/ReplayAction/additionalProperties`,
                        keyword: `additionalProperties`,
                        params: { additionalProperty: n },
                        message: `must NOT have additional properties`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                  if (e.tick !== void 0) {
                    let n = e.tick;
                    if (
                      typeof n != `number` ||
                      n % 1 ||
                      isNaN(n) ||
                      !isFinite(n)
                    ) {
                      let e = {
                        instancePath: t + `/actions/` + r + `/tick`,
                        schemaPath: `#/$defs/ReplayAction/properties/tick/type`,
                        keyword: `type`,
                        params: { type: `integer` },
                        message: `must be integer`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                    if (typeof n == `number` && isFinite(n)) {
                      if (n > 9007199254740991 || isNaN(n)) {
                        let e = {
                          instancePath: t + `/actions/` + r + `/tick`,
                          schemaPath: `#/$defs/ReplayAction/properties/tick/maximum`,
                          keyword: `maximum`,
                          params: { comparison: `<=`, limit: 9007199254740991 },
                          message: `must be <= 9007199254740991`,
                        };
                        (s === null ? (s = [e]) : s.push(e), c++);
                      }
                      if (n < 0 || isNaN(n)) {
                        let e = {
                          instancePath: t + `/actions/` + r + `/tick`,
                          schemaPath: `#/$defs/ReplayAction/properties/tick/minimum`,
                          keyword: `minimum`,
                          params: { comparison: `>=`, limit: 0 },
                          message: `must be >= 0`,
                        };
                        (s === null ? (s = [e]) : s.push(e), c++);
                      }
                    }
                  }
                  if (e.action !== void 0) {
                    let n = e.action;
                    if (typeof n != `string`) {
                      let e = {
                        instancePath: t + `/actions/` + r + `/action`,
                        schemaPath: `#/$defs/ReplayAction/properties/action/type`,
                        keyword: `type`,
                        params: { type: `string` },
                        message: `must be string`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                    if (n !== `JUMP` && n !== `SLIDE` && n !== `ATTACK`) {
                      let e = {
                        instancePath: t + `/actions/` + r + `/action`,
                        schemaPath: `#/$defs/ReplayAction/properties/action/enum`,
                        keyword: `enum`,
                        params: { allowedValues: B.properties.action.enum },
                        message: `must be equal to one of the allowed values`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                  }
                } else {
                  let e = {
                    instancePath: t + `/actions/` + r,
                    schemaPath: `#/$defs/ReplayAction/type`,
                    keyword: `type`,
                    params: { type: `object` },
                    message: `must be object`,
                  };
                  (s === null ? (s = [e]) : s.push(e), c++);
                }
              }
            } else {
              let e = {
                instancePath: t + `/actions`,
                schemaPath: `#/properties/actions/type`,
                keyword: `type`,
                params: { type: `array` },
                message: `must be array`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
          if (e.controls !== void 0) {
            let n = e.controls;
            if (Array.isArray(n)) {
              if (n.length > 4096) {
                let e = {
                  instancePath: t + `/controls`,
                  schemaPath: `#/properties/controls/maxItems`,
                  keyword: `maxItems`,
                  params: { limit: 4096 },
                  message: `must NOT have more than 4096 items`,
                };
                (s === null ? (s = [e]) : s.push(e), c++);
              }
              let e = n.length;
              for (let r = 0; r < e; r++) {
                let e = n[r];
                if (e && typeof e == `object` && !Array.isArray(e)) {
                  if (e.tick === void 0) {
                    let e = {
                      instancePath: t + `/controls/` + r,
                      schemaPath: `#/$defs/ReplayControl/required`,
                      keyword: `required`,
                      params: { missingProperty: `tick` },
                      message: `must have required property 'tick'`,
                    };
                    (s === null ? (s = [e]) : s.push(e), c++);
                  }
                  if (e.sequence === void 0) {
                    let e = {
                      instancePath: t + `/controls/` + r,
                      schemaPath: `#/$defs/ReplayControl/required`,
                      keyword: `required`,
                      params: { missingProperty: `sequence` },
                      message: `must have required property 'sequence'`,
                    };
                    (s === null ? (s = [e]) : s.push(e), c++);
                  }
                  if (e.action === void 0) {
                    let e = {
                      instancePath: t + `/controls/` + r,
                      schemaPath: `#/$defs/ReplayControl/required`,
                      keyword: `required`,
                      params: { missingProperty: `action` },
                      message: `must have required property 'action'`,
                    };
                    (s === null ? (s = [e]) : s.push(e), c++);
                  }
                  for (let n in e)
                    if (n !== `tick` && n !== `sequence` && n !== `action`) {
                      let e = {
                        instancePath: t + `/controls/` + r,
                        schemaPath: `#/$defs/ReplayControl/additionalProperties`,
                        keyword: `additionalProperties`,
                        params: { additionalProperty: n },
                        message: `must NOT have additional properties`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                  if (e.tick !== void 0) {
                    let n = e.tick;
                    if (
                      typeof n != `number` ||
                      n % 1 ||
                      isNaN(n) ||
                      !isFinite(n)
                    ) {
                      let e = {
                        instancePath: t + `/controls/` + r + `/tick`,
                        schemaPath: `#/$defs/ReplayControl/properties/tick/type`,
                        keyword: `type`,
                        params: { type: `integer` },
                        message: `must be integer`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                    if (typeof n == `number` && isFinite(n)) {
                      if (n > 9007199254740991 || isNaN(n)) {
                        let e = {
                          instancePath: t + `/controls/` + r + `/tick`,
                          schemaPath: `#/$defs/ReplayControl/properties/tick/maximum`,
                          keyword: `maximum`,
                          params: { comparison: `<=`, limit: 9007199254740991 },
                          message: `must be <= 9007199254740991`,
                        };
                        (s === null ? (s = [e]) : s.push(e), c++);
                      }
                      if (n < 0 || isNaN(n)) {
                        let e = {
                          instancePath: t + `/controls/` + r + `/tick`,
                          schemaPath: `#/$defs/ReplayControl/properties/tick/minimum`,
                          keyword: `minimum`,
                          params: { comparison: `>=`, limit: 0 },
                          message: `must be >= 0`,
                        };
                        (s === null ? (s = [e]) : s.push(e), c++);
                      }
                    }
                  }
                  if (e.sequence !== void 0) {
                    let n = e.sequence;
                    if (
                      typeof n != `number` ||
                      n % 1 ||
                      isNaN(n) ||
                      !isFinite(n)
                    ) {
                      let e = {
                        instancePath: t + `/controls/` + r + `/sequence`,
                        schemaPath: `#/$defs/ReplayControl/properties/sequence/type`,
                        keyword: `type`,
                        params: { type: `integer` },
                        message: `must be integer`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                    if (typeof n == `number` && isFinite(n)) {
                      if (n > 9007199254740991 || isNaN(n)) {
                        let e = {
                          instancePath: t + `/controls/` + r + `/sequence`,
                          schemaPath: `#/$defs/ReplayControl/properties/sequence/maximum`,
                          keyword: `maximum`,
                          params: { comparison: `<=`, limit: 9007199254740991 },
                          message: `must be <= 9007199254740991`,
                        };
                        (s === null ? (s = [e]) : s.push(e), c++);
                      }
                      if (n < 0 || isNaN(n)) {
                        let e = {
                          instancePath: t + `/controls/` + r + `/sequence`,
                          schemaPath: `#/$defs/ReplayControl/properties/sequence/minimum`,
                          keyword: `minimum`,
                          params: { comparison: `>=`, limit: 0 },
                          message: `must be >= 0`,
                        };
                        (s === null ? (s = [e]) : s.push(e), c++);
                      }
                    }
                  }
                  if (e.action !== void 0) {
                    let n = e.action;
                    if (typeof n != `string`) {
                      let e = {
                        instancePath: t + `/controls/` + r + `/action`,
                        schemaPath: `#/$defs/ReplayControl/properties/action/type`,
                        keyword: `type`,
                        params: { type: `string` },
                        message: `must be string`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                    if (n !== `PAUSE` && n !== `RESUME` && n !== `QUIT`) {
                      let e = {
                        instancePath: t + `/controls/` + r + `/action`,
                        schemaPath: `#/$defs/ReplayControl/properties/action/enum`,
                        keyword: `enum`,
                        params: { allowedValues: H.properties.action.enum },
                        message: `must be equal to one of the allowed values`,
                      };
                      (s === null ? (s = [e]) : s.push(e), c++);
                    }
                  }
                } else {
                  let e = {
                    instancePath: t + `/controls/` + r,
                    schemaPath: `#/$defs/ReplayControl/type`,
                    keyword: `type`,
                    params: { type: `object` },
                    message: `must be object`,
                  };
                  (s === null ? (s = [e]) : s.push(e), c++);
                }
              }
            } else {
              let e = {
                instancePath: t + `/controls`,
                schemaPath: `#/properties/controls/type`,
                keyword: `type`,
                params: { type: `array` },
                message: `must be array`,
              };
              (s === null ? (s = [e]) : s.push(e), c++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (s === null ? (s = [e]) : s.push(e), c++);
        }
        return ((W.errors = s), c === 0);
      }
      ((W.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.GuestRequest = G));
      function G(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          s = 0,
          c = G.evaluated;
        if (
          (c.dynamicProps && (c.props = void 0),
          c.dynamicItems && (c.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        )
          for (let n in e) {
            let e = {
              instancePath: t,
              schemaPath: `#/additionalProperties`,
              keyword: `additionalProperties`,
              params: { additionalProperty: n },
              message: `must NOT have additional properties`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
        else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), s++);
        }
        return ((G.errors = o), s === 0);
      }
      ((G.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.PhysicsRules = J));
      let K = {
          type: `object`,
          required: [
            `version`,
            `tickRate`,
            `scale`,
            `unitsPerMeter`,
            `speed`,
            `speedCeiling`,
            `gravity`,
            `jump`,
            `doubleJump`,
            `coyoteTicks`,
            `jumpBufferTicks`,
            `slideTicks`,
            `slideRecoveryTicks`,
            `attackWindup`,
            `attackActive`,
            `attackRecovery`,
            `perfectTicks`,
            `hurtTicks`,
            `bodyWidth`,
            `bodyHeight`,
            `slideWidth`,
            `slideHeight`,
            `swordReach`,
            `fatalY`,
          ],
          additionalProperties: !1,
          properties: {
            version: { type: `string`, pattern: `^[a-zA-Z0-9._-]{1,100}$` },
            tickRate: { type: `integer`, const: 60 },
            scale: { type: `integer`, minimum: 1, maximum: 9007199254740991 },
            unitsPerMeter: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            speed: { type: `integer`, minimum: 1, maximum: 9007199254740991 },
            speedCeiling: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            gravity: { type: `integer`, minimum: 1, maximum: 9007199254740991 },
            jump: { type: `integer`, minimum: -9007199254740991, maximum: -1 },
            doubleJump: {
              type: `integer`,
              minimum: -9007199254740991,
              maximum: -1,
            },
            coyoteTicks: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            jumpBufferTicks: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            slideTicks: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            slideRecoveryTicks: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            attackWindup: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            attackActive: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            attackRecovery: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            perfectTicks: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            hurtTicks: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            bodyWidth: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            bodyHeight: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            slideWidth: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            slideHeight: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            swordReach: {
              type: `integer`,
              minimum: 1,
              maximum: 9007199254740991,
            },
            fatalY: { type: `integer`, minimum: 1, maximum: 9007199254740991 },
            concentrationCap: { type: `integer`, minimum: 100, maximum: 100 },
            perfectGain: { type: `integer`, minimum: 1, maximum: 100 },
            normalGain: { type: `integer`, minimum: 1, maximum: 100 },
            normalBreaksCombo: { type: `integer`, minimum: 0, maximum: 1 },
            specialReach: { type: `integer`, minimum: 1, maximum: 1e6 },
            specialFxTicks: { type: `integer`, minimum: 1, maximum: 60 },
          },
        },
        q = RegExp(`^[a-zA-Z0-9._-]{1,100}$`, `u`);
      function J(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          s = 0,
          c = J.evaluated;
        if (
          (c.dynamicProps && (c.props = void 0),
          c.dynamicItems && (c.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.version === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `version` },
              message: `must have required property 'version'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.tickRate === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `tickRate` },
              message: `must have required property 'tickRate'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.scale === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `scale` },
              message: `must have required property 'scale'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.unitsPerMeter === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `unitsPerMeter` },
              message: `must have required property 'unitsPerMeter'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.speed === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `speed` },
              message: `must have required property 'speed'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.speedCeiling === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `speedCeiling` },
              message: `must have required property 'speedCeiling'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.gravity === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `gravity` },
              message: `must have required property 'gravity'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.jump === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `jump` },
              message: `must have required property 'jump'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.doubleJump === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `doubleJump` },
              message: `must have required property 'doubleJump'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.coyoteTicks === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `coyoteTicks` },
              message: `must have required property 'coyoteTicks'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.jumpBufferTicks === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `jumpBufferTicks` },
              message: `must have required property 'jumpBufferTicks'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.slideTicks === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `slideTicks` },
              message: `must have required property 'slideTicks'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.slideRecoveryTicks === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `slideRecoveryTicks` },
              message: `must have required property 'slideRecoveryTicks'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.attackWindup === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `attackWindup` },
              message: `must have required property 'attackWindup'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.attackActive === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `attackActive` },
              message: `must have required property 'attackActive'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.attackRecovery === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `attackRecovery` },
              message: `must have required property 'attackRecovery'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.perfectTicks === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `perfectTicks` },
              message: `must have required property 'perfectTicks'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.hurtTicks === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `hurtTicks` },
              message: `must have required property 'hurtTicks'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.bodyWidth === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `bodyWidth` },
              message: `must have required property 'bodyWidth'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.bodyHeight === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `bodyHeight` },
              message: `must have required property 'bodyHeight'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.slideWidth === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `slideWidth` },
              message: `must have required property 'slideWidth'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.slideHeight === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `slideHeight` },
              message: `must have required property 'slideHeight'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.swordReach === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `swordReach` },
              message: `must have required property 'swordReach'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.fatalY === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `fatalY` },
              message: `must have required property 'fatalY'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          for (let n in e)
            if (!v.call(K.properties, n)) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          if (e.version !== void 0) {
            let n = e.version;
            if (typeof n == `string`) {
              if (!q.test(n)) {
                let e = {
                  instancePath: t + `/version`,
                  schemaPath: `#/properties/version/pattern`,
                  keyword: `pattern`,
                  params: { pattern: `^[a-zA-Z0-9._-]{1,100}$` },
                  message: `must match pattern "^[a-zA-Z0-9._-]{1,100}$"`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            } else {
              let e = {
                instancePath: t + `/version`,
                schemaPath: `#/properties/version/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          if (e.tickRate !== void 0) {
            let n = e.tickRate;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/tickRate`,
                schemaPath: `#/properties/tickRate/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (n !== 60) {
              let e = {
                instancePath: t + `/tickRate`,
                schemaPath: `#/properties/tickRate/const`,
                keyword: `const`,
                params: { allowedValue: 60 },
                message: `must be equal to constant`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          if (e.scale !== void 0) {
            let n = e.scale;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/scale`,
                schemaPath: `#/properties/scale/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/scale`,
                  schemaPath: `#/properties/scale/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/scale`,
                  schemaPath: `#/properties/scale/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.unitsPerMeter !== void 0) {
            let n = e.unitsPerMeter;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/unitsPerMeter`,
                schemaPath: `#/properties/unitsPerMeter/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/unitsPerMeter`,
                  schemaPath: `#/properties/unitsPerMeter/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/unitsPerMeter`,
                  schemaPath: `#/properties/unitsPerMeter/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.speed !== void 0) {
            let n = e.speed;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/speed`,
                schemaPath: `#/properties/speed/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/speed`,
                  schemaPath: `#/properties/speed/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/speed`,
                  schemaPath: `#/properties/speed/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.speedCeiling !== void 0) {
            let n = e.speedCeiling;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/speedCeiling`,
                schemaPath: `#/properties/speedCeiling/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/speedCeiling`,
                  schemaPath: `#/properties/speedCeiling/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/speedCeiling`,
                  schemaPath: `#/properties/speedCeiling/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.gravity !== void 0) {
            let n = e.gravity;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/gravity`,
                schemaPath: `#/properties/gravity/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/gravity`,
                  schemaPath: `#/properties/gravity/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/gravity`,
                  schemaPath: `#/properties/gravity/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.jump !== void 0) {
            let n = e.jump;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/jump`,
                schemaPath: `#/properties/jump/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > -1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/jump`,
                  schemaPath: `#/properties/jump/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: -1 },
                  message: `must be <= -1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < -9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/jump`,
                  schemaPath: `#/properties/jump/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: -9007199254740991 },
                  message: `must be >= -9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.doubleJump !== void 0) {
            let n = e.doubleJump;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/doubleJump`,
                schemaPath: `#/properties/doubleJump/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > -1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/doubleJump`,
                  schemaPath: `#/properties/doubleJump/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: -1 },
                  message: `must be <= -1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < -9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/doubleJump`,
                  schemaPath: `#/properties/doubleJump/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: -9007199254740991 },
                  message: `must be >= -9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.coyoteTicks !== void 0) {
            let n = e.coyoteTicks;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/coyoteTicks`,
                schemaPath: `#/properties/coyoteTicks/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/coyoteTicks`,
                  schemaPath: `#/properties/coyoteTicks/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/coyoteTicks`,
                  schemaPath: `#/properties/coyoteTicks/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.jumpBufferTicks !== void 0) {
            let n = e.jumpBufferTicks;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/jumpBufferTicks`,
                schemaPath: `#/properties/jumpBufferTicks/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/jumpBufferTicks`,
                  schemaPath: `#/properties/jumpBufferTicks/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/jumpBufferTicks`,
                  schemaPath: `#/properties/jumpBufferTicks/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.slideTicks !== void 0) {
            let n = e.slideTicks;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/slideTicks`,
                schemaPath: `#/properties/slideTicks/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/slideTicks`,
                  schemaPath: `#/properties/slideTicks/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/slideTicks`,
                  schemaPath: `#/properties/slideTicks/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.slideRecoveryTicks !== void 0) {
            let n = e.slideRecoveryTicks;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/slideRecoveryTicks`,
                schemaPath: `#/properties/slideRecoveryTicks/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/slideRecoveryTicks`,
                  schemaPath: `#/properties/slideRecoveryTicks/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/slideRecoveryTicks`,
                  schemaPath: `#/properties/slideRecoveryTicks/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.attackWindup !== void 0) {
            let n = e.attackWindup;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/attackWindup`,
                schemaPath: `#/properties/attackWindup/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/attackWindup`,
                  schemaPath: `#/properties/attackWindup/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/attackWindup`,
                  schemaPath: `#/properties/attackWindup/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.attackActive !== void 0) {
            let n = e.attackActive;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/attackActive`,
                schemaPath: `#/properties/attackActive/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/attackActive`,
                  schemaPath: `#/properties/attackActive/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/attackActive`,
                  schemaPath: `#/properties/attackActive/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.attackRecovery !== void 0) {
            let n = e.attackRecovery;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/attackRecovery`,
                schemaPath: `#/properties/attackRecovery/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/attackRecovery`,
                  schemaPath: `#/properties/attackRecovery/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/attackRecovery`,
                  schemaPath: `#/properties/attackRecovery/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.perfectTicks !== void 0) {
            let n = e.perfectTicks;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/perfectTicks`,
                schemaPath: `#/properties/perfectTicks/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/perfectTicks`,
                  schemaPath: `#/properties/perfectTicks/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/perfectTicks`,
                  schemaPath: `#/properties/perfectTicks/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.hurtTicks !== void 0) {
            let n = e.hurtTicks;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/hurtTicks`,
                schemaPath: `#/properties/hurtTicks/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/hurtTicks`,
                  schemaPath: `#/properties/hurtTicks/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/hurtTicks`,
                  schemaPath: `#/properties/hurtTicks/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.bodyWidth !== void 0) {
            let n = e.bodyWidth;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/bodyWidth`,
                schemaPath: `#/properties/bodyWidth/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/bodyWidth`,
                  schemaPath: `#/properties/bodyWidth/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/bodyWidth`,
                  schemaPath: `#/properties/bodyWidth/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.bodyHeight !== void 0) {
            let n = e.bodyHeight;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/bodyHeight`,
                schemaPath: `#/properties/bodyHeight/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/bodyHeight`,
                  schemaPath: `#/properties/bodyHeight/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/bodyHeight`,
                  schemaPath: `#/properties/bodyHeight/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.slideWidth !== void 0) {
            let n = e.slideWidth;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/slideWidth`,
                schemaPath: `#/properties/slideWidth/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/slideWidth`,
                  schemaPath: `#/properties/slideWidth/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/slideWidth`,
                  schemaPath: `#/properties/slideWidth/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.slideHeight !== void 0) {
            let n = e.slideHeight;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/slideHeight`,
                schemaPath: `#/properties/slideHeight/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/slideHeight`,
                  schemaPath: `#/properties/slideHeight/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/slideHeight`,
                  schemaPath: `#/properties/slideHeight/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.swordReach !== void 0) {
            let n = e.swordReach;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/swordReach`,
                schemaPath: `#/properties/swordReach/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/swordReach`,
                  schemaPath: `#/properties/swordReach/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/swordReach`,
                  schemaPath: `#/properties/swordReach/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.fatalY !== void 0) {
            let n = e.fatalY;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/fatalY`,
                schemaPath: `#/properties/fatalY/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 9007199254740991 || isNaN(n)) {
                let e = {
                  instancePath: t + `/fatalY`,
                  schemaPath: `#/properties/fatalY/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 9007199254740991 },
                  message: `must be <= 9007199254740991`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/fatalY`,
                  schemaPath: `#/properties/fatalY/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.concentrationCap !== void 0) {
            let n = e.concentrationCap;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/concentrationCap`,
                schemaPath: `#/properties/concentrationCap/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 100 || isNaN(n)) {
                let e = {
                  instancePath: t + `/concentrationCap`,
                  schemaPath: `#/properties/concentrationCap/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 100 },
                  message: `must be <= 100`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 100 || isNaN(n)) {
                let e = {
                  instancePath: t + `/concentrationCap`,
                  schemaPath: `#/properties/concentrationCap/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 100 },
                  message: `must be >= 100`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.perfectGain !== void 0) {
            let n = e.perfectGain;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/perfectGain`,
                schemaPath: `#/properties/perfectGain/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 100 || isNaN(n)) {
                let e = {
                  instancePath: t + `/perfectGain`,
                  schemaPath: `#/properties/perfectGain/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 100 },
                  message: `must be <= 100`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/perfectGain`,
                  schemaPath: `#/properties/perfectGain/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.normalGain !== void 0) {
            let n = e.normalGain;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/normalGain`,
                schemaPath: `#/properties/normalGain/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 100 || isNaN(n)) {
                let e = {
                  instancePath: t + `/normalGain`,
                  schemaPath: `#/properties/normalGain/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 100 },
                  message: `must be <= 100`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/normalGain`,
                  schemaPath: `#/properties/normalGain/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.normalBreaksCombo !== void 0) {
            let n = e.normalBreaksCombo;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/normalBreaksCombo`,
                schemaPath: `#/properties/normalBreaksCombo/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/normalBreaksCombo`,
                  schemaPath: `#/properties/normalBreaksCombo/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 1 },
                  message: `must be <= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 0 || isNaN(n)) {
                let e = {
                  instancePath: t + `/normalBreaksCombo`,
                  schemaPath: `#/properties/normalBreaksCombo/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 0 },
                  message: `must be >= 0`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.specialReach !== void 0) {
            let n = e.specialReach;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/specialReach`,
                schemaPath: `#/properties/specialReach/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 1e6 || isNaN(n)) {
                let e = {
                  instancePath: t + `/specialReach`,
                  schemaPath: `#/properties/specialReach/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 1e6 },
                  message: `must be <= 1000000`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/specialReach`,
                  schemaPath: `#/properties/specialReach/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
          if (e.specialFxTicks !== void 0) {
            let n = e.specialFxTicks;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/specialFxTicks`,
                schemaPath: `#/properties/specialFxTicks/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
            if (typeof n == `number` && isFinite(n)) {
              if (n > 60 || isNaN(n)) {
                let e = {
                  instancePath: t + `/specialFxTicks`,
                  schemaPath: `#/properties/specialFxTicks/maximum`,
                  keyword: `maximum`,
                  params: { comparison: `<=`, limit: 60 },
                  message: `must be <= 60`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
              if (n < 1 || isNaN(n)) {
                let e = {
                  instancePath: t + `/specialFxTicks`,
                  schemaPath: `#/properties/specialFxTicks/minimum`,
                  keyword: `minimum`,
                  params: { comparison: `>=`, limit: 1 },
                  message: `must be >= 1`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), s++);
        }
        return ((J.errors = o), s === 0);
      }
      ((J.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.RunnerManifest = Y));
      function Y(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          c = 0,
          l = Y.evaluated;
        if (
          (l.dynamicProps && (l.props = void 0),
          l.dynamicItems && (l.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.rules_major === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `rules_major` },
              message: `must have required property 'rules_major'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          if (e.rules_patch === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `rules_patch` },
              message: `must have required property 'rules_patch'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          if (e.generator_version === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `generator_version` },
              message: `must have required property 'generator_version'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          if (e.scoring_version === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `scoring_version` },
              message: `must have required property 'scoring_version'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          if (e.replay_protocol_version === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `replay_protocol_version` },
              message: `must have required property 'replay_protocol_version'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          if (e.assets_manifest_version === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `assets_manifest_version` },
              message: `must have required property 'assets_manifest_version'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          if (e.physics === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `physics` },
              message: `must have required property 'physics'`,
            };
            (o === null ? (o = [e]) : o.push(e), c++);
          }
          for (let n in e)
            if (
              n !== `rules_major` &&
              n !== `rules_patch` &&
              n !== `generator_version` &&
              n !== `scoring_version` &&
              n !== `replay_protocol_version` &&
              n !== `assets_manifest_version` &&
              n !== `physics`
            ) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          if (e.rules_major !== void 0) {
            let n = e.rules_major;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/rules_major`,
                schemaPath: `#/properties/rules_major/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n) && (n < 1 || isNaN(n))) {
              let e = {
                instancePath: t + `/rules_major`,
                schemaPath: `#/properties/rules_major/minimum`,
                keyword: `minimum`,
                params: { comparison: `>=`, limit: 1 },
                message: `must be >= 1`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          }
          if (e.rules_patch !== void 0) {
            let n = e.rules_patch;
            if (typeof n != `number` || n % 1 || isNaN(n) || !isFinite(n)) {
              let e = {
                instancePath: t + `/rules_patch`,
                schemaPath: `#/properties/rules_patch/type`,
                keyword: `type`,
                params: { type: `integer` },
                message: `must be integer`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
            if (typeof n == `number` && isFinite(n) && (n < 0 || isNaN(n))) {
              let e = {
                instancePath: t + `/rules_patch`,
                schemaPath: `#/properties/rules_patch/minimum`,
                keyword: `minimum`,
                params: { comparison: `>=`, limit: 0 },
                message: `must be >= 0`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          }
          if (e.generator_version !== void 0) {
            let n = e.generator_version;
            if (typeof n == `string`) {
              if (s(n) < 1) {
                let e = {
                  instancePath: t + `/generator_version`,
                  schemaPath: `#/properties/generator_version/minLength`,
                  keyword: `minLength`,
                  params: { limit: 1 },
                  message: `must NOT have fewer than 1 characters`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/generator_version`,
                schemaPath: `#/properties/generator_version/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          }
          if (e.scoring_version !== void 0) {
            let n = e.scoring_version;
            if (typeof n == `string`) {
              if (s(n) < 1) {
                let e = {
                  instancePath: t + `/scoring_version`,
                  schemaPath: `#/properties/scoring_version/minLength`,
                  keyword: `minLength`,
                  params: { limit: 1 },
                  message: `must NOT have fewer than 1 characters`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/scoring_version`,
                schemaPath: `#/properties/scoring_version/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          }
          if (e.replay_protocol_version !== void 0) {
            let n = e.replay_protocol_version;
            if (typeof n != `string`) {
              let e = {
                instancePath: t + `/replay_protocol_version`,
                schemaPath: `#/properties/replay_protocol_version/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
            if (n !== `rr-input-v1`) {
              let e = {
                instancePath: t + `/replay_protocol_version`,
                schemaPath: `#/properties/replay_protocol_version/const`,
                keyword: `const`,
                params: { allowedValue: `rr-input-v1` },
                message: `must be equal to constant`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          }
          if (e.assets_manifest_version !== void 0) {
            let n = e.assets_manifest_version;
            if (typeof n == `string`) {
              if (s(n) < 1) {
                let e = {
                  instancePath: t + `/assets_manifest_version`,
                  schemaPath: `#/properties/assets_manifest_version/minLength`,
                  keyword: `minLength`,
                  params: { limit: 1 },
                  message: `must NOT have fewer than 1 characters`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
            } else {
              let e = {
                instancePath: t + `/assets_manifest_version`,
                schemaPath: `#/properties/assets_manifest_version/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          }
          if (e.physics !== void 0) {
            let n = e.physics;
            if (n && typeof n == `object` && !Array.isArray(n)) {
              if (n.version === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `version` },
                  message: `must have required property 'version'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.tickRate === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `tickRate` },
                  message: `must have required property 'tickRate'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.scale === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `scale` },
                  message: `must have required property 'scale'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.unitsPerMeter === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `unitsPerMeter` },
                  message: `must have required property 'unitsPerMeter'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.speed === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `speed` },
                  message: `must have required property 'speed'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.speedCeiling === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `speedCeiling` },
                  message: `must have required property 'speedCeiling'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.gravity === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `gravity` },
                  message: `must have required property 'gravity'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.jump === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `jump` },
                  message: `must have required property 'jump'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.doubleJump === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `doubleJump` },
                  message: `must have required property 'doubleJump'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.coyoteTicks === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `coyoteTicks` },
                  message: `must have required property 'coyoteTicks'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.jumpBufferTicks === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `jumpBufferTicks` },
                  message: `must have required property 'jumpBufferTicks'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.slideTicks === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `slideTicks` },
                  message: `must have required property 'slideTicks'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.slideRecoveryTicks === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `slideRecoveryTicks` },
                  message: `must have required property 'slideRecoveryTicks'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.attackWindup === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `attackWindup` },
                  message: `must have required property 'attackWindup'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.attackActive === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `attackActive` },
                  message: `must have required property 'attackActive'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.attackRecovery === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `attackRecovery` },
                  message: `must have required property 'attackRecovery'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.perfectTicks === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `perfectTicks` },
                  message: `must have required property 'perfectTicks'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.hurtTicks === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `hurtTicks` },
                  message: `must have required property 'hurtTicks'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.bodyWidth === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `bodyWidth` },
                  message: `must have required property 'bodyWidth'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.bodyHeight === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `bodyHeight` },
                  message: `must have required property 'bodyHeight'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.slideWidth === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `slideWidth` },
                  message: `must have required property 'slideWidth'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.slideHeight === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `slideHeight` },
                  message: `must have required property 'slideHeight'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.swordReach === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `swordReach` },
                  message: `must have required property 'swordReach'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              if (n.fatalY === void 0) {
                let e = {
                  instancePath: t + `/physics`,
                  schemaPath: `#/$defs/PhysicsRules/required`,
                  keyword: `required`,
                  params: { missingProperty: `fatalY` },
                  message: `must have required property 'fatalY'`,
                };
                (o === null ? (o = [e]) : o.push(e), c++);
              }
              for (let e in n)
                if (!v.call(K.properties, e)) {
                  let n = {
                    instancePath: t + `/physics`,
                    schemaPath: `#/$defs/PhysicsRules/additionalProperties`,
                    keyword: `additionalProperties`,
                    params: { additionalProperty: e },
                    message: `must NOT have additional properties`,
                  };
                  (o === null ? (o = [n]) : o.push(n), c++);
                }
              if (n.version !== void 0) {
                let e = n.version;
                if (typeof e == `string`) {
                  if (!q.test(e)) {
                    let e = {
                      instancePath: t + `/physics/version`,
                      schemaPath: `#/$defs/PhysicsRules/properties/version/pattern`,
                      keyword: `pattern`,
                      params: { pattern: `^[a-zA-Z0-9._-]{1,100}$` },
                      message: `must match pattern "^[a-zA-Z0-9._-]{1,100}$"`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                } else {
                  let e = {
                    instancePath: t + `/physics/version`,
                    schemaPath: `#/$defs/PhysicsRules/properties/version/type`,
                    keyword: `type`,
                    params: { type: `string` },
                    message: `must be string`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
              }
              if (n.tickRate !== void 0) {
                let e = n.tickRate;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/tickRate`,
                    schemaPath: `#/$defs/PhysicsRules/properties/tickRate/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (e !== 60) {
                  let e = {
                    instancePath: t + `/physics/tickRate`,
                    schemaPath: `#/$defs/PhysicsRules/properties/tickRate/const`,
                    keyword: `const`,
                    params: { allowedValue: 60 },
                    message: `must be equal to constant`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
              }
              if (n.scale !== void 0) {
                let e = n.scale;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/scale`,
                    schemaPath: `#/$defs/PhysicsRules/properties/scale/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/scale`,
                      schemaPath: `#/$defs/PhysicsRules/properties/scale/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/scale`,
                      schemaPath: `#/$defs/PhysicsRules/properties/scale/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.unitsPerMeter !== void 0) {
                let e = n.unitsPerMeter;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/unitsPerMeter`,
                    schemaPath: `#/$defs/PhysicsRules/properties/unitsPerMeter/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/unitsPerMeter`,
                      schemaPath: `#/$defs/PhysicsRules/properties/unitsPerMeter/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/unitsPerMeter`,
                      schemaPath: `#/$defs/PhysicsRules/properties/unitsPerMeter/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.speed !== void 0) {
                let e = n.speed;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/speed`,
                    schemaPath: `#/$defs/PhysicsRules/properties/speed/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/speed`,
                      schemaPath: `#/$defs/PhysicsRules/properties/speed/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/speed`,
                      schemaPath: `#/$defs/PhysicsRules/properties/speed/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.speedCeiling !== void 0) {
                let e = n.speedCeiling;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/speedCeiling`,
                    schemaPath: `#/$defs/PhysicsRules/properties/speedCeiling/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/speedCeiling`,
                      schemaPath: `#/$defs/PhysicsRules/properties/speedCeiling/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/speedCeiling`,
                      schemaPath: `#/$defs/PhysicsRules/properties/speedCeiling/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.gravity !== void 0) {
                let e = n.gravity;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/gravity`,
                    schemaPath: `#/$defs/PhysicsRules/properties/gravity/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/gravity`,
                      schemaPath: `#/$defs/PhysicsRules/properties/gravity/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/gravity`,
                      schemaPath: `#/$defs/PhysicsRules/properties/gravity/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.jump !== void 0) {
                let e = n.jump;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/jump`,
                    schemaPath: `#/$defs/PhysicsRules/properties/jump/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > -1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/jump`,
                      schemaPath: `#/$defs/PhysicsRules/properties/jump/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: -1 },
                      message: `must be <= -1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < -9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/jump`,
                      schemaPath: `#/$defs/PhysicsRules/properties/jump/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: -9007199254740991 },
                      message: `must be >= -9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.doubleJump !== void 0) {
                let e = n.doubleJump;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/doubleJump`,
                    schemaPath: `#/$defs/PhysicsRules/properties/doubleJump/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > -1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/doubleJump`,
                      schemaPath: `#/$defs/PhysicsRules/properties/doubleJump/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: -1 },
                      message: `must be <= -1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < -9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/doubleJump`,
                      schemaPath: `#/$defs/PhysicsRules/properties/doubleJump/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: -9007199254740991 },
                      message: `must be >= -9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.coyoteTicks !== void 0) {
                let e = n.coyoteTicks;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/coyoteTicks`,
                    schemaPath: `#/$defs/PhysicsRules/properties/coyoteTicks/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/coyoteTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/coyoteTicks/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/coyoteTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/coyoteTicks/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.jumpBufferTicks !== void 0) {
                let e = n.jumpBufferTicks;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/jumpBufferTicks`,
                    schemaPath: `#/$defs/PhysicsRules/properties/jumpBufferTicks/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/jumpBufferTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/jumpBufferTicks/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/jumpBufferTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/jumpBufferTicks/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.slideTicks !== void 0) {
                let e = n.slideTicks;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/slideTicks`,
                    schemaPath: `#/$defs/PhysicsRules/properties/slideTicks/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/slideTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/slideTicks/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/slideTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/slideTicks/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.slideRecoveryTicks !== void 0) {
                let e = n.slideRecoveryTicks;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/slideRecoveryTicks`,
                    schemaPath: `#/$defs/PhysicsRules/properties/slideRecoveryTicks/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/slideRecoveryTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/slideRecoveryTicks/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/slideRecoveryTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/slideRecoveryTicks/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.attackWindup !== void 0) {
                let e = n.attackWindup;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/attackWindup`,
                    schemaPath: `#/$defs/PhysicsRules/properties/attackWindup/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/attackWindup`,
                      schemaPath: `#/$defs/PhysicsRules/properties/attackWindup/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/attackWindup`,
                      schemaPath: `#/$defs/PhysicsRules/properties/attackWindup/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.attackActive !== void 0) {
                let e = n.attackActive;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/attackActive`,
                    schemaPath: `#/$defs/PhysicsRules/properties/attackActive/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/attackActive`,
                      schemaPath: `#/$defs/PhysicsRules/properties/attackActive/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/attackActive`,
                      schemaPath: `#/$defs/PhysicsRules/properties/attackActive/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.attackRecovery !== void 0) {
                let e = n.attackRecovery;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/attackRecovery`,
                    schemaPath: `#/$defs/PhysicsRules/properties/attackRecovery/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/attackRecovery`,
                      schemaPath: `#/$defs/PhysicsRules/properties/attackRecovery/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/attackRecovery`,
                      schemaPath: `#/$defs/PhysicsRules/properties/attackRecovery/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.perfectTicks !== void 0) {
                let e = n.perfectTicks;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/perfectTicks`,
                    schemaPath: `#/$defs/PhysicsRules/properties/perfectTicks/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/perfectTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/perfectTicks/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/perfectTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/perfectTicks/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.hurtTicks !== void 0) {
                let e = n.hurtTicks;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/hurtTicks`,
                    schemaPath: `#/$defs/PhysicsRules/properties/hurtTicks/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/hurtTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/hurtTicks/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/hurtTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/hurtTicks/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.bodyWidth !== void 0) {
                let e = n.bodyWidth;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/bodyWidth`,
                    schemaPath: `#/$defs/PhysicsRules/properties/bodyWidth/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/bodyWidth`,
                      schemaPath: `#/$defs/PhysicsRules/properties/bodyWidth/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/bodyWidth`,
                      schemaPath: `#/$defs/PhysicsRules/properties/bodyWidth/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.bodyHeight !== void 0) {
                let e = n.bodyHeight;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/bodyHeight`,
                    schemaPath: `#/$defs/PhysicsRules/properties/bodyHeight/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/bodyHeight`,
                      schemaPath: `#/$defs/PhysicsRules/properties/bodyHeight/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/bodyHeight`,
                      schemaPath: `#/$defs/PhysicsRules/properties/bodyHeight/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.slideWidth !== void 0) {
                let e = n.slideWidth;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/slideWidth`,
                    schemaPath: `#/$defs/PhysicsRules/properties/slideWidth/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/slideWidth`,
                      schemaPath: `#/$defs/PhysicsRules/properties/slideWidth/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/slideWidth`,
                      schemaPath: `#/$defs/PhysicsRules/properties/slideWidth/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.slideHeight !== void 0) {
                let e = n.slideHeight;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/slideHeight`,
                    schemaPath: `#/$defs/PhysicsRules/properties/slideHeight/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/slideHeight`,
                      schemaPath: `#/$defs/PhysicsRules/properties/slideHeight/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/slideHeight`,
                      schemaPath: `#/$defs/PhysicsRules/properties/slideHeight/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.swordReach !== void 0) {
                let e = n.swordReach;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/swordReach`,
                    schemaPath: `#/$defs/PhysicsRules/properties/swordReach/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/swordReach`,
                      schemaPath: `#/$defs/PhysicsRules/properties/swordReach/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/swordReach`,
                      schemaPath: `#/$defs/PhysicsRules/properties/swordReach/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.fatalY !== void 0) {
                let e = n.fatalY;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/fatalY`,
                    schemaPath: `#/$defs/PhysicsRules/properties/fatalY/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 9007199254740991 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/fatalY`,
                      schemaPath: `#/$defs/PhysicsRules/properties/fatalY/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 9007199254740991 },
                      message: `must be <= 9007199254740991`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/fatalY`,
                      schemaPath: `#/$defs/PhysicsRules/properties/fatalY/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.concentrationCap !== void 0) {
                let e = n.concentrationCap;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/concentrationCap`,
                    schemaPath: `#/$defs/PhysicsRules/properties/concentrationCap/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 100 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/concentrationCap`,
                      schemaPath: `#/$defs/PhysicsRules/properties/concentrationCap/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 100 },
                      message: `must be <= 100`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 100 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/concentrationCap`,
                      schemaPath: `#/$defs/PhysicsRules/properties/concentrationCap/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 100 },
                      message: `must be >= 100`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.perfectGain !== void 0) {
                let e = n.perfectGain;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/perfectGain`,
                    schemaPath: `#/$defs/PhysicsRules/properties/perfectGain/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 100 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/perfectGain`,
                      schemaPath: `#/$defs/PhysicsRules/properties/perfectGain/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 100 },
                      message: `must be <= 100`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/perfectGain`,
                      schemaPath: `#/$defs/PhysicsRules/properties/perfectGain/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.normalGain !== void 0) {
                let e = n.normalGain;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/normalGain`,
                    schemaPath: `#/$defs/PhysicsRules/properties/normalGain/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 100 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/normalGain`,
                      schemaPath: `#/$defs/PhysicsRules/properties/normalGain/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 100 },
                      message: `must be <= 100`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/normalGain`,
                      schemaPath: `#/$defs/PhysicsRules/properties/normalGain/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.normalBreaksCombo !== void 0) {
                let e = n.normalBreaksCombo;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/normalBreaksCombo`,
                    schemaPath: `#/$defs/PhysicsRules/properties/normalBreaksCombo/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/normalBreaksCombo`,
                      schemaPath: `#/$defs/PhysicsRules/properties/normalBreaksCombo/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 1 },
                      message: `must be <= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 0 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/normalBreaksCombo`,
                      schemaPath: `#/$defs/PhysicsRules/properties/normalBreaksCombo/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 0 },
                      message: `must be >= 0`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.specialReach !== void 0) {
                let e = n.specialReach;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/specialReach`,
                    schemaPath: `#/$defs/PhysicsRules/properties/specialReach/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 1e6 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/specialReach`,
                      schemaPath: `#/$defs/PhysicsRules/properties/specialReach/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 1e6 },
                      message: `must be <= 1000000`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/specialReach`,
                      schemaPath: `#/$defs/PhysicsRules/properties/specialReach/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
              if (n.specialFxTicks !== void 0) {
                let e = n.specialFxTicks;
                if (typeof e != `number` || e % 1 || isNaN(e) || !isFinite(e)) {
                  let e = {
                    instancePath: t + `/physics/specialFxTicks`,
                    schemaPath: `#/$defs/PhysicsRules/properties/specialFxTicks/type`,
                    keyword: `type`,
                    params: { type: `integer` },
                    message: `must be integer`,
                  };
                  (o === null ? (o = [e]) : o.push(e), c++);
                }
                if (typeof e == `number` && isFinite(e)) {
                  if (e > 60 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/specialFxTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/specialFxTicks/maximum`,
                      keyword: `maximum`,
                      params: { comparison: `<=`, limit: 60 },
                      message: `must be <= 60`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                  if (e < 1 || isNaN(e)) {
                    let e = {
                      instancePath: t + `/physics/specialFxTicks`,
                      schemaPath: `#/$defs/PhysicsRules/properties/specialFxTicks/minimum`,
                      keyword: `minimum`,
                      params: { comparison: `>=`, limit: 1 },
                      message: `must be >= 1`,
                    };
                    (o === null ? (o = [e]) : o.push(e), c++);
                  }
                }
              }
            } else {
              let e = {
                instancePath: t + `/physics`,
                schemaPath: `#/$defs/PhysicsRules/type`,
                keyword: `type`,
                params: { type: `object` },
                message: `must be object`,
              };
              (o === null ? (o = [e]) : o.push(e), c++);
            }
          }
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), c++);
        }
        return ((Y.errors = o), c === 0);
      }
      ((Y.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 }),
        (e.RunManifest = X));
      function X(
        e,
        {
          instancePath: t = ``,
          parentData: n,
          parentDataProperty: r,
          rootData: i = e,
          dynamicAnchors: a = {},
        } = {},
      ) {
        let o = null,
          s = 0,
          c = X.evaluated;
        if (
          (c.dynamicProps && (c.props = void 0),
          c.dynamicItems && (c.items = void 0),
          e && typeof e == `object` && !Array.isArray(e))
        ) {
          if (e.manifest_hash === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `manifest_hash` },
              message: `must have required property 'manifest_hash'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          if (e.manifest === void 0) {
            let e = {
              instancePath: t,
              schemaPath: `#/required`,
              keyword: `required`,
              params: { missingProperty: `manifest` },
              message: `must have required property 'manifest'`,
            };
            (o === null ? (o = [e]) : o.push(e), s++);
          }
          for (let n in e)
            if (n !== `manifest_hash` && n !== `manifest`) {
              let e = {
                instancePath: t,
                schemaPath: `#/additionalProperties`,
                keyword: `additionalProperties`,
                params: { additionalProperty: n },
                message: `must NOT have additional properties`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          if (e.manifest_hash !== void 0) {
            let n = e.manifest_hash;
            if (typeof n == `string`) {
              if (!x.test(n)) {
                let e = {
                  instancePath: t + `/manifest_hash`,
                  schemaPath: `#/properties/manifest_hash/pattern`,
                  keyword: `pattern`,
                  params: { pattern: `^[a-f0-9]{64}$` },
                  message: `must match pattern "^[a-f0-9]{64}$"`,
                };
                (o === null ? (o = [e]) : o.push(e), s++);
              }
            } else {
              let e = {
                instancePath: t + `/manifest_hash`,
                schemaPath: `#/properties/manifest_hash/type`,
                keyword: `type`,
                params: { type: `string` },
                message: `must be string`,
              };
              (o === null ? (o = [e]) : o.push(e), s++);
            }
          }
          e.manifest !== void 0 &&
            (Y(e.manifest, {
              instancePath: t + `/manifest`,
              parentData: e,
              parentDataProperty: `manifest`,
              rootData: i,
              dynamicAnchors: a,
            }) ||
              ((o = o === null ? Y.errors : o.concat(Y.errors)),
              (s = o.length)));
        } else {
          let e = {
            instancePath: t,
            schemaPath: `#/type`,
            keyword: `type`,
            params: { type: `object` },
            message: `must be object`,
          };
          (o === null ? (o = [e]) : o.push(e), s++);
        }
        return ((X.errors = o), s === 0);
      }
      X.evaluated = { props: !0, dynamicProps: !1, dynamicItems: !1 };
    })(),
  ).default;
export { d as validators };
