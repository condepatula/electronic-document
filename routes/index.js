import express from "express";
import {
  generateDe,
  _getNaturalezasReceptor,
  _getTiposImpuestos,
  _getTiposOperaciones,
  _getTiposTransacciones,
} from "../controllers/index.js";

export const router = express.Router();

router.route("/de/event/generate").post(generateDe);
router.route("/de/tipostransacciones").get(_getTiposTransacciones);
router.route("/de/tiposimpuestos").get(_getTiposImpuestos);
router.route("/de/tiposoperaciones").get(_getTiposOperaciones);
router.route("/de/naturalezasreceptor").get(_getNaturalezasReceptor);

export default router;
