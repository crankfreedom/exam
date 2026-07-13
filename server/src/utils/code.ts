/** 业务状态码 - 参见 docs/api/ErrorCode.md */
export const CODE = {
  /** 请求成功 */
  SUCCESS: '000000',
  /** 服务器内部错误 */
  INTERNAL_ERROR: '000001',
  /** 请求超时 */
  TIMEOUT: '000002',
  /** 请求频率过高 */
  RATE_LIMIT: '000003',
  /** 参数格式错误 */
  PARAM_INVALID: '000004',
} as const

export type Code = (typeof CODE)[keyof typeof CODE]
