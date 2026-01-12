import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { DailyReport, DailyReportSchema } from './schemas/daily-report.schema';
import { DailyReportService } from './daily-report.service';
import { MessageModule } from '../message/message.module';
import { ChatModule } from '../chat/chat.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: DailyReport.name, schema: DailyReportSchema }]),
    ScheduleModule.forRoot(),
    MessageModule,
    ChatModule,
  ],
  providers: [DailyReportService],
  exports: [DailyReportService],
})
export class DailyReportModule {}
