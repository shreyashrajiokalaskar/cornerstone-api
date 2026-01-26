import {
  AI_LIMITS,
  estimateTokens,
  IAiConfig,
  ISimilarSearch,
  truncateContext,
} from '@app/common';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import {
  ChatCompletionAssistantMessageParam,
  ChatCompletionSystemMessageParam,
  ChatCompletionUserMessageParam,
} from 'openai/resources';
import { MessageEntity } from 'src/chat/entities/message.entity';
import { EmbeddingService } from './embeddings.service';
import { VectorService } from './vector.service';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);
  client!: OpenAI;

  constructor(
    private config: ConfigService,
    private vectorService: VectorService,
    private embeddingService: EmbeddingService,
  ) {
    this.client = new OpenAI({
      apiKey: this.config.get('OPENAI_API_KEY'),
    });
  }

  async ask(
    workspaceId: string,
    question: string,
    history: MessageEntity[],
    aiConfig: IAiConfig,
  ) {
    try {
      this.logger.log('Question received', { question, workspaceId });
      const embeddedQuestion = await this.embeddingService.embedText(question);
      const similarChunks: ISimilarSearch[] =
        await this.vectorService.similaritySearch(
          workspaceId,
          embeddedQuestion,
          aiConfig.topK,
        );
      // this.logger.debug(`Found ${similarChunks.length} similar chunks for the question.`);
      this.logger.debug('Found similar chunks', {
        count: similarChunks.length,
      });

      // const context = similarChunks.map((chunk) => chunk.content).join("\n\n");
      // const context = similarChunks
      //   .map((c, i) => `[${i + 1}] ${c.content} (Source: ${c.document_name})`)
      //   .join('\n\n');

      let context: string = similarChunks.map((c) => c.content).join('\n---\n');

      const contextTokens = estimateTokens(context);

      if (contextTokens > AI_LIMITS.MAX_CONTEXT_TOKENS) {
        const reducedChunks = truncateContext(similarChunks);
        context = reducedChunks.map((chunk) => chunk.content).join('\n---\n');
      }
      this.logger.debug('context', { length: context.length });
      const messages:
        | ChatCompletionUserMessageParam[]
        | ChatCompletionAssistantMessageParam[]
        | ChatCompletionSystemMessageParam[] = [
        {
          role: 'system',
          content: aiConfig.systemPrompt,
        },
        ...(history.map((m: MessageEntity) => ({
          role: m.role,
          content: m.content,
        })) as any),
        {
          role: 'user',
          content: `
                    Documents:
                    ${context}

                    Question:
                    ${question}
                    `,
        },
      ];
      // 1 content is here (Source: leave-policy.pdf)
      const conversation = await this.client.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages,
        temperature: aiConfig.temperature,
      });

      //   return conversation.choices[0].message.content;
      return {
        answer: conversation.choices[0].message.content as string,
        chunks: similarChunks as ISimilarSearch[],
        sources: similarChunks.map((c, i) => ({
          index: i + 1,
          documentId: c.document_id,
          documentName: c.document_name,
          preview: c.content.slice(0, 200),
        })),
      };
    } catch (error) {
      this.logger.error('RagService.ask failed', error);
      throw error;
    }
  }

  async embedQuestion(question: string) {
    await this.embeddingService.embedText(question);
  }
}
