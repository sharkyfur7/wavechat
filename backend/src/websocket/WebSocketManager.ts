import WebSocket from "ws";
import { ChatMessage } from "@wavechat/shared";
import { ClientMeta, WSMessage } from "./types.js";

import { User } from "better-auth";

export class WebSocketManager {
  private clients = new Map<WebSocket, ClientMeta>();

  setClient(ws: WebSocket, userId: string, channelId: string) {
    this.clients.set(ws, { userId, channelId });
  }

  removeClient(ws: WebSocket) {
    this.clients.delete(ws);
  }

  broadcastMessage(message: ChatMessage) {
    this.clients.forEach((meta, socket) => {
      if (meta.channelId === message.channelId && socket.readyState === WebSocket.OPEN) {
        socket.send(
          JSON.stringify({
            type: "message",
            payload: message,
          }),
        );
      }
    });
  }

  handleMessage(ws: WebSocket, data: string, user: User) {
    const msg: WSMessage = JSON.parse(data);

    switch (msg.type) {
      case "subscribe":
        if (!msg.payload?.channelId) throw new Error("channelId missing in subscribe payload!");
        this.setClient(ws, user.id, msg.payload?.channelId);
        break;
    }
  }
}

export const wsManager = new WebSocketManager();
