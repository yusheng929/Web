import http from 'node:http'
import https from 'node:https'

export default class Service {
  constructor (args) {
    let server = this.run(args)
    server.on('error', this.rejectListen)
    return server
  }

  run ({ app, cfg }) {
    let { HTTPS, HTTP_TO_HTTPS, HTTP_PORT, PUBLIC_ADDRESS } = cfg.http
    if (!HTTPS) {
      return http.createServer(app)
    } else {
      if (HTTP_TO_HTTPS) {
        http.createServer((req, res) => {
          res.writeHead(307, {
            Location: `${PUBLIC_ADDRESS}${req.url}`
          }).end()
        }).listen(HTTP_PORT)
      }
      return https.createServer(cfg.cert, app)
    }
  }

  rejectListen (error) {
    let { address, port, syscall } = error
    if (syscall == 'listen' && address && port) {
      logger.error(`服务启动失败: 地址/端口无访问权限或已被占用（${address}:${port}）`)
      process.exit()
    } else {
      logger.error(error)
    }
  }
}
