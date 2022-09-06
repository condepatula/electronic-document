import express from "express";
import {
  generateDe,
  _getTiposImpuestos,
  _getTiposOperaciones,
  _getTiposTransacciones,
} from "../controllers/index.js";

export const router = express.Router();

router.route("/de/event/generate").post(generateDe);
router.route("/de/tipostransacciones").get(_getTiposTransacciones);
router.route("/de/tiposimpuestos").get(_getTiposImpuestos);
router.route("/de/tiposoperaciones").get(_getTiposOperaciones);

export default router;
