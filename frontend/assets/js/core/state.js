// state.js

export const state = {
    worldOffsetX: 0,
    worldOffsetY: 0,
    
    // Die initiale Start-Karte
    map: [
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
        [1,0,0,0,0,0,0,0,4,4,2,2,0,0,1],
        [1,0,3,0,0,0,0,4,4,2,2,2,0,0,1],
        [1,0,0,0,0,0,0,0,4,2,2,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,3,0,1],
        [1,0,0,1,1,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,1,1,0,0,3,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,3,0,0,0,0,1],
        [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
        [1,0,3,0,0,0,4,4,4,0,0,0,0,0,1],
        [1,0,0,0,0,4,2,2,2,4,0,0,0,0,1],
        [1,0,0,0,0,4,2,2,2,4,0,0,0,0,1],
        [1,0,0,0,0,0,4,4,4,0,0,0,0,0,1],
        [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    
    // Die Spieler-Daten
    player: {
        x: 7, 
        y: 7,
        color: '#ff5555',
        direction: 'down',
        inventory: {
            wood: 0, stone: 0, iron: 0, copper: 0, gold: 0, diamond: 0, pickaxeTier: 0
        },
        discovered: {
            wood: false, stone: false, iron: false, copper: false, gold: false, diamond: false
        },
        isInventoryOpen: false
    }
};
