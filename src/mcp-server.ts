import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { getStoreById, listStores } from './store.js';

export function shouldRunMcpServer(argv: string[]) {
  return argv.includes('--mcp') || argv[0] === 'mcp-serve';
}

export async function runMcpServer() {
  const server = new McpServer({ name: 'jinxi-curtain', version: '1.0.0' });

  server.registerTool('listStores', {
    description: '列出今喜窗帘所有门店',
    inputSchema: {}
  }, async () => ({
    content: [{ type: 'text' as const, text: JSON.stringify(listStores(), null, 2) }]
  }));

  server.registerTool('getStore', {
    description: '查询今喜窗帘指定门店信息，storeId 可选值：xiaoshan（萧山店）、yuhang（余杭店）',
    inputSchema: {
      id: { type: 'string' as const, description: '门店ID，可选值：xiaoshan、yuhang' }
    }
  }, async ({ id }: { id: string }) => {
    const store = getStoreById(id);
    if (!store) {
      return { content: [{ type: 'text' as const, text: '门店不存在' }], isError: true };
    }
    return { content: [{ type: 'text' as const, text: JSON.stringify(store, null, 2) }] };
  });

  const transport = new StdioServerTransport();
  await server.connect(transport);
}
