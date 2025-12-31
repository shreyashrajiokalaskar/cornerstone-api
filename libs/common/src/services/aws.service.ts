import {
  DeleteObjectCommand,
  DeleteObjectCommandOutput,
  GetObjectAttributesCommand,
  GetObjectCommand,
  ObjectAttributes,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AllowedMimeTypes, IPresignedUrl } from '..';

@Injectable()
export class S3Service {
  private client: S3Client;
  private bucket: string;

  constructor(private configService: ConfigService) {
    this.client = new S3Client({
      region: this.configService.get('S3_REGION') as string,
      credentials: {
        accessKeyId: this.configService.get('S3_ACCESS_KEY') as string,
        secretAccessKey: this.configService.get('S3_SECRET_KEY') as string,
      },
    });

    this.bucket = this.configService.get('S3_BUCKET_NAME') as string;
  }

  async getObject(key: string): Promise<IPresignedUrl> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });
    const url = await this.getPresignedUrl(command);
    return {
      url,
      key,
    };
  }

  async putObject(
    key: string,
    contentType: AllowedMimeTypes,
    checksum: string,
  ): Promise<IPresignedUrl> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
      ChecksumAlgorithm: 'SHA256',
      ChecksumSHA256: checksum,
    });
    const url = await this.getPresignedUrl(command);
    return {
      url,
      key,
    };
  }

  async deleteObject(key: string): Promise<DeleteObjectCommandOutput> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key
    })
    return await this.client.send(command);
  }


  private async getPresignedUrl(
    command: GetObjectCommand | PutObjectCommand | DeleteObjectCommand,
  ): Promise<string> {
    return await getSignedUrl(this.client, command, {
      expiresIn: 600, // 10 minutes,
      unhoistableHeaders: new Set(['x-amz-checksum-sha256']),
    });
  }

  async getChecksum(key: string): Promise<string | undefined> {
    const command = new GetObjectAttributesCommand({
      Bucket: this.bucket,
      Key: key,
      ObjectAttributes: [ObjectAttributes.CHECKSUM],
    });

    const response = await this.client.send(command);

    // This will return the "eCRFdaX..." value you see in the console
    return response.Checksum?.ChecksumSHA256;
  }
}
