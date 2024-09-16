import fs from 'node:fs'
import path from 'node:path'
import YAML from 'yaml'
import multer from 'multer'
import rateLimit from 'express-rate-limit'

export default class plugin {
  /**
   * @param {string} name 插件名称
   * @param {string} [dsc] 插件描述
   * @param {number} [priority] 插件优先级
   * @param {string} [route] 请求路径前缀
   * @param {string} rule.method 请求方法
   * * rule.method可以是数组，method[ws]属于自定义方法不经过app.handle所以不支持通配符
   * @param {string} rule.path 请求路径
   * * 有route前缀时请求路径=route+rule.path
   * @param {string} [rule.use] 中间件路由
   * * 匹配到的路由会在rule.fnc方法之前按顺序执行一遍rule.use中间件
   * * rule.use是string时fn需要返回中间件函数, rule.use是数组时则直接传入req,res对象
   * @param {string} rule.fnc 请求默认方法
   * * 每个请求都是一个实例，可以打印this查看默认对象
   * * 方法执行完成之前必须结束与客户端的连接
   * * 或者调用next()将控制权交给下一个路由，否则客户端请求会一直处于挂起状态
   */
  constructor (data = {}) {
    /** 插件名称 */
    this.name = data.name || ''
    /** 插件描述 */
    this.dsc = data.dsc || ''
    /** 插件优先级 */
    this.priority = data.priority || 5
    /** 请求路径前缀 */
    this.route = data.route || ''
    /** 路由规则 */
    this.rule = data.rule || []
    /** 定时任务，可以是数组 */
    this.task = {
      /** 任务名 */
      name: '',
      /** 任务方法名 */
      fnc: data.task?.fnc || '',
      /** 任务cron表达式 */
      cron: data.task?.cron || ''
    }
  }

  /** 读json */
  readJson (filePath, format = 'json') {
    try {
      if (format == 'yaml') {
        return YAML.parse(fs.readFileSync(filePath, 'utf8'))
      }
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch (err) {
      return false
    }
  }

  /** 写json */
  writeJson (savePath, data, format = 'json') {
    this.mkdir(path.dirname(savePath))
    if (format == 'yaml') return fs.writeFileSync(savePath, YAML.stringify(data))
    return fs.writeFileSync(savePath, JSON.stringify(data, null, 2))
  }

  /** 创建文件夹 */
  mkdir (dirname) {
    if (fs.existsSync(dirname)) {
      return true
    } else {
      if (this.mkdir(path.dirname(dirname))) {
        fs.mkdirSync(dirname)
        return true
      }
    }
  }

  /** 休眠函数 */
  sleep (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /** 速率限制 */
  limiter (limit = 15, cd = 60, options = {}) {
    options = {
      limit,
      windowMs: cd * 1000,
      legacyHeaders: false,
      message: { status: 1, message: 'Frequent requests, please try again later' },
      ...options
    }
    return rateLimit(options)
  }

  /** 文件上传, single, array, any */
  upload (savaPath = './public/upload', filename, options = {}) {
    options = {
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          cb(null, savaPath)
        },
        filename: filename || ((req, file, cb) => {
          cb(null, Date.now() + path.extname(file.originalname))
        })
      }),
      limits: { fileSize: 5 * 1024 * 1024, files: 1 },
      ...options
    }
    return multer(options)
  }

  /** CORS头部 */
  cors () {
    return (req, res, next) => {
      res.set({
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Max-Age': 1728000,
        'Access-Control-Allow-Origin': req.headers.origin || '*',
        'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
        'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS'
      })
      req.method === 'OPTIONS' ? res.status(204).end() : next()
    }
  }
}
