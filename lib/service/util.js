export function modifyUrl (url) {
  if (url?.includes('?')) {
    let [baseUrl, query] = url.split('?')
    return `${baseUrl.replace(/\/$/, '')}.websocket?${query}`
  }
  return `${url.replace(/\/$/, '')}.websocket`
}

export function rejectListen (error) {
  let { address, port, syscall } = error
  if (syscall == 'listen' && address && port) {
    logger.error(`服务启动失败: 地址/端口无访问权限或已被占用（${address}:${port}）`)
    process.exit()
  } else {
    logger.error(error)
  }
}
