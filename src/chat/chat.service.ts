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

    const messages = await this.messageRepo.find({
      where: {
        chatId,
      },
    });

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

    //     {
    //     "id": "61280398-c8da-44bd-b613-7f48c28b6f2c",
    //     "createdAt": "2026-01-05T16:13:24.564Z",
    //     "updatedAt": "2026-01-05T16:13:24.564Z",
    //     "deletedAt": null,
    //     "role": "user",
    //     "content": "The planned leaves given are Earned Leave or Privilege Leave. One day of Privilege Leave/Earned Leave is credited to the employee's leave account for every twenty working days of continuous service, where continuous service means working at least 240 days out of 360 days or 2/3rds of days if joined mid-year. These leaves are provided for planned long leaves such as travel or vacation [1][4].",
    //     "chatId": "1d6e5257-863b-4b81-9adc-d55c9619ff14",
    //     "chunks": [
    //         {
    //             "id": "d1a98688-a159-488a-adf4-613d8dc076ef",
    //             "createdAt": "2026-01-05T16:13:24.570Z",
    //             "updatedAt": "2026-01-05T16:13:24.570Z",
    //             "deletedAt": null,
    //             "messageId": "61280398-c8da-44bd-b613-7f48c28b6f2c",
    //             "chunk": {
    //                 "id": "d2fca1b3-6f4c-485d-ae07-7da7bbcfa5da",
    //                 "content": " the policies of the workplace and is at the discretion of the manager/management. There is no set rule for which leave to be approved and not approved. Employer can refuse the leave application, if not satisfied with the reason of leave. It depends from reason to reason, manager to manager. Prorate means in proportion. For new joiner & resigned employees one gets pro-rated leaves. So if one works half a year, one is entitled to just half of leaves. Types of leaves: 1. Casual Leave ( 7 -CL ) Casual Leave (CL) are granted for certain unforeseen situation or were you are required to go for one or two days leaves to attend to personal matters and not for vacation. Casual leave can be obtained strictly maximum to 3 days in a month. In such cases the person has to take the permission in advance. -- 1 of 4 --  Casual Leave can be taken for minimum 0.5 to maximum 3 days. In case of more than 3 days leave, it should be taken as Earned/Privileged Leave. If taking 3 leaves together need to appl",
    //                 "document": {
    //                     "id": "a54d6d72-851b-43f7-bd6c-67d35f29264e",
    //                     "createdAt": "2026-01-02T10:38:36.334Z",
    //                     "updatedAt": "2026-01-02T10:43:39.029Z",
    //                     "deletedAt": null,
    //                     "name": "Leave-Policy.pdf",
    //                     "key": "workspaces/91a65e79-cf50-435b-8120-728fb0111c6a/b2992d3a-4dc4-43ac-966b-839acf3df0d2/leave-policy.pdf",
    //                     "status": "COMPLETED",
    //                     "size": "40480",
    //                     "checksum": "Lm/4WHVqcKuAkAAEBmhye5LgaIlq/BhODVN35r1AKng=",
    //                     "workspaceId": "91a65e79-cf50-435b-8120-728fb0111c6a"
    //                 },
    //                 "documentId": "a54d6d72-851b-43f7-bd6c-67d35f29264e"
    //             },
    //             "chunkId": "d2fca1b3-6f4c-485d-ae07-7da7bbcfa5da"
    //         },
    //     ]
    // }

    return records;
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
