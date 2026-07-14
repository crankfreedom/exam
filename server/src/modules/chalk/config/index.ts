/**
 * Chalk 采集器配置
 * 配置直接书写，参考 config/env.ts，不从 process.env 获取
 */

export interface ChalkConfig {
  /** 第三方网站登录账号 */
  username: string
  /** 第三方网站登录密码 */
  password: string
  /** 采集结果输出目录 */
  outputDir: string
  /** 浏览器类型 */
  browser: string
}

export const chalkConfig: ChalkConfig = {
  username: '15872332385',
  password: 'cxj7425313x',
  outputDir: './examination',
  browser: 'chrome',
}
