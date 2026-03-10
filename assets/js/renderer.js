// renderer.js
import { TILE_SIZE, COLORS } from './config.js';
import { state } from './state.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');
export const inventoryUI = document.getElementById('inventoryUI');

// UI Elemente
const woodCountUI = document.getElementById('woodCount');
const stoneCountUI = document.getElementById('stoneCount');
const ironCountUI = document.getElementById('ironCount');
const copperCountUI = document.getElementById('copperCount');
const goldCountUI = document.getElementById('goldCount');
const diamondCountUI = document.getElementById('diamondCount');
const pickaxeTierUI = document.getElementById('pickaxeTier');

// Buttons (werden exportiert für Event-Listener in main.js)
export const craftWoodBtn = document.getElementById('craftWoodBtn');
export const craftStoneBtn = document.getElementById('craftStoneBtn');

export function updateUI() {
    const inv = state.player.inventory;
    
    woodCountUI.innerText = inv.wood;
    stoneCountUI.innerText = inv.stone;
    ironCountUI.innerText = inv.iron;
    copperCountUI.innerText = inv.copper;
    goldCountUI.innerText = inv.gold;
    diamondCountUI.innerText = inv.diamond;

    let tierText = "Keine";
    if (inv.pickaxeTier === 1) tierText = "Holz";
    if (inv.pickaxeTier === 2) tierText = "Stein";
    pickaxeTierUI.innerText = tierText;
    
    // Buttons aktivieren/deaktivieren
    craftWoodBtn.disabled = !(inv.wood >= 5 && inv.pickaxeTier < 1);
    craftStoneBtn.disabled = !(inv.stone >= 10 && inv.wood >= 2 && inv.pickaxeTier < 2);
    
    if (inv.pickaxeTier >= 1) craftWoodBtn.innerText = "Holz-Hacke (Im Besitz)";
    if (inv.pickaxeTier >= 2) craftStoneBtn.innerText = "Stein-Hacke (Im Besitz)";
}

export function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const viewCols = Math.ceil(canvas.width / TILE_SIZE);
    const viewRows = Math.ceil(canvas.height / TILE_SIZE);
    
    const cameraX = state.player.x - Math.floor(viewCols / 2);
    const cameraY = state.player.y - Math.floor(viewRows / 2);

    for (let y = 0; y < viewRows; y++) {
        for (let x = 0; x < viewCols; x++) {
            const mapX = cameraX + x; 
            const mapY = cameraY + y;

            if (mapY >= 0 && mapY < state.map.length && mapX >= 0 && mapX < state.map[0].length) {
                ctx.fillStyle = COLORS[state.map[mapY][mapX]];
            } else {
                ctx.fillStyle = '#000000';
            }
            
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.strokeRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
    }

    const screenPx = (state.player.x - cameraX) * TILE_SIZE;
    const screenPy = (state.player.y - cameraY) * TILE_SIZE;
    
    ctx.fillStyle = state.player.color;
    const padding = 6; 
    const size = TILE_SIZE - padding * 2;
    ctx.fillRect(screenPx + padding, screenPy + padding, size, size);

    // Blickrichtung
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    const dir = state.player.direction;
    if (dir === 'up')    ctx.fillRect(screenPx + padding, screenPy + padding, size, 4);
    if (dir === 'down')  ctx.fillRect(screenPx + padding, screenPy + padding + size - 4, size, 4);
    if (dir === 'left')  ctx.fillRect(screenPx + padding, screenPy + padding, 4, size);
    if (dir === 'right') ctx.fillRect(screenPx + padding + size - 4, screenPy + padding, 4, size);
}