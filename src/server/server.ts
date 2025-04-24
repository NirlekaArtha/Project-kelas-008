import express, { Request, Response } from 'express';
import { testDbConnection } from '../configs/dbConnection';
import dbService from '../services/dbServices';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API is running' });
});

// Test koneksi DB 
app.get('/db-test', async (_req: Request, res: Response) => {
  try {
    const result = await dbService.query('SELECT NOW() as current_time');
    res.json({
      success: true,
      message: 'Database connection is working',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error testing database:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: process.env.NODE_ENV === 'production' ? 'Internal server error' : error
    });
  }
});

const startServer = async () => {
  try {
    const isConnected = await testDbConnection();
    
    if (!isConnected) {
      console.error('Failed to connect to the database. Please check your configuration.');
      process.exit(1);
    }
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log('Database connection successful');
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});
