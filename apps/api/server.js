import path from "node:path";
import { fileURLToPath } from "node:url";

import bodyParser from "body-parser";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
import express from "express";

// app.use(bodyParser.urlencoded({ extended: false }));
import containers from "./routes/containers.js";
import images from "./routes/images.js";
import info from "./routes/info.js";
import networks from "./routes/networks.js";
import volumes from "./routes/volumes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());

app.use("/api/info", info);
app.use("/api/containers", containers);
app.use("/api/images", images);
app.use("/api/networks", networks);
app.use("/api/volumes", volumes);

app.use(express.static(path.join(__dirname, "build")));
app.get("/{*path}", (req, res) => {
  const indexPath = path.join(__dirname, "build", "index.html");
  if (process.env.NODE_ENV === "production") {
    res.sendFile(indexPath);
  } else {
    res.status(404).json({ 
      error: "Not found", 
      message: "Frontend not built. Run pnpm build to build the web app." 
    });
  }
});

const port = process.env.NODE_ENV === "production" ? 8888 : 4000;

app.listen(port, () => console.log(`Serving on *${port}...`));
