import { Module } from '@nestjs/common';
import { ApiController } from './api.controller';
import { UserStyleModule } from '../user-style/user-style.module';
import { DailyReportModule } from '../daily-report/daily-report.module';
import { AiResponseModule } from '../ai-response/ai-response.module';
import { ChatSyncModule } from '../chat-sync/chat-sync.module';
import { MessageModule } from '../message/message.module';
import { ChatModule } from '../chat/chat.module';
import { WaModule } from '../wa/wa.module';

@Module({
  imports: [
    UserStyleModule,
    DailyReportModule,
    AiResponseModule,
    ChatSyncModule,
    MessageModule,
    ChatModule,
    WaModule,
  ],
  controllers: [ApiController],
})
export class ApiModule {}
