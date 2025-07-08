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
  role: text("role").notNull().default("student"), // student, coach, admin, staff, manager
  permissions: jsonb("permissions").default({}),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  profileImageUrl: text("profile_image_url"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coaches table
export const coaches = pgTable("coaches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique(),
  phone: text("phone").notNull(),
  specialization: text("specialization").notNull(),
  experience: integer("experience").default(0),
  qualifications: text("qualifications"),
  isActive: boolean("is_active").default(true),
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
  coachId: integer("coach_id").references(() => coaches.id),
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

// Settings table for system configuration
export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(), // general, payments, notifications, appearance, security
  key: text("key").notNull().unique(),
  value: jsonb("value").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Icons table for customizable icons
export const icons = pgTable("icons", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // sports, actions, navigation, misc
  svgPath: text("svg_path").notNull(),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment gateways configuration
export const paymentGateways = pgTable("payment_gateways", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // stripe, paypal, razorpay, paytm
  displayName: text("display_name").notNull(),
  configuration: jsonb("configuration").notNull(), // API keys, webhook URLs, etc.
  isActive: boolean("is_active").default(false),
  isDefault: boolean("is_default").default(false),
  supportedMethods: jsonb("supported_methods").default([]), // card, upi, wallet, netbanking
  fees: jsonb("fees").default({}), // transaction fees structure
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// WhatsApp Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // welcome, fee_reminder, attendance_followup, birthday, event, custom
  status: text("status").notNull().default("draft"), // draft, active, paused, completed
  trigger: text("trigger").notNull(), // manual, scheduled, automated
  targetAudience: jsonb("target_audience").notNull(), // { type: 'all' | 'sport' | 'batch' | 'custom', filters: {} }
  messageTemplate: jsonb("message_template").notNull(), // { text, media, buttons, variables }
  schedule: jsonb("schedule"), // { startDate, endDate, time, frequency }
  automationRules: jsonb("automation_rules"), // { conditions, actions }
  analytics: jsonb("analytics").default({}), // { sent, delivered, read, replied, failed }
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastRunAt: timestamp("last_run_at"),
});

// Campaign Messages table (for tracking individual messages)
export const campaignMessages = pgTable("campaign_messages", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  recipient: text("recipient").notNull(), // phone number
  studentId: integer("student_id").references(() => students.id),
  messageContent: text("message_content").notNull(),
  status: text("status").notNull().default("pending"), // pending, sent, delivered, read, failed
  whatsappMessageId: text("whatsapp_message_id"),
  sentAt: timestamp("sent_at"),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  errorMessage: text("error_message"),
  metadata: jsonb("metadata"), // Additional tracking data
  createdAt: timestamp("created_at").defaultNow(),
});

// Message Templates table
export const messageTemplates = pgTable("message_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // greeting, reminder, notification, promotional
  language: text("language").notNull().default("en"),
  content: jsonb("content").notNull(), // { text, media, buttons, variables }
  variables: jsonb("variables"), // Available merge variables
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Custom Reports table
export const customReports = pgTable("custom_reports", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // students, payments, attendance, performance, financial
  queryConfig: jsonb("query_config").notNull(), // { tables, fields, filters, groupBy, orderBy, joins }
  chartConfig: jsonb("chart_config"), // { type, xAxis, yAxis, series, colors }
  isPublic: boolean("is_public").default(false),
  isScheduled: boolean("is_scheduled").default(false),
  scheduleConfig: jsonb("schedule_config"), // { frequency, time, recipients, format }
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastRunAt: timestamp("last_run_at"),
});

// Report Executions table (for tracking report runs)
export const reportExecutions = pgTable("report_executions", {
  id: serial("id").primaryKey(),
  reportId: integer("report_id").references(() => customReports.id),
  status: text("status").notNull().default("pending"), // pending, running, completed, failed
  result: jsonb("result"), // Generated report data
  metadata: jsonb("metadata"), // Execution details, file paths, etc.
  executedBy: integer("executed_by").references(() => users.id),
  executedAt: timestamp("executed_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  errorMessage: text("error_message"),
});

// Saved Queries table
export const savedQueries = pgTable("saved_queries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  queryConfig: jsonb("query_config").notNull(),
  isPublic: boolean("is_public").default(false),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  students: many(students),
  batchesAsCoach: many(batches),
  attendanceMarked: many(attendance),
  activities: many(activities),
}));

export const coachesRelations = relations(coaches, ({ many }) => ({
  batches: many(batches),
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

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  createdBy: one(users, { fields: [campaigns.createdBy], references: [users.id] }),
  messages: many(campaignMessages),
}));

export const campaignMessagesRelations = relations(campaignMessages, ({ one }) => ({
  campaign: one(campaigns, { fields: [campaignMessages.campaignId], references: [campaigns.id] }),
  student: one(students, { fields: [campaignMessages.studentId], references: [students.id] }),
}));

export const customReportsRelations = relations(customReports, ({ one, many }) => ({
  createdBy: one(users, { fields: [customReports.createdBy], references: [users.id] }),
  executions: many(reportExecutions),
}));

export const reportExecutionsRelations = relations(reportExecutions, ({ one }) => ({
  report: one(customReports, { fields: [reportExecutions.reportId], references: [customReports.id] }),
  executedBy: one(users, { fields: [reportExecutions.executedBy], references: [users.id] }),
}));

export const savedQueriesRelations = relations(savedQueries, ({ one }) => ({
  createdBy: one(users, { fields: [savedQueries.createdBy], references: [users.id] }),
}));

// Schema types
export const insertUserSchema = createInsertSchema(users);
export const selectUserSchema = createSelectSchema(users);
export const insertSportSchema = createInsertSchema(sports);
export const selectSportSchema = createSelectSchema(sports);
export const insertBatchSchema = createInsertSchema(batches);
export const selectBatchSchema = createSelectSchema(batches);
export const insertStudentSchema = createInsertSchema(students).omit({ 
  id: true, 
  studentId: true, 
  createdAt: true 
});
export const selectStudentSchema = createSelectSchema(students);
export const insertPaymentSchema = createInsertSchema(payments).omit({ 
  id: true, 
  createdAt: true 
});
export const selectPaymentSchema = createSelectSchema(payments);
export const insertAttendanceSchema = createInsertSchema(attendance).omit({ 
  id: true, 
  markedAt: true 
});
export const selectAttendanceSchema = createSelectSchema(attendance);
export const insertActivitySchema = createInsertSchema(activities).omit({ 
  id: true, 
  createdAt: true 
});
export const selectActivitySchema = createSelectSchema(activities);
export const insertCommunicationSchema = createInsertSchema(communications);
export const selectCommunicationSchema = createSelectSchema(communications);
export const insertSettingSchema = createInsertSchema(settings);
export const selectSettingSchema = createSelectSchema(settings);
export const insertIconSchema = createInsertSchema(icons);
export const selectIconSchema = createSelectSchema(icons);
export const insertPaymentGatewaySchema = createInsertSchema(paymentGateways);
export const selectPaymentGatewaySchema = createSelectSchema(paymentGateways);
export const insertCoachSchema = createInsertSchema(coaches);
export const selectCoachSchema = createSelectSchema(coaches);
export const insertCampaignSchema = createInsertSchema(campaigns).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  lastRunAt: true 
});
export const selectCampaignSchema = createSelectSchema(campaigns);
export const insertCampaignMessageSchema = createInsertSchema(campaignMessages).omit({ 
  id: true, 
  createdAt: true 
});
export const selectCampaignMessageSchema = createSelectSchema(campaignMessages);
export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectMessageTemplateSchema = createSelectSchema(messageTemplates);
export const insertCustomReportSchema = createInsertSchema(customReports).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true,
  lastRunAt: true 
});
export const selectCustomReportSchema = createSelectSchema(customReports);
export const insertReportExecutionSchema = createInsertSchema(reportExecutions).omit({ 
  id: true, 
  executedAt: true,
  completedAt: true 
});
export const selectReportExecutionSchema = createSelectSchema(reportExecutions);
export const insertSavedQuerySchema = createInsertSchema(savedQueries).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectSavedQuerySchema = createSelectSchema(savedQueries);

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Coach = typeof coaches.$inferSelect;
export type InsertCoach = typeof coaches.$inferInsert;
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
export type Setting = typeof settings.$inferSelect;
export type InsertSetting = typeof settings.$inferInsert;
export type Icon = typeof icons.$inferSelect;
export type InsertIcon = typeof icons.$inferInsert;
export type PaymentGateway = typeof paymentGateways.$inferSelect;
export type InsertPaymentGateway = typeof paymentGateways.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = typeof campaigns.$inferInsert;
export type CampaignMessage = typeof campaignMessages.$inferSelect;
export type InsertCampaignMessage = typeof campaignMessages.$inferInsert;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = typeof messageTemplates.$inferInsert;
export type CustomReport = typeof customReports.$inferSelect;
export type InsertCustomReport = typeof customReports.$inferInsert;
export type ReportExecution = typeof reportExecutions.$inferSelect;
export type InsertReportExecution = typeof reportExecutions.$inferInsert;
export type SavedQuery = typeof savedQueries.$inferSelect;
export type InsertSavedQuery = typeof savedQueries.$inferInsert;

// Location tracking table for GPS attendance
export const locationTracking = pgTable("location_tracking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  accuracy: integer("accuracy"), // GPS accuracy in meters
  timestamp: timestamp("timestamp").defaultNow(),
  isWithinGeofence: boolean("is_within_geofence").default(false),
  geofenceId: integer("geofence_id").references(() => geofences.id),
  trackingType: text("tracking_type").default("manual"), // manual, automatic, attendance
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow(),
});

// Geofences for location-based attendance
export const geofences = pgTable("geofences", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  centerLatitude: decimal("center_latitude", { precision: 10, scale: 8 }).notNull(),
  centerLongitude: decimal("center_longitude", { precision: 11, scale: 8 }).notNull(),
  radius: integer("radius").notNull(), // radius in meters
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Coach attendance with GPS verification
export const coachAttendance = pgTable("coach_attendance", {
  id: serial("id").primaryKey(),
  coachId: integer("coach_id").references(() => coaches.id),
  batchId: integer("batch_id").references(() => batches.id),
  date: date("date").notNull(),
  checkInTime: timestamp("check_in_time"),
  checkOutTime: timestamp("check_out_time"),
  checkInLocation: jsonb("check_in_location"), // {lat, lng, accuracy}
  checkOutLocation: jsonb("check_out_location"),
  isGpsVerified: boolean("is_gps_verified").default(false),
  geofenceVerified: boolean("geofence_verified").default(false),
  status: text("status").default("absent"), // present, absent, late, early_leave
  notes: text("notes"),
  verifiedBy: integer("verified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User roles and permissions
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  permissions: jsonb("permissions").default([]),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Permission definitions
export const permissions = pgTable("permissions", {
  id: serial("id").primaryKey(),
  name: text("name").unique().notNull(),
  displayName: text("display_name").notNull(),
  description: text("description"),
  category: text("category").notNull(), // users, students, payments, attendance, etc.
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Schemas for new tables
export const insertLocationTrackingSchema = createInsertSchema(locationTracking).omit({ 
  id: true, 
  createdAt: true 
});
export const selectLocationTrackingSchema = createSelectSchema(locationTracking);

export const insertGeofenceSchema = createInsertSchema(geofences).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectGeofenceSchema = createSelectSchema(geofences);

export const insertCoachAttendanceSchema = createInsertSchema(coachAttendance).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectCoachAttendanceSchema = createSelectSchema(coachAttendance);

export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});
export const selectUserRoleSchema = createSelectSchema(userRoles);

export const insertPermissionSchema = createInsertSchema(permissions).omit({ 
  id: true, 
  createdAt: true 
});
export const selectPermissionSchema = createSelectSchema(permissions);

// Export new types
export type LocationTracking = typeof locationTracking.$inferSelect;
export type InsertLocationTracking = typeof locationTracking.$inferInsert;
export type Geofence = typeof geofences.$inferSelect;
export type InsertGeofence = typeof geofences.$inferInsert;
export type CoachAttendance = typeof coachAttendance.$inferSelect;
export type InsertCoachAttendance = typeof coachAttendance.$inferInsert;
export type UserRole = typeof userRoles.$inferSelect;
export type InsertUserRole = typeof userRoles.$inferInsert;
export type Permission = typeof permissions.$inferSelect;
export type InsertPermission = typeof permissions.$inferInsert;
