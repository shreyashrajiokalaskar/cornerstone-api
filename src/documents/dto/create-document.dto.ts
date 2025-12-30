import { AllowedMimeTypes } from '@app/common';
import { IsEnum, IsInt, IsString, IsUUID, Max, Min } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  name: string;

  @IsString()
  key: string;

  @IsUUID()
  workspaceId: string;

  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024 * 1024) // 10GB safety limit
  size: number; // bytes

  @IsString()
  checksum: string; // SHA-256 hex string

  @IsEnum(AllowedMimeTypes)
  contentType: AllowedMimeTypes;
}
