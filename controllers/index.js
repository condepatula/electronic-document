import { generateElectronicDocument } from "../services.js";
import { getTiposImpuestos, getTiposTransacciones } from "../database/index.js";

export const generateDe = async (req, res) => {
  let data = req.body;
  try {
    await generateElectronicDocument(data);

    return res.status(200).send({
      success: true,
      message:
        "Proceso de generación de documento electrónico ha finalizado exitosamente.",
      errors: [],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({
      success: false,
      message: "",
      error: err,
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

export default { generateDe, _getTiposTransacciones, _getTiposImpuestos };
