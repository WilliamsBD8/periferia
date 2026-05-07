import express from "express";
import cors from "cors";

import errorMiddleware from "./middleware/error.middleware.js";

import authRouter from "./routes/auth.routes.js";
import tasksRouter from "./routes/tasks.routes.js";
import usersRouter from "./routes/users.routes.js";
import notificationRouter from "./routes/notification.route.js";

const allowedOrigins = [
  'http://localhost:4200',
  'http://127.0.0.1:4200'
];

const app = express();
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.get("/", (req, res) => {
  res.json({ message: "API de periferia" });
});


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/tasks", tasksRouter);
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/notifications", notificationRouter);
app.use(errorMiddleware);
// app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

export default app;