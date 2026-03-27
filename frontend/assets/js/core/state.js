// core/state.js

export const state = {
    myId: null,
    worldOffsetX: 0,
    worldOffsetY: 0,
    map: [], 
    players: {},
    
    // Lokale UI-Zustände (werden nicht übers Netzwerk synchronisiert)
    ui: {
        isInventoryOpen: false
    },

    get player() {
        if (!this.myId || !this.players[this.myId]) return null;
        return this.players[this.myId];
    }
};