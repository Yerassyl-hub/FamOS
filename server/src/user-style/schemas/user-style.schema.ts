import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserStyleDocument = UserStyle & Document;

@Schema({ timestamps: true })
export class UserStyle {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ type: Object, required: true })
  styleProfile: {
    // Common phrases and expressions
    commonPhrases: string[];
    
    // Writing style characteristics
    averageMessageLength: number;
    useEmojis: boolean;
    emojiFrequency: number;
    useCapitalization: boolean;
    punctuationStyle: string;
    
    // Response patterns
    averageResponseTime: number; // in minutes
    responsePatterns: {
      greeting: string[];
      goodbye: string[];
      question: string[];
      agreement: string[];
      disagreement: string[];
    };
    
    // Language patterns
    vocabulary: {
      commonWords: string[];
      uniqueWords: string[];
    };
    
    // Sentiment patterns
    sentimentDistribution: {
      positive: number;
      neutral: number;
      negative: number;
    };
  };

  @Prop({ type: Number, default: 0 })
  analyzedMessagesCount: number;

  @Prop({ type: Date })
  lastAnalyzedAt?: Date;

  @Prop({ type: Object })
  modelData?: {
    // For ML model training
    embeddings?: any;
    modelVersion?: string;
  };
}

export const UserStyleSchema = SchemaFactory.createForClass(UserStyle);
