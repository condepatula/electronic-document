import forge from "node-forge";
import fs from "fs";

export const formatXml = (xml) => {
  let xmlFormated = xml.replace(/[\n|\r\n]/g, "");
  return xmlFormated;
};

export const validateDecimal = (number, decMinSize, decMaxSize) => {
  if (number.toString().includes(".")) {
    let length = number.toString().split(".")[1].length;
    if (length < decMinSize || length > decMaxSize) {
      return false;
    }
  }
  return true;
};

export const generateCdc = ({
  tipoDe,
  rucEmisor,
  dvEmisor,
  establecimiento,
  puntoExpedicion,
  numeroDe,
  tipoContribuyente,
  fechaEmision,
  tipoEmision,
  codigoSeguridad,
}) => {
  let cdc = `${tipoDe}${rucEmisor}${dvEmisor}${establecimiento}${puntoExpedicion}${numeroDe}${tipoContribuyente}${fechaEmision}${tipoEmision}${codigoSeguridad}`;
  cdc = cdc + calculateDv(cdc).toString();

  return cdc;
};

export const calculateDv = (number) => {
  let _number = "";
  let base = 2;
  let baseMaxima = 11;
  let total = 0;
  let dv;
  number.split("").forEach((n) => {
    if (/[0-9]/g.test(n)) {
      _number = _number + n;
    } else {
      _number = _number + n.charCodeAt();
    }
  });
  _number
    .split("")
    .reverse()
    .forEach((n) => {
      if (base > baseMaxima) {
        base = 2;
      }
      total = total + parseInt(n) * base;
      base = base + 1;
    });

  let resto = total % 11;

  if (resto > 1) {
    dv = baseMaxima - resto;
  } else {
    dv = 0;
  }

  return dv;
};

export const generateSecurityCode = () => {
  let min = 1;
  let max = 999999999;
  let value = Math.floor(Math.random() * (max - min) + min);
  let result = "";
  if (value.toString().length < 9) {
    let zero = "";
    for (let i = 0; i < 9 - value.toString().length; i++) {
      zero = zero + "0";
    }
    result = `${zero}${value.toString()}`;
  } else {
    result = value.toString();
  }
  return result;
};

export const convertStringToHexadecimal = (str) => {
  var arr = [];
  for (var n = 0; n < str.length; n++) {
    var hex = Number(str.charCodeAt(n)).toString(16);
    arr.push(hex);
  }
  return arr.join("");
};

export const generateSHA256 = (str) => {
  return forge.md.sha256.create().update(str).digest().toHex();
};

export const readPrivateKeyFromProtectedPem = (key, passphrase) => {
  const pathKey = new URL(`cert/${key}`, import.meta.url);
  const _key = pathKey.pathname.substring(1, pathKey.pathname.length);
  let pem = fs.readFileSync(_key).toString();
  let privateKey = forge.pki.decryptRsaPrivateKey(pem, passphrase);
  return forge.pki.privateKeyToPem(privateKey);
};

export const removeHeaders = (cert) => {
  const pathCert = new URL(`cert/${cert}`, import.meta.url);
  const _cert = pathCert.pathname.substring(1, pathCert.pathname.length);
  var pem = /-----BEGIN (\w*)-----([^-]*)-----END (\w*)-----/g.exec(
    fs.readFileSync(_cert).toString()
  );
  if (pem && pem.length > 0) {
    return pem[2].replace(/[\n|\r\n]/g, "");
  }
  return null;
};

/*export const buildUrlToQr = (digestValue) => {
  const csc = "ABCD0000000000000000000000000000";
  const params = `nVersion=${
    data.version
  }&Id=${cdc}&dFeEmiDE=${convertStringToHexadecimal(fecha)}&dRucRec=${
    data.camposGeneralesDE.receptor.ruc
  }&dTotGralOpe=${data.subtotalesTotales.totalGeneral}&dTotIVA=${
    data.subtotalesTotales.totalIva
  }&cItems=${
    data.documentoElectronico.items.length
  }&DigestValue=${convertStringToHexadecimal(
    digestValue.toString()
  )}&IdCSC=0001`;

  const hash = generateSHA256(`${params}${csc}`);
  const urlQr = `https://ekuatia.set.gov.py/consultas/qr?${params}&cHashQR=${hash}`;
  console.log(urlQr);
};*/

export default {
  formatXml,
  validateDecimal,
  generateCdc,
  calculateDv,
  generateSecurityCode,
  convertStringToHexadecimal,
  generateSHA256,
  readPrivateKeyFromProtectedPem,
  removeHeaders,
};
