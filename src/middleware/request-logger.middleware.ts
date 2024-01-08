import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as fs from 'fs';

@Injectable()
export class RequestLoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const ip = req.ip || req.connection.remoteAddress;
    const route = req.originalUrl;
    const params = JSON.stringify(req.params);
    const dateTime = new Date().toISOString();

    // Log the request details to logs.txt
    const logMessage = `${ip} ${dateTime} - Route: ${route} - Params: ${params}\n`;
    fs.appendFileSync('logs.txt', logMessage);

    // Continue processing the request
    next();
  }
}