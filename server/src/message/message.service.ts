import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';

@Injectable()
export class MessageService {
  constructor(
    @InjectModel(Message.name)
    private messageModel: Model<MessageDocument>,
  ) {}

  async saveMessage(messageData: {
    messageId: string;
    chatId: string;
    sender: string;
    text: string;
    fromMe: boolean;
    timestamp: Date;
    messageKey: any;
    isGroup?: boolean;
    isMedia?: boolean;
    mediaType?: string;
    metadata?: any;
  }): Promise<MessageDocument> {
    // Check if message already exists
    const existing = await this.messageModel.findOne({
      messageId: messageData.messageId,
    });

    if (existing) {
      return existing;
    }

    const message = new this.messageModel(messageData);
    return message.save();
  }

  async getChatMessages(
    chatId: string,
    limit: number = 100,
    skip: number = 0,
  ): Promise<MessageDocument[]> {
    return this.messageModel
      .find({ chatId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip)
      .exec();
  }

  async getUserMessages(
    fromMe: boolean = true,
    limit: number = 1000,
  ): Promise<MessageDocument[]> {
    return this.messageModel
      .find({ fromMe })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getMessageCount(chatId?: string): Promise<number> {
    const query = chatId ? { chatId } : {};
    return this.messageModel.countDocuments(query);
  }

  async getMessagesForAnalysis(limit: number = 10000): Promise<MessageDocument[]> {
    return this.messageModel
      .find({ fromMe: true, text: { $exists: true, $ne: '' } })
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }
}
