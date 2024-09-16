import { resolve, join } from 'node:path'
import { readdir } from 'node:fs/promises'

export class example extends plugin {
  constructor() {
    super({
      /** 插件名称 */
      name: 'HelloWorld',
      rule: [
        {
          /** 请求方法 */
          method: 'get',
          /** 请求路径 */
          path: '/image/:category', // 使用 :category 作为动态路径参数
          /** 执行方法 */
          fnc: 'image'
        }
      ]
    })
  }

  /** 请求处理 */
  async image() {
    const category = this.req.params.category; // 从请求参数中获取动态部分
    const imagesDir = resolve(`./public/images/images/${category}`); // 动态构建目录路径
      const files = await readdir(imagesDir);
      
      // 过滤出图片文件
      const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file));

      // 随机选择一张图片
      const randomIndex = Math.floor(Math.random() * imageFiles.length);
      const randomImage = imageFiles[randomIndex];

      this.res.sendFile(join(imagesDir, randomImage)); // 使用 join 函数构建文件路径
  }
}
