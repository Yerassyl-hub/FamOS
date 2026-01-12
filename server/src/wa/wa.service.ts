import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class WaService implements OnModuleInit {
  private readonly logger = new Logger(WaService.name);
  private logFile: string;
  private client: Client | null = null;
  private isConnecting = false;
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'authenticated' | 'ready' = 'disconnected';
  private qrCode: string | null = null;
  private lastError: string | null = null;

  constructor(
    @InjectQueue('message-processing')
    private readonly messageQueue: Queue,
  ) {
    // Initialize log file
    const logsDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const date = new Date().toISOString().split('T')[0];
    this.logFile = path.join(logsDir, `famos-${date}.log`);
  }

  private writeLog(level: string, message: string, context?: string) {
    if (message === undefined || message === null) return;
    
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${level}]${context ? ` [${context}]` : ''} ${message}\n`;
    
    try {
      fs.appendFileSync(this.logFile, logMessage, 'utf8');
    } catch (error) {
      // Silently fail if file write fails
    }
  }

  async onModuleInit() {
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.connectToWhatsApp();
  }

  async connectToWhatsApp(): Promise<void> {
    if (this.isConnecting) {
      this.logger.warn('Connection attempt already in progress');
      return;
    }

    this.isConnecting = true;
    const logMsg = 'Initializing WhatsApp connection with whatsapp-web.js...';
    this.logger.log(logMsg);
    this.writeLog('LOG', logMsg);

    try {
      // Create client with local auth (saves session)
      this.client = new Client({
        authStrategy: new LocalAuth({
          dataPath: './wa_auth_info',
        }),
        puppeteer: {
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        },
      });

      // QR Code event
      this.client.on('qr', (qr) => {
        const qrMsg1 = '═══════════════════════════════════════';
        const qrMsg2 = 'QR Code generated. Please scan with WhatsApp.';
        const qrMsg3 = 'Waiting for QR code scan...';
        
        // Clear console and show QR code prominently
        console.clear();
        console.log('\n\n');
        console.log(qrMsg1);
        console.log(qrMsg2);
        console.log(qrMsg1);
        console.log('\n');
        
        // Generate QR code
        qrcode.generate(qr, { small: true });
        
        console.log('\n');
        console.log(qrMsg3);
        console.log('Scan the QR code above with your WhatsApp app.');
        console.log('WhatsApp → Settings → Linked Devices → Link a Device');
        console.log('\n');
        
        // Also log to file
        this.logger.log(qrMsg1);
        this.logger.log(qrMsg2);
        this.logger.log(qrMsg1);
        this.writeLog('LOG', qrMsg2);
        this.logger.log(qrMsg3);
        this.writeLog('LOG', qrMsg3);
      });

      // Ready event
      this.client.on('ready', () => {
        this.connectionStatus = 'ready';
        this.qrCode = null; // Clear QR code after successful connection
        this.lastError = null;
        const readyMsg = '✅ WhatsApp client is ready!';
        this.logger.log(readyMsg);
        this.writeLog('LOG', readyMsg);
        this.isConnecting = false;
      });

      // Authenticated event
      this.client.on('authenticated', () => {
        this.connectionStatus = 'authenticated';
        const authMsg = 'WhatsApp authenticated successfully';
        this.logger.log(authMsg);
        this.writeLog('LOG', authMsg);
      });

      // Authentication failure
      this.client.on('auth_failure', (msg) => {
        this.connectionStatus = 'disconnected';
        this.lastError = `Authentication failed: ${msg}`;
        const errorMsg = `Authentication failed: ${msg}`;
        this.logger.error(errorMsg);
        this.writeLog('ERROR', errorMsg);
        this.isConnecting = false;
      });

      // Disconnected event
      this.client.on('disconnected', (reason) => {
        this.connectionStatus = 'disconnected';
        this.lastError = `Disconnected: ${reason}`;
        const disconnectMsg = `WhatsApp disconnected: ${reason}`;
        this.logger.warn(disconnectMsg);
        this.writeLog('WARN', disconnectMsg);
        this.isConnecting = false;
        // Attempt to reconnect
        setTimeout(() => {
          this.connectToWhatsApp();
        }, 5000);
      });

      // Message event - save ALL messages (incoming and outgoing) for analysis
      this.client.on('message', async (message: Message) => {
        // Ignore messages from status broadcasts
        if (message.from === 'status@broadcast') {
          return;
        }

        const messageText = message.body || '[MEDIA]';
        const sender = message.from;
        const timestamp = new Date(message.timestamp * 1000);
        const isGroup = message.from.includes('@g.us');

        // Log incoming messages
        if (!message.fromMe) {
          this.logger.log(
            `Received message from ${sender}: ${messageText.substring(0, 50)}...`,
          );
        }

        // Push to Redis queue for asynchronous processing (ALL messages)
        try {
          await this.messageQueue.add('analyze-message', {
            text: messageText,
            sender: sender,
            timestamp: timestamp.toISOString(),
            fromMe: message.fromMe,
            isGroup: isGroup,
            messageKey: {
              id: message.id._serialized,
              remoteJid: message.from,
              fromMe: message.fromMe,
            },
          });

          if (!message.fromMe) {
            this.logger.log(`Message queued for processing: ${message.id._serialized}`);
          }
        } catch (error) {
          this.logger.error(
            `Failed to queue message: ${error.message}`,
            error.stack,
          );
        }
      });

      // Initialize client
      await this.client.initialize();

      const initMsg = 'WhatsApp client initialized';
      this.logger.log(initMsg);
      this.writeLog('LOG', initMsg);
    } catch (error) {
      const errorMsg = `Failed to initialize WhatsApp connection: ${error.message}`;
      this.logger.error(errorMsg, error.stack);
      this.writeLog('ERROR', errorMsg, error.stack);
      this.isConnecting = false;
    }
  }

  getClient(): Client | null {
    return this.client;
  }

  getConnectionStatus() {
    return {
      status: this.connectionStatus,
      isConnected: this.connectionStatus === 'ready' || this.connectionStatus === 'authenticated',
      qrCode: this.qrCode,
      lastError: this.lastError,
      isConnecting: this.isConnecting,
    };
  }

  async reconnect(): Promise<void> {
    if (this.isConnecting) {
      throw new Error('Connection attempt already in progress');
    }
    await this.disconnect();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await this.connectToWhatsApp();
  }

  async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.destroy();
      this.client = null;
    }
    this.isConnecting = false;
    this.connectionStatus = 'disconnected';
    this.qrCode = null;
    this.logger.log('WhatsApp connection closed');
    this.writeLog('LOG', 'WhatsApp connection closed');
  }
}
