const express = require("express");
const WebSocket = require("ws");

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files if needed
app.use(express.static("public"));

// Start HTTP server
const server = app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

// WebSocket setup
const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  console.log("WebSocket connection established!");

  ws.on("message", (message) => {
    console.log("Received from client:", message);

    try {
      // Parse the message from the client
      const { word } = JSON.parse(message);

      // Send instructions to the client
      ws.send(
        JSON.stringify({
          action: "fillForm",
          url: "https://pump.fun/create",
          fields: {
            name: `${word} Coin`,
            ticker: word.slice(0, 4).toUpperCase(),
            description: `This is a coin created with the word "${word}".`,
          },
          imagePath: "/path/to/image.png", // Replace with the actual image path or URL
        })
      );
    } catch (error) {
      console.error("Error processing message:", error.message);
      ws.send(
        JSON.stringify({
          action: "error",
          message: "Failed to process the message. Please check the input format.",
        })
      );
    }
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});