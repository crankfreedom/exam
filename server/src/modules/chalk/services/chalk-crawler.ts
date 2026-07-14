import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { spawn, type ChildProcess } from 'node:child_process'

interface CreateSmartPaperParams {
  num: number
}

interface TaskMessage {
  code: string
}

/**
 * 通过子进程执行采集任务，进程隔离避免阻塞主服务。
 * 采集数量通过子进程参数传入。
 *
 * 使用 vite-node 运行子进程（与主服务一致），
 * 确保 @/ 路径别名和 ESM + TS 均可正常解析。
 */
export async function createSmartPaper({ num }: CreateSmartPaperParams): Promise<void> {
  const taskPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../tasks/create-smart-paper.ts',
  )

  const viteNodeBin = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../../node_modules/vite-node/dist/cli.mjs',
  )

  return new Promise<void>((resolve, reject) => {
    const child: ChildProcess = spawn(
      process.execPath,
      [viteNodeBin, '--script', taskPath, String(num)],
      { stdio: ['inherit', 'inherit', 'inherit', 'ipc'] },
    )

    let settled = false
    const done = (fn: () => void) => {
      if (!settled) {
        settled = true
        fn()
      }
    }

    child.on('message', (msg: TaskMessage) => {
      if (msg.code === '000000') done(() => resolve())
    })

    child.on('error', (err: Error) => {
      console.error('[Chalk] 子进程异常:', err.message)
      done(() => reject(err))
    })

    child.on('exit', (code: number | null) => {
      if (code === 0) {
        done(() => resolve())
      } else {
        done(() => reject(new Error(`子进程退出，退出码 ${code}`)))
      }
    })
  })
}
