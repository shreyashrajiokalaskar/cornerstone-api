import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class EmbeddingService {
  private openAi: OpenAI;
  private readonly logger = new Logger(EmbeddingService.name);

  constructor(private config: ConfigService) {
    this.openAi = new OpenAI({
      apiKey: this.config.get('OPENAI_API_KEY') as string,
    });
    this.logger.log('EmbeddingService initialized');
  }

  async embedText(text: string): Promise<number[]> {
    this.logger.debug('embedText called', { length: text.length });
    const response = await this.openAi.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
    });
    return response.data[0].embedding;
  }

  async embedMany(texts: string[]): Promise<number[][]> {
    this.logger.debug('embedMany called', { count: texts.length });
    const response = await this.openAi.embeddings.create({
      model: 'text-embedding-3-small',
      input: texts,
    });
    return response.data.map((d) => d.embedding);
  }
}
