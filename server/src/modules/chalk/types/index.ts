import type { WebDriver, WebElement } from 'selenium-webdriver'

/** 题目选项 */
export interface ExamOption {
  prex: string
  text: string
}

/** 解析详情（多条段落） */
export interface ExamAnalysisDetail {
  name: string
  value: string[]
}

/** 考点 */
export interface ExamKeypoint {
  name: string
  value: string
}

/** 来源 */
export interface ExamOrigin {
  name: string
  value: string
}

/** 单条统计项 */
export interface ExamStatistic {
  key: string
  value: string
}

/** 统计分组 */
export interface ExamStatisticGroup {
  name: string
  value: ExamStatistic[]
}

/** 答案解析聚合 */
export interface ExamAnalysis {
  analysis: ExamAnalysisDetail
  keypoint: ExamKeypoint
  origin: ExamOrigin
  statistic: ExamStatisticGroup
}

/** 单道题目完整数据 */
export interface ExamArticle {
  rank: string
  type: string
  materialTitle: string
  materials: string[]
  question: string[]
  options: ExamOption[]
  correct: string
  analysis: ExamAnalysis
}

/** 整套试卷采集结果 */
export interface ExamPaper {
  key: string
  name: string
  pageUrl: string
  anwserUrl: string
  articles: ExamArticle[]
}

export type ChalkDriver = WebDriver
export type ChalkElement = WebElement
