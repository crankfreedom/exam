import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ChalkCrawler from '../models/chalk'
import Save from '@/utils/save'
import { chalkConfig } from '@/config/chalk'
import type { ExamPaper } from '../types'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

async function main(): Promise<void> {
  const crawler = new ChalkCrawler()
  const save = new Save()

  console.log('# 登录开始 #')
  await crawler.init()
  await crawler.login()
  console.log('# 登录完成 #')

  const num = parseInt(process.argv[2] ?? '1', 10)
  if (!Number.isInteger(num) || num < 1) return

  console.log('# 智能组卷开始 #')
  const startTime = Date.now()

  for (let i = 0; i < num; i++) {
    const rank = i + 1
    console.log(`# 第 ${rank} / ${num} 套 - 智能组卷开始 #`)
    try {
      const paper: ExamPaper = await crawler.examinationAnswer()
      console.log('# 开始保存 #')
      save.saveArticle({
        item: paper,
        dir: path.resolve(__dirname, chalkConfig.outputDir, 'JS'),
        name: `/${paper.key}.js`,
      })
    } catch (e) {
      console.error('error', e)
      break
    }
    console.log(`# 第 ${rank} 套 - 智能组卷完成 #`)
  }

  await crawler.quit()
  console.log('# 已关闭浏览器 #')

  const totalSec = Math.floor((Date.now() - startTime) / 1000)
  console.log(`# 共 ${num} 套，消耗 ${totalSec} 秒，平均 ${Math.floor(totalSec / num)} 秒/套 #`)

  const msg = JSON.stringify({ code: '000000' })
  if (process.send) {
    process.send(msg)
  }
}

main().catch((e) => {
  console.error('[Chalk Task] 致命错误:', e)
  process.exit(1)
})
