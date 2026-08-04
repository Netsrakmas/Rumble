// index.js — the level registry. Adding a level = one import + one line here.

import level1 from './level1.js';
import level2 from './level2.js';

export const LEVELS = {
  [level1.id]: level1,
  [level2.id]: level2,
};
