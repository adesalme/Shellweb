import { Pool, PoolClient } from 'pg';

export class Database {
  private static pool: Pool;

  static async initialize(): Promise<void> {
    const connectionString = process.env.DATABASE_URL || 
      'postgres://lumo:secretpassword@localhost:5432/lumo_db';

    this.pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });

    // Test connection
    try {
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
    } catch (error) {
      console.error('Database connection failed:', error);
      throw error;
    }
  }

  static async query(text: string, params?: any[]): Promise<any> {
    const start = Date.now();
    try {
      const res = await this.pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text: text.substring(0, 50), duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Database query error:', error);
      throw error;
    }
  }

  static async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  static async close(): Promise<void> {
    if (this.pool) {
      await this.pool.end();
    }
  }
}

// User types
export interface User {
  id: string;
  azure_oid?: string;
  email: string;
  display_name?: string;
  role: 'admin' | 'dev' | 'viewer';
  created_at: Date;
}

// Script types
export interface Script {
  id: string;
  name: string;
  content: string;
  creator_id: string;
  created_at: Date;
  updated_at: Date;
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
  started_at: Date;
  finished_at?: Date;
  status: 'success' | 'warning' | 'error';
  stdout?: string;
  stderr?: string;
  exit_code?: number;
}

export interface ExecutionWithDetails extends Execution {
  script_name?: string;
  executor_name?: string;
}