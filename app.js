import express, { json } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import recordRoute from './routes/recordRoute.js';
import taskRoute from './routes/taskRoute.js';

dotenv.config();

const app = express();  
app.use(cors());
app.use(json());

const PORT = process.env.PORT || 5000;

app.use('/records', recordRoute);
app.use('/tasks', taskRoute);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});