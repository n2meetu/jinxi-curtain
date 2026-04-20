export interface StoreInfo {
  id: string;
  name: string;
  address: string;
  description?: string;
}

export const STORES: StoreInfo[] = [
  {
    id: 'xiaoshan',
    name: '今喜窗帘萧山店',
    address: '宁围街道天得路352号',
    description: '♥️窗帘源头工厂/专注窗帘软装定制\n♥️主打中古风 奶油风 法式风 美式风 轻奢风 复古风 意式极简 现代简约\n♥️可免费上门测量&选料&设计&安装&售后 一站式服务\n♥️导航：今喜窗帘'
  },
  {
    id: 'yuhang',
    name: '今喜窗帘余杭店',
    address: '绿汀路1号财通大厦101号',
    description: '可免费上门测量 选料 设计 搭配 安装 售后 窗帘源头工厂窗帘店，款式多 价格实惠，没有中间商赚差价，性价比更高！'
  }
];

export function getStoreById(id: string): StoreInfo | undefined {
  return STORES.find(s => s.id === id);
}

export function listStores(): StoreInfo[] {
  return STORES;
}
