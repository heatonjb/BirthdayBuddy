import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { events, rsvps } from "@db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { generateICS } from "../client/src/lib/calendar";
import { sendEmail, generateEventCreationEmail, generateRSVPConfirmationEmail } from "./lib/email";

export function registerRoutes(app: Express): Server {
  // Create new event
  app.post("/api/events", async (req, res) => {
    try {
      const adminToken = nanoid();
      const guestToken = nanoid();

      const { parentEmail, childName, ageTurning, eventDate, description, interests } = req.body;

      // Validate required fields
      if (!parentEmail || !childName || !ageTurning || !eventDate || !description || !interests) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const event = await db.insert(events).values({
        parentEmail,
        childName,
        ageTurning: parseInt(ageTurning, 10),
        eventDate: new Date(eventDate),
        description,
        interests,
        adminToken,
        guestToken,
      }).returning();

      // Send confirmation email with admin and guest links
      const adminUrl = `${req.protocol}://${req.get('host')}/admin/${adminToken}`;
      const rsvpUrl = `${req.protocol}://${req.get('host')}/event/${guestToken}`;

      await sendEmail({
        to: parentEmail,
        subject: `Birthday Event Created for ${childName}`,
        html: generateEventCreationEmail({
          adminUrl,
          rsvpUrl,
          childName,
          ageTurning: parseInt(ageTurning, 10),
          eventDate: new Date(eventDate),
          description,
        }),
      });

      res.json({ adminToken });
    } catch (error) {
      console.error("Event creation error:", error);
      res.status(500).json({ error: "Failed to create event" });
    }
  });

  // Update event
  app.put("/api/events/:token/admin", async (req, res) => {
    try {
      const event = await db.query.events.findFirst({
        where: eq(events.adminToken, req.params.token),
      });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      const { parentEmail, childName, ageTurning, eventDate, description, interests } = req.body;

      // Validate required fields
      if (!parentEmail || !childName || !ageTurning || !eventDate || !description || !interests) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const updatedEvent = await db
        .update(events)
        .set({
          parentEmail,
          childName,
          ageTurning: parseInt(ageTurning, 10),
          eventDate: new Date(eventDate),
          description,
          interests,
        })
        .where(eq(events.id, event.id))
        .returning();

      res.json(updatedEvent[0]);
    } catch (error) {
      console.error("Event update error:", error);
      res.status(500).json({ error: "Failed to update event" });
    }
  });

  // Get event by guest token
  app.get("/api/events/:token", async (req, res) => {
    try {
      const event = await db.query.events.findFirst({
        where: eq(events.guestToken, req.params.token),
      });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  // Get event by admin token
  app.get("/api/events/:token/admin", async (req, res) => {
    try {
      const event = await db.query.events.findFirst({
        where: eq(events.adminToken, req.params.token),
      });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch event" });
    }
  });

  // Get RSVP count
  app.get("/api/events/:token/rsvp-count", async (req, res) => {
    try {
      const event = await db.query.events.findFirst({
        where: eq(events.guestToken, req.params.token),
      });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      const count = await db.select().from(rsvps).where(eq(rsvps.eventId, event.id));
      res.json(count.length);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch RSVP count" });
    }
  });

  // Submit RSVP
  app.post("/api/events/:token/rsvp", async (req, res) => {
    try {
      const event = await db.query.events.findFirst({
        where: eq(events.guestToken, req.params.token),
      });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      await db.insert(rsvps).values({
        eventId: event.id,
        parentEmail: req.body.parentEmail,
        childName: req.body.childName,
        childBirthMonth: req.body.childBirthMonth,
        receiveUpdates: req.body.receiveUpdates,
        attending: true,
      });

      // Generate calendar invite
      const calendar = generateICS({
        start: new Date(event.eventDate),
        end: new Date(new Date(event.eventDate).getTime() + 2 * 60 * 60 * 1000), // 2 hours duration
        summary: `${event.childName}'s ${event.ageTurning}th Birthday Party`,
        description: event.description,
      });

      // Send confirmation email with calendar attachment
      await sendEmail({
        to: req.body.parentEmail,
        subject: `RSVP Confirmed - ${event.childName}'s Birthday Party`,
        html: generateRSVPConfirmationEmail({
          eventName: `${event.childName}'s ${event.ageTurning}th Birthday Party`,
          eventDate: new Date(event.eventDate),
          description: event.description,
        }),
        attachments: [{
          filename: 'event.ics',
          content: Buffer.from(calendar).toString('base64'),
          type: 'text/calendar',
        }],
      });

      // If receiveUpdates is true and it's the event creator's email, also send admin notifications
      if (req.body.receiveUpdates && event.parentEmail === req.body.parentEmail) {
        await sendEmail({
          to: event.parentEmail,
          subject: `New RSVP for ${event.childName}'s Birthday Party`,
          html: `
            <h1>New RSVP Received!</h1>
            <p>A new guest has RSVP'd to your event.</p>
            <p><strong>Guest:</strong> ${req.body.parentEmail}</p>
            <p><strong>Child:</strong> ${req.body.childName}</p>
            <p><strong>Birth Month:</strong> ${req.body.childBirthMonth}</p>
            <p>View all RSVPs on your <a href="${req.protocol}://${req.get('host')}/admin/${event.adminToken}">admin page</a>.</p>
          `,
        });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("RSVP error:", error);
      res.status(500).json({ error: "Failed to submit RSVP" });
    }
  });

  // Get admin RSVPs
  app.get("/api/events/:token/admin/rsvps", async (req, res) => {
    try {
      const event = await db.query.events.findFirst({
        where: eq(events.adminToken, req.params.token),
      });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      const eventRsvps = await db.select().from(rsvps).where(eq(rsvps.eventId, event.id));
      res.json(eventRsvps);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch RSVPs" });
    }
  });

  // Delete event
  app.delete("/api/events/:token/admin", async (req, res) => {
    try {
      const event = await db.query.events.findFirst({
        where: eq(events.adminToken, req.params.token),
      });

      if (!event) {
        return res.status(404).json({ error: "Event not found" });
      }

      await db.delete(events).where(eq(events.id, event.id));
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete event" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}