import express from "express";
import got from "got";

const router = express.Router();

const DOCKER_SOCK = process.env.DOCKER_SOCK;

const VOLUMES = `${DOCKER_SOCK}/volumes`;

router.get("/", async (req, res) => {
  console.log(VOLUMES);

  try {
    const data = await got(VOLUMES);
    res.send(data.body);
  } catch (error) {
    console.error(error);
  }
});

export default router;
