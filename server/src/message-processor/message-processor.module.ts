import { Module } from '@nestjs/common';
import { MessageProcessor } from './message-processor.processor';
import { MessageModule } from '../message/message.module';
import { ChatModule } from '../chat/chat.module';
import { AiResponseModule } from '../ai-response/ai-response.module';

@Module({
  imports: [MessageModule, ChatModule, AiResponseModule],
  providers: [MessageProcessor],
})
export class MessageProcessorModule {}
