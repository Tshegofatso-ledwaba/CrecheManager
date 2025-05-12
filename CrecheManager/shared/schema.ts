import { pgTable, text, serial, integer, boolean, date, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  phone: text("phone"),
  role: text("role").notNull().default("parent"), // "admin" or "parent"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRelations = relations(users, ({ many }) => ({
  children: many(children),
  applications: many(applications),
}));

// South African phone number validation
// Format: +27 XX XXX XXXX or 0XX XXX XXXX
const saPhoneRegex = /^(\+27|0)[1-9][0-9]{8}$/;

// Export schema for validation
export const InsertUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(12, "Phone number must not exceed 12 characters")
    .refine(val => !val || saPhoneRegex.test(val.replace(/\s+/g, '')), {
      message: "Please enter a valid South African phone number (e.g., 0XX XXX XXXX or +27 XX XXX XXXX)",
    }).optional(),
  role: z.enum(["admin", "parent"]),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: "You must agree to the terms and conditions"
  })
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const insertUserSchema = createInsertSchema(users, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) => schema.email("Please enter a valid email address"),
  password: (schema) => schema.min(6, "Password must be at least 6 characters"),
  phone: (schema) => schema
    .min(10, "Phone number must be at least 10 digits")
    .max(12, "Phone number must not exceed 12 characters")
    .refine(val => !val || saPhoneRegex.test(val.replace(/\s+/g, '')), {
      message: "Please enter a valid South African phone number (e.g., 0XX XXX XXXX or +27 XX XXX XXXX)",
    }).optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Applications
export const applications = pgTable("applications", {
  id: serial("id").primaryKey(),
  childFirstName: text("child_first_name").notNull(),
  childLastName: text("child_last_name").notNull(),
  childDob: timestamp("child_dob").notNull(),
  childGender: text("child_gender").notNull(),
  childAge: integer("child_age"),
  parentId: integer("parent_id").references(() => users.id).notNull(),
  allergies: text("allergies"),
  medicalConditions: text("medical_conditions"),
  medications: text("medications"),
  emergencyName: text("emergency_name").notNull(),
  emergencyRelationship: text("emergency_relationship").notNull(),
  emergencyPhone: text("emergency_phone").notNull(),
  emergencyEmail: text("emergency_email"),
  status: text("status").notNull().default("pending"), // "pending", "approved", "rejected"
  appliedDate: timestamp("applied_date").defaultNow().notNull(),
});

export const applicationRelations = relations(applications, ({ one, many }) => ({
  parent: one(users, {
    fields: [applications.parentId],
    references: [users.id]
  }),
  documents: many(documents),
}));

export const applicationInsertSchema = createInsertSchema(applications, {
  childFirstName: (schema) => schema.min(2, "First name must be at least 2 characters"),
  childLastName: (schema) => schema.min(2, "Last name must be at least 2 characters"),
  childDob: (schema) => schema,
  childGender: (schema) => schema.refine(val => ["male", "female", "other"].includes(val.toLowerCase()), {
    message: "Gender must be male, female, or other"
  }),
  parentId: (schema) => schema,
  allergies: (schema) => schema.nullable().optional(),
  medicalConditions: (schema) => schema.nullable().optional(),
  medications: (schema) => schema.nullable().optional(),
  emergencyName: (schema) => schema.min(2, "Emergency contact name must be at least 2 characters"),
  emergencyRelationship: (schema) => schema.min(2, "Relationship must be at least 2 characters"),
  emergencyPhone: (schema) => schema
    .min(10, "Phone number must be at least 10 digits")
    .max(12, "Phone number must not exceed 12 characters")
    .refine(val => saPhoneRegex.test(val.replace(/\s+/g, '')), {
      message: "Please enter a valid South African phone number (e.g., 0XX XXX XXXX or +27 XX XXX XXXX)",
    }),
  emergencyEmail: (schema) => schema.nullable().optional(),
});

export type InsertApplication = z.infer<typeof applicationInsertSchema>;
export type Application = typeof applications.$inferSelect;

// Children
export const children = pgTable("children", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  dob: timestamp("dob").notNull(),
  gender: text("gender").notNull(),
  age: integer("age"),
  parentId: integer("parent_id").references(() => users.id).notNull(),
  classId: integer("class_id").references(() => classes.id),
  status: text("status").notNull().default("active"), // "active", "inactive"
  enrollmentDate: timestamp("enrollment_date").defaultNow().notNull(),
  allergies: text("allergies"),
  medicalConditions: text("medical_conditions"),
  medications: text("medications"),
  emergencyName: text("emergency_name"),
  emergencyRelationship: text("emergency_relationship"),
  emergencyPhone: text("emergency_phone"),
});

export const childrenRelations = relations(children, ({ one, many }) => ({
  parent: one(users, {
    fields: [children.parentId],
    references: [users.id]
  }),
  class: one(classes, {
    fields: [children.classId],
    references: [classes.id]
  }),
  documents: many(documents),
  fees: many(fees),
  attendance: many(attendance),
}));

export const childInsertSchema = createInsertSchema(children, {
  firstName: (schema) => schema.min(2, "First name must be at least 2 characters"),
  lastName: (schema) => schema.min(2, "Last name must be at least 2 characters"),
  dob: (schema) => schema,
  gender: (schema) => schema.refine(val => ["male", "female", "other"].includes(val), {
    message: "Gender must be male, female, or other"
  }),
  parentId: (schema) => schema,
});

export type InsertChild = z.infer<typeof childInsertSchema>;
export type Child = typeof children.$inferSelect;

// Classes
export const classes = pgTable("classes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  ageRange: text("age_range"),
  capacity: integer("capacity"),
  teacherId: integer("teacher_id"),
});

export const classesRelations = relations(classes, ({ many }) => ({
  children: many(children),
}));

export const classInsertSchema = createInsertSchema(classes, {
  name: (schema) => schema.min(2, "Class name must be at least 2 characters"),
  capacity: (schema) => schema.refine(val => val > 0, "Capacity must be a positive number"),
});

export type InsertClass = z.infer<typeof classInsertSchema>;
export type Class = typeof classes.$inferSelect;

// Fees
export const fees = pgTable("fees", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => children.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description").notNull(),
  dueDate: timestamp("due_date").notNull(),
  status: text("status").notNull().default("pending"), // "pending", "paid", "overdue"
  createdAt: timestamp("created_at").defaultNow().notNull(),
  paidDate: timestamp("paid_date"),
});

export const feesRelations = relations(fees, ({ one }) => ({
  student: one(children, {
    fields: [fees.studentId],
    references: [children.id]
  }),
}));

export const feeSchema = createInsertSchema(fees, {
  studentId: (schema) => schema,
  amount: (schema) => schema.refine(val => parseFloat(val) > 0, {
    message: "Amount must be a positive number"
  }),
  description: (schema) => schema.min(2, "Description must be at least 2 characters"),
  dueDate: (schema) => schema,
});

export type InsertFee = z.infer<typeof feeSchema>;
export type Fee = typeof fees.$inferSelect;

// Attendance
export const attendance = pgTable("attendance", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => children.id).notNull(),
  date: timestamp("date").notNull(),
  present: boolean("present").notNull(),
  notes: text("notes"),
});

export const attendanceRelations = relations(attendance, ({ one }) => ({
  student: one(children, {
    fields: [attendance.studentId],
    references: [children.id]
  }),
}));

export const attendanceSchema = createInsertSchema(attendance, {
  studentId: (schema) => schema,
  date: (schema) => schema,
  present: (schema) => schema,
});

export type InsertAttendance = z.infer<typeof attendanceSchema>;
export type Attendance = typeof attendance.$inferSelect;

// Messages
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").references(() => users.id).notNull(),
  receiverId: integer("receiver_id").references(() => users.id).notNull(),
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  status: text("status").notNull().default("unread"), // "unread", "read"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  }),
  receiver: one(users, {
    fields: [messages.receiverId],
    references: [users.id]
  }),
}));

export const messageSchema = createInsertSchema(messages, {
  senderId: (schema) => schema,
  receiverId: (schema) => schema,
  subject: (schema) => schema.min(2, "Subject must be at least 2 characters"),
  content: (schema) => schema.min(2, "Content must be at least 2 characters"),
});

export type InsertMessage = z.infer<typeof messageSchema>;
export type Message = typeof messages.$inferSelect;

// Activities (for audit log)
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: text("type").notNull(), // "application", "enrollment", "payment", "attendance", etc.
  title: text("title").notNull(),
  description: text("description").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activitiesRelations = relations(activities, ({ one }) => ({
  user: one(users, {
    fields: [activities.userId],
    references: [users.id]
  }),
}));

export const activitySchema = createInsertSchema(activities, {
  userId: (schema) => schema,
  type: (schema) => schema,
  title: (schema) => schema.min(2, "Title must be at least 2 characters"),
  description: (schema) => schema.min(2, "Description must be at least 2 characters"),
});

export type InsertActivity = z.infer<typeof activitySchema>;
export type Activity = typeof activities.$inferSelect;

// Notifications
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  isRead: boolean("is_read").notNull().default(false),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id]
  }),
}));

export const notificationSchema = createInsertSchema(notifications, {
  userId: (schema) => schema,
  title: (schema) => schema.min(2, "Title must be at least 2 characters"),
  message: (schema) => schema.min(2, "Message must be at least 2 characters"),
});

export type InsertNotification = z.infer<typeof notificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Documents
export const documents = pgTable("documents", {
  id: serial("id").primaryKey(),
  applicationType: text("application_type").notNull(), // "application" or "child"
  applicationId: integer("application_id").notNull(),
  type: text("type").notNull(), // "birth_certificate", "vaccination_record", etc.
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  uploadDate: timestamp("upload_date").defaultNow().notNull(),
});

export const documentSchema = createInsertSchema(documents, {
  applicationType: (schema) => schema.refine(val => ["application", "child"].includes(val), {
    message: "Application type must be 'application' or 'child'"
  }),
  applicationId: (schema) => schema,
  type: (schema) => schema.min(2, "Type must be at least 2 characters"),
  fileName: (schema) => schema.min(2, "File name must be at least 2 characters"),
  fileUrl: (schema) => schema.min(2, "File URL must be at least 2 characters"),
});

export type InsertDocument = z.infer<typeof documentSchema>;
export type Document = typeof documents.$inferSelect;

// Teachers
export const teachers = pgTable("teachers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  qualification: text("qualification").notNull(),
  classId: integer("class_id").references(() => classes.id),
  status: text("status").notNull().default("active"), // active, inactive
  hireDate: timestamp("hire_date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const teachersRelations = relations(teachers, ({ one }) => ({
  class: one(classes, {
    fields: [teachers.classId],
    references: [classes.id],
  }),
}));

// Class and teacher relationships
export const classesTeachersRelations = relations(classes, ({ many }) => ({
  teachers: many(teachers),
}));

export const teacherSchema = createInsertSchema(teachers, {
  name: (schema) => schema.min(2, "Name must be at least 2 characters"),
  email: (schema) => schema.email("Please enter a valid email address"),
  qualification: (schema) => schema.min(2, "Qualification must be at least 2 characters"),
  phone: (schema) => schema.optional(),
});

export type InsertTeacher = z.infer<typeof teacherSchema>;
export type Teacher = typeof teachers.$inferSelect;

// Announcements
export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  authorId: integer("author_id").references(() => users.id).notNull(),
  targetAudience: text("target_audience").notNull().default("all"), // all, parents, staff
  publishDate: timestamp("publish_date").notNull().defaultNow(),
  expiryDate: timestamp("expiry_date"),
  status: text("status").notNull().default("active"), // draft, active, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const announcementsRelations = relations(announcements, ({ one }) => ({
  author: one(users, {
    fields: [announcements.authorId],
    references: [users.id],
  }),
}));

export const announcementSchema = createInsertSchema(announcements, {
  title: (schema) => schema.min(3, "Title must be at least 3 characters"),
  content: (schema) => schema.min(10, "Content must be at least 10 characters"),
  targetAudience: (schema) => schema.optional(),
  expiryDate: (schema) => schema.optional(),
});

export type InsertAnnouncement = z.infer<typeof announcementSchema>;
export type Announcement = typeof announcements.$inferSelect;
