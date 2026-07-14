import { By, type WebElement } from 'selenium-webdriver'
import { WebCrawler } from '@/utils/web-crawler'
import { chalkConfig } from '@/modules/chalk/config'
import { ChalkLogin } from '../services/chalk-login'
import type { ExamOption, ExamArticle, ExamAnalysis, ExamPaper } from '../types'

export class ChalkCrawler extends WebCrawler {
  private readonly loginService: ChalkLogin
  private paperUrl: string = 'https://www.fenbi.com/spa/tiku/guide/catalog/xingce?prefix=xingce'

  constructor() {
    super()
    this.loginService = new ChalkLogin(this)
  }

  /** 初始化 WebDriver（使用 chalk 配置的浏览器） */
  async init(): Promise<void> {
    await super.init(chalkConfig.browser)
  }

  // ─── 登录 ───

  /** 委托通用登录服务执行粉笔网登录 */
  async login(): Promise<void> {
    await this.loginService.login()
  }

  // ─── 题目提取 ───

  /** 从单个题目 DOM 提取完整数据 */
  private async extractArticle(art: WebElement): Promise<ExamArticle> {
    // 题目序号
    const rankEl = await art.findElement(By.css('fb-ng-solution-choice article > .options-title'))
    const rank = await rankEl.getText()

    // 题目类型
    const typeEl = await art.findElement(By.css('fb-ng-solution-choice article .radio-ques-type'))
    const type = await typeEl.getText()

    // 材料（可能不存在）
    let materialTitle = ''
    let materials: string[] = []
    try {
      const mtEl = await art.findElement(By.css('fb-ng-question-material .fb-question-material .material-nav > h4'))
      materialTitle = await mtEl.getText()
    } catch { /* 无材料标题 */ }
    try {
      const materialEls = await art.findElements(By.css('fb-ng-question-material .fb-question-material .material-content > p'))
      for (const m of materialEls) {
        materials.push(await this.getHTML(m))
      }
    } catch { /* 无材料内容 */ }

    // 题干
    const questionEls = await art.findElements(By.css('fb-ng-solution-choice article .content .question-content > p'))
    const question: string[] = []
    for (const q of questionEls) {
      question.push(await this.getHTML(q))
    }

    // 选项
    const optionEls = await art.findElements(By.css('fb-ng-solution-choice ul > li'))
    const options: ExamOption[] = []
    for (const opt of optionEls) {
      const prexEl = await opt.findElement(By.css('label > p'))
      const prex = await prexEl.getText()
      const textEl = await opt.findElement(By.className('options-material'))
      const text = await this.getHTML(textEl)
      options.push({ prex, text })
    }

    // 正确答案
    const correctEl = await art.findElement(By.css('.question-fb-solution-detail .solution-detail-answer .correct-text'))
    const correct = await correctEl.getText()

    // 解析
    const analysisEl = await art.findElement(By.css('fb-ng-solution-detail-item[name=解析]'))
    const analysisNameEl = await analysisEl.findElement(By.css('h4'))
    const analysisName = await analysisNameEl.getText()
    const analysisDetailEls = await analysisEl.findElements(By.css('.solution-content > p'))
    const analysisDetails: string[] = []
    for (const d of analysisDetailEls) {
      analysisDetails.push(await this.getHTML(d))
    }

    // 考点
    const keypointEl = await art.findElement(By.css('fb-ng-solution-detail-item[name=考点]'))
    const kpNameEl = await keypointEl.findElement(By.css('h4'))
    const keypointName = await kpNameEl.getText()
    const kpValueEl = await keypointEl.findElement(By.css('.keypoint-list button'))
    const keypointValue = await kpValueEl.getText()

    // 来源
    const originEl = await art.findElement(By.css('fb-ng-solution-detail-item[name=来源]'))
    const originNameEl = await originEl.findElement(By.css('h4'))
    const originName = await originNameEl.getText()
    const originValueEl = await originEl.findElement(By.css('.solution-content'))
    const originValue = await originValueEl.getText()

    // 统计
    const statEl = await art.findElement(By.css('fb-ng-solution-detail-item[name=统计]'))
    const statNameEl = await statEl.findElement(By.css('h4'))
    const statName = await statNameEl.getText()
    const statItemEls = await statEl.findElements(By.css('fb-ng-solution-detail-meta .detail-meta p'))
    const statistics: Array<{ key: string; value: string }> = []
    for (const s of statItemEls) {
      const txt = await s.getText()
      if (!txt.includes('答题时间')) {
        const [key, value] = txt.split('\n')
        statistics.push({ key, value })
      }
    }

    const analysis: ExamAnalysis = {
      analysis: { name: analysisName, value: analysisDetails },
      keypoint: { name: keypointName, value: keypointValue },
      origin: { name: originName, value: originValue },
      statistic: { name: statName, value: statistics },
    }

    return { rank, type, materialTitle, materials, question, options, correct, analysis }
  }

  // ─── 智能组卷 ───

  async examinationAnswer(): Promise<ExamPaper> {
    const driver = this.getDriver()
    await this.sleep()

    await driver.get(this.paperUrl)
    await this.sleep()

    // 点击智能组卷
    await this.clickElement('//*[@id="calalog-page"]/main/div[1]/div[1]/fb-tiku-catalog/div/ul/li[3]/div')
    await this.sleep()
    await this.clickElement('/html/body/app-customize-smart-question/div/div/footer/button[2]')
    await this.findElement('//*[@id="app-practice"]/main/section')

    const pageUrl = await driver.getCurrentUrl()
    const key = pageUrl.split('/').reverse()[1] ?? ''

    // 提交试卷
    await this.sleep()
    await this.clickElement('//*[@id="app-practice"]/main/app-side-tool/div[1]/div[11]')
    await this.sleep()
    await this.clickElement('/html/body/fb-modal-dialog/div/div/div[2]/button[2]')
    await this.sleep(5000)

    const anwserUrl = await driver.getCurrentUrl()

    // 收起答题卡
    await this.clickElement('//*[@id="app-report-solution"]/main/aside/fb-collpase-bottom/div/div[1]/a')

    // 获取标题
    const headerEl = await this.findElement('//*[@id="app-report-solution"]/header/app-simple-nav-header/header/div/h4')
    const name = await headerEl.getText()

    // 清理干扰元素
    await this.deleteElement('fb-web-nav-header', 'id')
    await this.deleteElement('//*[@id="app-report-solution"]/header/app-simple-nav-header/header')

    // 逐题提取
    const section = await this.findElement('//*[@id="app-report-solution"]/main/section')
    const articleEls = await section.findElements(By.css('app-fb-solution'))
    const articles: ExamArticle[] = []

    for (let i = 0; i < articleEls.length; i++) {
      const article = await this.extractArticle(articleEls[i])
      articles.push(article)
      console.log(`第 ${i + 1} 道题提取完成!`)
    }

    return { key, name, pageUrl, anwserUrl, articles }
  }

  // ─── 专项练习（未完成） ───

  async moduleAnswer(): Promise<void> {
    const driver = this.getDriver()
    await this.sleep()
    await driver.get(this.paperUrl)
    await this.sleep()

    const section = await this.findElement('//*[@id="calalog-page"]/main/div[1]/div[2]/app-keypoint-catalog/div/div[2]/ul')
    const contents = await section.findElements(By.css('li .keypoint-tree-title'))
    console.log('contents', contents.length)

    for (const item of contents) {
      await driver.executeScript<void>('arguments[0].click()', item)
    }
    await this.sleep(200)
  }
}

export default ChalkCrawler
