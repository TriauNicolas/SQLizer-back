import express from 'express';
import cors from 'cors';

import { config } from 'dotenv';
import { AuthenticationRoute } from './routes/authentication.routes';
import { WorkgroupsRoute } from './routes/workgroups.routes';
import { DatabaseRoute } from './routes/databases.routes';

config();
const app = express();
const port = process.env.PORT || 5050;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use((req, res, next)=>
{
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTION');
  next();
});

app.use('/workgroups', WorkgroupsRoute);
app.use('/auth', AuthenticationRoute);
app.use('/database', DatabaseRoute);


app.listen(port, async () => {
  console.log(`Server started on http://localhost:${port}`);
});