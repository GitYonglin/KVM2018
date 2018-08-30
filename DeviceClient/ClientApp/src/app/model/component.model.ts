import { Subset, Base } from './base';

export const componentMenusData = [
  {
    id: '1',
    name: 'T梁',
    icon: 'avatars:svg-1',
  },
  {
    id: '2',
    name: '箱梁',
    icon: 'avatars:svg-2',
  },
];
export const componentData = [
  {
    id: '1',
    sName: '构件名称',
    holes: [
      {
        sName: '3',
        sImage: '',
        sections: [1, 2, 3],
      }
    ]
  },
  {
    id: '2',
    sName: '构件名称',
    holes: [
      {
        sName: '4',
        sImage: '',
        sections: [1, 2, 3, 4],
      }
    ]
  },
];

export interface Component extends Base {
  sName: string;
  Holes: Array<Hole>;
}

export interface Hole extends Subset {
  holes: string[];
  imgUrl: string;
}
