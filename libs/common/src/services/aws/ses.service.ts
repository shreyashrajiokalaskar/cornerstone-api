import { SendEmailCommand, SESClient } from '@aws-sdk/client-ses';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SesService {
  client: SESClient;

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
    const link = `https://app.cornerstone.ai/admin/activate?token=${token}`;
    console.log(
      `Sending invite email to ${email} with link: ${link} with token: ${token}`,
    );

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
              <p>You were invited to join Cornerstone as an Admin.</p>
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
