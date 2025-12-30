import { AuthGuard, S3Service } from '@app/common';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { DocumentChunkEntity } from './entities/document-chunk.entity';
import { DocumentEntity } from './entities/document.entity';

@Module({
  controllers: [DocumentsController],
  providers: [
    DocumentsService,
    S3Service,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [TypeOrmModule.forFeature([DocumentEntity, DocumentChunkEntity])],
})
export class DocumentsModule {}
