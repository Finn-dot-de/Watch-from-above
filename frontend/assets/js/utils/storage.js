// utils/storage.js
import { state } from '../core/state.js';
import { updateUI, draw } from '../ui/renderer.js';

const STORAGE_KEY = 'watchFromAbove_save';

export function applySaveData(data) {
    if (!data || !data.map || !data.player) return;
    state.map = data.map;
    state.player = data.player;
    state.worldOffsetX = data.worldOffsetX || 0;
    state.worldOffsetY = data.worldOffsetY || 0;
    updateUI(); draw();
}

export function initStorage() {
    const localSave = localStorage.getItem(STORAGE_KEY);
    if (localSave) {
        try {
            applySaveData(JSON.parse(localSave));
            console.log("Lokaler Spielstand erfolgreich geladen.");
        } catch (e) { console.error("Fehler beim Lesen des LocalStorage:", e); }
    }

    setInterval(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }, 3000);

    document.getElementById('downloadSaveBtn').addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
        const dlAnchorElem = document.createElement('a');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", "wafa_savegame.json");
        document.body.appendChild(dlAnchorElem);
        dlAnchorElem.click(); dlAnchorElem.remove();
    });

    const uploadInput = document.getElementById('uploadSaveInput');
    document.getElementById('uploadSaveBtn').addEventListener('click', () => uploadInput.click());

    uploadInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const parsedData = JSON.parse(event.target.result);
                applySaveData(parsedData);
                localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
                alert("Spielstand erfolgreich geladen!");
            } catch (err) { alert("Fehler: Die JSON-Datei konnte nicht gelesen werden."); }
        };
        reader.readAsText(file);
    });

    document.getElementById('resetSaveBtn').addEventListener('click', () => {
        if(confirm("Möchtest du deinen Spielstand wirklich komplett löschen? Die Welt wird zurückgesetzt.")) {
            localStorage.removeItem(STORAGE_KEY); location.reload();
        }
    });
}
