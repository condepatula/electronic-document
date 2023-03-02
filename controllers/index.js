import { generateElectronicDocument } from "../services/local.js";
import {
  getTiposImpuestos,
  getTiposTransacciones,
  getTiposOperaciones,
  getNaturalezasReceptor,
  getTiposIndicadoresPresencia,
  getTiposPago,
  getCondicionesCreditos,
  getMotivosEmisionNotaCredito,
} from "../database/index.js";

export const generateDe = async (req, res) => {
  let data = req.body;
  try {
    const cdc = await generateElectronicDocument(data);

    return res.status(200).send({
      success: true,
      cdc,
      message:
        "Proceso de generación de documento electrónico ha finalizado exitosamente.",
      errors: [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      message: "",
      errors: err,
    });
  }
};

export const _getTiposTransacciones = async (_, res) => {
  try {
    let data = await getTiposTransacciones();
    return res.status(200).send({
      success: true,
      message: "",
      data,
      errors: [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      message: "",
      data: [],
      error: err,
    });
  }
};

export const _getTiposImpuestos = async (_, res) => {
  try {
    let data = await getTiposImpuestos();
    return res.status(200).send({
      success: true,
      message: "",
      data,
      errors: [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      message: "",
      data: [],
      error: err,
    });
  }
};

export const _getTiposOperaciones = async (_, res) => {
  try {
    let data = await getTiposOperaciones();
    return res.status(200).send({
      success: true,
      message: "",
      data,
      errors: [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      message: "",
      data: [],
      error: err,
    });
  }
};

export const _getNaturalezasReceptor = async (_, res) => {
  try {
    let data = await getNaturalezasReceptor();
    return res.status(200).send({
      success: true,
      message: "",
      data,
      errors: [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      message: "",
      data: [],
      error: err,
    });
  }
};

export const _getTiposIndicadoresPresencia = async (_, res) => {
  try {
    let data = await getTiposIndicadoresPresencia();
    return res.status(200).send({
      success: true,
      message: "",
      data,
      errors: [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      message: "",
      data: [],
      error: err,
    });
  }
};

export const _getTiposPago = async (_, res) => {
  try {
    let data = await getTiposPago();
    return res.status(200).send({
      success: true,
      message: "",
      data,
      errors: [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      message: "",
      data: [],
      error: err,
    });
  }
};

export const _getCondicionesCredito = async (_, res) => {
  try {
    let data = await getCondicionesCreditos();
    return res.status(200).send({
      success: true,
      message: "",
      data,
      errors: [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      message: "",
      data: [],
      error: err,
    });
  }
};

export const _getMotivoEmisionNc = async (_, res) => {
  try {
    let data = await getMotivosEmisionNotaCredito();
    return res.status(200).send({
      success: true,
      message: "",
      data,
      errors: [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      message: "",
      data: [],
      error: err,
    });
  }
};

export default {
  generateDe,
  _getTiposTransacciones,
  _getTiposImpuestos,
  _getTiposOperaciones,
  _getNaturalezasReceptor,
  _getTiposIndicadoresPresencia,
  _getTiposPago,
  _getCondicionesCredito,
  _getMotivoEmisionNc,
};
