import express from "express";
import { WebSocketServer } from "ws";
import pkg from "pg";
import pkgjson from "body-parser";

const { json } = pkgjson; // Import body-parser
const { Client } = pkg;

const app = express();
const PORT = 3000;

// Middleware to parse JSON requests
app.use(express.json());

// Create a WebSocket server
const wss = new WebSocketServer({ port: 8080 });

// PostgreSQL client setup
const pgClient = new Client({
  connectionString:
    "postgres://default:Jg3NV6QuMzfq@ep-restless-hill-14773517-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require",
});

// Connect to PostgreSQL
pgClient
  .connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("Error connecting to PostgreSQL:", err);
  });

// Handle incoming WebSocket connections
wss.on("connection", (ws) => {
  console.log("New client connected");

  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
  });
  ws.on("close", () => {
    console.log("Client disconnected");
  });
});

// Express endpoint to add an incident
app.post("/api/sms", async (req, res) => {
  const data = req.body; // Get the data from the request body

  // Extract house_no and ensure it's a string
  const house_no = String(data.house_no);

  try {
    // Fetch account information based on the house number (use parameterized query)
    const result = await pgClient.query(
      `SELECT coordinates, owner FROM accounts WHERE house_no = $1`,
      [house_no]
    );

    // Check if any account was found
    if (result.rows.length === 0) {
      return res.status(400).json({
        message: `There is no existing account with house id ${house_no}`,
      });
    }

    const { coordinates, owner } = result.rows[0];
    const image_url =
      "https://www.dkiservices.com/wp-content/uploads/2020/02/Is-Food-Safe-to-Eat-After-a-Fire_.jpg";

    // Insert data into the notifications table
    await pgClient.query(
      `INSERT INTO notifications (house_no, owner, coordinates, image_url, date_and_time_recorded) 
       VALUES ($1, $2, $3, $4, NOW())`,
      [house_no, owner, coordinates, image_url]
    );

    // Insert data into the notifications table
    await pgClient.query(
      `INSERT INTO reports (house_no, owner, coordinates, image_url, date_and_time_recorded) 
         VALUES ($1, $2, $3, $4, NOW())`,
      [house_no, owner, coordinates, image_url]
    );

    // Notify all connected WebSocket clients after successful insertion
    const message = JSON.stringify({ house_no, coordinates, owner, image_url });
    wss.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(message);
      }
    });

    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ message: "Reports creation failed" });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`Express server running on port ${PORT}`);
});
