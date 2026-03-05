export interface WSMessage {
  type: "message" | "subscribe";
  payload: any;
}

export interface ClientMeta {
  userId: string;
  channelId: string;
}
