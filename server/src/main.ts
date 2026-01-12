import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS for frontend
  app.enableCors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow all origins in development
      if (process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      
      // In production, check against allowed origins
      const allowedOrigins = process.env.FRONTEND_URL 
        ? process.env.FRONTEND_URL.split(',')
        : ['*'];
      
      if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    optionsSuccessStatus: 200, // Some legacy browsers (IE11, various SmartTVs) choke on 204
  });
  
  // Global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      disableErrorMessages: false,
    }),
  );
  
  // Note: API prefix is already set in controllers (@Controller('api'))
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API available at: http://localhost:${port}/api`);
  logger.log('CORS enabled for frontend integration');
  logger.log('WhatsApp Producer is initializing...');
}

bootstrap();
