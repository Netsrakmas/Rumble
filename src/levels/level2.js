// level2.js — "Cheese Mines" stub. Proves the add-a-level workflow:
// this file + one line in index.js is ALL it took to add a level.

export default {
  id: 'level2',
  name: 'THE CHEESE MINES',
  music: 'mines',
  start: { room: 'mineEntry', x: 3, y: 8 },
  rooms: [
    {
      id: 'mineEntry',
      name: 'MINES ENTRANCE',
      dark: 0.3,
      map: [
        "##############################",
        "##############################",
        "#............................#",
        "#............................#",
        "#............................#",
        "#..........*......*..........#",
        "#........----....----........#",
        "#............................#",
        "#............................#",
        "#..P......~~~.............B..#",
        "##############################",
        "##############################",
      ],
      entities: [
        { type: 'checkpoint', x: 5, y: 9 },
        { type: 'sign', x: 8, y: 9, text: 'LEVEL 1 COMPLETE!\nYOU ARE THE BEES KNEES' },
        { type: 'sign', x: 20, y: 9, text: 'THE CHEESE MINES AWAIT\nIN THE FULL GAME...' },
        { type: 'door', char: 'B', to: 'level:demoEnd' },
      ],
    },
  ],
};
