export type SimplifiedUser = {
  id: string;
  name: string;
};

export type ChatMessage = {
  content: string;
  channelId: number;
  user: SimplifiedUser;
  createdAt: Date;
};

export type Server = {
  name: string;
  id: number;
  createdAt: Date;
};

export type Channel = {
  name: string;
  id: number;
  createdAt: Date;
  serverId: number | null;
};
