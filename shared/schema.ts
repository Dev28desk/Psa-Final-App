import { pgTable, text, serial, integer, boolean, timestamp, decimal, jsonb, varchar, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for authentication and roles
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone").notNull().unique(),
  role: text("role").notNull().default("student"), // student, coach, admin, staff
  permissions: jsonb("permissions").default({}),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Sports table
export const sports = pgTable("sports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  feeStructure: jsonb("fee_structure").notNull(), // { baseAmount, skillLevels: {beginner: 1000, intermediate: 1500, advanced: 2000} }
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Batches table
export const batches = pgTable("batches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sportId: integer("sport_id").references(() => sports.id),
  coachId: integer("coach_id").references(() => users.id),
  schedule: jsonb("schedule").notNull(), // { days: ['monday', 'wednesday'], time: '6:00 AM - 7:30 AM' }
  maxCapacity: integer("max_capacity").notNull(),
  currentCapacity: integer("current_capacity").default(0),
  skillLevel: text("skill_level").notNull(), // beginner, intermediate, advanced
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Students table
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  studentId: text("student_id").unique().notNull(), // STU001, STU002, etc.
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  dateOfBirth: date("date_of_birth"),
  address: text("address"),
  emergencyContact: jsonb("emergency_contact"), // { name, phone, relation }
  medicalNotes: text("medical_notes"),
  sportId: integer("sport_id").references(() => sports.id),
  batchId: integer("batch_id").references(() => batches.id),
  skillLevel: text("skill_level").notNull(),
  joiningDate: timestamp("joining_date").defaultNow(),
  isActive: boolean("is_active").default(true),
  profileImageUrl: text("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payments table
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentType: text("payment_type").notNull(), // monthly, registration, tournament
  paymentMethod: text("payment_method").notNull(), // cash, upi, card, online
  status: text("status").notNull().default("pending"), // pending, completed, failed
  transactionId: text("transaction_id"),
  receiptNumber: text("receipt_number"),
  paymentDate: timestamp("payment_date"),
  dueDate: timestamp("due_date"),
  monthYear: text("month_year"), // "2025-01" for monthly payments
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Attendance table
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  batchId: integer("batch_id").references(() => batches.id),
  date: date("date").notNull(),
  status: text("status").notNull(), // present, absent, late, excused
  markedBy: integer("marked_by").references(() => users.id),
  markedAt: timestamp("marked_at").defaultNow(),
  notes: text("notes"),
});

// Activities table for tracking system activities
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // student_enrolled, payment_received, attendance_marked, etc.
  description: text("description").notNull(),
  userId: integer("user_id").references(() => users.id),
  entityId: integer("entity_id"), // ID of the related entity (student, payment, etc.)
  entityType: text("entity_type"), // student, payment, attendance, etc.
  metadata: jsonb("metadata"), // Additional data about the activity
  createdAt: timestamp("created_at").defaultNow(),
});

// Communications table
export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // sms, whatsapp, email
  recipient: text("recipient").notNull(), // phone or email
  message: text("message").notNull(),
  status: text("status").notNull().default("pending"), // pending, sent, delivered, failed
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  templateId: text("template_id"),
  campaignId: text("campaign_id"),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  students: many(students),
  batchesAsCoach: many(batches),
  attendanceMarked: many(attendance),
  activities: many(activities),
}));

export const sportsRelations = relations(sports, ({ many }) => ({
  batches: many(batches),
  students: many(students),
}));

export const batchesRelations = relations(batches, ({ one, many }) => ({
  sport: one(sports, { fields: [batches.sportId], references: [sports.id] }),
  coach: one(users, { fields: [batches.coachId], references: [users.id] }),
  students: many(students),
  attendance: many(attendance),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  sport: one(sports, { fields: [students.sportId], references: [sports.id] }),
  batch: one(batches, { fields: [students.batchId], references: [batches.id] }),
  payments: many(payments),
  attendance: many(attendance),
}));

export const paymentsRelations = relations(payments, ({ one }) => ({
  student: one(students, { fields: [payments.studentId], references: [students.id] }),
}));

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(students, { fields: [attendance.studentId], references: [students.id] }),
  batch: one(batches, { fields: [attendance.batchId], references: [batches.id] }),
  markedBy: one(users, { fields: [attendance.markedBy], references: [users.id] }),
}));

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, { fields: [activities.userId], references: [users.id] }),
}));

// Schema types
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertSportSchema = createInsertSchema(sports);
export const selectSportSchema = createSelectSchema(sports);
export const insertBatchSchema = createInsertSchema(batches);
export const selectBatchSchema = createSelectSchema(batches);
export const insertStudentSchema = createInsertSchema(students);
export const selectStudentSchema = createSelectSchema(students);
export const insertPaymentSchema = createInsertSchema(payments);
export const selectPaymentSchema = createSelectSchema(payments);
export const insertAttendanceSchema = createInsertSchema(attendance);
export const selectAttendanceSchema = createSelectSchema(attendance);
export const insertActivitySchema = createInsertSchema(activities);
export const selectActivitySchema = createSelectSchema(activities);
export const insertCommunicationSchema = createInsertSchema(communications);
export const selectCommunicationSchema = createSelectSchema(communications);

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Sport = typeof sports.$inferSelect;
export type InsertSport = typeof sports.$inferInsert;
export type Batch = typeof batches.$inferSelect;
export type InsertBatch = typeof batches.$inferInsert;
export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;
export type Payment = typeof payments.$inferSelect;
export type InsertPayment = typeof payments.$inferInsert;
export type Attendance = typeof attendance.$inferSelect;
export type InsertAttendance = typeof attendance.$inferInsert;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = typeof activities.$inferInsert;
export type Communication = typeof communications.$inferSelect;
export type InsertCommunication = typeof communications.$inferInsert;
