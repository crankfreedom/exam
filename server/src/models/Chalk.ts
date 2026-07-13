import { Builder, By, Key, until, Button, WebDriver } from 'selenium-webdriver';
import Save from '../utils/save.ts';

const account = { username: '15872332385', password: 'cxj7425313x' }

class Chalk {
  private driver: any
  private save = new Save()
  constructor() {
    this.driver = null;
    this.init();
  }
  // 睡眠函数
  async sleep(duration = 2000) {
    return new Promise((resolve, reject) => setTimeout(resolve, duration));
  }
  // 设置页面cookies
  async setCookies() {
    const that = this;
    function setCookie(cookie: any) {
      that.driver.executeScript((cookie: any) => {
        const { name, value, ...extraCookie } = cookie;
        const options = Object.entries(extraCookie).map(([k, v]) => `${k}=${v}`);
        const curCookie = `${name}=${value};${options.join(';')}`;
        document.cookie = curCookie;
      }, cookie);
    }
    const cookies = await this.driver.manage().getCookies();
    cookies.forEach((cookie: any) => setCookie(cookie));
  }
  // 查找某个元素并返回
  async findElement(xpath: string, type: string = 'xpath') {
    const locator = (By as any)[type](xpath);
    await this.driver.wait(until.elementLocated(locator), 50000);
    const element = await this.driver.findElement(locator);
    return element;
  }
  // 点击某个元素
  async clickElement(xpath: string) {
    const button = await this.findElement(xpath);
    await this.driver.executeScript('arguments[0].click()', button);
  }
  // 填写某个输入框
  async blinkElement(xpath: string, value: string) {
    const input = await this.findElement(xpath);
    input.sendKeys(value);
  }
  // 删除某个元素
  async deleteElement(xpath: string, type: string = 'xpath') {
    const element = await this.findElement(xpath, type);
    await this.driver.executeScript('arguments[0].style.display="none"', element);
    return;
  }
  async getImage(element: any, dir: string) {
    // 先将元素滚动到可视范围
    await this.driver.executeScript('arguments[0].scrollIntoView()', element);
    await this.sleep(400);
    // 再对图片进行截图
    const rect = await element.getRect();
    const { width, height } = rect;
    const base64 = await element.takeScreenshot();
    const name = this.save.saveImage({ base64, dir: `${dir}/image` });
    return { name, width, height };
  }
  async getHTML(element: any) {
    const innerHTML = await element.getAttribute('innerHTML');
    const images = innerHTML.match(/<img.*?src=.*?>/g);
    const htmlArr = innerHTML.replace(/<img.*?src=.*?>/g, '|[image]|').split('|');
    let index = 0;
    const htmlList = htmlArr.map((h: string) => {
      if (h === '[image]') {
        const img = images[index];
        let result;
        if (img) {
          result = img.replace(/src.*data-/, '');
          index++;
        }
        return result;
      }
      return h;
    });
    return htmlList.join('');
  }
  // 初始化
  async init() {
    this.driver = new Builder().forBrowser('chrome').build();
  }
  async login() {
    const url = 'https://www.fenbi.com/page/home';
    return new Promise(async (resolve, reject) => {
      try {
        // 打开登录页
        await this.driver.get(url);
        await this.driver.manage().window().maximize();
        // 点击登录按钮
        await this.clickElement('//*[@id="headercontent"]/div[2]/div/div');
        await this.sleep();
        // 点击账号密码登录
        await this.clickElement('//*[@id="fenbi-web-header"]/fb-header/div[2]/div/div[2]/div[5]/div/span');
        // 输入账号密码
        // 填写用户名
        await this.blinkElement('//*[@id="fenbi-web-header"]/fb-header/div[2]/div/div[2]/div[1]/input', account.username);
        // 填写密码
        await this.blinkElement('//*[@id="fenbi-web-header"]/fb-header/div[2]/div/div[2]/div[2]/input', account.password);
        // 勾选同意用户协议
        await this.clickElement('//*[@id="fenbi-web-header"]/fb-header/div[2]/div/div[2]/div[6]/div[1]');
        await this.sleep();
        // 点击登录
        await this.clickElement('//*[@id="fenbi-web-header"]/fb-header/div[2]/div/div[2]/div[4]/div/div');
        this.sleep();
        await this.setCookies();
        resolve(null);
      } catch (e) {
        reject();
      }
    });
  }
  // 提取某一道带答案的题目数据
  async getExamQeustion(art: any, _art_index: number) {
    // 题目序号
    const rankItem = await art.findElement(By.css('fb-ng-solution-choice article > .options-title'));
    const rank = await rankItem.getText();
    // 题目类型
    const typeItem = await art.findElement(By.css('fb-ng-solution-choice article .radio-ques-type'));
    const type = await typeItem.getText();
    // 题干内容
    const questionChildren = await art.findElements(By.css('fb-ng-solution-choice article .content .question-content p'));
    const question = [];
    for (let q_index = 0; q_index < questionChildren.length; q_index++) {
      const curQuestion = questionChildren[q_index];
      const item = await this.getHTML(curQuestion);
      question.push(item);
    }
    // 题目选项
    const questionOptions = await art.findElements(By.css('fb-ng-solution-choice ul > li'));
    let options = [];
    for (let o_index = 0; o_index < questionOptions.length; o_index++) {
      const curOption = questionOptions[o_index];
      const prexItem = await curOption.findElement(By.css('label > p'));
      const prex = await prexItem.getText();
      const curItem = await curOption.findElement(By.className('options-material'));
      const text = await this.getHTML(curItem);
      const item = { prex, text };
      options.push(item);
    }
    // 答案解析
    // 正确答案
    const correctItem = await art.findElement(By.css('.question-fb-solution-detail .solution-detail-answer .correct-text'));
    const correct = await correctItem.getText();
    // 解析
    const analysisItem = await art.findElement(By.css('fb-ng-solution-detail-item[name=解析]'));
    const analysisNameItem = await analysisItem.findElement(By.css('h4'));
    const analysisName = await analysisNameItem.getText();
    const analysisDetailsChildren = await analysisItem.findElements(By.css('.solution-content > p'));
    const analysisDetails = [];
    for (let d_index = 0; d_index < analysisDetailsChildren.length; d_index++) {
      const detailItem = analysisDetailsChildren[d_index];
      const text = await this.getHTML(detailItem);
      analysisDetails.push(text);
    }
    // 考点
    const keypointItem = await art.findElement(By.css('fb-ng-solution-detail-item[name=考点]'));
    const keypointNameItem = await keypointItem.findElement(By.css('h4'));
    const keypointName = await keypointNameItem.getText();
    const keypointValueItem = await keypointItem.findElement(By.css('.keypoint-list button'));
    const keypointValue = await keypointValueItem.getText();
    // 来源
    const originItem = await art.findElement(By.css('fb-ng-solution-detail-item[name=来源]'));
    const originNameItem = await originItem.findElement(By.css('h4'));
    const originName = await originNameItem.getText();
    const originValueItem = await originItem.findElement(By.css('.solution-content'));
    const originValue = await originValueItem.getText();
    // 统计
    const statisticItem = await art.findElement(By.css('fb-ng-solution-detail-item[name=统计]'));
    const statisticNameItem = await statisticItem.findElement(By.css('h4'));
    const statisticName = await statisticNameItem.getText();
    const statisticChildrenItem = await statisticItem.findElements(By.css('fb-ng-solution-detail-meta .detail-meta p'));
    const statistics = [];
    for (let s_index = 0; s_index < statisticChildrenItem.length; s_index++) {
      const staItem = await statisticChildrenItem[s_index].getText();
      if (staItem.indexOf('答题时间') === -1) {
        const staObj = staItem.split('\n');
        statistics.push({ key: staObj[0], value: staObj[1] });
      }
    }
    const analysis = {
      analysis: { name: analysisName, value: analysisDetails },
      keypoint: { name: keypointName, value: keypointValue },
      origin: { name: originName, value: originValue },
      statistic: { name: statisticName, value: statistics },
    };
    const article = { rank, type, question, options, correct, analysis };
    return article;
  }
  // 智能组题
  async examinationAnwser() {
    await this.sleep();
    // 到此当前页面也加载完成
    const url = 'https://www.fenbi.com/spa/tiku/guide/catalog/xingce?prefix=xingce';
    await this.driver.get(url);
    await this.sleep();
    // 点击智能组卷
    await this.clickElement('//*[@id="calalog-page"]/main/div[1]/div[1]/fb-tiku-catalog/div/ul/li[3]/div');
    // 点击不限年份确认
    await this.sleep();
    await this.clickElement('/html/body/app-customize-smart-question/div/div/footer/button[2]');
    await this.findElement('//*[@id="app-practice"]/main/section');
    // 提取当前页面url
    const pageUrl = await this.driver.getCurrentUrl();
    const key = pageUrl.split('/').reverse()[1];
    // 提交试卷
    await this.sleep();
    await this.clickElement('//*[@id="app-practice"]/main/app-side-tool/div[1]/div[11]');
    // 确认提交
    await this.sleep();
    await this.clickElement('/html/body/fb-modal-dialog/div/div/div[2]/button[2]');
    // 等待 切换到答案版本
    await this.sleep(5000);
    // 提取当前附带答案页面url
    const anwserUrl = await this.driver.getCurrentUrl();
    // 点击收起答题卡
    await this.clickElement('//*[@id="app-report-solution"]/main/aside/fb-collpase-bottom/div/div[1]/a');
    // 获取页面标题
    const articleHeader = await this.findElement('//*[@id="app-report-solution"]/header/app-simple-nav-header/header/div/h4');
    const name = await articleHeader.getText();
    // 获取到页面标题后，删除标题
    await this.deleteElement('fb-web-nav-header', 'id');
    await this.deleteElement('//*[@id="app-report-solution"]/header/app-simple-nav-header/header');
    // 获取题目列表
    const section = await this.findElement('//*[@id="app-report-solution"]/main/section');
    const articleChidren = await section.findElements(By.css('app-fb-solution'));
    const articles = [];
    for (let index = 0; index < articleChidren.length; index++) {
      const art = articleChidren[index];
      // 题目材料(可能不存在)
      let materialTitle = '';
      try {
        const materialTitleItem = await art.findElement(By.css('fb-ng-question-material .fb-question-material .material-nav > h4'));
        materialTitle = await materialTitleItem.getText();
      } catch (e) { }
      let materialChildren = []
      try {
        materialChildren = await art.findElements(By.css('fb-ng-question-material .fb-question-material .material-content > p'));
      } catch (e) { }
      const materials = [];
      for (let m_index = 0; m_index < materialChildren.length; m_index++) {
        const material = materialChildren[m_index];
        const item = await this.getHTML(material);
        materials.push(item);
      }
      // 题目序号
      const rankItem = await art.findElement(By.css('fb-ng-solution-choice article > .options-title'));
      const rank = await rankItem.getText();
      // 题目类型
      const typeItem = await art.findElement(By.css('fb-ng-solution-choice article .radio-ques-type'));
      const type = await typeItem.getText();
      // 题干内容
      const questionChildren = await art.findElements(By.css('fb-ng-solution-choice article .content .question-content > p'));
      const question = [];
      for (let q_index = 0; q_index < questionChildren.length; q_index++) {
        const curQuestion = questionChildren[q_index];
        const item = await this.getHTML(curQuestion);
        question.push(item);
      }
      // 题目选项
      const questionOptions = await art.findElements(By.css('fb-ng-solution-choice ul > li'));
      let options = [];
      for (let o_index = 0; o_index < questionOptions.length; o_index++) {
        const curOption = questionOptions[o_index];
        const prexItem = await curOption.findElement(By.css('label > p'));
        const prex = await prexItem.getText();
        const curItem = await curOption.findElement(By.className('options-material'));
        const text = await this.getHTML(curItem);
        const item = { prex, text };
        options.push(item);
      }
      // 答案解析
      // 正确答案
      const correctItem = await art.findElement(By.css('.question-fb-solution-detail .solution-detail-answer .correct-text'));
      const correct = await correctItem.getText();
      // 解析
      const analysisItem = await art.findElement(By.css('fb-ng-solution-detail-item[name=解析]'));
      const analysisNameItem = await analysisItem.findElement(By.css('h4'));
      const analysisName = await analysisNameItem.getText();
      const analysisDetailsChildren = await analysisItem.findElements(By.css('.solution-content > p'));
      const analysisDetails = [];
      for (let d_index = 0; d_index < analysisDetailsChildren.length; d_index++) {
        const detailItem = analysisDetailsChildren[d_index];
        const text = await this.getHTML(detailItem);
        analysisDetails.push(text);
      }
      // 考点
      const keypointItem = await art.findElement(By.css('fb-ng-solution-detail-item[name=考点]'));
      const keypointNameItem = await keypointItem.findElement(By.css('h4'));
      const keypointName = await keypointNameItem.getText();
      const keypointValueItem = await keypointItem.findElement(By.css('.keypoint-list button'));
      const keypointValue = await keypointValueItem.getText();
      // 来源
      const originItem = await art.findElement(By.css('fb-ng-solution-detail-item[name=来源]'));
      const originNameItem = await originItem.findElement(By.css('h4'));
      const originName = await originNameItem.getText();
      const originValueItem = await originItem.findElement(By.css('.solution-content'));
      const originValue = await originValueItem.getText();
      // 统计
      const statisticItem = await art.findElement(By.css('fb-ng-solution-detail-item[name=统计]'));
      const statisticNameItem = await statisticItem.findElement(By.css('h4'));
      const statisticName = await statisticNameItem.getText();
      const statisticChildrenItem = await statisticItem.findElements(By.css('fb-ng-solution-detail-meta .detail-meta p'));
      const statistics = [];
      for (let s_index = 0; s_index < statisticChildrenItem.length; s_index++) {
        const staItem = await statisticChildrenItem[s_index].getText();
        if (staItem.indexOf('答题时间') === -1) {
          const staObj = staItem.split('\n');
          statistics.push({ key: staObj[0], value: staObj[1] });
        }
      }
      const analysis = {
        analysis: { name: analysisName, value: analysisDetails },
        keypoint: { name: keypointName, value: keypointValue },
        origin: { name: originName, value: originValue },
        statistic: { name: statisticName, value: statistics },
      };
      articles.push({ rank, type, materialTitle, materials, question, options, correct, analysis });
      console.log(`第 ${index} 道题提取完成!`);
    }
    const exam = { key, name, pageUrl, anwserUrl, articles };
    return exam;
  }
  // 专项练习
  async moduleAnwser() {
    await this.sleep();
    // 到此当前页面也加载完成
    const url = 'https://www.fenbi.com/spa/tiku/guide/catalog/xingce?prefix=xingce';
    await this.driver.get(url);
    await this.sleep();
    const section = await this.findElement('//*[@id="calalog-page"]/main/div[1]/div[2]/app-keypoint-catalog/div/div[2]/ul');
    const contents = await section.findElements(By.css('li .keypoint-tree-title'));
    console.log('contents', contents.length);
    // 展开所有的一级菜单
    for (let c_index = 0; c_index < contents.length; c_index++) {
      const c_item = contents[c_index];
      await this.driver.executeScript('arguments[0].click()', c_item);
    }
    await this.sleep(200);
    // 展开所有的二级菜单
  }
  // 退出浏览器
  async quit() {
    await this.driver.close();
  }
}

// async function main() {
//   // 实例化
//   const instance = new Chalk();
//   const save = new Save();
//   // 登录
//   console.log('# 登录开始 #');
//   await instance.login();
//   console.log('# 登录完成 #');
//   await instance.moduleAnwser();
//   // 关闭浏览器
//   // await instance.quit();
//   console.log('# 已关闭浏览器 #');
// }

// main()

export default Chalk
