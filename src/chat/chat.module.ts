import {
  EmbeddingService,
  RagService,
  SqsService,
  VectorService,
} from '@app/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatEntity } from './entities/chat.entity';
import { MessageChunkEntity } from './entities/message-chunk.entity';
import { MessageEntity } from './entities/message.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  controllers: [ChatController],
  providers: [
    ChatService,
    RagService,
    VectorService,
    EmbeddingService,
    SqsService,
  ],
  imports: [
    UsersModule,
    TypeOrmModule.forFeature([ChatEntity, MessageChunkEntity, MessageEntity]),
  ],
})
export class ChatModule {}
