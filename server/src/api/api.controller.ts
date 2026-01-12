import { Controller, Get, Post, Body, Param, Query, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { UserStyleService } from '../user-style/user-style.service';
import { DailyReportService } from '../daily-report/daily-report.service';
import { AiResponseService } from '../ai-response/ai-response.service';
import { ChatSyncService } from '../chat-sync/chat-sync.service';
import { MessageService } from '../message/message.service';
import { ChatService } from '../chat/chat.service';
import { WaService } from '../wa/wa.service';
import { ToggleAutoReplyDto } from './dto/auto-reply.dto';
import { AnalyzeStyleDto } from './dto/analyze-style.dto';
import { GetMessagesDto } from './dto/get-messages.dto';
import { GetReportsDto } from './dto/get-reports.dto';

@Controller('api')
export class ApiController {
  private readonly logger = new Logger(ApiController.name);

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
  async analyzeStyle(@Body() dto: AnalyzeStyleDto) {
    try {
      const userId = dto?.userId || 'default';
      this.logger.log(`Starting style analysis for user: ${userId}`);
      
      const style = await this.userStyleService.analyzeUserStyle(userId);
      
      this.logger.log(`Style analysis completed: ${style.analyzedMessagesCount} messages analyzed`);
      
      return {
        success: true,
        analyzedMessages: style.analyzedMessagesCount,
        styleProfile: style.styleProfile,
      };
    } catch (error) {
      this.logger.error(`Failed to analyze style: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to analyze style',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('style')
  async getStyle(@Query('userId') userId: string = 'default') {
    try {
      const style = await this.userStyleService.getUserStyle(userId);
      if (!style) {
        throw new HttpException(
          {
            success: false,
            message: 'Style not analyzed yet',
            error: 'Call /api/analyze-style first',
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return style;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get style: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get style',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('sync-chats')
  async syncChats() {
    try {
      this.logger.log('Starting chat synchronization...');
      await this.chatSyncService.syncAllChats();
      this.logger.log('Chat synchronization completed');
      return { success: true, message: 'Chat synchronization started' };
    } catch (error) {
      this.logger.error(`Failed to sync chats: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to sync chats',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
    try {
      return {
        autoReplyEnabled: this.aiResponseService.isAutoReplyEnabled(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(`Failed to get auto-reply status: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get auto-reply status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('reports')
  async getReports(@Query() dto: GetReportsDto) {
    try {
      const limit = dto.limit || 7;
      const reports = await this.dailyReportService.getRecentReports(limit);
      return { reports };
    } catch (error) {
      this.logger.error(`Failed to get reports: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get reports',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('reports/:date')
  async getReport(@Param('date') date: string) {
    try {
      // Валидация формата даты (YYYY-MM-DD)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid date format',
            error: 'Date must be in format YYYY-MM-DD',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const report = await this.dailyReportService.getReport(date);
      if (!report) {
        throw new HttpException(
          {
            success: false,
            message: 'Report not found',
            error: `Report not found for date: ${date}`,
          },
          HttpStatus.NOT_FOUND,
        );
      }
      return report;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get report: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get report',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats')
  async getStats() {
    try {
      const [totalMessages, chats] = await Promise.all([
        this.messageService.getMessageCount(),
        this.chatService.getAllChats(),
      ]);
      
      return {
        totalMessages,
        totalChats: chats.length,
        activeChats: chats.filter((c) => c.lastMessageAt).length,
        autoReplyEnabled: this.aiResponseService.isAutoReplyEnabled(),
      };
    } catch (error) {
      this.logger.error(`Failed to get stats: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get stats',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('chats')
  async getChats() {
    try {
      const chats = await this.chatService.getAllChats();
      return { chats };
    } catch (error) {
      this.logger.error(`Failed to get chats: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get chats',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('chats/:chatId/messages')
  async getChatMessages(
    @Param('chatId') chatId: string,
    @Query() dto: GetMessagesDto,
  ) {
    try {
      if (!chatId || chatId.trim() === '') {
        throw new HttpException(
          {
            success: false,
            message: 'Invalid chat ID',
            error: 'Chat ID is required',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      const limit = dto.limit || 50;
      const skip = dto.skip || 0;

      const messages = await this.messageService.getChatMessages(
        chatId.trim(),
        limit,
        skip,
      );
      return { messages };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get chat messages: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get chat messages',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('whatsapp/status')
  getWhatsAppStatus() {
    try {
      return this.waService.getConnectionStatus();
    } catch (error) {
      this.logger.error(`Failed to get WhatsApp status: ${error.message}`, error.stack);
      throw new HttpException(
        {
          success: false,
          message: 'Failed to get WhatsApp status',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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

  @Post('whatsapp/generate-qr')
  async generateQR() {
    try {
      // Если уже подключен, возвращаем текущий статус
      const status = this.waService.getConnectionStatus();
      
      if (status.status === 'ready' || status.status === 'authenticated') {
        return {
          success: false,
          message: 'WhatsApp already connected',
          isConnected: true,
        };
      }

      // Если есть QR код, возвращаем его
      if (status.qrCode) {
        return {
          success: true,
          qrCode: status.qrCode,
          message: 'QR code available',
        };
      }

      // Если уже идет подключение, ждем QR код
      if (status.isConnecting || status.status === 'connecting') {
        // Ждем до 30 секунд для генерации QR
        for (let i = 0; i < 30; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          const newStatus = this.waService.getConnectionStatus();
          if (newStatus.qrCode) {
            return {
              success: true,
              qrCode: newStatus.qrCode,
              message: 'QR code generated',
            };
          }
        }
        throw new Error('QR code generation timeout');
      }

      // Инициируем переподключение для генерации QR
      await this.waService.reconnect();
      
      // Ждем до 30 секунд для генерации QR
      for (let i = 0; i < 30; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newStatus = this.waService.getConnectionStatus();
      
      return {
        success: true,
        qrCode: newStatus.qrCode || null,
        message: newStatus.qrCode 
          ? 'QR code generated' 
          : 'QR code will be available shortly. Check status endpoint.',
      };
    } catch (error) {
      throw new HttpException(
        {
          success: false,
          message: 'Failed to generate QR code',
          error: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
