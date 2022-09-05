import express from "express";
import { generateDe, _getTiposTransacciones } from "../controllers/index.js";

export const router = express.Router();

router.route("/de/event/generate").post(generateDe);
router.route("/de/tipostransacciones").get(_getTiposTransacciones);

export default router;
