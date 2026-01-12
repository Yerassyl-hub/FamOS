import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { UserStyleService } from '../user-style/user-style.service';
import { DailyReportService } from '../daily-report/daily-report.service';
import { AiResponseService } from '../ai-response/ai-response.service';
import { ChatSyncService } from '../chat-sync/chat-sync.service';
import { MessageService } from '../message/message.service';
import { ChatService } from '../chat/chat.service';
import { WaService } from '../wa/wa.service';
import { ToggleAutoReplyDto } from './dto/auto-reply.dto';

@Controller('api')
export class ApiController {
  constructor(
    private readonly userStyleService: UserStyleService,
    private readonly dailyReportService: DailyReportService,
    private readonly aiResponseService: AiResponseService,
    private readonly chatSyncService: ChatSyncService,
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    private readonly waService: WaService,
  ) {}

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('status')
  status() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Post('analyze-style')
  async analyzeStyle(@Body() body: { userId?: string }) {
    const userId = body?.userId || 'default';
    const style = await this.userStyleService.analyzeUserStyle(userId);
    return {
      success: true,
      analyzedMessages: style.analyzedMessagesCount,
      styleProfile: style.styleProfile,
    };
  }

  @Get('style')
  async getStyle(@Query('userId') userId: string = 'default') {
    const style = await this.userStyleService.getUserStyle(userId);
    if (!style) {
      return { error: 'Style not analyzed yet. Call /api/analyze-style first.' };
    }
    return style;
  }

  @Post('sync-chats')
  async syncChats() {
    await this.chatSyncService.syncAllChats();
    return { success: true, message: 'Chat synchronization started' };
  }

  @Post('auto-reply')
  async toggleAutoReply(@Body() dto: ToggleAutoReplyDto) {
    try {
      this.aiResponseService.setAutoReply(dto.enabled);
      return {
        success: true,
        autoReplyEnabled: this.aiResponseService.isAutoReplyEnabled(),
        message: dto.enabled 
          ? 'Auto-reply enabled successfully' 
          : 'Auto-reply disabled successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to toggle auto-reply',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('auto-reply')
  getAutoReplyStatus() {
    return {
      autoReplyEnabled: this.aiResponseService.isAutoReplyEnabled(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('reports')
  async getReports(@Query('limit') limit: string = '7') {
    const reports = await this.dailyReportService.getRecentReports(
      parseInt(limit, 10),
    );
    return { reports };
  }

  @Get('reports/:date')
  async getReport(@Param('date') date: string) {
    const report = await this.dailyReportService.getReport(date);
    if (!report) {
      return { error: 'Report not found for this date' };
    }
    return report;
  }

  @Get('stats')
  async getStats() {
    const totalMessages = await this.messageService.getMessageCount();
    const chats = await this.chatService.getAllChats();
    
    return {
      totalMessages,
      totalChats: chats.length,
      activeChats: chats.filter((c) => c.lastMessageAt).length,
      autoReplyEnabled: this.aiResponseService.isAutoReplyEnabled(),
    };
  }

  @Get('chats')
  async getChats() {
    const chats = await this.chatService.getAllChats();
    return { chats };
  }

  @Get('chats/:chatId/messages')
  async getChatMessages(
    @Param('chatId') chatId: string,
    @Query('limit') limit: string = '50',
    @Query('skip') skip: string = '0',
  ) {
    const messages = await this.messageService.getChatMessages(
      chatId,
      parseInt(limit, 10),
      parseInt(skip, 10),
    );
    return { messages };
  }

  @Get('whatsapp/status')
  getWhatsAppStatus() {
    return this.waService.getConnectionStatus();
  }

  @Post('whatsapp/reconnect')
  async reconnectWhatsApp() {
    try {
      await this.waService.reconnect();
      return {
        success: true,
        message: 'WhatsApp reconnection initiated',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to reconnect WhatsApp',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('whatsapp/disconnect')
  async disconnectWhatsApp() {
    try {
      await this.waService.disconnect();
      return {
        success: true,
        message: 'WhatsApp disconnected successfully',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to disconnect WhatsApp',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
