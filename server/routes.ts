import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { events, rsvps } from "@db/schema";
import { nanoid } from "nanoid";
import { eq } from "drizzle-orm";
import { generateICS } from "../client/src/lib/calendar";

export function registerRoutes(app: Express): Server {
  // Create new event
  app.post("/api/events", async (req, res) => {
    try {
      const adminToken = nanoid();
      const guestToken = nanoid();
      
      const event = await db.insert(events).values({
        ...req.body,
        adminToken,
        guestToken,
      }).returning();

      // TODO: Send email with admin and guest links

      res.json({ adminToken, guestToken });
    } catch (error) {
      res.status(500).json({ error: "Failed to create event" });
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
        attending: true,
      });

      // Generate calendar invite
      const calendar = generateICS({
        start: new Date(event.eventDate),
        end: new Date(new Date(event.eventDate).getTime() + 2 * 60 * 60 * 1000), // 2 hours duration
        summary: `${event.childName}'s ${event.ageTurning}th Birthday Party`,
        description: event.description,
      });

      // TODO: Send confirmation email with calendar attachment

      res.json({ success: true });
    } catch (error) {
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
