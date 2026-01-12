import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DailyReportDocument = DailyReport & Document;

@Schema({ timestamps: true })
export class DailyReport {
  @Prop({ required: true, unique: true, index: true })
  date: string; // Format: YYYY-MM-DD

  @Prop({ type: Object, required: true })
  statistics: {
    totalMessages: number;
    incomingMessages: number;
    outgoingMessages: number;
    activeChats: number;
    newChats: number;
    messagesByHour: number[];
    topContacts: Array<{
      chatId: string;
      name: string;
      messageCount: number;
    }>;
  };

  @Prop({ type: Object })
  aiActivity: {
    autoRepliedMessages: number;
    suggestedReplies: number;
    accuracyScore?: number;
  };

  @Prop({ type: [String], default: [] })
  highlights: string[];

  @Prop({ type: Object })
  insights?: {
    mostActiveTime: string;
    responseRate: number;
    averageResponseTime: number;
    sentimentTrend: string;
  };
}

export const DailyReportSchema = SchemaFactory.createForClass(DailyReport);

DailyReportSchema.index({ date: -1 });
