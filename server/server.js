import express from "express"
import path from "path"
import bodyParser from "body-parser";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

process.env.DOCKER_SOCK = "unix:/var/run/docker.sock:";

import info from "./routes/info.js"
import containers from "./routes/containers.js"
import images from "./routes/images.js"
import networks from "./routes/networks.js"
import volumes from "./routes/volumes.js"

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
