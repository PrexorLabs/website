import { DurableObject } from 'cloudflare:workers';
import type { Env } from './index';

/**
 * Holds the WebSocket of every open home page and sends each changed event to all of them. Pages only listen, and
 * the sockets hibernate between messages, so an idle connection costs nothing.
 */
export class LabLive extends DurableObject<Env> {
  async fetch(): Promise<Response> {
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  broadcast(message: string): void {
    for (const socket of this.ctx.getWebSockets()) socket.send(message);
  }
}
