import { db } from "./index";
import * as schema from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seed() {
  try {
    // Check if we already have users
    const existingUsers = await db.select().from(schema.users);
    if (existingUsers.length > 0) {
      console.log("Database already seeded. Skipping...");
      return;
    }

    // Create admin user
    const adminUser = await db.insert(schema.users).values({
      name: "Admin User",
      email: "admin@littlestars.co.za",
      password: await hashPassword("@Admin123"),
      phone: "+27 12 555 1234",
      role: "admin",
    }).returning();

    console.log("Created admin user successfully");

    // Create parent users
    const parentUsers = await db.insert(schema.users).values([
      {
        name: "Sarah Johnson",
        email: "parent@example.com",
        password: await hashPassword("password123"),
        phone: "+27 82 555 1234",
        role: "parent",
      },
      {
        name: "Michael Parker",
        email: "michael@example.com",
        password: await hashPassword("password123"),
        phone: "+27 83 444 5678",
        role: "parent",
      },
      {
        name: "Jennifer Lee",
        email: "jennifer@example.com",
        password: await hashPassword("password123"),
        phone: "+27 71 333 9876",
        role: "parent",
      }
    ]).returning();

    console.log(`Created ${parentUsers.length} parent users`);

    // Create classes
    const classes = await db.insert(schema.classes).values([
      {
        name: "Infant Group",
        description: "For babies between 3 months and 1 year",
        ageRange: "3-12 months",
        capacity: 10,
      },
      {
        name: "Toddler Group",
        description: "For children between 1 and 2 years",
        ageRange: "1-2 years",
        capacity: 15,
      },
      {
        name: "Preschool I",
        description: "For children between 2 and 3 years",
        ageRange: "2-3 years",
        capacity: 20,
      },
      {
        name: "Preschool II",
        description: "For children between 3 and 5 years",
        ageRange: "3-5 years",
        capacity: 25,
      }
    ]).returning();

    console.log(`Created ${classes.length} classes`);

    // Create some children
    const children = await db.insert(schema.children).values([
      {
        firstName: "Emma",
        lastName: "Johnson",
        dob: new Date("2020-05-15"),
        gender: "female",
        age: 3,
        parentId: parentUsers[0].id,
        classId: classes[2].id,
        status: "active",
        enrollmentDate: new Date("2022-09-01"),
        allergies: "Peanuts",
        medicalConditions: "None",
      },
      {
        firstName: "Noah",
        lastName: "Johnson",
        dob: new Date("2021-03-10"),
        gender: "male",
        age: 2,
        parentId: parentUsers[0].id,
        classId: classes[1].id,
        status: "active",
        enrollmentDate: new Date("2022-09-15"),
      },
      {
        firstName: "Olivia",
        lastName: "Parker",
        dob: new Date("2020-07-22"),
        gender: "female",
        age: 3,
        parentId: parentUsers[1].id,
        classId: classes[2].id,
        status: "active",
        enrollmentDate: new Date("2022-08-01"),
      }
    ]).returning();

    console.log(`Created ${children.length} children`);

    // Create some applications
    const applications = await db.insert(schema.applications).values([
      {
        childFirstName: "Sophia",
        childLastName: "Lee",
        childDob: new Date("2021-11-05"),
        childGender: "female",
        childAge: 1,
        parentId: parentUsers[2].id,
        allergies: "None",
        medicalConditions: "None",
        emergencyName: "David Lee",
        emergencyRelationship: "Father",
        emergencyPhone: "+27 71 222 3344",
        emergencyEmail: "david@example.com",
        status: "pending",
        appliedDate: new Date("2023-06-15"),
      },
      {
        childFirstName: "Liam",
        childLastName: "Parker",
        childDob: new Date("2022-01-18"),
        childGender: "male",
        childAge: 1,
        parentId: parentUsers[1].id,
        allergies: "Milk",
        medicalConditions: "Eczema",
        emergencyName: "Jessica Parker",
        emergencyRelationship: "Mother",
        emergencyPhone: "+27 83 456 7890",
        emergencyEmail: "jessica@example.com",
        status: "pending",
        appliedDate: new Date("2023-06-20"),
      },
    ]).returning();

    console.log(`Created ${applications.length} applications`);

    // Create fees
    const fees = await db.insert(schema.fees).values([
      {
        studentId: children[0].id,
        amount: 2500.00,
        description: "Monthly tuition fee - June 2023",
        dueDate: new Date("2023-06-15"),
        status: "paid",
        paidDate: new Date("2023-06-10"),
      },
      {
        studentId: children[0].id,
        amount: 2500.00,
        description: "Monthly tuition fee - July 2023",
        dueDate: new Date("2023-07-15"),
        status: "pending",
      },
      {
        studentId: children[1].id,
        amount: 2100.00,
        description: "Monthly tuition fee - June 2023",
        dueDate: new Date("2023-06-15"),
        status: "paid",
        paidDate: new Date("2023-06-12"),
      },
      {
        studentId: children[2].id,
        amount: 2500.00,
        description: "Monthly tuition fee - June 2023",
        dueDate: new Date("2023-06-15"),
        status: "overdue",
      },
    ]).returning();

    console.log(`Created ${fees.length} fee records`);

    // Create messages
    const messages = await db.insert(schema.messages).values([
      {
        senderId: adminUser[0].id,
        receiverId: parentUsers[0].id,
        subject: "Welcome to our Creche",
        content: "Dear Sarah, \n\nWelcome to our creche. We're excited to have Emma and Noah join us. Please feel free to reach out if you have any questions.\n\nBest regards,\nAdmin Team",
        status: "read",
        createdAt: new Date("2023-06-01"),
      },
      {
        senderId: parentUsers[0].id,
        receiverId: adminUser[0].id,
        subject: "Question about allergies",
        content: "Hello,\n\nI'm wondering how you handle food allergies at the creche. Emma is allergic to peanuts and I want to make sure she's safe.\n\nThanks,\nSarah",
        status: "read",
        createdAt: new Date("2023-06-05"),
      },
      {
        senderId: adminUser[0].id,
        receiverId: parentUsers[0].id,
        subject: "RE: Question about allergies",
        content: "Dear Sarah,\n\nWe take allergies very seriously. We have a no-peanut policy and all staff are trained to handle allergic reactions. We'll make sure Emma is safe.\n\nBest regards,\nAdmin Team",
        status: "unread",
        createdAt: new Date("2023-06-06"),
      },
    ]).returning();

    console.log(`Created ${messages.length} messages`);

    // Create notifications
    const notifications = await db.insert(schema.notifications).values([
      {
        userId: parentUsers[0].id,
        title: "Fee Payment Reminder",
        message: "Monthly fee payment due in 5 days",
        date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isRead: false,
      },
      {
        userId: parentUsers[0].id,
        title: "New Message",
        message: "Admin has sent you a new message",
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isRead: false,
      },
      {
        userId: parentUsers[0].id,
        title: "Application Status Updated",
        message: "Your application for Noah has been approved",
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        isRead: true,
      },
    ]).returning();

    console.log(`Created ${notifications.length} notifications`);

    // Create activities
    const activities = await db.insert(schema.activities).values([
      {
        userId: parentUsers[1].id,
        type: "application",
        title: "New application submitted for Noah Johnson",
        description: "Sarah Johnson has submitted a new application for Noah Johnson",
        createdAt: new Date(Date.now()),
      },
      {
        userId: parentUsers[0].id,
        type: "payment",
        title: "Monthly fee payment received",
        description: "Payment of R2,500.00 for Emma Johnson's June tuition has been received",
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        userId: adminUser[0].id,
        type: "attendance",
        title: "Attendance marked for all students",
        description: "Attendance has been marked for all students",
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    ]).returning();

    console.log(`Created ${activities.length} activities`);

    console.log("Database seeding completed successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

seed();
