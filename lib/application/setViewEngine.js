import template from 'art-template'
import { resolve } from 'node:path'
import fs from 'node:fs'
import md5 from 'md5'

export default new class SetViewEngine {
  viewCache = {}

  handle ({ app }) {
    app.engine('html', this.renderView.bind(this))
    app.set('views', resolve('public'))
    app.set('view engine', 'html')
    app.set('x-powered-by', false)
  }

  renderView (filename, opt, cb) {
    try {
      let tmp = md5(fs.readFileSync(filename))
      let cache = this.viewCache[filename]
      if (cache !== tmp) template.defaults.caches.set(filename, null)
      this.viewCache[filename] = tmp
      template.defaults.imports.indexCfg = Server.cfg.getConfig('page/home')
      opt.cfg && (opt._cfg_base64 = Buffer.from(encodeURIComponent(JSON.stringify(opt.cfg))).toString('base64'))
      let render = template.compile({ filename, debug: false })
      cb(null, render(opt))
    } catch (err) {
      cb(err)
    }
  }
}()
