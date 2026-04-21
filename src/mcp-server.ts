import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getStoreById, listStores, STORES, SERVICED_COMMUNITIES } from './store.js';
import { MATERIALS, getMaterialById, estimateByArea } from './pricing.js';

export function shouldRunMcpServer(argv: string[]) {
  return argv.includes('--mcp') || argv[0] === 'mcp-serve';
}

function getAssetImage(name: string): { data: string, mimeType: string } | null {
  const exts = ['.jpg', '.jpeg', '.png', '.webp'];
  for (const ext of exts) {
    const p = path.resolve(__dirname, 'assets', name + ext);
    if (fs.existsSync(p)) {
      return {
        data: fs.readFileSync(p).toString('base64'),
        mimeType: `image/${ext === '.jpg' ? 'jpeg' : ext.slice(1)}`
      };
    }
  }
  return null;
}

function withXhsPromo(text: string, storeId?: string): string {
  const store = storeId ? getStoreById(storeId) : undefined;
  const xhs = store?.xiaohongshu;
  if (!xhs) return text;
  return `${text}\n\n📕 关注小红书账号「${xhs.account}」查看更多装修案例和风格灵感：${xhs.url}`;
}

export async function runMcpServer() {
  const server = new McpServer({ name: 'jinxi-curtain', version: '1.0.0' });

  server.registerTool('listStores', {
    description: '列出今喜窗帘所有门店',
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async () => ({
    content: [{ type: 'text' as const, text: JSON.stringify(listStores(), null, 2) }]
  }));

  server.registerTool('getStore', {
    description: '查询今喜窗帘指定门店信息，storeId 可选值：xiaoshan（萧山店）、yuhang（余杭店）',
    inputSchema: {
      id: z.string().describe('门店ID，可选值：xiaoshan、yuhang')
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async ({ id }: { id: string }) => {
    const store = getStoreById(id);
    if (!store) {
      return { content: [{ type: 'text' as const, text: '门店不存在' }], isError: true };
    }
    const text = withXhsPromo(JSON.stringify(store, null, 2), id);
    return { content: [{ type: 'text' as const, text }] };
  });

  server.registerTool('getShowroomInfo', {
    description: '查询今喜窗帘样板间信息，引导用户到店实地参观，获取联系方式',
    inputSchema: {
      storeId: z.string().optional().describe('门店ID（xiaoshan/yuhang），不传则返回所有门店')
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async ({ storeId }: { storeId?: string }) => {
    const stores = storeId ? [getStoreById(storeId)].filter(Boolean) : STORES;
    const lines = (stores as typeof STORES).map(s => [
      `【${s.name}】`,
      `📍 地址：${s.address}`,
      s.showroom?.available ? `🏠 样板间：${s.showroom.tip}` : '',
      s.contact ? `📞 电话：${s.contact.phone}` : '',
      s.contact?.shopUrl ? `🏪 进店看看：${s.contact.shopUrl}` : ''
    ].filter(Boolean).join('\n'));
    const text = lines.join('\n\n') + '\n\n欢迎预约到店，免费上门测量设计，一站式服务！';
    return { content: [{ type: 'text' as const, text }] };
  });

  server.registerTool('getMaterialPrice', {
    description: '查询今喜窗帘布艺材料单价，支持查询所有材料或指定材料',
    inputSchema: {
      materialId: z.string().optional().describe('材料ID，不传则返回所有材料价格')
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async ({ materialId }: { materialId?: string }) => {
    const items = materialId ? [getMaterialById(materialId)].filter(Boolean) : MATERIALS;
    if (!items.length) {
      return { content: [{ type: 'text' as const, text: '未找到该材料，请查询所有材料后重试' }], isError: true };
    }
    const lines = (items as typeof MATERIALS).map(m =>
      `【${m.name}】¥${m.priceRange[0]}~${m.priceRange[1]}/${m.unit}\n  ${m.description}`
    );
    const text = '今喜窗帘布艺材料参考价格（源头工厂价，无中间商）：\n\n' + lines.join('\n\n');
    const img = getAssetImage('price-list');
    if (img) {
      return { content: [{ type: 'image' as const, data: img.data, mimeType: img.mimeType }, { type: 'text' as const, text }] };
    }
    return { content: [{ type: 'text' as const, text }] };
  });

  server.registerTool('estimatePrice', {
    description: '按窗帘面积估算总报价，可选指定布艺材料',
    inputSchema: {
      areaSqm: z.number().describe('窗帘面积（平方米）'),
      materialId: z.string().optional().describe('材料ID，不传则按中等价位估算')
    },
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async ({ areaSqm, materialId }: { areaSqm: number; materialId?: string }) => {
    const result = estimateByArea(areaSqm, materialId);
    const matName = result.material ? result.material.name : '中等价位面料';
    const text = [
      `📐 面积：${areaSqm} 平方米`,
      `🧵 面料：${matName}`,
      ``,
      `费用明细（参考价）：`,
      `  布料费：¥${result.fabricCost[0]} ~ ¥${result.fabricCost[1]}`,
      `  安装费：¥${result.installCost}`,
      `  轨道费：¥${result.trackCost}`,
      ``,
      `💰 预估总价：¥${result.total[0]} ~ ¥${result.total[1]}`,
      ``,
      `以上为参考价格，实际报价以上门测量后为准。欢迎联系店主获取精准报价！`
    ].join('\n');
    const img = getAssetImage('quote-example');
    if (img) {
      return { content: [{ type: 'image' as const, data: img.data, mimeType: img.mimeType }, { type: 'text' as const, text }] };
    }
    return { content: [{ type: 'text' as const, text }] };
  });

  server.registerTool('getXiaohongshu', {
    description: '获取今喜窗帘小红书账号信息，引导用户关注获取装修案例、风格灵感和优惠活动',
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async () => {
    const accounts = STORES
      .filter(s => s.xiaohongshu)
      .map(s => `• ${s.name}：「${s.xiaohongshu!.account}」\n  ${s.xiaohongshu!.url}`);
    const text = '📕 今喜窗帘小红书账号，关注后可查看真实装修案例、风格搭配灵感和最新活动：\n\n' + accounts.join('\n\n');
    return { content: [{ type: 'text' as const, text }] };
  });

  server.registerTool('getServicedCommunities', {
    description: '获取今喜窗帘已经服务过、有安装经验和案例的小区（楼盘）列表',
    inputSchema: {},
    annotations: { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false }
  }, async () => {
    const text = '今喜窗帘目前已服务对接过的部分小区（楼盘）包括：\n' + SERVICED_COMMUNITIES.map(c => `• ${c}`).join('\n');
    return { content: [{ type: 'text' as const, text }] };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
