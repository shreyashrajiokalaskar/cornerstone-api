import type { ICurrentUser } from '@app/common';
import { CurrentUser } from '@app/common';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('session')
  createChat(
    @Body('workspaceId') workspaceId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.chatService.createChat(workspaceId, user.id);
  }

  @Post('sessions/:id')
  chat(
    @Param('id') id: string,
    @Body('question') question: string,
    @Body('workspaceId') workspaceId: string,
    @CurrentUser() user: ICurrentUser,
  ) {
    return this.chatService.chat(id, question, workspaceId, user.id);
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.chatService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatService.update(+id, updateChatDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.chatService.remove(+id);
  }
}
