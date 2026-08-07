// level1.js — "The Fallen Garden". Pure data: ASCII maps + entities.
// Legend (world.js): # solid  - oneway  ^ thorns  . empty  * ticket  P spawn
// A-H door markers (defined in entities). See LEVELS.md for the authoring guide.
//
// DESIGN PASS 6 (level-design review loop): every room reshaped so the
// signature gun-jump is DEMANDED, not optional. Mandatory chain escalation:
//   descent 1-chain wall -> terraces 1-chain tier -> terraces 2-chain door
//   ledge -> (boots) atrium chimney -> ascent phrased chimney -> boss.
// Reach math (LOCKED, see PROMPT.md): plain jump raises standing row by <=2,
// +1 gun-jump <=4, 2-chain <=5-6, 3-chain <=7. Wall-jump only post-boots.

export default {
  id: 'level1',
  name: 'THE FALLEN GARDEN',
  music: 'garden',
  start: { room: 'descent', x: 2, y: 3 },
  rooms: [

    // ------------------------------------------------------------------
    // 1. DESCENT — three descending plateaus (a diagonal ravine, not a
    // corridor). Geometry forces: first jump (2-tall root step), first
    // crawl (tunnel), and — after the gun pedestal at the ravine floor —
    // the FIRST MANDATORY GUN-JUMP over a 3-tall wall guarding door A.
    // The high tease ledge over the ravine (rise 7 = 3-chain) is the
    // level's mastery flex, visible from the pedestal.
    {
      id: 'descent',
      name: 'THE DESCENT',
      map: [
        "##########################################",
        "##########################################",
        "##......................................##",
        "#........................................#",
        "#.P......................................#",
        "####.....................................#",
        "#........................................#",
        "#........................................#",
        "#........................................#",
        "#..........*....................*........#",
        "#.........###..................##........#",
        "#.........###..................##..*.....#",
        "################...#######...............#",
        "################...#######...............#",
        "################......*...*.........##...#",
        "############################........##...#",
        "############################..*.....##.A.#",
        "##########################################",
        "##########################################",
      ],
      entities: [
        { type: 'door', char: 'A', to: 'terraces', toDoor: 'A' },
        { type: 'sign', x: 5, y: 11, text: 'ARROWS: MOVE\nZ: JUMP' },
        { type: 'sign', x: 17, y: 14, text: 'HOLD DOWN: CRAWL' },
        { type: 'gunPickup', x: 33, y: 16 },
        { type: 'sign', x: 34, y: 16, text: 'IN AIR: AIM DOWN + X\nGUN-JUMP!' },
      ],
    },

    // ------------------------------------------------------------------
    // 2. DEW TERRACES — thorn strips force real run-jumps; a spitter
    // perch guards the risky ticket branch; the exit door sits on a
    // 7-row ledge above a thorn trench: tier (1 gun-jump) then ledge
    // (2-chain). The signature verb is now MANDATORY to leave the room.
    {
      id: 'terraces',
      name: 'DEW TERRACES',
      map: [
        "################################################",
        "################################################",
        "##............................................##",
        "#..............................................#",
        "#..............................................#",
        "#..............................................#",
        "#............................................B.#",
        "#.........................................######",
        "#..........**....##......................*######",
        "#.........----..........................*......#",
        "#...................................*..........#",
        "#..............................................#",
        "#........*...............*.........#####.......#",
        "#..................................#####.......#",
        "#A......^^^.............^^^~~..*...#####.^^^^^^#",
        "################################################",
        "################################################",
        "################################################",
      ],
      entities: [
        { type: 'door', char: 'A', to: 'descent', toDoor: 'A' },
        { type: 'door', char: 'B', to: 'cellar', toDoor: 'A' },
        { type: 'sign', x: 33, y: 14, text: 'CHAIN SHOTS\nTO CLIMB HIGHER!' },
        { type: 'checkpoint', x: 30, y: 14 },
        { type: 'weevil', x: 14, y: 13 },
        { type: 'weevil', x: 20, y: 13 },
        { type: 'spitter', x: 17, y: 7 },
        { type: 'gnat', x: 36, y: 8 },
      ],
    },

    // ------------------------------------------------------------------
    // 3. BRAMBLE CELLAR — verb gauntlet in the dark: short crawl tunnel,
    // thorn strip, then a 2-tile-high ROLL corridor with a weevil inside
    // (jumping over it is geometrically impossible — roll or shoot).
    // A ticket trail arcs up-left to the odd high door (the Dew Grotto).
    // Skilled players can gun-jump onto the corridor roof for a top route.
    {
      id: 'cellar',
      name: 'BRAMBLE CELLAR',
      dark: 0.35,
      map: [
        "############################################",
        "############################################",
        "#..........................................#",
        "#.C........................................#",
        "####..................................+....#",
        "#...*.................*..*...........---...#",
        "#....*..............########...............#",
        "#.....*####.........########...............#",
        "#......####...*.........*..................#",
        "#A......*....^^^..............*.*.........B#",
        "############################################",
        "############################################",
      ],
      entities: [
        { type: 'door', char: 'A', to: 'terraces', toDoor: 'B' },
        { type: 'door', char: 'B', to: 'atrium', toDoor: 'A' },
        { type: 'door', char: 'C', to: 'dewGrotto', toDoor: 'A' },
        { type: 'sign', x: 4, y: 9, text: 'LOW CEILING!\nHOLD DOWN' },
        { type: 'sign', x: 18, y: 9, text: 'TOO LOW TO JUMP.\nROLL! (SHIFT)' },
        { type: 'checkpoint', x: 38, y: 9 },
        { type: 'gnat', x: 12, y: 4 },
        { type: 'gnat', x: 30, y: 4 },
        { type: 'weevil', x: 23, y: 9 },
        { type: 'weevil', x: 26, y: 9 },
      ],
    },

    // ------------------------------------------------------------------
    // 4. THE ATRIUM — vertical hub: vending machine (Burr Boots!),
    // checkpoint, and the wall-jump shaft the boots unlock. The shaft is
    // phrased: a oneway rest mid-climb, a thorned ticket bite in the
    // right wall, and a gnat patrolling the upper gallery.
    {
      id: 'atrium',
      name: 'THE ATRIUM',
      dark: 0.15,
      map: [
        "##############################",
        "##############################",
        "#............................#",
        "#............................#",
        "#....................B.......#",
        "#...................#####---.#",
        "#.......................#...##",
        "#....---................#...##",
        "#.......................#...*#",
        "#.......................#...^#",
        "#..........---..........#...##",
        "#.......................#...##",
        "#.......................#---##",
        "#....*..................#...##",
        "#...---.................#...##",
        "#..............*........#...##",
        "#..............----.....#...##",
        "#.......................#...##",
        "#....*........*.........#...##",
        "#A....*.......*.............##",
        "##############################",
        "##############################",
      ],
      entities: [
        { type: 'door', char: 'A', to: 'cellar', toDoor: 'B' },
        { type: 'door', char: 'B', to: 'ascent', toDoor: 'A' },
        { type: 'checkpoint', x: 9, y: 19 },
        { type: 'vending', x: 19, y: 19, items: [
          { id: 'burrBoots', name: 'BURR BOOTS', desc: 'CLING TO WALLS, JUMP OFF THEM', cost: 12,
            unlockText: 'BURR BOOTS!\nSLIDE DOWN WALLS,\nJUMP BETWEEN THEM!' },
          { id: 'hat', name: 'ACORN CAP', desc: "STYLISH. THAT'S IT.", cost: 6,
            unlockText: 'ACORN CAP!\nLOOKING SHARP.' },
        ] },
        { type: 'sign', x: 22, y: 19, text: 'THE SHAFT CLIMBS\nTO THE HOLLOW' },
        { type: 'gnat', x: 6, y: 7 },
        { type: 'gnat', x: 10, y: 12 },
        { type: 'gnat', x: 14, y: 4 },
      ],
    },

    // ------------------------------------------------------------------
    // 5. BLOOM ASCENT — the chimney is a phrased triptych, not a bare
    // tube: bare warm-up, thorn-bitten middle (tickets dare you to brush
    // the spikes), zigzag insets up top. Oneway rests split the segments.
    // Checkpoint at the base; heal + spitter + gnat guard the summit.
    {
      id: 'ascent',
      name: 'BLOOM ASCENT',
      map: [
        "##############################",
        "##############################",
        "#............................#",
        "#............................#",
        "#.................+.......B..#",
        "#........................#####",
        "#############...##############",
        "#############..###############",
        "#########...........##########",
        "#########.....*.....##########",
        "#########-----------##########",
        "#########...........##########",
        "#########...........##########",
        "#########.....*.....##########",
        "#############..*##############",
        "#############---##############",
        "#############..^##############",
        "#############...##############",
        "#############...##############",
        "#############...##############",
        "#############...##############",
        "#............................#",
        "#.A..........................#",
        "##############################",
        "##############################",
      ],
      entities: [
        { type: 'door', char: 'A', to: 'atrium', toDoor: 'B' },
        { type: 'door', char: 'B', to: 'bossHollow', toDoor: 'A' },
        { type: 'sign', x: 8, y: 22, text: 'WALL-JUMP THE CHIMNEY!\nSOMETHING SNORTS UP THERE' },
        { type: 'checkpoint', x: 11, y: 22 },
        { type: 'checkpoint', x: 22, y: 5 },
        { type: 'spitter', x: 12, y: 5 },
        { type: 'gnat', x: 20, y: 3 },
      ],
    },

    // ------------------------------------------------------------------
    // SECRET: THE DEW GROTTO — reward for the 2-chain up to the odd high
    // door in the cellar. Inside: a thorn bed with stepping islands and a
    // 7-tile gap only a mid-air gun-jump chain can cross. Pure bonus.
    {
      id: 'dewGrotto',
      name: 'THE DEW GROTTO',
      dark: 0.1,
      map: [
        "######################",
        "######################",
        "#....................#",
        "#....................#",
        "#.............*......#",
        "#...........*...*..*.#",
        "#A.................+*#",
        "####.##..##.......####",
        "####.##..##.......####",
        "####^##^^##^^^^^^^####",
        "######################",
        "######################",
        "######################",
      ],
      entities: [
        { type: 'door', char: 'A', to: 'cellar', toDoor: 'C' },
        { type: 'sign', x: 18, y: 6, text: 'YOU FOUND THE DEW GROTTO!\nDONT TELL THE WEEVILS' },
      ],
    },

    // ------------------------------------------------------------------
    // 6. BULLHORN HOLLOW — boss arena with teeth: a thorn strip splits
    // the floor (footsie spacing matters), and the two oneway perches are
    // asymmetric — the low one is inside hop range, the high one is safe
    // but needs a 2-chain to reach mid-fight. No heal inside; earn it.
    {
      id: 'bossHollow',
      name: 'BULLHORN HOLLOW',
      dark: 0.3,
      map: [
        "####################################",
        "####################################",
        "#..................................#",
        "#..................................#",
        "#.......................---........#",
        "#..................................#",
        "#......----........................#",
        "#..................................#",
        "#..................................#",
        "#A..............^^^^^.............B#",
        "####################################",
        "####################################",
        "####################################",
      ],
      entities: [
        { type: 'door', char: 'A', to: 'ascent', toDoor: 'B' },
        { type: 'door', char: 'B', to: 'level:level2', requires: 'trophy', denyText: 'THE GARDEN GATE\nIS SEALED...' },
        { type: 'boss', x: 22, y: 7 },
      ],
    },
  ],
};
