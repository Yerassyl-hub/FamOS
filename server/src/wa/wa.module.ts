import { Module } from '@nestjs/common';
import { WaService } from './wa.service';

@Module({
  providers: [WaService],
  exports: [WaService],
})
export class WaModule {}
