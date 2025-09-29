// User types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'dev' | 'viewer';
  azureOid?: string;
  createdAt: string;
}

// Script types
export interface Script {
  id: string;
  name: string;
  content: string;
  creator_id: string;
  created_at: string;
  updated_at: string;
  last_modified_by: string;
  is_deleted: boolean;
}

export interface ScriptWithUser extends Script {
  creator_name?: string;
  last_modified_by_name?: string;
  execution_count?: number;
}

// Execution types
export interface Execution {
  id: string;
  script_id: string;
  executor_id: string;
  started_at: string;
  finished_at?: string;
  status: 'success' | 'warning' | 'error';
  stdout?: string;
  stderr?: string;
  exit_code?: number;
}

export interface ExecutionWithDetails extends Execution {
  script_name?: string;
  executor_name?: string;
}

export interface ExecutionResult {
  executionId: string;
  status: 'success' | 'warning' | 'error';
  exitCode?: number;
  stdout?: string;
  stderr?: string;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
}

// Dashboard types
export interface DashboardStats {
  overview: {
    totalScripts: number;
    totalExecutions: number;
    totalUsers: number;
    activeUsers30d: number;
    avgExecutionTime: number;
  };
  charts: {
    topScripts: Array<{
      id: string;
      name: string;
      executionCount: number;
      creatorName: string;
    }>;
    dailyExecutions: Array<{
      date: string;
      total: number;
      successful: number;
      failed: number;
      warnings: number;
    }>;
    roleDistribution: Array<{
      role: string;
      count: number;
    }>;
    statusDistribution: Array<{
      status: string;
      count: number;
    }>;
  };
  recentActivity: Array<{
    type: string;
    id: string;
    scriptName: string;
    userName: string;
    status: string;
    timestamp: string;
  }>;
}

export interface UserStats {
  overview: {
    createdScripts: number;
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    successRate: number;
  };
  charts: {
    topScripts: Array<{
      id: string;
      name: string;
      executionCount: number;
    }>;
    executionHistory: Array<{
      date: string;
      executions: number;
    }>;
  };
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password?: string;
  displayName?: string;
}

export interface AzureAuthRequest {
  accessToken: string;
  userInfo: {
    oid: string;
    email: string;
    name: string;
  };
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// Export/Import types
export interface ScriptExport {
  metadata: {
    id: string;
    name: string;
    creator: string;
    createdAt: string;
    updatedAt: string;
    exportedAt: string;
    exportedBy: string;
  };
  script: string;
}

// Theme types
export type Theme = 'light' | 'dark';

// Filter types
export interface ScriptFilters {
  search?: string;
  creator?: string;
  page?: number;
  limit?: number;
}

export interface ExecutionFilters {
  page?: number;
  limit?: number;
  status?: string;
  scriptId?: string;
}

// Monaco Editor types
export interface EditorSettings {
  fontSize: number;
  theme: 'vs-dark' | 'light';
  wordWrap: 'on' | 'off';
  minimap: boolean;
  lineNumbers: 'on' | 'off';
  autoSave: boolean;
}

// Notification types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
}

// Health check types
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  environment: string;
  services: {
    database: 'healthy' | 'unhealthy';
    powershell: 'healthy' | 'unhealthy';
  };
}

// PowerShell execution types
export interface PowerShellExecutionRequest {
  scriptId: string;
  azureToken?: string;
  userEmail?: string;
  tenantId?: string;
}

// Chart data types
export interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
  }>;
}

// Modal types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// Table types
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    current: number;
    total: number;
    pageSize: number;
    onChange: (page: number) => void;
  };
  onSort?: (key: keyof T, direction: 'asc' | 'desc') => void;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  validation?: {
    pattern?: RegExp;
    message?: string;
    min?: number;
    max?: number;
  };
}