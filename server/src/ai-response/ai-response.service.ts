import { Injectable, Logger } from '@nestjs/common';
import { UserStyleService } from '../user-style/user-style.service';
import { MessageService } from '../message/message.service';
import { WaService } from '../wa/wa.service';

@Injectable()
export class AiResponseService {
  private readonly logger = new Logger(AiResponseService.name);
  private autoReplyEnabled = false;

  constructor(
    private readonly userStyleService: UserStyleService,
    private readonly messageService: MessageService,
    private readonly waService: WaService,
  ) {}

  async generateResponse(
    incomingMessage: string,
    chatId: string,
    context?: any,
  ): Promise<string> {
    try {
      // Get user style
      const userStyle = await this.userStyleService.getUserStyle();
      if (!userStyle) {
        return this.generateDefaultResponse(incomingMessage);
      }

      // Get recent conversation context
      const recentMessages = await this.messageService.getChatMessages(chatId, 10);
      const contextMessages = recentMessages
        .slice(0, 5)
        .reverse()
        .map((m) => `${m.fromMe ? 'You' : 'Them'}: ${m.text}`)
        .join('\n');

      // Generate response based on user style
      const response = this.generateStyleBasedResponse(
        incomingMessage,
        userStyle.styleProfile,
        contextMessages,
      );

      return response;
    } catch (error) {
      this.logger.error(`Failed to generate response: ${error.message}`);
      return this.generateDefaultResponse(incomingMessage);
    }
  }

  private generateStyleBasedResponse(
    message: string,
    styleProfile: any,
    context: string,
  ): string {
    // Simple rule-based response generation based on user style
    // In production, you'd use OpenAI API or a fine-tuned model
    
    const lowerMessage = message.toLowerCase();
    
    // Check for greetings
    if (this.matchesPattern(lowerMessage, ['привет', 'hi', 'hello', 'здравствуй'])) {
      return this.selectFromPatterns(styleProfile.responsePatterns.greeting) || 'Привет!';
    }

    // Check for questions
    if (lowerMessage.includes('?')) {
      const questionResponses = styleProfile.responsePatterns.question;
      if (questionResponses.length > 0) {
        // Use similar style but adapt to question
        return this.adaptToQuestion(message, styleProfile);
      }
    }

    // Use common phrases and vocabulary
    const response = this.buildResponseFromStyle(message, styleProfile);
    return response;
  }

  private matchesPattern(text: string, patterns: string[]): boolean {
    return patterns.some((p) => text.includes(p));
  }

  private selectFromPatterns(patterns: string[]): string | null {
    if (patterns.length === 0) return null;
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private adaptToQuestion(message: string, styleProfile: any): string {
    // Simple adaptation - in production use LLM
    const commonWords = styleProfile.vocabulary.commonWords.slice(0, 10);
    const response = `Хм, ${commonWords[0]}... ${commonWords[1]} ${commonWords[2]}`;
    return response.substring(0, 100); // Limit length
  }

  private buildResponseFromStyle(message: string, styleProfile: any): string {
    // Build response using user's common phrases and vocabulary
    const phrases = styleProfile.commonPhrases.slice(0, 5);
    const words = styleProfile.vocabulary.commonWords.slice(0, 20);
    
    // Simple template-based generation
    if (phrases.length > 0) {
      const basePhrase = phrases[0];
      // Adapt phrase to context
      return this.adaptPhrase(basePhrase, message, words);
    }

    return 'Понял, спасибо!';
  }

  private adaptPhrase(phrase: string, context: string, words: string[]): string {
    // Simple adaptation - replace words based on context
    return phrase; // Placeholder - would need more sophisticated logic
  }

  private generateDefaultResponse(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (this.matchesPattern(lowerMessage, ['привет', 'hi', 'hello'])) {
      return 'Привет!';
    }
    if (this.matchesPattern(lowerMessage, ['пока', 'bye', 'goodbye'])) {
      return 'Пока!';
    }
    if (lowerMessage.includes('?')) {
      return 'Интересный вопрос, подумаю...';
    }
    
    return 'Понял, спасибо!';
  }

  async sendAutoReply(chatId: string, message: string): Promise<void> {
    if (!this.autoReplyEnabled) {
      return;
    }

    try {
      const response = await this.generateResponse(message, chatId);
      const client = this.waService.getClient();
      
      if (client) {
        await client.sendMessage(chatId, response);
        this.logger.log(`Auto-replied to ${chatId}: ${response.substring(0, 50)}...`);
      }
    } catch (error) {
      this.logger.error(`Failed to send auto-reply: ${error.message}`);
    }
  }

  setAutoReply(enabled: boolean): void {
    this.autoReplyEnabled = enabled;
    this.logger.log(`Auto-reply ${enabled ? 'enabled' : 'disabled'}`);
  }

  isAutoReplyEnabled(): boolean {
    return this.autoReplyEnabled;
  }
}
