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

      // Create the one-time registration fee payment record
      const currentDate = new Date();
      const registrationPayment = {
        studentId: student.id,
        amount: 300, // ₹300 one-time registration fee
        method: "pending",
        status: "pending",
        monthYear: `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`,
        description: "One-time registration fee",
        type: "registration",
        dueDate: currentDate,
      };
      
      await storage.createPayment(registrationPayment);

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

  // Settings routes
  app.get('/api/settings', async (req, res) => {
    try {
      const settings = await storage.getSettings();
      const settingsMap = settings.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {} as Record<string, any>);
      res.json(settingsMap);
    } catch (error) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: 'Failed to fetch settings' });
    }
  });

  app.post('/api/settings', async (req, res) => {
    try {
      const { key, value, category = 'general' } = req.body;
      const setting = await storage.setSetting(key, value, category);
      res.json(setting);
    } catch (error) {
      console.error('Error updating setting:', error);
      res.status(500).json({ error: 'Failed to update setting' });
    }
  });

  // Sports routes
  app.get('/api/sports/stats', async (req, res) => {
    try {
      const sports = await storage.getSports();
      const totalSports = sports.length;
      const activeSports = sports.filter(s => s.isActive).length;
      const students = await storage.getStudents();
      const totalStudents = students.students.length;
      const avgFee = sports.reduce((sum, sport) => sum + (sport.feeStructure?.skillLevels?.intermediate || 0), 0) / totalSports || 0;
      
      res.json({
        totalSports,
        activeSports,
        totalStudents,
        avgFee: Math.round(avgFee)
      });
    } catch (error) {
      console.error('Error fetching sports stats:', error);
      res.status(500).json({ error: 'Failed to fetch sports stats' });
    }
  });

  app.post('/api/sports', async (req, res) => {
    try {
      const sport = await storage.createSport(req.body);
      res.json(sport);
    } catch (error) {
      console.error('Error creating sport:', error);
      res.status(500).json({ error: 'Failed to create sport' });
    }
  });

  app.put('/api/sports/:id', async (req, res) => {
    try {
      const sport = await storage.updateSport(parseInt(req.params.id), req.body);
      res.json(sport);
    } catch (error) {
      console.error('Error updating sport:', error);
      res.status(500).json({ error: 'Failed to update sport' });
    }
  });

  // Batches routes
  app.get('/api/batches/stats', async (req, res) => {
    try {
      const batches = await storage.getBatches();
      const totalBatches = batches.length;
      const activeBatches = batches.filter(b => b.isActive).length;
      const totalStudents = batches.reduce((sum, batch) => sum + (batch.currentCapacity || 0), 0);
      const avgCapacity = batches.reduce((sum, batch) => sum + ((batch.currentCapacity || 0) / batch.maxCapacity * 100), 0) / totalBatches || 0;
      
      res.json({
        totalBatches,
        activeBatches,
        totalStudents,
        avgCapacity: Math.round(avgCapacity)
      });
    } catch (error) {
      console.error('Error fetching batch stats:', error);
      res.status(500).json({ error: 'Failed to fetch batch stats' });
    }
  });

  app.post('/api/batches', async (req, res) => {
    try {
      const batch = await storage.createBatch(req.body);
      res.json(batch);
    } catch (error) {
      console.error('Error creating batch:', error);
      res.status(500).json({ error: 'Failed to create batch' });
    }
  });

  app.put('/api/batches/:id', async (req, res) => {
    try {
      const batch = await storage.updateBatch(parseInt(req.params.id), req.body);
      res.json(batch);
    } catch (error) {
      console.error('Error updating batch:', error);
      res.status(500).json({ error: 'Failed to update batch' });
    }
  });

  // Communications routes
  app.get('/api/communications/stats', async (req, res) => {
    try {
      const communications = await storage.getCommunications();
      const totalSent = communications.communications.length;
      const delivered = communications.communications.filter(c => c.status === 'delivered').length;
      const failed = communications.communications.filter(c => c.status === 'failed').length;
      const deliveryRate = totalSent > 0 ? Math.round((delivered / totalSent) * 100) : 0;
      
      res.json({
        totalSent,
        delivered,
        failed,
        deliveryRate
      });
    } catch (error) {
      console.error('Error fetching communication stats:', error);
      res.status(500).json({ error: 'Failed to fetch communication stats' });
    }
  });

  app.post('/api/communications/send', async (req, res) => {
    try {
      const communication = await storage.createCommunication(req.body);
      res.json(communication);
    } catch (error) {
      console.error('Error sending communication:', error);
      res.status(500).json({ error: 'Failed to send communication' });
    }
  });

  // Payment gateways routes
  app.get('/api/payment-gateways', async (req, res) => {
    try {
      const gateways = await storage.getPaymentGateways();
      res.json(gateways);
    } catch (error) {
      console.error('Error fetching payment gateways:', error);
      res.status(500).json({ error: 'Failed to fetch payment gateways' });
    }
  });

  app.post('/api/payment-gateways', async (req, res) => {
    try {
      const gateway = await storage.createPaymentGateway(req.body);
      res.json(gateway);
    } catch (error) {
      console.error('Error creating payment gateway:', error);
      res.status(500).json({ error: 'Failed to create payment gateway' });
    }
  });

  // Icons routes
  app.get('/api/icons', async (req, res) => {
    try {
      const icons = await storage.getIcons();
      res.json(icons);
    } catch (error) {
      console.error('Error fetching icons:', error);
      res.status(500).json({ error: 'Failed to fetch icons' });
    }
  });

  app.post('/api/icons', async (req, res) => {
    try {
      const icon = await storage.createIcon(req.body);
      res.json(icon);
    } catch (error) {
      console.error('Error creating icon:', error);
      res.status(500).json({ error: 'Failed to create icon' });
    }
  });

  // Coaches routes
  app.get('/api/coaches', async (req, res) => {
    try {
      const coaches = await storage.getCoaches();
      res.json(coaches);
    } catch (error) {
      console.error('Error fetching coaches:', error);
      res.status(500).json({ error: 'Failed to fetch coaches' });
    }
  });

  app.get('/api/coaches/stats', async (req, res) => {
    try {
      const coaches = await storage.getCoaches();
      const totalCoaches = coaches.length;
      const activeCoaches = coaches.filter(c => c.isActive).length;
      const avgExperience = coaches.reduce((sum, coach) => sum + (coach.experience || 0), 0) / totalCoaches || 0;
      const students = await storage.getStudents();
      const totalStudents = students.students.length;
      
      res.json({
        totalCoaches,
        activeCoaches,
        avgExperience: Math.round(avgExperience),
        totalStudents
      });
    } catch (error) {
      console.error('Error fetching coach stats:', error);
      res.status(500).json({ error: 'Failed to fetch coach stats' });
    }
  });

  app.post('/api/coaches', async (req, res) => {
    try {
      const coach = await storage.createCoach(req.body);
      res.json(coach);
    } catch (error) {
      console.error('Error creating coach:', error);
      res.status(500).json({ error: 'Failed to create coach' });
    }
  });

  app.put('/api/coaches/:id', async (req, res) => {
    try {
      const coach = await storage.updateCoach(parseInt(req.params.id), req.body);
      res.json(coach);
    } catch (error) {
      console.error('Error updating coach:', error);
      res.status(500).json({ error: 'Failed to update coach' });
    }
  });

  app.delete('/api/coaches/:id', async (req, res) => {
    try {
      const success = await storage.deleteCoach(parseInt(req.params.id));
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Coach not found' });
      }
    } catch (error) {
      console.error('Error deleting coach:', error);
      res.status(500).json({ error: 'Failed to delete coach' });
    }
  });

  return httpServer;
}
