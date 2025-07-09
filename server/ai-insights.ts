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

    // Clean up the response to remove markdown formatting
    let cleanedResponse = response.text || "{}";
    cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
    
    return JSON.parse(cleanedResponse);
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

    // Clean up the response to remove markdown formatting
    let cleanedResponse = response.text || "{}";
    cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
    
    return JSON.parse(cleanedResponse);
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

    // Clean up the response to remove markdown formatting
    let cleanedResponse = response.text || "{}";
    cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
    
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("Attendance Analysis Error:", error);
    throw new Error("Failed to generate attendance insights");
  }
}

export async function generateRetentionForecast() {
  try {
    const studentsData = await storage.getStudents();
    const paymentsData = await storage.getPayments();
    const attendance = await storage.getAttendanceStats();
    const dashboardStats = await storage.getDashboardStats();

    // Ensure data is in array format
    const students = Array.isArray(studentsData) ? studentsData : studentsData?.students || [];
    const payments = Array.isArray(paymentsData) ? paymentsData : paymentsData?.payments || [];

    // Calculate retention metrics
    const retentionMetrics = calculateRetentionMetrics(students, payments, attendance);

    const prompt = `
    Analyze this sports academy data to predict student retention and provide forecasting insights:

    Student Data:
    - Total Students: ${dashboardStats.totalStudents}
    - Active Students: ${dashboardStats.activeStudents}
    - Student Cohorts: ${JSON.stringify(retentionMetrics.cohorts)}
    - Dropout Patterns: ${JSON.stringify(retentionMetrics.dropoutPatterns)}

    Payment Data:
    - Payment Regularity: ${JSON.stringify(retentionMetrics.paymentPatterns)}
    - Pending Fees: ${dashboardStats.pendingFees}
    - Payment Defaults: ${JSON.stringify(retentionMetrics.paymentDefaults)}

    Attendance Data:
    - Attendance Rates: ${JSON.stringify(retentionMetrics.attendanceRates)}
    - Attendance Trends: ${JSON.stringify(retentionMetrics.attendanceTrends)}

    Please provide a comprehensive retention forecast including:
    1. Overall retention rate prediction for next 3 months
    2. High-risk students identification (criteria and list)
    3. Retention factors (positive and negative)
    4. Early warning indicators
    5. Intervention strategies
    6. Seasonal trends impact
    7. Sport-specific retention patterns
    8. Action plan for improvement

    Format as JSON with sections: 
    {
      "overallForecast": {
        "currentRetentionRate": number,
        "predictedRetentionRate": number,
        "confidenceScore": number,
        "timeframe": "3 months"
      },
      "highRiskStudents": {
        "count": number,
        "criteria": ["criteria1", "criteria2"],
        "riskFactors": ["factor1", "factor2"]
      },
      "retentionFactors": {
        "positive": ["factor1", "factor2"],
        "negative": ["factor1", "factor2"]
      },
      "warningIndicators": ["indicator1", "indicator2"],
      "interventionStrategies": ["strategy1", "strategy2"],
      "seasonalTrends": ["trend1", "trend2"],
      "sportSpecificPatterns": {"sport1": "pattern", "sport2": "pattern"},
      "actionPlan": ["action1", "action2"]
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            overallForecast: {
              type: "object",
              properties: {
                currentRetentionRate: { type: "number" },
                predictedRetentionRate: { type: "number" },
                confidenceScore: { type: "number" },
                timeframe: { type: "string" }
              }
            },
            highRiskStudents: {
              type: "object",
              properties: {
                count: { type: "number" },
                criteria: { type: "array", items: { type: "string" } },
                riskFactors: { type: "array", items: { type: "string" } }
              }
            },
            retentionFactors: {
              type: "object",
              properties: {
                positive: { type: "array", items: { type: "string" } },
                negative: { type: "array", items: { type: "string" } }
              }
            },
            warningIndicators: { type: "array", items: { type: "string" } },
            interventionStrategies: { type: "array", items: { type: "string" } },
            seasonalTrends: { type: "array", items: { type: "string" } },
            sportSpecificPatterns: { type: "object" },
            actionPlan: { type: "array", items: { type: "string" } }
          }
        }
      },
      contents: prompt,
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error('Error generating retention forecast:', error);
    return {
      overallForecast: {
        currentRetentionRate: 0,
        predictedRetentionRate: 0,
        confidenceScore: 0,
        timeframe: "3 months"
      },
      highRiskStudents: {
        count: 0,
        criteria: ["Data analysis unavailable"],
        riskFactors: ["System connectivity issues"]
      },
      retentionFactors: {
        positive: ["Unable to analyze"],
        negative: ["Data processing error"]
      },
      warningIndicators: ["System monitoring required"],
      interventionStrategies: ["Contact support for assistance"],
      seasonalTrends: ["Analysis unavailable"],
      sportSpecificPatterns: {},
      actionPlan: ["Verify system connectivity"]
    };
  }
}

function calculateRetentionMetrics(students: any[], payments: any[], attendance: any) {
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
  const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());

  // Calculate cohorts based on joining date
  const cohorts = {
    recent: students.filter(s => new Date(s.joiningDate) >= threeMonthsAgo).length,
    midTerm: students.filter(s => {
      const joinDate = new Date(s.joiningDate);
      return joinDate >= sixMonthsAgo && joinDate < threeMonthsAgo;
    }).length,
    longTerm: students.filter(s => new Date(s.joiningDate) < sixMonthsAgo).length
  };

  // Calculate dropout patterns
  const dropoutPatterns = {
    inactiveStudents: students.filter(s => !s.isActive).length,
    totalStudents: students.length,
    dropoutRate: students.length > 0 ? (students.filter(s => !s.isActive).length / students.length * 100) : 0
  };

  // Calculate payment patterns
  const paymentPatterns = {
    regularPayments: payments.filter(p => p.status === 'completed').length,
    pendingPayments: payments.filter(p => p.status === 'pending').length,
    failedPayments: payments.filter(p => p.status === 'failed').length
  };

  // Calculate payment defaults
  const paymentDefaults = {
    overdueFees: payments.filter(p => p.status === 'pending' && new Date(p.dueDate) < now).length,
    totalPayments: payments.length
  };

  // Calculate attendance rates (mock data for now)
  const attendanceRates = {
    overall: attendance?.averageAttendance || 0,
    byMonth: attendance?.monthlyStats || {},
    bySport: attendance?.sportStats || {}
  };

  // Calculate attendance trends
  const attendanceTrends = {
    declining: attendance?.decliningStudents || [],
    improving: attendance?.improvingStudents || [],
    stable: attendance?.stableStudents || []
  };

  return {
    cohorts,
    dropoutPatterns,
    paymentPatterns,
    paymentDefaults,
    attendanceRates,
    attendanceTrends
  };
}

export async function generateAIResponse(query: string) {
  try {
    // Get relevant data based on query context
    const [students, payments, attendance, revenueStats] = await Promise.all([
      storage.getStudents(),
      storage.getPayments(),
      storage.getAttendanceStats(),
      storage.getRevenueStats(),
    ]);

    const prompt = `
    You are an AI assistant for Parmanand Sports Academy. Answer the following question based on the academy data:

    Query: ${query}

    Academy Data:
    - Students: ${Array.isArray(students) ? students.length : students?.students?.length || 0} total students
    - Revenue Stats: Total: ₹${revenueStats.total}, This Month: ₹${revenueStats.thisMonth}, Growth: ${revenueStats.growth}%
    - Attendance: ${attendance.percentage}% average attendance
    - Recent Payments: ${Array.isArray(payments) ? payments.length : payments?.payments?.length || 0} payment records

    Please provide a helpful, specific answer based on this data. Be conversational and actionable.
    Keep your response concise but informative.

    Format your response as JSON with:
    {
      "answer": "your detailed response here",
      "suggestions": ["actionable suggestion 1", "actionable suggestion 2"],
      "confidence": 85
    }
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    // Clean up the response to remove markdown formatting
    let cleanedResponse = response.text || "{}";
    cleanedResponse = cleanedResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');
    
    return JSON.parse(cleanedResponse);
  } catch (error) {
    console.error("AI Response Error:", error);
    throw new Error("Failed to generate AI response");
  }
}