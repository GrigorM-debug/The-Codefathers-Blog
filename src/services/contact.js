import { SMTPClient, Message } from "emailjs";
import nodemailer from "nodemailer";

export default async function sendEmail(contactFormData) {
  const user = process.env.EMAIL;
  const password = process.env.PASSWORD;
  const host = process.env.HOST;

  const client = new SMTPClient({
    user,
    password,
    host,
    ssl: true,
  });

  const message = new Message({
    from: `${contactFormData.user_email} <${user}>`,
    to: user,
    subject: contactFormData.subject,
    replyTo: contactFormData.user_email,
    text: `From: ${contactFormData.user_name} <${contactFormData.user_email}> \n\n${contactFormData.message}`,
  });

  await client.sendAsync(message);

  await client.sendAsync({
    text: `Hello ${contactFormData.user_name} Thank you for contacting us. We will get back to you as soon as possible.`,
    from: user,
    to: contactFormData.user_email,
    subject: "Thank you for contacting us",
  });
}
