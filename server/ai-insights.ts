import { GoogleGenAI } from "@google/genai";
import { storage } from "./storage";

if (!process.env.GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is required for AI Insights functionality");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateStudentInsights() {
  try {
    const students = await storage.getStudents();
    const payments = await storage.getPayments();
    const attendance = await storage.getAttendanceStats();
    const dashboardStats = await storage.getDashboardStats();

    const prompt = `
    Analyze this sports academy data and provide actionable insights:

    Student Data:
    - Total Students: ${dashboardStats.totalStudents}
    - Active Students: ${dashboardStats.activeStudents}
    - Sports Distribution: ${JSON.stringify(dashboardStats.sportsDistribution)}

    Financial Data:
    - Total Revenue: ${dashboardStats.totalRevenue}
    - Pending Fees: ${dashboardStats.pendingFees}
    - Payment Stats: ${JSON.stringify(payments)}

    Attendance Data:
    - Today's Attendance: ${dashboardStats.todayAttendance}
    - Overall Stats: ${JSON.stringify(attendance)}

    Please provide:
    1. Key performance indicators
    2. Areas of concern
    3. Recommendations for improvement
    4. Growth opportunities
    5. Student engagement insights

    Format as JSON with sections: kpis, concerns, recommendations, opportunities, engagement
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Insights Error:", error);
    throw new Error("Failed to generate AI insights");
  }
}

export async function generateRevenueAnalysis() {
  try {
    const revenueStats = await storage.getRevenueStats();
    const monthlyRevenue = await storage.getMonthlyRevenueReport(new Date().getFullYear());

    const prompt = `
    Analyze this revenue data and provide insights:

    Revenue Stats:
    - Total Revenue: ${revenueStats.total}
    - This Month: ${revenueStats.thisMonth}
    - Last Month: ${revenueStats.lastMonth}
    - Growth: ${revenueStats.growth}%

    Monthly Data: ${JSON.stringify(monthlyRevenue)}

    Provide analysis on:
    1. Revenue trends
    2. Seasonal patterns
    3. Growth predictions
    4. Optimization strategies

    Format as JSON with sections: trends, patterns, predictions, strategies
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Revenue Analysis Error:", error);
    throw new Error("Failed to generate revenue analysis");
  }
}

export async function generateAttendanceInsights() {
  try {
    const attendance = await storage.getAttendanceStats();
    const recentAttendance = await storage.getAttendanceByDate(new Date().toISOString().split('T')[0]);

    const prompt = `
    Analyze attendance data:

    Overall Stats:
    - Total: ${attendance.total}
    - Present: ${attendance.present}
    - Absent: ${attendance.absent}
    - Percentage: ${attendance.percentage}%

    Recent Attendance: ${JSON.stringify(recentAttendance)}

    Provide insights on:
    1. Attendance patterns
    2. Concerning trends
    3. Improvement suggestions
    4. Student engagement levels

    Format as JSON with sections: patterns, concerns, suggestions, engagement
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Attendance Analysis Error:", error);
    throw new Error("Failed to generate attendance insights");
  }
}