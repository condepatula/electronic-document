import { getTipoDeByCode } from "./database/index.js";

const data = {
  timbrado: {
    tipoDE: "FCR",
    numeroDocumento: 1234567,
  },
};
const tipo = await getTipoDeByCode(
  data.timbrado.tipoDE,
  data.timbrado.numeroDocumento
);
console.log(tipo);
