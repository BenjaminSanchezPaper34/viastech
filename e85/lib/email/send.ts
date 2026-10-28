/**
 * Envoi via l'API REST de Resend (sans SDK). Sans RESEND_API_KEY, l'e-mail est affiché
 * dans la console : pratique en local, et rien ne part par erreur.
 */
import "server-only";

export type Mail = { to: string; subject: string; html: string; text: string; replyTo?: string };

export async function sendMail(mail: Mail) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM ?? "Garage Viastech <rdv@viastech.fr>";

  if (!key) {
    console.info(`\n[e-mail simulé] À : ${mail.to}\nObjet : ${mail.subject}\n\n${mail.text}\n`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [mail.to],
      subject: mail.subject,
      html: mail.html,
      text: mail.text,
      ...(mail.replyTo ? { reply_to: mail.replyTo } : {}),
    }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status} : ${await res.text()}`);
}
