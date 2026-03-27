// core/network.js
import { state } from './state.js';
import { draw, updateUI } from '../ui/renderer.js';

export let socket;

export function initNetwork(onReadyCallback) {
    socket = new WebSocket("ws://localhost:8080/ws");

    socket.onmessage = (event) => {
        const msg = JSON.parse(event.data);

        if (msg.type === "welcome") {
            // Wir speichern unsere ID und übernehmen die Welt vom Server
            state.myId = msg.payload.id;
            state.map = msg.payload.state.map;
            state.players = msg.payload.state.players;
            state.worldOffsetX = msg.payload.state.worldOffsetX;
            state.worldOffsetY = msg.payload.state.worldOffsetY;
            
            console.log("🟢 Verbunden als:", state.myId);
            updateUI();
            onReadyCallback(); // Startet die Game-Loop in main.js
        }
        
        if (msg.type === "state_update") {
            // Jemand anderes hat gejoint oder sich bewegt
            state.map = msg.payload.map;
            state.players = msg.payload.players;
            draw();
        }
    };

    socket.onclose = () => {
        console.warn("🔴 Verbindung zum Server verloren!");
    };
}