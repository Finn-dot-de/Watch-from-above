// main.js
import { state } from './state.js';
import {
    canvas, inventoryUI, updateUI, draw,
    craftWoodBtn, craftStoneBtn, craftCopperBtn,
    craftIronBtn, craftGoldBtn, craftDiamondBtn
} from './renderer.js';
import { spawnTrees } from './world.js';
import { canMoveTo, mineBlock, placeBlock } from './actions.js';

// --- CRAFTING LOGIK ---
craftWoodBtn.addEventListener('click', () => {
    const inv = state.player.inventory;
    if (inv.wood >= 5 && inv.pickaxeTier < 1) {
        inv.wood -= 5; inv.pickaxeTier = 1; updateUI(); draw();
    }
});
craftStoneBtn.addEventListener('click', () => {
    const inv = state.player.inventory;
    if (inv.stone >= 10 && inv.wood >= 2 && inv.pickaxeTier < 2) {
        inv.stone -= 10; inv.wood -= 2; inv.pickaxeTier = 2; updateUI(); draw();
    }
});
craftCopperBtn.addEventListener('click', () => {
    const inv = state.player.inventory;
    if (inv.copper >= 10 && inv.wood >= 2 && inv.pickaxeTier < 3) {
        inv.copper -= 10; inv.wood -= 2; inv.pickaxeTier = 3; updateUI(); draw();
    }
});
craftIronBtn.addEventListener('click', () => {
    const inv = state.player.inventory;
    if (inv.iron >= 10 && inv.wood >= 2 && inv.pickaxeTier < 4) {
        inv.iron -= 10; inv.wood -= 2; inv.pickaxeTier = 4; updateUI(); draw();
    }
});
craftGoldBtn.addEventListener('click', () => {
    const inv = state.player.inventory;
    if (inv.gold >= 10 && inv.wood >= 2 && inv.pickaxeTier < 5) {
        inv.gold -= 10; inv.wood -= 2; inv.pickaxeTier = 5; updateUI(); draw();
    }
});
craftDiamondBtn.addEventListener('click', () => {
    const inv = state.player.inventory;
    if (inv.diamond >= 10 && inv.wood >= 2 && inv.pickaxeTier < 6) {
        inv.diamond -= 10; inv.wood -= 2; inv.pickaxeTier = 6; updateUI(); draw();
    }
});

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
    if (e.key === 'p' || e.key === 'P') { placeBlock('wood'); return; }
    if (e.key === 'o' || e.key === 'O') { placeBlock('stone'); return; }

    let newX = p.x;
    let newY = p.y;
    let moved = false;

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { newY--; p.direction = 'up'; moved = true; }
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { newY++; p.direction = 'down'; moved = true; }
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { newX--; p.direction = 'left'; moved = true; }
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { newX++; p.direction = 'right'; moved = true; }

    if (moved) {
        if (canMoveTo(newX, newY)) {
            p.x = newX;
            p.y = newY;
        }
        draw();
    }
});

function resizeCanvas() {
    canvas.width = window.innerWidth - 100;
    canvas.height = window.innerHeight - 200;
    draw();
}

window.addEventListener('resize', resizeCanvas);

resizeCanvas();

updateUI();
draw();

// --- SPEICHER-LOGIK (LocalStorage & JSON-File) ---

const STORAGE_KEY = 'watchFromAbove_save';

// Hilfsfunktion, um geladene Daten sicher in den aktuellen State zu übertragen
function applySaveData(data) {
    if (!data || !data.map || !data.player) return;
    
    state.map = data.map;
    state.player = data.player;
    state.worldOffsetX = data.worldOffsetX || 0;
    state.worldOffsetY = data.worldOffsetY || 0;
    
    updateUI();
    draw();
}

// 1. Beim Spielstart: Prüfen ob ein lokaler Speicherstand existiert
const localSave = localStorage.getItem(STORAGE_KEY);
if (localSave) {
    try {
        applySaveData(JSON.parse(localSave));
        console.log("Lokaler Spielstand erfolgreich geladen.");
    } catch (e) {
        console.error("Fehler beim Lesen des LocalStorage:", e);
    }
}

// 2. Auto-Save: Speichert das Spiel alle 3 Sekunden im Hintergrund
setInterval(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}, 3000);

// 3. JSON Download
document.getElementById('downloadSaveBtn').addEventListener('click', () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", "wafa_savegame.json");
    document.body.appendChild(dlAnchorElem);
    dlAnchorElem.click();
    dlAnchorElem.remove();
});

// 4. JSON Upload
const uploadInput = document.getElementById('uploadSaveInput');

document.getElementById('uploadSaveBtn').addEventListener('click', () => {
    uploadInput.click();
});

uploadInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const parsedData = JSON.parse(event.target.result);
            applySaveData(parsedData);
            // Direkt auch in den LocalStorage schieben
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            alert("Spielstand erfolgreich geladen!");
        } catch (err) {
            alert("Fehler: Die JSON-Datei konnte nicht gelesen werden.");
        }
    };
    reader.readAsText(file);
});

// 5. Spielstand löschen (Hard Reset)
document.getElementById('resetSaveBtn').addEventListener('click', () => {
    if(confirm("Möchtest du deinen Spielstand wirklich komplett löschen? Die Welt wird zurückgesetzt.")) {
        localStorage.removeItem(STORAGE_KEY);
        location.reload();
    }
});