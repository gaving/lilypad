import path from "node:path";
import { fileURLToPath } from "node:url";

import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import express from "express";
import rateLimit from "express-rate-limit";

import containers from "./routes/containers.js";
import images from "./routes/images.js";
import info from "./routes/info.js";
import networks from "./routes/networks.js";
import volumes from "./routes/volumes.js";

dotenv.config({ quiet: true });

// Rate limiting for static file serving
const staticFileLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});

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
  // Serve only the public subdirectory to avoid exposing server files
  const publicDir = path.join(__dirname, "public");
  app.use(staticFileLimiter, express.static(publicDir));
  app.get("/{*path}", staticFileLimiter, (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
}

const port = process.env.NODE_ENV === "production" ? 8888 : 4000;

app.listen(port, () => console.log(`Serving on *${port}...`));
