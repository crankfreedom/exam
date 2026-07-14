import { chalkConfig } from '@/modules/chalk/config'
import type { WebCrawler } from '@/utils/web-crawler'

/**
 * Chalk 模块通用登录服务
 * 封装粉笔网账号密码登录流程，供 chalk 模块下各爬虫复用。
 */
export class ChalkLogin {
  private baseUrl: string = 'https://www.fenbi.com/page/home'

  constructor(private readonly crawler: WebCrawler) { }

  /** 执行粉笔网账号密码登录，登录后自动保存 Cookies */
  async login(): Promise<void> {
    const { username, password } = chalkConfig

    await this.crawler.navigate(this.baseUrl)
    await this.crawler.maximizeWindow()

    await this.crawler.clickElement('button.login-button', 'css')
    await this.crawler.sleep()
    await this.crawler.clickElement("//span[contains(text(),'账号密码登录')]")
    await this.crawler.sleep()
    await this.crawler.fillElement('input.fenbi-login-modal-form-input[type="text"]', username, 'css')
    await this.crawler.fillElement('input.fenbi-login-modal-form-input[type="password"]', password, 'css')
    await this.crawler.clickElement('.fenbi-login-modal-agreement-checkbox', 'css')
    await this.crawler.clickElement('.fenbi-login-modal-form-button', 'css')
    await this.crawler.sleep()
    await this.crawler.setCookies()
  }
}

export default ChalkLogin
