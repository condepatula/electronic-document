import sifen from "./services/sifen.js";
/*import fs from "fs";
import path from "path";

const file = fs.readFileSync(path.join(process.cwd(), "response.xml"), "utf-8");
const response = sifen.responseXmlToJson(file);

console.log(response);*/

try {
  const response = await sifen.enviarDocumentoElectronico(
    103,
    "01800090578001123007433122023032212383687829.xml"
  );
  console.log(response);
} catch (err) {
  //console.log(err);
  console.log({
    status: err.message.response.status,
    statusText: err.message.response.statusText,
    url: err.message.response.config.url,
    data: err.message.response.config.data,
    message: JSON.stringify(sifen.responseXmlToJson(err.message.response.data)),
  });
}

/*var _xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rDE xmlns="http://ekuatia.set.gov.py/sifen/xsd" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  xsi:schemaLocation="https://ekuatia.set.gov.py/sifen/xsd/siRecepDE_v150.xsd"><dVerFor>150</dVerFor><DE Id="01800090578001001007433122023031314596248140"></DE>`
  .replace('<?xml version="1.0" encoding="UTF-8"?>', "")
  .replace(/[\n|\r\n]/g, "");
console.log(_xml);*/
/*import path from "path";
import fs from "fs";
import forge from "node-forge";
import config from "./config.js";
import { SignedXml } from "xml-crypto";

const xml = fs.readFileSync(
  `${config.paths.xml.invoices}/01800090578001001007433122023031413115299645.xml`,
  "utf-8"
);
const pathKey = path.join(process.cwd(), "cert", "clave_privada.pem");
const pem = fs.readFileSync(pathKey).toString();
const sig = new SignedXml();
sig.addReference("//*[local-name(.)='DE']");
sig.signingKey = forge.pki.privateKeyToPem(
  forge.pki.decryptRsaPrivateKey(pem, config.passphrase)
);
sig.computeSignature(xml);
fs.writeFileSync(
  `${config.paths.xmlSigned.invoices}/01.xml`,
  sig.getSignedXml()
);*/

//let privateKey = forge.pki.decryptRsaPrivateKey(pem, config.passphrase);
//console.log(xml);
