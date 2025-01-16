interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const response = await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return response.ok;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}
