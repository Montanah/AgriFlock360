import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback, Profile } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

interface GoogleUser {
  google_id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  picture?: string;
  oauth_provider: string;
  accessToken?: string;
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get<string>('GOOGLE_CLIENT_ID') || '',
      clientSecret: configService.get<string>('GOOGLE_CLIENT_SECRET') || '',
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL') || '',
      scope: ['email', 'profile'],
      passReqToCallback: false,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, name, emails, photos } = profile;

    const user: GoogleUser = {
      google_id: id,
      email: emails?.[0]?.value,
      first_name: name?.givenName,
      last_name: name?.familyName,
      picture: photos?.[0]?.value,
      oauth_provider: 'google',
      accessToken,
    };

    done(null, user);
  }
}
