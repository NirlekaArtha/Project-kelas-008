import pool from '../configs/dbConnection';
import { QueryResult } from 'pg';

export class DbService {
  /**
   * @param text - SQL query text
   * @param params - Parameter untuk query
   * @returns Promise dengan hasil query
   */
  async query<T>(text: string, params?: any[]): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const res = await pool.query(text, params);
      const duration = Date.now() - start;
      console.log('Executed query', { text, duration, rows: res.rowCount });
      return res;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    }
  }

  /**
   * @param callback - Fungsi callback yang menerima client dan mengeksekusi query
   * @returns Promise dengan hasil dari callback
   */
  async transaction<T>(callback: (client: any) => Promise<T>): Promise<T> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Transaction error:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new DbService();
