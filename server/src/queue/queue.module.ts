import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6380', 10),
      },
    }),
    BullModule.registerQueue({
      name: 'message-processing',
    }),
  ],
  exports: [BullModule],
})
export class QueueConfigModule {}
