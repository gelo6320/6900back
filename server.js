const express = require("express");
const puppeteer = require("puppeteer");
const WebSocket = require("ws");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000; // Use Render's assigned port

// Serve any static files if needed
app.use(express.static("public"));

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

// WebSocket setup on the same server
const wss = new WebSocket.Server({ server });

let totalCoins = 0;

wss.on("connection", (ws) => {
  console.log("WebSocket connection established!");

  ws.on("message", async (message) => {
    const { word } = JSON.parse(message);
    const rating = Math.floor(Math.random() * 10) + 1; // Random rating 1-10
    const coinName = `${word} (Score: ${rating}/10)`;
    const coinDescription = `This is the ${++totalCoins}th coin created by examplescript.py with a score of ${rating}/10.`;

    // Send a redirect action to the frontend
    ws.send(JSON.stringify({ action: "redirect", url: "https://pump.fun/create" }));

    const randomImage = fs
      .readdirSync(path.join(__dirname, "images"))
      .filter((file) => /\.(png|jpg|jpeg)$/i.test(file))[Math.floor(Math.random() * 10)];

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    try {
      await page.goto("https://pump.fun/create");

      // Fill the form with human-like delays
      await page.type("#name", coinName, { delay: 100 });
      await page.type("#ticker", word.slice(0, 5).toUpperCase(), { delay: 100 });
      await page.type("#description", coinDescription, { delay: 100 });

      // Upload the image
      const uploadInput = await page.$("input[type=file]");
      await uploadInput.uploadFile(path.join(__dirname, "images", randomImage));

      // Click deploy
      await page.click("#deploy-button");

      ws.send(JSON.stringify({ status: "success", coinName }));
    } catch (err) {
      console.error("Error:", err);
    } finally {
      await browser.close();
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});