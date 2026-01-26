import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { GetPresignedUrlDto } from './dto/get-presigned-url.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Controller('documents')
export class DocumentsController {
  private readonly logger = new Logger(DocumentsController.name);

  constructor(private readonly documentsService: DocumentsService) {}

  @Post('upload')
  getPresignedUrl(@Body() getPresignedUrlDto: GetPresignedUrlDto) {
    this.logger.log('createUploadLink called', getPresignedUrlDto);
    return this.documentsService.createUploadLink(getPresignedUrlDto);
  }

  @Post('uploaded')
  fileUploaded(@Body() createDocumentDto: CreateDocumentDto) {
    this.logger.log('fileUploaded called', {
      name: createDocumentDto.name,
      workspaceId: createDocumentDto.workspaceId,
    });
    return this.documentsService.fileUploaded(createDocumentDto);
  }

  @Get()
  findAll() {
    this.logger.log('findAll documents called');
    return this.documentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log(`Fetching document with id: ${id}`);
    return this.documentsService.findOne(id);
  }

  @Get('view/:id')
  viewDocument(@Param('id') id: string) {
    this.logger.log(`Viewing document with id: ${id}`);
    return this.documentsService.viewDocument(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDocumentDto: UpdateDocumentDto,
  ) {
    this.logger.log('update document called', {
      id,
      payload: updateDocumentDto,
    });
    return this.documentsService.update(+id, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log(`Deleting document with id: ${id}`);
    return this.documentsService.remove(id);
  }
}
