import { Builder, By, until, type WebDriver, type WebElement, type Locator } from 'selenium-webdriver'
import Save from '@/utils/save'

/** 元素截图返回信息 */
export interface ScreenshotResult {
  name: string
  width: number
  height: number
}

/**
 * 通用网页爬取基类，封装 Selenium WebDriver 的常用页面操作。
 * 业务模块继承此类即可复用爬取能力，只需关注自身业务逻辑。
 */
export class WebCrawler {
  protected driver: WebDriver | null = null
  protected save: Save

  constructor() {
    this.save = new Save()
  }

  /** 等待指定毫秒 */
  sleep(duration = 2000): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, duration))
  }

  /** 初始化 WebDriver，browser 默认 chrome */
  async init(browser = 'chrome'): Promise<void> {
    this.driver = new Builder().forBrowser(browser).build()
  }

  /** 确保 driver 已初始化 */
  protected getDriver(): WebDriver {
    if (!this.driver) {
      throw new Error('WebDriver 未初始化，请先调用 init()')
    }
    return this.driver
  }

  /** 导航到指定 URL */
  async navigate(url: string): Promise<void> {
    await this.getDriver().get(url)
  }

  /** 最大化浏览器窗口 */
  async maximizeWindow(): Promise<void> {
    await this.getDriver().manage().window().maximize()
  }

  // ─── 页面操作辅助方法 ───

  /** 根据类型将选择器字符串转为 Selenium Locator */
  protected resolveLocator(selector: string, type: string): Locator {
    switch (type) {
      case 'xpath': return By.xpath(selector)
      case 'css': return By.css(selector)
      case 'id': return By.id(selector)
      case 'className': return By.className(selector)
      default: return By.xpath(selector)
    }
  }

  /** 查找某个元素（等待最多 50s） */
  async findElement(selector: string, type = 'xpath'): Promise<WebElement> {
    const driver = this.getDriver()
    const locator = this.resolveLocator(selector, type)
    await driver.wait(until.elementLocated(locator), 50000)
    return driver.findElement(locator)
  }

  /** 点击某个元素 */
  async clickElement(selector: string, type = 'xpath'): Promise<void> {
    const button = await this.findElement(selector, type)
    await this.getDriver().executeScript<void>('arguments[0].click()', button)
  }

  /** 填写输入框 */
  async fillElement(selector: string, value: string, type = 'xpath'): Promise<void> {
    const input = await this.findElement(selector, type)
    await input.sendKeys(value)
  }

  /** 隐藏某个元素 */
  async deleteElement(selector: string, type = 'xpath'): Promise<void> {
    const element = await this.findElement(selector, type)
    await this.getDriver().executeScript<void>('arguments[0].style.display="none"', element)
  }

  /** 设置页面 Cookies */
  async setCookies(): Promise<void> {
    const driver = this.getDriver()
    const cookies = await driver.manage().getCookies()
    for (const cookie of cookies) {
      const { name, value, ...extra } = cookie
      const options = Object.entries(extra).map(([k, v]) => `${k}=${v}`)
      const curCookie = `${name}=${value};${options.join(';')}`
      await driver.executeScript<void>('document.cookie = arguments[0]', curCookie)
    }
  }

  /** 对元素截图并保存 */
  async getImage(element: WebElement, dir: string): Promise<ScreenshotResult> {
    const driver = this.getDriver()
    await driver.executeScript<void>('arguments[0].scrollIntoView()', element)
    await this.sleep(400)
    const { width, height } = await element.getRect()
    const base64 = await element.takeScreenshot()
    const name = this.save.saveImage({ base64, dir: `${dir}/image` })
    return { name, width, height }
  }

  /** 提取元素 innerHTML，分离图片和文本 */
  async getHTML(element: WebElement): Promise<string> {
    const innerHTML = await element.getAttribute('innerHTML')
    if (!innerHTML) return ''
    const images = innerHTML.match(/<img.*?src=.*?>/g) ?? []
    const parts = innerHTML.replace(/<img.*?src=.*?>/g, '|[image]|').split('|')
    let index = 0
    return parts
      .map((part) => {
        if (part === '[image]') {
          const img = images[index]
          index++
          return img ? img.replace(/src.*data-/, '') : ''
        }
        return part
      })
      .join('')
  }

  /** 关闭浏览器 */
  async quit(): Promise<void> {
    await this.driver?.close()
  }
}

export default WebCrawler
