import { IPresignedUrl, S3Service, safeFilename } from '@app/common';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
  ) { }

  async createUploadLink(
    getPresignedUrlDto: GetPresignedUrlDto,
  ): Promise<IPresignedUrl> {
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

    console.log(checkSum);
    this.logger.log(`AWS Checksum: ${checkSum}`);

    this.logger.log(`DTO Checksum: ${createDocumentDto.checksum}`);

    if (checkSum !== createDocumentDto.checksum) {
      throw new BadRequestException('Oops! File is curropted.');
    }
    const newDoc = this.docRepo.create(createDocumentDto);
    return await this.docRepo.save(newDoc);
  }

  findAll() {
    return `This action returns all documents`;
  }

  async findOne(id: string) {
    const doc = await this.docRepo.findOne({
      where: { id },
    })

    if (!doc) {
      throw new BadRequestException('Document not found');
    }
    return doc;
  }

  async viewDocument(id: string) {
    const doc = await this.findOne(id);
    this.logger.log(`Generating view link for document id: ${id}, key: ${doc.key}`);
    return this.s3Service.getObject(doc.key);
  }

  update(id: number, updateDocumentDto: UpdateDocumentDto) {
    return `This action updates a #${id} document`;
  }

  async remove(id: string) {
    const doc = await this.findOne(id);
    this.logger.log(`Removing document id: ${id}, key: ${doc.key} from S3 and database`);
    const deletedDoc = await this.s3Service.deleteObject(doc.key);
    console.log(deletedDoc)
    return await this.docRepo.delete(id);
  }
}
