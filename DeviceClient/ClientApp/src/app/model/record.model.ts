/**
 *
 *
 * @export
 * @class 张拉记录
 */
/** 张拉记录 */
export interface Record {
  id: string;
  /** 梁Id */
  parentId: string;
  /** 操作员Id */
  operatorId: string;
  /** 以张拉阶段 */
  stage: number;
  /** 张拉状态 0:未张拉  1:张拉完成  2:二次张拉  3:张拉中断  4:二次张拉第一次中断 */
  state: number;
  /** 保压事件 */
  time: Array<number>;
  /** ?? */
  mode: number;
  /** 压力 */
  mpa?: RecordMode;
  /** 位移 */
  mm?: RecordMode;
  /** 曲线 */
  cvsData?: CvsData;
  /** 回油 */
  returnStart?: ReturnStart;
}
/**
 *
 *
 * @export
 * @class 曲线
 */
export interface CvsData {
  time: Array<number>;
  mpa: RecordMode;
  mm: RecordMode;
  mark: Mark;
}
export class Mark {
  index: Array<number>;
  doc: Array<string>;
}
/**
 *
 *
 * @export 对应顶数据
 * @class 回缩值初张拉
 */
export interface RecordMode {
  a1?: Array<number>;
  a2?: Array<number>;
  b1?: Array<number>;
  b2?: Array<number>;
}
/**
 *
 *
 * @export
 * @class ReturnStart
 */
export interface ReturnStart {
  a1?: ReturnStartItem;
  a2?: ReturnStartItem;
  b1?: ReturnStartItem;
  b2?: ReturnStartItem;
}
/**
 *
 *
 * @export
 * @class ReturnStartItem
 */
export interface ReturnStartItem {
  mpa: number;
  mm: number;
}
