<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { supplierOptions, appendAdminTask } from '@/data/mockData'

const router = useRouter()

const supplierForm = reactive({
  companyName: '',
  creditCode: '',
  registerAddress: '',
  productionAddress: '',
  establishDate: '',
  contactPhone: '',
  legalPerson: '',
  legalId: '',
  supplierType: '原材料类',
  productClass: 'A类',
})

const checklist = ref(supplierOptions.docChecklist.map((d) => ({ ...d, uploaded: false })))
const uploadedFiles = ref([])
const formErrors = ref([])
const appealReason = ref('')
const appealSubmitted = ref(false)

const reviewState = reactive({
  running: false,
  progress: 0,
  stageIndex: -1,
  status: '未开始',
  riskScore: '-',
  preScore: '-',
  failReasons: [],
  passTips: [],
  extracted: {},
})

const completenessRate = computed(() => {
  const total = checklist.value.length
  const done = checklist.value.filter((d) => d.uploaded).length
  return Math.round((done / total) * 100)
})
const auditThreshold = computed(() => (supplierForm.productClass === 'A类' ? 90 : supplierForm.productClass === 'B类' ? 85 : 80))
const nextReviewDate = computed(() => {
  const d = new Date(); d.setFullYear(d.getFullYear() + 5)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})
const currentStageText = computed(() => {
  if (reviewState.stageIndex < 0) return '未开始'
  if (reviewState.stageIndex >= supplierOptions.reviewStages.length) return '已完成'
  return supplierOptions.reviewStages[reviewState.stageIndex]
})

const statusClass = (status) => {
  if (status.includes('有条件通过')) return 'warn'
  if (status.includes('通过')) return 'ok'
  if (status.includes('未通过') || status.includes('异常')) return 'fail'
  if (status.includes('复核') || status.includes('待')) return 'warn'
  return 'pending'
}
const stageClass = (idx) => (idx < reviewState.stageIndex ? 'done' : idx === reviewState.stageIndex ? 'doing' : 'todo')

const validateForm = () => {
  const errors = []
  if (!/^[0-9A-Z]{18}$/.test(supplierForm.creditCode || '')) errors.push('统一社会信用代码应为18位大写字母/数字')
  if (!/^1\d{10}$/.test(supplierForm.contactPhone || '')) errors.push('联系人电话格式不正确')
  if (!/^(\d{17}[0-9Xx])$/.test(supplierForm.legalId || '')) errors.push('法人身份证号格式不正确')
  if (!supplierForm.companyName) errors.push('请填写企业名称')
  if (!supplierForm.establishDate) errors.push('请选择成立时间')
  formErrors.value = errors
  return errors.length === 0
}

const handleFiles = (event) => {
  const files = Array.from(event.target.files || [])
  uploadedFiles.value = files.map((f) => ({ name: f.name, sizeText: `${(f.size / 1024 / 1024).toFixed(2)} MB` }))
  const names = uploadedFiles.value.map((f) => f.name.toLowerCase())
  checklist.value = checklist.value.map((doc) => {
    let hit = false
    if (doc.key === 'license') hit = names.some((n) => n.includes('营业') || n.includes('license'))
    if (doc.key === 'quality') hit = names.some((n) => n.includes('质量') || n.includes('iso'))
    if (doc.key === 'industry') hit = names.some((n) => n.includes('认证') || n.includes('资质'))
    if (doc.key === 'finance') hit = names.some((n) => n.includes('财务') || n.includes('报表'))
    if (doc.key === 'equipment') hit = names.some((n) => n.includes('设备') || n.includes('保养'))
    if (doc.key === 'inspection') hit = names.some((n) => n.includes('检验') || n.includes('计量') || n.includes('cnas') || n.includes('cma'))
    if (doc.key === 'performance') hit = names.some((n) => n.includes('业绩') || n.includes('合同') || n.includes('凭证'))
    return { ...doc, uploaded: hit }
  })
}

const runAutoReview = async () => {
  if (!validateForm()) return
  appealSubmitted.value = false
  reviewState.running = true
  reviewState.status = '审核中'
  const steps = [12, 33, 59, 81, 100]
  for (let i = 0; i < steps.length; i += 1) {
    reviewState.stageIndex = i
    reviewState.progress = steps[i]
    await new Promise((r) => setTimeout(r, 380))
  }

  const missingFormCount = formErrors.value.length
  const missingDocs = checklist.value.filter((d) => !d.uploaded).map((d) => d.name)
  const baseScore = Math.round(completenessRate.value * 0.65 + 35)
  const penalty = Math.min(20, missingFormCount * 3 + missingDocs.length * 4)
  const score = Math.max(45, baseScore - penalty)

  reviewState.preScore = score
  reviewState.riskScore = `${100 - score}/100`
  reviewState.extracted = {
    companyName: supplierForm.companyName,
    creditCode: supplierForm.creditCode,
    legalPerson: supplierForm.legalPerson,
    consistency: `${Math.max(62, completenessRate.value)}%`,
    sameOriginRisk: missingDocs.length <= 1 ? '低' : '中',
  }

  reviewState.failReasons = []
  reviewState.passTips = []

  if (missingDocs.length >= 3 || score < auditThreshold.value - 8) {
    reviewState.status = '机审未通过'
    reviewState.failReasons = [
      `材料缺失：${missingDocs.slice(0, 3).join('、') || '关键字段不完整'}`,
      `预审得分 ${score} 低于模板阈值（${auditThreshold.value}）`,
      '请补齐资料后重新发起审核',
    ]
  } else if (missingDocs.length > 0 || score < auditThreshold.value) {
    reviewState.status = '有条件通过'
    reviewState.failReasons = [`待补充项：${missingDocs.join('、') || '部分字段需人工复核'}`, '需在限定时间内补齐材料并复核']
    reviewState.passTips = ['已完成智能预审核与同源筛查', '系统建议进入人工审核协同流程']
  } else {
    reviewState.status = '机审通过'
    reviewState.passTips = ['关键证照字段匹配通过', '评分满足模板阈值要求', '同源筛查未命中高风险主体']
  }

  appendAdminTask({
    id: Date.now(),
    companyName: supplierForm.companyName,
    type: `${supplierForm.supplierType} / ${supplierForm.productClass}`,
    status: reviewState.status,
    score,
    sourceData: {
      companyName: supplierForm.companyName,
      creditCode: supplierForm.creditCode,
      legalPerson: supplierForm.legalPerson,
      registerAddress: supplierForm.registerAddress,
      productionAddress: supplierForm.productionAddress,
    },
    systemData: {
      companyName: supplierForm.companyName,
      creditCode: supplierForm.creditCode,
      legalPerson: reviewState.status === '有条件通过' ? `${supplierForm.legalPerson}(待核)` : supplierForm.legalPerson,
      registerAddress: supplierForm.registerAddress,
      productionAddress: supplierForm.productionAddress,
    },
    reasons: [...reviewState.failReasons],
    tips: [...reviewState.passTips],
  })

  reviewState.running = false
}

const submitAppeal = () => {
  if (!appealReason.value.trim()) return
  appealSubmitted.value = true
}
</script>

<template>
  <div class="ambient-layer"></div>
  <main class="app-shell">
    <section class="page active">
      <header class="section-head">
        <div><span class="tag">供应商端</span><h2>资质填报与自动审核</h2></div>
        <div class="head-actions"><button class="btn-ghost" @click="router.push('/')">返回首页</button><button class="btn-primary" @click="router.push('/admin')">管理员视角</button></div>
      </header>
      <div class="stat-row supplier-stats">
        <div class="stat"><span>资料完整度</span><strong>{{ completenessRate }}%</strong></div>
        <div class="stat"><span>审核状态</span><strong :class="statusClass(reviewState.status)">{{ reviewState.status }}</strong></div>
        <div class="stat"><span>预审得分</span><strong>{{ reviewState.preScore }}</strong></div>
        <div class="stat"><span>模板阈值</span><strong>{{ auditThreshold }}</strong></div>
        <div class="stat"><span>风险评分</span><strong>{{ reviewState.riskScore }}</strong></div>
        <div class="stat"><span>下次复评提醒</span><strong>{{ nextReviewDate }}</strong></div>
      </div>
      <div class="two-col">
        <article class="card">
          <h3>供应商信息填报</h3>
          <div class="form-grid">
            <label>企业名称<input v-model.trim="supplierForm.companyName" type="text" /></label>
            <label>统一社会信用代码<input v-model.trim="supplierForm.creditCode" type="text" /></label>
            <label>供方类型<select v-model="supplierForm.supplierType"><option v-for="t in supplierOptions.supplierTypeOptions" :key="t" :value="t">{{ t }}</option></select></label>
            <label>产品等级<select v-model="supplierForm.productClass"><option v-for="c in supplierOptions.productClassOptions" :key="c" :value="c">{{ c }}</option></select></label>
            <label>注册地<input v-model.trim="supplierForm.registerAddress" type="text" /></label>
            <label>实际生产地<input v-model.trim="supplierForm.productionAddress" type="text" /></label>
            <label>成立时间<input v-model="supplierForm.establishDate" type="date" /></label>
            <label>联系人电话<input v-model.trim="supplierForm.contactPhone" type="text" /></label>
            <label>法人姓名<input v-model.trim="supplierForm.legalPerson" type="text" /></label>
            <label>法人身份证号<input v-model.trim="supplierForm.legalId" type="text" /></label>
          </div>
          <div class="validation-box" v-if="formErrors.length"><strong>信息校验提示：</strong><ul><li v-for="err in formErrors" :key="err">{{ err }}</li></ul></div>
        </article>
        <article class="card">
          <h3>资质文件上传（PDF / 图片）</h3>
          <div class="upload-zone"><input type="file" accept=".pdf,image/*" multiple @change="handleFiles" /><p>点击选择文件，支持 PDF、JPG、PNG</p></div>
          <ul class="file-list"><li v-if="!uploadedFiles.length">暂无上传文件</li><li v-for="f in uploadedFiles" :key="f.name">{{ f.name }} ({{ f.sizeText }})</li></ul>
          <h4 class="section-mini">材料清单覆盖率</h4>
          <div class="checklist"><div class="check-item" v-for="doc in checklist" :key="doc.key"><span>{{ doc.name }}</span><strong :class="doc.uploaded ? 'ok' : 'pending'">{{ doc.uploaded ? '已覆盖' : '未覆盖' }}</strong></div></div>
        </article>
      </div>
      <article class="card full-card">
        <h3>自动审核流程（悟空）</h3>
        <div class="progress-box"><div class="progress-head"><span>当前阶段：{{ currentStageText }}</span><strong>{{ reviewState.progress }}%</strong></div><div class="progress-bar"><i :style="{ width: reviewState.progress + '%' }"></i></div></div>
        <div class="stage-row"><div class="stage" v-for="(st, idx) in supplierOptions.reviewStages" :key="st" :class="stageClass(idx)"><div class="dot"></div><span>{{ st }}</span></div></div>
        <div class="result-grid">
          <div class="kv"><span>企业名称</span><strong>{{ reviewState.extracted.companyName || '-' }}</strong></div>
          <div class="kv"><span>信用代码</span><strong>{{ reviewState.extracted.creditCode || '-' }}</strong></div>
          <div class="kv"><span>法人姓名</span><strong>{{ reviewState.extracted.legalPerson || '-' }}</strong></div>
          <div class="kv"><span>证照一致性</span><strong>{{ reviewState.extracted.consistency || '-' }}</strong></div>
          <div class="kv"><span>同源风险</span><strong>{{ reviewState.extracted.sameOriginRisk || '-' }}</strong></div>
          <div class="kv"><span>审核结论</span><strong :class="statusClass(reviewState.status)">{{ reviewState.status }}</strong></div>
        </div>
        <div class="notice fail" v-if="reviewState.failReasons.length"><h4>审核未通过/待补充原因</h4><ul><li v-for="r in reviewState.failReasons" :key="r">{{ r }}</li></ul></div>
        <div class="notice pass" v-if="reviewState.passTips.length"><h4>通过提示</h4><ul><li v-for="t in reviewState.passTips" :key="t">{{ t }}</li></ul></div>
        <div class="appeal-box" v-if="reviewState.status !== '机审通过'"><h4>审核结果申诉</h4><textarea v-model.trim="appealReason" placeholder="请填写申诉理由与补充说明"></textarea><div class="review-actions left"><button class="btn-ghost" @click="submitAppeal">提交申诉</button><span v-if="appealSubmitted" class="ok">申诉已提交，等待复核</span></div></div>
        <div class="review-actions"><button class="btn-primary" :disabled="reviewState.running" @click="runAutoReview">{{ reviewState.running ? '审核中...' : '开始自动审核' }}</button></div>
      </article>
    </section>
  </main>
</template>
