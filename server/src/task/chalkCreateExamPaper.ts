import path from 'node:path'
import Chalk from '../models/Chalk.ts'
import Save from '../utils/save.ts'

async function main() {
  // 实例化
  const instance = new Chalk();
  const save = new Save();
  // 登录
  console.log('# 登录开始 #');
  await instance.login();
  console.log('# 登录完成 #');
  return
  // 智能组卷
  const num = parseInt(process.env.num || '1');
  if (typeof num !== 'number') return
  console.log('# 智能组卷开始 #');
  const time = [];
  let start,
    end,
    total = Date.now();
  for (let index = 0; index < num; index++) {
    start = Date.now();
    const rank = index + 1;
    console.log(`# 第 ${rank} 套 - 智能组卷开始 #`);
    let article;
    try {
      article = await instance.examinationAnwser();
      // 将试卷写入本地
      console.log('# 开始保存 #');
      save.saveArticle({ dir: path.resolve(__dirname, './examination/JS'), name: `/${article.key}.js`, item: article });
    } catch (e) {
      console.log('error', e);
      break
    }
    console.log('# 智能组卷完成 #');
    console.log(`# 第 ${rank} 套 - 智能组卷完成 #`);
    end = Date.now();
    const wasteTime = { index: `第 ${rank} / ${num} 套`, time: `共消耗${Math.floor((end - start) / 1000)}秒` };
    console.log(`${wasteTime.index}, ${wasteTime.time}`);
    time.push(wasteTime);
  }
  // 关闭浏览器
  await instance.quit();
  console.log('# 已关闭浏览器 #');
  const wasteTime = { index: `共 ${num} 套`, time: `共消耗 ${Math.floor((Date.now() - total) / 1000)} 秒`, avg: `平均 ${Math.floor((Date.now() - total) / (1000 * num))} 秒/套` };
  console.log(`${wasteTime.index}, ${wasteTime.time}, ${wasteTime.avg}`);
  time.push(wasteTime);
  time.forEach(t => console.log(`${t.index}, ${t.time}, ${t.avg}`));
  const msg = JSON.stringify({ code: '000000' });
  process.send(msg);
}

main();
