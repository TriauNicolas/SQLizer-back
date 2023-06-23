import express from 'express';
import cors from 'cors';

import { config } from 'dotenv';

config();
const app = express();
const port = process.env.PORT || 5050;

app.use(cors());

app.use((req, res, next)=>
{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTION');
  next();
});

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});