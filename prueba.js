/*import builder from "xmlbuilder";
import xml2js from "xml2js";
import fs from "fs";
import config from "./config.js";

let envelope = builder
  .create("soap:Envelope")
  .att("xmlns:soap", "http://www.w3.org/2003/05/soap-envelope");
envelope.e("soap:Header");
let body = envelope.e("soap:body");
let rEnviDe = body.e("rEnviDe", {
  xmlns: "http://ekuatia.set.gov.py/sifen/xsd",
});
rEnviDe.e("dId", 10000011111111);
rEnviDe.e("xDE");
let request = envelope.end({ pretty: true });
let xmlPath = `${config.paths.xmlSigned.invoices}/0074331.xml`;
const xml = fs.readFileSync(xmlPath).toString();
const parser = new xml2js.Parser();
const parser2 = new xml2js.Parser();
parser.parseStringPromise(request).then((res) => {
  parser2.parseStringPromise(xml).then((res2) => {
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
    fs.writeFile(
      `${config.paths.xmlSigned.invoices}/de-envio.xml`,
      _xml,
      (err) => {
        if (err) {
          console.error(err);
        }
      }
    );
  });
});*/
import { getTiposEmisionesDe as tipoEmision } from "./database/index.js";

let result = {
  id: 1,
  campos: await tipoEmision(),
};

let value = 1;
let data = result.campos.find((v) => v.codigo === value);

console.log(data);
