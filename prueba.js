/*import path from "path";
import sifen from "./services/sifen.js";*/

/*const file = fs.readFileSync(path.join(process.cwd(), "response.xml"), "utf-8");
const response = sifen.responseXmlToJson(file);

console.log(response);*/

/*try {
  const response = await sifen.enviarDocumentoElectronico("0074331.xml");
  console.log(response);
} catch (err) {
  console.log(err);
}*/

var _xml = `<?xml version="1.0" encoding="UTF-8"?>
  <rDE xmlns="http://ekuatia.set.gov.py/sifen/xsd" 
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
  xsi:schemaLocation="https://ekuatia.set.gov.py/sifen/xsd/siRecepDE_v150.xsd"><dVerFor>150</dVerFor><DE Id="01800090578001001007433122023031314596248140"></DE>`
  .replace('<?xml version="1.0" encoding="UTF-8"?>', "")
  .replace(/[\n|\r\n]/g, "");
console.log(_xml);
