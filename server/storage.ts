import { 
  users, coaches, students, sports, batches, payments, attendance, activities, communications, settings, icons, paymentGateways,
  type User, type InsertUser, type Coach, type InsertCoach, type Student, type InsertStudent, type Sport, type InsertSport,
  type Batch, type InsertBatch, type Payment, type InsertPayment, type Attendance, type InsertAttendance,
  type Activity, type InsertActivity, type Communication, type InsertCommunication,
  type Setting, type InsertSetting, type Icon, type InsertIcon, type PaymentGateway, type InsertPaymentGateway
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, gte, lte, count, sum, avg, like, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByPhone(phone: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Coach operations
  getCoach(id: number): Promise<Coach | undefined>;
  getCoaches(isActive?: boolean): Promise<Coach[]>;
  createCoach(coach: InsertCoach): Promise<Coach>;
  updateCoach(id: number, updates: Partial<InsertCoach>): Promise<Coach | undefined>;
  deleteCoach(id: number): Promise<boolean>;

  // Student operations
  getStudent(id: number): Promise<Student | undefined>;
  getStudentByStudentId(studentId: string): Promise<Student | undefined>;
  getStudents(filters?: {
    sportId?: number;
    batchId?: number;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ students: Student[]; total: number }>;
  createStudent(student: InsertStudent): Promise<Student>;
  updateStudent(id: number, updates: Partial<InsertStudent>): Promise<Student | undefined>;
  deleteStudent(id: number): Promise<boolean>;

  // Sport operations
  getSport(id: number): Promise<Sport | undefined>;
  getSports(isActive?: boolean): Promise<Sport[]>;
  createSport(sport: InsertSport): Promise<Sport>;
  updateSport(id: number, updates: Partial<InsertSport>): Promise<Sport | undefined>;

  // Batch operations
  getBatch(id: number): Promise<Batch | undefined>;
  getBatches(filters?: { sportId?: number; coachId?: number; isActive?: boolean }): Promise<Batch[]>;
  createBatch(batch: InsertBatch): Promise<Batch>;
  updateBatch(id: number, updates: Partial<InsertBatch>): Promise<Batch | undefined>;
  updateBatchCapacity(id: number, increment: number): Promise<Batch | undefined>;

  // Payment operations
  getPayment(id: number): Promise<Payment | undefined>;
  getPayments(filters?: {
    studentId?: number;
    status?: string;
    monthYear?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ payments: Payment[]; total: number }>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment | undefined>;
  getPendingPayments(): Promise<Payment[]>;
  getRevenueStats(startDate?: Date, endDate?: Date): Promise<{
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  }>;

  // Attendance operations
  getAttendance(id: number): Promise<Attendance | undefined>;
  getAttendanceByDate(date: string, batchId?: number): Promise<Attendance[]>;
  getStudentAttendance(studentId: number, startDate?: Date, endDate?: Date): Promise<Attendance[]>;
  markAttendance(attendance: InsertAttendance): Promise<Attendance>;
  updateAttendance(id: number, updates: Partial<InsertAttendance>): Promise<Attendance | undefined>;
  getAttendanceStats(batchId?: number, date?: Date): Promise<{
    total: number;
    present: number;
    absent: number;
    percentage: number;
  }>;

  // Activity operations
  getActivities(limit?: number, offset?: number): Promise<{ activities: Activity[]; total: number }>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Communication operations
  getCommunications(filters?: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ communications: Communication[]; total: number }>;
  createCommunication(communication: InsertCommunication): Promise<Communication>;
  updateCommunication(id: number, updates: Partial<InsertCommunication>): Promise<Communication | undefined>;

  // Dashboard analytics
  getDashboardStats(): Promise<{
    totalStudents: number;
    activeStudents: number;
    totalRevenue: number;
    pendingFees: number;
    todayAttendance: number;
    sportsDistribution: Array<{ sport: string; count: number; percentage: number }>;
    recentActivities: Activity[];
  }>;

  // Reports
  getMonthlyRevenueReport(year: number): Promise<Array<{ month: string; revenue: number }>>;
  getStudentReport(filters?: {
    sportId?: number;
    batchId?: number;
    feeStatus?: string;
  }): Promise<Student[]>;
  getAttendanceReport(startDate: Date, endDate: Date, batchId?: number): Promise<{
    students: Array<{
      student: Student;
      totalClasses: number;
      presentClasses: number;
      absentClasses: number;
      percentage: number;
    }>;
  }>;

  // Settings operations
  getSetting(key: string): Promise<Setting | undefined>;
  getSettings(category?: string): Promise<Setting[]>;
  setSetting(key: string, value: any, category?: string): Promise<Setting>;
  updateSetting(key: string, value: any): Promise<Setting | undefined>;

  // Icons operations
  getIcons(category?: string): Promise<Icon[]>;
  getIcon(id: number): Promise<Icon | undefined>;
  createIcon(icon: InsertIcon): Promise<Icon>;
  updateIcon(id: number, updates: Partial<InsertIcon>): Promise<Icon | undefined>;
  deleteIcon(id: number): Promise<boolean>;

  // Payment gateways operations
  getPaymentGateways(): Promise<PaymentGateway[]>;
  getPaymentGateway(id: number): Promise<PaymentGateway | undefined>;
  createPaymentGateway(gateway: InsertPaymentGateway): Promise<PaymentGateway>;
  updatePaymentGateway(id: number, updates: Partial<InsertPaymentGateway>): Promise<PaymentGateway | undefined>;
  deletePaymentGateway(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByPhone(phone: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.phone, phone));
    return user;
  }

  async createUser(userData: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  // Coach operations
  async getCoach(id: number): Promise<Coach | undefined> {
    const [coach] = await db.select().from(coaches).where(eq(coaches.id, id));
    return coach;
  }

  async getCoaches(isActive?: boolean): Promise<Coach[]> {
    const conditions = isActive !== undefined ? [eq(coaches.isActive, isActive)] : [];
    return await db.select().from(coaches).where(and(...conditions)).orderBy(asc(coaches.name));
  }

  async createCoach(coachData: InsertCoach): Promise<Coach> {
    const [coach] = await db.insert(coaches).values(coachData).returning();
    return coach;
  }

  async updateCoach(id: number, updates: Partial<InsertCoach>): Promise<Coach | undefined> {
    const [coach] = await db
      .update(coaches)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(coaches.id, id))
      .returning();
    return coach;
  }

  async deleteCoach(id: number): Promise<boolean> {
    const result = await db.delete(coaches).where(eq(coaches.id, id));
    return result.rowCount > 0;
  }

  // Student operations
  async getStudent(id: number): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.id, id));
    return student;
  }

  async getStudentByStudentId(studentId: string): Promise<Student | undefined> {
    const [student] = await db.select().from(students).where(eq(students.studentId, studentId));
    return student;
  }

  async getStudents(filters?: {
    sportId?: number;
    batchId?: number;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ students: Student[]; total: number }> {
    const conditions = [];
    
    if (filters?.sportId) conditions.push(eq(students.sportId, filters.sportId));
    if (filters?.batchId) conditions.push(eq(students.batchId, filters.batchId));
    if (filters?.isActive !== undefined) conditions.push(eq(students.isActive, filters.isActive));
    if (filters?.search) {
      conditions.push(
        or(
          like(students.name, `%${filters.search}%`),
          like(students.phone, `%${filters.search}%`),
          like(students.studentId, `%${filters.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [studentsResult, totalResult] = await Promise.all([
      db.select().from(students)
        .where(whereClause)
        .limit(filters?.limit || 50)
        .offset(filters?.offset || 0)
        .orderBy(desc(students.createdAt)),
      db.select({ count: count() }).from(students).where(whereClause)
    ]);

    return {
      students: studentsResult,
      total: totalResult[0]?.count || 0
    };
  }

  async createStudent(studentData: InsertStudent): Promise<Student> {
    const [student] = await db.insert(students).values(studentData).returning();
    return student;
  }

  async updateStudent(id: number, updates: Partial<InsertStudent>): Promise<Student | undefined> {
    const [student] = await db
      .update(students)
      .set(updates)
      .where(eq(students.id, id))
      .returning();
    return student;
  }

  async deleteStudent(id: number): Promise<boolean> {
    const result = await db.delete(students).where(eq(students.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Sport operations
  async getSport(id: number): Promise<Sport | undefined> {
    const [sport] = await db.select().from(sports).where(eq(sports.id, id));
    return sport;
  }

  async getSports(isActive?: boolean): Promise<Sport[]> {
    const whereClause = isActive !== undefined ? eq(sports.isActive, isActive) : undefined;
    return db.select().from(sports).where(whereClause).orderBy(asc(sports.name));
  }

  async createSport(sportData: InsertSport): Promise<Sport> {
    const [sport] = await db.insert(sports).values(sportData).returning();
    return sport;
  }

  async updateSport(id: number, updates: Partial<InsertSport>): Promise<Sport | undefined> {
    const [sport] = await db
      .update(sports)
      .set(updates)
      .where(eq(sports.id, id))
      .returning();
    return sport;
  }

  // Batch operations
  async getBatch(id: number): Promise<Batch | undefined> {
    const [batch] = await db.select().from(batches).where(eq(batches.id, id));
    return batch;
  }

  async getBatches(filters?: { sportId?: number; coachId?: number; isActive?: boolean }): Promise<Batch[]> {
    const conditions = [];
    
    if (filters?.sportId) conditions.push(eq(batches.sportId, filters.sportId));
    if (filters?.coachId) conditions.push(eq(batches.coachId, filters.coachId));
    if (filters?.isActive !== undefined) conditions.push(eq(batches.isActive, filters.isActive));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    return db.select().from(batches).where(whereClause).orderBy(asc(batches.name));
  }

  async createBatch(batchData: InsertBatch): Promise<Batch> {
    const [batch] = await db.insert(batches).values(batchData).returning();
    return batch;
  }

  async updateBatch(id: number, updates: Partial<InsertBatch>): Promise<Batch | undefined> {
    const [batch] = await db
      .update(batches)
      .set(updates)
      .where(eq(batches.id, id))
      .returning();
    return batch;
  }

  async updateBatchCapacity(id: number, increment: number): Promise<Batch | undefined> {
    const [batch] = await db
      .update(batches)
      .set({
        currentCapacity: sql`${batches.currentCapacity} + ${increment}`
      })
      .where(eq(batches.id, id))
      .returning();
    return batch;
  }

  // Payment operations
  async getPayment(id: number): Promise<Payment | undefined> {
    const [payment] = await db.select().from(payments).where(eq(payments.id, id));
    return payment;
  }

  async getPayments(filters?: {
    studentId?: number;
    status?: string;
    monthYear?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ payments: Payment[]; total: number }> {
    const conditions = [];
    
    if (filters?.studentId) conditions.push(eq(payments.studentId, filters.studentId));
    if (filters?.status) conditions.push(eq(payments.status, filters.status));
    if (filters?.monthYear) conditions.push(eq(payments.monthYear, filters.monthYear));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [paymentsResult, totalResult] = await Promise.all([
      db.select().from(payments)
        .where(whereClause)
        .limit(filters?.limit || 50)
        .offset(filters?.offset || 0)
        .orderBy(desc(payments.createdAt)),
      db.select({ count: count() }).from(payments).where(whereClause)
    ]);

    return {
      payments: paymentsResult,
      total: totalResult[0]?.count || 0
    };
  }

  async createPayment(paymentData: InsertPayment): Promise<Payment> {
    const [payment] = await db.insert(payments).values(paymentData).returning();
    return payment;
  }

  async updatePayment(id: number, updates: Partial<InsertPayment>): Promise<Payment | undefined> {
    const [payment] = await db
      .update(payments)
      .set(updates)
      .where(eq(payments.id, id))
      .returning();
    return payment;
  }

  async getPendingPayments(): Promise<Payment[]> {
    return db.select().from(payments)
      .where(eq(payments.status, 'pending'))
      .orderBy(desc(payments.dueDate));
  }

  async getRevenueStats(startDate?: Date, endDate?: Date): Promise<{
    total: number;
    thisMonth: number;
    lastMonth: number;
    growth: number;
  }> {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const [totalResult, thisMonthResult, lastMonthResult] = await Promise.all([
      db.select({ total: sum(payments.amount) }).from(payments)
        .where(eq(payments.status, 'completed')),
      db.select({ total: sum(payments.amount) }).from(payments)
        .where(and(
          eq(payments.status, 'completed'),
          gte(payments.paymentDate, thisMonthStart)
        )),
      db.select({ total: sum(payments.amount) }).from(payments)
        .where(and(
          eq(payments.status, 'completed'),
          gte(payments.paymentDate, lastMonthStart),
          lte(payments.paymentDate, lastMonthEnd)
        ))
    ]);

    const total = Number(totalResult[0]?.total || 0);
    const thisMonth = Number(thisMonthResult[0]?.total || 0);
    const lastMonth = Number(lastMonthResult[0]?.total || 0);
    const growth = lastMonth > 0 ? ((thisMonth - lastMonth) / lastMonth) * 100 : 0;

    return { total, thisMonth, lastMonth, growth };
  }

  // Attendance operations
  async getAttendance(id: number): Promise<Attendance | undefined> {
    const [attendanceRecord] = await db.select().from(attendance).where(eq(attendance.id, id));
    return attendanceRecord;
  }

  async getAttendanceByDate(date: string, batchId?: number): Promise<Attendance[]> {
    const conditions = [eq(attendance.date, date)];
    if (batchId) conditions.push(eq(attendance.batchId, batchId));
    
    return db.select().from(attendance).where(and(...conditions));
  }

  async getStudentAttendance(studentId: number, startDate?: Date, endDate?: Date): Promise<Attendance[]> {
    const conditions = [eq(attendance.studentId, studentId)];
    if (startDate) conditions.push(gte(attendance.date, startDate.toISOString().split('T')[0]));
    if (endDate) conditions.push(lte(attendance.date, endDate.toISOString().split('T')[0]));
    
    return db.select().from(attendance)
      .where(and(...conditions))
      .orderBy(desc(attendance.date));
  }

  async markAttendance(attendanceData: InsertAttendance): Promise<Attendance> {
    const [attendanceRecord] = await db.insert(attendance).values(attendanceData).returning();
    return attendanceRecord;
  }

  async updateAttendance(id: number, updates: Partial<InsertAttendance>): Promise<Attendance | undefined> {
    const [attendanceRecord] = await db
      .update(attendance)
      .set(updates)
      .where(eq(attendance.id, id))
      .returning();
    return attendanceRecord;
  }

  async getAttendanceStats(batchId?: number, date?: Date): Promise<{
    total: number;
    present: number;
    absent: number;
    percentage: number;
  }> {
    const dateStr = date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];
    const conditions = [eq(attendance.date, dateStr)];
    if (batchId) conditions.push(eq(attendance.batchId, batchId));

    const [totalResult, presentResult] = await Promise.all([
      db.select({ count: count() }).from(attendance).where(and(...conditions)),
      db.select({ count: count() }).from(attendance)
        .where(and(...conditions, eq(attendance.status, 'present')))
    ]);

    const total = totalResult[0]?.count || 0;
    const present = presentResult[0]?.count || 0;
    const absent = total - present;
    const percentage = total > 0 ? (present / total) * 100 : 0;

    return { total, present, absent, percentage };
  }

  // Activity operations
  async getActivities(limit = 50, offset = 0): Promise<{ activities: Activity[]; total: number }> {
    const [activitiesResult, totalResult] = await Promise.all([
      db.select().from(activities)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(activities.createdAt)),
      db.select({ count: count() }).from(activities)
    ]);

    return {
      activities: activitiesResult,
      total: totalResult[0]?.count || 0
    };
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const [activity] = await db.insert(activities).values(activityData).returning();
    return activity;
  }

  // Communication operations
  async getCommunications(filters?: {
    type?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<{ communications: Communication[]; total: number }> {
    const conditions = [];
    
    if (filters?.type) conditions.push(eq(communications.type, filters.type));
    if (filters?.status) conditions.push(eq(communications.status, filters.status));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    const [communicationsResult, totalResult] = await Promise.all([
      db.select().from(communications)
        .where(whereClause)
        .limit(filters?.limit || 50)
        .offset(filters?.offset || 0)
        .orderBy(desc(communications.createdAt)),
      db.select({ count: count() }).from(communications).where(whereClause)
    ]);

    return {
      communications: communicationsResult,
      total: totalResult[0]?.count || 0
    };
  }

  async createCommunication(communicationData: InsertCommunication): Promise<Communication> {
    const [communication] = await db.insert(communications).values(communicationData).returning();
    return communication;
  }

  async updateCommunication(id: number, updates: Partial<InsertCommunication>): Promise<Communication | undefined> {
    const [communication] = await db
      .update(communications)
      .set(updates)
      .where(eq(communications.id, id))
      .returning();
    return communication;
  }

  // Dashboard analytics
  async getDashboardStats() {
    const [
      totalStudentsResult,
      activeStudentsResult,
      revenueResult,
      pendingFeesResult,
      todayAttendanceResult,
      sportsDistributionResult,
      recentActivitiesResult
    ] = await Promise.all([
      db.select({ count: count() }).from(students),
      db.select({ count: count() }).from(students).where(eq(students.isActive, true)),
      db.select({ total: sum(payments.amount) }).from(payments)
        .where(eq(payments.status, 'completed')),
      db.select({ total: sum(payments.amount) }).from(payments)
        .where(eq(payments.status, 'pending')),
      this.getAttendanceStats(),
      db.select({
        sportId: students.sportId,
        count: count()
      }).from(students)
        .where(eq(students.isActive, true))
        .groupBy(students.sportId),
      db.select().from(activities)
        .limit(10)
        .orderBy(desc(activities.createdAt))
    ]);

    // Get sport names for distribution
    const sportsData = await db.select().from(sports);
    const sportsMap = new Map(sportsData.map(sport => [sport.id, sport.name]));

    const totalStudents = totalStudentsResult[0]?.count || 0;
    const sportsDistribution = sportsDistributionResult.map(item => ({
      sport: sportsMap.get(item.sportId!) || 'Unknown',
      count: item.count,
      percentage: totalStudents > 0 ? (item.count / totalStudents) * 100 : 0
    }));

    return {
      totalStudents,
      activeStudents: activeStudentsResult[0]?.count || 0,
      totalRevenue: Number(revenueResult[0]?.total || 0),
      pendingFees: Number(pendingFeesResult[0]?.total || 0),
      todayAttendance: todayAttendanceResult.percentage,
      sportsDistribution,
      recentActivities: recentActivitiesResult
    };
  }

  // Reports
  async getMonthlyRevenueReport(year: number): Promise<Array<{ month: string; revenue: number }>> {
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    const results = await Promise.all(
      months.map(async (month, index) => {
        const monthYear = `${year}-${String(index + 1).padStart(2, '0')}`;
        const [result] = await db.select({ total: sum(payments.amount) })
          .from(payments)
          .where(and(
            eq(payments.status, 'completed'),
            like(payments.monthYear, `${monthYear}%`)
          ));
        
        return {
          month,
          revenue: Number(result?.total || 0)
        };
      })
    );

    return results;
  }

  async getStudentReport(filters?: {
    sportId?: number;
    batchId?: number;
    feeStatus?: string;
  }): Promise<Student[]> {
    const conditions = [eq(students.isActive, true)];
    
    if (filters?.sportId) conditions.push(eq(students.sportId, filters.sportId));
    if (filters?.batchId) conditions.push(eq(students.batchId, filters.batchId));

    return db.select().from(students)
      .where(and(...conditions))
      .orderBy(asc(students.name));
  }

  async getAttendanceReport(startDate: Date, endDate: Date, batchId?: number) {
    const conditions = [
      gte(attendance.date, startDate.toISOString().split('T')[0]),
      lte(attendance.date, endDate.toISOString().split('T')[0])
    ];
    
    if (batchId) conditions.push(eq(attendance.batchId, batchId));

    const attendanceData = await db.select({
      studentId: attendance.studentId,
      status: attendance.status
    }).from(attendance).where(and(...conditions));

    const studentIds = Array.from(new Set(attendanceData.map(a => a.studentId).filter(id => id !== null))) as number[];
    const studentsData = await db.select().from(students)
      .where(sql`${students.id} IN ${studentIds}`);

    const studentsMap = new Map(studentsData.map(s => [s.id, s]));

    const studentStats = studentIds.map(studentId => {
      const studentAttendance = attendanceData.filter(a => a.studentId === studentId);
      const totalClasses = studentAttendance.length;
      const presentClasses = studentAttendance.filter(a => a.status === 'present').length;
      const absentClasses = totalClasses - presentClasses;
      const percentage = totalClasses > 0 ? (presentClasses / totalClasses) * 100 : 0;

      return {
        student: studentsMap.get(studentId)!,
        totalClasses,
        presentClasses,
        absentClasses,
        percentage
      };
    });

    return { students: studentStats };
  }

  // Settings operations
  async getSetting(key: string): Promise<Setting | undefined> {
    const [setting] = await db.select().from(settings).where(eq(settings.key, key));
    return setting;
  }

  async getSettings(category?: string): Promise<Setting[]> {
    const conditions = category ? [eq(settings.category, category)] : [];
    return await db.select().from(settings).where(and(...conditions));
  }

  async setSetting(key: string, value: any, category = 'general'): Promise<Setting> {
    const [setting] = await db
      .insert(settings)
      .values({ key, value, category })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() }
      })
      .returning();
    return setting;
  }

  async updateSetting(key: string, value: any): Promise<Setting | undefined> {
    const [setting] = await db
      .update(settings)
      .set({ value, updatedAt: new Date() })
      .where(eq(settings.key, key))
      .returning();
    return setting;
  }

  // Icons operations
  async getIcons(category?: string): Promise<Icon[]> {
    const conditions = category ? [eq(icons.category, category)] : [];
    return await db.select().from(icons).where(and(...conditions));
  }

  async getIcon(id: number): Promise<Icon | undefined> {
    const [icon] = await db.select().from(icons).where(eq(icons.id, id));
    return icon;
  }

  async createIcon(iconData: InsertIcon): Promise<Icon> {
    const [icon] = await db.insert(icons).values(iconData).returning();
    return icon;
  }

  async updateIcon(id: number, updates: Partial<InsertIcon>): Promise<Icon | undefined> {
    const [icon] = await db
      .update(icons)
      .set(updates)
      .where(eq(icons.id, id))
      .returning();
    return icon;
  }

  async deleteIcon(id: number): Promise<boolean> {
    const result = await db.delete(icons).where(eq(icons.id, id));
    return result.rowCount > 0;
  }

  // Payment gateways operations
  async getPaymentGateways(): Promise<PaymentGateway[]> {
    return await db.select().from(paymentGateways);
  }

  async getPaymentGateway(id: number): Promise<PaymentGateway | undefined> {
    const [gateway] = await db.select().from(paymentGateways).where(eq(paymentGateways.id, id));
    return gateway;
  }

  async createPaymentGateway(gatewayData: InsertPaymentGateway): Promise<PaymentGateway> {
    const [gateway] = await db.insert(paymentGateways).values(gatewayData).returning();
    return gateway;
  }

  async updatePaymentGateway(id: number, updates: Partial<InsertPaymentGateway>): Promise<PaymentGateway | undefined> {
    const [gateway] = await db
      .update(paymentGateways)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(paymentGateways.id, id))
      .returning();
    return gateway;
  }

  async deletePaymentGateway(id: number): Promise<boolean> {
    const result = await db.delete(paymentGateways).where(eq(paymentGateways.id, id));
    return result.rowCount > 0;
  }
}

export const storage = new DatabaseStorage();
