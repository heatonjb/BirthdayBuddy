import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const mailerSend = new MailerSend({
  apiKey: process.env.MAILERSEND_API_KEY || "",
});

const FROM_EMAIL = process.env.MAILERSEND_FROM_EMAIL || "";
const FROM_NAME = process.env.MAILERSEND_FROM_NAME || "";

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: string;
    type: string;
  }[];
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    const emailParams: EmailParams = {
      from: new Sender(FROM_EMAIL, FROM_NAME),
      to: [new Recipient(params.to)],
      subject: params.subject,
      html: params.html,
      attachments: params.attachments,
    };

    await mailerSend.email.send(emailParams);
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export function generateEventCreationEmail(params: {
  adminUrl: string;
  rsvpUrl: string;
  childName: string;
  ageTurning: number;
  eventDate: Date;
  description: string;
}): string {
  const { adminUrl, rsvpUrl, childName, ageTurning, eventDate, description } = params;
  return `
    <h1>Birthday Event Created!</h1>
    <p>Your birthday event for ${childName}'s ${ageTurning}th birthday has been created successfully.</p>
    
    <h2>Event Details</h2>
    <p><strong>Date:</strong> ${eventDate.toLocaleString()}</p>
    <p><strong>Description:</strong> ${description}</p>
    
    <h2>Important Links</h2>
    <p>
      <strong>Admin Page:</strong><br>
      <a href="${adminUrl}">${adminUrl}</a>
      <br><small>Use this link to manage the event, view RSVPs, and make updates.</small>
    </p>
    <p>
      <strong>RSVP Page:</strong><br>
      <a href="${rsvpUrl}">${rsvpUrl}</a>
      <br><small>Share this link with your guests to collect RSVPs.</small>
    </p>
    
    <p>We'll send you notifications as guests RSVP to your event.</p>
  `;
}

export function generateRSVPConfirmationEmail(params: {
  eventName: string;
  eventDate: Date;
  description: string;
  calendarAttachment?: string;
}): string {
  const { eventName, eventDate, description } = params;
  return `
    <h1>RSVP Confirmed!</h1>
    <p>Your RSVP for ${eventName} has been confirmed.</p>
    
    <h2>Event Details</h2>
    <p><strong>Date:</strong> ${eventDate.toLocaleString()}</p>
    <p><strong>Description:</strong> ${description}</p>
    
    <p>We've attached a calendar invite to help you remember the event.</p>
    
    <p><small>Note: You'll receive event updates and reminders unless you opted out during RSVP.</small></p>
  `;
}
