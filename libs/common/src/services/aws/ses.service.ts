import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SesService {
  client: SESClient;
  private readonly logger = new Logger(SesService.name);

  constructor(private configService: ConfigService) {
    this.client = new SESClient({
      region: this.configService.get<string>('AWS_REGION') as string,
      credentials: {
        accessKeyId: this.configService.get<string>(
          'AWS_SES_ACCESS_KEY_ID',
        ) as string,
        secretAccessKey: this.configService.get<string>(
          'AWS_SES_SECRET_ACCESS_KEY',
        ) as string,
      },
    });
  }

  async sendInviteEmail(email: string, token: string) {
    const link = `https://pucho.netlify.app/auth/admin/activate?token=${token}`;
    this.logger.log(`Sending invite email to ${email}`, { link, token });

    await this.client.send(
      new SendEmailCommand({
        Source: 'Cornerstone <shreyashrajiokalaskar@gmail.com>',
        Destination: { ToAddresses: [email] },
        Message: {
          Subject: {
            Data: 'You have been invited as an Admin',
          },
          Body: {
            Html: {
              Data: `
              <h2>You’ve been invited</h2>
              <p>You were invited to join Pucho as an Admin.</p>
              <p>
                <a href="${link}" style="padding:12px 18px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px">
                  Activate Admin Account
                </a>
              </p>
              <p>This link expires in 24 hours.</p>
            `,
            },
          },
        },
      }),
    );
  }
}
