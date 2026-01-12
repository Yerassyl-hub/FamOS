import { Module } from '@nestjs/common';
import { ChatSyncService } from './chat-sync.service';
import { ChatModule } from '../chat/chat.module';
import { MessageModule } from '../message/message.module';
import { WaModule } from '../wa/wa.module';

@Module({
  imports: [ChatModule, MessageModule, WaModule],
  providers: [ChatSyncService],
  exports: [ChatSyncService],
})
export class ChatSyncModule {}
