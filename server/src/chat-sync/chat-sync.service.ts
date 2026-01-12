import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ChatService } from '../chat/chat.service';
import { MessageService } from '../message/message.service';
import { WaService } from '../wa/wa.service';

@Injectable()
export class ChatSyncService implements OnModuleInit {
  private readonly logger = new Logger(ChatSyncService.name);
  private isSyncing = false;

  constructor(
    private readonly chatService: ChatService,
    private readonly messageService: MessageService,
    private readonly waService: WaService,
  ) {}

  async onModuleInit() {
    // Wait for WhatsApp to be ready before syncing
    setTimeout(() => {
      this.syncAllChats();
    }, 10000); // Wait 10 seconds after module init
  }

  async syncAllChats(): Promise<void> {
    if (this.isSyncing) {
      this.logger.warn('Chat sync already in progress');
      return;
    }

    this.isSyncing = true;
    this.logger.log('Starting full chat synchronization...');

    try {
      const client = this.waService.getClient();
      if (!client) {
        this.logger.error('WhatsApp client not available');
        this.isSyncing = false;
        return;
      }

      // Get all chats
      const chats = await client.getChats();
      this.logger.log(`Found ${chats.length} chats to sync`);

      // Sync each chat
      for (const chat of chats) {
        try {
          const chatId = typeof chat.id === 'string' 
            ? chat.id 
            : (chat.id as any)?._serialized || String(chat.id);
          if (chatId) {
            await this.syncChat(chatId, client);
          }
        } catch (error: any) {
          const chatId = typeof chat.id === 'string' 
            ? chat.id 
            : (chat.id as any)?._serialized || String(chat.id);
          this.logger.error(`Failed to sync chat ${chatId}: ${error.message}`);
        }
      }

      this.logger.log('Chat synchronization completed');
    } catch (error) {
      this.logger.error(`Chat sync failed: ${error.message}`, error.stack);
    } finally {
      this.isSyncing = false;
    }
  }

  private async syncChat(chatId: string, client: any): Promise<void> {
    try {
      // Get chat info - use the chat object directly from getChats()
      const chats = await client.getChats();
      const chat = chats.find((c: any) => c.id._serialized === chatId);
      
      if (!chat) {
        this.logger.warn(`Chat ${chatId} not found`);
        return;
      }
      
      // Save/update chat
      await this.chatService.saveOrUpdateChat({
        chatId: chat.id._serialized,
        name: chat.name || chatId,
        isGroup: chat.isGroup || false,
        participants: chat.isGroup && chat.participants 
          ? chat.participants.map((p: any) => p.id?._serialized || p.id || p) 
          : [],
        metadata: {
          picture: chat.pic,
          description: chat.description,
        },
      });

      // Fetch all messages from this chat
      const messages = await chat.fetchMessages({ limit: 1000 });
      this.logger.log(`Syncing ${messages.length} messages from chat ${chat.name || chatId}`);

      // Save messages
      for (const msg of messages) {
        try {
          await this.messageService.saveMessage({
            messageId: msg.id._serialized || msg.id,
            chatId: chat.id._serialized,
            sender: msg.from || chat.id._serialized,
            text: msg.body || '[MEDIA]',
            fromMe: msg.fromMe || false,
            timestamp: new Date(msg.timestamp * 1000),
            messageKey: {
              id: msg.id._serialized || msg.id,
              remoteJid: msg.from || chat.id._serialized,
              fromMe: msg.fromMe || false,
            },
            isGroup: chat.isGroup || false,
            isMedia: msg.hasMedia || false,
            mediaType: msg.hasMedia ? (msg.type || 'unknown') : undefined,
          });
        } catch (error: any) {
          // Skip duplicate messages
          if (!error.message?.includes('duplicate') && error.code !== 11000) {
            this.logger.warn(`Failed to save message ${msg.id?._serialized || msg.id}: ${error.message}`);
          }
        }
      }

      this.logger.log(`Chat ${chat.name || chatId} synced successfully`);
    } catch (error: any) {
      this.logger.error(`Failed to sync chat ${chatId}: ${error.message}`);
      throw error;
    }
  }
}
