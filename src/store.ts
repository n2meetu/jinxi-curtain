export interface StoreInfo {
  id: string;
  name: string;
  address: string;
  description?: string;
  contact?: {
    phone: string;
    shopUrl?: string;
  };
  showroom?: {
    available: boolean;
    tip: string;
  };
  xiaohongshu?: {
    account: string;
    url: string;
  };
}

const SHOP_URL = 'https://xhslink.com/m/2jw5yGAtpaV?xhsshare=CopyLink&appuid=5905dd8b5e87e724d3e30e3d&apptime=1776675668&share_id=e1d31e2656a04b0dbf89afc23fe5af0e';

export const STORES: StoreInfo[] = [
  {
    id: 'xiaoshan',
    name: '今喜窗帘萧山店',
    address: '宁围街道天得路352号',
    description: '♥️窗帘源头工厂/专注窗帘软装定制\n♥️主打中古风 奶油风 法式风 美式风 轻奢风 复古风 意式极简 现代简约\n♥️可免费上门测量&选料&设计&安装&售后 一站式服务\n♥️导航：今喜窗帘',
    contact: { phone: '18358571588', shopUrl: SHOP_URL },
    showroom: { available: true, tip: '欢迎到店参观样板间，实地感受各种风格效果，可提前联系店主预约。' },
    xiaohongshu: { account: 'J今喜窗帘萧山店', url: 'https://www.xiaohongshu.com/user/profile/5da9d9d60000000001002ffa' }
  },
  {
    id: 'yuhang',
    name: '今喜窗帘余杭店',
    address: '绿汀路1号财通大厦101号',
    description: '可免费上门测量 选料 设计 搭配 安装 售后 窗帘源头工厂窗帘店，款式多 价格实惠，没有中间商赚差价，性价比更高！',
    contact: { phone: '19518502195', shopUrl: SHOP_URL },
    showroom: { available: true, tip: '欢迎到店参观样板间，实地感受各种风格效果，可提前联系店主预约。' },
    xiaohongshu: { account: '今喜窗帘余杭店', url: 'https://www.xiaohongshu.com/user/profile/62360d4e000000001000a026' }
  }
];

export function getStoreById(id: string): StoreInfo | undefined {
  return STORES.find(s => s.id === id);
}

export function listStores(): StoreInfo[] {
  return STORES;
}

export const SERVICED_COMMUNITIES: string[] = [
  '桂冠东方',
  '悦云邸云蔚轩',
  '观翠揽月轩',
  '潮遇宁新里',
  '和兴云合印',
  '花屿观澜里'
];
