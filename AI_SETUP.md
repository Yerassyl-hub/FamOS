# 🤖 Настройка AI для автоответов

## 📋 Текущая реализация

**Сейчас токен НЕ нужен!** ✅

Текущая система использует **rule-based** подход (на основе паттернов):
- Анализирует стиль ваших сообщений
- Использует ваши частые фразы и слова
- Генерирует простые ответы на основе шаблонов

### Ограничения текущей системы:
- ❌ Простые ответы (шаблоны)
- ❌ Не понимает контекст глубоко
- ❌ Не может отвечать на сложные вопросы

## 🚀 Улучшение: Добавить OpenAI API

Для **качественных** автоответов можно добавить OpenAI API.

### Шаг 1: Получите API ключ

1. Зайдите на [platform.openai.com](https://platform.openai.com)
2. Создайте аккаунт (если нет)
3. Перейдите в API Keys
4. Создайте новый ключ
5. Скопируйте ключ (начинается с `sk-...`)

### Шаг 2: Установите библиотеку

```bash
npm install openai
```

### Шаг 3: Добавьте переменную окружения

Создайте `.env` в корне проекта:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### Шаг 4: Обновите `ai-response.service.ts`

```typescript
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { UserStyleService } from '../user-style/user-style.service';
import { MessageService } from '../message/message.service';
import { WaService } from '../wa/wa.service';

@Injectable()
export class AiResponseService {
  private readonly logger = new Logger(AiResponseService.name);
  private autoReplyEnabled = false;
  private openai: OpenAI | null = null;

  constructor(
    private readonly userStyleService: UserStyleService,
    private readonly messageService: MessageService,
    private readonly waService: WaService,
    private readonly configService: ConfigService,
  ) {
    // Инициализация OpenAI (если ключ есть)
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (apiKey) {
      this.openai = new OpenAI({ apiKey });
      this.logger.log('OpenAI API initialized');
    } else {
      this.logger.warn('OpenAI API key not found, using rule-based responses');
    }
  }

  async generateResponse(
    incomingMessage: string,
    chatId: string,
    context?: any,
  ): Promise<string> {
    try {
      // Если OpenAI доступен, используем его
      if (this.openai) {
        return await this.generateOpenAIResponse(incomingMessage, chatId);
      }
      
      // Иначе используем rule-based подход
      return await this.generateRuleBasedResponse(incomingMessage, chatId);
    } catch (error) {
      this.logger.error(`Failed to generate response: ${error.message}`);
      return this.generateDefaultResponse(incomingMessage);
    }
  }

  private async generateOpenAIResponse(
    message: string,
    chatId: string,
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized');
    }

    // Получаем стиль пользователя
    const userStyle = await this.userStyleService.getUserStyle();
    
    // Получаем контекст разговора
    const recentMessages = await this.messageService.getChatMessages(chatId, 10);
    const contextMessages = recentMessages
      .slice(-5)
      .map((m) => ({
        role: m.fromMe ? 'assistant' : 'user',
        content: m.text,
      }));

    // Создаем промпт на основе стиля пользователя
    const stylePrompt = userStyle
      ? `Ты - AI ассистент, который отвечает в стиле этого пользователя. 
Стиль пользователя:
- Частые фразы: ${userStyle.styleProfile?.commonPhrases?.slice(0, 5).join(', ') || 'нет данных'}
- Частые слова: ${userStyle.styleProfile?.vocabulary?.commonWords?.slice(0, 10).join(', ') || 'нет данных'}
- Длина сообщений: ${userStyle.styleProfile?.messageLength || 'средняя'}
Отвечай коротко, в стиле пользователя, используя его фразы и манеру общения.`
      : 'Ты - полезный AI ассистент. Отвечай коротко и по делу.';

    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo', // или 'gpt-4' для лучшего качества
        messages: [
          { role: 'system', content: stylePrompt },
          ...contextMessages,
          { role: 'user', content: message },
        ],
        max_tokens: 150,
        temperature: 0.7,
      });

      return completion.choices[0]?.message?.content || 'Понял, спасибо!';
    } catch (error) {
      this.logger.error(`OpenAI API error: ${error.message}`);
      // Fallback на rule-based
      return this.generateRuleBasedResponse(message, chatId);
    }
  }

  private async generateRuleBasedResponse(
    message: string,
    chatId: string,
  ): Promise<string> {
    // Текущая реализация (rule-based)
    const userStyle = await this.userStyleService.getUserStyle();
    if (!userStyle) {
      return this.generateDefaultResponse(message);
    }

    const recentMessages = await this.messageService.getChatMessages(chatId, 10);
    const contextMessages = recentMessages
      .slice(0, 5)
      .reverse()
      .map((m) => `${m.fromMe ? 'You' : 'Them'}: ${m.text}`)
      .join('\n');

    return this.generateStyleBasedResponse(
      message,
      userStyle.styleProfile,
      contextMessages,
    );
  }

  // ... остальные методы остаются без изменений
  private generateStyleBasedResponse(
    message: string,
    styleProfile: any,
    context: string,
  ): string {
    // Существующая реализация
    // ...
  }

  // ... остальные методы
}
```

### Шаг 5: Обновите `app.module.ts`

Убедитесь, что `ConfigModule` импортирован:

```typescript
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // ... остальные модули
  ],
})
export class AppModule {}
```

## 💰 Стоимость OpenAI API

- **GPT-3.5-turbo:** ~$0.002 за 1000 токенов (очень дешево)
- **GPT-4:** ~$0.03 за 1000 токенов (дороже, но качественнее)

**Пример:** 1000 сообщений ≈ $0.10-1.50 (в зависимости от модели)

## 🎯 Альтернативы OpenAI

### 1. Anthropic Claude
```bash
npm install @anthropic-ai/sdk
```

### 2. Google Gemini
```bash
npm install @google/generative-ai
```

### 3. Локальные модели (бесплатно)
- **Ollama** - запуск локально
- **LM Studio** - для Windows
- Не требуют API ключей, но нужна мощная видеокарта

## ✅ Итог

### Сейчас (без токена):
- ✅ Работает сразу
- ✅ Бесплатно
- ❌ Простые ответы

### С OpenAI API:
- ✅ Качественные ответы
- ✅ Понимает контекст
- ❌ Требует API ключ
- ❌ Платно (но очень дешево)

## 🚀 Рекомендация

1. **Начните без токена** - проверьте, что система работает
2. **Добавьте OpenAI** - когда понадобятся качественные ответы
3. **Или используйте локальные модели** - если не хотите платить

## 📝 Быстрая проверка

После добавления OpenAI, проверьте:

```bash
# Включите автоответы
curl -X POST http://localhost:3000/api/auto-reply \
  -H "Content-Type: application/json" \
  -d '{"enabled": true}'

# Отправьте тестовое сообщение в WhatsApp
# Должен прийти ответ от AI
```
