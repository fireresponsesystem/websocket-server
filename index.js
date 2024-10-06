import { WebSocketServer } from "ws";

const PORT = 443; // Define the WebSocket server port
const wss = new WebSocketServer({ port: PORT }); // Create WebSocket server

// Handle incoming WebSocket connections
wss.on("connection", (ws) => {
  console.log("New client connected");

  // Optional: Handle messages from clients
  ws.on("message", (message) => {
    console.log(`Received message from client: ${message}`);

    const parsedMessage = JSON.parse(message); // Parse the received message

    if (parsedMessage.type === "broadcast") {
      // Process the data sent by the server
      const data = parsedMessage.data;
      console.log("Broadcast data received:", data);
    }
    // You can handle incoming messages and send responses if needed
    // For example, broadcasting the received message to all clients
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(
          JSON.stringify({
            type: "broadcast", // Include a type for clarity
            data: parsedMessage,
          })
        );
      }
    });
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
});

// Notify when the server is running
console.log(`WebSocket server running on port ${PORT}`);
