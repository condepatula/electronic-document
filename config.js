import "dotenv/config";
import path from "path";

const env = process.env.NODE_ENV;

const development = {
  url_consulta_qr: "https://ekuatia.set.gov.py/consultas-test/qr?",
  csc: process.env.CSC,
  cert: process.env.CERT,
  key: process.env.KEY,
  passphrase: process.env.PASSPHRASE,
  smtp: process.env.SMTP,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpPort: process.env.SMTP_PORT,
  emailFrom: process.env.EMAIL_FROM,
  databaseUser: process.env.DATABASE_USER,
  databaseHost: process.env.DATABASE_HOST,
  databaseName: process.env.DATABASE_NAME,
  databasePassword: process.env.DATABASE_PASSWORD,
  databasePort: process.env.DATABASE_PORT,
  idCsc: "0001",
  paths: {
    templates: {
      invoice: path.join(process.cwd(), "templates", "invoice.hbs"),
      creditNote: path.join(process.cwd(), "templates", "credit-note.hbs"),
    },
    kude: {
      invoices: path.join(process.cwd(), "kude/invoices"),
      creditNotes: path.join(process.cwd(), "kude/creditnotes"),
    },
    xml: {
      invoices: path.join(process.cwd(), "de_xml/invoices"),
      creditNotes: path.join(process.cwd(), "de_xml/creditnotes"),
    },
    xmlSigned: {
      invoices: path.join(process.cwd(), "de_xml_signed/invoices"),
      creditNotes: path.join(process.cwd(), "de_xml_signed/creditnotes"),
    },
  },
};

const production = {
  url_consulta_qr: "https://ekuatia.set.gov.py/consultas/qr?",
  csc: process.env.CSC,
  cert: process.env.CERT,
  key: process.env.KEY,
  passphrase: process.env.PASSPHRASE,
  smtp: process.env.SMTP,
  smtpUser: process.env.SMTP_USER,
  smtpPassword: process.env.SMTP_PASSWORD,
  smtpPort: process.env.SMTP_PORT,
  emailFrom: process.env.EMAIL_FROM,
  databaseUser: process.env.DATABASE_USER,
  databaseHost: process.env.DATABASE_HOST,
  databaseName: process.env.DATABASE_NAME,
  databasePassword: process.env.DATABASE_PASSWORD,
  databasePort: process.env.DATABASE_PORT,
  idCsc: "0001",
  paths: {
    templates: {
      invoice: path.join(process.cwd(), "templates", "invoice.hbs"),
      creditNote: path.join(process.cwd(), "templates", "credit-note.hbs"),
    },
    kude: {
      invoices: path.join(process.cwd(), "kude/invoices"),
      creditNotes: path.join(process.cwd(), "kude/creditnotes"),
    },
    xml: {
      invoices: path.join(process.cwd(), "de_xml/invoices"),
      creditNotes: path.join(process.cwd(), "de_xml/creditnotes"),
    },
    xmlSigned: {
      invoices: path.join(process.cwd(), "de_xml_signed/invoices"),
      creditNotes: path.join(process.cwd(), "de_xml_signed/creditnotes"),
    },
  },
};

export const config = {
  development,
  production,
};

export default config[env];
