const express = require("express");
const serveIndex = require("serve-index");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Enable directory listing for /songs
app.use(
  "/songs",
  serveIndex(path.join(__dirname, "public/songs"), { icons: true })
);

// Start the server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
