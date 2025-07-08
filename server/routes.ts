import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertStudentSchema, insertPaymentSchema, insertAttendanceSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);

  // WebSocket server for real-time updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  wss.on('connection', (ws) => {
    console.log('Client connected to WebSocket');
    
    ws.on('message', (message) => {
      console.log('Received:', message.toString());
    });
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  // Broadcast function for real-time updates
  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  // Dashboard endpoints
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/revenue-chart", async (req, res) => {
    try {
      const year = parseInt(req.query.year as string) || new Date().getFullYear();
      const revenue = await storage.getMonthlyRevenueReport(year);
      res.json(revenue);
    } catch (error) {
      console.error("Error fetching revenue chart:", error);
      res.status(500).json({ message: "Failed to fetch revenue chart" });
    }
  });

  // Student endpoints
  app.get("/api/students", async (req, res) => {
    try {
      const filters = {
        sportId: req.query.sportId ? parseInt(req.query.sportId as string) : undefined,
        batchId: req.query.batchId ? parseInt(req.query.batchId as string) : undefined,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined,
        search: req.query.search as string,
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0
      };

      const result = await storage.getStudents(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ message: "Failed to fetch students" });
    }
  });

  app.get("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const student = await storage.getStudent(id);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ message: "Failed to fetch student" });
    }
  });

  app.post("/api/students", async (req, res) => {
    try {
      const studentData = insertStudentSchema.parse(req.body);
      
      // Generate student ID
      const studentCount = await storage.getStudents({ limit: 1 });
      const studentId = `STU${String(studentCount.total + 1).padStart(3, '0')}`;
      
      const student = await storage.createStudent({
        ...studentData,
        studentId
      });

      // Update batch capacity
      if (student.batchId) {
        await storage.updateBatchCapacity(student.batchId, 1);
      }

      // Create activity
      await storage.createActivity({
        type: 'student_enrolled',
        description: `New student enrolled: ${student.name}`,
        userId: 1, // TODO: Get from authenticated user
        entityId: student.id,
        entityType: 'student'
      });

      // Broadcast update
      broadcast({
        type: 'student_enrolled',
        student
      });

      res.status(201).json(student);
    } catch (error) {
      console.error("Error creating student:", error);
      res.status(400).json({ message: "Failed to create student" });
    }
  });

  app.put("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const student = await storage.updateStudent(id, updates);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStudent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      res.json({ message: "Student deleted successfully" });
    } catch (error) {
      console.error("Error deleting student:", error);
      res.status(500).json({ message: "Failed to delete student" });
    }
  });

  // Payment endpoints
  app.get("/api/payments", async (req, res) => {
    try {
      const filters = {
        studentId: req.query.studentId ? parseInt(req.query.studentId as string) : undefined,
        status: req.query.status as string,
        monthYear: req.query.monthYear as string,
        limit: parseInt(req.query.limit as string) || 50,
        offset: parseInt(req.query.offset as string) || 0
      };

      const result = await storage.getPayments(filters);
      res.json(result);
    } catch (error) {
      console.error("Error fetching payments:", error);
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      
      // Generate receipt number
      const receiptNumber = `RCP${Date.now()}`;
      
      const payment = await storage.createPayment({
        ...paymentData,
        receiptNumber,
        paymentDate: new Date(),
        status: 'completed'
      });

      // Create activity
      await storage.createActivity({
        type: 'payment_received',
        description: `Payment received: ₹${payment.amount}`,
        userId: 1, // TODO: Get from authenticated user
        entityId: payment.id,
        entityType: 'payment'
      });

      // Broadcast update
      broadcast({
        type: 'payment_received',
        payment
      });

      res.status(201).json(payment);
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(400).json({ message: "Failed to create payment" });
    }
  });

  app.get("/api/payments/pending", async (req, res) => {
    try {
      const pendingPayments = await storage.getPendingPayments();
      res.json(pendingPayments);
    } catch (error) {
      console.error("Error fetching pending payments:", error);
      res.status(500).json({ message: "Failed to fetch pending payments" });
    }
  });

  app.get("/api/payments/revenue-stats", async (req, res) => {
    try {
      const stats = await storage.getRevenueStats();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching revenue stats:", error);
      res.status(500).json({ message: "Failed to fetch revenue stats" });
    }
  });

  // Attendance endpoints
  app.get("/api/attendance", async (req, res) => {
    try {
      const date = req.query.date as string;
      const batchId = req.query.batchId ? parseInt(req.query.batchId as string) : undefined;
      
      const attendance = await storage.getAttendanceByDate(date, batchId);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching attendance:", error);
      res.status(500).json({ message: "Failed to fetch attendance" });
    }
  });

  app.post("/api/attendance", async (req, res) => {
    try {
      const attendanceData = insertAttendanceSchema.parse(req.body);
      
      const attendance = await storage.markAttendance({
        ...attendanceData,
        markedBy: 1 // TODO: Get from authenticated user
      });

      // Create activity
      await storage.createActivity({
        type: 'attendance_marked',
        description: `Attendance marked for ${attendanceData.date}`,
        userId: 1, // TODO: Get from authenticated user
        entityId: attendance.id,
        entityType: 'attendance'
      });

      // Broadcast update
      broadcast({
        type: 'attendance_marked',
        attendance
      });

      res.status(201).json(attendance);
    } catch (error) {
      console.error("Error marking attendance:", error);
      res.status(400).json({ message: "Failed to mark attendance" });
    }
  });

  app.get("/api/attendance/student/:studentId", async (req, res) => {
    try {
      const studentId = parseInt(req.params.studentId);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      const attendance = await storage.getStudentAttendance(studentId, startDate, endDate);
      res.json(attendance);
    } catch (error) {
      console.error("Error fetching student attendance:", error);
      res.status(500).json({ message: "Failed to fetch student attendance" });
    }
  });

  app.get("/api/attendance/stats", async (req, res) => {
    try {
      const batchId = req.query.batchId ? parseInt(req.query.batchId as string) : undefined;
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      
      const stats = await storage.getAttendanceStats(batchId, date);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching attendance stats:", error);
      res.status(500).json({ message: "Failed to fetch attendance stats" });
    }
  });

  // Sports endpoints
  app.get("/api/sports", async (req, res) => {
    try {
      const isActive = req.query.isActive ? req.query.isActive === 'true' : undefined;
      const sports = await storage.getSports(isActive);
      res.json(sports);
    } catch (error) {
      console.error("Error fetching sports:", error);
      res.status(500).json({ message: "Failed to fetch sports" });
    }
  });

  // Batches endpoints
  app.get("/api/batches", async (req, res) => {
    try {
      const filters = {
        sportId: req.query.sportId ? parseInt(req.query.sportId as string) : undefined,
        coachId: req.query.coachId ? parseInt(req.query.coachId as string) : undefined,
        isActive: req.query.isActive ? req.query.isActive === 'true' : undefined
      };

      const batches = await storage.getBatches(filters);
      res.json(batches);
    } catch (error) {
      console.error("Error fetching batches:", error);
      res.status(500).json({ message: "Failed to fetch batches" });
    }
  });

  // Activities endpoints
  app.get("/api/activities", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      
      const result = await storage.getActivities(limit, offset);
      res.json(result);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Reports endpoints
  app.get("/api/reports/students", async (req, res) => {
    try {
      const filters = {
        sportId: req.query.sportId ? parseInt(req.query.sportId as string) : undefined,
        batchId: req.query.batchId ? parseInt(req.query.batchId as string) : undefined,
        feeStatus: req.query.feeStatus as string
      };

      const students = await storage.getStudentReport(filters);
      res.json(students);
    } catch (error) {
      console.error("Error fetching student report:", error);
      res.status(500).json({ message: "Failed to fetch student report" });
    }
  });

  app.get("/api/reports/attendance", async (req, res) => {
    try {
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      const batchId = req.query.batchId ? parseInt(req.query.batchId as string) : undefined;
      
      const report = await storage.getAttendanceReport(startDate, endDate, batchId);
      res.json(report);
    } catch (error) {
      console.error("Error fetching attendance report:", error);
      res.status(500).json({ message: "Failed to fetch attendance report" });
    }
  });

  return httpServer;
}
