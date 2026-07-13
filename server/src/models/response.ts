
interface SuccessRes {
    message: string,
    data: any
}

interface FailRes {
    code: string
    message: string,
}

export function successRes({ message, data }: SuccessRes) {
    return { code: '000000', message: message, data }
}

export function failRes({ code, message }: FailRes) {
    return { code, message, data: null }
}

export async function ResWrapper(callback: Function, res: any, req: any) {
    try {
        return await callback(req, req)
    } catch (error: any) {
        console.log('error', error.message)
        return failRes({ code: '000001', message: '服务宕机了!' })
    }
}