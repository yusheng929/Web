import { resolve } from 'node:path'
import { readdir } from 'node:fs/promises'

export class example extends plugin {
  constructor () {
    super({
      /** 插件名称 */
      name: 'HelloWorld',
      rule: [
        {
          /** 请求方法 */
          method: 'get',
          /** 请求路径 */
          path: '/image/help',
          /** 执行方法 */
          fnc: 'image'
        }
      ]
    })
  }

  /** 请求处理 */
  async image () {
      const imagesDir = resolve('./public/images/images/help')
      const files = await readdir(imagesDir)
      
      // 过滤出图片文件
      const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))

      // 随机选择一张图片
      const randomIndex = Math.floor(Math.random() * imageFiles.length)
      const randomImage = imageFiles[randomIndex]

      this.res.sendFile(resolve(imagesDir, randomImage))
  }
}
