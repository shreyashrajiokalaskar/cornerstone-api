import { RagService } from '@app/common';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from 'src/users/entities/user.entity';
import { WorkspaceEntity } from 'src/workspaces/entities/workspace.entity';
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
            rec.chunks.map((mc) => [
              mc.chunk.documentId,
              {
                content: mc.chunk.content,
                name: mc.chunk.document.name,
                id: mc.chunk.document.id,
              },
            ]),
          ).values(),
        ),
      });
    });

    return { chat, messages: finalMessages };
  }

  async findOne(id: number) {
    return `This action returns a #${id} chat`;
  }

  update(id: number, updateChatDto: UpdateChatDto) {
    return `This action updates a #${id} chat`;
  }

  async remove(chatId: string, userId: string) {
    const chat = await this.chatRepo.findOne({
      where: {
        id: chatId,
        userId,
      },
    });

    if (!chat) {
      throw new NotFoundException('No chats exists for this User!');
    }

    await this.chatRepo.delete(chatId);
    return { message: 'Chat deleted successfully' };
  }

  async chat(
    question: string,
    workspaceId: string,
    userId: string,
    chatId?: string,
  ) {
    if (!chatId) {
      const workspace = await this.datasource
        .getRepository(UserEntity)
        .findOne({
          where: {
            id: userId,
            workspaces: {
              id: workspaceId,
            },
          },
        });

      if (!workspace) {
        throw new NotFoundException('Workspace not found for this user!');
      }

      const chat = this.chatRepo.create({
        workspaceId,
        userId,
        title: question.slice(0, 40) + (question.length > 40 ? '...' : ''),
      });
      await this.chatRepo.save(chat);
      chatId = chat.id;
    }
    const chat = await this.chatRepo.findOne({
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

    if (!chat.title) {
      const msg = history[0].content;
      chat.title = msg.slice(0, 40) + (msg.length > 40 ? '...' : '');
      await this.chatRepo.save(chat);
    }

    const workspace = await this.datasource
      .getRepository(WorkspaceEntity)
      .findOne({
        where: {
          id: workspaceId,
        },
      });

    const rag = await this.ragService.ask(workspaceId, question, history, {
      systemPrompt: workspace?.systemPrompt as string,
      temperature: workspace?.temperature as number,
      topK: workspace?.topK as number,
    });

    const assistant = this.messageRepo.create({
      chatId,
      role: CHAT_ROLES.assistant,
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
      chat,
    };
  }
}
