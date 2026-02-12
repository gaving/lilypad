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
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

let port;
process.env.NODE_ENV && process.env.NODE_ENV === "production"
  ? (port = 8888)
  : (port = 4000);

app.listen(port, () => console.log(`Serving on *${port}...`));
