import pg from "pg";
import moment from "moment";
import config from "../config.js";

const Pool = pg.Pool;

const pool = new Pool({
  user: config.databaseUser,
  host: config.databaseHost,
  database: config.databaseName,
  password: config.databasePassword,
  port: config.databasePort,
});

export const getTipoDeByCode = (idDe, codigo) => {
  return new Promise(async (resolve, reject) => {
    let param;
    if (typeof codigo === "number") {
      param = codigo.toString();
    } else {
      param = codigo;
    }
    /**Registra log */
    const logMessage = `Obteniendo datos del tipo de documento electrónico.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    /*let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };*/
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT a.tipo_de,
            b.descripcion
            FROM tipo_de_rel_sis_externo a,
            tipo_de b
            WHERE a.tipo_de=b.codigo AND codigo_externo=$1`,
      [param],
      (err, res) => {
        if (err) {
          reject({ origin: "getTipoDeByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getTipoDeByCode",
            details: new Array(
              `No se ha encontrado datos referentes al tipo de documento electrónico en la tabla tipo_de_rel_sis_externo.`
            ),
          });
        }
      }
    );
  });
};

export const getSistemaFacturacionByCode = (idDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos del sistema de facturación.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
            FROM sistema_facturacion a
            WHERE a.por_defecto=true`,
      (err, res) => {
        if (err) {
          reject({ origin: "getSistemaFacturacionByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getSistemaFacturacionByCode",
            details: new Array(
              `No se ha encontrado datos referentes al sistema de facturación en la tabla sistema_facturacion.`
            ),
          });
        }
      }
    );
  });
};

export const getTipoEmisionDeByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos del tipo de emisión del documento electrónico.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
          FROM tipo_emision_de a
          WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({ origin: "getTipoEmisionDeByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getTipoEmisionDeByCode",
            details: new Array(
              `No se ha encontrado datos referentes al tipo de emisión en la tabla tipo_emision_de.`
            ),
          });
        }
      }
    );
  });
};

export const getTiposEmisionesDe = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo tipos de emisiones del documento electrónico.`
    );
    pool.query(
      `SELECT *
            FROM tipo_emision_de`,
      (err, res) => {
        if (err) {
          reject({ origin: "getTiposEmisionesDe", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getTiposEmisionesDe",
            details: new Array(
              `No se han encontrado datos referentes a los tipos de emisiones en la tabla tipo_emision_de.`
            ),
          });
        }
      }
    );
  });
};

export const getTipoTransaccionByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo el tipo de transacción.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                FROM tipo_transaccion a
                WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({ origin: "getTipoTransaccionByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getTipoTransaccionByCode",
            details: new Array(
              `No se ha encontrado datos referentes al tipo de transacción en la tabla tipo_transaccion.`
            ),
          });
        }
      }
    );
  });
};

export const getTiposTransacciones = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo tipos de transacciones.`
    );
    pool.query(
      `SELECT *
              FROM tipo_transaccion`,
      (err, res) => {
        if (err) {
          reject({ origin: "getTiposTransacciones", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getTiposTransacciones",
            details: new Array(
              `No se han encontrado datos referentes a los tipos de transacciones en la tabla tipo_transaccion.`
            ),
          });
        }
      }
    );
  });
};

export const getTipoImpuestoByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos del tipo de impuesto.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                  FROM tipo_impuesto a
                  WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({ origin: "getTipoImpuestoByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getTipoImpuestoByCode",
            details: new Array(
              `No se ha encontrado datos referentes al tipo de impuesto en la tabla tipo_impuesto.`
            ),
          });
        }
      }
    );
  });
};

export const getTiposImpuestos = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los tipos de impuestos.`
    );
    pool.query(
      `SELECT *
                FROM tipo_impuesto`,
      (err, res) => {
        if (err) {
          reject({ origin: "getTiposImpuestos", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getTiposImpuestos",
            details: new Array(
              `No se han encontrado datos referentes a los tipos de impuestos en la tabla tipo_impuesto.`
            ),
          });
        }
      }
    );
  });
};

export const getMonedaByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    let param;
    if (typeof codigo === "number") {
      param = codigo.toString();
    } else {
      param = codigo;
    }
    /**Registra log */
    const logMessage = `Obteniendo datos de la moneda.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM moneda a
                    WHERE a.codigo_externo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({ origin: "getMonedaByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getMonedaByCode",
            details: new Array(
              `No se ha encontrado datos referentes a la moneda en la tabla moneda.`
            ),
          });
        }
      }
    );
  });
};

export const getMonedas = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de las monedas.`
    );
    pool.query(
      `SELECT *
                FROM moneda`,
      (err, res) => {
        if (err) {
          reject({ origin: "getMonedas", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getMonedas",
            details: new Array(
              `No se han encontrado datos referentes a las monedas en la tabla moneda.`
            ),
          });
        }
      }
    );
  });
};

export const getCondicionTipoCambioByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos de la condición del tipo de cambio.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM condicion_tipo_cambio a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({ origin: "getCondicionTipoCambioByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getCondicionTipoCambioByCode",
            details: new Array(
              `No se ha encontrado datos referentes a la condición del tipo de cambio en la tabla condicion_tipo_cambio.`
            ),
          });
        }
      }
    );
  });
};

export const getCondicionesTiposCambios = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de las condiciones del tipo de cambio.`
    );
    pool.query(
      `SELECT *
                FROM condicion_tipo_cambio`,
      (err, res) => {
        if (err) {
          reject({ origin: "getCondicionesTiposCambios", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getCondicionesTiposCambios",
            details: new Array(
              `No se han encontrado datos referentes a las condiciones de los tipos de cambios en la tabla condicion_tipo_cambio.`
            ),
          });
        }
      }
    );
  });
};

export const getCondicionAnticipoByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos de la condición del anticipo.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM condicion_anticipo a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({ origin: "getCondicionAnticipoByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getCondicionAnticipoByCode",
            details: new Array(
              `No se ha encontrado datos referentes a la condición del anticipo en la tabla condicion_anticipo.`
            ),
          });
        }
      }
    );
  });
};

export const getCondicionesAnticipos = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de las condiciones del anticipo.`
    );
    pool.query(
      `SELECT *
                FROM condicion_anticipo`,
      (err, res) => {
        if (err) {
          reject({ origin: "getCondicionesAnticipos", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getCondicionesAnticipos",
            details: new Array(
              `No se han encontrado datos referentes a las condiciones de los anticipos en la tabla condicion_anticipo.`
            ),
          });
        }
      }
    );
  });
};

export const getTipoContribuyenteByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos del tipo de contribuyente.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM tipo_contribuyente a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({ origin: "getTipoContribuyenteByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getTipoContribuyenteByCode",
            details: new Array(
              `No se ha encontrado datos referentes al tipo de contribuyente en la tabla tipo_contribuyente.`
            ),
          });
        }
      }
    );
  });
};

export const getTiposContribuyentes = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los tipos de contribuyentes.`
    );
    pool.query(
      `SELECT *
                FROM tipo_contribuyente`,
      (err, res) => {
        if (err) {
          reject({ origin: "getTiposContribuyentes", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getTiposContribuyentes",
            details: new Array(
              `No se han encontrado datos referentes a los tipos de contribuyentes en la tabla tipo_contribuyente.`
            ),
          });
        }
      }
    );
  });
};

export const getTipoRegimenByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos del tipo de régimen.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM tipo_regimen a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({ origin: "getTipoRegimenByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getTipoRegimenByCode",
            details: new Array(
              `No se ha encontrado datos referentes al tipo de régimen en la tabla tipo_regimen.`
            ),
          });
        }
      }
    );
  });
};

export const getTiposRegimenes = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los tipos de regimenes.`
    );
    pool.query(
      `SELECT *
                FROM tipo_regimen`,
      (err, res) => {
        if (err) {
          reject({ origin: "getTiposRegimenes", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getTiposRegimenes",
            details: new Array(
              `No se han encontrado datos referentes a los tipos de regimenes en la tabla tipo_regimen.`
            ),
          });
        }
      }
    );
  });
};

export const getDepartamentoByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    let param;
    if (typeof codigo === "number") {
      param = codigo.toString();
    } else {
      param = codigo;
    }
    /**Registra log */
    const logMessage = `Obteniendo datos del departamento.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM departamento a
                    WHERE a.codigo_externo=$1`,
      [param],
      (err, res) => {
        if (err) {
          reject({ origin: "getDepartamentoByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getDepartamentoByCode",
            details: new Array(
              `No se ha encontrado datos referentes al departamento en la tabla departamento.`
            ),
          });
        }
      }
    );
  });
};

export const getDepartamentos = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los departamentos.`
    );
    pool.query(
      `SELECT *
                FROM departamento`,
      (err, res) => {
        if (err) {
          reject({ origin: "getDepartamentos", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getDepartamentos",
            details: new Array(
              `No se han encontrado datos referentes a los departamentos en la tabla departamento.`
            ),
          });
        }
      }
    );
  });
};

export const getDistritoByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    let param;
    if (typeof codigo === "number") {
      param = codigo.toString();
    } else {
      param = codigo;
    }
    /**Registra log */
    const logMessage = `Obteniendo datos del distrito.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM distrito a
                    WHERE a.codigo_externo=$1`,
      [param],
      (err, res) => {
        if (err) {
          reject({ origin: "getDistritoByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getDistritoByCode",
            details: new Array(
              `No se ha encontrado datos referentes al distrito en la tabla distrito.`
            ),
          });
        }
      }
    );
  });
};

export const getDistritos = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los distritos.`
    );
    pool.query(
      `SELECT *
                FROM distrito`,
      (err, res) => {
        if (err) {
          reject({ origin: "getDistritos", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getDistritos",
            details: new Array(
              `No se han encontrado datos referentes a los distritos en la tabla distrito.`
            ),
          });
        }
      }
    );
  });
};

export const getCiudadByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    let param;
    if (typeof codigo === "number") {
      param = codigo.toString();
    } else {
      param = codigo;
    }
    /**Registra log */
    const logMessage = `Obteniendo datos del ciudad.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM ciudad a
                    WHERE a.codigo_externo=$1`,
      [param],
      (err, res) => {
        if (err) {
          reject({ origin: "getCiudadByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getCiudadByCode",
            details: new Array(
              `No se ha encontrado datos referentes a la ciudad en la tabla ciudad.`
            ),
          });
        }
      }
    );
  });
};

export const getCiudades = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de las ciudades.`
    );
    pool.query(
      `SELECT *
                FROM ciudad`,
      (err, res) => {
        if (err) {
          reject({ origin: "getCiudades", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getCiudades",
            details: new Array(
              `No se han encontrado datos referentes a las ciudades en la tabla ciudad.`
            ),
          });
        }
      }
    );
  });
};

export const getTipoDocumentoIdentidadByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos del tipo de documento.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM tipo_documento_identidad a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({
            origin: "getTipoDocumentoIdentidadByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getTipoDocumentoIdentidadByCode",
            details: new Array(
              `No se ha encontrado datos referentes al tipo de documento de identidad en la tabla tipo_documento_identidad.`
            ),
          });
        }
      }
    );
  });
};

export const getTiposDocumentosIdentidad = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los tipos de documentos de identidad.`
    );
    pool.query(
      `SELECT *
                FROM tipo_documento_identidad`,
      (err, res) => {
        if (err) {
          reject({ origin: "getTiposDocumentosIdentidad", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getTiposDocumentosIdentidad",
            details: new Array(
              `No se han encontrado datos referentes a los tipos de documentos de identidad en la tabla tipo_documento_identidad.`
            ),
          });
        }
      }
    );
  });
};

export const getNaturalezaReceptorByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos de la naturalez del receptor.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM naturaleza_receptor a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({ origin: "getNaturalezaReceptorByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getNaturalezaReceptorByCode",
            details: new Array(
              `No se ha encontrado datos referentes a la naturaleza del receptor en la tabla naturaleza_receptor.`
            ),
          });
        }
      }
    );
  });
};

export const getNaturalezasReceptor = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de las naturalezas del receptor.`
    );
    pool.query(
      `SELECT *
                FROM naturaleza_receptor`,
      (err, res) => {
        if (err) {
          reject({ origin: "getNaturalezasReceptor", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getNaturalezasReceptor",
            details: new Array(
              `No se han encontrado datos referentes a las naturalezas del receptor en la tabla naturaleza_receptor.`
            ),
          });
        }
      }
    );
  });
};

export const getTipoOperacionByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos del tipo de operación.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM tipo_operacion a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({ origin: "getTipoOperacionByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getTipoOperacionByCode",
            details: new Array(
              `No se ha encontrado datos referentes al tipo de operación en la tabla tipo_operacion.`
            ),
          });
        }
      }
    );
  });
};

export const getTiposOperaciones = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los tipos de operaciones.`
    );
    pool.query(
      `SELECT *
                FROM tipo_operacion`,
      (err, res) => {
        if (err) {
          reject({ origin: "getTiposOperaciones", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getTiposOperaciones",
            details: new Array(
              `No se han encontrado datos referentes a los tipos de operaciones en la tabla tipo_operacion.`
            ),
          });
        }
      }
    );
  });
};

export const getPaisByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    let param;
    if (typeof codigo === "number") {
      param = codigo.toString();
    } else {
      param = codigo;
    }
    /**Registra log */
    const logMessage = `Obteniendo datos del pais.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM pais a
                    WHERE a.codigo_externo=$1`,
      [param],
      (err, res) => {
        if (err) {
          reject({ origin: "getPaisByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getPaisByCode",
            details: new Array(
              `No se ha encontrado datos referentes al pais en la tabla pais.`
            ),
          });
        }
      }
    );
  });
};

export const getPaises = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los paises.`
    );
    pool.query(
      `SELECT *
                FROM pais`,
      (err, res) => {
        if (err) {
          reject({ origin: "getPaises", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getPaises",
            details: new Array(
              `No se han encontrado datos referentes a los paises en la tabla pais.`
            ),
          });
        }
      }
    );
  });
};

export const getTipoIndicadorPresenciaByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos del tipo de indicador de presencia.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM tipo_indicador_presencia a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({
            origin: "getTipoIndicadorPresenciaByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getTipoIndicadorPresenciaByCode",
            details: new Array(
              `No se ha encontrado datos referentes al tipo de indicador de presencia en la tabla tipo_indicador_presencia.`
            ),
          });
        }
      }
    );
  });
};

export const getTiposIndicadoresPresencia = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los tipos de indicadores de presencia.`
    );
    pool.query(
      `SELECT *
                FROM tipo_indicador_presencia`,
      (err, res) => {
        if (err) {
          reject({ origin: "getTiposIndicadoresPresencia", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getTiposIndicadoresPresencia",
            details: new Array(
              `No se han encontrado datos referentes a los tipos de indicadores de presencia en la tabla tipo_indicador_presencia.`
            ),
          });
        }
      }
    );
  });
};

export const getNaturalezaVendedorByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos de la naturaleza del vendedor.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM naturaleza_vendedor a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({
            origin: "getNaturalezaVendedorByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getNaturalezaVendedorByCode",
            details: new Array(
              `No se ha encontrado datos referentes a la naturaleza del vendedor en la tabla naturaleza_vendedor.`
            ),
          });
        }
      }
    );
  });
};

export const getNaturalezasVendedor = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de las naturalezas del vendedor.`
    );
    pool.query(
      `SELECT *
                FROM naturaleza_vendedor`,
      (err, res) => {
        if (err) {
          reject({ origin: "getNaturalezasVendedor", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getNaturalezasVendedor",
            details: new Array(
              `No se han encontrado datos referentes a las naturalezas del vendedor en la tabla naturaleza_vendedor.`
            ),
          });
        }
      }
    );
  });
};

export const getMotivoEmisionNotaCreditoByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    let param;
    if (typeof codigo === "number") {
      param = codigo.toString();
    } else {
      param = codigo;
    }
    /**Registra log */
    const logMessage = `Obteniendo datos del motivo de la emisión de la nota de crédito.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM motivo_emision_nota_credito a
                    WHERE a.codigo=$1`,
      [param],
      (err, res) => {
        if (err) {
          reject({
            origin: "getMotivoEmisionNotaCreditoByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getMotivoEmisionNotaCreditoByCode",
            details: new Array(
              `No se ha encontrado datos referentes al motivo de emisión de la nota de crédito en la tabla motivo_emision_nota_credito.`
            ),
          });
        }
      }
    );
  });
};

export const getMotivosEmisionNotaCredito = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los motivos de la emisión de la nota de crédito.`
    );
    pool.query(
      `SELECT *
                FROM motivo_emision_nota_credito`,
      (err, res) => {
        if (err) {
          reject({ origin: "getMotivosEmisionNotaCredito", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getMotivosEmisionNotaCredito",
            details: new Array(
              `No se han encontrado datos referentes a los motivos de emisión de la nota de crédito en la tabla motivo_emision_nota_credito.`
            ),
          });
        }
      }
    );
  });
};

export const getMotivoEmisionNotaRemisionByCode = (
  codigo,
  numeroDocumentoDe
) => {
  return new Promise(async (resolve, reject) => {
    let param;
    if (typeof codigo === "number") {
      param = codigo.toString();
    } else {
      param = codigo;
    }
    /**Registra log */
    const logMessage = `Obteniendo datos del motivo de la emisión de la nota de remisión.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM motivo_emision_nota_remision a
                    WHERE a.codigo_externo=$1`,
      [param],
      (err, res) => {
        if (err) {
          reject({
            origin: "getMotivoEmisionNotaRemisionByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getMotivoEmisionNotaRemisionByCode",
            details: new Array(
              `No se ha encontrado datos referentes al motivo de emisión de la nota de remisión en la tabla motivo_emision_nota_remision.`
            ),
          });
        }
      }
    );
  });
};

export const getMotivosEmisionNotaRemision = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los motivos de la emisión de la nota de remisión.`
    );
    pool.query(
      `SELECT *
                FROM motivo_emision_nota_remision`,
      (err, res) => {
        if (err) {
          reject({
            origin: "getMotivosEmisionNotaRemision",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getMotivosEmisionNotaRemision",
            details: new Array(
              `No se han encontrado datos referentes a los motivos de emisión de la nota de remisión en la tabla motivo_emision_nota_remision.`
            ),
          });
        }
      }
    );
  });
};

export const getResponsableNotaRemisionByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos del responsable de la nota de remisión.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM responsable_nota_remision a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({
            origin: "getResponsableNotaRemisionByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getResponsableNotaRemisionByCode",
            details: new Array(
              `No se ha encontrado datos referentes al responsable de la nota de remisión en la tabla responsable_nota_remision.`
            ),
          });
        }
      }
    );
  });
};

export const getResponsablesNotaRemision = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los responsables de la nota de remisión.`
    );
    pool.query(
      `SELECT *
                FROM responsable_nota_remision`,
      (err, res) => {
        if (err) {
          reject({
            origin: "getResponsablesNotaRemision",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getResponsablesNotaRemision",
            details: new Array(
              `No se han encontrado datos referentes a los responsables de la nota de remisión en la tabla responsable_nota_remision.`
            ),
          });
        }
      }
    );
  });
};

export const getCondicionOperacionByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    let param;
    if (typeof codigo === "number") {
      param = codigo.toString();
    } else {
      param = codigo;
    }
    /**Registra log */
    const logMessage = `Obteniendo datos de la condición de la operación.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM condicion_operacion a
                    WHERE a.codigo_externo=$1`,
      [param],
      (err, res) => {
        if (err) {
          reject({
            origin: "getCondicionOperacionByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getCondicionOperacionByCode",
            details: new Array(
              `No se ha encontrado datos referentes a la condición de la operación en la tabla condicion_operacion.`
            ),
          });
        }
      }
    );
  });
};

export const getCondicionesOperacion = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de las condiciones de la operación.`
    );
    pool.query(
      `SELECT *
                FROM condicion_operacion`,
      (err, res) => {
        if (err) {
          reject({
            origin: "getCondicionesOperacion",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getCondicionesOperacion",
            details: new Array(
              `No se han encontrado datos referentes a las condiciones de la operación en la tabla condicion_operacion.`
            ),
          });
        }
      }
    );
  });
};

export const getTipoPagoByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    let param;
    if (typeof codigo === "number") {
      param = codigo.toString();
    } else {
      param = codigo;
    }
    /**Registra log */
    const logMessage = `Obteniendo datos del tipo de pago.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM tipo_pago a
                    WHERE a.codigo_externo=$1`,
      [param],
      (err, res) => {
        if (err) {
          reject({
            origin: "getTipoPagoByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getTipoPagoByCode",
            details: new Array(
              `No se ha encontrado datos referentes al tipo de pago en la tabla tipo_pago.`
            ),
          });
        }
      }
    );
  });
};

export const getTiposPago = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los tipos de pagos.`
    );
    pool.query(
      `SELECT *
                FROM tipo_pago`,
      (err, res) => {
        if (err) {
          reject({
            origin: "getTiposPago",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getTiposPago",
            details: new Array(
              `No se han encontrado datos referentes a los tipos de pagos en la tabla tipo_pago.`
            ),
          });
        }
      }
    );
  });
};

export const getDenominacionTarjetaByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    let param;
    if (typeof codigo === "number") {
      param = codigo.toString();
    } else {
      param = codigo;
    }
    /**Registra log */
    const logMessage = `Obteniendo datos de la denominación de la tarjeta.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM denominacion_tarjeta a
                    WHERE a.codigo_externo=$1`,
      [param],
      (err, res) => {
        if (err) {
          reject({
            origin: "getDenominacionTarjetaByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getDenominacionTarjetaByCode",
            details: new Array(
              `No se ha encontrado datos referentes a la denonimación de la tarjeta en la tabla denominacion_tarjeta.`
            ),
          });
        }
      }
    );
  });
};

export const getDenominacionesTarjetas = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de las denominaciones de las tarjetas.`
    );
    pool.query(
      `SELECT *
                FROM denominacion_tarjeta`,
      (err, res) => {
        if (err) {
          reject({
            origin: "getDenominacionesTarjetas",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getDenominacionesTarjetas",
            details: new Array(
              `No se han encontrado datos referentes a las denominaciones de las tarjetas en la tabla denominacion_tarjeta.`
            ),
          });
        }
      }
    );
  });
};

export const getFormaProcesamientoPagoByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos de la forma de procesamiento de pago.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM forma_procesamiento_pago a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({
            origin: "getFormaProcesamientoPagoByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getFormaProcesamientoPagoByCode",
            details: new Array(
              `No se ha encontrado datos referentes a la forma de procesamiento de pago en la tabla forma_procesamiento_pago.`
            ),
          });
        }
      }
    );
  });
};

export const getFormasProcesamientosPagos = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de las formas de procesamientos de pagos.`
    );
    pool.query(
      `SELECT *
                FROM forma_procesamiento_pago`,
      (err, res) => {
        if (err) {
          reject({
            origin: "getFormasProcesamientosPagos",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getFormasProcesamientosPagos",
            details: new Array(
              `No se han encontrado datos referentes a las formas de procesamientos de pagos en la tabla forma_procesamiento_pago.`
            ),
          });
        }
      }
    );
  });
};

export const getCondicionCreditoByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos de la condición de crédito.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM condicion_credito a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({
            origin: "getCondicionCreditoByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getCondicionCreditoByCode",
            details: new Array(
              `No se ha encontrado datos referentes a la condición de crédito en la tabla condicion_credito.`
            ),
          });
        }
      }
    );
  });
};

export const getCondicionesCreditos = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de las condiciones de crédito.`
    );
    pool.query(
      `SELECT *
                FROM condicion_credito`,
      (err, res) => {
        if (err) {
          reject({
            origin: "getCondicionesCreditos",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getCondicionesCreditos",
            details: new Array(
              `No se han encontrado datos referentes a las condiciones de crédito en la tabla condicion_credito.`
            ),
          });
        }
      }
    );
  });
};

export const getUnidadMedidaByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    let param;
    if (typeof codigo === "number") {
      param = codigo.toString();
    } else {
      param = codigo;
    }
    /**Registra log */
    const logMessage = `Obteniendo datos de la unidad de medida.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM unidad_medida a
                    WHERE a.codigo_externo=$1`,
      [param],
      (err, res) => {
        if (err) {
          reject({ origin: "getUnidadMedidaByCode", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getUnidadMedidaByCode",
            details: new Array(
              `No se ha encontrado datos referentes a la unidad de medida en la tabla unidad_medida.`
            ),
          });
        }
      }
    );
  });
};

export const getUnidadesMedida = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de las unidades de medidas.`
    );
    pool.query(
      `SELECT *
                FROM unidad_medida`,
      (err, res) => {
        if (err) {
          reject({ origin: "getUnidadesMedida", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getUnidadesMedida",
            details: new Array(
              `No se han encontrado datos referentes a las unidades de medida en la tabla unidad_medida.`
            ),
          });
        }
      }
    );
  });
};

export const getRelevanciaMercaderiaByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos de la relevancia de la mercadería.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM relevancia_mercaderia a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({
            origin: "getRelevanciaMercaderiaByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getRelevanciaMercaderiaByCode",
            details: new Array(
              `No se ha encontrado datos referentes a la relevancia de la mercadería en la tabla relevancia_mercaderia.`
            ),
          });
        }
      }
    );
  });
};

export const getRelevanciasMercaderia = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de las relevancias de las mercaderías.`
    );
    pool.query(
      `SELECT *
                FROM relevancia_mercaderia`,
      (err, res) => {
        if (err) {
          reject({ origin: "getRelevanciasMercaderia", details: `${err}` });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getRelevanciasMercaderia",
            details: new Array(
              `No se han encontrado datos referentes a las relevancias de las mercaderías en la tabla relevancia_mercaderia.`
            ),
          });
        }
      }
    );
  });
};

export const getFormaAfectacionTributariaIvaByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos de la forma de la afectación tributaria del IVA.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM forma_afectacion_tributaria_iva a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({
            origin: "getFormaAfectacionTributariaIvaByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getFormaAfectacionTributariaIvaByCode",
            details: new Array(
              `No se ha encontrado datos referentes a la forma de afectación tributaria del IVA en la tabla forma_afectacion_tributaria_iva.`
            ),
          });
        }
      }
    );
  });
};

export const getFormasAfectacionTributariaIva = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de las formas de afectación tributaria del IVA.`
    );
    pool.query(
      `SELECT *
                FROM forma_afectacion_tributaria_iva`,
      (err, res) => {
        if (err) {
          reject({
            origin: "getFormasAfectacionTributariaIva",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getFormasAfectacionTributariaIva",
            details: new Array(
              `No se han encontrado datos referentes a las formas de afectación tributaria del IVA en la tabla forma_afectacion_tributaria_iva.`
            ),
          });
        }
      }
    );
  });
};

export const getTipoDocumentoAsociadoByCode = (codigo, idDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos del tipo de documento asociado.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      idDe: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM tipo_documento_asociado a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({
            origin: "getTipoDocumentoAsociadoByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getTipoDocumentoAsociadoByCode",
            details: new Array(
              `No se ha encontrado datos referentes al tipo de documento asociado en la tabla tipo_documento_asociado.`
            ),
          });
        }
      }
    );
  });
};

export const getTiposDocumentosAsociados = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los tipos de documentos asociados.`
    );
    pool.query(
      `SELECT *
                FROM tipo_documento_asociado`,
      (err, res) => {
        if (err) {
          reject({
            origin: "getTiposDocumentosAsociados",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getTiposDocumentosAsociados",
            details: new Array(
              `No se han encontrado datos referentes a los tipos de documentos asociados en la tabla tipo_documento_asociado.`
            ),
          });
        }
      }
    );
  });
};

export const getTipoDocumentoImpresoByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos del tipo de documento impreso.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM tipo_documento_impreso a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({
            origin: "getTipoDocumentoImpresoByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getTipoDocumentoImpresoByCode",
            details: new Array(
              `No se ha encontrado datos referentes al tipo de documento impreso en la tabla tipo_documento_impreso.`
            ),
          });
        }
      }
    );
  });
};

export const getTiposDocumentosImpresos = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los tipos de documentos impresos.`
    );
    pool.query(
      `SELECT *
                FROM tipo_documento_impreso`,
      (err, res) => {
        if (err) {
          reject({
            origin: "getTiposDocumentosImpresos",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getTiposDocumentosImpresos",
            details: new Array(
              `No se han encontrado datos referentes a los tipos de documentos impresos en la tabla tipo_documento_impreso.`
            ),
          });
        }
      }
    );
  });
};

export const getTipoConstanciaByCode = (codigo, numeroDocumentoDe) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Obteniendo datos del tipo de constancia.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: numeroDocumentoDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    pool.query(
      `SELECT *
                    FROM tipo_constancia a
                    WHERE a.codigo=$1`,
      [codigo],
      (err, res) => {
        if (err) {
          reject({
            origin: "getTipoConstanciaByCode",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows[0]);
        } else {
          reject({
            origin: "getTipoConstanciaByCode",
            details: new Array(
              `No se ha encontrado datos referentes al tipo de constancia en la tabla tipo_constancia.`
            ),
          });
        }
      }
    );
  });
};

export const getTiposConstancias = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los tipos de constancias.`
    );
    pool.query(
      `SELECT *
                FROM tipo_constancia`,
      (err, res) => {
        if (err) {
          reject({
            origin: "getTiposConstancias",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getTiposConstancias",
            details: new Array(
              `No se han encontrado datos referentes a los tipos de constancias en la tabla tipo_constancia.`
            ),
          });
        }
      }
    );
  });
};

export const getTiposDocumentosElectronicos = () => {
  return new Promise(async (resolve, reject) => {
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: Obteniendo datos de los tipos de documentos electrónicos.`
    );
    pool.query(
      `SELECT *
                FROM tipo_de`,
      (err, res) => {
        if (err) {
          reject({
            origin: "getTiposDocumentosElectronicos",
            details: `${err}`,
          });
        }
        if (res.rowCount > 0) {
          resolve(res.rows);
        } else {
          reject({
            origin: "getTiposDocumentosElectronicos",
            details: new Array(
              `No se han encontrado datos referentes a los tipos de documentos electrónicos en la tabla tipo_de.`
            ),
          });
        }
      }
    );
  });
};

/*export const insertLog = (payload) => {
  return new Promise(async (resolve) => {
    try {
      const {
        tipoDe = null,
        numero,
        estado = null,
        message,
        tipoLog,
        cdc = null,
        archivoXml = null,
      } = payload;
      const existDe = await pool.query(`SELECT * FROM de a WHERE a.numero=$1`, [
        numero,
      ]);
      if (existDe.rowCount === 0) {
        const de = await pool.query(
          "INSERT INTO de(fecha,tipo_de,numero,archivo) VALUES($1,$2,$3,$4) RETURNING *",
          [new Date(), tipoDe, numero, archivoXml]
        );
        if (de.rowCount > 0) {
          if (estado) {
            await pool.query(`UPDATE de SET estado=$1 WHERE id=$2`, [
              estado,
              de.rows[0].id,
            ]);
          }
          await pool.query(
            `INSERT INTO log_de(fecha,de,tipo,mensaje) VALUES($1,$2,$3,$4)`,
            [new Date(), de.rows[0].id, tipoLog, message]
          );
        }
      } else {
        if (tipoDe !== "" && tipoDe !== null && tipoDe !== undefined) {
          await pool.query(
            `UPDATE de SET tipo_de=$1 WHERE id=$2 AND tipo_de IS NULL`,
            [tipoDe, existDe.rows[0].id]
          );
        }
        if (estado) {
          await pool.query(`UPDATE de SET estado=$1 WHERE id=$2`, [
            estado,
            existDe.rows[0].id,
          ]);
        }
        if (cdc !== "" && cdc !== null && cdc !== undefined) {
          await pool.query(`UPDATE de SET cdc=$1 WHERE id=$2 AND cdc IS NULL`, [
            cdc,
            existDe.rows[0].id,
          ]);
        }
        if (archivoXml) {
          await pool.query(`UPDATE de SET archivo=$1 WHERE id=$2`, [
            archivoXml,
            existDe.rows[0].id,
          ]);
        }
        await pool.query(
          `INSERT INTO log_de(fecha,de,tipo,mensaje) VALUES($1,$2,$3,$4)`,
          [new Date(), existDe.rows[0].id, tipoLog, message]
        );
      }
      resolve();
    } catch (err) {
      console.error({
        origin: "insertLog",
        details: new Array(err),
      });
    }
  });
};*/

export const insertLog = (payload) => {
  return new Promise(async (resolve) => {
    try {
      const { idDe, message, tipoLog } = payload;
      if (idDe) {
        await pool.query(
          `INSERT INTO log_de(fecha,de,tipo,mensaje) VALUES($1,$2,$3,$4)`,
          [new Date(), idDe, tipoLog, message]
        );
      }
      resolve();
    } catch (err) {
      console.error({
        origin: "insertLog",
        details: new Array(err),
      });
    }
  });
};

export const insertDe = (ruc, numero, nombreReceptor) => {
  return new Promise(async (resolve, reject) => {
    try {
      await insertCliente(ruc, nombreReceptor);
      const de = await pool.query(
        "INSERT INTO de(fecha,numero,ruc) VALUES($1,$2,$3) RETURNING *",
        [new Date(), numero, ruc]
      );
      resolve(de.rows[0].id);
    } catch (error) {
      reject(error);
    }
  });
};

export const insertCliente = (ruc, nombre) => {
  return new Promise(async (resolve, reject) => {
    try {
      const cliente = await pool.query(
        `SELECT * FROM cliente a WHERE a.ruc=$1`,
        [ruc]
      );
      if (cliente.rowCount === 0) {
        await pool.query("INSERT INTO cliente(ruc,nombre) VALUES($1,$2)", [
          ruc,
          nombre,
        ]);
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const updateDe = (idDe, tipoDe, estado, cdc, xml) => {
  return new Promise(async (resolve, reject) => {
    try {
      await pool.query(
        `UPDATE de SET tipo_de=$1, estado=$2, cdc=$3, archivo=$4, xml=$5 WHERE id=$6`,
        [tipoDe, estado, cdc, `${cdc}.xml`, xml, idDe]
      );
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

export const registerSendingElectronicDocument = (payload) => {
  return new Promise(async (resolve) => {
    try {
      const { idDe, fechaEnvio = new Date() } = payload;
      const envioDeSingle = await pool.query(
        "INSERT INTO envio_de_single(id_de,fecha_envio) VALUES($1,$2) RETURNING *",
        [idDe, fechaEnvio]
      );
      resolve(envioDeSingle.rows[0].id);
    } catch (err) {
      console.error({
        origin: "registerSendingElectronicDocument",
        message: err,
      });
    }
  });
};

export const recordElectronicDocumentDeliveryResponse = (payload) => {
  return new Promise(async (resolve) => {
    try {
      const { idEnvio, codigoRespuesta } = payload;
      await pool.query(
        "INSERT INTO envio_de_single_res(id_envio,codigo_respuesta) VALUES($1,$2) RETURNING *",
        [idEnvio, codigoRespuesta]
      );
      resolve();
    } catch (err) {
      console.error({
        origin: "recordElectronicDocumentDeliveryResponse",
        message: err,
      });
    }
  });
};

export default {
  getTipoDeByCode,
  getSistemaFacturacionByCode,
  getTipoEmisionDeByCode,
  getTiposEmisionesDe,
  getTipoTransaccionByCode,
  getTiposTransacciones,
  getTipoImpuestoByCode,
  getTiposImpuestos,
  getMonedaByCode,
  getMonedas,
  getCondicionTipoCambioByCode,
  getCondicionesTiposCambios,
  getCondicionAnticipoByCode,
  getCondicionesAnticipos,
  getTipoContribuyenteByCode,
  getTiposContribuyentes,
  getTipoRegimenByCode,
  getTiposRegimenes,
  getDepartamentoByCode,
  getDepartamentos,
  getDistritoByCode,
  getDistritos,
  getCiudadByCode,
  getCiudades,
  getTipoDocumentoIdentidadByCode,
  getTiposDocumentosIdentidad,
  getNaturalezaReceptorByCode,
  getNaturalezasReceptor,
  getTipoOperacionByCode,
  getTiposOperaciones,
  getPaisByCode,
  getPaises,
  getTipoIndicadorPresenciaByCode,
  getTiposIndicadoresPresencia,
  getNaturalezaVendedorByCode,
  getNaturalezasVendedor,
  getMotivoEmisionNotaCreditoByCode,
  getMotivosEmisionNotaCredito,
  getMotivoEmisionNotaRemisionByCode,
  getMotivosEmisionNotaRemision,
  getResponsableNotaRemisionByCode,
  getResponsablesNotaRemision,
  getCondicionOperacionByCode,
  getCondicionesOperacion,
  getTipoPagoByCode,
  getTiposPago,
  getDenominacionTarjetaByCode,
  getDenominacionesTarjetas,
  getFormaProcesamientoPagoByCode,
  getFormasProcesamientosPagos,
  getCondicionCreditoByCode,
  getCondicionesCreditos,
  getUnidadMedidaByCode,
  getUnidadesMedida,
  getRelevanciaMercaderiaByCode,
  getRelevanciasMercaderia,
  getFormaAfectacionTributariaIvaByCode,
  getFormasAfectacionTributariaIva,
  getTipoDocumentoAsociadoByCode,
  getTiposDocumentosAsociados,
  getTipoDocumentoImpresoByCode,
  getTiposDocumentosImpresos,
  getTipoConstanciaByCode,
  getTiposConstancias,
  getTiposDocumentosElectronicos,
  insertLog,
  registerSendingElectronicDocument,
  recordElectronicDocumentDeliveryResponse,
  insertDe,
  updateDe,
};
