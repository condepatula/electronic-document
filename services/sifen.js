import builder from "xmlbuilder";
import xml2js from "xml2js";
import fs from "fs";
import config from "../config.js";

export const generateXmlToSend = (fileName) => {
  return new Promise((resolve, reject) => {
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

export default { generateXmlToSend };
