import { db } from "./db";
import { 
  students, 
  payments, 
  attendance, 
  sports, 
  batches, 
  coaches,
  customReports,
  reportExecutions,
  savedQueries,
  type CustomReport,
  type ReportExecution,
  type SavedQuery
} from "@shared/schema";
import { eq, and, or, gte, lte, like, count, sum, avg, desc, asc, sql, inArray } from "drizzle-orm";
import { alias } from "drizzle-orm/pg-core";
import * as XLSX from "xlsx";
import { format } from "date-fns";

interface QueryConfig {
  tables: string[];
  fields: Array<{
    table: string;
    field: string;
    alias?: string;
    aggregate?: 'count' | 'sum' | 'avg' | 'min' | 'max';
  }>;
  filters: Array<{
    field: string;
    operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'like' | 'in' | 'between';
    value: any;
  }>;
  groupBy?: string[];
  orderBy?: Array<{
    field: string;
    direction: 'asc' | 'desc';
  }>;
  joins?: Array<{
    table: string;
    on: string;
    type: 'inner' | 'left' | 'right';
  }>;
  limit?: number;
}

export class ReportGenerator {
  private static instance: ReportGenerator;
  private tableMap: Record<string, any> = {
    students,
    payments,
    attendance,
    sports,
    batches,
    coaches,
  };

  static getInstance(): ReportGenerator {
    if (!ReportGenerator.instance) {
      ReportGenerator.instance = new ReportGenerator();
    }
    return ReportGenerator.instance;
  }

  async executeQuery(config: QueryConfig): Promise<any[]> {
    try {
      // Build base query
      const baseTable = this.tableMap[config.tables[0]];
      let query = db.select().from(baseTable);

      // Apply joins
      if (config.joins) {
        for (const join of config.joins) {
          const joinTable = this.tableMap[join.table];
          if (join.type === 'left') {
            query = query.leftJoin(joinTable, sql.raw(join.on));
          } else if (join.type === 'inner') {
            query = query.innerJoin(joinTable, sql.raw(join.on));
          }
        }
      }

      // Apply filters
      if (config.filters && config.filters.length > 0) {
        const conditions = config.filters.map(filter => {
          const [table, field] = filter.field.split('.');
          const tableRef = this.tableMap[table];
          const column = tableRef[field];

          switch (filter.operator) {
            case 'eq':
              return eq(column, filter.value);
            case 'ne':
              return sql`${column} != ${filter.value}`;
            case 'gt':
              return sql`${column} > ${filter.value}`;
            case 'gte':
              return gte(column, filter.value);
            case 'lt':
              return sql`${column} < ${filter.value}`;
            case 'lte':
              return lte(column, filter.value);
            case 'like':
              return like(column, `%${filter.value}%`);
            case 'in':
              return inArray(column, filter.value);
            case 'between':
              return and(gte(column, filter.value[0]), lte(column, filter.value[1]));
            default:
              return eq(column, filter.value);
          }
        });
        
        query = query.where(and(...conditions));
      }

      // Apply groupBy
      if (config.groupBy && config.groupBy.length > 0) {
        const groupColumns = config.groupBy.map(field => {
          const [table, column] = field.split('.');
          return this.tableMap[table][column];
        });
        query = query.groupBy(...groupColumns);
      }

      // Apply orderBy
      if (config.orderBy && config.orderBy.length > 0) {
        const orderColumns = config.orderBy.map(order => {
          const [table, column] = order.field.split('.');
          const col = this.tableMap[table][column];
          return order.direction === 'desc' ? desc(col) : asc(col);
        });
        query = query.orderBy(...orderColumns);
      }

      // Apply limit
      if (config.limit) {
        query = query.limit(config.limit);
      }

      return await query;
    } catch (error) {
      console.error('Error executing query:', error);
      throw error;
    }
  }

  async generateReport(reportId: number, executedBy: number): Promise<ReportExecution> {
    try {
      // Get report configuration
      const [report] = await db
        .select()
        .from(customReports)
        .where(eq(customReports.id, reportId));

      if (!report) {
        throw new Error('Report not found');
      }

      // Create execution record
      const [execution] = await db
        .insert(reportExecutions)
        .values({
          reportId,
          status: 'running',
          executedBy,
          metadata: { startTime: new Date().toISOString() }
        })
        .returning();

      try {
        // Execute query
        const queryConfig = report.queryConfig as QueryConfig;
        const results = await this.executeQuery(queryConfig);

        // Generate different formats based on report type
        const reportData = {
          data: results,
          metadata: {
            generatedAt: new Date().toISOString(),
            recordCount: results.length,
            queryConfig,
            chartConfig: report.chartConfig
          }
        };

        // Update execution with results
        const [updatedExecution] = await db
          .update(reportExecutions)
          .set({
            status: 'completed',
            result: reportData,
            completedAt: new Date(),
            metadata: {
              ...execution.metadata,
              endTime: new Date().toISOString(),
              recordCount: results.length
            }
          })
          .where(eq(reportExecutions.id, execution.id))
          .returning();

        return updatedExecution;
      } catch (error) {
        // Update execution with error
        await db
          .update(reportExecutions)
          .set({
            status: 'failed',
            errorMessage: error.message,
            completedAt: new Date()
          })
          .where(eq(reportExecutions.id, execution.id));

        throw error;
      }
    } catch (error) {
      console.error('Error generating report:', error);
      throw error;
    }
  }

  async exportToExcel(data: any[], filename: string): Promise<string> {
    try {
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Report Data');
      
      const filepath = `reports/${filename}_${Date.now()}.xlsx`;
      XLSX.writeFile(workbook, filepath);
      
      return filepath;
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      throw error;
    }
  }

  async scheduleReport(reportId: number) {
    try {
      const [report] = await db
        .select()
        .from(customReports)
        .where(eq(customReports.id, reportId));

      if (!report || !report.scheduleConfig) {
        throw new Error('Report or schedule configuration not found');
      }

      const scheduleConfig = report.scheduleConfig as any;
      
      // This would integrate with a job scheduler like node-cron
      // For now, we'll just log the scheduling
      console.log(`Scheduling report ${reportId} with config:`, scheduleConfig);
      
      // Update last run time
      await db
        .update(customReports)
        .set({ lastRunAt: new Date() })
        .where(eq(customReports.id, reportId));
        
    } catch (error) {
      console.error('Error scheduling report:', error);
      throw error;
    }
  }

  // Predefined report templates
  getPredefinedReports() {
    return {
      studentEnrollment: {
        name: "Student Enrollment Report",
        category: "students",
        queryConfig: {
          tables: ["students", "sports", "batches"],
          fields: [
            { table: "students", field: "name", alias: "Student Name" },
            { table: "students", field: "email", alias: "Email" },
            { table: "students", field: "phone", alias: "Phone" },
            { table: "sports", field: "name", alias: "Sport" },
            { table: "batches", field: "name", alias: "Batch" },
            { table: "students", field: "createdAt", alias: "Enrollment Date" }
          ],
          joins: [
            { table: "sports", on: "students.sport_id = sports.id", type: "left" },
            { table: "batches", on: "students.batch_id = batches.id", type: "left" }
          ],
          orderBy: [{ field: "students.createdAt", direction: "desc" }]
        },
        chartConfig: {
          type: "line",
          xAxis: "Enrollment Date",
          yAxis: "Student Count",
          title: "Student Enrollment Trend"
        }
      },
      paymentSummary: {
        name: "Payment Summary Report",
        category: "payments",
        queryConfig: {
          tables: ["payments", "students", "sports"],
          fields: [
            { table: "students", field: "name", alias: "Student Name" },
            { table: "sports", field: "name", alias: "Sport" },
            { table: "payments", field: "amount", alias: "Amount" },
            { table: "payments", field: "paymentMethod", alias: "Payment Method" },
            { table: "payments", field: "status", alias: "Status" },
            { table: "payments", field: "createdAt", alias: "Payment Date" }
          ],
          joins: [
            { table: "students", on: "payments.student_id = students.id", type: "left" },
            { table: "sports", on: "students.sport_id = sports.id", type: "left" }
          ],
          orderBy: [{ field: "payments.createdAt", direction: "desc" }]
        },
        chartConfig: {
          type: "bar",
          xAxis: "Payment Method",
          yAxis: "Total Amount",
          title: "Payment Methods Distribution"
        }
      },
      attendanceReport: {
        name: "Attendance Report",
        category: "attendance",
        queryConfig: {
          tables: ["attendance", "students", "batches", "sports"],
          fields: [
            { table: "students", field: "name", alias: "Student Name" },
            { table: "sports", field: "name", alias: "Sport" },
            { table: "batches", field: "name", alias: "Batch" },
            { table: "attendance", field: "status", alias: "Status" },
            { table: "attendance", field: "date", alias: "Date" }
          ],
          joins: [
            { table: "students", on: "attendance.student_id = students.id", type: "left" },
            { table: "batches", on: "attendance.batch_id = batches.id", type: "left" },
            { table: "sports", on: "students.sport_id = sports.id", type: "left" }
          ],
          orderBy: [{ field: "attendance.date", direction: "desc" }]
        },
        chartConfig: {
          type: "pie",
          title: "Attendance Distribution"
        }
      },
      revenueAnalysis: {
        name: "Revenue Analysis Report",
        category: "financial",
        queryConfig: {
          tables: ["payments", "sports"],
          fields: [
            { table: "sports", field: "name", alias: "Sport" },
            { table: "payments", field: "amount", aggregate: "sum", alias: "Total Revenue" },
            { table: "payments", field: "id", aggregate: "count", alias: "Payment Count" }
          ],
          joins: [
            { table: "students", on: "payments.student_id = students.id", type: "left" },
            { table: "sports", on: "students.sport_id = sports.id", type: "left" }
          ],
          filters: [
            { field: "payments.status", operator: "eq", value: "completed" }
          ],
          groupBy: ["sports.name"],
          orderBy: [{ field: "payments.amount", direction: "desc" }]
        },
        chartConfig: {
          type: "bar",
          xAxis: "Sport",
          yAxis: "Total Revenue",
          title: "Revenue by Sport"
        }
      }
    };
  }
}

export const reportGenerator = ReportGenerator.getInstance();