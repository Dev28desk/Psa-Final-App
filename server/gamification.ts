import { storage } from "./storage";
import { Badge, StudentBadge, AchievementHistory } from "@shared/schema";

export interface BadgeCondition {
  type: 'attendance' | 'payment' | 'performance' | 'milestone';
  operator: 'equals' | 'greater' | 'less' | 'streak';
  value: number;
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time';
}

export interface GamificationEvent {
  studentId: number;
  eventType: 'attendance_marked' | 'payment_made' | 'milestone_reached' | 'achievement_earned';
  data: any;
  timestamp: Date;
}

export class GamificationService {
  private static instance: GamificationService;
  
  static getInstance(): GamificationService {
    if (!GamificationService.instance) {
      GamificationService.instance = new GamificationService();
    }
    return GamificationService.instance;
  }

  async initializeDefaultBadges(): Promise<void> {
    const defaultBadges = [
      // Attendance Badges
      {
        name: "Perfect Attendance",
        description: "Attend all classes for 30 consecutive days",
        icon: "trophy",
        color: "gold",
        category: "attendance",
        requirements: {
          type: "attendance",
          operator: "streak",
          value: 30,
          timeframe: "daily"
        },
        points: 500,
        rarity: "legendary"
      },
      {
        name: "Early Bird",
        description: "Be punctual for 10 consecutive classes",
        icon: "clock",
        color: "blue",
        category: "attendance",
        requirements: {
          type: "attendance",
          operator: "streak",
          value: 10,
          timeframe: "daily"
        },
        points: 200,
        rarity: "epic"
      },
      {
        name: "Attendance Champion",
        description: "Achieve 95% attendance this month",
        icon: "star",
        color: "green",
        category: "attendance",
        requirements: {
          type: "attendance",
          operator: "greater",
          value: 95,
          timeframe: "monthly"
        },
        points: 300,
        rarity: "rare"
      },
      
      // Payment Badges
      {
        name: "Prompt Payer",
        description: "Pay fees on time for 6 consecutive months",
        icon: "credit-card",
        color: "emerald",
        category: "payment",
        requirements: {
          type: "payment",
          operator: "streak",
          value: 6,
          timeframe: "monthly"
        },
        points: 400,
        rarity: "epic"
      },
      {
        name: "Financial Responsibility",
        description: "Never miss a payment deadline",
        icon: "wallet",
        color: "purple",
        category: "payment",
        requirements: {
          type: "payment",
          operator: "equals",
          value: 0,
          timeframe: "all_time"
        },
        points: 600,
        rarity: "legendary"
      },
      
      // Performance Badges
      {
        name: "Skill Master",
        description: "Achieve advanced skill level in your sport",
        icon: "award",
        color: "orange",
        category: "performance",
        requirements: {
          type: "performance",
          operator: "equals",
          value: 5,
          timeframe: "all_time"
        },
        points: 750,
        rarity: "legendary"
      },
      {
        name: "Rising Star",
        description: "Show consistent improvement over 3 months",
        icon: "trending-up",
        color: "yellow",
        category: "performance",
        requirements: {
          type: "performance",
          operator: "greater",
          value: 3,
          timeframe: "monthly"
        },
        points: 250,
        rarity: "rare"
      },
      
      // Milestone Badges
      {
        name: "Loyal Student",
        description: "Complete 1 year of training",
        icon: "heart",
        color: "red",
        category: "milestone",
        requirements: {
          type: "milestone",
          operator: "greater",
          value: 365,
          timeframe: "all_time"
        },
        points: 1000,
        rarity: "legendary"
      },
      {
        name: "Dedicated Learner",
        description: "Complete 100 training sessions",
        icon: "book",
        color: "indigo",
        category: "milestone",
        requirements: {
          type: "milestone",
          operator: "greater",
          value: 100,
          timeframe: "all_time"
        },
        points: 500,
        rarity: "epic"
      },
      {
        name: "Newcomer",
        description: "Complete your first week of training",
        icon: "user-plus",
        color: "cyan",
        category: "milestone",
        requirements: {
          type: "milestone",
          operator: "greater",
          value: 7,
          timeframe: "all_time"
        },
        points: 50,
        rarity: "common"
      }
    ];

    // Create badges that don't exist
    for (const badgeData of defaultBadges) {
      try {
        const existingBadge = await storage.getBadgeByName(badgeData.name);
        if (!existingBadge) {
          await storage.createBadge(badgeData);
        }
      } catch (error) {
        console.error(`Error creating badge ${badgeData.name}:`, error);
      }
    }
  }

  async processGamificationEvent(event: GamificationEvent): Promise<void> {
    const { studentId, eventType, data } = event;
    
    // Check for badge eligibility
    await this.checkBadgeEligibility(studentId, eventType, data);
    
    // Award points based on event type
    await this.awardPoints(studentId, eventType, data);
    
    // Update student level
    await this.updateStudentLevel(studentId);
  }

  private async checkBadgeEligibility(studentId: number, eventType: string, data: any): Promise<void> {
    const allBadges = await storage.getBadges();
    const earnedBadges = await storage.getStudentBadges(studentId);
    const earnedBadgeIds = earnedBadges.map(eb => eb.badgeId);
    
    for (const badge of allBadges) {
      if (earnedBadgeIds.includes(badge.id) || !badge.isActive) continue;
      
      const isEligible = await this.evaluateBadgeCondition(studentId, badge, eventType, data);
      
      if (isEligible) {
        await this.awardBadge(studentId, badge);
      }
    }
  }

  private async evaluateBadgeCondition(studentId: number, badge: Badge, eventType: string, data: any): Promise<boolean> {
    const criteria = badge.requirements as BadgeCondition;
    
    switch (criteria.type) {
      case 'attendance':
        return await this.evaluateAttendanceCriteria(studentId, criteria);
      case 'payment':
        return await this.evaluatePaymentCriteria(studentId, criteria);
      case 'performance':
        return await this.evaluatePerformanceCriteria(studentId, criteria);
      case 'milestone':
        return await this.evaluateMilestoneCriteria(studentId, criteria);
      default:
        return false;
    }
  }

  private async evaluateAttendanceCriteria(studentId: number, requirements: BadgeCondition): Promise<boolean> {
    const attendanceData = await storage.getStudentAttendance(studentId);
    
    if (criteria.operator === 'streak') {
      // Calculate attendance streak
      const streak = this.calculateAttendanceStreak(attendanceData);
      return streak >= criteria.value;
    } else if (criteria.operator === 'greater') {
      // Calculate attendance percentage
      const percentage = this.calculateAttendancePercentage(attendanceData, criteria.timeframe);
      return percentage >= criteria.value;
    }
    
    return false;
  }

  private async evaluatePaymentCriteria(studentId: number, requirements: BadgeCondition): Promise<boolean> {
    const paymentData = await storage.getStudentPayments(studentId);
    
    if (criteria.operator === 'streak') {
      // Calculate on-time payment streak
      const streak = this.calculatePaymentStreak(paymentData);
      return streak >= criteria.value;
    } else if (criteria.operator === 'equals' && criteria.value === 0) {
      // Check if student has never missed a payment
      const missedPayments = paymentData.filter(p => p.status === 'overdue').length;
      return missedPayments === 0;
    }
    
    return false;
  }

  private async evaluatePerformanceCriteria(studentId: number, requirements: BadgeCondition): Promise<boolean> {
    const student = await storage.getStudent(studentId);
    
    if (criteria.operator === 'equals') {
      // Check if student has reached a specific skill level
      return student?.skillLevel >= criteria.value;
    } else if (criteria.operator === 'greater') {
      // Check performance improvement over time
      const performanceHistory = await storage.getStudentPerformanceHistory(studentId);
      return this.calculatePerformanceImprovement(performanceHistory, criteria.timeframe) >= criteria.value;
    }
    
    return false;
  }

  private async evaluateMilestoneCriteria(studentId: number, requirements: BadgeCondition): Promise<boolean> {
    const student = await storage.getStudent(studentId);
    
    if (criteria.operator === 'greater') {
      if (criteria.value === 365) {
        // Check if student has been training for 1 year
        const daysSinceJoining = Math.floor((new Date().getTime() - new Date(student.joiningDate).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceJoining >= criteria.value;
      } else if (criteria.value === 100) {
        // Check if student has completed 100 sessions
        const attendanceCount = await storage.getStudentAttendanceCount(studentId);
        return attendanceCount >= criteria.value;
      } else if (criteria.value === 7) {
        // Check if student has completed first week
        const daysSinceJoining = Math.floor((new Date().getTime() - new Date(student.joiningDate).getTime()) / (1000 * 60 * 60 * 24));
        return daysSinceJoining >= criteria.value;
      }
    }
    
    return false;
  }

  private async awardBadge(studentId: number, badge: Badge): Promise<void> {
    await storage.createStudentBadge({
      studentId,
      badgeId: badge.id,
      earnedAt: new Date(),
      progress: {},
      isDisplayed: true
    });

    // Award points for earning the badge
    await storage.addStudentPoints(studentId, badge.points);

    // Record achievement history
    await storage.createAchievementHistory({
      studentId,
      action: 'badge_earned',
      description: `Earned badge: ${badge.name}`,
      points: badge.points,
      metadata: { badgeId: badge.id, badgeName: badge.name }
    });
  }

  private async awardPoints(studentId: number, eventType: string, data: any): Promise<void> {
    let points = 0;
    
    switch (eventType) {
      case 'attendance_marked':
        points = 10;
        break;
      case 'payment_made':
        points = 20;
        break;
      case 'milestone_reached':
        points = data.points || 50;
        break;
      default:
        points = 5;
    }
    
    await storage.addStudentPoints(studentId, points);
    
    // Record achievement history
    await storage.createAchievementHistory({
      studentId,
      action: 'points_awarded',
      description: `Earned ${points} points for ${eventType}`,
      points,
      metadata: { eventType, data }
    });
  }

  private async updateStudentLevel(studentId: number): Promise<void> {
    const studentPoints = await storage.getStudentPoints(studentId);
    
    if (studentPoints) {
      const newLevel = Math.floor(studentPoints.experiencePoints / 1000) + 1;
      
      if (newLevel > studentPoints.level) {
        await storage.updateStudentLevel(studentId, newLevel);
        
        // Record level up achievement
        await storage.createAchievementHistory({
          studentId,
          action: 'level_up',
          description: `Reached level ${newLevel}`,
          points: newLevel * 100,
          metadata: { oldLevel: studentPoints.level, newLevel }
        });
      }
    }
  }

  private calculateAttendanceStreak(attendanceData: any[]): number {
    let streak = 0;
    let currentStreak = 0;
    
    // Sort by date desc to get recent first
    const sortedData = attendanceData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    for (const record of sortedData) {
      if (record.status === 'present') {
        currentStreak++;
        streak = Math.max(streak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }
    
    return streak;
  }

  private calculateAttendancePercentage(attendanceData: any[], timeframe?: string): number {
    const now = new Date();
    let startDate = new Date();
    
    if (timeframe === 'monthly') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (timeframe === 'weekly') {
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }
    
    const filteredData = attendanceData.filter(record => new Date(record.date) >= startDate);
    const totalClasses = filteredData.length;
    const presentClasses = filteredData.filter(record => record.status === 'present').length;
    
    return totalClasses > 0 ? Math.round((presentClasses / totalClasses) * 100) : 0;
  }

  private calculatePaymentStreak(paymentData: any[]): number {
    let streak = 0;
    
    // Sort by due date desc
    const sortedData = paymentData.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());
    
    for (const payment of sortedData) {
      if (payment.status === 'completed' && new Date(payment.paidDate) <= new Date(payment.dueDate)) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  }

  private calculatePerformanceImprovement(performanceHistory: any[], timeframe?: string): number {
    // Mock implementation - would need actual performance tracking
    return Math.floor(Math.random() * 5) + 1;
  }

  // Public methods for external use
  async triggerAttendanceEvent(studentId: number, attendanceData: any): Promise<void> {
    await this.processGamificationEvent({
      studentId,
      eventType: 'attendance_marked',
      data: attendanceData,
      timestamp: new Date()
    });
  }

  async triggerPaymentEvent(studentId: number, paymentData: any): Promise<void> {
    await this.processGamificationEvent({
      studentId,
      eventType: 'payment_made',
      data: paymentData,
      timestamp: new Date()
    });
  }

  async triggerMilestoneEvent(studentId: number, milestoneData: any): Promise<void> {
    await this.processGamificationEvent({
      studentId,
      eventType: 'milestone_reached',
      data: milestoneData,
      timestamp: new Date()
    });
  }
}

export const gamificationService = GamificationService.getInstance();