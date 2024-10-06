import express from "express";
import pkg from "pg";
const { Client } = pkg;

import { notifyClients } from "./ws-server.js"; // Import the WebSocket notification function

const app = express();
const PORT = 3001;

// Middleware to parse JSON requests
app.use(express.json());

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

// Express endpoint to add an incident
app.post("/api/sms", async (req, res) => {
  const data = req.body;
  const house_no = String(data.house_no);

  try {
    const result = await pgClient.query(
      `SELECT coordinates, owner FROM accounts WHERE house_no = $1`,
      [house_no]
    );

    if (result.rows.length === 0) {
      return res
        .status(400)
        .json({ message: `No account found for house number ${house_no}` });
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

    // Insert into reports table
    await pgClient.query(
      `INSERT INTO reports (house_no, owner, coordinates, image_url, date_and_time_recorded) 
       VALUES ($1, $2, $3, $4, NOW())`,
      [house_no, owner, coordinates, image_url]
    );

    // Notify WebSocket clients
    const message = JSON.stringify({ house_no, coordinates, owner, image_url });
    notifyClients(message); // Notify WebSocket clients using the imported function

    res.status(200).json({ message: "Data inserted successfully" });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).json({ message: "Reports creation failed" });
  }
});

// Start the Express server
app.listen(PORT, () => {
  console.log(`REST API server running on port ${PORT}`);
});
