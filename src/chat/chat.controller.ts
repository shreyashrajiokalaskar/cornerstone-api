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
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  private logger = new Logger(ChatController.name);
  constructor(private readonly chatService: ChatService) {}

  @Post('sessions')
  chat(
    @Body('question') question: string,
    @Body('workspaceId') workspaceId: string,
    @CurrentUser() user: ICurrentUser,
    @Query('id') id?: string,
  ) {
    this.logger.log('Chat request received', {
      question,
      workspaceId,
      userId: user.id,
      chatId: id,
      id,
    });
    return this.chatService.chat(question, workspaceId, user.id, id);
  }

  @Get('sessions/:id')
  findAllSessions(
    @Param('id') workspaceId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.chatService.findAllSessions(workspaceId, user.id);
  }

  @Get(':id')
  getChatDetails(
    @Param('id') chatId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.chatService.getChatDetails(chatId, user.id);
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(+id);
  }

  @Get('export/:id')
  exportChat(@Param('id') chatId: string, @CurrentUser() user: ICurrentUser) {
    return this.chatService.exportChat(chatId, user.id);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
  //   return this.chatService.update(+id, updateChatDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    return this.chatService.remove(id, user.id);
  }
}
