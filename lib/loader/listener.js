import PluginsLoader from './loader.js'
import Plugin from './plugin.js'
import Handler from '../service/handler.js'
import Service from '../service/service.js'
import WebSocket from '../service/websocket.js'
import util from 'node:util'
import fs from 'node:fs'

export default class ListenerLoader extends PluginsLoader {
  constructor () {
    global.plugin = Plugin
    super()
  }

  static create (args) {
    args.handler = new Handler(args)
    args.server = new Service(args)
    args.wss = new WebSocket(args)
    return Object.assign(new ListenerLoader(), args)
  }

  async run () {
    await this.applicationHandle()
    await this.pluginsLoader()
    await this.addListener()
    this.server.listen(...this.cfg.http_listen)
  }

  async applicationHandle () {
    let files = fs.readdirSync('./lib/application/').filter(v => v.endsWith('.js'))
    for (let val of files) {
      let application = (await import(`../application/${val}`)).default
      await application.handle(this)
    }
  }

  async addListener () {
    for (let plugin of this.priority) {
      if (plugin.rule) {
        for (let v of plugin.rule) {
          let middlewares = []

          let path = ((plugin.self.route || '') + (v.path || '')) || '/'

          if (v.use) {
            if (typeof v.use == 'string' && plugin.self[v.use]) {
              let result = await plugin.self[v.use]()
              if (result) {
                if (!Array.isArray(result)) {
                  result = [result]
                }
                middlewares.push(...result)
              }
            } else if (Array.isArray(v.use)) {
              v.use.forEach(fn => {
                if (fn && plugin.self[fn]) {
                  middlewares.push(plugin.self[fn])
                }
              })
            }
          }

          if (v.fnc && plugin.self[v.fnc]) {
            if (v.method == 'ws') {
              middlewares.push(this.WebSocketEvent(plugin, v.fnc))
            } else {
              middlewares.push(this.HttpRequestEvent(plugin, v.fnc))
            }
          }

          try {
            let methods = Array.isArray(v.method) ? v.method : [v.method]
            methods.forEach(method => this.app[method](path, middlewares))
          } catch (err) {
            logger.error(`routeError: [${v.method}]'${path}'`)
            logger.error(err.stack)
            continue
          }
        }
      }
    }
  }

  HttpRequestEvent (plugin, fnc) {
    return async (req, res, next) => {
      let p = (this.priority.find(val => val.key == plugin.key))?.class
      if (!p) return res.send({ status: 1, message: 'Error occurred!' })
      let t = {
        req,
        res,
        next,
        param: req.params,
        query: req.query,
        cookie: req.cookies,
        body: req.body,
        end: res.end,
        send: (data, status) => res.status(status || 200).send(data),
        error: (msg, status) => res.status(status || 200).send({ status: 1, message: msg || 'Invalid request' }),
        render: res.render
      }
      t.params = Object.assign({}, t.param, t.query, t.body, t.cookie)
      /* eslint-disable new-cap */
      let self = Object.assign(new p(), t)
      try {
        let res = self[fnc] && self[fnc]()
        if (util.types.isPromise(res)) {
          res = await res
        }
      } catch (err) {
        if (err) logger.error(err)
      }
    }
  }

  WebSocketEvent (plugin, fnc) {
    return async (socket, request, next) => {
      let p = (this.priority.find(val => val.key == plugin.key))?.class
      if (!p) return socket.close()
      let t = {
        socket,
        request,
        next,
        send: (...args) => socket.send(...args),
        close: () => socket.close(),
        onMessage: (fn, on = 'on') => socket[on]('message', fn),
        onClose: (fn, on = 'on') => socket[on]('close', fn),
        onError: (fn, on = 'on') => socket[on]('error', fn)
      }
      /* eslint-disable new-cap */
      let self = Object.assign(new p(), t)
      self.onError(logger.error)
      try {
        let res = self[fnc] && self[fnc]()
        if (util.types.isPromise(res)) {
          res = await res
        }
      } catch (err) {
        if (err) logger.error(err)
      }
    }
  }
}
