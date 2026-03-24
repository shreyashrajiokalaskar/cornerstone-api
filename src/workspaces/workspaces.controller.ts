import type { ICurrentUser, ROLES } from '@app/common';
import { CurrentUser } from '@app/common';
import { AdminGuard } from '@app/common/guards/admin/admin.guard';
import {
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspacesService } from './workspaces.service';

@Controller('workspaces')
export class WorkspacesController {
  private readonly logger = new Logger(WorkspacesController.name);

  constructor(private readonly workspacesService: WorkspacesService) {}

  @Post()
  @UseGuards(AdminGuard)
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
  findAll(@CurrentUser() user: ICurrentUser) {
    this.logger.log('findAll workspaces called');
    return this.workspacesService.findAll(user.role);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    this.logger.log('findOne workspace called', id);
    return this.workspacesService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AdminGuard)
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
  @UseGuards(AdminGuard)
  remove(@Param('id') id: string, @CurrentUser() user: ICurrentUser) {
    this.logger.log('remove workspace called', { id, ownerId: user.id });
    return this.workspacesService.remove(id, user.id);
  }
}
