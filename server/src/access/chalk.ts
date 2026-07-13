import path from "node:path";
import { fork } from "node:child_process";


export async function createExamination({ num }: any) {
    // 调用方法，执行文件，生成一套智能组题
    console.log('开始执行文件!');
    return new Promise((resolve, reject) => {
        // 执行线程，生成套题
        const examination = fork('../task/chalkCreateExamPaper.ts' /* 这里传入node参数即可 */, {
            execArgv: ["-r", "ts-node/register"],
            cwd: path.resolve(__dirname) /* 指定子进程的工作目录 */,
            env: { num },
        });

        // 监听事件
        examination.on('message', (msg: string) => {
            const { code } = JSON.parse(msg);
            if (code === '000000') {
                // 完成
                resolve(null);
            }
        });
        examination.on('error', (msg: string) => {
            console.log('error事件', msg);
            reject();
        });
        examination.on('close', (msg: string) => {
            console.log('close事件', msg);
            reject();
        });
        examination.on('disconnect', (msg: string) => {
            console.log('disconnect事件', msg);
            reject();
        });
        examination.on('exit', (msg: string) => {
            console.log('exit事件', msg);
            reject();
        });
    });
}