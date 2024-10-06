// WebSocket Server (ws-server.js)
import { WebSocketServer } from "ws";

const PORT = 3002; // WebSocket server port

// Create a WebSocket server
const wss = new WebSocketServer({ port: PORT });

// Handle incoming WebSocket connections
wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("message", (message) => {
    console.log("Received:", message);
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

console.log(`WebSocket server running on port ${PORT}`);

// Function to send a message to all clients
export const notifyClients = (message) => {
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
};
