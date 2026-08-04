// hud.js — dewdrop health pips, gun-jump charge pellets, ticket counter,
// boss bar, message popups. Top-left, HK-style.

import { C, PAL } from '../constants.js';
import { drawText } from '../engine/text.js';
import { drawSprite } from '../engine/sprites.js';

function drawPip(ctx, x, y, filled) {
  // 7×9 dewdrop
  ctx.fillStyle = PAL.ui;
  ctx.fillRect(x + 3, y, 1, 2);
  ctx.fillRect(x + 2, y + 1, 3, 2);
  ctx.fillRect(x + 1, y + 3, 5, 4);
  ctx.fillRect(x + 2, y + 7, 3, 1);
  if (filled) {
    ctx.fillStyle = PAL.dew;
    ctx.fillRect(x + 3, y + 1, 1, 1);
    ctx.fillRect(x + 2, y + 2, 3, 1);
    ctx.fillRect(x + 2, y + 3, 3, 4);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 2, y + 3, 1, 2);
  } else {
    ctx.fillStyle = PAL.bgDeep;
    ctx.fillRect(x + 2, y + 2, 3, 5);
  }
}

export function drawHud(ctx, game) {
  const p = game.player;

  // health pips
  for (let i = 0; i < C.playerHP; i++) drawPip(ctx, 5 + i * 9, 5, i < p.hp);

  // gun-jump charges (amber pellets) — only once the gun exists
  if (game.flags.gun) {
    for (let i = 0; i < C.gunjumpCharges; i++) {
      ctx.fillStyle = i < p.gunjumpCharges ? PAL.bee : PAL.bgDeep;
      ctx.fillRect(6 + i * 6, 16, 3, 3);
      ctx.fillStyle = PAL.outline;
      ctx.fillRect(6 + i * 6, 19, 3, 1);
    }
  }

  // tickets
  drawSprite(ctx, 'props.ticket', 0, C.VIEW_W - 26, 12);
  drawText(ctx, String(game.tickets), C.VIEW_W - 18, 6, PAL.ui);

  // boss bar
  if (game.boss && game.boss.awake && !game.boss.dead) {
    const w = 120, x = (C.VIEW_W - w) / 2, y = C.VIEW_H - 14;
    ctx.fillStyle = PAL.bgDeep;
    ctx.fillRect(x - 1, y - 1, w + 2, 6);
    ctx.fillStyle = PAL.outline;
    ctx.fillRect(x, y, w, 4);
    ctx.fillStyle = PAL.enemy;
    ctx.fillRect(x, y, Math.max(0, Math.round(w * game.boss.hp / game.boss.maxHp)), 4);
    drawText(ctx, 'BULLHORN BEETLE', C.VIEW_W / 2, y - 8, PAL.ui, { align: 'center' });
  }

  // message popup
  if (game.messageT > 0 && game.message) {
    const lines = game.message.split('\n');
    const h = lines.length * 6 + 8;
    const y = C.VIEW_H - 40 - h / 2;
    ctx.globalAlpha = Math.min(1, game.messageT * 3);
    ctx.fillStyle = PAL.bgDeep;
    const w = Math.max(...lines.map(l => l.length)) * 4 + 12;
    ctx.fillRect((C.VIEW_W - w) / 2, y - 4, w, h);
    ctx.strokeStyle = PAL.ui; ctx.lineWidth = 1;
    ctx.strokeRect((C.VIEW_W - w) / 2 + 0.5, y - 3.5, w - 1, h - 1);
    drawText(ctx, game.message, C.VIEW_W / 2, y, PAL.ui, { align: 'center' });
    ctx.globalAlpha = 1;
  }

  // level name toast
  if (game.levelToastT > 0) {
    ctx.globalAlpha = Math.min(1, game.levelToastT);
    drawText(ctx, game.levelToast, C.VIEW_W / 2, 40, PAL.ui, { align: 'center', scale: 2 });
    ctx.globalAlpha = 1;
  }
}

export function drawShop(ctx, game) {
  const shop = game.shop;
  ctx.fillStyle = 'rgba(46,34,47,0.85)';
  ctx.fillRect(0, 0, C.VIEW_W, C.VIEW_H);
  drawText(ctx, 'DEW-DROP DISPENSER', C.VIEW_W / 2, 28, PAL.dewHalo, { align: 'center', scale: 2 });
  drawText(ctx, `TICKETS: ${game.tickets}`, C.VIEW_W / 2, 46, PAL.ui, { align: 'center' });

  shop.items.forEach((item, i) => {
    const y = 66 + i * 26;
    const sel = i === game.shopSel;
    const owned = game.flags[item.id];
    if (sel) {
      ctx.fillStyle = PAL.leafDark;
      ctx.fillRect(60, y - 5, C.VIEW_W - 120, 22);
      drawText(ctx, '>', 66, y, PAL.dewHalo);
    }
    drawText(ctx, item.name, 76, y, owned ? PAL.leafLight : sel ? PAL.ui : PAL.bgLight);
    drawText(ctx, owned ? 'OWNED' : `${item.cost} TKT`, C.VIEW_W - 76, y, owned ? PAL.leafLight : game.tickets >= item.cost ? PAL.bee : PAL.enemy, { align: 'right' });
    drawText(ctx, item.desc, 76, y + 8, PAL.bgLight);
  });

  drawText(ctx, 'UP/DOWN: SELECT   X/Z: BUY   ESC: LEAVE', C.VIEW_W / 2, C.VIEW_H - 20, PAL.bgLight, { align: 'center' });
}
