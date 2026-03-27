// main.js
import { state } from './core/state.js';
import { canvas, updateUI, draw } from './ui/renderer.js';
import { canMoveTo, mineBlock, placeBlock } from './entities/actions.js';

import { keys, initInput } from './ui/input.js';
import { initHUD } from './ui/hud.js';
import { initStorage } from './utils/storage.js';

// --- 1. INITIALISIERUNG DER UI & EINGABEN ---
initInput();
initHUD();
initStorage();

// --- 2. GAME LOOP & BEWEGUNGS-COOLDOWN ---
let lastMoveTime = 0;
const baseMoveInterval = 120; // Normales Lauftempo an Land
const waterMoveInterval = 350; // Langsameres Schwimmtempo im Wasser

function gameLoop(currentTime) {
    if (!state.player.isInventoryOpen) {
        let moved = false;
        let newX = state.player.x;
        let newY = state.player.y;

        // Prüfen, auf welchem Block der Spieler GERADE steht
        const currentTileId = state.map[state.player.y][state.player.x];
        
        // Dynamischer Cooldown: Wenn im Wasser (2), dann langsam, sonst normal
        const currentMoveInterval = (currentTileId === 2) ? waterMoveInterval : baseMoveInterval;

        // Bewegung prüfen (mit dem jeweils aktiven Cooldown)
        if (currentTime - lastMoveTime > currentMoveInterval) {
            if (keys.w || keys.arrowup) { newY--; state.player.direction = 'up'; moved = true; }
            else if (keys.s || keys.arrowdown) { newY++; state.player.direction = 'down'; moved = true; }
            else if (keys.a || keys.arrowleft) { newX--; state.player.direction = 'left'; moved = true; }
            else if (keys.d || keys.arrowright) { newX++; state.player.direction = 'right'; moved = true; }

            if (moved) {
                if (canMoveTo(newX, newY)) { state.player.x = newX; state.player.y = newY; }
                lastMoveTime = currentTime;
                draw();
            }
        }

        // Aktionen verarbeiten
        if (keys.b) { mineBlock(); }
        if (keys.p) { placeBlock('wood'); keys.p = false; } 
        if (keys.o) { placeBlock('stone'); keys.o = false; }
    }
    requestAnimationFrame(gameLoop);
}

function resizeCanvas() {
    canvas.width = window.innerWidth - 100;
    canvas.height = window.innerHeight - 200;
    draw();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
updateUI();
draw();
requestAnimationFrame(gameLoop);
