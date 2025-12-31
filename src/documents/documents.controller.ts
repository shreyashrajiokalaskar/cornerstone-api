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
  private logger = new Logger(DocumentsController.name)

  constructor(private readonly documentsService: DocumentsService) { }

  @Post('upload')
  getPresignedUrl(@Body() getPresignedUrlDto: GetPresignedUrlDto) {
    return this.documentsService.createUploadLink(getPresignedUrlDto);
  }

  @Post('uploaded')
  fileUploaded(@Body() createDocumentDto: CreateDocumentDto) {
    return this.documentsService.fileUploaded(createDocumentDto);
  }

  @Get()
  findAll() {
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
    return this.documentsService.update(+id, updateDocumentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.logger.log(`Deleting document with id: ${id}`);
    return this.documentsService.remove(id);
  }
}
