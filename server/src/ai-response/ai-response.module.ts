import { Module } from '@nestjs/common';
import { AiResponseService } from './ai-response.service';
import { UserStyleModule } from '../user-style/user-style.module';
import { MessageModule } from '../message/message.module';
import { WaModule } from '../wa/wa.module';

@Module({
  imports: [UserStyleModule, MessageModule, WaModule],
  providers: [AiResponseService],
  exports: [AiResponseService],
})
export class AiResponseModule {}
