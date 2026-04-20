export interface MaterialPrice {
  id: string;
  name: string;
  unit: string;
  priceRange: [number, number]; // [min, max] 元/单位
  description: string;
}

export const MATERIALS: MaterialPrice[] = [
  { id: 'linen', name: '亚麻布', unit: '米', priceRange: [80, 150], description: '自然质感，透气性好，适合奶油风、中古风' },
  { id: 'velvet', name: '丝绒', unit: '米', priceRange: [120, 280], description: '质感高级，遮光性强，适合轻奢风、法式风' },
  { id: 'cotton', name: '棉麻混纺', unit: '米', priceRange: [60, 120], description: '性价比高，耐用易打理，适合现代简约' },
  { id: 'sheer', name: '纱帘', unit: '米', priceRange: [30, 80], description: '轻薄透光，常与主帘搭配使用' },
  { id: 'blackout', name: '遮光布', unit: '米', priceRange: [50, 130], description: '遮光率95%以上，适合卧室' },
  { id: 'italian', name: '意式极简面料', unit: '米', priceRange: [200, 500], description: '进口面料，质感极佳，适合意式极简风格' }
];

// 安装费用（元/平方米）
export const INSTALL_PRICE_PER_SQM = 15;
// 轨道/窗帘杆（元/米）
export const TRACK_PRICE_PER_METER = 25;

export function getMaterialById(id: string): MaterialPrice | undefined {
  return MATERIALS.find(m => m.id === id);
}

export function estimateByArea(areaSqm: number, materialId?: string): {
  material: MaterialPrice | null;
  fabricCost: [number, number];
  installCost: number;
  trackCost: number;
  total: [number, number];
} {
  // 窗帘用料约为面积的2倍（褶皱系数）
  const fabricMeters = areaSqm * 2;
  const material = materialId ? (getMaterialById(materialId) ?? null) : null;
  const trackMeters = Math.sqrt(areaSqm); // 粗略估算窗宽

  const fabricCost: [number, number] = material
    ? [material.priceRange[0] * fabricMeters, material.priceRange[1] * fabricMeters]
    : [MATERIALS[2].priceRange[0] * fabricMeters, MATERIALS[1].priceRange[1] * fabricMeters];

  const installCost = Math.round(areaSqm * INSTALL_PRICE_PER_SQM);
  const trackCost = Math.round(trackMeters * TRACK_PRICE_PER_METER);

  return {
    material,
    fabricCost: [Math.round(fabricCost[0]), Math.round(fabricCost[1])],
    installCost,
    trackCost,
    total: [
      Math.round(fabricCost[0]) + installCost + trackCost,
      Math.round(fabricCost[1]) + installCost + trackCost
    ]
  };
}
