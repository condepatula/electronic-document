import path from "path";
import sifen from "./services/sifen.js";

/*const file = fs.readFileSync(path.join(process.cwd(), "response.xml"), "utf-8");
const response = sifen.responseXmlToJson(file);

console.log(response);*/

try {
  const response = await sifen.enviarDocumentoElectronico("0074331.xml");
  console.log(response);
} catch (err) {
  console.log(err);
}
