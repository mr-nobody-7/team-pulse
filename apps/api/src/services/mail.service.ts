import * as Brevo from "@getbrevo/brevo";

const apiInstance = new Brevo.TransactionalEmailsApi();
apiInstance.setApiKey(
  Brevo.TransactionalEmailsApiApiKeys.apiKey,
  process.env.BREVO_API_KEY!,
);

export async function sendMail(
  to: string,
  subject: string,
  htmlContent: string,
): Promise<void> {
  const senderName = process.env.BREVO_SENDER_NAME;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;

  if (!senderName || !senderEmail) {
    throw new Error(
      "BREVO_SENDER_NAME and BREVO_SENDER_EMAIL must be configured",
    );
  }

  const email = new Brevo.SendSmtpEmail();
  email.sender = {
    name: senderName,
    email: senderEmail,
  };
  email.to = [{ email: to }];
  email.subject = subject;
  email.htmlContent = htmlContent;

  await apiInstance.sendTransacEmail(email);
}
