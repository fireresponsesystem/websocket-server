import express from "express";
import { WebSocketServer } from "ws";
import fs from "fs";
import https from "https";

const app = express();
const HTTP_PORT = 3002; // Change this as needed

// Load your SSL certificate and key
const serverOptions = {
  key: fs.readFileSync("./private.key"),
  cert: fs.readFileSync("./certificate.crt"),
};

// Middleware to parse JSON requests
app.use(express.json()); // Using built-in JSON middleware

// Create HTTPS server
const server = https.createServer(serverOptions, app);

// Create WebSocket server
const wss = new WebSocketServer({ server });

// Handle incoming WebSocket connections
wss.on("connection", (ws) => {
  console.log("New client connected");

  // Optional: Handle messages from clients
  ws.on("message", (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Handle WebSocket errors
wss.on("error", (error) => {
  console.error("WebSocket error:", error);
});

// HTTP endpoint for notifications
app.post("/notify", (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).send("Message is required");
  }

  console.log("Received notification:", message); // Log received message

  // Broadcast the message to all connected WebSocket clients
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });

  res.status(200).send("Notification sent");
});

// Start the HTTPS server
server.listen(HTTP_PORT, () => {
  console.log(`Server running on https://localhost:${HTTP_PORT}`);
});

// Handle server errors
server.on("error", (err) => {
  console.error("Server error:", err);
});
