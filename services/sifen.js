import builder from "xmlbuilder";
import xml2js from "xml2js";
import fs from "fs";
import path from "path";
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
    //fs.writeFileSync(path.join(process.cwd(), "send.xml"), xml);
    //console.log(helper.formatXml(xml));
    const httpsAgent = new https.Agent({
      cert: fs.readFileSync(
        path.join(process.cwd(), "cert", "F1T_9960.crt"),
        "utf-8"
      ),
      key: helper.readPrivateKeyFromProtectedPem(
        "F1T_9960.key",
        config.passphrase
      ),
    });
    fs.writeFileSync(
      path.join(process.cwd(), "send.xml"),
      helper.formatXml(xml)
    );
    try {
      const response = await axios.post(
        config.url_recibe,
        helper.formatXml(xml),
        {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
          },
          httpsAgent,
        }
      );
      //console.log("OK", response.data);
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
      //console.log("NO OK", err);
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
      .create("soap:Envelope", {
        version: "1.0",
        encoding: "UTF-8",
        standalone: undefined,
      })
      .att("xmlns:soap", "http://www.w3.org/2003/05/soap-envelope");
    envelope.e("soap:Header");
    let body = envelope.e("soap:Body");
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
    console.log("ORIGINAL", xml);
    parser
      .parseStringPromise(request)
      .then((res) => {
        parser2
          .parseStringPromise(xml)
          .then((res2) => {
            let obj = {
              ["soap:Envelope"]: {
                ...res["soap:Envelope"],
                ["soap:Body"]: {
                  rEnviDe: {
                    ...res["soap:Envelope"]["soap:Body"][0]["rEnviDe"][0],
                    xDE: { ...res2 },
                  },
                },
              },
            };
            const builder = new xml2js.Builder({
              xmldec: {
                version: "1.0",
                encoding: "UTF-8",
                standalone: undefined,
              },
            });
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
    parser.parse(xml)["env:Envelope"]["env:Body"]["ns2:rRetEnviDe"][
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
  if (Array.isArray(json["ns2:gResProc"])) {
    json["ns2:gResProc"].forEach((e) => {
      mensajes.push({
        codigo: e["ns2:dCodRes"],
        mensaje: e["ns2:dMsgRes"],
      });
    });
  } else {
    mensajes.push({
      codigo: json["ns2:gResProc"]["ns2:dCodRes"],
      mensaje: json["ns2:gResProc"]["ns2:dMsgRes"],
    });
  }
  result = { ...result, mensajes };
  return result;
};

export default { responseXmlToJson, enviarDocumentoElectronico };
