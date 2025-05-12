import { db, pool } from "@db";
import { 
  users, 
  applications, 
  children, 
  classes, 
  fees, 
  attendance, 
  messages, 
  activities, 
  notifications, 
  documents, 
  announcements,
  teachers,
  InsertUser, 
  InsertApplication, 
  InsertChild, 
  InsertClass, 
  InsertFee, 
  InsertAttendance, 
  InsertMessage, 
  InsertActivity, 
  InsertNotification,
  InsertDocument,
  InsertTeacher,
  InsertAnnouncement
} from "@shared/schema";
import { eq, and, desc, asc, like, or, inArray } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";

export interface IStorage {
  // Users
  getUserByEmail(email: string): Promise<any>;
  getUserByUsername(username: string): Promise<any>;
  getUser(id: number): Promise<any>;
  createUser(user: Omit<InsertUser, "id">): Promise<any>;

  // Applications
  getAllApplications(): Promise<any[]>;
  getApplicationsByParentId(parentId: number): Promise<any[]>;
  getApplicationById(id: number): Promise<any>;
  createApplication(application: InsertApplication): Promise<any>;
  updateApplicationStatus(id: number, status: string): Promise<boolean>;

  // Children
  getAllChildren(): Promise<any[]>;
  getChildrenByParentId(parentId: number): Promise<any[]>;
  getChildById(id: number): Promise<any>;
  createChild(child: Omit<InsertChild, "id">): Promise<any>;

  // Classes
  getAllClasses(): Promise<any[]>;
  getClassById(id: number): Promise<any>;
  createClass(cls: Omit<InsertClass, "id">): Promise<any>;

  // Students (Children with class assignments)
  getAllStudents(): Promise<any[]>;
  getStudentById(id: number): Promise<any>;
  updateStudentClass(id: number, classId: string): Promise<boolean>;

  // Fees
  getAllFees(): Promise<any[]>;
  getFeesByParentId(parentId: number): Promise<any[]>;
  getFeeById(id: number): Promise<any>;
  createFee(fee: Omit<InsertFee, "id">): Promise<any>;
  updateFeeStatus(id: number, status: string): Promise<boolean>;

  // Attendance
  getAttendanceByDate(date: string): Promise<any[]>;
  getAttendanceRecord(studentId: number, date: string): Promise<any>;
  createAttendanceRecord(record: Omit<InsertAttendance, "id">): Promise<any>;
  updateAttendanceRecord(id: number, present: boolean, notes?: string): Promise<any>;
  updateAttendanceNotes(id: number, notes: string): Promise<boolean>;
  markAllAttendance(date: string, classId?: string, present?: boolean): Promise<void>;

  // Messages
  getMessagesByUserId(userId: number): Promise<any[]>;
  getMessageById(id: number): Promise<any>;
  createMessage(message: Omit<InsertMessage, "id">): Promise<any>;
  markMessageAsRead(id: number): Promise<boolean>;

  // Dashboard Stats (Admin)
  getDashboardStats(): Promise<any>;
  getRecentActivities(): Promise<any[]>;

  // Notifications (Parent)
  getNotificationsByUserId(userId: number): Promise<any[]>;
  createNotification(notification: Omit<InsertNotification, "id">): Promise<any>;

  // Documents
  uploadDocument(document: Omit<InsertDocument, "id">): Promise<any>;
  getDocumentsByApplicationId(applicationId: number): Promise<any[]>;
  getDocumentsByChildId(childId: number): Promise<any[]>;
  
  // Teachers
  getAllTeachers(): Promise<any[]>;
  getTeacherById(id: number): Promise<any>;
  getTeachersByClassId(classId: number): Promise<any[]>;
  createTeacher(teacher: Omit<InsertTeacher, "id">): Promise<any>;
  updateTeacherStatus(id: number, status: string): Promise<boolean>;
  updateTeacherClass(id: number, classId: number): Promise<boolean>;
  
  // Announcements
  getAllAnnouncements(): Promise<any[]>;
  getAnnouncementById(id: number): Promise<any>;
  getAnnouncementsByAuthorId(authorId: number): Promise<any[]>;
  getActiveAnnouncements(targetAudience?: string): Promise<any[]>;
  createAnnouncement(announcement: Omit<InsertAnnouncement, "id">): Promise<any>;
  updateAnnouncementStatus(id: number, status: string): Promise<boolean>;

  // Session store
  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    const PostgresSessionStore = connectPg(session);
    this.sessionStore = new PostgresSessionStore({
      conObject: {
        connectionString: process.env.DATABASE_URL,
      },
      createTableIfMissing: true,
    });
  }

  // User methods
  async getUserByEmail(email: string): Promise<any> {
    const result = await db.select().from(users).where(eq(users.email, email));
    return result.length > 0 ? result[0] : null;
  }

  async getUserByUsername(username: string): Promise<any> {
    // Since there's no username field, we'll use email instead
    const result = await db.select().from(users).where(eq(users.email, username));
    return result.length > 0 ? result[0] : null;
  }

  async getUser(id: number): Promise<any> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async createUser(user: Omit<InsertUser, "id">): Promise<any> {
    const result = await db.insert(users).values(user).returning();
    return result.length > 0 ? result[0] : null;
  }

  // Application methods
  async getAllApplications(): Promise<any[]> {
    return await db.select({
      id: applications.id,
      childFirstName: applications.childFirstName,
      childLastName: applications.childLastName,
      childDob: applications.childDob,
      childGender: applications.childGender,
      childAge: applications.childAge,
      parentId: applications.parentId,
      parentName: users.name,
      allergies: applications.allergies,
      medicalConditions: applications.medicalConditions,
      emergencyName: applications.emergencyName,
      emergencyRelationship: applications.emergencyRelationship,
      emergencyPhone: applications.emergencyPhone,
      emergencyEmail: applications.emergencyEmail,
      status: applications.status,
      appliedDate: applications.appliedDate
    })
    .from(applications)
    .leftJoin(users, eq(applications.parentId, users.id))
    .orderBy(desc(applications.appliedDate));
  }

  async getApplicationsByParentId(parentId: number): Promise<any[]> {
    return await db.select().from(applications).where(eq(applications.parentId, parentId)).orderBy(desc(applications.appliedDate));
  }

  async getApplicationById(id: number): Promise<any> {
    const result = await db.select().from(applications).where(eq(applications.id, id));
    
    if (result.length === 0) return null;
    
    // Get documents associated with the application
    const docs = await this.getDocumentsByApplicationId(id);
    
    return { ...result[0], documents: docs };
  }

  async createApplication(application: any): Promise<any> {
    try {
      console.log("Storage: creating application with data:", JSON.stringify(application, null, 2));
      
      // Ensure all required fields are present with proper types
      const sanitizedApplication = {
        childFirstName: String(application.childFirstName || ""),
        childLastName: String(application.childLastName || ""),
        childDob: application.childDob instanceof Date ? application.childDob : new Date(application.childDob || Date.now()),
        childGender: String(application.childGender || ""),
        parentId: Number(application.parentId),
        status: String(application.status || "pending"),
        appliedDate: application.appliedDate instanceof Date ? application.appliedDate : new Date(),
        emergencyName: String(application.emergencyName || ""),
        emergencyRelationship: String(application.emergencyRelationship || ""),
        emergencyPhone: String(application.emergencyPhone || ""),
        allergies: application.allergies === null ? null : String(application.allergies || ""),
        medicalConditions: application.medicalConditions === null ? null : String(application.medicalConditions || ""),
        medications: application.medications === null ? null : String(application.medications || ""),
        emergencyEmail: application.emergencyEmail === null ? null : String(application.emergencyEmail || "")
      };
      
      console.log("Storage: inserting sanitized application:", JSON.stringify(sanitizedApplication, null, 2));
      
      const result = await db.insert(applications).values(sanitizedApplication).returning();
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      console.error("Storage: Error creating application:", error);
      throw error;
    }
  }

  async updateApplicationStatus(id: number, status: string): Promise<boolean> {
    const result = await db.update(applications)
      .set({ status })
      .where(eq(applications.id, id))
      .returning();
    
    // Create activity record
    if (result.length > 0) {
      await this.createActivity({
        userId: result[0].parentId,
        type: "application",
        title: `Application status updated to ${status}`,
        description: `Application for ${result[0].childFirstName} ${result[0].childLastName} has been ${status}`,
        createdAt: new Date()
      });
      
      // Create notification for parent
      await this.createNotification({
        userId: result[0].parentId,
        title: "Application Status Updated",
        message: `Your application for ${result[0].childFirstName} has been ${status}`,
        date: new Date(),
        isRead: false
      });
    }
    
    return result.length > 0;
  }

  // Children methods
  async getAllChildren(): Promise<any[]> {
    return await db.select({
      id: children.id,
      firstName: children.firstName,
      lastName: children.lastName,
      dob: children.dob,
      gender: children.gender,
      parentId: children.parentId,
      parentName: users.name,
      status: children.status,
      enrollmentDate: children.enrollmentDate,
      className: classes.name,
      classId: classes.id,
      allergies: children.allergies,
      medicalConditions: children.medicalConditions,
    })
    .from(children)
    .leftJoin(users, eq(children.parentId, users.id))
    .leftJoin(classes, eq(children.classId, classes.id))
    .orderBy(asc(children.lastName), asc(children.firstName));
  }

  async getChildrenByParentId(parentId: number): Promise<any[]> {
    return await db.select({
      id: children.id,
      firstName: children.firstName,
      lastName: children.lastName,
      dob: children.dob,
      gender: children.gender,
      status: children.status,
      enrollmentDate: children.enrollmentDate,
      className: classes.name,
      classId: classes.id,
      allergies: children.allergies,
      medicalConditions: children.medicalConditions,
    })
    .from(children)
    .leftJoin(classes, eq(children.classId, classes.id))
    .where(eq(children.parentId, parentId))
    .orderBy(asc(children.lastName), asc(children.firstName));
  }

  async getChildById(id: number): Promise<any> {
    const result = await db.select({
      id: children.id,
      firstName: children.firstName,
      lastName: children.lastName,
      dob: children.dob,
      gender: children.gender,
      parentId: children.parentId,
      parentName: users.name,
      parentEmail: users.email,
      parentPhone: users.phone,
      status: children.status,
      enrollmentDate: children.enrollmentDate,
      className: classes.name,
      classId: classes.id,
      allergies: children.allergies,
      medicalConditions: children.medicalConditions,
    })
    .from(children)
    .leftJoin(users, eq(children.parentId, users.id))
    .leftJoin(classes, eq(children.classId, classes.id))
    .where(eq(children.id, id));
    
    if (result.length === 0) return null;
    
    // Get documents associated with the child
    const docs = await this.getDocumentsByChildId(id);
    
    return { ...result[0], documents: docs };
  }

  async createChild(child: Omit<InsertChild, "id">): Promise<any> {
    const result = await db.insert(children).values(child).returning();
    
    if (result.length > 0) {
      // Create activity record
      await this.createActivity({
        userId: child.parentId,
        type: "enrollment",
        title: "New child enrolled",
        description: `${child.firstName} ${child.lastName} has been enrolled`,
        createdAt: new Date()
      });
      
      // Create notification for parent
      await this.createNotification({
        userId: child.parentId,
        title: "Child Enrolled",
        message: `${child.firstName} has been successfully enrolled in the creche`,
        date: new Date(),
        isRead: false
      });
    }
    
    return result.length > 0 ? result[0] : null;
  }

  // Classes methods
  async getAllClasses(): Promise<any[]> {
    return await db.select().from(classes).orderBy(asc(classes.name));
  }

  async getClassById(id: number): Promise<any> {
    const result = await db.select().from(classes).where(eq(classes.id, id));
    return result.length > 0 ? result[0] : null;
  }

  async createClass(cls: Omit<InsertClass, "id">): Promise<any> {
    const result = await db.insert(classes).values(cls).returning();
    return result.length > 0 ? result[0] : null;
  }

  // Students methods (Children with class assignments)
  async getAllStudents(): Promise<any[]> {
    return await db.select({
      id: children.id,
      firstName: children.firstName,
      lastName: children.lastName,
      dob: children.dob,
      gender: children.gender,
      age: children.age,
      parentId: children.parentId,
      parentName: users.name,
      parentEmail: users.email,
      parentPhone: users.phone,
      status: children.status,
      enrollmentDate: children.enrollmentDate,
      className: classes.name,
      classId: classes.id,
    })
    .from(children)
    .leftJoin(users, eq(children.parentId, users.id))
    .leftJoin(classes, eq(children.classId, classes.id))
    .orderBy(asc(children.lastName), asc(children.firstName));
  }

  async getStudentById(id: number): Promise<any> {
    const result = await db.select({
      id: children.id,
      firstName: children.firstName,
      lastName: children.lastName,
      dob: children.dob,
      gender: children.gender,
      parentId: children.parentId,
      parentName: users.name,
      parentEmail: users.email,
      parentPhone: users.phone,
      status: children.status,
      enrollmentDate: children.enrollmentDate,
      className: classes.name,
      classId: classes.id,
      allergies: children.allergies,
      medicalConditions: children.medicalConditions,
      medications: children.medications,
      emergencyName: children.emergencyName,
      emergencyRelationship: children.emergencyRelationship,
      emergencyPhone: children.emergencyPhone,
    })
    .from(children)
    .leftJoin(users, eq(children.parentId, users.id))
    .leftJoin(classes, eq(children.classId, classes.id))
    .where(eq(children.id, id));
    
    if (result.length === 0) return null;
    
    // Get documents associated with the student
    const docs = await this.getDocumentsByChildId(id);
    
    return { ...result[0], documents: docs };
  }

  async updateStudentClass(id: number, classId: string): Promise<boolean> {
    const result = await db.update(children)
      .set({ classId: parseInt(classId) })
      .where(eq(children.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Fees methods
  async getAllFees(): Promise<any[]> {
    return await db.select({
      id: fees.id,
      studentId: fees.studentId,
      studentName: db.sql`${children.firstName} || ' ' || ${children.lastName}`,
      parentId: children.parentId,
      amount: fees.amount,
      description: fees.description,
      dueDate: fees.dueDate,
      status: fees.status,
      createdAt: fees.createdAt,
      paidDate: fees.paidDate,
    })
    .from(fees)
    .leftJoin(children, eq(fees.studentId, children.id))
    .orderBy(desc(fees.dueDate));
  }

  async getFeesByParentId(parentId: number): Promise<any[]> {
    return await db.select({
      id: fees.id,
      studentId: fees.studentId,
      studentName: db.sql`${children.firstName} || ' ' || ${children.lastName}`,
      amount: fees.amount,
      description: fees.description,
      dueDate: fees.dueDate,
      status: fees.status,
      createdAt: fees.createdAt,
      paidDate: fees.paidDate,
    })
    .from(fees)
    .leftJoin(children, eq(fees.studentId, children.id))
    .where(eq(children.parentId, parentId))
    .orderBy(desc(fees.dueDate));
  }

  async getFeeById(id: number): Promise<any> {
    const result = await db.select({
      id: fees.id,
      studentId: fees.studentId,
      studentName: db.sql`${children.firstName} || ' ' || ${children.lastName}`,
      parentId: children.parentId,
      amount: fees.amount,
      description: fees.description,
      dueDate: fees.dueDate,
      status: fees.status,
      createdAt: fees.createdAt,
      paidDate: fees.paidDate,
    })
    .from(fees)
    .leftJoin(children, eq(fees.studentId, children.id))
    .where(eq(fees.id, id));
    
    return result.length > 0 ? result[0] : null;
  }

  async createFee(fee: Omit<InsertFee, "id">): Promise<any> {
    const result = await db.insert(fees).values(fee).returning();
    
    if (result.length > 0) {
      // Get child details to get parent id
      const child = await this.getChildById(fee.studentId);
      
      if (child) {
        // Create notification for parent
        await this.createNotification({
          userId: child.parentId,
          title: "New Fee Added",
          message: `A new fee of $${fee.amount.toFixed(2)} for ${fee.description} has been added`,
          date: new Date(),
          isRead: false
        });
      }
    }
    
    return result.length > 0 ? result[0] : null;
  }

  async updateFeeStatus(id: number, status: string): Promise<boolean> {
    const updates = status === "paid" ? 
      { status, paidDate: new Date() } : 
      { status };
    
    const result = await db.update(fees)
      .set(updates)
      .where(eq(fees.id, id))
      .returning();
    
    if (result.length > 0 && status === "paid") {
      // Get fee details
      const fee = await this.getFeeById(id);
      
      if (fee) {
        // Create activity record
        await this.createActivity({
          userId: fee.parentId,
          type: "payment",
          title: "Fee payment received",
          description: `Payment of $${fee.amount.toFixed(2)} for ${fee.description} has been received`,
          createdAt: new Date()
        });
      }
    }
    
    return result.length > 0;
  }

  // Attendance methods
  async getAttendanceByDate(date: string): Promise<any[]> {
    const dateObj = new Date(date);
    
    // First get all children who are active
    const allChildren = await db.select({
      studentId: children.id,
      studentName: db.sql`${children.firstName} || ' ' || ${children.lastName}`,
      classId: children.classId,
      className: classes.name,
    })
    .from(children)
    .leftJoin(classes, eq(children.classId, classes.id))
    .where(eq(children.status, "active"));
    
    // Then get attendance records for the given date
    const attendanceRecords = await db.select()
      .from(attendance)
      .where(
        and(
          eq(db.sql`DATE(${attendance.date})`, db.sql`DATE(${dateObj})`),
        )
      );
    
    // Merge the two datasets
    return allChildren.map(child => {
      const record = attendanceRecords.find(r => r.studentId === child.studentId);
      return {
        id: record?.id || 0,
        studentId: child.studentId,
        studentName: child.studentName,
        classId: child.classId,
        className: child.className,
        date: dateObj,
        present: record ? record.present : false,
        notes: record?.notes || "",
      };
    });
  }

  async getAttendanceRecord(studentId: number, date: string): Promise<any> {
    const dateObj = new Date(date);
    const result = await db.select()
      .from(attendance)
      .where(
        and(
          eq(attendance.studentId, studentId),
          eq(db.sql`DATE(${attendance.date})`, db.sql`DATE(${dateObj})`)
        )
      );
    
    return result.length > 0 ? result[0] : null;
  }

  async createAttendanceRecord(record: Omit<InsertAttendance, "id">): Promise<any> {
    const result = await db.insert(attendance).values(record).returning();
    return result.length > 0 ? result[0] : null;
  }

  async updateAttendanceRecord(id: number, present: boolean, notes?: string): Promise<any> {
    const updates = notes !== undefined ? 
      { present, notes } : 
      { present };
    
    const result = await db.update(attendance)
      .set(updates)
      .where(eq(attendance.id, id))
      .returning();
    
    return result.length > 0 ? result[0] : null;
  }

  async updateAttendanceNotes(id: number, notes: string): Promise<boolean> {
    const result = await db.update(attendance)
      .set({ notes })
      .where(eq(attendance.id, id))
      .returning();
    
    return result.length > 0;
  }

  async markAllAttendance(date: string, classId?: string, present: boolean = true): Promise<void> {
    const dateObj = new Date(date);
    
    // Get all active children, optionally filtered by class
    let childrenQuery = db.select({
      id: children.id
    })
    .from(children)
    .where(eq(children.status, "active"));
    
    if (classId) {
      childrenQuery = childrenQuery.where(eq(children.classId, parseInt(classId)));
    }
    
    const childrenToMark = await childrenQuery;
    
    // For each child, check if they already have an attendance record
    for (const child of childrenToMark) {
      const existingRecord = await this.getAttendanceRecord(child.id, date);
      
      if (existingRecord) {
        // Update existing record
        await this.updateAttendanceRecord(existingRecord.id, present);
      } else {
        // Create new record
        await this.createAttendanceRecord({
          studentId: child.id,
          date: dateObj,
          present,
          notes: "",
        });
      }
    }
    
    // Create activity record
    await this.createActivity({
      userId: 1, // Admin user
      type: "attendance",
      title: "Attendance marked for all students",
      description: `Attendance on ${dateObj.toLocaleDateString()} has been marked as ${present ? 'present' : 'absent'} for all students${classId ? ' in a specific class' : ''}`,
      createdAt: new Date()
    });
  }

  // Messages methods
  async getMessagesByUserId(userId: number): Promise<any[]> {
    try {
      const result = await db.query.messages.findMany({
        where: or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        ),
        orderBy: desc(messages.createdAt)
      });
      
      // Get user information for senders and receivers
      const userIds = new Set<number>();
      result.forEach(message => {
        userIds.add(message.senderId);
        userIds.add(message.receiverId);
      });
      
      const userInfoMap = new Map<number, any>();
      const usersInfo = await db.query.users.findMany({
        where: inArray(users.id, Array.from(userIds))
      });
      
      usersInfo.forEach(user => {
        userInfoMap.set(user.id, user);
      });
      
      // Format messages with user info
      return result.map(message => {
        const sender = userInfoMap.get(message.senderId);
        const receiver = userInfoMap.get(message.receiverId);
        
        return {
          id: message.id,
          senderId: message.senderId,
          senderName: sender?.name || 'Unknown',
          senderRole: sender?.role || 'unknown',
          receiverId: message.receiverId,
          receiverName: receiver?.name || 'Unknown',
          subject: message.subject,
          content: message.content,
          status: message.status,
          createdAt: message.createdAt
        };
      });
    } catch (error) {
      console.error("Error fetching messages:", error);
      return [];
    }
  }

  async getMessageById(id: number): Promise<any> {
    try {
      const message = await db.query.messages.findFirst({
        where: eq(messages.id, id)
      });
      
      if (!message) return null;
      
      // Get sender and receiver info
      const sender = await db.query.users.findFirst({
        where: eq(users.id, message.senderId)
      });
      
      const receiver = await db.query.users.findFirst({
        where: eq(users.id, message.receiverId)
      });
      
      return {
        id: message.id,
        senderId: message.senderId,
        senderName: sender?.name || 'Unknown',
        senderRole: sender?.role || 'unknown',
        receiverId: message.receiverId,
        receiverName: receiver?.name || 'Unknown',
        subject: message.subject,
        content: message.content,
        status: message.status,
        createdAt: message.createdAt
      };
    } catch (error) {
      console.error("Error fetching message by ID:", error);
      return null;
    }
  }

  async createMessage(message: Omit<InsertMessage, "id">): Promise<any> {
    const result = await db.insert(messages).values(message).returning();
    
    if (result.length > 0) {
      // Create notification for receiver
      await this.createNotification({
        userId: message.receiverId,
        title: "New Message",
        message: `You have received a new message: ${message.subject}`,
        date: new Date(),
        isRead: false
      });
    }
    
    return result.length > 0 ? result[0] : null;
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    const result = await db.update(messages)
      .set({ status: "read" })
      .where(eq(messages.id, id))
      .returning();
    
    return result.length > 0;
  }

  // Dashboard Stats methods (Admin)
  async getDashboardStats(): Promise<any> {
    try {
      // Get total students
      const studentsResult = await db.query.children.findMany({
        where: eq(children.status, "active")
      });
      const totalStudents = studentsResult.length;
      
      // Get pending applications
      const applicationsResult = await db.query.applications.findMany({
        where: eq(applications.status, "pending")
      });
      const pendingApplications = applicationsResult.length;
      
      // Get attendance for today
      const today = new Date().toISOString().split("T")[0];
      const attendanceResult = await db.query.attendance.findMany({
        where: (
          and(
            eq(attendance.date, today),
            eq(attendance.present, true)
          )
        )
      });
      const attendanceToday = attendanceResult.length;
      
      // Get pending fee payments
      const feesResult = await db.query.fees.findMany({
        where: eq(fees.status, "pending")
      });
      const pendingFees = feesResult.length;
      
      return {
        totalStudents,
        pendingApplications,
        attendanceToday,
        pendingFees
      };
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return {
        totalStudents: 0,
        pendingApplications: 0,
        attendanceToday: 0,
        pendingFees: 0
      };
    }
  }

  async getRecentActivities(): Promise<any[]> {
    return await db.select({
      id: activities.id,
      userId: activities.userId,
      user: users.name,
      type: activities.type,
      title: activities.title,
      description: activities.description,
      date: activities.createdAt,
    })
    .from(activities)
    .leftJoin(users, eq(activities.userId, users.id))
    .orderBy(desc(activities.createdAt))
    .limit(10);
  }

  async createActivity(activity: Omit<InsertActivity, "id">): Promise<any> {
    const result = await db.insert(activities).values(activity).returning();
    return result.length > 0 ? result[0] : null;
  }

  // Notifications methods (Parent)
  async getNotificationsByUserId(userId: number): Promise<any[]> {
    return await db.select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.date))
      .limit(10);
  }

  async createNotification(notification: Omit<InsertNotification, "id">): Promise<any> {
    const result = await db.insert(notifications).values(notification).returning();
    return result.length > 0 ? result[0] : null;
  }

  // Documents methods
  async uploadDocument(document: Omit<InsertDocument, "id">): Promise<any> {
    const result = await db.insert(documents).values(document).returning();
    return result.length > 0 ? result[0] : null;
  }

  async getDocumentsByApplicationId(applicationId: number): Promise<any[]> {
    return await db.select()
      .from(documents)
      .where(
        and(
          eq(documents.applicationType, "application"),
          eq(documents.applicationId, applicationId)
        )
      );
  }

  async getDocumentsByChildId(childId: number): Promise<any[]> {
    return await db.select()
      .from(documents)
      .where(
        and(
          eq(documents.applicationType, "child"),
          eq(documents.applicationId, childId)
        )
      );
  }
  
  // Teacher methods
  async getAllTeachers(): Promise<any[]> {
    return await db.select({
      id: teachers.id,
      name: teachers.name,
      email: teachers.email,
      phone: teachers.phone,
      qualification: teachers.qualification,
      classId: teachers.classId,
      className: classes.name,
      status: teachers.status,
      hireDate: teachers.hireDate,
      createdAt: teachers.createdAt
    })
    .from(teachers)
    .leftJoin(classes, eq(teachers.classId, classes.id))
    .orderBy(asc(teachers.name));
  }

  async getTeacherById(id: number): Promise<any> {
    const result = await db.select({
      id: teachers.id,
      name: teachers.name,
      email: teachers.email,
      phone: teachers.phone,
      qualification: teachers.qualification,
      classId: teachers.classId,
      className: classes.name,
      status: teachers.status,
      hireDate: teachers.hireDate,
      createdAt: teachers.createdAt
    })
    .from(teachers)
    .leftJoin(classes, eq(teachers.classId, classes.id))
    .where(eq(teachers.id, id));
    
    return result.length > 0 ? result[0] : null;
  }

  async getTeachersByClassId(classId: number): Promise<any[]> {
    return await db.select()
      .from(teachers)
      .where(eq(teachers.classId, classId));
  }

  async createTeacher(teacher: Omit<InsertTeacher, "id">): Promise<any> {
    const result = await db.insert(teachers).values(teacher).returning();
    
    if (result.length > 0) {
      // Create activity record
      await this.createActivity({
        userId: 1, // Admin ID
        type: "staff",
        title: "New teacher hired",
        description: `${teacher.name} has been hired as a teacher`,
        createdAt: new Date()
      });
    }
    
    return result.length > 0 ? result[0] : null;
  }

  async updateTeacherStatus(id: number, status: string): Promise<boolean> {
    const result = await db.update(teachers)
      .set({ status })
      .where(eq(teachers.id, id))
      .returning();
    
    return result.length > 0;
  }

  async updateTeacherClass(id: number, classId: number): Promise<boolean> {
    const result = await db.update(teachers)
      .set({ classId })
      .where(eq(teachers.id, id))
      .returning();
    
    return result.length > 0;
  }
  
  // Announcement methods
  async getAllAnnouncements(): Promise<any[]> {
    return await db.select({
      id: announcements.id,
      title: announcements.title,
      content: announcements.content,
      authorId: announcements.authorId,
      authorName: users.name,
      targetAudience: announcements.targetAudience,
      publishDate: announcements.publishDate,
      expiryDate: announcements.expiryDate,
      status: announcements.status,
      createdAt: announcements.createdAt
    })
    .from(announcements)
    .leftJoin(users, eq(announcements.authorId, users.id))
    .orderBy(desc(announcements.publishDate));
  }

  async getAnnouncementById(id: number): Promise<any> {
    const result = await db.select({
      id: announcements.id,
      title: announcements.title,
      content: announcements.content,
      authorId: announcements.authorId,
      authorName: users.name,
      targetAudience: announcements.targetAudience,
      publishDate: announcements.publishDate,
      expiryDate: announcements.expiryDate,
      status: announcements.status,
      createdAt: announcements.createdAt
    })
    .from(announcements)
    .leftJoin(users, eq(announcements.authorId, users.id))
    .where(eq(announcements.id, id));
    
    return result.length > 0 ? result[0] : null;
  }

  async getAnnouncementsByAuthorId(authorId: number): Promise<any[]> {
    return await db.select()
      .from(announcements)
      .where(eq(announcements.authorId, authorId))
      .orderBy(desc(announcements.publishDate));
  }

  async getActiveAnnouncements(targetAudience?: string): Promise<any[]> {
    const now = new Date();
    
    let query = db.select({
      id: announcements.id,
      title: announcements.title,
      content: announcements.content,
      authorId: announcements.authorId,
      authorName: users.name,
      targetAudience: announcements.targetAudience,
      publishDate: announcements.publishDate,
      expiryDate: announcements.expiryDate,
      status: announcements.status,
      createdAt: announcements.createdAt
    })
    .from(announcements)
    .leftJoin(users, eq(announcements.authorId, users.id))
    .where(eq(announcements.status, 'active'));
    
    // If target audience is specified, filter by it
    if (targetAudience) {
      query = query.where(or(
        eq(announcements.targetAudience, targetAudience),
        eq(announcements.targetAudience, 'all')
      ));
    }
    
    return await query.orderBy(desc(announcements.publishDate));
  }

  async createAnnouncement(announcement: Omit<InsertAnnouncement, "id">): Promise<any> {
    const result = await db.insert(announcements).values(announcement).returning();
    
    if (result.length > 0) {
      // Create activity record
      await this.createActivity({
        userId: announcement.authorId,
        type: "announcement",
        title: "New announcement published",
        description: announcement.title,
        createdAt: new Date()
      });
      
      // Create notifications for relevant users based on target audience
      const targetAudience = announcement.targetAudience || 'all';
      let usersToNotify: any[] = [];
      
      if (targetAudience === 'all' || targetAudience === 'parents') {
        // Get all parent users
        const parents = await db.select()
          .from(users)
          .where(eq(users.role, 'parent'));
        
        usersToNotify = [...usersToNotify, ...parents];
      }
      
      // Send notifications to all relevant users
      for (const user of usersToNotify) {
        await this.createNotification({
          userId: user.id,
          title: "New Announcement",
          message: announcement.title,
          date: new Date(),
          isRead: false
        });
      }
    }
    
    return result.length > 0 ? result[0] : null;
  }

  async updateAnnouncementStatus(id: number, status: string): Promise<boolean> {
    const result = await db.update(announcements)
      .set({ status })
      .where(eq(announcements.id, id))
      .returning();
    
    return result.length > 0;
  }
}

// Create an instance of the storage interface
export const storage = new DatabaseStorage();
