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

    // Simulate processing and send instructions to the client
    ws.send(
      JSON.stringify({
        action: "fillForm",
        url: "https://pump.fun/create",
        fields: {
          name: "Example Coin",
          ticker: "EXMP",
          description: "This is an example coin.",
        },
      })
    );
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
  });
});