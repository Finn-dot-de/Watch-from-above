// entities/actions.js
import { state } from '../core/state.js';
import { expandMap, checkAndFixEdges } from '../world/map.js';
import { updateUI, draw } from '../ui/renderer.js';

export function canMoveTo(newX, newY) {
    if (newX < 0 || newX >= state.map[0].length || newY < 0 || newY >= state.map.length) return false;
    const t = state.map[newY][newX];
    return !(t === 1 || t === 3 || t === 6 || t === 7 || t === 8 || t === 9 || t === 10);
}

export function mineBlock() {
    const p = state.player;
    let baseTargetX = p.x; 
    let baseTargetY = p.y;
    
    // Den Haupt-Zielblock bestimmen
    if (p.direction === 'up') baseTargetY--; 
    if (p.direction === 'down') baseTargetY++;
    if (p.direction === 'left') baseTargetX--; 
    if (p.direction === 'right') baseTargetX++;

    let targets = [];
    const tier = p.inventory.pickaxeTier;

    // --- NEUE BEREICHS-LOGIK FÜR DIE UPGRADES ---
    if (tier <= 1) { 
        // Tier 0 & 1 (Keine / Holz): Genau 1 Block
        targets.push({x: baseTargetX, y: baseTargetY});
    } 
    else if (tier === 2) { 
        // Tier 2 (Stein): 3 Blöcke in einer Linie (quer zur Blickrichtung)
        if (p.direction === 'up' || p.direction === 'down') {
            targets.push({x: baseTargetX - 1, y: baseTargetY}); 
            targets.push({x: baseTargetX, y: baseTargetY}); 
            targets.push({x: baseTargetX + 1, y: baseTargetY});
        } else {
            targets.push({x: baseTargetX, y: baseTargetY - 1}); 
            targets.push({x: baseTargetX, y: baseTargetY}); 
            targets.push({x: baseTargetX, y: baseTargetY + 1});
        }
    } 
    else if (tier === 3) {
        // Tier 3 (Kupfer): Ein Plus-Zeichen (5 Blöcke)
        targets.push({x: baseTargetX, y: baseTargetY});
        targets.push({x: baseTargetX - 1, y: baseTargetY});
        targets.push({x: baseTargetX + 1, y: baseTargetY});
        targets.push({x: baseTargetX, y: baseTargetY - 1});
        targets.push({x: baseTargetX, y: baseTargetY + 1});
    }
    else if (tier === 4 || tier === 5) {
        // Tier 4 & 5 (Eisen / Gold): 3x3 Quadrat
        for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
                targets.push({x: baseTargetX + dx, y: baseTargetY + dy});
            }
        }
        // Gold bekommt noch extra Reichweite nach vorne (als Bonus)
        if (tier === 5) {
            if (p.direction === 'up') targets.push({x: baseTargetX, y: baseTargetY - 2});
            if (p.direction === 'down') targets.push({x: baseTargetX, y: baseTargetY + 2});
            if (p.direction === 'left') targets.push({x: baseTargetX - 2, y: baseTargetY});
            if (p.direction === 'right') targets.push({x: baseTargetX + 2, y: baseTargetY});
        }
    }
    else if (tier >= 6) {
        // Tier 6 (Diamant): Riesiges 5x5 Quadrat
        for (let dy = -2; dy <= 2; dy++) {
            for (let dx = -2; dx <= 2; dx++) {
                targets.push({x: baseTargetX + dx, y: baseTargetY + dy});
            }
        }
    }

    let pinkBlockMined = false;

    // --- ABBAU-AUSFÜHRUNG FÜR ALLE MARKIERTEN BLÖCKE ---
    targets.forEach(t => {
        // SICHERHEIT: Der Spieler darf nicht den Block abbauen, auf dem er gerade selbst steht
        if (t.x === p.x && t.y === p.y) return;

        // Prüfen, ob der Block innerhalb der Kartengrenzen liegt
        if (t.x >= 0 && t.x < state.map[0].length && t.y >= 0 && t.y < state.map.length) {
            const tile = state.map[t.y][t.x];
            
            if (tile === 3) { state.map[t.y][t.x] = 0; p.inventory.wood++; p.discovered.wood = true; } 
            else if (tile === 5) { state.map[t.y][t.x] = 2; p.inventory.wood++; p.discovered.wood = true; }
            else if (tile === 1 && p.inventory.pickaxeTier >= 1) { state.map[t.y][t.x] = 0; p.inventory.stone++; p.discovered.stone = true; } 
            else if (tile === 6 && p.inventory.pickaxeTier >= 1) { state.map[t.y][t.x] = 0; pinkBlockMined = true; }
            else if (tile === 8 && p.inventory.pickaxeTier >= 2) { state.map[t.y][t.x] = 0; p.inventory.copper++; p.discovered.copper = true; }
            else if (tile === 7 && p.inventory.pickaxeTier >= 2) { state.map[t.y][t.x] = 0; p.inventory.iron++; p.discovered.iron = true; }
            else if (tile === 9 && p.inventory.pickaxeTier >= 4) { state.map[t.y][t.x] = 0; p.inventory.gold++; p.discovered.gold = true; } 
            else if (tile === 10 && p.inventory.pickaxeTier >= 4) { state.map[t.y][t.x] = 0; p.inventory.diamond++; p.discovered.diamond = true; } 
        }
    });

    if (pinkBlockMined) {
        const radius = Math.floor(Math.random() * 6) + 3;
        
        for(let i = 0; i <= radius + 1; i++) {
            expandMap('top'); expandMap('bottom'); expandMap('left'); expandMap('right');
        }
        
        const explosionX = baseTargetX + radius + 2;
        const explosionY = baseTargetY + radius + 2;
        const isOasis = Math.random() < 0.4;

        for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
                const dist = Math.sqrt(dx*dx + dy*dy);
                let tileType = 0; 

                if (dist <= radius) {
                    if (isOasis) {
                        if (dist <= radius * 0.4) tileType = 2; 
                        else if (dist <= radius * 0.7) tileType = Math.random() < 0.8 ? 4 : 0; 
                        else if (Math.random() < 0.03) tileType = 3; 
                    } else {
                        const rand = Math.random();
                        if (rand < 0.005) tileType = 10; 
                        else if (rand < 0.025) tileType = 9; 
                        else if (rand < 0.065) tileType = 8; 
                        else if (rand < 0.145) tileType = 7; 
                        else if (Math.random() < 0.03) tileType = 3; 
                    }
                    state.map[explosionY + dy][explosionX + dx] = tileType;
                }
            }
        }
    }

    checkAndFixEdges();
    updateUI();
    draw();
}

export function placeBlock(material = 'wood') {
    const p = state.player;
    
    // Vorab prüfen, ob überhaupt genug Material da ist
    if (material === 'wood' && p.inventory.wood <= 0) return;
    if (material === 'stone' && p.inventory.stone <= 0) return;
    
    let targetX = p.x; 
    let targetY = p.y;
    
    if (p.direction === 'up') targetY--; 
    if (p.direction === 'down') targetY++;
    if (p.direction === 'left') targetX--; 
    if (p.direction === 'right') targetX++;

    if (targetX >= 0 && targetX < state.map[0].length && targetY >= 0 && targetY < state.map.length) {
        const t = state.map[targetY][targetX];
        
        if (material === 'wood') {
            // Holz kann Brücken auf Wasser bauen (5) oder als Block auf Gras stehen (3)
            if (t === 2) { 
                state.map[targetY][targetX] = 5; 
                p.inventory.wood--; 
                updateUI(); draw(); 
            } 
            else if (t === 0) { 
                state.map[targetY][targetX] = 3; 
                p.inventory.wood--; 
                updateUI(); draw(); 
            }
        } 
        else if (material === 'stone') {
            // Stein kann auf Gras (0), Sand (4) oder ins Wasser (2) platziert werden
            if (t === 0 || t === 4 || t === 2) { 
                state.map[targetY][targetX] = 1; 
                p.inventory.stone--; 
                updateUI(); draw(); 
            }
        }
    }
}