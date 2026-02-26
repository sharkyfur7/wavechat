import type { Session, User } from 'better-auth';

export type SessionData = {
	session: Session;
	user: User;
};

export type ChatMessage = {
	content: string;
	channelId: number;
	userId: string;
	userName: string;
	createdAt: number;
};
