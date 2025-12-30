import { AuthGuard } from '@app/common';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WorkspaceEntity } from './entities/workspace.entity';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';

@Module({
  controllers: [WorkspacesController],
  providers: [
    WorkspacesService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  imports: [TypeOrmModule.forFeature([WorkspaceEntity])],
})
export class WorkspacesModule {}
