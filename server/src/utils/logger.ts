import { Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

export class FileLogger extends Logger {
  private logFile: string;

  constructor(context: string) {
    super(context);
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(logsDir, `famos-${date}.log`);
  }

  log(message: any, context?: string) {
    if (message !== undefined && message !== null) {
      super.log(message, context);
      this.writeToFile('LOG', message, context);
    }
  }

  error(message: any, trace?: string, context?: string) {
    if (message !== undefined && message !== null) {
      super.error(message, trace, context);
      this.writeToFile('ERROR', message, context, trace);
    }
  }

  warn(message: any, context?: string) {
    if (message !== undefined && message !== null) {
      super.warn(message, context);
      this.writeToFile('WARN', message, context);
    }
  }

  debug(message: any, context?: string) {
    if (message !== undefined && message !== null) {
      super.debug(message, context);
      this.writeToFile('DEBUG', message, context);
    }
  }

  verbose(message: any, context?: string) {
    if (message !== undefined && message !== null) {
      super.verbose(message, context);
      this.writeToFile('VERBOSE', message, context);
    }
  }

  private writeToFile(level: string, message: any, context?: string, trace?: string) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}]${context ? ` [${context}]` : ''} ${message}${trace ? `\n${trace}` : ''}\n`;
    
    try {
      fs.appendFileSync(this.logFile, logMessage, 'utf8');
    } catch (error) {
      // Silently fail if file write fails
    }
  }
}
