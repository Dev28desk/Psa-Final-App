import { storage } from "./storage";
import { sendWhatsAppNotification } from "./notifications";
import { format, addDays, subDays, isBefore, isAfter } from "date-fns";

interface CampaignAutomationRule {
  type: string;
  conditions: any;
  actions: any;
}

export class CampaignAutomation {
  private static instance: CampaignAutomation;
  private intervals: Map<number, NodeJS.Timeout> = new Map();

  static getInstance(): CampaignAutomation {
    if (!CampaignAutomation.instance) {
      CampaignAutomation.instance = new CampaignAutomation();
    }
    return CampaignAutomation.instance;
  }

  async initializeAutomation() {
    console.log("Initializing campaign automation...");
    
    // Load active campaigns and set up automation
    const campaigns = await storage.getCampaigns({ status: 'active' });
    
    for (const campaign of campaigns) {
      this.setupCampaignAutomation(campaign);
    }
  }

  private setupCampaignAutomation(campaign: any) {
    if (campaign.trigger === 'automated' && campaign.automationRules) {
      const rule = campaign.automationRules as CampaignAutomationRule;
      
      switch (rule.type) {
        case 'fee_reminder':
          this.setupFeeReminderAutomation(campaign, rule);
          break;
        case 'welcome_message':
          this.setupWelcomeAutomation(campaign, rule);
          break;
        case 'attendance_followup':
          this.setupAttendanceAutomation(campaign, rule);
          break;
        case 'birthday_wishes':
          this.setupBirthdayAutomation(campaign, rule);
          break;
      }
    }
  }

  private setupFeeReminderAutomation(campaign: any, rule: CampaignAutomationRule) {
    // Run fee reminder check daily at 10 AM
    const interval = setInterval(async () => {
      try {
        const pendingPayments = await storage.getPendingPayments();
        const daysBefore = rule.conditions.daysBefore || 3;
        
        for (const payment of pendingPayments) {
          const dueDate = new Date(payment.dueDate);
          const reminderDate = subDays(dueDate, daysBefore);
          
          if (isBefore(new Date(), dueDate) && isAfter(new Date(), reminderDate)) {
            await this.sendCampaignMessage(campaign, payment.student, {
              amount: payment.amount,
              dueDate: format(dueDate, 'dd MMM yyyy'),
              studentName: payment.student.name
            });
          }
        }
      } catch (error) {
        console.error("Fee reminder automation error:", error);
      }
    }, 24 * 60 * 60 * 1000); // Run daily

    this.intervals.set(campaign.id, interval);
  }

  private setupWelcomeAutomation(campaign: any, rule: CampaignAutomationRule) {
    // Check for new students every hour
    const interval = setInterval(async () => {
      try {
        const yesterday = subDays(new Date(), 1);
        const students = await storage.getStudents({});
        
        for (const student of students.students) {
          if (student.joiningDate && isAfter(new Date(student.joiningDate), yesterday)) {
            await this.sendCampaignMessage(campaign, student, {
              studentName: student.name,
              sportName: student.batch?.sport?.name || 'Academy',
              batchName: student.batch?.name || 'Batch'
            });
          }
        }
      } catch (error) {
        console.error("Welcome automation error:", error);
      }
    }, 60 * 60 * 1000); // Run hourly

    this.intervals.set(campaign.id, interval);
  }

  private setupAttendanceAutomation(campaign: any, rule: CampaignAutomationRule) {
    // Check attendance weekly
    const interval = setInterval(async () => {
      try {
        const students = await storage.getStudents({});
        const absentThreshold = rule.conditions.consecutiveAbsences || 3;
        
        for (const student of students.students) {
          const attendance = await storage.getStudentAttendance(student.id, subDays(new Date(), 7));
          const absentCount = attendance.filter(a => a.status === 'absent').length;
          
          if (absentCount >= absentThreshold) {
            await this.sendCampaignMessage(campaign, student, {
              studentName: student.name,
              absentDays: absentCount,
              sportName: student.batch?.sport?.name || 'Academy'
            });
          }
        }
      } catch (error) {
        console.error("Attendance automation error:", error);
      }
    }, 7 * 24 * 60 * 60 * 1000); // Run weekly

    this.intervals.set(campaign.id, interval);
  }

  private setupBirthdayAutomation(campaign: any, rule: CampaignAutomationRule) {
    // Check birthdays daily at 9 AM
    const interval = setInterval(async () => {
      try {
        const today = new Date();
        const students = await storage.getStudents({});
        
        for (const student of students.students) {
          if (student.dateOfBirth) {
            const birthday = new Date(student.dateOfBirth);
            if (birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate()) {
              await this.sendCampaignMessage(campaign, student, {
                studentName: student.name,
                age: today.getFullYear() - birthday.getFullYear()
              });
            }
          }
        }
      } catch (error) {
        console.error("Birthday automation error:", error);
      }
    }, 24 * 60 * 60 * 1000); // Run daily

    this.intervals.set(campaign.id, interval);
  }

  private async sendCampaignMessage(campaign: any, student: any, variables: any) {
    try {
      // Create campaign message record
      const messageRecord = await storage.createCampaignMessage({
        campaignId: campaign.id,
        recipient: student.phone,
        studentId: student.id,
        messageContent: this.processMessageTemplate(campaign.messageTemplate.text, variables),
        status: 'pending'
      });

      // Send WhatsApp message
      const message = this.processMessageTemplate(campaign.messageTemplate.text, variables);
      
      await sendWhatsAppNotification({
        to: student.phone,
        message,
        type: 'general'
      });

      // Update message status
      await storage.updateCampaignMessage(messageRecord.id, {
        status: 'sent',
        sentAt: new Date()
      });

      // Update campaign analytics
      const analytics = campaign.analytics || { sent: 0, delivered: 0, read: 0, failed: 0 };
      analytics.sent = (analytics.sent || 0) + 1;
      
      await storage.updateCampaign(campaign.id, {
        analytics,
        lastRunAt: new Date()
      });

    } catch (error) {
      console.error("Campaign message error:", error);
      
      // Update message status as failed
      await storage.updateCampaignMessage(messageRecord.id, {
        status: 'failed',
        errorMessage: error.message
      });
    }
  }

  private processMessageTemplate(template: string, variables: any): string {
    let message = template;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      message = message.replace(new RegExp(placeholder, 'g'), String(value));
    }
    
    return message;
  }

  stopCampaignAutomation(campaignId: number) {
    const interval = this.intervals.get(campaignId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(campaignId);
    }
  }

  async restartCampaignAutomation(campaignId: number) {
    this.stopCampaignAutomation(campaignId);
    
    const campaign = await storage.getCampaign(campaignId);
    if (campaign) {
      this.setupCampaignAutomation(campaign);
    }
  }
}

// Pre-defined campaign templates
export const campaignTemplates = {
  welcome: {
    name: "Welcome New Students",
    type: "welcome_message",
    trigger: "automated",
    messageTemplate: {
      text: "🎉 Welcome to Parmanand Sports Academy, {studentName}!\n\nWe're excited to have you join our {sportName} program. Your journey with us starts now!\n\nBatch: {batchName}\nGet ready for an amazing sports experience!\n\nBest regards,\nParmanand Sports Academy Team",
      variables: ["studentName", "sportName", "batchName"]
    },
    automationRules: {
      type: "welcome_message",
      conditions: { triggerOnEnrollment: true },
      actions: { sendImmediately: true }
    }
  },
  feeReminder: {
    name: "Fee Payment Reminder",
    type: "fee_reminder",
    trigger: "automated",
    messageTemplate: {
      text: "💰 Fee Reminder - Parmanand Sports Academy\n\nHi {studentName},\n\nThis is a friendly reminder that your fee payment of ₹{amount} is due on {dueDate}.\n\nPlease make your payment at the earliest to continue your training without interruption.\n\nThank you!\nParmanand Sports Academy",
      variables: ["studentName", "amount", "dueDate"]
    },
    automationRules: {
      type: "fee_reminder",
      conditions: { daysBefore: 3 },
      actions: { sendDaily: true }
    }
  },
  attendanceFollowup: {
    name: "Attendance Follow-up",
    type: "attendance_followup",
    trigger: "automated",
    messageTemplate: {
      text: "📅 Attendance Alert - Parmanand Sports Academy\n\nHi {studentName},\n\nWe've noticed you've been absent for {absentDays} consecutive days from your {sportName} training.\n\nRegular attendance is crucial for your progress. Please contact us if you need any assistance.\n\nBest regards,\nParmanand Sports Academy",
      variables: ["studentName", "absentDays", "sportName"]
    },
    automationRules: {
      type: "attendance_followup",
      conditions: { consecutiveAbsences: 3 },
      actions: { sendWeekly: true }
    }
  },
  birthdayWishes: {
    name: "Birthday Wishes",
    type: "birthday",
    trigger: "automated",
    messageTemplate: {
      text: "🎂 Happy Birthday {studentName}!\n\nWishing you a wonderful {age}th birthday filled with joy, success, and great achievements!\n\nMay this new year bring you closer to your sports goals and dreams.\n\nCelebrate and enjoy your special day!\n\nWarm wishes,\nParmanand Sports Academy Team",
      variables: ["studentName", "age"]
    },
    automationRules: {
      type: "birthday_wishes",
      conditions: { sendOnBirthday: true },
      actions: { sendAnnually: true }
    }
  }
};