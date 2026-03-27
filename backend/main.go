package main

import (
	"fmt"
	"log"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

// --- 1. GAME STATE STRUCTS ---

type Inventory struct {
	Wood        int `json:"wood"`
	Stone       int `json:"stone"`
	Iron        int `json:"iron"`
	Copper      int `json:"copper"`
	Gold        int `json:"gold"`
	Diamond     int `json:"diamond"`
	PickaxeTier int `json:"pickaxeTier"`
}

type Discovered struct {
	Wood    bool `json:"wood"`
	Stone   bool `json:"stone"`
	Iron    bool `json:"iron"`
	Copper  bool `json:"copper"`
	Gold    bool `json:"gold"`
	Diamond bool `json:"diamond"`
}

type Player struct {
	ID         string     `json:"id"`
	X          int        `json:"x"`
	Y          int        `json:"y"`
	Color      string     `json:"color"`
	Direction  string     `json:"direction"`
	Inventory  Inventory  `json:"inventory"`
	Discovered Discovered `json:"discovered"`
}

type GameState struct {
	Map          [][]int            `json:"map"`
	Players      map[string]*Player `json:"players"`
	WorldOffsetX int                `json:"worldOffsetX"`
	WorldOffsetY int                `json:"worldOffsetY"`
}

// Nachricht, die wir ans Frontend schicken
type Message struct {
	Type    string      `json:"type"`
	Payload interface{} `json:"payload"`
}

// --- 2. SERVER LOGIK ---

type Server struct {
	clients map[*websocket.Conn]string
	state   *GameState
	mutex   sync.Mutex
	counter int
}

func newServer() *Server {
	// Die initiale Start-Karte aus deinem Frontend
	initialMap := [][]int{
		{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
		{1, 0, 0, 0, 0, 0, 0, 0, 4, 4, 2, 2, 0, 0, 1},
		{1, 0, 3, 0, 0, 0, 0, 4, 4, 2, 2, 2, 0, 0, 1},
		{1, 0, 0, 0, 0, 0, 0, 0, 4, 2, 2, 0, 0, 0, 1},
		{1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 1},
		{1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
		{1, 0, 0, 1, 1, 0, 0, 3, 0, 0, 0, 0, 0, 0, 1},
		{1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
		{1, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1},
		{1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1},
		{1, 0, 3, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 1},
		{1, 0, 0, 0, 0, 4, 2, 2, 2, 4, 0, 0, 0, 0, 1},
		{1, 0, 0, 0, 0, 4, 2, 2, 2, 4, 0, 0, 0, 0, 1},
		{1, 0, 0, 0, 0, 0, 4, 4, 4, 0, 0, 0, 0, 0, 1},
		{1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1},
	}

	return &Server{
		clients: make(map[*websocket.Conn]string),
		state: &GameState{
			Map:          initialMap,
			Players:      make(map[string]*Player),
			WorldOffsetX: 0,
			WorldOffsetY: 0,
		},
		counter: 0,
	}
}

// Broadcast sendet eine Nachricht an alle verbundenen Clients
func (s *Server) broadcast(msg Message) {
	s.mutex.Lock()
	defer s.mutex.Unlock()
	for ws := range s.clients {
		err := ws.WriteJSON(msg)
		if err != nil {
			log.Printf("Fehler beim Broadcast an %s: %v", s.clients[ws], err)
			ws.Close()
			delete(s.clients, ws)
		}
	}
}

func (s *Server) handleConnections(w http.ResponseWriter, r *http.Request) {
	ws, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println("Upgrade-Fehler:", err)
		return
	}
	defer ws.Close()

	s.mutex.Lock()
	s.counter++
	playerID := fmt.Sprintf("player_%d", s.counter)
	s.clients[ws] = playerID

	// Neuen Spieler im State anlegen
	newPlayer := &Player{
		ID:        playerID,
		X:         7, // Startposition Mitte
		Y:         7,
		Color:     "#ff5555",
		Direction: "down",
	}
	s.state.Players[playerID] = newPlayer
	s.mutex.Unlock()

	fmt.Printf("🟢 Spieler beigetreten: %s\n", playerID)

	// Dem neuen Spieler sofort den initialen State UND seine ID schicken
	ws.WriteJSON(Message{
		Type: "welcome",
		Payload: map[string]interface{}{
			"id":    playerID,
			"state": s.state,
		},
	})

	// Allen anderen Bescheid geben, dass sich der State (neuer Spieler) geändert hat
	s.broadcast(Message{
		Type:    "state_update",
		Payload: s.state,
	})

	// Schleife für eingehende Nachrichten
	for {
		var msg map[string]interface{}
		err := ws.ReadJSON(&msg)
		if err != nil {
			fmt.Printf("🔴 Spieler getrennt: %s\n", playerID)
			s.mutex.Lock()
			delete(s.clients, ws)
			delete(s.state.Players, playerID)
			s.mutex.Unlock()
			
			// Update an alle verbleibenden Spieler senden
			s.broadcast(Message{
				Type:    "state_update",
				Payload: s.state,
			})
			break
		}
		fmt.Printf("📩 Nachricht von %s: %v\n", playerID, msg)
	}
}

func main() {
	server := newServer()
	http.HandleFunc("/ws", server.handleConnections)
	fmt.Println("🚀 Server läuft auf http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}