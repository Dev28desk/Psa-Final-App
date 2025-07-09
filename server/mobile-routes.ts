import { Router } from "express";
import { storage } from "./storage";
import { eq } from "drizzle-orm";
import { students, coaches, users } from "@shared/schema";
import { db } from "./db";

const router = Router();

// Mobile Authentication
router.post('/auth/login', async (req, res) => {
  try {
    const { phone, password, userType } = req.body;

    if (!phone || !password || !userType) {
      return res.status(400).json({ message: 'Phone, password, and user type are required' });
    }

    // Find user based on type
    let user;
    if (userType === 'student') {
      user = await storage.getStudentByPhone(phone);
    } else if (userType === 'coach') {
      user = await storage.getCoachByPhone(phone);
    } else {
      return res.status(400).json({ message: 'Invalid user type' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // For now, we'll use a simple password check
    // In production, you should hash passwords
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a simple token (in production, use JWT)
    const token = `mobile_${userType}_${user.id}_${Date.now()}`;

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        type: userType,
        sportId: user.sportId,
        batchId: user.batchId
      }
    });
  } catch (error) {
    console.error('Mobile login error:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});

router.post('/auth/logout', (req, res) => {
  // In production, you would invalidate the token here
  res.json({ success: true });
});

router.get('/auth/check', (req, res) => {
  // Simple token validation
  const token = req.headers.authorization?.replace('Bearer ', '');
  
  if (!token || !token.startsWith('mobile_')) {
    return res.status(401).json({ message: 'Invalid token' });
  }

  const [, userType, userId] = token.split('_');
  
  res.json({
    success: true,
    userType,
    userId: parseInt(userId)
  });
});

// Coach Mobile Routes
router.get('/coach/profile', async (req, res) => {
  try {
    // Get coach ID from token (simplified)
    const token = req.headers.authorization?.replace('Bearer ', '');
    const coachId = parseInt(token?.split('_')[2] || '0');
    
    const coach = await storage.getCoach(coachId);
    if (!coach) {
      return res.status(404).json({ message: 'Coach not found' });
    }

    res.json(coach);
  } catch (error) {
    console.error('Coach profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

router.get('/coach/dashboard', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const coachId = parseInt(token?.split('_')[2] || '0');
    
    // Get coach's students and classes
    const students = await storage.getStudentsByCoach(coachId);
    const classes = await storage.getBatchesByCoach(coachId);
    
    // Calculate stats
    const totalStudents = students.length;
    const activeClasses = classes.filter(c => c.isActive).length;
    const todayAttendance = await storage.getTodayAttendanceByCoach(coachId);
    const thisWeekClasses = await storage.getWeeklyClassesByCoach(coachId);

    res.json({
      totalStudents,
      activeClasses,
      todayAttendance: todayAttendance.length,
      thisWeekClasses: thisWeekClasses.length
    });
  } catch (error) {
    console.error('Coach dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard' });
  }
});

router.get('/coach/today-classes', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const coachId = parseInt(token?.split('_')[2] || '0');
    
    const classes = await storage.getTodayClassesByCoach(coachId);
    res.json(classes);
  } catch (error) {
    console.error('Today classes error:', error);
    res.status(500).json({ message: 'Failed to fetch today classes' });
  }
});

router.get('/coach/recent-attendance', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const coachId = parseInt(token?.split('_')[2] || '0');
    
    const attendance = await storage.getRecentAttendanceByCoach(coachId);
    res.json(attendance);
  } catch (error) {
    console.error('Recent attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch recent attendance' });
  }
});

// Student Mobile Routes
router.get('/student/profile', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const studentId = parseInt(token?.split('_')[2] || '0');
    
    const student = await storage.getStudent(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(student);
  } catch (error) {
    console.error('Student profile error:', error);
    res.status(500).json({ message: 'Failed to fetch profile' });
  }
});

router.get('/student/dashboard', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const studentId = parseInt(token?.split('_')[2] || '0');
    
    // Get student stats
    const attendanceStats = await storage.getStudentAttendanceStats(studentId);
    const paymentStats = await storage.getStudentPaymentStats(studentId);
    const badgeStats = await storage.getStudentBadgeStats(studentId);
    
    res.json({
      attendancePercentage: attendanceStats.percentage || 0,
      totalClasses: attendanceStats.totalClasses || 0,
      upcomingPayment: paymentStats.upcomingAmount || 0,
      totalBadges: badgeStats.totalBadges || 0,
      currentLevel: badgeStats.currentLevel || 1,
      totalPoints: badgeStats.totalPoints || 0
    });
  } catch (error) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard' });
  }
});

router.get('/student/upcoming-classes', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const studentId = parseInt(token?.split('_')[2] || '0');
    
    const classes = await storage.getUpcomingClassesByStudent(studentId);
    res.json(classes);
  } catch (error) {
    console.error('Upcoming classes error:', error);
    res.status(500).json({ message: 'Failed to fetch upcoming classes' });
  }
});

router.get('/student/recent-badges', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const studentId = parseInt(token?.split('_')[2] || '0');
    
    const badges = await storage.getRecentBadgesByStudent(studentId);
    res.json(badges);
  } catch (error) {
    console.error('Recent badges error:', error);
    res.status(500).json({ message: 'Failed to fetch recent badges' });
  }
});

router.get('/student/attendance', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const studentId = parseInt(token?.split('_')[2] || '0');
    
    const attendance = await storage.getStudentAttendanceHistory(studentId);
    res.json(attendance);
  } catch (error) {
    console.error('Student attendance error:', error);
    res.status(500).json({ message: 'Failed to fetch attendance' });
  }
});

router.get('/student/payments', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const studentId = parseInt(token?.split('_')[2] || '0');
    
    const payments = await storage.getStudentPaymentHistory(studentId);
    res.json(payments);
  } catch (error) {
    console.error('Student payments error:', error);
    res.status(500).json({ message: 'Failed to fetch payments' });
  }
});

router.get('/student/achievements', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const studentId = parseInt(token?.split('_')[2] || '0');
    
    const achievements = await storage.getStudentAchievements(studentId);
    res.json(achievements);
  } catch (error) {
    console.error('Student achievements error:', error);
    res.status(500).json({ message: 'Failed to fetch achievements' });
  }
});

export default router;