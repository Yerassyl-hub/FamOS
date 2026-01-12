import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserStyle, UserStyleDocument } from './schemas/user-style.schema';
import { MessageService } from '../message/message.service';

@Injectable()
export class UserStyleService {
  private readonly logger = new Logger(UserStyleService.name);

  constructor(
    @InjectModel(UserStyle.name)
    private userStyleModel: Model<UserStyleDocument>,
    private readonly messageService: MessageService,
  ) {}

  async analyzeUserStyle(userId: string = 'default'): Promise<UserStyleDocument> {
    this.logger.log(`Analyzing user style for ${userId}...`);

    // Get user's messages
    const messages = await this.messageService.getUserMessages(true, 10000);
    
    if (messages.length === 0) {
      throw new Error('No messages found for analysis');
    }

    // Analyze messages
    const styleProfile = this.analyzeMessages(messages);

    // Save or update style profile
    const userStyle = await this.userStyleModel.findOneAndUpdate(
      { userId },
      {
        userId,
        styleProfile,
        analyzedMessagesCount: messages.length,
        lastAnalyzedAt: new Date(),
      },
      { upsert: true, new: true },
    );

    this.logger.log(`User style analyzed: ${messages.length} messages processed`);
    return userStyle;
  }

  private analyzeMessages(messages: any[]): any {
    const texts = messages.map((m) => m.text).filter((t) => t && t.length > 0);
    
    // Calculate average message length
    const avgLength = texts.reduce((sum, t) => sum + t.length, 0) / texts.length;

    // Extract common phrases (2-3 word combinations)
    const phrases = this.extractCommonPhrases(texts);

    // Analyze emoji usage
    const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
    const emojiCount = texts.reduce((sum, t) => sum + (t.match(emojiRegex)?.length || 0), 0);
    const useEmojis = emojiCount > 0;
    const emojiFrequency = emojiCount / texts.length;

    // Analyze capitalization
    const useCapitalization = texts.some((t) => /[A-ZА-Я]/.test(t));

    // Analyze punctuation
    const punctuationStyle = this.analyzePunctuation(texts);

    // Extract vocabulary
    const allWords = texts.flatMap((t) => t.toLowerCase().split(/\s+/)).filter((w) => w.length > 2);
    const wordFreq = this.calculateWordFrequency(allWords);
    const commonWords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 100)
      .map(([word]) => word);

    // Analyze response patterns (simplified)
    const responsePatterns = {
      greeting: this.extractPatterns(texts, ['привет', 'здравствуй', 'hi', 'hello']),
      goodbye: this.extractPatterns(texts, ['пока', 'до свидания', 'bye', 'goodbye']),
      question: this.extractPatterns(texts, ['?', 'как', 'что', 'why', 'how', 'what']),
      agreement: this.extractPatterns(texts, ['да', 'ок', 'согласен', 'yes', 'ok', 'agree']),
      disagreement: this.extractPatterns(texts, ['нет', 'не', 'no', 'not']),
    };

    return {
      commonPhrases: phrases.slice(0, 50),
      averageMessageLength: Math.round(avgLength),
      useEmojis,
      emojiFrequency: Math.round(emojiFrequency * 100) / 100,
      useCapitalization,
      punctuationStyle,
      averageResponseTime: 0, // Will be calculated separately
      responsePatterns,
      vocabulary: {
        commonWords,
        uniqueWords: [...new Set(allWords)].slice(0, 500),
      },
      sentimentDistribution: {
        positive: 0.4, // Placeholder - would need sentiment analysis
        neutral: 0.5,
        negative: 0.1,
      },
    };
  }

  private extractCommonPhrases(texts: string[]): string[] {
    const phrases = new Map<string, number>();
    
    texts.forEach((text) => {
      const words = text.toLowerCase().split(/\s+/).filter((w) => w.length > 2);
      for (let i = 0; i < words.length - 1; i++) {
        const phrase = `${words[i]} ${words[i + 1]}`;
        phrases.set(phrase, (phrases.get(phrase) || 0) + 1);
      }
    });

    return Array.from(phrases.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([phrase]) => phrase);
  }

  private analyzePunctuation(texts: string[]): string {
    const hasExclamation = texts.some((t) => t.includes('!'));
    const hasQuestion = texts.some((t) => t.includes('?'));
    const hasEllipsis = texts.some((t) => t.includes('...'));
    
    if (hasExclamation && hasQuestion) return 'expressive';
    if (hasEllipsis) return 'thoughtful';
    if (hasExclamation) return 'enthusiastic';
    return 'neutral';
  }

  private calculateWordFrequency(words: string[]): Record<string, number> {
    const freq: Record<string, number> = {};
    words.forEach((word) => {
      freq[word] = (freq[word] || 0) + 1;
    });
    return freq;
  }

  private extractPatterns(texts: string[], keywords: string[]): string[] {
    return texts
      .filter((t) => keywords.some((kw) => t.toLowerCase().includes(kw.toLowerCase())))
      .slice(0, 10);
  }

  async getUserStyle(userId: string = 'default'): Promise<UserStyleDocument | null> {
    return this.userStyleModel.findOne({ userId }).exec();
  }
}
