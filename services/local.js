import builder from "xmlbuilder";
import xml2js from "xml2js";
import fs from "fs";
import path from "path";
import { SignedXml } from "xml-crypto";
import qrcode from "qrcode";
import puppeteer from "puppeteer";
import PDFMerger from "pdf-merger-js";
import hbs from "handlebars";
import moment from "moment";
import nodemailer from "nodemailer";
import {
  formatXml,
  readPrivateKeyFromProtectedPem,
  removeHeaders,
  convertStringToHexadecimal,
  generateSHA256,
  generateSecurityCode,
  generateCdc,
  validateDecimal,
} from "../helpers/index.js";
import config from "../config.js";
import { root } from "../de_structure/index.js";
import {
  getTipoDeByCode,
  getSistemaFacturacionByCode,
  getTipoEmisionDeByCode,
  getTipoTransaccionByCode,
  getTipoImpuestoByCode,
  getMonedaByCode,
  getDepartamentoByCode,
  getDistritoByCode,
  getCiudadByCode,
  getPaisByCode,
  insertLog,
  getTipoIndicadorPresenciaByCode,
  getCondicionOperacionByCode,
  getCondicionCreditoByCode,
  getUnidadMedidaByCode,
  getFormaAfectacionTributariaIvaByCode,
  getMotivoEmisionNotaCreditoByCode,
  getTipoDocumentoAsociadoByCode,
  insertDe,
  updateDe,
  getTipoDocumentoIdentidadByCode,
  getDeByCdc,
} from "../database/index.js";
import { getTipoDocumentoImpresoByCode } from "../database/index.js";

/**
 * Function: generateXml
 * Genera el XML
 * @param {json} data
 * @returns {promises}
 */
export const generateXml = (
  idDe,
  data,
  { version, cdc, fecha, codigoSeguridad }
) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Generando XML.`;
    //Factura electrónica
    let pathXml = "";
    if (data.timbrado.tipoDE === 1) {
      pathXml = `${config.paths.xml.invoices}/${cdc}.xml`;
    }
    //Nota de crédito electrónica
    if (data.timbrado.tipoDE === 5) {
      pathXml = `${config.paths.xml.creditNotes}/${cdc}.xml`;
    }
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
    /**AA. Campos que identifican el formato electrónico XML (AA001-AA009)*/
    let rDE = builder
      .create("rDE", {
        version: "1.0",
        encoding: "UTF-8",
        standalone: undefined,
      })
      .att("xmlns", "http://ekuatia.set.gov.py/sifen/xsd")
      .att("xmlns:xsi", "http://www.w3.org/2001/XMLSchema-instance")
      .att(
        "xsi:schemaLocation",
        "http://ekuatia.set.gov.py/sifen/xsd siRecepDE_v150.xsd"
      );
    rDE.e("dVerFor", version);
    /**A. Campos firmados del Documento Electrónico (A001-A099)*/
    let DE = rDE.e("DE", { Id: data.id });
    DE.e("dDVId", data.digitoVerificadorDE);
    DE.e("dFecFirma", fecha);
    DE.e("dSisFact", data.sistemaFacturacion);
    /**B. Campos inherentes a la operación de Documentos Electrónicos (B001-B099)*/
    let gOpeDE = DE.e("gOpeDE");
    gOpeDE.e("iTipEmi", data.operacionDE.tipoEmision);
    gOpeDE.e("dDesTipEmi", data.operacionDE.desTipoEmision);
    gOpeDE.e("dCodSeg", codigoSeguridad);
    if (data.operacionDE.hasOwnProperty("infoEmisor")) {
      gOpeDE.e("dInfoEmi", data.operacionDE.infoEmisor);
    }
    if (data.operacionDE.hasOwnProperty("infoFisco")) {
      gOpeDE.e("dInfoFisc", data.operacionDE.infoFisco);
    }
    /**C. Campos de datos del Timbrado (C001-C099)*/
    let gTimb = DE.e("gTimb");
    gTimb.e("iTiDE", data.timbrado.tipoDE);
    gTimb.e("dDesTiDE", data.timbrado.desTipoDE);
    gTimb.e("dNumTim", data.timbrado.numeroTimbrado);
    gTimb.e("dEst", data.timbrado.establecimiento);
    gTimb.e("dPunExp", data.timbrado.puntoExpedicion);
    gTimb.e("dNumDoc", data.timbrado.numeroDocumento);
    if (data.timbrado.hasOwnProperty("serieNumeroTimbrado")) {
      gTimb.e("dSerieNum", data.timbrado.serieNumeroTimbrado);
    }
    gTimb.e("dFeIniT", data.timbrado.fechaInicioVigenciaTimbrado);
    /**D. Campos Generales del Documento Electrónico DE (D001-D299)*/
    let gDatGralOpe = DE.e("gDatGralOpe");
    gDatGralOpe.e("dFeEmiDE", fecha);
    /**D1. Campos inherentes a la operación comercial (D010-D099)*/
    if (data.camposGeneralesDE.hasOwnProperty("operacionComercial")) {
      let gOpeCom = gDatGralOpe.e("gOpeCom");
      if (
        data.camposGeneralesDE.operacionComercial.hasOwnProperty(
          "tipoTransaccion"
        )
      ) {
        gOpeCom.e(
          "iTipTra",
          data.camposGeneralesDE.operacionComercial.tipoTransaccion
        );
        gOpeCom.e(
          "dDesTipTra",
          data.camposGeneralesDE.operacionComercial.desTransaccion
        );
      }
      gOpeCom.e(
        "iTImp",
        data.camposGeneralesDE.operacionComercial.tipoImpuesto
      );
      gOpeCom.e(
        "dDesTImp",
        data.camposGeneralesDE.operacionComercial.desTipoImpuesto
      );
      gOpeCom.e("cMoneOpe", data.camposGeneralesDE.operacionComercial.moneda);
      gOpeCom.e(
        "dDesMoneOpe",
        data.camposGeneralesDE.operacionComercial.desMoneda
      );
      if (
        data.camposGeneralesDE.operacionComercial.hasOwnProperty(
          "condicionTipoCambio"
        )
      ) {
        gOpeCom.e(
          "dCondTiCam",
          data.camposGeneralesDE.operacionComercial.condicionTipoCambio
        );
      }
      if (
        data.camposGeneralesDE.operacionComercial.hasOwnProperty("tipoCambio")
      ) {
        gOpeCom.e(
          "dTiCam",
          data.camposGeneralesDE.operacionComercial.tipoCambio
        );
      }
      if (
        data.camposGeneralesDE.operacionComercial.hasOwnProperty(
          "condicionAnticipo"
        )
      ) {
        gOpeCom.e(
          "iCondAnt",
          data.camposGeneralesDE.operacionComercial.condicionAnticipo
        );
      }
      if (
        data.camposGeneralesDE.operacionComercial.hasOwnProperty(
          "desCondicionAnticipo"
        )
      ) {
        gOpeCom.e(
          "dDesCondAnt",
          data.camposGeneralesDE.operacionComercial.desCondicionAnticipo
        );
      }
    }
    /**D2. Campos que identifican al emisor del Documento Electrónico DE (D100-D129)*/
    let gEmis = gDatGralOpe.e("gEmis");
    gEmis.e("dRucEm", data.camposGeneralesDE.emisor.ruc);
    gEmis.e("dDVEmi", data.camposGeneralesDE.emisor.digitoVerificador);
    gEmis.e("iTipCont", data.camposGeneralesDE.emisor.tipoContribuyente);
    if (data.camposGeneralesDE.emisor.hasOwnProperty("tipoRegimen")) {
      gEmis.e("cTipReg", data.camposGeneralesDE.emisor.tipoRegimen);
    }
    gEmis.e("dNomEmi", data.camposGeneralesDE.emisor.nombre);
    if (data.camposGeneralesDE.emisor.hasOwnProperty("nombreFantasia")) {
      gEmis.e("dNomFanEmi", data.camposGeneralesDE.emisor.nombreFantasia);
    }
    gEmis.e("dDirEmi", data.camposGeneralesDE.emisor.direccion);
    gEmis.e("dNumCas", data.camposGeneralesDE.emisor.numeroCasa);
    if (data.camposGeneralesDE.emisor.hasOwnProperty("complementoDir1")) {
      gEmis.e("dCompDir1", data.camposGeneralesDE.emisor.complementoDir1);
    }
    if (data.camposGeneralesDE.emisor.hasOwnProperty("complementoDir2")) {
      gEmis.e("dCompDir2", data.camposGeneralesDE.emisor.complementoDir2);
    }
    gEmis.e("cDepEmi", data.camposGeneralesDE.emisor.departamento);
    gEmis.e("dDesDepEmi", data.camposGeneralesDE.emisor.desDepartamento);
    if (data.camposGeneralesDE.emisor.hasOwnProperty("distrito")) {
      gEmis.e("cDisEmi", data.camposGeneralesDE.emisor.distrito);
      gEmis.e("dDesDisEmi", data.camposGeneralesDE.emisor.desDistrito);
    }
    gEmis.e("cCiuEmi", data.camposGeneralesDE.emisor.ciudad);
    gEmis.e("dDesCiuEmi", data.camposGeneralesDE.emisor.desCiudad);
    gEmis.e("dTelEmi", data.camposGeneralesDE.emisor.telefono);
    gEmis.e("dEmailE", data.camposGeneralesDE.emisor.email);
    if (data.camposGeneralesDE.emisor.hasOwnProperty("denominacionSucursal")) {
      gEmis.e("dDenSuc", data.camposGeneralesDE.emisor.denominacionSucursal);
    }
    /**D2.1 Campos que describen la actividad económica del emisor (D130-D139)*/
    data.camposGeneralesDE.emisor.actividadEconomica.forEach((a) => {
      let gActEco = gEmis.e("gActEco");
      gActEco.e("cActEco", a.actividad);
      gActEco.e("dDesActEco", a.desActividad);
    });
    /**D2.2 Campos que identifican al responsable de la generación del DE (D140-D160)*/
    if (data.camposGeneralesDE.emisor.hasOwnProperty("responsable")) {
      let gRespDE = gEmis.e("gRespDE");
      gRespDE.e(
        "iTipIDRespDE",
        data.camposGeneralesDE.emisor.responsable.tipoDocumento
      );
      gRespDE.e(
        "dDTipIDRespDE",
        data.camposGeneralesDE.emisor.responsable.desTipoDocumento
      );
      gRespDE.e(
        "dNumIDRespDE",
        data.camposGeneralesDE.emisor.responsable.numeroDocumento
      );
      gRespDE.e("dNomRespDE", data.camposGeneralesDE.emisor.responsable.nombre);
      gRespDE.e("dCarRespDE", data.camposGeneralesDE.emisor.responsable.cargo);
    }
    /**D3. Campos que identifican al receptor del Documento Electrónico DE (D200-D299)*/
    let gDatRec = gDatGralOpe.e("gDatRec");
    gDatRec.e("iNatRec", data.camposGeneralesDE.receptor.naturaleza);
    gDatRec.e("iTiOpe", data.camposGeneralesDE.receptor.tipoOperacion);
    gDatRec.e("cPaisRec", data.camposGeneralesDE.receptor.pais);
    gDatRec.e("dDesPaisRe", data.camposGeneralesDE.receptor.desPais);
    if (
      data.camposGeneralesDE.receptor.hasOwnProperty("tipoContribuyente") &&
      eval(
        root.camposGeneralesDE.props.receptor.props.tipoContribuyente.required
      )
    ) {
      gDatRec.e(
        "iTiContRec",
        data.camposGeneralesDE.receptor.tipoContribuyente
      );
    }
    if (data.camposGeneralesDE.receptor.hasOwnProperty("ruc")) {
      gDatRec.e("dRucRec", data.camposGeneralesDE.receptor.ruc);
      gDatRec.e("dDVRec", data.camposGeneralesDE.receptor.digitoVerificador);
    }
    if (data.camposGeneralesDE.receptor.hasOwnProperty("tipoDocumento")) {
      gDatRec.e("iTipIDRec", data.camposGeneralesDE.receptor.tipoDocumento);
      gDatRec.e("dDTipIDRec", data.camposGeneralesDE.receptor.desTipoDocumento);
    }
    if (data.camposGeneralesDE.receptor.hasOwnProperty("numeroDocumento")) {
      gDatRec.e("dNumIDRec", data.camposGeneralesDE.receptor.numeroDocumento);
    }
    gDatRec.e("dNomRec", data.camposGeneralesDE.receptor.nombre);
    if (
      data.camposGeneralesDE.receptor.hasOwnProperty("nombreFantasia") &&
      data.camposGeneralesDE.receptor.nombreFantasia
    ) {
      gDatRec.e("dNomFanRec", data.camposGeneralesDE.receptor.nombreFantasia);
    }
    if (
      data.camposGeneralesDE.receptor.hasOwnProperty("direccion") &&
      data.camposGeneralesDE.receptor.direccion
    ) {
      gDatRec.e("dDirRec", data.camposGeneralesDE.receptor.direccion);
    }
    if (data.camposGeneralesDE.receptor.hasOwnProperty("numeroCasa")) {
      gDatRec.e("dNumCasRec", data.camposGeneralesDE.receptor.numeroCasa);
    }
    if (
      data.camposGeneralesDE.receptor.hasOwnProperty("departamento") &&
      data.camposGeneralesDE.receptor.departamento
    ) {
      gDatRec.e("cDepRec", data.camposGeneralesDE.receptor.departamento);
      gDatRec.e("dDesDepRec", data.camposGeneralesDE.receptor.desDepartamento);
    }
    if (
      data.camposGeneralesDE.receptor.hasOwnProperty("distrito") &&
      data.camposGeneralesDE.receptor.desDistrito
    ) {
      gDatRec.e("cDisRec", data.camposGeneralesDE.receptor.distrito);
      gDatRec.e("dDesDisRec", data.camposGeneralesDE.receptor.desDistrito);
    }
    if (
      data.camposGeneralesDE.receptor.hasOwnProperty("ciudad") &&
      data.camposGeneralesDE.receptor.ciudad
    ) {
      gDatRec.e("cCiuRec", data.camposGeneralesDE.receptor.ciudad);
      gDatRec.e("dDesCiuRec", data.camposGeneralesDE.receptor.desCiudad);
    }
    if (
      data.camposGeneralesDE.receptor.hasOwnProperty("telefono") &&
      data.camposGeneralesDE.receptor.telefono
    ) {
      gDatRec.e("dTelRec", data.camposGeneralesDE.receptor.telefono);
    }
    if (
      data.camposGeneralesDE.receptor.hasOwnProperty("celular") &&
      data.camposGeneralesDE.receptor.celular
    ) {
      gDatRec.e("dCelRec", data.camposGeneralesDE.receptor.celular);
    }
    if (
      data.camposGeneralesDE.receptor.hasOwnProperty("email") &&
      data.camposGeneralesDE.receptor.email
    ) {
      gDatRec.e("dEmailRec", data.camposGeneralesDE.receptor.email);
    }
    if (data.camposGeneralesDE.receptor.hasOwnProperty("codigoCliente")) {
      gDatRec.e("dCodCliente", data.camposGeneralesDE.receptor.codigoCliente);
    }
    /**E. Campos específicos por tipo de Documento Electrónico (E001-E009)*/
    let gDtipDE = DE.e("gDtipDE");
    /**E1. Campos que componen la Factura Electrónica FE (E002-E099)*/
    if (data.documentoElectronico.hasOwnProperty("facturaElectronica")) {
      let gCamFE = gDtipDE.e("gCamFE");
      gCamFE.e(
        "iIndPres",
        data.documentoElectronico.facturaElectronica.indicadorPresencia
      );
      gCamFE.e(
        "dDesIndPres",
        data.documentoElectronico.facturaElectronica.desIndicadorPresencia
      );
      if (
        data.documentoElectronico.facturaElectronica.hasOwnProperty(
          "fechaEmisionNotaRemision"
        )
      ) {
        gCamFE.e(
          "dFecEmNR",
          data.documentoElectronico.facturaElectronica.fechaEmisionNotaRemision
        );
      }
      /**E1.1. Campos de informaciones de Compras Públicas (E020-E029)*/
      if (
        data.documentoElectronico.facturaElectronica.hasOwnProperty(
          "comprasPublicas"
        )
      ) {
        let gCompPub = gCamFE.e("gCamFE");
        gCompPub.e(
          "dModCont",
          data.documentoElectronico.facturaElectronica.comprasPublicas.modalidad
        );
        gCompPub.e(
          "dEntCont",
          data.documentoElectronico.facturaElectronica.comprasPublicas.entidad
        );
        gCompPub.e(
          "dAnoCont",
          data.documentoElectronico.facturaElectronica.comprasPublicas.anio
        );
        gCompPub.e(
          "dSecCont",
          data.documentoElectronico.facturaElectronica.comprasPublicas.secuencia
        );
        gCompPub.e(
          "dFeCodCont",
          data.documentoElectronico.facturaElectronica.comprasPublicas
            .fechaEmisionCC
        );
      }
    }
    /**E4. Campos que componen la Autofactura Electrónica AFE (E300-E399)*/
    if (data.documentoElectronico.hasOwnProperty("autofacturaElectronica")) {
      let gCamAE = gDtipDE.e("gCamAE");
      gCamAE.e(
        "iNatVen",
        data.documentoElectronico.autofacturaElectronica.naturaleza
      );
      gCamAE.e(
        "dDesNatVen",
        data.documentoElectronico.autofacturaElectronica.desNaturaleza
      );
      gCamAE.e(
        "iTipIDVen",
        data.documentoElectronico.autofacturaElectronica.tipoDocumento
      );
      gCamAE.e(
        "dDTipIDVen",
        data.documentoElectronico.autofacturaElectronica.desTipoDocumento
      );
      gCamAE.e(
        "dNumIDVen",
        data.documentoElectronico.autofacturaElectronica.numeroDocumento
      );
      gCamAE.e(
        "dNomVen",
        data.documentoElectronico.autofacturaElectronica.nombre
      );
      gCamAE.e(
        "dDirVen",
        data.documentoElectronico.autofacturaElectronica.direccion
      );
      gCamAE.e(
        "dNumCasVen",
        data.documentoElectronico.autofacturaElectronica.numeroCasa
      );
      gCamAE.e(
        "cDepVen",
        data.documentoElectronico.autofacturaElectronica.departamento
      );
      gCamAE.e(
        "dDesDepVen",
        data.documentoElectronico.autofacturaElectronica.desDepartamento
      );
      if (
        data.documentoElectronico.autofacturaElectronica.hasOwnProperty(
          "distrito"
        )
      ) {
        gCamAE.e(
          "cDisVen",
          data.documentoElectronico.autofacturaElectronica.distrito
        );
        gCamAE.e(
          "dDesDisVen",
          data.documentoElectronico.autofacturaElectronica.desDistrito
        );
      }
      gCamAE.e(
        "cCiuVen",
        data.documentoElectronico.autofacturaElectronica.ciudad
      );
      gCamAE.e(
        "dDesCiuVen",
        data.documentoElectronico.autofacturaElectronica.desCiudad
      );
      gCamAE.e(
        "dDirProv",
        data.documentoElectronico.autofacturaElectronica.direccion
      );
      gCamAE.e(
        "cDepProv",
        data.documentoElectronico.autofacturaElectronica.departamentoTransaccion
      );
      gCamAE.e(
        "dDesDepProv",
        data.documentoElectronico.autofacturaElectronica
          .desDepartamentoTransaccion
      );
      if (
        data.documentoElectronico.autofacturaElectronica.hasOwnProperty(
          "distritoTransaccion"
        )
      ) {
        gCamAE.e(
          "cDisProv",
          data.documentoElectronico.autofacturaElectronica.distritoTransaccion
        );
        gCamAE.e(
          "dDesDisProv",
          data.documentoElectronico.autofacturaElectronica
            .desDistritoTransaccion
        );
      }
      gCamAE.e(
        "cCiuProv",
        data.documentoElectronico.autofacturaElectronica.ciudadTransaccion
      );
      gCamAE.e(
        "dDesCiuProv",
        data.documentoElectronico.autofacturaElectronica.desCiudadTransaccion
      );
    }
    /**E5. Campos que componen la Nota de Crédito/Débito Electrónica NCE-NDE (E400-E499)*/
    if (
      data.documentoElectronico.hasOwnProperty("notaCreditoDebitoElectronica")
    ) {
      let gCamNCDE = gDtipDE.e("gCamNCDE");
      gCamNCDE.e(
        "iMotEmi",
        data.documentoElectronico.notaCreditoDebitoElectronica.motivoEmision
      );
      gCamNCDE.e(
        "dDesMotEmi",
        data.documentoElectronico.notaCreditoDebitoElectronica.desMotivoEmision
      );
    }
    /**E7. Campos que describen la condición de la operación (E600-E699)*/
    if (data.documentoElectronico.hasOwnProperty("condicionOperacion")) {
      let gCamCond = gDtipDE.e("gCamCond");
      gCamCond.e(
        "iCondOpe",
        data.documentoElectronico.condicionOperacion.condicion
      );
      gCamCond.e(
        "dDCondOpe",
        data.documentoElectronico.condicionOperacion.desCondicion
      );
      /**E7.1. Campos que describen la forma de pago de la operación al contado o del monto de la entrega inicial (E605-E619)*/
      if (
        data.documentoElectronico.condicionOperacion.hasOwnProperty(
          "pagoContado"
        )
      ) {
        data.documentoElectronico.condicionOperacion.pagoContado.forEach(
          (a) => {
            let gPaConEIni = gCamCond.e("gPaConEIni");
            gPaConEIni.e("iTiPago", a.tipoPago);
            gPaConEIni.e("dDesTiPag", a.desTipoPago);
            gPaConEIni.e("dMonTiPag", a.monto);
            gPaConEIni.e("cMoneTiPag", a.moneda);
            gPaConEIni.e("dDMoneTiPag", a.desMoneda);
            if (a.hasOwnProperty("tipoCambio")) {
              gPaConEIni.e("dTiCamTiPag", a.tipoCambio);
            }
            /**E7.1.1.Campos que describen el pago o entrega inicial de la operación con tarjeta de crédito/débito*/
            if (a.hasOwnProperty("pagoTarjetaCD")) {
              let gPagTarCD = gPaConEIni.e("gPagTarCD");
              gPagTarCD.e("iDenTarj", a.pagoTarjetaCD.denominacionTarjeta);
              gPagTarCD.e(
                "dDesDenTarj",
                a.pagoTarjetaCD.desDenominacionTarjeta
              );
              if (a.pagoTarjetaCD.hasOwnProperty("razonSocialProcesadora")) {
                gPagTarCD.e(
                  "dRSProTar",
                  a.pagoTarjetaCD.razonSocialProcesadora
                );
              }
              if (a.pagoTarjetaCD.hasOwnProperty("rucProcesadora")) {
                gPagTarCD.e("dRUCProTar", a.pagoTarjetaCD.rucProcesadora);
                gPagTarCD.e(
                  "dDVProTar",
                  a.pagoTarjetaCD.digitoVerificadorProcesadora
                );
              }
              gPagTarCD.e("iForProPa", a.pagoTarjetaCD.formaProcesamiento);
              if (a.pagoTarjetaCD.hasOwnProperty("codigoAutorizacion")) {
                gPagTarCD.e("dCodAuOpe", a.pagoTarjetaCD.codigoAutorizacion);
              }
              if (a.pagoTarjetaCD.hasOwnProperty("nombreTitular")) {
                gPagTarCD.e("dNomTit", a.pagoTarjetaCD.nombreTitular);
              }
              if (a.pagoTarjetaCD.hasOwnProperty("numeroTarjeta")) {
                gPagTarCD.e("dNumTarj", a.pagoTarjetaCD.numeroTarjeta);
              }
            }
            /**E7.1.2.Campos que describen el pago o entrega inicial de la operación con cheque (E630-E639)*/
            if (a.hasOwnProperty("pagoCheque")) {
              let gPagCheq = gPaConEIni.e("gPagCheq");
              gPagCheq.e("dNumCheq", a.pagoCheque.numero);
              gPagCheq.e("dBcoEmi", a.pagoCheque.banco);
            }
          }
        );
      }
      /**E7.2. Campos que describen la operación a crédito (E640-E649)*/
      if (
        data.documentoElectronico.condicionOperacion.hasOwnProperty(
          "pagoCredito"
        )
      ) {
        let gPagCred = gCamCond.e("gPagCred");
        gPagCred.e(
          "iCondCred",
          data.documentoElectronico.condicionOperacion.pagoCredito.condicion
        );
        gPagCred.e(
          "dDCondCred",
          data.documentoElectronico.condicionOperacion.pagoCredito.desCondicion
        );
        if (
          data.documentoElectronico.condicionOperacion.pagoCredito.hasOwnProperty(
            "plazo"
          )
        ) {
          gPagCred.e(
            "dPlazoCre",
            data.documentoElectronico.condicionOperacion.pagoCredito.plazo
          );
        }
        if (
          data.documentoElectronico.condicionOperacion.pagoCredito.hasOwnProperty(
            "cantidadCuotas"
          )
        ) {
          gPagCred.e(
            "dCuotas",
            data.documentoElectronico.condicionOperacion.pagoCredito
              .cantidadCuotas
          );
        }
        if (
          data.documentoElectronico.condicionOperacion.pagoCredito.hasOwnProperty(
            "monto"
          )
        ) {
          gPagCred.e(
            "dMonEnt",
            data.documentoElectronico.condicionOperacion.pagoCredito.monto
          );
        }
        /**E7.2.1.Campos que describen las cuotas (E650-E659)*/
        if (
          data.documentoElectronico.condicionOperacion.pagoCredito.hasOwnProperty(
            "cuotas"
          )
        ) {
          data.documentoElectronico.condicionOperacion.pagoCredito.cuotas.forEach(
            (a) => {
              let gCuotas = gPagCred.e("gCuotas");
              gCuotas.e("cMoneCuo", a.moneda);
              gCuotas.e("dDMoneCuo", a.desMoneda);
              gCuotas.e("dMonCuota", a.monto);
              if (a.hasOwnProperty("vencimiento")) {
                gCuotas.e("dMonCuota", a.vencimiento);
              }
            }
          );
        }
      }
    }
    /**E8. Campos que describen los ítems de la operación (E700-E899)*/
    data.documentoElectronico.items.forEach((a) => {
      let gCamItem = gDtipDE.e("gCamItem");
      gCamItem.e("dCodInt", a.codigoInterno);
      if (a.hasOwnProperty("partidaArancelaria")) {
        gCamItem.e("dParAranc", a.partidaArancelaria);
      }
      if (a.hasOwnProperty("nomenclaturaComunMercosur")) {
        gCamItem.e("dNCM", a.nomenclaturaComunMercosur);
      }
      if (a.hasOwnProperty("codigoDNCPNivelGral")) {
        gCamItem.e("dDncpG", a.codigoDNCPNivelGral);
      }
      if (a.hasOwnProperty("codigoDNCPNivelEspecifico")) {
        gCamItem.e("dDncpE", a.codigoDNCPNivelEspecifico);
      }
      if (a.hasOwnProperty("gtinProducto")) {
        gCamItem.e("dGtin", a.gtinProducto);
      }
      if (a.hasOwnProperty("gtinPaquete")) {
        gCamItem.e("dGtinPq", a.gtinPaquete);
      }
      gCamItem.e("dDesProSer", a.desProductoServicio);
      gCamItem.e("cUniMed", a.unidadMedida);
      gCamItem.e("dDesUniMed", a.desUnidadMedida);
      gCamItem.e("dCantProSer", a.cantidad);
      if (a.hasOwnProperty("paisOrigen")) {
        gCamItem.e("cPaisOrig", a.paisOrigen);
        gCamItem.e("dDesPaisOrig", a.desPaisOrigen);
      }
      if (a.hasOwnProperty("infoEmisor")) {
        gCamItem.e("dInfItem", a.infoEmisor);
      }
      if (a.hasOwnProperty("relevanciaMercaderia")) {
        gCamItem.e("cRelMerc", a.relevanciaMercaderia);
        gCamItem.e("dDesRelMerc", a.desRelevanciaMercaderia);
      }
      if (a.hasOwnProperty("cantidadQuiebraMerma")) {
        gCamItem.e("dCanQuiMer", a.cantidadQuiebraMerma);
      }
      if (a.hasOwnProperty("porcentajeQuiebraMerma")) {
        gCamItem.e("dPorQuiMer", a.porcentajeQuiebraMerma);
      }
      if (a.hasOwnProperty("cdcAnticipo")) {
        gCamItem.e("dCDCAnticipo", a.cdcAnticipo);
      }
      /**E8.1. Campos que describen el precio, tipo de cambio y valor total de la operación por ítem (E720-E729)*/
      if (a.hasOwnProperty("valorItem")) {
        let gValorItem = gCamItem.e("gValorItem");
        gValorItem.e("dPUniProSer", a.valorItem.precioUnitario);
        if (a.valorItem.hasOwnProperty("tipoCambio")) {
          gValorItem.e("dTiCamIt", a.valorItem.tipoCambio);
        }
        gValorItem.e("dTotBruOpeItem", a.valorItem.totalBruto);
        /**E8.1.1 Campos que describen los descuentos, anticipos y valor total por ítem (EA001-EA050)*/
        let gValorRestaItem = gValorItem.e("gValorRestaItem");
        if (a.valorItem.valorRestaItem.hasOwnProperty("descuento")) {
          gValorRestaItem.e("dDescItem", a.valorItem.valorRestaItem.descuento);
        }
        if (a.valorItem.valorRestaItem.hasOwnProperty("porcentajeDescuento")) {
          gValorRestaItem.e(
            "dPorcDesIt",
            a.valorItem.valorRestaItem.porcentajeDescuento
          );
        }
        if (a.valorItem.valorRestaItem.hasOwnProperty("descuentoGlobal")) {
          gValorRestaItem.e(
            "dDescGloItem",
            a.valorItem.valorRestaItem.descuentoGlobal
          );
        }
        if (
          a.valorItem.valorRestaItem.hasOwnProperty(
            "anticipoParticularPrecioUnitario"
          )
        ) {
          gValorRestaItem.e(
            "dAntPreUniIt",
            a.valorItem.valorRestaItem.anticipoParticularPrecioUnitario
          );
        }
        if (
          a.valorItem.valorRestaItem.hasOwnProperty(
            "anticipoGlobalPrecioUnitario"
          )
        ) {
          gValorRestaItem.e(
            "dAntGloPreUniIt",
            a.valorItem.valorRestaItem.anticipoGlobalPrecioUnitario
          );
        }
        gValorRestaItem.e(
          "dTotOpeItem",
          a.valorItem.valorRestaItem.totalOperacion
        );
        if (
          a.valorItem.valorRestaItem.hasOwnProperty("totalOperacionGuaranies")
        ) {
          gValorRestaItem.e(
            "dTotOpeGs",
            a.valorItem.valorRestaItem.totalOperacionGuaranies
          );
        }
      }
      /**E8.2. Campos que describen el IVA de la operación por ítem (E730-E739)*/
      if (a.hasOwnProperty("iva")) {
        let gCamIVA = gCamItem.e("gCamIVA");
        gCamIVA.e("iAfecIVA", a.iva.afectacionTributariaIva);
        gCamIVA.e("dDesAfecIVA", a.iva.desAfectacionTributariaIva);
        gCamIVA.e("dPropIVA", a.iva.proporcionGravadaIva);
        gCamIVA.e("dTasaIVA", a.iva.tasaIva);
        gCamIVA.e("dBasGravIVA", a.iva.baseGravadaIva);
        gCamIVA.e("dLiqIVAItem", a.iva.liquidacionIva);
        if (a.iva.hasOwnProperty("baseExenta") /*&& a.iva.baseExenta*/) {
          gCamIVA.e("dBasExe", a.iva.baseExenta);
        }
      }
    });
    /**F. Campos que describen los subtotales y totales de la transacción documentada (F001-F099)*/
    if (data.hasOwnProperty("subtotalesTotales")) {
      let gTotSub = DE.e("gTotSub");
      if (data.subtotalesTotales.hasOwnProperty("subtotalExenta")) {
        gTotSub.e("dSubExe", data.subtotalesTotales.subtotalExenta);
      }
      if (data.subtotalesTotales.hasOwnProperty("subtotalExonerada")) {
        gTotSub.e("dSubExo", data.subtotalesTotales.subtotalExonerada);
      }
      if (data.subtotalesTotales.hasOwnProperty("subtotalIvaIncluido5")) {
        gTotSub.e("dSub5", data.subtotalesTotales.subtotalIvaIncluido5);
      }
      if (data.subtotalesTotales.hasOwnProperty("subtotalIvaIncluido10")) {
        gTotSub.e("dSub10", data.subtotalesTotales.subtotalIvaIncluido10);
      }
      gTotSub.e("dTotOpe", data.subtotalesTotales.totalBruto);
      gTotSub.e("dTotDesc", data.subtotalesTotales.totalDescuentoParticular);
      gTotSub.e("dTotDescGlotem", data.subtotalesTotales.totalDescuentoGlobal);
      gTotSub.e("dTotAntItem", data.subtotalesTotales.totalAnticipo);
      gTotSub.e("dTotAnt", data.subtotalesTotales.totalAnticipoGlobal);
      gTotSub.e(
        "dPorcDescTotal",
        data.subtotalesTotales.porcentajeDescuentoTotal
      );
      gTotSub.e("dDescTotal", data.subtotalesTotales.descuentoTotal);
      gTotSub.e("dAnticipo", data.subtotalesTotales.totalAnticipo);
      gTotSub.e("dRedon", data.subtotalesTotales.redondeo);
      if (data.subtotalesTotales.hasOwnProperty("comision")) {
        gTotSub.e("dComi", data.subtotalesTotales.comision);
      }
      gTotSub.e("dTotGralOpe", data.subtotalesTotales.totalGeneral);
      if (data.subtotalesTotales.hasOwnProperty("iva5")) {
        gTotSub.e("dIVA5", data.subtotalesTotales.iva5);
      }
      if (data.subtotalesTotales.hasOwnProperty("iva10")) {
        gTotSub.e("dIVA10", data.subtotalesTotales.iva10);
      }
      if (
        data.subtotalesTotales.hasOwnProperty("liquidacionTotalIva5Redondeo")
      ) {
        gTotSub.e(
          "dLiqTotIVA5",
          data.subtotalesTotales.liquidacionTotalIva5Redondeo
        );
      }
      if (
        data.subtotalesTotales.hasOwnProperty("liquidacionTotalIva10Redondeo")
      ) {
        gTotSub.e(
          "dLiqTotIVA10",
          data.subtotalesTotales.liquidacionTotalIva10Redondeo
        );
      }
      if (data.subtotalesTotales.hasOwnProperty("ivaComision")) {
        gTotSub.e("dIVAComi", data.subtotalesTotales.ivaComision);
      }
      if (data.subtotalesTotales.hasOwnProperty("totalIva")) {
        gTotSub.e("dTotIVA", data.subtotalesTotales.totalIva);
      }
      if (data.subtotalesTotales.hasOwnProperty("totalBaseGravada5")) {
        gTotSub.e("dBaseGrav5", data.subtotalesTotales.totalBaseGravada5);
      }
      if (data.subtotalesTotales.hasOwnProperty("totalBaseGravada10")) {
        gTotSub.e("dBaseGrav10", data.subtotalesTotales.totalBaseGravada10);
      }
      if (data.subtotalesTotales.hasOwnProperty("totalBaseGravadaIva")) {
        gTotSub.e("dTBasGraIVA", data.subtotalesTotales.totalBaseGravadaIva);
      }
      if (
        data.subtotalesTotales.hasOwnProperty("totalGuaranies") &&
        data.subtotalesTotales.totalGuaranies
      ) {
        gTotSub.e("dTotalGs", data.subtotalesTotales.totalGuaranies);
      }
    }
    /**H. Campos que identifican al documento asociado (H001-H049)*/
    if (data.hasOwnProperty("DeAsociado")) {
      data.DeAsociado.forEach((a) => {
        let gCamDEAsoc = DE.e("gCamDEAsoc");
        gCamDEAsoc.e("iTipDocAso", a.tipo);
        gCamDEAsoc.e("dDesTipDocAso", a.desTipo);
        if (a.hasOwnProperty("cdc")) {
          gCamDEAsoc.e("dCdCDERef", a.cdc);
        }
        if (a.hasOwnProperty("numeroTimbrado")) {
          gCamDEAsoc.e("dNTimDI", a.numeroTimbrado);
        }
        if (a.hasOwnProperty("establecimiento")) {
          gCamDEAsoc.e("dEstDocAso", a.establecimiento);
        }
        if (a.hasOwnProperty("puntoExpedicion")) {
          gCamDEAsoc.e("dPExpDocAso", a.puntoExpedicion);
        }
        if (a.hasOwnProperty("numeroDocumento")) {
          gCamDEAsoc.e("dNumDocAso", a.numeroDocumento);
        }
        if (a.hasOwnProperty("tipoDocumentoImpreso")) {
          gCamDEAsoc.e("iTipoDocAso", a.tipoDocumentoImpreso);
          gCamDEAsoc.e("dDTipoDocAso", a.desTipoDocumentoImpreso);
        }
        if (a.hasOwnProperty("fechaEmisionDocumentoImpreso")) {
          gCamDEAsoc.e("dFecEmiDI", a.fechaEmisionDocumentoImpreso);
        }
        if (a.hasOwnProperty("numeroRetencion")) {
          gCamDEAsoc.e("dNumComRet", a.numeroRetencion);
        }
        if (a.hasOwnProperty("numeroResolucionCreditoFiscal")) {
          gCamDEAsoc.e("dNumResCF", a.numeroResolucionCreditoFiscal);
        }
        if (a.hasOwnProperty("tipoConstancia")) {
          gCamDEAsoc.e("iTipCons", a.tipoConstancia);
          gCamDEAsoc.e("dDesTipCons", a.desTipoConstancia);
        }
        if (a.hasOwnProperty("numeroConstancia")) {
          gCamDEAsoc.e("dNumCons", a.numeroConstancia);
        }
        if (a.hasOwnProperty("numeroControlConstancia")) {
          gCamDEAsoc.e("dNumControl", a.numeroControlConstancia);
        }
      });
    }
    fs.writeFile(pathXml, rDE.end({ pretty: true }), (err) => {
      if (err)
        reject({
          origin: "generateXml",
          details: new Array(`Error al generar XML: ${err}.`),
        });
      resolve();
    });
  });
};
/**
 * Function: signXml
 * Inserta la firma digital en el XML
 * @param {string} xmlName:'256543.xml'
 * @param {string} cert: 'sds_public.pem'
 * @param {string} key:'sds.key'
 * @param {string} passphrase:'delsol1995'
 * @param {integer} documentType:1 [Factura electrónica] || 5 [Nota de crédito electrónica]
 * @returns {promises}
 */
export const signXml = (idDe, xmlName, cert, key, passphrase, documentType) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Insertando firma digital al XML.`;
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
    const XML_SIGNATURE_PATH = "//*[local-name(.)='DE']";
    const SIGNATURE_ALGORITHM =
      "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256";
    const DIGEST_ALGORITHM = "http://www.w3.org/2001/04/xmlenc#sha256";
    let xmlPath = "";
    let xmlSignedPath = "";
    let sig = new SignedXml(null, {
      signatureAlgorithm: SIGNATURE_ALGORITHM,
    });
    //Factura electrónica
    if (documentType === 1) {
      xmlPath = `${config.paths.xml.invoices}/${xmlName}`;
      xmlSignedPath = `${config.paths.xmlSigned.invoices}/${xmlName}`;
    }
    //Nota de crédito electrónica
    if (documentType === 5) {
      xmlPath = `${config.paths.xml.creditNotes}/${xmlName}`;
      xmlSignedPath = `${config.paths.xmlSigned.creditNotes}/${xmlName}`;
    }
    const xml = fs.readFileSync(xmlPath).toString();
    try {
      sig.canonicalizationAlgorithm =
        "http://www.w3.org/TR/2001/REC-xml-c14n-20010315";
      sig.addReference(
        XML_SIGNATURE_PATH,
        [
          "http://www.w3.org/2000/09/xmldsig#enveloped-signature",
          "http://www.w3.org/2001/10/xml-exc-c14n#",
        ],
        DIGEST_ALGORITHM
      );
      sig.signingKey = readPrivateKeyFromProtectedPem(key, passphrase);
      let pem = removeHeaders(cert);
      sig.keyInfoProvider = {
        getKeyInfo: function () {
          return (
            "<X509Data><X509Certificate>" +
            pem +
            "</X509Certificate></X509Data>"
          );
        },
      };
      sig.computeSignature(formatXml(xml));
      fs.writeFile(xmlSignedPath, sig.getSignedXml(), (err) => {
        if (err)
          reject({
            origin: "signXml",
            details: new Array(
              `Error durante el proceso de firma digital del documento ${xmlName}: ${err}`
            ),
          });
        resolve(sig.getSignedXml());
      });
    } catch (error) {
      if (error.code === "ENOENT") {
        reject({
          origin: "signXml",
          details: new Array(
            `Error durante el proceso de firma digital: No se encuentra el archivo ${error.path}.`
          ),
        });
      } else {
        if (sig.signingKey === null) {
          reject({
            origin: "signXml",
            details: new Array(
              `Error durante el proceso de firma digital: No se ha podido obtener la clave privada. Passphrase incorrecto: ${error}.`
            ),
          });
        } else {
          reject({
            origin: "signXml",
            details: new Array(
              `Error durante el proceso de firma digital: ${error.message}.`
            ),
          });
        }
      }
    }
  });
};
/**
 * Function: generateUrlForQr
 * Genera la URL del QR según especificaciones del MT del SIFEN
 * @param {string} xmlName: 's256543.xml'
 * @param {integer} documentType: 1 [Factura electrónica] || 5 [Nota de crédito electrónica]
 * @returns {promises}
 */
export const generateUrlForQr = (idDe, xmlName, documentType) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Generando URL de código QR.`;
    console.log(
      `[${moment(new Date()).format(
        "DD/MM/YYYY hh:mm:ss.SSSZ"
      )}]: ${logMessage}`
    );
    let payload = {
      numero: idDe,
      message: logMessage,
      tipoLog: "info",
    };
    await insertLog(payload);
    /**---------------------- */
    let xmlPath = "";
    //Factura electrónica
    if (documentType === 1) {
      xmlPath = `${config.paths.xmlSigned.invoices}/${xmlName}`;
    }
    //Nota de crédito electrónica
    if (documentType === 5) {
      xmlPath = `${config.paths.xmlSigned.creditNotes}/${xmlName}`;
    }
    try {
      const xml = fs.readFileSync(xmlPath).toString();
      const parser = new xml2js.Parser();
      parser
        .parseStringPromise(xml)
        .then((res) => {
          const param = `nVersion=${res.rDE.dVerFor[0]}&Id=${
            res.rDE.DE[0].$.Id
          }&dFeEmiDE=${convertStringToHexadecimal(
            res.rDE.DE[0].gDatGralOpe[0].dFeEmiDE[0]
          )}${
            res.rDE.DE[0].gDatGralOpe[0].gDatRec[0].iNatRec[0] === "1"
              ? "&dRucRec="
              : "&dNumIDRec="
          }${
            res.rDE.DE[0].gDatGralOpe[0].gDatRec[0].iNatRec[0] === "1"
              ? res.rDE.DE[0].gDatGralOpe[0].gDatRec[0].dRucRec[0]
              : res.rDE.DE[0].gDatGralOpe[0].gDatRec[0].dNumIDRec[0]
          }&dTotGralOpe=${res.rDE.DE[0].gTotSub[0].dTotGralOpe[0]}&dTotIVA=${
            res.rDE.DE[0].gTotSub[0].dTotIVA[0]
          }&cItems=${
            res.rDE.DE[0].gDtipDE[0].gCamItem.length
          }&DigestValue=${convertStringToHexadecimal(
            res.rDE.Signature[0].SignedInfo[0].Reference[0].DigestValue[0].toString()
          )}&IdCSC=${config.idCsc}`;
          const hash = generateSHA256(`${param}${config.csc}`);
          const urlQr = `${config.url_consulta_qr}${param}&cHashQR=${hash}`;
          resolve(urlQr);
        })
        .catch((err) =>
          reject({
            origin: "generateUrlForQr",
            details: new Array(`Error al generar URL de código QR: ${err}.`),
          })
        );
    } catch (err) {
      reject({
        origin: "generateUrlForQr",
        details: new Array(`Error al generar URL de código QR: ${err}.`),
      });
    }
  });
};
export const generateQr = (idDe, url) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Generando código QR.`;
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
    qrcode.toDataURL(url, async (err, qr) => {
      if (err)
        reject({
          origin: "generateQr",
          details: new Array(`Error generando QR: ${err}.`),
        });
      resolve(qr);
    });
  });
};
/**
 * Function: addUrlQrToXml
 * Inserta URL del QR en el XML firmado
 * @param {string} xmlName: 's256543.xml'
 * @param {integer} documentType: 1 [Factura electrónica] || 5 [Nota de crédito electrónica]
 * @param {string} url: https://ekuatia.set.gov.py/consultas-test/qr?nVersion=150...
 * @returns {promises}
 */
export const addUrlQrToXml = (idDe, xmlName, documentType, url) => {
  return new Promise(async (resolve, reject) => {
    const logMessage = `Insertando URL de código QR a xml.`;
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
    let xmlPath = "";
    //Factura electrónica
    if (documentType === 1) {
      xmlPath = `${config.paths.xmlSigned.invoices}/${xmlName}`;
    }
    //Nota de crédito electrónica
    if (documentType === 5) {
      xmlPath = `${config.paths.xmlSigned.creditNotes}/${xmlName}`;
    }
    try {
      const xml = fs.readFileSync(xmlPath).toString();
      const parser = new xml2js.Parser();
      parser
        .parseStringPromise(xml)
        .then((res) => {
          let obj = {
            rDE: {
              ...res.rDE,
              gCamFuFD: {
                dCarQR: url,
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
          fs.writeFile(xmlPath, _xml, (err) => {
            if (err)
              reject({
                origin: "addUrlQrToXml",
                details: new Array(
                  `Error al insertar URL de código QR a xml: ${err}.`
                ),
              });
            resolve(_xml);
          });
        })
        .catch((err) =>
          reject({
            origin: "addUrlQrToXml",
            ditails: new Array(
              `Error al insertar URL de código QR a xml: ${err}.`
            ),
          })
        );
    } catch (err) {
      reject({
        origin: "addUrlQrToXml",
        details: new Array(`Error al insertar URL de código QR a xml: ${err}.`),
      });
    }
  });
};
/**
 * function: generateKude
 * Genera el documento electrónico en formato pdf
 * @param {json} data
 * @param {string} qr
 */
export const generateKude = (idDe, data, qr, cdc) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Generando Kude.`;
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
    const logoBase64 = base64_encode("logo.png");
    const logo = `data:image/png;base64,${logoBase64}`;
    let rows = data.documentoElectronico.items.length;
    let first = 17; //let first = 22;
    let next = 33;
    let last = 29;
    let pages = 0;
    let exit = 1;
    let maxRows;
    let from = 0;
    let to = 0;
    let lastTo;
    const pdfSettings = {
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: "",
      margin: { bottom: "70px" },
    };
    do {
      if (exit === 1) {
        rows = rows - first;
        exit = 0;
        pages = pages + 1;
      }
      if (exit === 0 && rows > 0) {
        if (rows - next > 0) {
          rows = rows - next;
          pages = pages + 1;
        } else {
          pages = pages + 1;
          rows = 0;
        }
      }
    } while (rows > 0);
    if (pages === 1) {
      first = 12; //first = 17;
      maxRows = 12; //maxRows = 17;
    }
    try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();
      const merger = new PDFMerger();
      let pathKude = "";
      let templateName = "";
      //Factura electrónica
      if (data.timbrado.tipoDE === 1) {
        pathKude = path.join(config.paths.kude.invoices, `${cdc}.pdf`);
        templateName = `${config.paths.templates.invoice}`;
      }
      //Nota de crédito electrónica
      if (data.timbrado.tipoDE === 5) {
        pathKude = path.join(config.paths.kude.creditNotes, `${cdc}.pdf`);
        templateName = `${config.paths.templates.creditNote}`;
      }
      for (let i = 1; i <= pages; i++) {
        if (i === 1) {
          from = 0;
          to = first - 1;
          maxRows = first;
          lastTo = to;
        }
        if (pages >= 2 && i === pages) {
          from = lastTo + 1;
          to = lastTo + last;
          maxRows = last;
        }
        if (pages > 2 && i > 1 && i < pages) {
          from = lastTo + 1;
          to = lastTo + next;
          maxRows = next;
          lastTo = to;
        }
        if (to > data.documentoElectronico.items.length) {
          to = data.documentoElectronico.items.length - 1;
        }
        let details = [];
        for (let i = from; i <= to; i++) {
          details.push(data.documentoElectronico.items[i]);
        }
        let items = [];
        for (let i = 0; i < maxRows - details.length; i++) {
          items.push({});
        }
        let content = await compile(templateName, {
          ...data,
          details,
          items,
          logo,
          qr,
          page: i,
          pages,
        });
        await page.setContent(content);
        await merger.add(
          await page.pdf({
            ...pdfSettings,
            footerTemplate: `
        <div style="width: 100%; font-size: 9px;
            padding: 0 5px 5px 0; color: #bbb; position: relative; margin-bottom: 15px; margin-right: 15px;">
          <div style="position: absolute; right: 5px; top: 5px;"><span>${i}</span>/<span>${pages}</span></div>
        </div>
      `,
          })
        );
      }
      await merger.save(pathKude);
      await browser.close();
      resolve();
    } catch (err) {
      reject({
        origin: "generateKude",
        details: new Array(`Error al generar Kude: ${err}.`),
      });
    }
  });
};

const compile = async function (templateName, data) {
  const html = await fs.readFileSync(templateName, "utf-8");
  hbs.registerHelper("eq", function (v1, v2, options) {
    if (v1 === v2) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  hbs.registerHelper("formatNumber", function (value) {
    return value === undefined || value === "" || value === null
      ? ""
      : new Intl.NumberFormat().format(value);
  });
  hbs.registerHelper("formatDateTime", function (date) {
    return date === undefined || date === "" || date === null
      ? ""
      : moment(date).format("DD/MM/YYYY hh:mm:ss");
  });
  hbs.registerHelper("formatDate", function (date) {
    return date === undefined || date === "" || date === null
      ? ""
      : moment(date).format("DD/MM/YYYY");
  });
  hbs.registerHelper("toShowSubtotal", function (pages, page, options) {
    if ((pages > 1 && page === pages) || pages === 1) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });
  hbs.registerHelper("toShowQr", function (pages, page, options) {
    if ((pages > 1 && page === 1) || pages === 1) {
      return options.fn(this);
    } else {
      return options.inverse(this);
    }
  });

  return hbs.compile(html)(data);
};

const base64_encode = function (fileName) {
  const filePath = path.join(process.cwd(), "templates/img", fileName);
  const bitmap = fs.readFileSync(filePath);
  return Buffer.from(bitmap).toString("base64");
};

export const sendEmail = (idDe, from, to, cc, subject, html, attached) => {
  return new Promise(async (resolve, reject) => {
    /**Registra log */
    const logMessage = `Enviando Documentos Electrónicos a ${to}.`;
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
    let transport = nodemailer.createTransport({
      host: config.smtp,
      port: config.smtpPort,
      secure: false,
      rejectUnauthorized: false,
      auth: {
        user: config.smtpUser,
        pass: config.smtpPassword,
      },
    });
    let mailOptions = {
      from,
      to,
      cc,
      subject,
      html,
      attachments: [
        {
          filename: attached[0].split("\\")[attached[0].split("\\").length - 1],
          path: attached[0],
          cid: `uniq-${
            attached[0].split("\\")[attached[0].split("\\").length - 1]
          }`,
        },
        {
          filename: attached[1].split("\\")[attached[1].split("\\").length - 1],
          path: attached[1],
          cid: `uniq-${
            attached[1].split("\\")[attached[1].split("\\").length - 1]
          }`,
        },
      ],
    };
    transport.sendMail(mailOptions, async (err, info) => {
      if (err) {
        payload = {
          idDe: idDe,
          message: err,
          tipoLog: "error",
        };
        await insertLog(payload);
        reject({
          origin: "sendEmail",
          details: new Array(`Error al enviar email: ${err}.`),
        });
      }
      if (info) {
        payload = {
          idDe: idDe,
          message: info,
          tipoLog: "info",
        };
        await insertLog(payload);
        resolve();
      }
    });
  });
};

export const generateElectronicDocument = (data) => {
  return new Promise(async (resolve, reject) => {
    let payload;
    let idDe;
    let tipoDe;
    let cdc;
    let xml;
    let fecha;
    let codigoSeguridad;
    try {
      /**Registrar generación de documento electrónico */
      if (data.camposGeneralesDE.receptor.ruc) {
        idDe = await insertDe(
          `${data.camposGeneralesDE.receptor.ruc}-${data.camposGeneralesDE.receptor.digitoVerificador}`,
          `${data.timbrado.establecimiento}-${data.timbrado.puntoExpedicion}-${data.timbrado.numeroDocumento}`,
          data.camposGeneralesDE.receptor.nombre,
          data.camposGeneralesDE.receptor.email,
          data.camposGeneralesDE.receptor.emailCc
        );
      }
      if (
        data.camposGeneralesDE.receptor.tipoDocumento &&
        data.camposGeneralesDE.receptor.numeroDocumento
      ) {
        idDe = await insertDe(
          `${data.camposGeneralesDE.receptor.numeroDocumento}`,
          `${data.timbrado.establecimiento}-${data.timbrado.puntoExpedicion}-${data.timbrado.numeroDocumento}`,
          data.camposGeneralesDE.receptor.nombre
        );
      }
      /**Registra log */
      let logMessage = `Iniciando proceso de generación de documento electrónico.`;
      console.log(
        `[${moment(new Date()).format(
          "DD/MM/YYYY hh:mm:ss.SSSZ"
        )}]: ${logMessage}`
      );
      payload = {
        idDe: idDe,
        message: logMessage,
        tipoLog: "info",
      };
      await insertLog(payload);
      /**---------------------- */
      /**Obtiene datos del tipo de documento electrónico */
      tipoDe = await getTipoDeByCode(idDe, data.timbrado.tipoDE);
      if (tipoDe) {
        data.timbrado.tipoDE = tipoDe.tipo_de;
        data.timbrado.desTipoDE = tipoDe.descripcion;
      }
      /**Calcula los valores para los atributos */
      //fecha = moment(new Date()).format("YYYY-MM-DDThh:mm:ss");
      fecha = moment(
        data.documentoElectronico.fechaEmision,
        "DD/MM/YYYY hh:mm:ss"
      ).format("YYYY-MM-DDThh:mm:ss");
      if (!data.documentoElectronico.cdc) {
        codigoSeguridad = generateSecurityCode();
        cdc = generateCdc({
          tipoDe:
            data.timbrado.tipoDE.toString().length === 1
              ? "0" + data.timbrado.tipoDE
              : data.timbrado.tipoDE,
          rucEmisor: data.camposGeneralesDE.emisor.ruc,
          dvEmisor: data.camposGeneralesDE.emisor.digitoVerificador,
          establecimiento: data.timbrado.establecimiento,
          puntoExpedicion: data.timbrado.puntoExpedicion,
          numeroDe: data.timbrado.numeroDocumento,
          tipoContribuyente: data.camposGeneralesDE.emisor.tipoContribuyente,
          fechaEmision: moment(fecha).format("YYYYMMDD"),
          tipoEmision: data.operacionDE.tipoEmision,
          codigoSeguridad,
        });
      } else {
        cdc = data.documentoElectronico.cdc;
        let _de = await getDeByCdc(cdc);
        if (_de) {
          codigoSeguridad = _de.codigo_seguridad;
        }
      }
      /**Asigna los valores a los atributos del parámetro */
      data.id = cdc;
      data.digitoVerificadorDE = cdc.substring(43);
      data.fechaFirmaDigital = fecha;
      data.camposGeneralesDE.fechaEmisionDE = fecha;
      /**Obtiene datos del sistema de facturación */
      const sistemaFacturacion = await getSistemaFacturacionByCode(idDe);
      if (sistemaFacturacion) {
        data.sistemaFacturacion = sistemaFacturacion.codigo;
      }
      /**Obtiene datos del tipo de emisión */
      const tipoEmision = await getTipoEmisionDeByCode(
        data.operacionDE.tipoEmision,
        idDe
      );
      if (tipoEmision) {
        data.operacionDE.desTipoEmision = tipoEmision.descripcion;
      }
      /**Obtiene datos del tipo de transacción */
      if (
        data.camposGeneralesDE.operacionComercial.tipoTransaccion !== undefined
      ) {
        const tipoTransaccion = await getTipoTransaccionByCode(
          data.camposGeneralesDE.operacionComercial.tipoTransaccion,
          idDe
        );
        if (tipoTransaccion) {
          data.camposGeneralesDE.operacionComercial.desTransaccion =
            tipoTransaccion.descripcion;
        }
      }
      /**Obtiene los datos del tipo de impuesto */
      const tipoImpuesto = await getTipoImpuestoByCode(
        data.camposGeneralesDE.operacionComercial.tipoImpuesto,
        idDe
      );
      if (tipoImpuesto) {
        data.camposGeneralesDE.operacionComercial.desTipoImpuesto =
          tipoImpuesto.descripcion;
      }
      /**Obtiene los datos de la moneda de la operación comercial*/
      const monedaOc = await getMonedaByCode(
        data.camposGeneralesDE.operacionComercial.moneda,
        idDe
      );
      if (monedaOc) {
        data.camposGeneralesDE.operacionComercial.moneda = monedaOc.codigo;
        data.camposGeneralesDE.operacionComercial.desMoneda =
          monedaOc.descripcion;
      }
      /**Obtiene los datos del departamento del emisor*/
      const departamentoEmisor = await getDepartamentoByCode(
        data.camposGeneralesDE.emisor.departamento,
        idDe
      );
      if (departamentoEmisor) {
        data.camposGeneralesDE.emisor.departamento = departamentoEmisor.codigo;
        data.camposGeneralesDE.emisor.desDepartamento =
          departamentoEmisor.descripcion;
      }
      /**Obtiene los datos del distrito del emisor*/
      const distritoEmisor = await getDistritoByCode(
        data.camposGeneralesDE.emisor.distrito,
        idDe
      );
      if (distritoEmisor) {
        data.camposGeneralesDE.emisor.distrito = distritoEmisor.codigo;
        data.camposGeneralesDE.emisor.desDistrito = distritoEmisor.descripcion;
      }
      /**Obtiene los datos de la ciudad del emisor*/
      const ciudadEmisor = await getCiudadByCode(
        data.camposGeneralesDE.emisor.ciudad,
        idDe
      );
      if (ciudadEmisor) {
        data.camposGeneralesDE.emisor.ciudad = ciudadEmisor.codigo;
        data.camposGeneralesDE.emisor.desCiudad = ciudadEmisor.descripcion;
      }
      /**Obtiene los datos del tipo de documento del receptor*/
      if (data.camposGeneralesDE.receptor.tipoDocumento) {
        const tipoDocumentoReceptor = await getTipoDocumentoIdentidadByCode(
          data.camposGeneralesDE.receptor.tipoDocumento,
          idDe
        );
        if (tipoDocumentoReceptor) {
          data.camposGeneralesDE.receptor.tipoDocumento =
            tipoDocumentoReceptor.codigo;
          data.camposGeneralesDE.receptor.desTipoDocumento =
            tipoDocumentoReceptor.descripcion;
        }
      }
      /**Obtiene los datos del pais del receptor*/
      if (data.camposGeneralesDE.receptor.pais) {
        const paisReceptor = await getPaisByCode(
          data.camposGeneralesDE.receptor.pais,
          idDe
        );
        if (paisReceptor) {
          data.camposGeneralesDE.receptor.pais = paisReceptor.codigo;
          data.camposGeneralesDE.receptor.desPais = paisReceptor.descripcion;
        }
      }
      /**Obtiene los datos del departamento del receptor*/
      if (data.camposGeneralesDE.receptor.departamento) {
        const departamentoReceptor = await getDepartamentoByCode(
          data.camposGeneralesDE.receptor.departamento,
          idDe
        );
        if (departamentoReceptor) {
          data.camposGeneralesDE.receptor.departamento =
            departamentoReceptor.codigo;
          data.camposGeneralesDE.receptor.desDepartamento =
            departamentoReceptor.descripcion;
        }
      }
      /**Obtiene los datos del distrito del receptor*/
      if (data.camposGeneralesDE.receptor.distrito) {
        const distritoReceptor = await getDistritoByCode(
          data.camposGeneralesDE.receptor.distrito,
          idDe
        );
        if (distritoReceptor) {
          data.camposGeneralesDE.receptor.distrito = distritoReceptor.codigo;
          data.camposGeneralesDE.receptor.desDistrito =
            distritoReceptor.descripcion;
        }
      }
      /**Obtiene los datos de la ciudad del receptor*/
      if (data.camposGeneralesDE.receptor.ciudad) {
        const ciudadReceptor = await getCiudadByCode(
          data.camposGeneralesDE.receptor.ciudad,
          idDe
        );
        if (ciudadReceptor) {
          data.camposGeneralesDE.receptor.ciudad = ciudadReceptor.codigo;
          data.camposGeneralesDE.receptor.desCiudad =
            ciudadReceptor.descripcion;
        }
      }
      if (data.documentoElectronico.facturaElectronica !== undefined) {
        /**Obtiene los datos del tipo de indicador de presencia*/
        const tipoIndicadorPresencia = await getTipoIndicadorPresenciaByCode(
          data.documentoElectronico.facturaElectronica.indicadorPresencia,
          idDe
        );
        if (tipoIndicadorPresencia) {
          data.documentoElectronico.facturaElectronica.desIndicadorPresencia =
            tipoIndicadorPresencia.descripcion;
        }
      }
      if (
        data.documentoElectronico.notaCreditoDebitoElectronica !== undefined
      ) {
        /**Obtiene los datos del motivo de emisión de la nota de crédito*/
        const motivoEmision = await getMotivoEmisionNotaCreditoByCode(
          data.documentoElectronico.notaCreditoDebitoElectronica.motivoEmision,
          idDe
        );
        if (motivoEmision) {
          data.documentoElectronico.notaCreditoDebitoElectronica.desMotivoEmision =
            motivoEmision.descripcion;
        }
      }
      /**Obtiene los datos de la condición de venta*/
      if (data.documentoElectronico.condicionOperacion !== undefined) {
        const condicion = await getCondicionOperacionByCode(
          data.documentoElectronico.condicionOperacion.condicion,
          idDe
        );
        if (condicion) {
          data.documentoElectronico.condicionOperacion.desCondicion =
            condicion.descripcion;
        }
        /**Obtiene los datos de la condición de crédito*/
        const condicionCredito = await getCondicionCreditoByCode(
          data.documentoElectronico.condicionOperacion.pagoCredito.condicion,
          idDe
        );
        if (condicionCredito) {
          data.documentoElectronico.condicionOperacion.pagoCredito.desCondicion =
            condicionCredito.descripcion;
        }

        /**Obtiene los datos de la moneda de la cuota*/
        if (data.documentoElectronico.condicionOperacion.pagoCredito.cuotas) {
          data.documentoElectronico.condicionOperacion.pagoCredito.cuotas.forEach(
            async (c) => {
              let monedaCu = await getMonedaByCode(c.moneda, idDe);
              if (monedaCu) {
                c.moneda = monedaCu.codigo;
                c.desMoneda = monedaCu.descripcion;
              }
            }
          );
        }
      }
      /**Obtiene los datos de la unidad de medida */
      for (const item of data.documentoElectronico.items) {
        if (item.unidadMedida !== undefined) {
          const unidadMedida = await getUnidadMedidaByCode(
            item.unidadMedida,
            idDe
          );
          if (unidadMedida) {
            item.unidadMedida = unidadMedida.codigo;
            item.desUnidadMedida = unidadMedida.representacion;
          }
        }
      }
      /**Obtiene los datos de la afectación tributaria */
      for (const item of data.documentoElectronico.items) {
        const afectacionTributariaIva =
          await getFormaAfectacionTributariaIvaByCode(
            item.iva.afectacionTributariaIva,
            idDe
          );
        if (afectacionTributariaIva) {
          item.iva.desAfectacionTributariaIva =
            afectacionTributariaIva.descripcion;
        }
      }
      /**Obtiene tipo de documento asociado a la nota de crédito */
      if (data.DeAsociado !== undefined) {
        for (const item of data.DeAsociado) {
          const tipoDocumentoAsociado = await getTipoDocumentoAsociadoByCode(
            item.tipo,
            idDe
          );
          if (tipoDocumentoAsociado) {
            item.desTipo = tipoDocumentoAsociado.descripcion;
          }
        }
        /**Obtiene tipo de documento impreso del documento asociado */
        for (const item of data.DeAsociado) {
          if (item.tipoDocumentoImpreso !== undefined) {
            const tipoDocumentoImpreso = await getTipoDocumentoImpresoByCode(
              item.tipoDocumentoImpreso,
              idDe
            );
            if (tipoDocumentoImpreso) {
              item.tipoDocumentoImpreso = tipoDocumentoImpreso.codigo;
              item.desTipoDocumentoImpreso = tipoDocumentoImpreso.descripcion;
            }
          }
        }
      }
      /**Valida los datos */
      await validateData(idDe, data);
      /**Genera xml */
      await generateXml(idDe, data, {
        version: 150,
        cdc,
        fecha,
        codigoSeguridad,
      });
      /**Inserta firma digital al xml */
      await signXml(
        idDe,
        `${cdc}.xml`,
        config.cert,
        config.key,
        config.passphrase,
        data.timbrado.tipoDE
      );
      /**Genera url del QR */
      const urlQr = await generateUrlForQr(
        idDe,
        `${cdc}.xml`,
        data.timbrado.tipoDE
      );
      /**Inserta url del QR al xml firmado */
      xml = await addUrlQrToXml(
        idDe,
        `${cdc}.xml`,
        data.timbrado.tipoDE,
        urlQr
      );
      /**Genera código QR */
      const qr = await generateQr(idDe, urlQr);
      /**Genera Kude */
      await generateKude(idDe, data, qr, cdc);
      /**Registra log */
      logMessage = `Documento electrónico generado exitosamente.`;
      console.log(
        `[${moment(new Date()).format(
          "DD/MM/YYYY hh:mm:ss.SSSZ"
        )}]: ${logMessage}`
      );
      payload = {
        idDe: idDe,
        message: logMessage,
        tipoLog: "info",
      };
      await insertLog(payload);
      /**---------------------- */
      /**Envia Kude por email */
      let pathKude = "";
      let pathXmlSigned = "";
      /**Factura electrónica */
      if (data.timbrado.tipoDE === 1) {
        pathKude = path.join(config.paths.kude.invoices, `${cdc}.pdf`);
        pathXmlSigned = path.join(
          config.paths.xmlSigned.invoices,
          `${cdc}.xml`
        );
        await sendEmail(
          idDe,
          config.emailFrom,
          data.camposGeneralesDE.receptor.email,
          data.camposGeneralesDE.receptor.emailCc,
          `Factura Shopping Centers Paraguay S.A. ${data.timbrado.establecimiento}-${data.timbrado.puntoExpedicion}-${data.timbrado.numeroDocumento}`,
          `<p>Estimado/a <strong>${data.camposGeneralesDE.receptor.nombreFantasia}</strong></p>
          <p>En el presente mail puede disponer de sus documentos electrónicos por los servicios con Shopping Centers Paraguay S.A.</p>
          <br>
          <p>Si desea consultar sobre los conceptos detallados en alguno de sus documentos, puede responder a este email.</p>
          <p>Saludos cordiales</p>
          <p>SHOPPING CENTERS PARAGUAY S.A.</p>`,
          [pathKude, pathXmlSigned]
        );
      }
      /**Nota de crédito electrónica */
      if (data.timbrado.tipoDE === 5) {
        pathKude = path.join(config.paths.kude.creditNotes, `${cdc}.pdf`);
        pathXmlSigned = path.join(
          config.paths.xmlSigned.creditNotes,
          `${cdc}.xml`
        );
        await sendEmail(
          idDe,
          config.emailFrom,
          data.camposGeneralesDE.receptor.email,
          data.camposGeneralesDE.receptor.emailCc,
          `Nota de Crédito Shopping Centers Paraguay S.A. ${data.timbrado.establecimiento}-${data.timbrado.puntoExpedicion}-${data.timbrado.numeroDocumento}`,
          `<p>Estimado/a <strong>${data.camposGeneralesDE.receptor.nombreFantasia}</strong></p>
          <p>En el presente mail puede disponer de sus documentos electrónicos por los servicios con Shopping Centers Paraguay S.A.</p>
          <br>
          <p>Si desea consultar sobre los conceptos detallados en alguno de sus documentos, puede responder a este email.</p>
          <p>Saludos cordiales</p>
          <p>SHOPPING CENTERS PARAGUAY S.A.</p>`,
          [pathKude, pathXmlSigned]
        );
      }
      await updateDe(
        idDe,
        tipoDe.tipo_de,
        1,
        cdc,
        formatXml(xml),
        codigoSeguridad
      );
      resolve(cdc);
    } catch (err) {
      //console.log(err)
      await updateDe(idDe, tipoDe.tipo_de, 2, null, null, null);
      /**Registra log */
      if (err.hasOwnProperty("details")) {
        err.details.forEach(async (e) => {
          payload = {
            idDe: idDe,
            message: e,
            tipoLog: "error",
          };
          await insertLog(payload);
        });
      } else {
        payload = {
          idDe: idDe,
          message: err,
          tipoLog: "error",
        };
        await insertLog(payload);
      }
      /**---------------------- */
      reject(err);
    }
  });
};

export const validateData = (idDe, data) => {
  return new Promise((resolve, reject) => {
    /**Registra log */
    const logMessage = `Validando datos.`;
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
    insertLog(payload);
    /**---------------------- */
    let errors = [];
    clean(data, root, errors);
    if (errors.length > 0) {
      reject({ origin: "validateData", details: errors });
    } else {
      resolve();
    }
  });
};
const validate = (data, errors, template, key, index = undefined) => {
  //Valida la ocurrencia mínima
  if (
    (template.minOccurrence === 1 &&
      (eval(template.location) === undefined ||
        eval(template.location) === null ||
        eval(template.location) === "")) ||
    (eval(template.required) &&
      (eval(template.location) === undefined ||
        eval(template.location) === null ||
        eval(template.location) === ""))
  ) {
    //Si es un array
    if (index !== undefined) {
      errors.push(
        `${template.location.replace(
          "index",
          "Posición " + index.toString()
        )}: El atributo ${key} es obligatorio`
      );
    }
    //Si no es un array
    else {
      errors.push(`${template.location}: El atributo ${key} es obligatorio`);
    }
  }
  //Si la ocurrencia mínima es verdadera (Existe el atributo)
  else {
    //Obtiene el valor del atributo
    const value = eval(template.location);
    //Si el valor es definido
    if (value !== undefined && value !== "") {
      //Valida el tipo de dato
      if (typeof value !== template.type && value !== null && value !== "") {
        //Si es un array
        if (index !== undefined) {
          errors.push(
            `${template.location.replace(
              "index",
              "Posición " + index.toString()
            )}: El tipo de dato del atributo ${key} es incorrecto. Este debe ser ${
              template.type
            }`
          );
        }
        //Si no es un array
        else {
          errors.push(
            `${template.location}: El tipo de dato del atributo ${key} es incorrecto. Este debe ser ${template.type}`
          );
        }
      }
      //Valida patrón (Formato: Fecha, número, email)
      if (template.hasOwnProperty("pattern")) {
        let pattern = new RegExp(template.pattern);
        let correct = pattern.test(value);
        if (!correct) {
          //Si es un array
          if (index !== undefined) {
            errors.push(
              `${template.location.replace(
                "index",
                "Posición " + index.toString()
              )}: El formato del atributo ${key} es incorrecto. El formato admitido es ${
                template.format
              }`
            );
          }
          //Si no es un array
          else {
            errors.push(
              `${template.location}: El formato del atributo ${key} es incorrecto. El formato admitido es ${template.format}`
            );
          }
        }
      }
      //Valida longitud
      //Verifica si el atributo de la plantilla es un array
      if (Array.isArray(template.minSize) && Array.isArray(template.maxSize)) {
        let isValid = false;
        for (let i = 0; i < template.minSize.length; i++) {
          if (
            value.toString().length < template.minSize[i] ||
            value.toString().length > template.maxSize[i]
          ) {
            isValid = false;
          } else {
            isValid = true;
            break;
          }
        }
        if (!isValid) {
          //Si es un array
          if (index !== undefined) {
            errors.push(
              `${template.location.replace(
                "index",
                "Posición " + index.toString()
              )}: La longitud del atributo ${key} es ${
                eval(template.location).toString().length
              }. La longitud admitida es min: ${template.minSize}, máx: ${
                template.maxSize
              }`
            );
          }
          //Si no es un array
          else {
            errors.push(
              `${template.location}: La longitud del atributo ${key} es ${
                eval(template.location).toString().length
              }. La longitud admitida es min: ${template.minSize}, máx: ${
                template.maxSize
              }`
            );
          }
        }
      } else {
        if (
          value.toString().length < template.minSize ||
          value.toString().length > template.maxSize
        ) {
          //Si es un array
          if (index !== undefined) {
            errors.push(
              `${template.location.replace(
                "index",
                "Posición " + index.toString()
              )}: La longitud del atributo ${key} es ${
                eval(template.location).toString().length
              }. La longitud admitida es min: ${template.minSize}, máx: ${
                template.maxSize
              }`
            );
          }
          //Si no es un array
          else {
            errors.push(
              `${template.location}: La longitud del atributo ${key} es ${
                eval(template.location).toString().length
              }. La longitud admitida es min: ${template.minSize}, máx: ${
                template.maxSize
              }`
            );
          }
        }
      }
      //Valida posición decimal
      if (
        !template.hasOwnProperty("decMinSize") &&
        !template.hasOwnProperty("decMaxSize") &&
        typeof value === "number" &&
        value.toString().includes(".")
      ) {
        //Si es un array
        if (index !== undefined) {
          errors.push(
            `${template.location.replace(
              "index",
              "Posición " + index.toString()
            )}: El atributo ${key} debe ser un número entero`
          );
        }
        //Si no es un array
        else {
          errors.push(
            `${template.location}: El atributo ${key} debe ser un número entero`
          );
        }
      }
      if (
        template.hasOwnProperty("decMinSize") &&
        template.hasOwnProperty("decMaxSize") &&
        typeof value === "number" &&
        value.toString().includes(".")
      ) {
        if (!validateDecimal(value, template.decMinSize, template.decMaxSize)) {
          //Si es un array
          if (index !== undefined) {
            errors.push(
              `${template.location.replace(
                "index",
                "Posición " + index.toString()
              )}: La longitud del dígito decimal del atributo ${key} es ${
                eval(template.location).toString().split(".")[1].length
              }. La longitud admitida es min: ${template.decMinSize}, máx: ${
                template.decMaxSize
              }`
            );
          }
          //Si no es un array
          else {
            errors.push(
              `${
                template.location
              }: La longitud del dígito decimal del atributo ${key} es ${
                eval(template.location).toString().split(".")[1].length
              }. La longitud admitida es min: ${template.decMinSize}, máx: ${
                template.decMaxSize
              }`
            );
          }
        }
      }
      //Valida si el valor corresponde de acuerdo a los datos proveídos por la SET
      if (template.hasOwnProperty("value") && template.value) {
        if (template.attribute === "codigo") {
          let result = template.value.find((v) => v.codigo === value);
          if (result === undefined) {
            let values = "";
            template.value.forEach((v) => {
              values = values + `[${v.codigo}: ${v.descripcion}]`;
            });
            //Si es un array
            if (index !== undefined) {
              errors.push(
                `${template.location.replace(
                  "index",
                  "Posición " + index.toString()
                )}: El valor del atributo ${key} es incorrecto. Estos son los valores posibles ${values}`
              );
            }
            //Si no es un array
            else {
              errors.push(
                `${template.location}: El valor del atributo ${key} es incorrecto. Estos son los valores posibles ${values}`
              );
            }
          }
        }
        if (template.attribute === "descripcion") {
          let result = template.value.find((v) => v.descripcion === value);
          if (result === undefined) {
            let values = "";
            template.value.forEach((v) => {
              values = values + `[${v.descripcion}]`;
            });
            //Si es un array
            if (index !== undefined) {
              errors.push(
                `${template.location.replace(
                  "index",
                  "Posición " + index.toString()
                )}: El valor del atributo ${key} es incorrecto. Estos son los valores posibles ${values}`
              );
            }
            //Si no es un array
            else {
              errors.push(
                `${template.location}: El valor del atributo ${key} es incorrecto. Estos son los valores posibles ${values}`
              );
            }
          }
        }
      }
      //Valida el valor de acuerdo a la condición establecida por la SET
      if (template.hasOwnProperty("valueIsValid")) {
        if (!eval(template.valueIsValid)) {
          //Si es un array
          if (index !== undefined) {
            errors.push(
              `${template.location.replace(
                "index",
                "Posición " + index.toString()
              )}: El valor del atributo ${key} es incorrecto. Observación: ${template.observation.replace(
                /index/g,
                "Posición " + index.toString()
              )}`
            );
          }
          //Si no es un array
          else {
            errors.push(
              `${template.location}: El valor del atributo ${key} es incorrecto. Observación: ${template.observation}`
            );
          }
        }
      }
    }
  }

  return errors;
};
const clean = (data, obj, errors, index = undefined) => {
  //Itera los atributos del objeto que recibe como parametro
  for (let k in obj) {
    //Si el atributo no es un objeto o un array
    if (obj[k].type !== "object" && obj[k].type !== "array") {
      //Valida los atributos
      validate(data, errors, obj[k], k, index);
    }
    //Si el atributo es un objeto o un array
    else {
      //Valida la mínima ocurrencia del objeto o el array
      if (
        (obj[k].minOccurrence === 1 && eval(obj[k].location) === undefined) ||
        (eval(obj[k].required) && eval(obj[k].location) === undefined)
      ) {
        //Si es un array
        if (index !== undefined) {
          errors.push(
            `${obj[k].location.replace(
              "index",
              "Posición " + index.toString()
            )}: El atributo ${k} es obligatorio`
          );
        } else {
          errors.push(`${obj[k].location}: El atributo ${k} es obligatorio`);
        }
      }
      //Si es un array y contiene datos
      if (obj[k].type === "array" && eval(obj[k].location) !== undefined) {
        //Obtiene la longitud del array del parámetro data
        let length = eval(obj[k].location).length;
        //Valida si el array no contiene elementos
        if (length === 0) {
          errors.push(
            `${obj[k].location}: Debe especificar por lo menos 1 (un) valor`
          );
        }
        //Obtiene los atributos que debe contener los elementos del array
        let props = obj[k].props;
        //Itera el array del parámetro data
        for (let i = 0; i < length; i++) {
          //Invoca internamente a la misma función (Recursión) para validar los atributos
          clean(data, props, errors, i);
        }
      }
      //Si es un objeto
      else {
        //Si el objeto existe en el parámetro data
        if (eval(obj[k].location) !== undefined) {
          //Invoca internamente a la misma función (Recursión) para validar los atributos
          clean(data, obj[k].props, errors, index);
        }
      }
    }
  }

  return errors;
};
export default {
  generateXml,
  signXml,
  generateUrlForQr,
  addUrlQrToXml,
  generateKude,
  sendEmail,
  generateElectronicDocument,
  validateData,
};
