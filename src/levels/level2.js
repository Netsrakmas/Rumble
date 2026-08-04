// level2.js — "Cheese Mines" stub. Proves the add-a-level workflow:
// this file + one line in index.js is ALL it took to add a level.

export default {
  id: 'level2',
  name: 'THE CHEESE MINES',
  start: { room: 'mineEntry', x: 3, y: 8 },
  rooms: [
    {
      id: 'mineEntry',
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
        "#..P.........................#",
        "##############################",
        "##############################",
      ],
      entities: [
        { type: 'sign', x: 8, y: 9, text: 'LEVEL 1 COMPLETE!\nYOU ARE THE BEES KNEES' },
        { type: 'sign', x: 20, y: 9, text: 'CHEESE MINES\nUNDER CONSTRUCTION' },
        { type: 'weevil', x: 24, y: 8 },
      ],
    },
  ],
};
