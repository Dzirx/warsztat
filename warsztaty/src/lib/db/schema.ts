import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";
import { 
  pgTable, 
  serial, 
  varchar, 
  timestamp,
  integer,
  text,
} from "drizzle-orm/pg-core";
import { relations } from 'drizzle-orm';
import * as schema from './schema';

// Tabela warsztatów z website zamiast alt_phone
export const workshops = pgTable('workshops', {
  id: serial('id').primaryKey(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  name: varchar('name', { length: 200 }).notNull(),
  address: text('address'),
  phone: varchar('phone', { length: 15 }),
  website: varchar('website', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Nowa tabela samochodów
export const vehicles = pgTable('vehicles', {
  id: serial('id').primaryKey(),
  vin: varchar('vin', { length: 17 }).notNull().unique(),
  manufacturer: varchar('manufacturer', { length: 100 }),
  model: varchar('model', { length: 100 }),
  year: varchar('year', { length: 4 }),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Nowa tabela części/napraw
export const repairs = pgTable('repairs', {
  id: serial('id').primaryKey(),
  vehicleVin: varchar('vehicle_vin', { length: 17 })
    .notNull()
    .references(() => vehicles.vin),
  workshopId: integer('workshop_id')
    .references(() => workshops.id),
  partName: varchar('part_name', { length: 200 }).notNull(),
  description: text('description'),
  repairDate: timestamp('repair_date').defaultNow(),
});

// Relacje
export const vehicleRelations = relations(vehicles, ({ many }) => ({
  repairs: many(repairs),
}));

export const workshopRelations = relations(workshops, ({ many }) => ({
  repairs: many(repairs),
}));

export const repairRelations = relations(repairs, ({ one }) => ({
  vehicle: one(vehicles, {
    fields: [repairs.vehicleVin],
    references: [vehicles.vin],
  }),
  workshop: one(workshops, {
    fields: [repairs.workshopId],
    references: [workshops.id],
  }),
}));

// Eksport db z typami
export const db = drizzle(sql);

// Eksport typów
export type Workshop = typeof workshops.$inferSelect;
export type NewWorkshop = typeof workshops.$inferInsert;
export type Vehicle = typeof vehicles.$inferSelect;
export type NewVehicle = typeof vehicles.$inferInsert;
export type Repair = typeof repairs.$inferSelect;
export type NewRepair = typeof repairs.$inferInsert;