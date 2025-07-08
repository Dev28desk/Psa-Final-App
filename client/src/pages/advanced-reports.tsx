import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, TrendingUp, Users, Calendar, Download, Search, Plus, Play, Save, Database, BarChart3, Settings, Clock, Filter } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface CustomReport {
  id: number;
  name: string;
  description: string;
  category: string;
  queryConfig: any;
  chartConfig: any;
  createdAt: string;
  isPublic: boolean;
  isScheduled: boolean;
}

interface ReportExecution {
  id: number;
  reportId: number;
  status: string;
  result: any;
  executedAt: string;
  completedAt: string;
  errorMessage?: string;
}

interface QueryConfig {
  tables: string[];
  fields: Array<{
    table: string;
    field: string;
    alias?: string;
    aggregate?: string;
  }>;
  filters: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  groupBy?: string[];
  orderBy?: Array<{
    field: string;
    direction: string;
  }>;
  joins?: Array<{
    table: string;
    on: string;
    type: string;
  }>;
  limit?: number;
}

const AVAILABLE_TABLES = [
  { value: "students", label: "Students" },
  { value: "payments", label: "Payments" },
  { value: "attendance", label: "Attendance" },
  { value: "sports", label: "Sports" },
  { value: "batches", label: "Batches" },
  { value: "coaches", label: "Coaches" }
];

const AVAILABLE_FIELDS = {
  students: [
    { value: "name", label: "Name" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "createdAt", label: "Created At" },
    { value: "sportId", label: "Sport ID" },
    { value: "batchId", label: "Batch ID" }
  ],
  payments: [
    { value: "amount", label: "Amount" },
    { value: "paymentMethod", label: "Payment Method" },
    { value: "status", label: "Status" },
    { value: "createdAt", label: "Created At" },
    { value: "studentId", label: "Student ID" }
  ],
  attendance: [
    { value: "date", label: "Date" },
    { value: "status", label: "Status" },
    { value: "studentId", label: "Student ID" },
    { value: "batchId", label: "Batch ID" }
  ],
  sports: [
    { value: "name", label: "Name" },
    { value: "description", label: "Description" },
    { value: "fee", label: "Fee" },
    { value: "createdAt", label: "Created At" }
  ],
  batches: [
    { value: "name", label: "Name" },
    { value: "time", label: "Time" },
    { value: "capacity", label: "Capacity" },
    { value: "sportId", label: "Sport ID" }
  ],
  coaches: [
    { value: "name", label: "Name" },
    { value: "email", label: "Email" },
    { value: "phone", label: "Phone" },
    { value: "specialization", label: "Specialization" }
  ]
};

const OPERATORS = [
  { value: "eq", label: "Equals" },
  { value: "ne", label: "Not Equals" },
  { value: "gt", label: "Greater Than" },
  { value: "gte", label: "Greater Than or Equal" },
  { value: "lt", label: "Less Than" },
  { value: "lte", label: "Less Than or Equal" },
  { value: "like", label: "Contains" },
  { value: "in", label: "In" },
  { value: "between", label: "Between" }
];

const AGGREGATES = [
  { value: "count", label: "Count" },
  { value: "sum", label: "Sum" },
  { value: "avg", label: "Average" },
  { value: "min", label: "Minimum" },
  { value: "max", label: "Maximum" }
];

export default function AdvancedReports() {
  const [selectedTab, setSelectedTab] = useState("custom");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isQueryBuilderOpen, setIsQueryBuilderOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<Partial<CustomReport>>({});
  const [queryConfig, setQueryConfig] = useState<QueryConfig>({
    tables: [],
    fields: [],
    filters: [],
    groupBy: [],
    orderBy: [],
    joins: [],
    limit: 100
  });
  const [queryResults, setQueryResults] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch custom reports
  const { data: customReports, isLoading: reportsLoading } = useQuery({
    queryKey: ["/api/reports", selectedCategory],
    queryFn: async () => {
      const params = selectedCategory !== "all" ? `?category=${selectedCategory}` : "";
      const response = await fetch(`/api/reports${params}`);
      if (!response.ok) throw new Error("Failed to fetch reports");
      return response.json();
    }
  });

  // Fetch predefined templates
  const { data: templates } = useQuery({
    queryKey: ["/api/reports/templates/predefined"],
    queryFn: async () => {
      const response = await fetch("/api/reports/templates/predefined");
      if (!response.ok) throw new Error("Failed to fetch templates");
      return response.json();
    }
  });

  // Create report mutation
  const createReportMutation = useMutation({
    mutationFn: async (reportData: any) => {
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reportData)
      });
      if (!response.ok) throw new Error("Failed to create report");
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Report created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      setIsCreateDialogOpen(false);
      setCurrentReport({});
    },
    onError: (error: Error) => {
      toast({ title: "Error creating report", description: error.message, variant: "destructive" });
    }
  });

  // Execute query mutation
  const executeQueryMutation = useMutation({
    mutationFn: async (config: QueryConfig) => {
      const response = await fetch("/api/reports/execute-query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryConfig: config })
      });
      if (!response.ok) throw new Error("Failed to execute query");
      return response.json();
    },
    onSuccess: (data) => {
      setQueryResults(data);
      toast({ title: "Query executed successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Error executing query", description: error.message, variant: "destructive" });
    }
  });

  // Execute report mutation
  const executeReportMutation = useMutation({
    mutationFn: async (reportId: number) => {
      const response = await fetch(`/api/reports/${reportId}/execute`, {
        method: "POST"
      });
      if (!response.ok) throw new Error("Failed to execute report");
      return response.json();
    },
    onSuccess: (execution) => {
      toast({ title: "Report executed successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error executing report", description: error.message, variant: "destructive" });
    }
  });

  const addField = () => {
    setQueryConfig(prev => ({
      ...prev,
      fields: [...prev.fields, { table: "", field: "", alias: "" }]
    }));
  };

  const updateField = (index: number, updates: any) => {
    setQueryConfig(prev => ({
      ...prev,
      fields: prev.fields.map((field, i) => i === index ? { ...field, ...updates } : field)
    }));
  };

  const removeField = (index: number) => {
    setQueryConfig(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const addFilter = () => {
    setQueryConfig(prev => ({
      ...prev,
      filters: [...prev.filters, { field: "", operator: "eq", value: "" }]
    }));
  };

  const updateFilter = (index: number, updates: any) => {
    setQueryConfig(prev => ({
      ...prev,
      filters: prev.filters.map((filter, i) => i === index ? { ...filter, ...updates } : filter)
    }));
  };

  const removeFilter = (index: number) => {
    setQueryConfig(prev => ({
      ...prev,
      filters: prev.filters.filter((_, i) => i !== index)
    }));
  };

  const createFromTemplate = (templateKey: string) => {
    const template = templates[templateKey];
    if (template) {
      setCurrentReport({
        name: template.name,
        description: `Generated from ${template.name} template`,
        category: template.category,
        queryConfig: template.queryConfig,
        chartConfig: template.chartConfig
      });
      setIsCreateDialogOpen(true);
    }
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) return;
    
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => 
      Object.values(item).map(value => 
        typeof value === 'string' ? `"${value}"` : value
      ).join(',')
    ).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', `${filename}_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="flex flex-col gap-8 p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Advanced Reports</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Create custom reports with advanced query builder and scheduling
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-2">
          <Dialog open={isQueryBuilderOpen} onOpenChange={setIsQueryBuilderOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Query Builder
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Advanced Query Builder</DialogTitle>
                <DialogDescription>
                  Build custom queries with tables, fields, filters, and joins
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Tables Selection */}
                <div>
                  <Label className="text-sm font-medium">Select Tables</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {AVAILABLE_TABLES.map(table => (
                      <div key={table.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={table.value}
                          checked={queryConfig.tables.includes(table.value)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setQueryConfig(prev => ({
                                ...prev,
                                tables: [...prev.tables, table.value]
                              }));
                            } else {
                              setQueryConfig(prev => ({
                                ...prev,
                                tables: prev.tables.filter(t => t !== table.value)
                              }));
                            }
                          }}
                        />
                        <Label htmlFor={table.value} className="text-sm">{table.label}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Fields Selection */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Select Fields</Label>
                    <Button size="sm" onClick={addField}>Add Field</Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {queryConfig.fields.map((field, index) => (
                      <div key={index} className="flex gap-2 items-center flex-wrap">
                        <Select
                          value={field.table}
                          onValueChange={(value) => updateField(index, { table: value, field: "" })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Table" />
                          </SelectTrigger>
                          <SelectContent>
                            {queryConfig.tables.map(table => (
                              <SelectItem key={table} value={table}>
                                {AVAILABLE_TABLES.find(t => t.value === table)?.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={field.field}
                          onValueChange={(value) => updateField(index, { field: value })}
                          disabled={!field.table}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Field" />
                          </SelectTrigger>
                          <SelectContent>
                            {field.table && AVAILABLE_FIELDS[field.table as keyof typeof AVAILABLE_FIELDS]?.map(f => (
                              <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={field.aggregate || ""}
                          onValueChange={(value) => updateField(index, { aggregate: value || undefined })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Aggregate" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {AGGREGATES.map(agg => (
                              <SelectItem key={agg.value} value={agg.value}>{agg.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Alias"
                          value={field.alias || ""}
                          onChange={(e) => updateField(index, { alias: e.target.value })}
                          className="w-32"
                        />

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeField(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Filters */}
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Filters</Label>
                    <Button size="sm" onClick={addFilter}>Add Filter</Button>
                  </div>
                  <div className="space-y-2 mt-2">
                    {queryConfig.filters.map((filter, index) => (
                      <div key={index} className="flex gap-2 items-center flex-wrap">
                        <Input
                          placeholder="Field (table.field)"
                          value={filter.field}
                          onChange={(e) => updateFilter(index, { field: e.target.value })}
                          className="w-40"
                        />
                        
                        <Select
                          value={filter.operator}
                          onValueChange={(value) => updateFilter(index, { operator: value })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {OPERATORS.map(op => (
                              <SelectItem key={op.value} value={op.value}>{op.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          placeholder="Value"
                          value={filter.value}
                          onChange={(e) => updateFilter(index, { value: e.target.value })}
                          className="w-32"
                        />

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeFilter(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Limit */}
                <div>
                  <Label className="text-sm font-medium">Limit</Label>
                  <Input
                    type="number"
                    value={queryConfig.limit || 100}
                    onChange={(e) => setQueryConfig(prev => ({ ...prev, limit: parseInt(e.target.value) || 100 }))}
                    className="w-32 mt-2"
                  />
                </div>

                {/* Execute Query */}
                <div className="flex gap-2">
                  <Button
                    onClick={() => executeQueryMutation.mutate(queryConfig)}
                    disabled={executeQueryMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Play className="h-4 w-4" />
                    Execute Query
                  </Button>
                  {queryResults.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => exportToCSV(queryResults, "query_results")}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Export Results
                    </Button>
                  )}
                </div>

                {/* Results */}
                {queryResults.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium">Results ({queryResults.length} rows)</Label>
                    <div className="mt-2 max-h-60 overflow-auto border rounded">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800">
                          <tr>
                            {Object.keys(queryResults[0]).map(key => (
                              <th key={key} className="px-2 py-1 text-left">{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {queryResults.slice(0, 10).map((row, index) => (
                            <tr key={index} className="border-t">
                              {Object.values(row).map((value, i) => (
                                <td key={i} className="px-2 py-1">{String(value)}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Report
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Custom Report</DialogTitle>
                <DialogDescription>
                  Create a new custom report with advanced query configuration
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="report-name">Report Name</Label>
                  <Input
                    id="report-name"
                    value={currentReport.name || ""}
                    onChange={(e) => setCurrentReport(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter report name"
                  />
                </div>

                <div>
                  <Label htmlFor="report-description">Description</Label>
                  <Textarea
                    id="report-description"
                    value={currentReport.description || ""}
                    onChange={(e) => setCurrentReport(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter report description"
                  />
                </div>

                <div>
                  <Label htmlFor="report-category">Category</Label>
                  <Select
                    value={currentReport.category || ""}
                    onValueChange={(value) => setCurrentReport(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="students">Students</SelectItem>
                      <SelectItem value="payments">Payments</SelectItem>
                      <SelectItem value="attendance">Attendance</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="is-public"
                    checked={currentReport.isPublic || false}
                    onCheckedChange={(checked) => setCurrentReport(prev => ({ ...prev, isPublic: checked }))}
                  />
                  <Label htmlFor="is-public">Make report public</Label>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => createReportMutation.mutate({
                      ...currentReport,
                      queryConfig: currentReport.queryConfig || queryConfig
                    })}
                    disabled={createReportMutation.isPending}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Create Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="custom">Custom Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="custom" className="space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="students">Students</SelectItem>
                  <SelectItem value="payments">Payments</SelectItem>
                  <SelectItem value="attendance">Attendance</SelectItem>
                  <SelectItem value="performance">Performance</SelectItem>
                  <SelectItem value="financial">Financial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {reportsLoading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {customReports?.map((report: CustomReport) => (
                <Card key={report.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center justify-between text-lg">
                      <span className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        {report.name}
                      </span>
                      <Badge variant={report.isPublic ? "default" : "secondary"}>
                        {report.isPublic ? "Public" : "Private"}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-sm">{report.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{report.category}</Badge>
                        {report.isScheduled && (
                          <Badge variant="outline">
                            <Clock className="h-3 w-3 mr-1" />
                            Scheduled
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => executeReportMutation.mutate(report.id)}
                          disabled={executeReportMutation.isPending}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      Created {format(new Date(report.createdAt), 'MMM dd, yyyy')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates && Object.entries(templates).map(([key, template]: [string, any]) => (
              <Card key={key} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Predefined template for {template.category} analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{template.category}</Badge>
                    <Button
                      size="sm"
                      onClick={() => createFromTemplate(key)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Use Template
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="text-lg font-semibold mt-4">Scheduled Reports</h3>
            <p className="text-muted-foreground text-sm">
              Set up automated report generation and delivery
            </p>
            <Button className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}