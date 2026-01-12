import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from './schemas/chat.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name)
    private chatModel: Model<ChatDocument>,
  ) {}

  async saveOrUpdateChat(chatData: {
    chatId: string;
    name: string;
    isGroup: boolean;
    participants?: string[];
    metadata?: any;
  }): Promise<ChatDocument> {
    return this.chatModel.findOneAndUpdate(
      { chatId: chatData.chatId },
      {
        ...chatData,
        $setOnInsert: { messageCount: 0 },
      },
      { upsert: true, new: true },
    );
  }

  async updateLastMessage(chatId: string, timestamp: Date): Promise<void> {
    await this.chatModel.findOneAndUpdate(
      { chatId },
      { lastMessageAt: timestamp },
    );
  }

  async incrementMessageCount(chatId: string): Promise<void> {
    await this.chatModel.findOneAndUpdate(
      { chatId },
      { $inc: { messageCount: 1 } },
    );
  }

  async getAllChats(): Promise<ChatDocument[]> {
    return this.chatModel.find().sort({ lastMessageAt: -1 }).exec();
  }

  async getChat(chatId: string): Promise<ChatDocument | null> {
    return this.chatModel.findOne({ chatId }).exec();
  }
}
