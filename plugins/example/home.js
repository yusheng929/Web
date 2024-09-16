export class HomePage extends plugin {
  constructor () {
    super({
      name: 'HomePage',
      rule: [
        {
          method: 'get',
          path: '/',
          fnc: 'home'
        }
      ]
    })
  }

  /** 站点首页 */
  home () {
    let cfg = Server.cfg.getConfig('page/home', false)
    for (let name of ['socialLinks', 'siteLinks', 'upData']) {
      cfg[name] = this.readJson(`./config/page/home/${name}.json`)
    }
    this.render('index', { cfg })
  }
}
