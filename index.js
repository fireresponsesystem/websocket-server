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

// Notification endpoint
app.post("/notify", (req, res) => {
  const { message } = req.body;
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      client.send(message);
    }
  });
  res.status(200).send("Notification sent");
});

app.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
