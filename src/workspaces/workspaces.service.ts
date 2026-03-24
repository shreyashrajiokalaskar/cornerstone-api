import {
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { WorkspaceEntity } from './entities/workspace.entity';
import { ROLES } from '@app/common';

@Injectable()
export class WorkspacesService {
  private readonly logger = new Logger(WorkspacesService.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    private workspaceRepo: Repository<WorkspaceEntity>,
  ) {}

  async create(createWorkspaceDto: CreateWorkspaceDto, ownerId: string) {
    const workspace = this.workspaceRepo.create({
      name: createWorkspaceDto.name,
      description: createWorkspaceDto.description,
      ownerId,
    });

    await this.workspaceRepo.save(workspace);
  }

  async findAll(role: ROLES) {
    const queryBuilder = this.workspaceRepo.createQueryBuilder('workspace');
    const query = queryBuilder;
    if (role === ROLES.USER) {
      query.where('workspace.active = :status', { status: true });
    }
    query
      .orderBy('workspace.active', 'DESC')
      .addOrderBy('workspace.updatedAt', 'DESC');
    return await query.getMany();
  }

  async findOne(id: string) {
    const workspace = await this.workspaceRepo.findOne({
      where: {
        id,
      },
      relations: ['documents'],
    });
    if (!workspace) {
      this.logger.log('Workspace NOT FOUND!');
      throw new NotFoundException('Workspace not Found!');
    }
    return this.updateFindResponse(workspace);
  }

  updateFindResponse(workspace: WorkspaceEntity) {
    return {
      id: workspace.id,
      name: workspace.name,
      description: workspace.description,
      ownerId: workspace.ownerId,
      active: workspace.active,
      temperature: workspace.temperature,
      systemPrompt: workspace.systemPrompt,
      topK: workspace,
      documents: workspace.documents.map((document) => {
        return {
          id: document.id,
          name: document.name,
          key: document.key,
          status: document.status,
        };
      }),
    };
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto) {
    const workspace = await this.workspaceRepo.findOne({
      where: {
        id,
      },
    });
    if (!workspace) {
      this.logger.log('Workspace NOT FOUND!');
      throw new NotFoundException('Workspace not Found!');
    }
    if (!workspace.documents?.length && updateWorkspaceDto.active) {
      this.logger.log('Workspace DOES NOT have documents!');
      throw new ConflictException('Workspace DOES NOT have any documents!');
    }
    try {
      Object.assign(workspace, updateWorkspaceDto);
      const updatedWorkspace = await this.workspaceRepo.save(workspace);
      return updatedWorkspace;
    } catch (error) {
      this.logger.error('COULD NOT UPDATE WORKSPACE', error as any);
      throw error;
    }
  }

  async remove(id: string, ownerId: string) {
    const workspace = await this.workspaceRepo.findOne({
      where: {
        id,
        ownerId,
      },
    });
    if (!workspace) {
      this.logger.log('Workspace NOT FOUND!');
      throw new NotFoundException('Workspace not Found!');
    }

    if (workspace.active) {
      this.logger.log('Workspace is ACTIVE!');
      throw new ConflictException('Workspace is ACTIVE!');
    }
    this.workspaceRepo.softDelete(id);
    return `This action removes a #${id} workspace`;
  }
}
