export default new class setTrustProxy {
  handle ({ app, cfg }) {
    let { TRUST_PROXY, TRUST_PROXY_IP } = cfg.http
    if (TRUST_PROXY) {
      app.set('trust proxy', TRUST_PROXY_IP)
    }
  }
}()
