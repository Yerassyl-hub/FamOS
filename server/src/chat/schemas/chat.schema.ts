import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ChatDocument = Chat & Document;

@Schema({ timestamps: true })
export class Chat {
  @Prop({ required: true, unique: true, index: true })
  chatId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: false })
  isGroup: boolean;

  @Prop({ type: [String], default: [] })
  participants: string[];

  @Prop({ default: 0 })
  messageCount: number;

  @Prop({ type: Date })
  lastMessageAt?: Date;

  @Prop({ type: Object })
  metadata?: {
    picture?: string;
    description?: string;
    [key: string]: any;
  };

  @Prop({ default: false })
  isArchived: boolean;

  @Prop({ default: false })
  isPinned: boolean;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);

ChatSchema.index({ lastMessageAt: -1 });
ChatSchema.index({ isGroup: 1, lastMessageAt: -1 });
