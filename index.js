import express from "express";
import { WebSocketServer } from "ws";
import bodyParser from "body-parser";
import fs from "fs";
import https from "https";

const app = express();
const PORT = 443;

// Load your SSL certificate and key
const serverOptions = {
  key: fs.readFileSync("./private.key"),
  cert: fs.readFileSync("./certificate.crt"),
};

// Middleware to parse JSON requests
app.use(bodyParser.json());

const server = https.createServer(serverOptions, app);

const wss = new WebSocketServer({ server });
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
