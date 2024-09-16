import YAML from 'yaml'
import fs from 'node:fs'

/** 配置文件 */
class Cfg {
  /** 初始化配置 */
  constructor () {
    this.initCfg()
    this.config = {}
  }

  /** 初始化配置 */
  initCfg (pathDef = './config/default_config', path = './config') {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path)
    }
    fs.readdirSync(pathDef).forEach((file) => {
      let sourcePath = `${pathDef}/${file}`
      let targetPath = `${path}/${file}`
      if (fs.lstatSync(sourcePath).isDirectory()) {
        this.initCfg(sourcePath, targetPath)
      } else {
        if (!fs.existsSync(targetPath)) fs.copyFileSync(sourcePath, targetPath)
      }
    })
  }

  get http () {
    let cfg = this.getConfig('server')
    cfg.PUBLIC_ADDRESS = cfg.PUBLIC_ADDRESS.replace(/\/$/, '')
    return cfg
  }

  get http_listen () {
    return [this.http.HTTPS ? this.http.HTTPS_PORT : this.http.HTTP_PORT, this.http.HOST]
  }

  get redis () {
    return this.getConfig('redis')
  }

  get cert () {
    return {
      cert: fs.readFileSync(this.http.CA_CERTIFICATE, 'utf8'),
      key: fs.readFileSync(this.http.CA_PRIVATE, 'utf8')
    }
  }

  /** package.json */
  get package () {
    if (this._package) return this._package

    this._package = JSON.parse(fs.readFileSync('package.json', 'utf8'))
    return this._package
  }

  /** 用户配置 */
  getConfig (name, cache = true) {
    return this.getYaml(name, cache)
  }

  /**
   * 获取配置yaml
   * @param type 默认跑配置-defSet，用户配置-config
   * @param name 名称
   */
  getYaml (name, cache) {
    let file = `config/${name}.yaml`
    if (cache && this.config[name]) return this.config[name]
    let ret = YAML.parse(fs.readFileSync(file, 'utf8'))
    if (cache) this.config[name] = ret
    return ret
  }
}

export default new Cfg()
