import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from 'drizzle-orm';

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  parentEmail: text("parent_email").notNull(),
  childName: text("child_name").notNull(),
  ageTurning: integer("age_turning").notNull(),
  eventDate: timestamp("event_date").notNull(),
  description: text("description").notNull(),
  interests: text("interests").array().notNull(),
  adminToken: text("admin_token").notNull(),
  guestToken: text("guest_token").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const rsvps = pgTable("rsvps", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").references(() => events.id).notNull(),
  parentEmail: text("parent_email").notNull(),
  childName: text("child_name").notNull(),
  childBirthMonth: text("child_birth_month").notNull(),
  receiveUpdates: boolean("receive_updates").default(true).notNull(),
  attending: boolean("attending").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const eventsRelations = relations(events, ({ many }) => ({
  rsvps: many(rsvps),
}));

export const rsvpsRelations = relations(rsvps, ({ one }) => ({
  event: one(events, {
    fields: [rsvps.eventId],
    references: [events.id],
  }),
}));

export const insertEventSchema = createInsertSchema(events);
export const selectEventSchema = createSelectSchema(events);
export const insertRSVPSchema = createInsertSchema(rsvps);
export const selectRSVPSchema = createSelectSchema(rsvps);

export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type RSVP = typeof rsvps.$inferSelect;
export type NewRSVP = typeof rsvps.$inferInsert;