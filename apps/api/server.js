import path from "node:path";
import { fileURLToPath } from "node:url";

import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import express from "express";

import containers from "./routes/containers.js";
import images from "./routes/images.js";
import info from "./routes/info.js";
import networks from "./routes/networks.js";
import volumes from "./routes/volumes.js";

dotenv.config({ quiet: true });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

app.use("/api/info", info);
app.use("/api/containers", containers);
app.use("/api/images", images);
app.use("/api/networks", networks);
app.use("/api/volumes", volumes);

// Only serve static files in production mode
// In dev mode, use Vite dev server (port 3000) which proxies API requests to port 4000
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(__dirname, "build", "index.html"));
  });
}

const port = process.env.NODE_ENV === "production" ? 8888 : 4000;

app.listen(port, () => console.log(`Serving on *${port}...`));
