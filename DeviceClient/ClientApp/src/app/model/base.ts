/**
 * Id
 *
 * @param {string} id 数据Id
 * @interface Base
 */
export interface Base {
  id?: string;
}

export interface Subset extends Base {
  sName?: string;
  parentId?: string;
}

export interface MenuData {
  id?: string;
  name?: string;
  state?: number;
}
export interface TaskMenu extends MenuData {
  count?: number;
}
