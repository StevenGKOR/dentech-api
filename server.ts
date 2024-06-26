//general
import express from 'express';
import dotenv from 'dotenv';
import 'express-async-errors';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import session, { SessionData, Session } from 'express-session';

import { InternalServerError } from './errors/internal-server-error';
import { connectDB } from './db/connect';
import { IUserWithId } from './types/interfaces';
import { notFoundMiddleware } from './middlewares/not-found';
import { errorHandlerMiddleware } from './middlewares/error-handler';
import { headersMiddleware } from './middlewares/headers';
import { authenticateUser, authorizePermissions } from './middlewares/auth';
import { Roles } from './types/enums';

//routes
import authRouter from './routes/auth';
import userRouter from './routes/user';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import keepRouter from './routes/keep';
import creditRouter from './routes/credit';

const corsOpt = {
  origin: ['https://dentech-mng.netlify.app', 'http://localhost:5173'],
  credentials: true,
};
const limiterOpt = {
  windowMs: 15 * 60 * 1000,
  max: 30000,
};

const server = express();

dotenv.config();

server.use(express.json());
server.use(express.urlencoded({ extended: true }));
server.use(cookieParser(process.env.JWT_SECRET));
server.use(cors(corsOpt));
server.use(mongoSanitize());
server.use(morgan('dev'));
server.use(rateLimit(limiterOpt));

declare global {
  namespace Express {
    interface Request {
      currentUser: IUserWithId;
    }
  }
}

const port = process.env.PORT || 4500;

server.use('/api/v1', keepRouter);
server.use('/api/v1/auth', authRouter);
server.use('/api/v1/user', authenticateUser, userRouter);
server.use('/api/v1/order', authenticateUser, orderRouter);
server.use(
  '/api/v1/credit',
  authenticateUser,
  authorizePermissions(Roles.ADMIN),
  creditRouter
);
server.use(
  '/api/v1/product',
  authenticateUser,
  authorizePermissions(Roles.ADMIN),
  productRouter
);

server.use(notFoundMiddleware);
server.use(headersMiddleware);
server.use(errorHandlerMiddleware);

const startServer = async () => {
  try {
    if (process.env.MONGO_URI) {
      await connectDB(process.env.MONGO_URI);
      server.listen(port, () => {
        console.log(`Ο server βρίσκεται στη θύρα ${port}...`);
      });
    } else {
      throw new InternalServerError(
        'Κάτι πήγε στραβά, ξανά δοκιμάστε σε λίγο.'
      );
    }
  } catch (error) {
    console.log(error);
  }
};

startServer();
