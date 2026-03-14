export type SimplifiedUser = {
  id: string;
  name: string;
};

export type ChatMessage = {
  id: string;
  content: string;
  channelId: string;
  user: SimplifiedUser;
  createdAt: Date;
};

export type Server = {
  name: string;
  id: string;
  createdAt: Date;
};

export type Channel = {
  name: string;
  id: string;
  createdAt: Date;
  serverId: string | null;
};
