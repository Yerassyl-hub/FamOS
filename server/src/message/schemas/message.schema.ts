import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MessageDocument = Message & Document;

@Schema({ timestamps: true })
export class Message {
  @Prop({ required: true, index: true })
  messageId: string;

  @Prop({ required: true, index: true })
  chatId: string;

  @Prop({ required: true })
  sender: string;

  @Prop({ required: true })
  text: string;

  @Prop({ default: false })
  fromMe: boolean;

  @Prop({ required: true, index: true })
  timestamp: Date;

  @Prop({ type: Object })
  messageKey: {
    id: string;
    remoteJid: string;
    fromMe: boolean;
  };

  @Prop({ default: false })
  isGroup: boolean;

  @Prop({ default: false })
  isMedia: boolean;

  @Prop({ type: String })
  mediaType?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

// Indexes for efficient queries
MessageSchema.index({ chatId: 1, timestamp: -1 });
MessageSchema.index({ sender: 1, timestamp: -1 });
MessageSchema.index({ fromMe: 1, timestamp: -1 });
