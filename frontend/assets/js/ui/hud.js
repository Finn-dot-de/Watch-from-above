// ui/hud.js
import { state } from '../core/state.js';
import {
    updateUI, draw,
    craftWoodBtn, craftStoneBtn, craftCopperBtn,
    craftIronBtn, craftGoldBtn, craftDiamondBtn
} from './renderer.js';

export function initHUD() {
    craftWoodBtn.addEventListener('click', () => {
        const inv = state.player.inventory;
        if (inv.wood >= 5 && inv.pickaxeTier < 1) { inv.wood -= 5; inv.pickaxeTier = 1; updateUI(); draw(); }
    });
    craftStoneBtn.addEventListener('click', () => {
        const inv = state.player.inventory;
        if (inv.stone >= 10 && inv.wood >= 2 && inv.pickaxeTier < 2) { inv.stone -= 10; inv.wood -= 2; inv.pickaxeTier = 2; updateUI(); draw(); }
    });
    craftCopperBtn.addEventListener('click', () => {
        const inv = state.player.inventory;
        if (inv.copper >= 10 && inv.wood >= 2 && inv.pickaxeTier < 3) { inv.copper -= 10; inv.wood -= 2; inv.pickaxeTier = 3; updateUI(); draw(); }
    });
    craftIronBtn.addEventListener('click', () => {
        const inv = state.player.inventory;
        if (inv.iron >= 10 && inv.wood >= 2 && inv.pickaxeTier < 4) { inv.iron -= 10; inv.wood -= 2; inv.pickaxeTier = 4; updateUI(); draw(); }
    });
    craftGoldBtn.addEventListener('click', () => {
        const inv = state.player.inventory;
        if (inv.gold >= 10 && inv.wood >= 2 && inv.pickaxeTier < 5) { inv.gold -= 10; inv.wood -= 2; inv.pickaxeTier = 5; updateUI(); draw(); }
    });
    craftDiamondBtn.addEventListener('click', () => {
        const inv = state.player.inventory;
        if (inv.diamond >= 10 && inv.wood >= 2 && inv.pickaxeTier < 6) { inv.diamond -= 10; inv.wood -= 2; inv.pickaxeTier = 6; updateUI(); draw(); }
    });
}
