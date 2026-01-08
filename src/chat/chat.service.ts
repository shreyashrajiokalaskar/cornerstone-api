import { RagService } from '@app/common';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CHAT_ROLES } from './common.constant';
import { UpdateChatDto } from './dto/update-chat.dto';
import { ChatEntity } from './entities/chat.entity';
import { MessageChunkEntity } from './entities/message-chunk.entity';
import { MessageEntity } from './entities/message.entity';

@Injectable()
export class ChatService {
  private logger = new Logger(ChatService.name);

  constructor(
    @InjectRepository(ChatEntity) private chatRepo: Repository<ChatEntity>,
    private ragService: RagService,
    @InjectRepository(MessageEntity)
    private messageRepo: Repository<MessageEntity>,
    @InjectRepository(MessageChunkEntity)
    private messageChunk: Repository<MessageChunkEntity>,
    private datasource: DataSource,
  ) {}

  async createChat(workspaceId: string, userId: string): Promise<ChatEntity> {
    this.logger.log(workspaceId);
    const workspace = this.chatRepo.create({
      workspaceId,
      userId,
    });
    return await this.chatRepo.save(workspace);
  }

  async findAllSessions(workspaceId: string, userId: string) {
    const chats = await this.chatRepo.find({
      where: {
        workspaceId,
        userId,
      },
    });
    if (!chats) {
      throw new NotFoundException('No chats exists for this workspace!');
    }
    return chats;
  }

  async getChatDetails(chatId: string, userId: string) {
    this.logger.log('Finding chat details with chatId and userId', {
      chatId,
      userId,
    });
    const chat = await this.chatRepo.findOne({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      throw new NotFoundException('No chats exists for this User!');
    }

    const messageRepo = this.datasource
      .getRepository(MessageEntity)
      .createQueryBuilder('message');

    const records = await messageRepo
      .leftJoinAndSelect('message.chunks', 'messageChunks')
      .leftJoin('messageChunks.chunk', 'chunk')
      .addSelect(['chunk.id', 'chunk.content', 'chunk.documentId'])
      .leftJoinAndSelect('chunk.document', 'document')
      .where('message.chatId = :chatId', { chatId })
      .orderBy('message.createdAt', 'ASC')
      .getMany();
    console.log('records', records);

    const finalMessages: any[] = [];
    records.map((rec) => {
      finalMessages.push({
        id: rec.id,
        role: rec.role,
        content: rec.content,
        documents: Array.from(
          new Map(
            rec.chunks.map((mc) => [mc.chunk.document.id, mc.chunk.document]),
          ).values(),
        ),
      });
    });

    return finalMessages;
  }

  async findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  remove(id: number) {
    return `This action removes a #${id} chat`;
  }

  async chat(
    chatId: string,
    question: string,
    workspaceId: string,
    userId: string,
  ) {
    const chat = await this.chatRepo.find({
      where: {
        workspaceId,
        userId,
        id: chatId,
      },
    });
    if (!chat) {
      throw new NotFoundException('No chats exists for this workspace!');
    }

    const message = this.messageRepo.create({
      chatId,
      role: 'user',
      content: question,
    });

    await this.messageRepo.save(message);

    const history = await this.messageRepo.find({
      where: {
        chatId,
      },
      order: {
        updatedAt: 'ASC',
      },
      take: 10,
    });

    const rag = await this.ragService.ask(workspaceId, question, history);

    const assistant = this.messageRepo.create({
      chatId,
      role: CHAT_ROLES.user,
      content: rag?.answer,
    });

    this.logger.log('RAG', rag);

    await this.messageRepo.save(assistant);
    const chunks = rag!.chunks.map((chunk) => ({
      messageId: assistant.id,
      chunkId: chunk.id,
    }));

    await this.messageChunk.save(chunks);
    return {
      answer: assistant.content,
      sources: rag!.sources,
    };
  }
}
