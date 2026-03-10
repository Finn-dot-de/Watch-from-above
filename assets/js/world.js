// world.js
import { state } from './state.js';
import { draw } from './renderer.js';

function getChunkHash(cx, cy) {
    let h = (cx * 374761393) ^ (cy * 668265263);
    h = (h ^ (h >> 13)) * 1274126177;
    return h ^ (h >> 16);
}

function getRandomWallBlock(globalX, globalY) {
    const CHUNK_SIZE = 26;
    const cx = Math.floor(globalX / CHUNK_SIZE);
    const cy = Math.floor(globalY / CHUNK_SIZE);
    
    const hash = getChunkHash(cx, cy);
    
    if (Math.abs(hash % 100) < 80) {
        const localX = Math.abs((hash * 17) % CHUNK_SIZE);
        const localY = Math.abs((hash * 31) % CHUNK_SIZE);
        
        if (globalX === cx * CHUNK_SIZE + localX && globalY === cy * CHUNK_SIZE + localY) {
            return 6; // Rosa Block
        }
    }
    return 1; // Stein
}

export function expandMap(direction) {
    const cols = state.map[0].length;
    const rows = state.map.length;
    
    if (direction === 'top') {
        state.worldOffsetY--;
        const newRow = [];
        for(let x = 0; x < cols; x++) newRow.push(getRandomWallBlock(state.worldOffsetX + x, state.worldOffsetY));
        state.map.unshift(newRow);
        state.player.y++;
    } else if (direction === 'bottom') {
        const newRow = [];
        for(let x = 0; x < cols; x++) newRow.push(getRandomWallBlock(state.worldOffsetX + x, state.worldOffsetY + rows));
        state.map.push(newRow);
    } else if (direction === 'left') {
        state.worldOffsetX--;
        for(let y = 0; y < rows; y++) state.map[y].unshift(getRandomWallBlock(state.worldOffsetX, state.worldOffsetY + y));
        state.player.x++;
    } else if (direction === 'right') {
        for(let y = 0; y < rows; y++) state.map[y].push(getRandomWallBlock(state.worldOffsetX + cols, state.worldOffsetY + y));
    }
}

export function checkAndFixEdges() {
    let fixed = true;
    while(fixed) {
        fixed = false;
        if (state.map[0].some(t => t !== 1 && t !== 6)) { expandMap('top'); fixed = true; }
        if (state.map[state.map.length-1].some(t => t !== 1 && t !== 6)) { expandMap('bottom'); fixed = true; }
        if (state.map.some(row => row[0] !== 1 && row[0] !== 6)) { expandMap('left'); fixed = true; }
        if (state.map.some(row => row[row.length-1] !== 1 && row[row.length-1] !== 6)) { expandMap('right'); fixed = true; }
    }
}

export function spawnTrees() {
    let currentTreeCount = 0;
    for (let y = 0; y < state.map.length; y++) {
        for (let x = 0; x < state.map[0].length; x++) {
            if (state.map[y][x] === 3) currentTreeCount++;
        }
    }
    
    if (currentTreeCount <= 2) {
        let spawned = false; 
        let attempts = 0;
        
        while (!spawned && attempts < 50) {
            const rx = Math.floor(Math.random() * state.map[0].length);
            const ry = Math.floor(Math.random() * state.map.length);
            
            if (state.map[ry][rx] === 0 && !(rx === state.player.x && ry === state.player.y)) {
                state.map[ry][rx] = 3; 
                spawned = true; 
                draw();
            }
            attempts++;
        }
    }
}