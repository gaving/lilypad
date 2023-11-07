import express from "express";
import got from "got";

const router = express.Router();

const DOCKER_SOCK = process.env.DOCKER_SOCK;

const INFO = `${DOCKER_SOCK}/info`;

router.get("/", async (req, res) => {
  console.log(INFO);

  try {
    const data = await got(INFO);
    res.send(data.body);
  } catch (error) {
    console.error(error);
  }
});

export default router;
