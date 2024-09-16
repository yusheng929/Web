import { WebSocketServer } from 'ws'
import { rejectListen, modifyUrl } from './util.js'

export default class WebSocket extends WebSocketServer {
  constructor ({ server, handler }) {
    super({ server })
    this.#handleListen({ handler })
  }

  #handleListen (args) {
    this.on('error', rejectListen)
    this.on('connection', this.#onConnect.bind(args))
  }

  #onConnect (socket, request) {
    if ('upgradeReq' in socket) {
      request = socket.upgradeReq
    }
    request.ws = socket
    request.url = modifyUrl(request.url)
    this.handler.call(request.url.split('?')[0], [socket, request], () => {
      if (!request.wsHandled) socket.close()
    })
  }
}
