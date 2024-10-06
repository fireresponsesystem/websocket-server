import express from "express";
import { WebSocketServer } from "ws";
import bodyParser from "body-parser";

const app = express();
const PORT = 3002;

// Middleware to parse JSON requests
app.use(bodyParser.json());

const wss = new WebSocketServer({ port: 80 });

// Handle incoming WebSocket connections
wss.on("connection", (ws) => {
  console.log("New client connected");
});

// HTTP endpoint for notifications
app.post("/notify", (req, res) => {
  const { message } = req.body;
  console.log("Received notification:", message); // Log received message
  try {
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });
    res.status(200).send("Notification sent");
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).send("Failed to send notification");
  }
});
app.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
