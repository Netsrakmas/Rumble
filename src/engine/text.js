// text.js — tiny 3×5 pixel font renderer. 4 px advance, 6 px line height.

const F = {
  A:'010,101,111,101,101', B:'110,101,110,101,110', C:'011,100,100,100,011',
  D:'110,101,101,101,110', E:'111,100,110,100,111', F:'111,100,110,100,100',
  G:'011,100,101,101,011', H:'101,101,111,101,101', I:'111,010,010,010,111',
  J:'001,001,001,101,010', K:'101,110,100,110,101', L:'100,100,100,100,111',
  M:'101,111,101,101,101', N:'111,101,101,101,101', O:'010,101,101,101,010',
  P:'110,101,110,100,100', Q:'010,101,101,010,001', R:'110,101,110,101,101',
  S:'011,100,010,001,110', T:'111,010,010,010,010', U:'101,101,101,101,111',
  V:'101,101,101,101,010', W:'101,101,101,111,101', X:'101,101,010,101,101',
  Y:'101,101,010,010,010', Z:'111,001,010,100,111',
  '0':'111,101,101,101,111', '1':'010,110,010,010,111', '2':'110,001,010,100,111',
  '3':'110,001,010,001,110', '4':'101,101,111,001,001', '5':'111,100,110,001,110',
  '6':'011,100,110,101,010', '7':'111,001,010,010,010', '8':'010,101,010,101,010',
  '9':'010,101,011,001,110',
  ' ':'000,000,000,000,000', '.':'000,000,000,000,010', ',':'000,000,000,010,100',
  '!':'010,010,010,000,010', '?':'110,001,010,000,010', ':':'000,010,000,010,000',
  '-':'000,000,111,000,000', "'":'010,010,000,000,000', '/':'001,001,010,100,100',
  '+':'000,010,111,010,000', '>':'100,010,001,010,100', '<':'001,010,100,010,001',
  '(':'010,100,100,100,010', ')':'010,001,001,001,010', '*':'101,010,111,010,101',
};

const cache = new Map();

function glyph(ch, color) {
  const key = ch + color;
  let c = cache.get(key);
  if (c) return c;
  const rows = (F[ch] || F['?']).split(',');
  c = document.createElement('canvas');
  c.width = 3; c.height = 5;
  const g = c.getContext('2d');
  g.fillStyle = color;
  for (let y = 0; y < 5; y++)
    for (let x = 0; x < 3; x++)
      if (rows[y][x] === '1') g.fillRect(x, y, 1, 1);
  cache.set(key, c);
  return c;
}

export function drawText(ctx, str, x, y, color, { scale = 1, align = 'left' } = {}) {
  str = String(str).toUpperCase();
  const w = textWidth(str, scale);
  let cx = align === 'center' ? Math.round(x - w / 2) : align === 'right' ? Math.round(x - w) : Math.round(x);
  for (const ch of str) {
    if (ch === '\n') { y += 6 * scale; cx = Math.round(x); continue; }
    if (ch !== ' ') ctx.drawImage(glyph(ch, color), cx, Math.round(y), 3 * scale, 5 * scale);
    cx += 4 * scale;
  }
}

export function textWidth(str, scale = 1) {
  let max = 0, cur = 0;
  for (const ch of String(str)) {
    if (ch === '\n') { max = Math.max(max, cur); cur = 0; continue; }
    cur += 4 * scale;
  }
  return Math.max(max, cur) - (scale); // trailing gap trimmed
}
