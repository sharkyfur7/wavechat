import type { Session, User } from 'better-auth';

export type SessionData = {
	session: Session;
	user: User;
};
