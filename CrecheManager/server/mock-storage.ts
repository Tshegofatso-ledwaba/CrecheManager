import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

// Mock user data
const mockUsers = [
  {
    id: 1,
    name: "Admin User",
    email: "admin@littlestars.co.za",
    password: "06c21253e144164262ee9bf48e642d175799e450c21246cc03ff4f0f4a9689bb5e446370fd2a626e0cbe403e89cc3a121624c5b6d5e18739829b4c8cc140e160.de3cab0cd87825404c1ad36060748390", // @Admin123
    phone: "+27 12 555 1234",
    role: "admin",
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    name: "Sarah Johnson",
    email: "parent@example.com",
    password: "7193667f834e48b5f687ab9000d8bca93e1f25f4b3f9b78f79a5cd37e68d8a5532d9bc46d6ca0dfd3d74f28452e3a7a0dd787839b606a6e2c8737b2eeaf43e8a.d173e075d15f5116", // password123
    phone: "+27 82 555 1234",
    role: "parent",
    createdAt: new Date().toISOString()
  }
];

// Mock children data
const mockChildren = [
  {
    id: 1,
    firstName: "Emma",
    lastName: "Johnson",
    dob: "2020-05-15",
    gender: "female",
    age: 3,
    parentId: 2,
    classId: 3,
    status: "active",
    enrollmentDate: "2022-09-01",
    allergies: "Peanuts",
    medicalConditions: "None"
  },
  {
    id: 2,
    firstName: "Noah",
    lastName: "Johnson",
    dob: "2021-03-10",
    gender: "male",
    age: 2,
    parentId: 2,
    classId: 2,
    status: "active",
    enrollmentDate: "2022-09-15"
  }
];

// Mock classes data
const mockClasses = [
  {
    id: 1,
    name: "Infant Group",
    description: "For babies between 3 months and 1 year",
    ageRange: "3-12 months",
    capacity: 10,
  },
  {
    id: 2,
    name: "Toddler Group",
    description: "For children between 1 and 2 years",
    ageRange: "1-2 years",
    capacity: 15,
  },
  {
    id: 3,
    name: "Preschool I",
    description: "For children between 2 and 3 years",
    ageRange: "2-3 years",
    capacity: 20,
  },
  {
    id: 4,
    name: "Preschool II",
    description: "For children between 3 and 5 years",
    ageRange: "3-5 years",
    capacity: 25,
  }
];

// Mock applications data
const mockApplications = [
  {
    id: 1,
    childFirstName: "Sophia",
    childLastName: "Lee",
    childDob: "2021-11-05",
    childGender: "female",
    childAge: 1,
    parentId: 2,
    allergies: "None",
    medicalConditions: "None",
    emergencyName: "David Lee",
    emergencyRelationship: "Father",
    emergencyPhone: "+27 71 222 3344",
    emergencyEmail: "david@example.com",
    status: "pending",
    appliedDate: "2023-06-15"
  }
];

// Mock fees data
const mockFees = [
  {
    id: 1,
    studentId: 1,
    amount: 2500.00,
    description: "Monthly tuition fee - Current Month",
    dueDate: "2023-06-15",
    status: "pending"
  },
  {
    id: 2,
    studentId: 1,
    amount: 2500.00,
    description: "Monthly tuition fee - Previous Month",
    dueDate: "2023-05-15",
    status: "paid",
    paidDate: "2023-05-10"
  }
];

// Attendance records
const mockAttendance: any[] = [];

// Mock messages data
const mockMessages = [
  {
    id: 1,
    senderId: 1,
    receiverId: 2,
    subject: "Welcome to our Creche",
    content: "Dear Sarah, \n\nWelcome to our creche. We're excited to have Emma and Noah join us. Please feel free to reach out if you have any questions.\n\nBest regards,\nAdmin Team",
    status: "read",
    createdAt: "2023-06-01"
  },
  {
    id: 2,
    senderId: 2,
    receiverId: 1,
    subject: "Question about allergies",
    content: "Hello,\n\nI'm wondering how you handle food allergies at the creche. Emma is allergic to peanuts and I want to make sure she's safe.\n\nThanks,\nSarah",
    status: "read",
    createdAt: "2023-06-05"
  }
];

// Mock notifications
const mockNotifications = [
  {
    id: 1,
    userId: 2,
    title: "Fee Payment Reminder",
    message: "Monthly fee payment due in 5 days",
    date: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isRead: false
  },
  {
    id: 2,
    userId: 2,
    title: "New Message",
    message: "Admin has sent you a new message",
    date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    isRead: false
  }
];

// Mock activities
const mockActivities = [
  {
    id: 1,
    userId: 2,
    type: "application",
    title: "New application submitted",
    description: "Sarah Johnson has submitted a new application",
    createdAt: new Date(Date.now()).toISOString()
  },
  {
    id: 2,
    userId: 2,
    type: "payment",
    title: "Monthly fee payment received",
    description: "Payment of R2,500.00 for Emma Johnson's tuition has been received",
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

// Mock teachers data
const mockTeachers = [
  {
    id: 1,
    name: "Jennifer Smith",
    email: "jennifer@littlestars.co.za",
    phone: "+27 83 111 2222",
    qualifications: "Early Childhood Development Certificate",
    bio: "5 years of experience in early childhood education",
    status: "active",
    classId: 3,
    joinDate: "2021-01-15"
  },
  {
    id: 2,
    name: "Michael Brown",
    email: "michael@littlestars.co.za",
    phone: "+27 84 333 4444",
    qualifications: "Bachelor of Education",
    bio: "8 years of experience with preschool children",
    status: "active",
    classId: 4,
    joinDate: "2020-03-10"
  }
];

// Mock announcements
const mockAnnouncements = [
  {
    id: 1,
    title: "End of Year Concert",
    content: "We're excited to announce our end of year concert will be held on December 10th at 3PM.",
    authorId: 1,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    targetAudience: "all"
  },
  {
    id: 2,
    title: "Payment System Update",
    content: "We've updated our payment system. You can now pay fees online through our portal.",
    authorId: 1,
    date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    targetAudience: "parents"
  }
];

// Mock storage implementation
export class MockStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new session.MemoryStore();
  }

  // User methods
  async getUserByEmail(email: string): Promise<any> {
    const user = mockUsers.find(u => u.email === email);
    return user || null;
  }

  async getUserByUsername(username: string): Promise<any> {
    // Since there's no username field, we'll use email instead
    return this.getUserByEmail(username);
  }

  async getUser(id: number): Promise<any> {
    const user = mockUsers.find(u => u.id === id);
    return user || null;
  }

  async createUser(user: any): Promise<any> {
    const newId = mockUsers.length + 1;
    const newUser = { 
      id: newId, 
      ...user,
      createdAt: new Date().toISOString()
    };
    mockUsers.push(newUser);
    return newUser;
  }

  // Applications methods
  async getAllApplications(): Promise<any[]> {
    return mockApplications;
  }

  async getApplicationsByParentId(parentId: number): Promise<any[]> {
    return mockApplications.filter(a => a.parentId === parentId);
  }

  async getApplicationById(id: number): Promise<any> {
    return mockApplications.find(a => a.id === id) || null;
  }

  async createApplication(application: any): Promise<any> {
    const newId = mockApplications.length + 1;
    const newApplication = { id: newId, ...application };
    mockApplications.push(newApplication);
    return newApplication;
  }

  async updateApplicationStatus(id: number, status: string): Promise<boolean> {
    const application = mockApplications.find(a => a.id === id);
    if (application) {
      application.status = status;
      return true;
    }
    return false;
  }

  // Children methods
  async getAllChildren(): Promise<any[]> {
    return mockChildren;
  }

  async getChildrenByParentId(parentId: number): Promise<any[]> {
    return mockChildren.filter(c => c.parentId === parentId);
  }

  async getChildById(id: number): Promise<any> {
    return mockChildren.find(c => c.id === id) || null;
  }

  async createChild(child: any): Promise<any> {
    const newId = mockChildren.length + 1;
    const newChild = { id: newId, ...child };
    mockChildren.push(newChild);
    return newChild;
  }

  // Classes methods
  async getAllClasses(): Promise<any[]> {
    return mockClasses;
  }

  async getClassById(id: number): Promise<any> {
    return mockClasses.find(c => c.id === id) || null;
  }

  async createClass(cls: any): Promise<any> {
    const newId = mockClasses.length + 1;
    const newClass = { id: newId, ...cls };
    mockClasses.push(newClass);
    return newClass;
  }

  // Students methods (Children with class assignments)
  async getAllStudents(): Promise<any[]> {
    return mockChildren;
  }

  async getStudentById(id: number): Promise<any> {
    return mockChildren.find(c => c.id === id) || null;
  }

  async updateStudentClass(id: number, classId: string): Promise<boolean> {
    const child = mockChildren.find(c => c.id === id);
    if (child) {
      child.classId = parseInt(classId);
      return true;
    }
    return false;
  }

  // Fees methods
  async getAllFees(): Promise<any[]> {
    return mockFees;
  }

  async getFeesByParentId(parentId: number): Promise<any[]> {
    // Get all children for this parent
    const childrenIds = mockChildren
      .filter(c => c.parentId === parentId)
      .map(c => c.id);
    
    // Return fees for these children
    return mockFees.filter(f => childrenIds.includes(f.studentId));
  }

  async getFeeById(id: number): Promise<any> {
    return mockFees.find(f => f.id === id) || null;
  }

  async createFee(fee: any): Promise<any> {
    const newId = mockFees.length + 1;
    const newFee = { id: newId, ...fee };
    mockFees.push(newFee);
    return newFee;
  }

  async updateFeeStatus(id: number, status: string): Promise<boolean> {
    const fee = mockFees.find(f => f.id === id);
    if (fee) {
      fee.status = status;
      if (status === 'paid') {
        fee.paidDate = new Date().toISOString();
      }
      return true;
    }
    return false;
  }

  // Messages methods
  async getMessagesByUserId(userId: number): Promise<any[]> {
    return mockMessages.filter(m => m.senderId === userId || m.receiverId === userId);
  }

  async getMessageById(id: number): Promise<any> {
    return mockMessages.find(m => m.id === id) || null;
  }

  async createMessage(message: any): Promise<any> {
    const newId = mockMessages.length + 1;
    const newMessage = { 
      id: newId, 
      ...message,
      createdAt: new Date().toISOString()
    };
    mockMessages.push(newMessage);
    return newMessage;
  }

  async markMessageAsRead(id: number): Promise<boolean> {
    const message = mockMessages.find(m => m.id === id);
    if (message) {
      message.status = 'read';
      return true;
    }
    return false;
  }

  // Dashboard stats
  async getDashboardStats(): Promise<any> {
    return {
      totalStudents: mockChildren.length,
      totalParents: mockUsers.filter(u => u.role === 'parent').length,
      totalTeachers: mockTeachers.length,
      totalApplications: mockApplications.length,
      pendingApplications: mockApplications.filter(a => a.status === 'pending').length,
      pendingFees: mockFees.filter(f => f.status === 'pending').length,
      classCapacity: {
        infants: {
          current: mockChildren.filter(c => c.classId === 1).length,
          total: mockClasses.find(c => c.id === 1)?.capacity || 0
        },
        toddlers: {
          current: mockChildren.filter(c => c.classId === 2).length,
          total: mockClasses.find(c => c.id === 2)?.capacity || 0
        },
        preschool1: {
          current: mockChildren.filter(c => c.classId === 3).length,
          total: mockClasses.find(c => c.id === 3)?.capacity || 0
        },
        preschool2: {
          current: mockChildren.filter(c => c.classId === 4).length,
          total: mockClasses.find(c => c.id === 4)?.capacity || 0
        }
      }
    };
  }

  async getRecentActivities(): Promise<any[]> {
    return mockActivities.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 5);
  }

  // Notifications
  async getNotificationsByUserId(userId: number): Promise<any[]> {
    return mockNotifications.filter(n => n.userId === userId);
  }

  async createNotification(notification: any): Promise<any> {
    const newId = mockNotifications.length + 1;
    const newNotification = { 
      id: newId, 
      ...notification,
      date: new Date().toISOString()
    };
    mockNotifications.push(newNotification);
    return newNotification;
  }

  // Teachers
  async getAllTeachers(): Promise<any[]> {
    return mockTeachers;
  }

  async getTeacherById(id: number): Promise<any> {
    return mockTeachers.find(t => t.id === id) || null;
  }

  async getTeachersByClassId(classId: number): Promise<any[]> {
    return mockTeachers.filter(t => t.classId === classId);
  }

  async createTeacher(teacher: any): Promise<any> {
    const newId = mockTeachers.length + 1;
    const newTeacher = { 
      id: newId, 
      ...teacher,
      joinDate: new Date().toISOString()
    };
    mockTeachers.push(newTeacher);
    return newTeacher;
  }

  async updateTeacherStatus(id: number, status: string): Promise<boolean> {
    const teacher = mockTeachers.find(t => t.id === id);
    if (teacher) {
      teacher.status = status;
      return true;
    }
    return false;
  }

  async updateTeacherClass(id: number, classId: number): Promise<boolean> {
    const teacher = mockTeachers.find(t => t.id === id);
    if (teacher) {
      teacher.classId = classId;
      return true;
    }
    return false;
  }

  // Announcements
  async getAllAnnouncements(): Promise<any[]> {
    return mockAnnouncements;
  }

  async getAnnouncementById(id: number): Promise<any> {
    return mockAnnouncements.find(a => a.id === id) || null;
  }

  async getAnnouncementsByAuthorId(authorId: number): Promise<any[]> {
    return mockAnnouncements.filter(a => a.authorId === authorId);
  }

  async getActiveAnnouncements(targetAudience?: string): Promise<any[]> {
    let announcements = mockAnnouncements.filter(a => a.status === 'active');
    
    if (targetAudience && targetAudience !== 'all') {
      announcements = announcements.filter(a => 
        a.targetAudience === targetAudience || a.targetAudience === 'all'
      );
    }
    
    return announcements;
  }

  async createAnnouncement(announcement: any): Promise<any> {
    const newId = mockAnnouncements.length + 1;
    const newAnnouncement = { 
      id: newId, 
      ...announcement,
      date: new Date().toISOString()
    };
    mockAnnouncements.push(newAnnouncement);
    return newAnnouncement;
  }

  async updateAnnouncementStatus(id: number, status: string): Promise<boolean> {
    const announcement = mockAnnouncements.find(a => a.id === id);
    if (announcement) {
      announcement.status = status;
      return true;
    }
    return false;
  }

  // Attendance methods
  async getAttendanceByDate(date: string): Promise<any[]> {
    return mockAttendance;
  }

  async getAttendanceRecord(studentId: number, date: string): Promise<any> {
    return null;
  }

  async createAttendanceRecord(record: any): Promise<any> {
    const newId = mockAttendance.length + 1;
    const newRecord = { id: newId, ...record };
    mockAttendance.push(newRecord);
    return newRecord;
  }

  async updateAttendanceRecord(id: number, present: boolean, notes?: string): Promise<any> {
    return null;
  }

  async updateAttendanceNotes(id: number, notes: string): Promise<boolean> {
    return false;
  }

  async markAllAttendance(date: string, classId?: string, present: boolean = true): Promise<void> {
    // This would be implemented in a real system
  }

  // Documents methods (placeholders)
  async uploadDocument(document: any): Promise<any> {
    return { id: 1, ...document };
  }

  async getDocumentsByApplicationId(applicationId: number): Promise<any[]> {
    return [];
  }

  async getDocumentsByChildId(childId: number): Promise<any[]> {
    return [];
  }

  // Activities
  async createActivity(activity: any): Promise<any> {
    const newId = mockActivities.length + 1;
    const newActivity = { 
      id: newId, 
      ...activity,
      createdAt: new Date().toISOString()
    };
    mockActivities.push(newActivity);
    return newActivity;
  }
}

export const storage = new MockStorage();

// Password utilities
const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}