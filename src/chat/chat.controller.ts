import type { ICurrentUser } from '@app/common';
import { CurrentUser, InternalGuard } from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Post,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { Response } from 'express';
import { ChatService } from './chat.service';
import { CreateChatDto } from './dto/create-chat.dto';

@Controller('chat')
export class ChatController {
  private readonly logger = new Logger(ChatController.name);
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  chat(
    @Body() createChat: CreateChatDto,
    @CurrentUser() user: ICurrentUser,
    @Res() res: Response,
    @Query('id') id?: string,
  ) {
    this.logger.log('Chat request received', {
      question: createChat.question,
      workspaceId: createChat.workspaceId,
      userId: user.id,
      chatId: id,
      id,
    });

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    return this.chatService.chat(
      createChat.question,
      createChat.workspaceId,
      user.id,
      id,
      res,
    );
  }

  @UseGuards(InternalGuard)
  @Get('export-chat')
  getChatDetailsForExport(
    @Query('chatId') chatId: string,
    @Query('userId') userId: string,
  ) {
    this.logger.log(
      `Calling getChatDetails from Chat Controller for Export Chat with chatId:${chatId} and userId:${userId}`,
    );
    return this.chatService.getChatDetails(chatId, userId);
  }

  @Get('sessions/:id')
  findAllSessions(
    @Param('id') workspaceId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log('findAllSessions called', { workspaceId, userId: user.id });
    return this.chatService.findAllSessions(workspaceId, user.id);
  }

  @Get(':id')
  getChatDetails(
    @Param('id') chatId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log('getChatDetails called', { chatId, userId: user.id });
    return this.chatService.getChatDetails(chatId, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log('findOne called for chat id', id);
    return this.chatService.findOne(+id);
  }

  @Get('export/:id')
  exportChat(@Param('id') chatId: string, @CurrentUser() user: ICurrentUser) {
    this.logger.log('exportChat called', { chatId, userId: user.id });
    return this.chatService.exportChat(chatId, user.id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
  //   return this.chatService.update(+id, updateChatDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    this.logger.log('remove chat called', { chatId: id, userId: user.id });
    return this.chatService.remove(id, user.id);
  }
}
