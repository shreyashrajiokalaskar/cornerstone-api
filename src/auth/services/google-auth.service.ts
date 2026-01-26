import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleAuthService {
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly redirectUri: string;
  private readonly scopes: string[];
  private readonly logger = new Logger(GoogleAuthService.name);

  constructor(private readonly configService: ConfigService) {
    this.clientId = this.configService.get<string>('GOOGLE_CLIENT_ID')!;
    this.clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET')!;
    this.redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI')!;
    this.scopes = this.configService
      .get<string>('GOOGLE_SCOPES_API')!
      .split(',');
    this.logger.log('GoogleAuthService initialized');
  }

  private getAuthClient(): OAuth2Client {
    return new OAuth2Client(this.clientId, this.clientSecret, this.redirectUri);
  }

  async getOAuth2ClientUrl(): Promise<{ url: string; state: string }> {
    const client = this.getAuthClient();

    const state = crypto.randomUUID(); // store this in Redis/DB

    const url = client.generateAuthUrl({
      access_type: 'offline',
      scope: this.scopes,
      prompt: 'consent',
      state,
    });

    this.logger.log('Generated OAuth2 client url', { state, url });
    return { url, state };
  }

  async verifyGoogleCode(code: string): Promise<{
    email: string;
    googleId: string;
    name: string;
    image?: string;
  }> {
    const client = this.getAuthClient();

    const { tokens } = await client.getToken(code);
    if (!tokens.id_token) {
      this.logger.warn('verifyGoogleCode: missing id_token');
      throw new UnauthorizedException('Invalid Google token');
    }

    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: this.clientId,
    });

    const payload = ticket.getPayload();
    if (!payload?.email || !payload?.sub) {
      this.logger.warn('verifyGoogleCode: invalid payload', payload);
      throw new UnauthorizedException('Invalid Google user data');
    }

    return {
      email: payload.email,
      googleId: payload.sub,
      name: payload.name ?? '',
      image: payload.picture,
    };
  }
}
