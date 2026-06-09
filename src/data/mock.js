// 模拟数据：小区、户型、装修风格

export const decorationStyles = [
  {
    id: 'bare',
    name: '毛坯房',
    description: '原始水泥墙面，未装修状态',
    colors: { floor: 0x999999, wall: 0xbbbbbb, ceiling: 0xcccccc, accent: 0x888888 },
    wallTexture: 'cement'
  },
  {
    id: 'modern',
    name: '现代简约',
    description: '灰色+白色为主，简洁大方',
    colors: { floor: 0x666666, wall: 0xeeeeee, ceiling: 0xffffff, accent: 0x333333 },
    wallTexture: 'smooth'
  },
  {
    id: 'nordic',
    name: '北欧风格',
    description: '米色+浅木色，温馨舒适',
    colors: { floor: 0xd4b483, wall: 0xf5f0e8, ceiling: 0xffffff, accent: 0xc49a6c },
    wallTexture: 'wood'
  },
  {
    id: 'chinese',
    name: '新中式',
    description: '深木色+红木点缀，典雅大气',
    colors: { floor: 0x8b6914, wall: 0xfaf0e6, ceiling: 0xfff8f0, accent: 0x8b4513 },
    wallTexture: 'chinese'
  },
  {
    id: 'light',
    name: '日式原木',
    description: '浅原木色，自然清爽',
    colors: { floor: 0xe8d5b7, wall: 0xfffaf0, ceiling: 0xffffff, accent: 0xc19a6b },
    wallTexture: 'light-wood'
  }
];

export const floorPlans = [
  {
    id: 'fp1',
    name: 'A户型 · 两室一厅',
    area: '89㎡',
    rooms: '2室2厅1卫',
    description: '南北通透，户型方正，动静分区',
    direction: '南北朝向',
    layout: {
      width: 12, depth: 10, height: 3,
      rooms: [
        { name: '客厅', x: 0, z: 0, w: 6, d: 5 },
        { name: '主卧', x: 6, z: 0, w: 5, d: 4 },
        { name: '次卧', x: 0, z: 5, w: 4, d: 5 },
        { name: '厨房', x: 6, z: 4, w: 5, d: 3 }
      ]
    }
  },
  {
    id: 'fp2',
    name: 'B户型 · 三室两厅',
    area: '125㎡',
    rooms: '3室2厅2卫',
    description: '大面宽短进深，三开间朝南',
    direction: '南向',
    layout: {
      width: 15, depth: 12, height: 3,
      rooms: [
        { name: '客厅', x: 0, z: 0, w: 7, d: 5 },
        { name: '主卧', x: 7, z: 0, w: 5, d: 4 },
        { name: '次卧1', x: 0, z: 5, w: 5, d: 5 },
        { name: '次卧2', x: 7, z: 4, w: 5, d: 4 },
        { name: '厨房', x: 5, z: 5, w: 5, d: 5 }
      ]
    }
  },
  {
    id: 'fp3',
    name: 'C户型 · 一室一厅',
    area: '55㎡',
    rooms: '1室1厅1卫',
    description: '精致小户型，功能齐全',
    direction: '南向',
    layout: {
      width: 8, depth: 8, height: 2.8,
      rooms: [
        { name: '客餐厅', x: 0, z: 0, w: 5, d: 5 },
        { name: '卧室', x: 5, z: 0, w: 3, d: 4 },
        { name: '厨房', x: 0, z: 5, w: 3, d: 3 },
        { name: '卫生间', x: 3, z: 5, w: 5, d: 3 }
      ]
    }
  }
];

// 小区数据：使用高德地图真实坐标（经纬度）
// 坐标来源：高德地图 API 对真实小区/楼盘的地理编码
export const communities = [
  {
    id: 'c1',
    name: '阳光花园',
    position: { lat: 39.9042, lng: 116.4074 },
    avgPrice: '58000元/㎡',
    address: '朝阳区建国路88号',
    description: '大型社区，绿化率高，配套完善',
    floorPlanIds: ['fp1', 'fp2']
  },
  {
    id: 'c2',
    name: '翡翠城',
    position: { lat: 39.9842, lng: 116.3133 },
    avgPrice: '72000元/㎡',
    address: '海淀区中关村大街1号',
    description: '高端住宅，近地铁，学区房',
    floorPlanIds: ['fp2', 'fp3']
  },
  {
    id: 'c3',
    name: '温馨家园',
    position: { lat: 39.8542, lng: 116.3542 },
    avgPrice: '42000元/㎡',
    address: '丰台区南三环西路16号',
    description: '刚需首选，性价比高，交通便利',
    floorPlanIds: ['fp1', 'fp3']
  },
  {
    id: 'c4',
    name: '龙湖冠樾',
    position: { lat: 40.0842, lng: 116.3042 },
    avgPrice: '65000元/㎡',
    address: '昌平区回龙观东大街',
    description: '品质社区，人车分流，园林优美',
    floorPlanIds: ['fp1', 'fp2']
  }
];
