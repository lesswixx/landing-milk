import express from "express";
import path from "path";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/send-mail", async (req, res) => {
  try {
    const { name, phone, message, consent } = req.body || {};

    if (!name || !phone) {
      return res.status(400).json({ ok: false, error: "Введите имя и телефон." });
    }
    if (consent !== true) {
      return res.status(400).json({ ok: false, error: "Необходимо согласие на обработку данных." });
    }

    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT || 465);
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const mailTo = process.env.MAIL_TO || smtpUser;
    const mailFrom = process.env.MAIL_FROM || `noreply@${(smtpHost || "").replace(/^smtp\./, "") || "localhost"}`;

    if (!smtpHost || !smtpUser || !smtpPass) {
      return res.status(500).json({ ok: false, error: "SMTP не настроен на сервере." });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const html = `
      <div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#333;line-height:1.6">
        <h2 style="margin:0 0 10px">Новая заявка с сайта «Племхоз имени Тельмана»</h2>
        <p><strong>Имя:</strong> ${escapeHtml(name)}</p>
        <p><strong>Телефон:</strong> ${escapeHtml(phone)}</p>
        <p><strong>Сообщение:</strong></p>
        <div style="white-space:pre-wrap;background:#f7f9fc;padding:12px;border-radius:8px;border:1px solid #e7edf6">${escapeHtml(message || "")}</div>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:16px 0" />
        <p style="font-size:12px;color:#777">Отправлено автоматически • ${new Date().toLocaleString("ru-RU")}</p>
      </div>
    `;

    await transporter.sendMail({
      from: mailFrom,
      to: mailTo,
      subject: "Заявка с сайта — Племхоз имени Тельмана",
      html
    });

    res.json({ ok: true });
  } catch (error) {
    console.error("Mail error:", error);
    res.status(500).json({ ok: false, error: "Не удалось отправить письмо. Попробуйте позже." });
  }
});

// Fallback to SPA index
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Milk landing server started on http://localhost:${PORT}`);
});

function escapeHtml(input) {
  return String(input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}




