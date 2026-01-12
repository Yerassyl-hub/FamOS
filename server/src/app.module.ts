import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { QueueConfigModule } from './queue/queue.module';
import { WaModule } from './wa/wa.module';
import { MessageModule } from './message/message.module';
import { ChatModule } from './chat/chat.module';
import { MessageProcessorModule } from './message-processor/message-processor.module';
import { ChatSyncModule } from './chat-sync/chat-sync.module';
import { UserStyleModule } from './user-style/user-style.module';
import { AiResponseModule } from './ai-response/ai-response.module';
import { DailyReportModule } from './daily-report/daily-report.module';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/famos',
    ),
    QueueConfigModule,
    WaModule,
    MessageModule,
    ChatModule,
    MessageProcessorModule,
    ChatSyncModule,
    UserStyleModule,
    AiResponseModule,
    DailyReportModule,
    ApiModule,
  ],
})
export class AppModule {}
