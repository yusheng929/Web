import url from 'node:url'
import { modifyUrl } from '../service/util.js'

export default new class WebSocketMethod {
  handle ({ app, handler }) {
    app.ws = (route, ...middlewares) => {
      let path = route
      if (typeof route == 'function') {
        path = '/'
        middlewares = [route, ...middlewares]
      }
      if (middlewares.length == 1 && Array.isArray(middlewares[0])) {
        middlewares = middlewares[0]
      }
      middlewares.forEach(this.middlewareEach.bind({ handler, path }))
      return app
    }
  }

  middlewareEach (middleware, idx) {
    let fn = (socket, request, next) => {
      if (request.ws) {
        /* eslint-disable n/no-deprecated-api */
        let urlObj = url.parse(request.url, true)
        request.query = urlObj.query
        request.wsHandled = true
        try {
          middleware(socket, request, next)
        } catch (err) {
          next(err)
        }
      } else {
        next()
      }
    }
    /** 不走app.handle */
    this.handler.add(modifyUrl(this.path), fn, idx)
  }
}()
