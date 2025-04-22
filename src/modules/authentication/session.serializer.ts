import { PassportSerializer } from '@nestjs/passport';
import { UserWithoutPassword } from '../user/model/types/user-without-password';
import { Injectable } from '@nestjs/common';
import { SessionUser } from './models/types/session-user';

type SerializerFunction = (error: Error | null, user: SessionUser) => void;
type DeserializerFunction = (error: Error | null, payload: SessionUser) => void;

@Injectable()
export class SessionSerializer extends PassportSerializer {
    serializeUser(user: UserWithoutPassword, done: SerializerFunction) {
        const { id, email, username } = user;
        done(null, { id, email, username });
    }
    deserializeUser(payload: SessionUser, done: DeserializerFunction) {
        done(null, payload);
    }
}
