import { EmbeddingService, RagService, VectorService } from '@app/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ChatEntity } from './entities/chat.entity';
import { MessageChunkEntity } from './entities/message-chunk.entity';
import { MessageEntity } from './entities/message.entity';

@Module({
  controllers: [ChatController],
  providers: [ChatService, RagService, VectorService, EmbeddingService],
  imports: [
    TypeOrmModule.forFeature([ChatEntity, MessageChunkEntity, MessageEntity]),
  ],
})
export class ChatModule {}
