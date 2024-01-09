import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress;
    const method = req.method;
    const route = req.originalUrl;
    const dateTime = new Date().toISOString();

    const logMessage = `${ip} ${dateTime} ${method} - ${route}\n`;
    fs.appendFileSync('logs.txt', logMessage);

    next();
  }
}