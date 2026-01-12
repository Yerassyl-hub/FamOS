import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DailyReport, DailyReportDocument } from './schemas/daily-report.schema';
import { MessageService } from '../message/message.service';
import { ChatService } from '../chat/chat.service';

@Injectable()
export class DailyReportService {
  private readonly logger = new Logger(DailyReportService.name);

  constructor(
    @InjectModel(DailyReport.name)
    private dailyReportModel: Model<DailyReportDocument>,
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_1AM)
  async generateDailyReport(): Promise<void> {
    this.logger.log('Generating daily report...');
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split('T')[0];

    try {
      const report = await this.createReport(dateStr);
      await this.dailyReportModel.findOneAndUpdate(
        { date: dateStr },
        report,
        { upsert: true, new: true },
      );

      this.logger.log(`Daily report generated for ${dateStr}`);
      this.logReport(report);
    } catch (error) {
      this.logger.error(`Failed to generate daily report: ${error.message}`, error.stack);
    }
  }

  private async createReport(date: string): Promise<Partial<DailyReport>> {
    const startDate = new Date(`${date}T00:00:00Z`);
    const endDate = new Date(`${date}T23:59:59Z`);

    // Get messages for the day
    const allMessages = await this.messageService.getUserMessages(false, 100000);
    const dayMessages = allMessages.filter(
      (m) => m.timestamp >= startDate && m.timestamp <= endDate,
    );

    const incomingMessages = dayMessages.filter((m) => !m.fromMe);
    const outgoingMessages = dayMessages.filter((m) => m.fromMe);

    // Calculate messages by hour
    const messagesByHour = new Array(24).fill(0);
    dayMessages.forEach((m) => {
      const hour = new Date(m.timestamp).getHours();
      messagesByHour[hour]++;
    });

    // Get top contacts
    const contactCounts = new Map<string, { name: string; count: number }>();
    incomingMessages.forEach((m) => {
      const chatId = m.chatId;
      const current = contactCounts.get(chatId) || { name: chatId, count: 0 };
      contactCounts.set(chatId, { ...current, count: current.count + 1 });
    });

    const topContacts = Array.from(contactCounts.entries())
      .map(([chatId, data]) => ({ chatId, name: data.name, messageCount: data.count }))
      .sort((a, b) => b.messageCount - a.messageCount)
      .slice(0, 10);

    // Get active chats
    const allChats = await this.chatService.getAllChats();
    const activeChats = allChats.filter(
      (c) => c.lastMessageAt && c.lastMessageAt >= startDate && c.lastMessageAt <= endDate,
    );

    const newChats = allChats.filter(
      (c) => {
        const createdAt = (c as any).createdAt || (c as any).timestamp;
        return createdAt && createdAt >= startDate && createdAt <= endDate;
      },
    );

    // Calculate insights
    const mostActiveHour = messagesByHour.indexOf(Math.max(...messagesByHour));
    const responseRate = outgoingMessages.length / (incomingMessages.length || 1);

    return {
      date,
      statistics: {
        totalMessages: dayMessages.length,
        incomingMessages: incomingMessages.length,
        outgoingMessages: outgoingMessages.length,
        activeChats: activeChats.length,
        newChats: newChats.length,
        messagesByHour,
        topContacts,
      },
      aiActivity: {
        autoRepliedMessages: 0, // Will be tracked separately
        suggestedReplies: 0,
      },
      highlights: this.generateHighlights(dayMessages, topContacts),
      insights: {
        mostActiveTime: `${mostActiveHour}:00`,
        responseRate: Math.round(responseRate * 100) / 100,
        averageResponseTime: 0, // Would need to calculate from timestamps
        sentimentTrend: 'neutral', // Would need sentiment analysis
      },
    };
  }

  private generateHighlights(messages: any[], topContacts: any[]): string[] {
    const highlights: string[] = [];

    if (messages.length > 100) {
      highlights.push(`Активный день: ${messages.length} сообщений`);
    }

    if (topContacts.length > 0) {
      highlights.push(`Самый активный контакт: ${topContacts[0].name} (${topContacts[0].count} сообщений)`);
    }

    return highlights;
  }

  private logReport(report: Partial<DailyReport>): void {
    this.logger.log('═══════════════════════════════════════');
    this.logger.log(`Daily Report for ${report.date}`);
    this.logger.log('═══════════════════════════════════════');
    this.logger.log(`Total Messages: ${report.statistics?.totalMessages}`);
    this.logger.log(`Incoming: ${report.statistics?.incomingMessages}`);
    this.logger.log(`Outgoing: ${report.statistics?.outgoingMessages}`);
    this.logger.log(`Active Chats: ${report.statistics?.activeChats}`);
    this.logger.log('═══════════════════════════════════════');
  }

  async getReport(date: string): Promise<DailyReportDocument | null> {
    return this.dailyReportModel.findOne({ date }).exec();
  }

  async getRecentReports(limit: number = 7): Promise<DailyReportDocument[]> {
    return this.dailyReportModel
      .find()
      .sort({ date: -1 })
      .limit(limit)
      .exec();
  }
}
