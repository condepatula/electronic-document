import express from "express";
import { generateDe } from "../controllers/index.js";

export const router = express.Router();

router.route("/de/event/generate").post(generateDe);

export default router;
