function zeroPadNumber(t) {
  let e;
  for (e = '' + t; e.length < 4; ) e = '0' + e;
  return e;
}

function convertToEpochMillis(t, e) {
  let n,
    o,
    r,
    s,
    a,
    c,
    l = '';
  const result =
    ((a = 65535 & e),
    (s = (e >> 16) & 65535),
    t < 0 && (t = -t),
    (r = 65535 & t),
    (o = (t >> 16) & 65535),
    (a = 656 * o + 7296 * r + 5536 * s + a),
    (c = parseInt(a / 1e4, 10)),
    (a %= 1e4),
    (s = c + 7671 * o + 9496 * r + 6 * s),
    (c = parseInt(s / 1e4, 10)),
    (s %= 1e4),
    (r = c + 4749 * o + 42 * r),
    (c = parseInt(r / 1e4, 10)),
    (r %= 1e4),
    (o = c + 281 * o),
    (c = parseInt(o / 1e4, 10)),
    (o %= 1e4),
    (n = c),
    0 !== n && (l += n.toString()),
    0 !== l.length ? (l += zeroPadNumber(o)) : 0 !== o && (l += o.toString()),
    0 !== l.length ? (l += zeroPadNumber(r)) : 0 !== r && (l += r.toString()),
    0 !== l.length ? (l += zeroPadNumber(s)) : 0 !== s && (l += s.toString()),
    0 !== l.length ? (l += zeroPadNumber(a)) : (l += a.toString()),
    l);

  return parseInt(result, 10);
}

module.exports = convertToEpochMillis;
