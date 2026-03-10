// main.js
import { state } from './state.js';
import { inventoryUI, updateUI, draw, craftWoodBtn, craftStoneBtn } from './renderer.js';
import { spawnTrees } from './world.js';
import { canMoveTo, mineBlock, placeBlock } from './actions.js';

// Crafting Event-Listener
craftWoodBtn.addEventListener('click', () => {
    const inv = state.player.inventory;
    if (inv.wood >= 5 && inv.pickaxeTier < 1) {
        inv.wood -= 5; 
        inv.pickaxeTier = 1; 
        updateUI();
    }
});

craftStoneBtn.addEventListener('click', () => {
    const inv = state.player.inventory;
    if (inv.stone >= 10 && inv.wood >= 2 && inv.pickaxeTier < 2) {
        inv.stone -= 10; 
        inv.wood -= 2; 
        inv.pickaxeTier = 2; 
        updateUI();
    }
});

// Tastatur Handling
window.addEventListener('keydown', (e) => {
    const p = state.player;

    if (e.key === 'e' || e.key === 'E') {
        p.isInventoryOpen = !p.isInventoryOpen;
        if (p.isInventoryOpen) { 
            updateUI(); 
            inventoryUI.classList.remove('hidden'); 
        } else { 
            inventoryUI.classList.add('hidden'); 
        }
        return;
    }

    if (p.isInventoryOpen) return;

    if (e.key === 'b' || e.key === 'B') { mineBlock(); return; }
    if (e.key === 'p' || e.key === 'P') { placeBlock(); return; }

    let newX = p.x; 
    let newY = p.y; 
    let moved = false;

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W')    { newY--; p.direction = 'up'; moved = true; }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S')  { newY++; p.direction = 'down'; moved = true; }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A')  { newX--; p.direction = 'left'; moved = true; }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { newX++; p.direction = 'right'; moved = true; }

    if (moved) {
        if (canMoveTo(newX, newY)) { 
            p.x = newX; 
            p.y = newY; 
        }
        draw();
    }
});

// Initialisierung des Spiels
setInterval(spawnTrees, 3000);
updateUI();
draw();