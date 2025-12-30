import { AllowedMimeTypes } from '@app/common';
import { IsEnum, IsInt, IsString, IsUUID, Max, Min } from 'class-validator';

export class GetPresignedUrlDto {
  @IsString()
  name: string;

  @IsEnum(AllowedMimeTypes)
  contentType: AllowedMimeTypes;

  @IsUUID()
  workspaceId: string;

  @IsInt()
  @Min(1)
  @Max(20 * 1024 * 1024) // 20 MB
  size: number;

  @IsString()
  checksum: string;
}
