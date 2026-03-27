// ui/input.js
import { state } from '../core/state.js';
import { updateUI, inventoryUI } from './renderer.js';

export const keys = {
    w: false, a: false, s: false, d: false,
    b: false, p: false, o: false,
    arrowup: false, arrowdown: false, arrowleft: false, arrowright: false
};

export function initInput() {
    window.addEventListener('keydown', (e) => {
        const k = e.key.toLowerCase();
        if (k in keys) keys[k] = true;

        if (e.key === 'e' || e.key === 'E') {
            state.player.isInventoryOpen = !state.player.isInventoryOpen;
            if (state.player.isInventoryOpen) {
                updateUI();
                inventoryUI.classList.remove('hidden');
            } else {
                inventoryUI.classList.add('hidden');
            }
        }
    });

    window.addEventListener('keyup', (e) => {
        const k = e.key.toLowerCase();
        if (k in keys) keys[k] = false;
    });
}
