import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { MessageService } from '../message/message.service';
import { ChatService } from '../chat/chat.service';
import { AiResponseService } from '../ai-response/ai-response.service';

@Processor('message-processing')
export class MessageProcessor extends WorkerHost {
  private readonly logger = new Logger(MessageProcessor.name);

  constructor(
    private readonly messageService: MessageService,
    private readonly chatService: ChatService,
    private readonly aiResponseService: AiResponseService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing job ${job.id} of type ${job.name}`);

    if (job.name === 'analyze-message') {
      return this.processMessage(job.data);
    }

    return { success: true };
  }

  private async processMessage(data: {
    text: string;
    sender: string;
    timestamp: string;
    fromMe: boolean;
    isGroup?: boolean;
    messageKey: any;
  }): Promise<void> {
    try {
      // Extract chat ID from sender
      const chatId = data.sender.split('@')[0];

      // Save message to MongoDB (both incoming and outgoing)
      await this.messageService.saveMessage({
        messageId: data.messageKey.id,
        chatId: chatId,
        sender: data.sender,
        text: data.text,
        fromMe: data.fromMe || false,
        timestamp: new Date(data.timestamp),
        messageKey: data.messageKey,
        isGroup: data.isGroup || data.sender.includes('@g.us'),
      });

      // Update chat info (only for incoming messages)
      if (!data.fromMe) {
        await this.chatService.updateLastMessage(
          chatId,
          new Date(data.timestamp),
        );
        await this.chatService.incrementMessageCount(chatId);
      }

      this.logger.log(`Message saved: ${data.messageKey.id} (fromMe: ${data.fromMe})`);

      // Auto-reply if enabled (only for incoming messages)
      if (!data.fromMe && this.aiResponseService.isAutoReplyEnabled()) {
        await this.aiResponseService.sendAutoReply(chatId, data.text);
      }
    } catch (error) {
      this.logger.error(`Failed to process message: ${error.message}`, error.stack);
      throw error;
    }
  }
}
