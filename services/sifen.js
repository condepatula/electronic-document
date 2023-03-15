import builder from "xmlbuilder";
import xml2js from "xml2js";
import fs from "fs";
import https from "https";
import axios from "axios";
import { XMLParser } from "fast-xml-parser";
import config from "../config.js";
import helper from "../helpers/index.js";
import {
  registerSendingElectronicDocument,
  recordElectronicDocumentDeliveryResponse,
} from "../database/index.js";

const enviarDocumentoElectronico = (idDe, fileName) => {
  return new Promise(async (resolve, reject) => {
    const id = await registerSendingElectronicDocument({ idDe });
    const xml = await generateXmlToSend(id, fileName);
    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(new URL(`../cert/sds_public.pem`, import.meta.url)),
      key: helper.readPrivateKeyFromProtectedPem("sds.pem", config.passphrase),
      //ca: fs.readFileSync("ca.crt"),
    });
    try {
      const response = await axios.post(
        config.url_recibe,
        helper.formatXml(xml),
        {
          httpsAgent,
        }
      );
      if (response.data.search("<html>").index < 0) {
        let jsonResponse = responseXmlToJson(response.data);
        jsonResponse.mensajes.forEach(async (e) => {
          await recordElectronicDocumentDeliveryResponse({
            idEnvio: id,
            codigoRespuesta: e.codigo,
          });
        });
      }
      resolve({
        success: true,
        message:
          response.data.search("<html>").index < 0
            ? responseXmlToJson(response.data)
            : "",
      });
    } catch (err) {
      reject({
        success: false,
        message: err,
      });
    }
  });
};

const generateXmlToSend = (id, fileName) => {
  return new Promise((resolve, reject) => {
    let envelope = builder
      .create("soap:Envelope")
      .att("xmlns:soap", "http://www.w3.org/2003/05/soap-envelope");
    envelope.e("soap:Header");
    let body = envelope.e("soap:body");
    let rEnviDe = body.e("rEnviDe", {
      xmlns: "http://ekuatia.set.gov.py/sifen/xsd",
    });
    rEnviDe.e("dId", id);
    rEnviDe.e("xDE");
    let request = envelope.end({ pretty: true });
    let xmlPath = `${config.paths.xmlSigned.invoices}/${fileName}`;
    const xml = fs.readFileSync(xmlPath).toString();
    const parser = new xml2js.Parser();
    const parser2 = new xml2js.Parser();
    parser
      .parseStringPromise(request)
      .then((res) => {
        parser2
          .parseStringPromise(xml)
          .then((res2) => {
            let obj = {
              ["soap:Envelope"]: {
                ...res["soap:Envelope"],
                ["soap:body"]: {
                  rEnviDe: {
                    ...res["soap:Envelope"]["soap:body"][0]["rEnviDe"][0],
                    xDE: { ...res2 },
                  },
                },
              },
            };
            const builder = new xml2js.Builder();
            const _xml = builder.buildObject(obj);
            resolve(_xml);
          })
          .catch((err) => reject(err));
      })
      .catch((err) => reject(err));
  });
};

export const responseXmlToJson = (xml) => {
  const parser = new XMLParser();
  const json =
    parser.parse(xml)["soap:Envelope"]["soap:body"]["ns2:rRetEnviDe"][
      "ns2:rProtDe"
    ];
  let result = {
    id: json["ns2:dId"],
    fechaProceso: json["ns2:dFecProc"],
    digestValue: json["ns2:dDigVal"],
    estado: json["ns2:dEstRes"],
    nroTransaccion: json["ns2:dProtAut"],
  };
  let mensajes = [];
  json["ns2:gResProc"].forEach((e) => {
    mensajes.push({
      codigo: e["ns2:dCodRes"],
      mensaje: e["ns2:dMsgRes"],
    });
  });
  result = { ...result, mensajes };
  return result;
};

export default { responseXmlToJson, enviarDocumentoElectronico };
