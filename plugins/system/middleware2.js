export class Middleware2 extends plugin {
  constructor () {
    super({
      name: '中间件',
      priority: 9 ** 9,
      rule: [
        {
          method: 'use',
          use: ['Invalid', 'Error']
        }
      ]
    })
  }

  Invalid (req, res) {
    if (!res.writableEnded) {
      req.method == 'GET' ? res.status(404).render('404') : res.send({ status: 1, message: 'Invalid request' })
    }
  }

  Error (err, req, res, next) {
    if (!res.writableEnded) {
      res.send({ status: 1, message: 'Error occurred!' })
    }
    if (err) {
      logger.error(err)
    }
  }
}
