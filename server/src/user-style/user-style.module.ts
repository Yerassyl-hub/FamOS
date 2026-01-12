import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserStyle, UserStyleSchema } from './schemas/user-style.schema';
import { UserStyleService } from './user-style.service';
import { MessageModule } from '../message/message.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: UserStyle.name, schema: UserStyleSchema }]),
    MessageModule,
  ],
  providers: [UserStyleService],
  exports: [UserStyleService],
})
export class UserStyleModule {}
