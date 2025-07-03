const express = require("express");
const serveIndex = require("serve-index");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// Serve all public files
app.use(express.static(path.join(__dirname, "public")));

// ✅ Serve /songs folder and its nested content (e.g., info.json, images, mp3s)
app.use("/songs", express.static(path.join(__dirname, "public/songs")));

// Show directory listing (optional)
app.use("/songs", serveIndex(path.join(__dirname, "public/songs"), { icons: true }));

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
