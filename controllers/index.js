import { generateElectronicDocument } from "../services.js";

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

export default { generateDe };
