import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { reportGenerator } from "./report-generator";
import { CampaignAutomation } from "./campaign-automation";
import { generateStudentInsights, generateRevenueAnalysis, generateAttendanceInsights, generateRetentionForecast } from "./ai-insights";
import { sendWhatsAppNotification } from "./notifications";
import { locationTrackingService } from "./location-tracking";
import { userPermissionService } from "./user-permission";
import { gamificationService } from "./gamification";
import mobileRoutes from "./mobile-routes";
import { insertStudentSchema, insertPaymentSchema, insertAttendanceSchema, insertCoachSchema, insertSportSchema, insertBatchSchema, insertCommunicationSchema, insertCampaignSchema, insertCampaignMessageSchema, insertMessageTemplateSchema, insertCustomReportSchema, insertReportExecutionSchema, insertSavedQuerySchema, insertLocationTrackingSchema, insertGeofenceSchema, insertCoachAttendanceSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { campaignTemplates } from "./campaign-automation";

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

  // Mobile routes
  app.use("/api/mobile", mobileRoutes);

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

  app.patch("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      
      const student = await storage.updateStudent(id, updates);
      
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Create activity for the update
      await storage.createActivity({
        type: 'student_updated',
        description: `Student updated: ${student.name}`,
        userId: 1, // TODO: Get from authenticated user
        entityId: student.id,
        entityType: 'student'
      });

      // Broadcast update
      broadcast({
        type: 'student_updated',
        student
      });
      
      res.json(student);
    } catch (error) {
      console.error("Error updating student:", error);
      res.status(500).json({ message: "Failed to update student" });
    }
  });

  app.delete("/api/students/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Get student info before deletion for activity logging
      const student = await storage.getStudent(id);
      
      const success = await storage.deleteStudent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Student not found" });
      }
      
      // Create activity for the deletion
      if (student) {
        await storage.createActivity({
          type: 'student_deleted',
          description: `Student deleted: ${student.name} (ID: ${student.studentId})`,
          userId: 1, // TODO: Get from authenticated user
          entityId: student.id,
          entityType: 'student'
        });

        // Broadcast update
        broadcast({
          type: 'student_deleted',
          studentId: id
        });
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
        search: req.query.search as string,
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

      // Trigger gamification event for payment
      await gamificationService.triggerPaymentEvent(payment.studentId, payment);

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

  // Badge endpoints
  app.get('/api/badges', async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error) {
      console.error('Error fetching badges:', error);
      res.status(500).json({ error: 'Failed to fetch badges' });
    }
  });

  app.get('/api/badges/:id', async (req, res) => {
    try {
      const badge = await storage.getBadge(parseInt(req.params.id));
      if (!badge) {
        return res.status(404).json({ error: 'Badge not found' });
      }
      res.json(badge);
    } catch (error) {
      console.error('Error fetching badge:', error);
      res.status(500).json({ error: 'Failed to fetch badge' });
    }
  });

  app.post('/api/badges', async (req, res) => {
    try {
      const badge = await storage.createBadge(req.body);
      res.json(badge);
    } catch (error) {
      console.error('Error creating badge:', error);
      res.status(500).json({ error: 'Failed to create badge' });
    }
  });

  app.patch('/api/badges/:id', async (req, res) => {
    try {
      const badge = await storage.updateBadge(parseInt(req.params.id), req.body);
      if (!badge) {
        return res.status(404).json({ error: 'Badge not found' });
      }
      res.json(badge);
    } catch (error) {
      console.error('Error updating badge:', error);
      res.status(500).json({ error: 'Failed to update badge' });
    }
  });

  app.delete('/api/badges/:id', async (req, res) => {
    try {
      const deleted = await storage.deleteBadge(parseInt(req.params.id));
      if (!deleted) {
        return res.status(404).json({ error: 'Badge not found' });
      }
      res.json({ message: 'Badge deleted successfully' });
    } catch (error) {
      console.error('Error deleting badge:', error);
      res.status(500).json({ error: 'Failed to delete badge' });
    }
  });

  // Student badge endpoints
  app.get('/api/students/:id/badges', async (req, res) => {
    try {
      const studentBadges = await storage.getStudentBadges(parseInt(req.params.id));
      res.json(studentBadges);
    } catch (error) {
      console.error('Error fetching student badges:', error);
      res.status(500).json({ error: 'Failed to fetch student badges' });
    }
  });

  app.post('/api/students/:id/award-badge', async (req, res) => {
    try {
      const { badgeId } = req.body;
      const studentBadge = await storage.createStudentBadge({
        studentId: parseInt(req.params.id),
        badgeId: badgeId,
        earnedAt: new Date(),
        progress: {},
        isDisplayed: true
      });
      res.json(studentBadge);
    } catch (error) {
      console.error('Error awarding badge:', error);
      res.status(500).json({ error: 'Failed to award badge' });
    }
  });

  // Student points endpoints
  app.get('/api/students/:id/points', async (req, res) => {
    try {
      const studentPoints = await storage.getStudentPoints(parseInt(req.params.id));
      res.json(studentPoints);
    } catch (error) {
      console.error('Error fetching student points:', error);
      res.status(500).json({ error: 'Failed to fetch student points' });
    }
  });

  app.post('/api/students/:id/add-points', async (req, res) => {
    try {
      const { points } = req.body;
      await storage.addStudentPoints(parseInt(req.params.id), points);
      res.json({ message: 'Points added successfully' });
    } catch (error) {
      console.error('Error adding points:', error);
      res.status(500).json({ error: 'Failed to add points' });
    }
  });

  // Achievement history endpoints
  app.get('/api/students/:id/achievements', async (req, res) => {
    try {
      const achievements = await storage.getAchievementHistory(parseInt(req.params.id));
      res.json(achievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({ error: 'Failed to fetch achievements' });
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

      // Trigger gamification event for attendance
      await gamificationService.triggerAttendanceEvent(attendance.studentId, attendance);

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

  // AI Insights routes
  app.get("/api/ai-insights/student-analysis", async (req, res) => {
    try {
      const { generateStudentInsights } = await import("./ai-insights");
      const insights = await generateStudentInsights();
      res.json(insights);
    } catch (error: any) {
      console.error("Student insights error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ai-insights/revenue-analysis", async (req, res) => {
    try {
      const { generateRevenueAnalysis } = await import("./ai-insights");
      const analysis = await generateRevenueAnalysis();
      res.json(analysis);
    } catch (error: any) {
      console.error("Revenue analysis error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ai-insights/attendance-insights", async (req, res) => {
    try {
      const { generateAttendanceInsights } = await import("./ai-insights");
      const insights = await generateAttendanceInsights();
      res.json(insights);
    } catch (error: any) {
      console.error("Attendance insights error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/ai-insights/retention-forecast", async (req, res) => {
    try {
      const { generateRetentionForecast } = await import("./ai-insights");
      const forecast = await generateRetentionForecast();
      res.json(forecast);
    } catch (error: any) {
      console.error("Retention forecast error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/ai-insights/query", async (req, res) => {
    try {
      const { query } = req.body;
      if (!query) {
        return res.status(400).json({ error: "Query is required" });
      }
      
      const { generateAIResponse } = await import("./ai-insights");
      const response = await generateAIResponse(query);
      res.json(response);
    } catch (error: any) {
      console.error("AI query error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Badges API endpoints
  app.get("/api/badges", async (req, res) => {
    try {
      const badges = await storage.getBadges();
      res.json(badges);
    } catch (error: any) {
      console.error("Error fetching badges:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/badges", async (req, res) => {
    try {
      const badge = await storage.createBadge(req.body);
      res.json(badge);
    } catch (error: any) {
      console.error("Error creating badge:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/students/:id/badges", async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const badges = await storage.getStudentBadges(studentId);
      res.json(badges);
    } catch (error: any) {
      console.error("Error fetching student badges:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/students/:id/points", async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const points = await storage.getStudentPoints(studentId);
      res.json(points);
    } catch (error: any) {
      console.error("Error fetching student points:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/students/:id/achievements", async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const achievements = await storage.getAchievementHistory(studentId);
      res.json(achievements);
    } catch (error: any) {
      console.error("Error fetching achievement history:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/students/:id/award-badge", async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const { badgeId } = req.body;
      
      const studentBadge = await storage.createStudentBadge({
        studentId,
        badgeId,
        earnedAt: new Date(),
        progress: {},
        isDisplayed: true
      });
      
      res.json(studentBadge);
    } catch (error: any) {
      console.error("Error awarding badge:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/students/:id/add-points", async (req, res) => {
    try {
      const studentId = parseInt(req.params.id);
      const { points } = req.body;
      
      await storage.addStudentPoints(studentId, points);
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error adding points:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // WhatsApp notification routes
  app.post("/api/notifications/fee-reminder", async (req, res) => {
    try {
      const { sendFeeReminder } = await import("./notifications");
      const { studentId, amount, dueDate } = req.body;
      const result = await sendFeeReminder(studentId, amount, dueDate);
      res.json(result);
    } catch (error: any) {
      console.error("Fee reminder error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/notifications/payment-confirmation", async (req, res) => {
    try {
      const { sendPaymentConfirmation } = await import("./notifications");
      const { studentId, amount, paymentMethod } = req.body;
      const result = await sendPaymentConfirmation(studentId, amount, paymentMethod);
      res.json(result);
    } catch (error: any) {
      console.error("Payment confirmation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/notifications/bulk-notification", async (req, res) => {
    try {
      const { sendBulkNotification } = await import("./notifications");
      const { recipients, message } = req.body;
      const result = await sendBulkNotification(recipients, message);
      res.json(result);
    } catch (error: any) {
      console.error("Bulk notification error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Campaign routes
  app.get("/api/campaigns", async (req, res) => {
    try {
      const { status, type } = req.query;
      const campaigns = await storage.getCampaigns({ 
        status: status as string, 
        type: type as string 
      });
      res.json(campaigns);
    } catch (error: any) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(parseInt(req.params.id));
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error: any) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/campaigns", async (req, res) => {
    try {
      const { insertCampaignSchema } = await import("@shared/schema");
      const campaignData = insertCampaignSchema.parse(req.body);
      const campaign = await storage.createCampaign(campaignData);
      
      // If campaign is active and automated, start automation
      if (campaign.status === 'active' && campaign.trigger === 'automated') {
        const { CampaignAutomation } = await import("./campaign-automation");
        const automation = CampaignAutomation.getInstance();
        await automation.restartCampaignAutomation(campaign.id);
      }
      
      res.json(campaign);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/campaigns/:id", async (req, res) => {
    try {
      const campaign = await storage.updateCampaign(parseInt(req.params.id), req.body);
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      // Restart automation if campaign is active
      if (campaign.status === 'active' && campaign.trigger === 'automated') {
        const { CampaignAutomation } = await import("./campaign-automation");
        const automation = CampaignAutomation.getInstance();
        await automation.restartCampaignAutomation(campaign.id);
      }
      
      res.json(campaign);
    } catch (error: any) {
      console.error("Error updating campaign:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.delete("/api/campaigns/:id", async (req, res) => {
    try {
      const success = await storage.deleteCampaign(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      // Stop automation
      const { CampaignAutomation } = await import("./campaign-automation");
      const automation = CampaignAutomation.getInstance();
      automation.stopCampaignAutomation(parseInt(req.params.id));
      
      res.json({ success: true });
    } catch (error: any) {
      console.error("Error deleting campaign:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/campaigns/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getCampaignMessages(parseInt(req.params.id));
      res.json(messages);
    } catch (error: any) {
      console.error("Error fetching campaign messages:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/campaigns/:id/analytics", async (req, res) => {
    try {
      const analytics = await storage.getCampaignAnalytics(parseInt(req.params.id));
      res.json(analytics);
    } catch (error: any) {
      console.error("Error fetching campaign analytics:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/campaigns/:id/run", async (req, res) => {
    try {
      const campaign = await storage.getCampaign(parseInt(req.params.id));
      if (!campaign) {
        return res.status(404).json({ error: "Campaign not found" });
      }
      
      // Manual campaign execution
      // Implementation depends on the campaign type and target audience
      res.json({ success: true, message: "Campaign execution started" });
    } catch (error: any) {
      console.error("Error running campaign:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Message template routes
  app.get("/api/message-templates", async (req, res) => {
    try {
      const { category } = req.query;
      const templates = await storage.getMessageTemplates(category as string);
      res.json(templates);
    } catch (error: any) {
      console.error("Error fetching message templates:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/message-templates", async (req, res) => {
    try {
      const { insertMessageTemplateSchema } = await import("@shared/schema");
      const templateData = insertMessageTemplateSchema.parse(req.body);
      const template = await storage.createMessageTemplate(templateData);
      res.json(template);
    } catch (error: any) {
      console.error("Error creating message template:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/campaigns/templates/predefined", async (req, res) => {
    try {
      const { campaignTemplates } = await import("./campaign-automation");
      res.json(campaignTemplates);
    } catch (error: any) {
      console.error("Error fetching predefined templates:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Enhanced pending payments route
  app.get("/api/payments/pending-grouped", async (req, res) => {
    try {
      const pendingPayments = await storage.getPendingPayments();
      
      // Group by sport and batch
      const grouped = pendingPayments.reduce((acc: any, payment: any) => {
        const sportName = payment.student?.batch?.sport?.name || 'Unknown Sport';
        const batchName = payment.student?.batch?.name || 'Unknown Batch';
        
        if (!acc[sportName]) {
          acc[sportName] = {};
        }
        if (!acc[sportName][batchName]) {
          acc[sportName][batchName] = [];
        }
        
        acc[sportName][batchName].push(payment);
        return acc;
      }, {});

      res.json(grouped);
    } catch (error: any) {
      console.error("Grouped pending payments error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Reports generation routes
  app.get("/api/reports/generate/:type", async (req, res) => {
    try {
      const { type } = req.params;
      const { startDate, endDate, ...filters } = req.query;

      let report;
      switch (type) {
        case 'student':
          report = await storage.getStudentReport(filters);
          break;
        case 'revenue':
          report = await storage.getMonthlyRevenueReport(parseInt(filters.year as string) || new Date().getFullYear());
          break;
        case 'attendance':
          report = await storage.getAttendanceReport(
            new Date(startDate as string),
            new Date(endDate as string),
            filters.batchId ? parseInt(filters.batchId as string) : undefined
          );
          break;
        default:
          return res.status(400).json({ error: "Invalid report type" });
      }

      res.json(report);
    } catch (error: any) {
      console.error("Report generation error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Custom Reports endpoints
  app.get("/api/reports", async (req, res) => {
    try {
      const { category, createdBy } = req.query;
      const reports = await storage.getCustomReports({ 
        category: category as string, 
        createdBy: createdBy ? parseInt(createdBy as string) : undefined 
      });
      res.json(reports);
    } catch (error) {
      console.error("Error fetching reports:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.get("/api/reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const report = await storage.getCustomReport(parseInt(id));
      if (!report) {
        return res.status(404).json({ error: "Report not found" });
      }
      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ error: "Failed to fetch report" });
    }
  });

  app.post("/api/reports", async (req, res) => {
    try {
      const reportData = req.body;
      const report = await storage.createCustomReport(reportData);
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  app.put("/api/reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const report = await storage.updateCustomReport(parseInt(id), updates);
      res.json(report);
    } catch (error) {
      console.error("Error updating report:", error);
      res.status(500).json({ error: "Failed to update report" });
    }
  });

  app.delete("/api/reports/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteCustomReport(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting report:", error);
      res.status(500).json({ error: "Failed to delete report" });
    }
  });

  // Report execution endpoints
  app.post("/api/reports/:id/execute", async (req, res) => {
    try {
      const { id } = req.params;
      const { reportGenerator } = await import("./report-generator");
      const execution = await reportGenerator.generateReport(parseInt(id), 1); // TODO: get actual user ID
      res.json(execution);
    } catch (error) {
      console.error("Error executing report:", error);
      res.status(500).json({ error: "Failed to execute report" });
    }
  });

  // Student Registration API
  app.post("/api/students/register", async (req, res) => {
    try {
      const {
        phone,
        name,
        email,
        dateOfBirth,
        gender,
        address,
        emergencyContact,
        sportId,
        batchId,
        registrationFee,
        enrollmentDate
      } = req.body;

      // Check if student already exists
      const existingStudent = await storage.getStudentByPhone(phone);
      if (existingStudent) {
        return res.status(400).json({
          success: false,
          message: "Student with this phone number already exists"
        });
      }

      // Create student record
      const student = await storage.createStudent({
        name,
        email,
        phone,
        dateOfBirth,
        gender,
        address,
        emergencyContact,
        sportId: parseInt(sportId),
        batchId: parseInt(batchId),
        status: 'active',
        enrollmentDate: new Date(enrollmentDate),
        createdAt: new Date(),
        updatedAt: new Date()
      });

      // Record registration payment
      if (registrationFee > 0) {
        await storage.createPayment({
          studentId: student.id,
          amount: registrationFee,
          paymentMethod: 'online',
          paymentType: 'registration',
          status: 'completed',
          month: new Date().getMonth() + 1,
          year: new Date().getFullYear(),
          paidAt: new Date(),
          createdAt: new Date()
        });
      }

      // Award welcome badge
      try {
        const welcomeBadge = await storage.getBadgeByName('Welcome to Academy');
        if (welcomeBadge) {
          await storage.createStudentBadge({
            studentId: student.id,
            badgeId: welcomeBadge.id,
            earnedAt: new Date(),
            progress: {},
            isDisplayed: true
          });
        }
      } catch (error) {
        console.log('Welcome badge not found, skipping badge award');
      }

      res.json({
        success: true,
        message: "Registration completed successfully",
        student: {
          id: student.id,
          name: student.name,
          email: student.email,
          phone: student.phone
        }
      });

    } catch (error: any) {
      console.error("Student registration error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Registration failed"
      });
    }
  });

  // Check if phone number is already registered
  app.get("/api/students/check-phone/:phone", async (req, res) => {
    try {
      const { phone } = req.params;
      const student = await storage.getStudentByPhone(phone);
      
      res.json({
        exists: !!student,
        student: student ? {
          id: student.id,
          name: student.name,
          email: student.email
        } : null
      });
    } catch (error: any) {
      console.error("Phone check error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to check phone number"
      });
    }
  });

  app.get("/api/reports/:id/executions", async (req, res) => {
    try {
      const { id } = req.params;
      const executions = await storage.getReportExecutions(parseInt(id));
      res.json(executions);
    } catch (error) {
      console.error("Error fetching executions:", error);
      res.status(500).json({ error: "Failed to fetch executions" });
    }
  });

  app.get("/api/executions/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const execution = await storage.getReportExecution(parseInt(id));
      if (!execution) {
        return res.status(404).json({ error: "Execution not found" });
      }
      res.json(execution);
    } catch (error) {
      console.error("Error fetching execution:", error);
      res.status(500).json({ error: "Failed to fetch execution" });
    }
  });

  // Saved queries endpoints
  app.get("/api/saved-queries", async (req, res) => {
    try {
      const { createdBy } = req.query;
      const queries = await storage.getSavedQueries(createdBy ? parseInt(createdBy as string) : undefined);
      res.json(queries);
    } catch (error) {
      console.error("Error fetching saved queries:", error);
      res.status(500).json({ error: "Failed to fetch saved queries" });
    }
  });

  app.post("/api/saved-queries", async (req, res) => {
    try {
      const queryData = req.body;
      const query = await storage.createSavedQuery(queryData);
      res.json(query);
    } catch (error) {
      console.error("Error creating saved query:", error);
      res.status(500).json({ error: "Failed to create saved query" });
    }
  });

  app.put("/api/saved-queries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const query = await storage.updateSavedQuery(parseInt(id), updates);
      res.json(query);
    } catch (error) {
      console.error("Error updating saved query:", error);
      res.status(500).json({ error: "Failed to update saved query" });
    }
  });

  app.delete("/api/saved-queries/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteSavedQuery(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting saved query:", error);
      res.status(500).json({ error: "Failed to delete saved query" });
    }
  });

  // Predefined report templates
  app.get("/api/reports/templates/predefined", async (req, res) => {
    try {
      const { reportGenerator } = await import("./report-generator");
      const templates = reportGenerator.getPredefinedReports();
      res.json(templates);
    } catch (error) {
      console.error("Error fetching predefined templates:", error);
      res.status(500).json({ error: "Failed to fetch predefined templates" });
    }
  });

  // Execute query endpoint for query builder
  app.post("/api/reports/execute-query", async (req, res) => {
    try {
      const { queryConfig } = req.body;
      const { reportGenerator } = await import("./report-generator");
      const results = await reportGenerator.executeQuery(queryConfig);
      res.json(results);
    } catch (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Failed to execute query" });
    }
  });

  // GPS Location Tracking Routes
  app.post("/api/location/track", async (req, res) => {
    try {
      const { userId, latitude, longitude, accuracy, trackingType } = req.body;
      
      const locationData = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: parseInt(accuracy),
        timestamp: new Date()
      };
      
      const result = await locationTrackingService.trackLocation(userId, locationData, trackingType);
      res.json(result);
    } catch (error: any) {
      console.error("Error tracking location:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/location/history/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { limit = 50 } = req.query;
      
      const history = await locationTrackingService.getUserLocationHistory(parseInt(userId), parseInt(limit as string));
      res.json(history);
    } catch (error: any) {
      console.error("Error fetching location history:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/location/live", async (req, res) => {
    try {
      const liveLocations = await locationTrackingService.getLiveCoachLocations();
      res.json(liveLocations);
    } catch (error: any) {
      console.error("Error fetching live locations:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Geofence Routes
  app.post("/api/geofences", async (req, res) => {
    try {
      const { name, description, centerLatitude, centerLongitude, radius, createdBy } = req.body;
      
      const geofenceData = {
        name,
        description,
        centerLatitude: parseFloat(centerLatitude),
        centerLongitude: parseFloat(centerLongitude),
        radius: parseInt(radius),
        createdBy: parseInt(createdBy)
      };
      
      const result = await locationTrackingService.createGeofence(geofenceData);
      res.json(result);
    } catch (error: any) {
      console.error("Error creating geofence:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/geofences", async (req, res) => {
    try {
      const geofences = await locationTrackingService.getGeofences();
      res.json(geofences);
    } catch (error: any) {
      console.error("Error fetching geofences:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Coach Attendance Routes
  app.post("/api/coach/checkin", async (req, res) => {
    try {
      const { coachId, batchId, latitude, longitude, accuracy } = req.body;
      
      const locationData = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: parseInt(accuracy),
        timestamp: new Date()
      };
      
      const result = await locationTrackingService.coachCheckIn(
        parseInt(coachId),
        parseInt(batchId),
        locationData
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error in coach check-in:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/coach/checkout", async (req, res) => {
    try {
      const { coachId, batchId, latitude, longitude, accuracy } = req.body;
      
      const locationData = {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        accuracy: parseInt(accuracy),
        timestamp: new Date()
      };
      
      const result = await locationTrackingService.coachCheckOut(
        parseInt(coachId),
        parseInt(batchId),
        locationData
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error in coach check-out:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/coach/attendance/:coachId", async (req, res) => {
    try {
      const { coachId } = req.params;
      const { limit = 30 } = req.query;
      
      const history = await locationTrackingService.getCoachAttendanceHistory(
        parseInt(coachId),
        parseInt(limit as string)
      );
      res.json(history);
    } catch (error: any) {
      console.error("Error fetching coach attendance:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // User Permission Routes
  app.post("/api/users", async (req, res) => {
    try {
      const { name, email, phone, role, permissions, createdBy } = req.body;
      
      const userData = {
        name,
        email,
        phone,
        role,
        permissions: permissions || [],
        createdBy: parseInt(createdBy)
      };
      
      const result = await userPermissionService.createUser(userData);
      res.json(result);
    } catch (error: any) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users", async (req, res) => {
    try {
      const users = await userPermissionService.getUsers();
      res.json(users);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/users/:userId/permissions", async (req, res) => {
    try {
      const { userId } = req.params;
      const permissions = await userPermissionService.getUserPermissions(parseInt(userId));
      res.json(permissions);
    } catch (error: any) {
      console.error("Error fetching user permissions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/:userId/permissions", async (req, res) => {
    try {
      const { userId } = req.params;
      const { permissions } = req.body;
      
      const result = await userPermissionService.updateUserPermissions(
        parseInt(userId),
        permissions
      );
      res.json(result);
    } catch (error: any) {
      console.error("Error updating user permissions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/:userId/role", async (req, res) => {
    try {
      const { userId } = req.params;
      const { role } = req.body;
      
      const result = await userPermissionService.updateUserRole(parseInt(userId), role);
      res.json(result);
    } catch (error: any) {
      console.error("Error updating user role:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/:userId/deactivate", async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await userPermissionService.deactivateUser(parseInt(userId));
      res.json(result);
    } catch (error: any) {
      console.error("Error deactivating user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.put("/api/users/:userId/activate", async (req, res) => {
    try {
      const { userId } = req.params;
      const result = await userPermissionService.activateUser(parseInt(userId));
      res.json(result);
    } catch (error: any) {
      console.error("Error activating user:", error);
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/permissions", async (req, res) => {
    try {
      const permissions = await userPermissionService.getPermissions();
      res.json(permissions);
    } catch (error: any) {
      console.error("Error fetching permissions:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Initialize permissions on startup
  await userPermissionService.initializeDefaultPermissions();

  return httpServer;
}
