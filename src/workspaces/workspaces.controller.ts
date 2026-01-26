import type { ICurrentUser } from '@app/common';
import { CurrentUser } from '@app/common';
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
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
export class WorkspacesController {
  private readonly logger = new Logger(WorkspacesController.name);

  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  create(
    @Body() createWorkspaceDto: CreateWorkspaceDto,
    @CurrentUser() user: ICurrentUser,
  ) {
    this.logger.log('create workspace called', {
      payload: createWorkspaceDto,
      ownerId: user.id,
    });
    return this.workspacesService.create(createWorkspaceDto, user.id);
  }

  @Get()
  findAll() {
    this.logger.log('findAll workspaces called');
    return this.workspacesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log('findOne workspace called', id);
    return this.workspacesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    this.logger.log('update workspace called', {
      id,
      payload: updateWorkspaceDto,
    });
    return this.workspacesService.update(id, updateWorkspaceDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    this.logger.log('remove workspace called', { id, ownerId: user.id });
    return this.workspacesService.remove(id, user.id);
  }
}
