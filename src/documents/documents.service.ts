import { IPresignedUrl, S3Service, safeFilename } from '@app/common';
import type { QueueService } from '@app/common/services/aws/queue/sqs.interface';
import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateDocumentDto } from './dto/create-document.dto';
import { GetPresignedUrlDto } from './dto/get-presigned-url.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { DocumentEntity } from './entities/document.entity';

@Injectable()
export class DocumentsService {
  private logger = new Logger(DocumentsService.name);
  constructor(
    private s3Service: S3Service,
    @InjectRepository(DocumentEntity)
    private docRepo: Repository<DocumentEntity>,
    @Inject('QUEUE_SERVICE') private readonly sqsService: QueueService,
    private dataSource: DataSource,
  ) {}

  async createUploadLink(
    getPresignedUrlDto: GetPresignedUrlDto,
  ): Promise<IPresignedUrl> {
    this.logger.log('createUploadLink called', getPresignedUrlDto);
    const key = `workspaces/${getPresignedUrlDto.workspaceId}/${crypto.randomUUID()}/${safeFilename(getPresignedUrlDto.name)}`;
    const checksumExists = await this.docRepo.findOneBy({
      workspaceId: getPresignedUrlDto.workspaceId,
      checksum: getPresignedUrlDto.checksum,
    });
    if (checksumExists) {
      throw new BadRequestException('File already exists');
    }
    return await this.s3Service.putObject(
      key,
      getPresignedUrlDto.contentType,
      getPresignedUrlDto.checksum,
    );
  }

  async fileUploaded(createDocumentDto: CreateDocumentDto) {
    const checkSum = await this.s3Service.getChecksum(createDocumentDto.key);

    this.logger.debug('AWS checksum from S3', checkSum);
    this.logger.log(`AWS Checksum: ${checkSum}`);

    this.logger.log(`DTO Checksum: ${createDocumentDto.checksum}`);

    if (checkSum !== createDocumentDto.checksum) {
      throw new BadRequestException('Oops! File is corrupted.');
    }
    const newDoc = this.docRepo.create(createDocumentDto);
    const doc = await this.docRepo.save(newDoc);
    this.logger.log(`Document saved with id: ${newDoc.id}, key: ${newDoc.key}`);
    await this.sqsService.sendDocumentJob({
      documentId: newDoc.id,
      workspaceId: newDoc.workspaceId,
      key: newDoc.key,
    });

    this.logger.log(`Document job sent to SQS for document id: ${newDoc.id}`);
    return doc;
  }

  findAll() {
    return `This action returns all documents`;
  }

  async findOne(id: string) {
    const doc = await this.docRepo.findOne({
      where: { id },
    });

    if (!doc) {
      throw new BadRequestException('Document not found');
    }
    return doc;
  }

  async viewDocument(id: string) {
    const doc = await this.findOne(id);
    this.logger.log(
      `Generating view link for document id: ${id}, key: ${doc.key}`,
    );
    return this.s3Service.getObject(doc.key);
  }

  update(id: number, updateDocumentDto: UpdateDocumentDto) {
    return `This action updates a #${id} document`;
  }

  async remove(id: string) {
    this.dataSource.transaction(async (manager) => {
      const document = await manager.findOne(DocumentEntity, {
        where: { id },
      });
      if (!document) {
        throw new BadRequestException('Document not found');
      }
      this.logger.log(
        `Removing document id: ${id}, key: ${document.key} from S3 and database`,
      );
      await this.s3Service.deleteObject(document.key);
      return await manager.delete(DocumentEntity, id);
    });
  }
}
