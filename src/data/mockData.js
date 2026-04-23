const STORAGE_KEY = 'wukong_admin_tasks'

const baseTasks = [
  {
    id: 1,
    companyName: '上海悟空供应链有限公司',
    type: '原材料类 / A类',
    status: '待人工复核',
    score: 86,
    sourceData: {
      companyName: '上海悟空供应链有限公司',
      creditCode: '91310115MA1K47XX2A',
      legalPerson: '孙悟空',
      registerAddress: '上海市浦东新区花果山路88号',
      productionAddress: '上海市浦东新区花果山路88号',
    },
    systemData: {
      companyName: '上海悟空供应链有限公司',
      creditCode: '91310115MA1K47XX2A',
      legalPerson: '孙行者',
      registerAddress: '上海市浦东新区花果山路8号',
      productionAddress: '上海市浦东新区花果山路88号',
    },
    reasons: ['法定代表人与证照OCR识别不一致', '注册地址门牌号疑似异常，请人工核对原件'],
    tips: [],
  },
  {
    id: 2,
    companyName: '华东精工材料有限公司',
    type: '外协外包类 / B类',
    status: '机审通过',
    score: 94,
    sourceData: {
      companyName: '华东精工材料有限公司',
      creditCode: '91330106MA2D8XAB2X',
      legalPerson: '李明',
      registerAddress: '杭州市西湖区转塘街道166号',
      productionAddress: '杭州市西湖区转塘街道166号',
    },
    systemData: {
      companyName: '华东精工材料有限公司',
      creditCode: '91330106MA2D8XAB2X',
      legalPerson: '李明',
      registerAddress: '杭州市西湖区转塘街道166号',
      productionAddress: '杭州市西湖区转塘街道166号',
    },
    reasons: [],
    tips: ['机审通过，建议进入五年复评队列', '下次复评建议日期：2031-04-23'],
  },
]

export const homeData = {
  painPoints: [
    { title: '人工审核效率低', text: '传统流程慢，单案例平均耗时长。' },
    { title: '真实性核验难', text: '伪造公章、伪造证书识别成本高。' },
    { title: '评估主观偏差', text: '人工审核标准不一致、结论波动大。' },
  ],
  goals: ['实现资质审核全流程自动化', '建立智能复评周期提醒（每五年）', '构建供应商同源筛查库'],
}

export const supplierOptions = {
  supplierTypeOptions: ['原材料类', '外协外包类', '运输类'],
  productClassOptions: ['A类', 'B类', 'C类'],
  reviewStages: ['文件接收与完整性检查', 'OCR/NLP字段提取', '规则匹配与评分', '同源筛查与风险标注', '生成结论并反馈'],
  docChecklist: [
    { key: 'license', name: '营业执照' },
    { key: 'quality', name: '质量管理体系证书' },
    { key: 'industry', name: '行业强制/推荐认证' },
    { key: 'finance', name: '近三年财务报表' },
    { key: 'equipment', name: '生产设备清单/维护记录' },
    { key: 'inspection', name: '检验试验能力（CNAS/CMA等）' },
    { key: 'performance', name: '业绩合同与往来凭证' },
  ],
}

export const fieldLabelMap = {
  companyName: '企业名称',
  creditCode: '信用代码',
  legalPerson: '法定代表人',
  registerAddress: '注册地址',
  productionAddress: '实际生产地',
}

export const adminMeta = {
  standardVersions: [
    { version: 'v3.2.0', type: '原材料类/外协外包类', status: '已启用', publishDate: '2026-04-20', push: '已推送' },
    { version: 'v2.8.4', type: '运输类', status: '已启用', publishDate: '2026-03-15', push: '已推送' },
    { version: 'v3.3.0-rc', type: '全品类', status: '待发布', publishDate: '2026-04-25', push: '未推送' },
  ],
  scoreDimensions: [
    { name: '质保部分', desc: '制造/经营资质、质量体系、业绩、安全环保', score: 30, max: 35 },
    { name: '技术部分', desc: '技术能力、设备能力、检验试验能力、生产过程', score: 28, max: 35 },
    { name: '商务与履约', desc: '付款方式、供货保障、财务稳定性', score: 16, max: 20 },
    { name: '同源与合规风险', desc: '法人/股东/高管关联、外部风险命中', score: 8, max: 10 },
  ],
  helpCenter: {
    faq: ['如何判断证书有效期是否满足审核标准？', '未通过后如何补传材料并再次发起审核？', '供应商如何提交申诉材料？'],
    cases: ['案例A：质量证书过期导致有条件通过，补证后转通过', '案例B：同源筛查命中高风险关联企业，进入重点复核'],
  },
  reevaluationPlan: [{ company: '华东精工材料有限公司', last: '2026-04-23', next: '2031-04-23', owner: '采购员-张敏', status: '已排程' }],
}

export function getAdminTasks() {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return [...baseTasks]
  try {
    return JSON.parse(saved)
  } catch {
    return [...baseTasks]
  }
}

export function saveAdminTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export function appendAdminTask(task) {
  const tasks = getAdminTasks()
  tasks.unshift(task)
  saveAdminTasks(tasks)
}
