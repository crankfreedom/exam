import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fork, type ChildProcess } from 'node:child_process'

interface CreateExaminationParams {
  num: number
}

interface TaskMessage {
  code: string
}

/**
 * 通过子进程执行采集任务，进程隔离避免阻塞主服务。
 * 采集数量通过子进程参数传入。
 */
export async function createExamination({ num }: CreateExaminationParams): Promise<void> {
  const taskPath = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../tasks/create-exam-paper.ts',
  )

  return new Promise<void>((resolve, reject) => {
    const child: ChildProcess = fork(taskPath, [String(num)], {
      execArgv: ['-r', 'ts-node/register'],
    })

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
      if (code !== 0) {
        done(() => reject(new Error(`子进程退出，退出码 ${code}`)))
      }
    })
  })
}
