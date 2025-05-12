import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";
import { createInsertSchema } from "drizzle-zod";
import { 
  applications, applicationInsertSchema, 
  children, feeSchema, messageSchema,
  teachers, teacherSchema,
  announcements, announcementSchema,
  notifications, notificationSchema
} from "@shared/schema";
import { db } from "@db";
import { eq } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication routes
  setupAuth(app);

  // API prefix
  const apiPrefix = "/api";

  // Applications routes
  app.get(`${apiPrefix}/applications`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;

      let applications;
      if (userRole === "admin") {
        applications = await storage.getAllApplications();
      } else {
        applications = await storage.getApplicationsByParentId(userId);
      }
      res.json(applications);
    } catch (error) {
      console.error("Error fetching applications:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/applications/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const applicationId = parseInt(req.params.id);
      const application = await storage.getApplicationById(applicationId);
      
      if (!application) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      const userRole = (req.user as any).role;
      const userId = (req.user as any).id;
      
      // Check if admin or the parent who submitted the application
      if (userRole !== "admin" && application.parentId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(application);
    } catch (error) {
      console.error("Error fetching application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/applications`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = (req.user as any).id;
      
      // Log the body before validation for debugging
      console.log("Application submission body:", JSON.stringify(req.body, null, 2));
      
      try {
        // Ensure data has the right format and optional fields are properly set
        const formData = {
          childFirstName: req.body.childFirstName || "",
          childLastName: req.body.childLastName || "",
          childDob: new Date(req.body.childDob),
          childGender: req.body.childGender?.toLowerCase() || "",
          parentId: userId,
          status: "pending",
          appliedDate: new Date(),
          // Make sure these fields can be null
          allergies: req.body.allergies === "" ? null : req.body.allergies,
          medicalConditions: req.body.medicalConditions === "" ? null : req.body.medicalConditions,
          medications: req.body.medications === "" ? null : req.body.medications,
          emergencyName: req.body.emergencyName || "",
          emergencyRelationship: req.body.emergencyRelationship || "",
          emergencyPhone: (req.body.emergencyPhone || "").replace(/\s+/g, ''),
          emergencyEmail: req.body.emergencyEmail === "" ? null : req.body.emergencyEmail
        };
        
        console.log("Formatted application data:", JSON.stringify(formData, null, 2));
        
        // Validate against schema
        const validated = applicationInsertSchema.parse(formData);
        
        // Save to database
        const application = await storage.createApplication(validated);
        res.status(201).json(application);
      } catch (zodError) {
        if (zodError instanceof z.ZodError) {
          console.error("Validation error details:", JSON.stringify(zodError.errors, null, 2));
          return res.status(400).json({ errors: zodError.errors });
        } else {
          console.error("Non-validation error:", zodError);
          throw zodError;
        }
      }
    } catch (error) {
      console.error("Error creating application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(`${apiPrefix}/applications/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can update application status" });
      }
      
      const applicationId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const updated = await storage.updateApplicationStatus(applicationId, status);
      
      if (!updated) {
        return res.status(404).json({ message: "Application not found" });
      }
      
      // If application is approved, create a child record
      if (status === "approved") {
        const application = await storage.getApplicationById(applicationId);
        if (application) {
          await storage.createChild({
            firstName: application.childFirstName,
            lastName: application.childLastName,
            dob: new Date(application.childDob),
            gender: application.childGender,
            parentId: application.parentId,
            enrollmentDate: new Date(),
            status: "active",
            allergies: application.allergies,
            medicalConditions: application.medicalConditions,
          });
        }
      }
      
      res.json({ success: true, status });
    } catch (error) {
      console.error("Error updating application:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Children routes
  app.get(`${apiPrefix}/children`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      
      let children;
      if (userRole === "admin") {
        children = await storage.getAllChildren();
      } else {
        children = await storage.getChildrenByParentId(userId);
      }
      
      res.json(children);
    } catch (error) {
      console.error("Error fetching children:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/children/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const childId = parseInt(req.params.id);
      const child = await storage.getChildById(childId);
      
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      
      const userRole = (req.user as any).role;
      const userId = (req.user as any).id;
      
      // Check if admin or the parent of the child
      if (userRole !== "admin" && child.parentId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(child);
    } catch (error) {
      console.error("Error fetching child:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Classes routes
  app.get(`${apiPrefix}/classes`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const classes = await storage.getAllClasses();
      res.json(classes);
    } catch (error) {
      console.error("Error fetching classes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Students routes
  app.get(`${apiPrefix}/students`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can access all students" });
      }
      
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/students/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const studentId = parseInt(req.params.id);
      const student = await storage.getStudentById(studentId);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      const userRole = (req.user as any).role;
      const userId = (req.user as any).id;
      
      // Check if admin or the parent of the student
      if (userRole !== "admin" && student.parentId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(`${apiPrefix}/students/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can update students" });
      }
      
      const studentId = parseInt(req.params.id);
      const { classId } = req.body;
      
      const updated = await storage.updateStudentClass(studentId, classId);
      
      if (!updated) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Fees routes
  app.get(`${apiPrefix}/fees`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = (req.user as any).id;
      const userRole = (req.user as any).role;
      
      let fees;
      if (userRole === "admin") {
        fees = await storage.getAllFees();
      } else {
        fees = await storage.getFeesByParentId(userId);
      }
      
      res.json(fees);
    } catch (error) {
      console.error("Error fetching fees:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/fees`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can create fees" });
      }
      
      const validated = feeSchema.parse({
        ...req.body,
        status: "pending",
      });
      
      const fee = await storage.createFee(validated);
      res.status(201).json(fee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        console.error("Error creating fee:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch(`${apiPrefix}/fees/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const feeId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["pending", "paid", "overdue"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const userRole = (req.user as any).role;
      
      // Parents can only mark as paid, admins can change to any status
      if (userRole !== "admin" && status !== "paid") {
        return res.status(403).json({ message: "Forbidden - parents can only mark fees as paid" });
      }
      
      const updated = await storage.updateFeeStatus(feeId, status);
      
      if (!updated) {
        return res.status(404).json({ message: "Fee not found" });
      }
      
      res.json({ success: true, status });
    } catch (error) {
      console.error("Error updating fee:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/fees/:id/remind`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can send fee reminders" });
      }
      
      const feeId = parseInt(req.params.id);
      const fee = await storage.getFeeById(feeId);
      
      if (!fee) {
        return res.status(404).json({ message: "Fee not found" });
      }
      
      // In a real application, this would send an email or notification to the parent
      // For now, we'll just create a message
      await storage.createMessage({
        senderId: (req.user as any).id,
        receiverId: fee.parentId,
        subject: "Fee Payment Reminder",
        content: `This is a reminder that your payment of $${fee.amount.toFixed(2)} for ${fee.description} is due on ${new Date(fee.dueDate).toLocaleDateString()}.`,
        status: "unread",
        createdAt: new Date(),
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error sending fee reminder:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Attendance routes
  app.get(`${apiPrefix}/attendance`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can access attendance" });
      }
      
      const date = req.query.date as string || new Date().toISOString().split("T")[0];
      const records = await storage.getAttendanceByDate(date);
      
      res.json(records);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/attendance`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can record attendance" });
      }
      
      const { studentId, date, present, notes } = req.body;
      
      // Check if attendance record already exists
      const existingRecord = await storage.getAttendanceRecord(studentId, date);
      
      if (existingRecord) {
        // Update existing record
        const updated = await storage.updateAttendanceRecord(existingRecord.id, present, notes);
        res.json(updated);
      } else {
        // Create new record
        const record = await storage.createAttendanceRecord({
          studentId,
          date: new Date(date),
          present,
          notes: notes || "",
        });
        res.status(201).json(record);
      }
    } catch (error) {
      console.error("Error recording attendance:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/attendance/mark-all`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can record attendance" });
      }
      
      const { date, classId, present } = req.body;
      
      await storage.markAllAttendance(date, classId, present);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking all attendance:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(`${apiPrefix}/attendance/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can update attendance" });
      }
      
      const attendanceId = parseInt(req.params.id);
      const { notes } = req.body;
      
      const updated = await storage.updateAttendanceNotes(attendanceId, notes);
      
      if (!updated) {
        return res.status(404).json({ message: "Attendance record not found" });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating attendance notes:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Messages routes
  app.get(`${apiPrefix}/messages`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = (req.user as any).id;
      const messages = await storage.getMessagesByUserId(userId);
      
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/messages/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const messageId = parseInt(req.params.id);
      const message = await storage.getMessageById(messageId);
      
      if (!message) {
        return res.status(404).json({ message: "Message not found" });
      }
      
      const userId = (req.user as any).id;
      
      // Check if user is sender or receiver
      if (message.senderId !== userId && message.receiverId !== userId) {
        return res.status(403).json({ message: "Forbidden" });
      }
      
      // Mark as read if user is receiver and message is unread
      if (message.receiverId === userId && message.status === "unread") {
        await storage.markMessageAsRead(messageId);
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error fetching message:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/messages`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = (req.user as any).id;
      
      const validated = messageSchema.parse({
        ...req.body,
        senderId: userId,
        status: "unread",
        createdAt: new Date(),
      });
      
      const message = await storage.createMessage(validated);
      res.status(201).json(message);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        console.error("Error creating message:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  // Stats routes for admin dashboard
  app.get(`${apiPrefix}/stats`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can access stats" });
      }
      
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Activities routes for admin dashboard
  app.get(`${apiPrefix}/activities`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can access activities" });
      }
      
      const activities = await storage.getRecentActivities();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Notifications routes for parent dashboard
  app.get(`${apiPrefix}/notifications`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userId = (req.user as any).id;
      const notifications = await storage.getNotificationsByUserId(userId);
      
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Mark a notification as read
  app.patch(`${apiPrefix}/notifications/:id/read`, async (req, res) => {
    try {
      console.log("Mark notification as read - Authenticated check");
      if (!req.isAuthenticated()) {
        console.log("User not authenticated for mark as read");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const notificationId = parseInt(req.params.id);
      const userId = (req.user as any).id;
      console.log(`Attempting to mark notification ${notificationId} as read for user ${userId}`);
      
      // Check if the notification belongs to the user
      const userNotifications = await storage.getNotificationsByUserId(userId);
      console.log(`Found ${userNotifications.length} notifications for user`);
      
      const notificationExists = userNotifications.some((n: any) => n.id === notificationId);
      console.log(`Notification ${notificationId} exists for user: ${notificationExists}`);
      
      if (!notificationExists) {
        console.log(`User ${userId} doesn't have permission to update notification ${notificationId}`);
        return res.status(403).json({ message: "You don't have permission to update this notification" });
      }
      
      // Update notification in the database using the imported table
      console.log(`Updating notification ${notificationId} to mark as read`);
      const result = await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.id, notificationId))
        .returning();
      
      console.log(`Update result:`, result);
      res.json({ success: true, notification: result[0] });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });
  
  // Mark all notifications as read
  app.patch(`${apiPrefix}/notifications/read-all`, async (req, res) => {
    try {
      console.log("Mark all notifications as read - Authenticated check");
      if (!req.isAuthenticated()) {
        console.log("User not authenticated for mark all as read");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = (req.user as any).id;
      console.log(`Attempting to mark all notifications as read for user ${userId}`);
      
      // Get count of unread notifications for the user
      const userNotifications = await storage.getNotificationsByUserId(userId);
      const unreadCount = userNotifications.filter((n: any) => !n.isRead).length;
      console.log(`Found ${unreadCount} unread notifications for user ${userId}`);
      
      // Update all user's notifications to read
      console.log(`Updating all notifications to mark as read for user ${userId}`);
      const result = await db.update(notifications)
        .set({ isRead: true })
        .where(eq(notifications.userId, userId))
        .returning();
      
      console.log(`Marked ${result.length} notifications as read`);
      res.json({ success: true, count: result.length });
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Teachers routes
  app.get(`${apiPrefix}/teachers`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can access teachers" });
      }
      
      const teachers = await storage.getAllTeachers();
      res.json(teachers);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/teachers/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can access teacher details" });
      }
      
      const teacherId = parseInt(req.params.id);
      const teacher = await storage.getTeacherById(teacherId);
      
      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      
      res.json(teacher);
    } catch (error) {
      console.error("Error fetching teacher:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/teachers`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can add teachers" });
      }
      
      const validated = teacherSchema.parse({
        ...req.body,
        status: req.body.status || "active",
        hireDate: new Date(),
        createdAt: new Date(),
      });
      
      const teacher = await storage.createTeacher(validated);
      res.status(201).json(teacher);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ errors: error.errors });
      } else {
        console.error("Error creating teacher:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch(`${apiPrefix}/teachers/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can update teachers" });
      }
      
      const teacherId = parseInt(req.params.id);
      const { name, email, phone, qualification, classId, status } = req.body;
      
      // Update teacher
      const result = await db.update(teachers)
        .set({ 
          name, 
          email, 
          phone, 
          qualification, 
          classId: classId ? parseInt(classId) : undefined,
          status 
        })
        .where(eq(teachers.id, teacherId))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating teacher:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(`${apiPrefix}/teachers/:id/status`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can update teacher status" });
      }
      
      const teacherId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["active", "inactive"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const updated = await storage.updateTeacherStatus(teacherId, status);
      
      if (!updated) {
        return res.status(404).json({ message: "Teacher not found" });
      }
      
      res.json({ success: true, status });
    } catch (error) {
      console.error("Error updating teacher status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Announcements routes
  app.get(`${apiPrefix}/announcements`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      const userId = (req.user as any).id;
      
      let announcements;
      if (userRole === "admin") {
        announcements = await storage.getAllAnnouncements();
      } else {
        // Parents only see active announcements targeted to them
        announcements = await storage.getActiveAnnouncements("parents");
      }
      
      res.json(announcements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.get(`${apiPrefix}/announcements/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const announcementId = parseInt(req.params.id);
      const announcement = await storage.getAnnouncementById(announcementId);
      
      if (!announcement) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      const userRole = (req.user as any).role;
      
      // If parent, check if announcement is targeted to them
      if (userRole !== "admin") {
        if (announcement.status !== "active" || 
            (announcement.targetAudience !== "all" && announcement.targetAudience !== "parents")) {
          return res.status(403).json({ message: "Forbidden" });
        }
      }
      
      res.json(announcement);
    } catch (error) {
      console.error("Error fetching announcement:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.post(`${apiPrefix}/announcements`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can create announcements" });
      }
      
      const userId = (req.user as any).id;
      
      // Debug the incoming data
      console.log("Announcement data received:", JSON.stringify(req.body));
      
      // Format dates properly
      const formattedData = {
        ...req.body,
        authorId: userId,
        publishDate: req.body.publishDate ? new Date(req.body.publishDate) : new Date(),
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
        status: req.body.status || "active",
        createdAt: new Date(),
      };
      
      // Debug the formatted data
      console.log("Formatted announcement data:", JSON.stringify(formattedData));
      
      const validated = announcementSchema.parse(formattedData);
      
      const announcement = await storage.createAnnouncement(validated);
      res.status(201).json(announcement);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Validation error:", JSON.stringify(error.errors));
        res.status(400).json({ errors: error.errors });
      } else {
        console.error("Error creating announcement:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    }
  });

  app.patch(`${apiPrefix}/announcements/:id`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can update announcements" });
      }
      
      const announcementId = parseInt(req.params.id);
      const { title, content, targetAudience, publishDate, expiryDate, status } = req.body;
      
      // Update announcement
      const result = await db.update(announcements)
        .set({ 
          title, 
          content, 
          targetAudience,
          publishDate: publishDate ? new Date(publishDate) : undefined,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          status 
        })
        .where(eq(announcements.id, announcementId))
        .returning();
      
      if (result.length === 0) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      res.json(result[0]);
    } catch (error) {
      console.error("Error updating announcement:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(`${apiPrefix}/announcements/:id/status`, async (req, res) => {
    try {
      if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
      
      const userRole = (req.user as any).role;
      if (userRole !== "admin") {
        return res.status(403).json({ message: "Forbidden - only admins can update announcement status" });
      }
      
      const announcementId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["draft", "active", "archived"].includes(status)) {
        return res.status(400).json({ message: "Invalid status value" });
      }
      
      const updated = await storage.updateAnnouncementStatus(announcementId, status);
      
      if (!updated) {
        return res.status(404).json({ message: "Announcement not found" });
      }
      
      res.json({ success: true, status });
    } catch (error) {
      console.error("Error updating announcement status:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
