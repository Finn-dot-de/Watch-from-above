// renderer.js
import { TILE_SIZE, COLORS } from './config.js';
import { state } from './state.js';

export const canvas = document.getElementById('gameCanvas');
export const ctx = canvas.getContext('2d');
export const inventoryUI = document.getElementById('inventoryUI');

const woodCountUI = document.getElementById('woodCount');
const stoneCountUI = document.getElementById('stoneCount');
const ironCountUI = document.getElementById('ironCount');
const copperCountUI = document.getElementById('copperCount');
const goldCountUI = document.getElementById('goldCount');
const diamondCountUI = document.getElementById('diamondCount');
const pickaxeTierUI = document.getElementById('pickaxeTier');

export const craftWoodBtn = document.getElementById('craftWoodBtn');
export const craftStoneBtn = document.getElementById('craftStoneBtn');
export const craftCopperBtn = document.getElementById('craftCopperBtn');
export const craftIronBtn = document.getElementById('craftIronBtn');
export const craftGoldBtn = document.getElementById('craftGoldBtn');
export const craftDiamondBtn = document.getElementById('craftDiamondBtn');

export function updateUI() {
    const inv = state.player.inventory;
    const disc = state.player.discovered; 
    
    woodCountUI.innerText = inv.wood;
    woodCountUI.parentElement.style.display = disc.wood ? 'block' : 'none';

    stoneCountUI.innerText = inv.stone;
    stoneCountUI.parentElement.style.display = disc.stone ? 'block' : 'none';

    ironCountUI.innerText = inv.iron;
    ironCountUI.parentElement.style.display = disc.iron ? 'block' : 'none';

    copperCountUI.innerText = inv.copper;
    copperCountUI.parentElement.style.display = disc.copper ? 'block' : 'none';

    goldCountUI.innerText = inv.gold;
    goldCountUI.parentElement.style.display = disc.gold ? 'block' : 'none';

    diamondCountUI.innerText = inv.diamond;
    diamondCountUI.parentElement.style.display = disc.diamond ? 'block' : 'none';

    const craftingHeading = document.querySelectorAll('#inventoryUI h2')[1];
    if (craftingHeading) craftingHeading.style.display = disc.wood ? 'block' : 'none';

    // Buttons erst einblenden, wenn die Hauptressource entdeckt wurde
    craftWoodBtn.style.display = disc.wood ? 'block' : 'none';
    craftStoneBtn.style.display = (disc.wood && disc.stone) ? 'block' : 'none';
    craftCopperBtn.style.display = (disc.wood && disc.copper) ? 'block' : 'none';
    craftIronBtn.style.display = (disc.wood && disc.iron) ? 'block' : 'none';
    craftGoldBtn.style.display = (disc.wood && disc.gold) ? 'block' : 'none';
    craftDiamondBtn.style.display = (disc.wood && disc.diamond) ? 'block' : 'none';

    let tierText = "Keine";
    if (inv.pickaxeTier === 1) tierText = "Holz";
    if (inv.pickaxeTier === 2) tierText = "Stein";
    if (inv.pickaxeTier === 3) tierText = "Kupfer";
    if (inv.pickaxeTier === 4) tierText = "Eisen";
    if (inv.pickaxeTier === 5) tierText = "Gold";
    if (inv.pickaxeTier === 6) tierText = "Diamant";
    
    pickaxeTierUI.innerText = tierText;
    pickaxeTierUI.parentElement.style.display = disc.wood ? 'block' : 'none';
    
    // Deaktivieren, wenn Materialien fehlen oder man schon was Besseres hat
    craftWoodBtn.disabled = !(inv.wood >= 5 && inv.pickaxeTier < 1);
    craftStoneBtn.disabled = !(inv.stone >= 10 && inv.wood >= 2 && inv.pickaxeTier < 2);
    craftCopperBtn.disabled = !(inv.copper >= 10 && inv.wood >= 2 && inv.pickaxeTier < 3);
    craftIronBtn.disabled = !(inv.iron >= 10 && inv.wood >= 2 && inv.pickaxeTier < 4);
    craftGoldBtn.disabled = !(inv.gold >= 10 && inv.wood >= 2 && inv.pickaxeTier < 5);
    craftDiamondBtn.disabled = !(inv.diamond >= 10 && inv.wood >= 2 && inv.pickaxeTier < 6);
    
    // Text anpassen, wenn man die Hacke oder eine bessere besitzt
    if (inv.pickaxeTier >= 1) craftWoodBtn.innerText = "Holz-Hacke (Im Besitz)";
    if (inv.pickaxeTier >= 2) craftStoneBtn.innerText = "Stein-Hacke (Im Besitz)";
    if (inv.pickaxeTier >= 3) craftCopperBtn.innerText = "Kupfer-Hacke (Im Besitz)";
    if (inv.pickaxeTier >= 4) craftIronBtn.innerText = "Eisen-Hacke (Im Besitz)";
    if (inv.pickaxeTier >= 5) craftGoldBtn.innerText = "Gold-Hacke (Im Besitz)";
    if (inv.pickaxeTier >= 6) craftDiamondBtn.innerText = "Diamant-Hacke (Im Besitz)";
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
            const tileX = x * TILE_SIZE;
            const tileY = y * TILE_SIZE;

            if (mapY >= 0 && mapY < state.map.length && mapX >= 0 && mapX < state.map[0].length) {
                const tileId = state.map[mapY][mapX];
                
                if (tileId >= 7 && tileId <= 10) {
                    ctx.fillStyle = COLORS[1]; 
                    ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                    ctx.fillStyle = COLORS[tileId]; 
                    ctx.fillRect(tileX + 4, tileY + 4, 6, 6);
                    ctx.fillRect(tileX + 20, tileY + 6, 4, 4);
                    ctx.fillRect(tileX + 8, tileY + 20, 8, 6);
                    ctx.fillRect(tileX + 22, tileY + 20, 6, 6);
                } else {
                    ctx.fillStyle = COLORS[tileId];
                    ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
                    
                    if (tileId === 3) { 
                        ctx.fillStyle = 'rgba(74, 48, 24, 0.6)';
                        const lw = 4;
                        ctx.fillRect(tileX, tileY + 6, TILE_SIZE, lw);
                        ctx.fillRect(tileX, tileY + 16, TILE_SIZE, lw);
                        ctx.fillRect(tileX, tileY + 26, TILE_SIZE, lw);
                        ctx.fillRect(tileX + 8, tileY + 6, lw, 10);
                        ctx.fillRect(tileX + 20, tileY + 16, lw, 10);
                        ctx.fillStyle = 'rgba(240, 184, 152, 0.2)';
                        ctx.fillRect(tileX, tileY + 10, TILE_SIZE, 2);
                    } else if (tileId === 1) { 
                        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; 
                        ctx.fillRect(tileX + 4, tileY + 4, 8, 8);
                        ctx.fillRect(tileX + 20, tileY + 12, 6, 6);
                        ctx.fillRect(tileX + 8, tileY + 20, 10, 8);
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'; 
                        ctx.fillRect(tileX, tileY, TILE_SIZE, 2);
                        ctx.fillRect(tileX, tileY, 2, TILE_SIZE);
                    } else if (tileId === 2) { 
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'; 
                        ctx.fillRect(tileX + 4, tileY + 8, 12, 2);
                        ctx.fillRect(tileX + 18, tileY + 20, 10, 2);
                        ctx.fillRect(tileX + 8, tileY + 28, 6, 2);
                    } else if (tileId === 4) { 
                        ctx.fillStyle = 'rgba(180, 140, 50, 0.4)'; 
                        ctx.fillRect(tileX + 6, tileY + 6, 2, 2);
                        ctx.fillRect(tileX + 24, tileY + 10, 2, 2);
                        ctx.fillRect(tileX + 12, tileY + 20, 2, 2);
                        ctx.fillRect(tileX + 20, tileY + 26, 2, 2);
                        ctx.fillRect(tileX + 4, tileY + 16, 2, 2);
                    }
                }
            } else {
                ctx.fillStyle = '#000000'; 
                ctx.fillRect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            }
        }
    }

    const screenPx = (state.player.x - cameraX) * TILE_SIZE;
    const screenPy = (state.player.y - cameraY) * TILE_SIZE;
    
    ctx.save();
    ctx.translate(screenPx + TILE_SIZE / 2, screenPy + TILE_SIZE / 2);

    const dir = state.player.direction;
    if (dir === 'right') ctx.rotate(Math.PI / 2);
    if (dir === 'down') ctx.rotate(Math.PI);
    if (dir === 'left') ctx.rotate(-Math.PI / 2);

    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 2;
    
    ctx.beginPath();
    ctx.arc(0, 0, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#2c3e50'; 
    ctx.fill();
    
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;

    // Ring-Farbe je nach Hacken-Tier
    const tier = state.player.inventory.pickaxeTier;
    const tierColors = {
        0: '#ff5555', // Keine
        1: '#8b5a2b', // Holz
        2: '#a0a0a0', // Stein
        3: '#b87333', // Kupfer
        4: '#d8d8d8', // Eisen
        5: '#ffd700', // Gold
        6: '#b9f2ff'  // Diamant
    };
    
    ctx.lineWidth = 3;
    ctx.strokeStyle = tierColors[tier] || '#ffffff';
    ctx.stroke();

    ctx.fillStyle = '#00ffff'; 
    ctx.fillRect(-4, -10, 8, 4);

    ctx.restore();
}