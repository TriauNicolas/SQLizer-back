import express from "express";
import cors from "cors";
import { config } from 'dotenv';
import { AuthenticationRoute } from './routes/authentication.routes';
import { WorkgroupsRoute } from './routes/workgroups.routes';
import { initSocket } from './core/sockets';
import { createServer }  from 'http';
import { DatabaseRoute } from './routes/databases.routes';
import { TranslationRoute } from "./routes/translation.routes";

config();
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTION"
  );
  next();
});

const httpServer = createServer(app);

initSocket(httpServer);

app.use('/workgroups', WorkgroupsRoute);
app.use('/auth', AuthenticationRoute);
app.use('/database', DatabaseRoute);
app.use("/translation", TranslationRoute);

httpServer.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`);
});
