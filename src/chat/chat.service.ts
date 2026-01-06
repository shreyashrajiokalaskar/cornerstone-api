import { RagService } from '@app/common';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const chat = await this.chatRepo.findOne({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      throw new NotFoundException('No chats exists for this User!');
    }

    const messages = await this.messageRepo.find({
      where: {
        chatId,
      },
    });

    messages.map(async (message: MessageEntity) => {
      await this.messageChunk.find({
        where: {
          messageId: message.id,
        },
        relations: {
          chunk: true,
        },
      });
    });
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
