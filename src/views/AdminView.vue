<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { adminMeta, fieldLabelMap, getAdminTasks } from '@/data/mockData'

const router = useRouter()
const tasks = ref(getAdminTasks())
const selectedTaskId = ref(tasks.value[0]?.id)

const selectedTask = computed(() => tasks.value.find((t) => t.id === selectedTaskId.value))

const statusClass = (status) => {
  if (status.includes('有条件通过')) return 'warn'
  if (status.includes('通过')) return 'ok'
  if (status.includes('未通过') || status.includes('异常')) return 'fail'
  if (status.includes('复核') || status.includes('待')) return 'warn'
  return 'pending'
}

const adminStats = computed(() => ({
  pending: tasks.value.filter((t) => t.status === '待审核').length,
  passed: tasks.value.filter((t) => t.status === '机审通过').length,
  conditional: tasks.value.filter((t) => t.status === '有条件通过').length,
  rejected: tasks.value.filter((t) => t.status === '机审未通过').length,
  manual: tasks.value.filter((t) => t.status === '待人工复核').length,
}))
</script>

<template>
  <div class="ambient-layer"></div>
  <main class="app-shell">
    <section class="page active">
      <header class="section-head">
        <div><span class="tag">管理员端</span><h2>审核标准与人工复核中心</h2></div>
        <div class="head-actions"><button class="btn-ghost" @click="router.push('/')">返回首页</button><button class="btn-ghost" @click="router.push('/supplier')">供应商视角</button></div>
      </header>

      <article class="card">
        <h3>任务概览</h3>
        <div class="stat-row">
          <div class="stat"><span>待审核</span><strong>{{ adminStats.pending }}</strong></div>
          <div class="stat"><span>机审通过</span><strong>{{ adminStats.passed }}</strong></div>
          <div class="stat"><span>有条件通过</span><strong>{{ adminStats.conditional }}</strong></div>
          <div class="stat"><span>机审未通过</span><strong>{{ adminStats.rejected }}</strong></div>
          <div class="stat"><span>待人工复核</span><strong>{{ adminStats.manual }}</strong></div>
        </div>
      </article>

      <div class="two-col admin-columns">
        <article class="card">
          <h3>审核队列</h3>
          <div class="task-list">
            <button class="task-item" v-for="task in tasks" :key="task.id" @click="selectedTaskId = task.id" :class="{ active: selectedTaskId === task.id }">
              <div><strong>{{ task.companyName }}</strong><small>{{ task.type }} | 评分 {{ task.score }}</small></div>
              <span :class="statusClass(task.status)">{{ task.status }}</span>
            </button>
          </div>
        </article>

        <article class="card">
          <h3>审核标准版本管理</h3>
          <div class="version-list">
            <div class="version-item" v-for="v in adminMeta.standardVersions" :key="v.version">
              <div><strong>{{ v.version }}</strong><small>{{ v.type }} | 发布 {{ v.publishDate }}</small></div>
              <div class="version-meta"><span :class="v.status === '已启用' ? 'ok' : 'warn'">{{ v.status }}</span><span>{{ v.push }}</span></div>
            </div>
          </div>
        </article>
      </div>

      <div class="two-col admin-columns" v-if="selectedTask">
        <article class="card compare">
          <h3>人工校验对比（上：上传内容，下：系统结果）</h3>
          <div class="compare-panel top-panel"><div class="panel-title">上传内容（原始）</div><div class="compare-grid"><div class="kv" v-for="(value, key) in selectedTask.sourceData" :key="`src-${key}`"><span>{{ fieldLabelMap[key] }}</span><strong>{{ value }}</strong></div></div></div>
          <div class="compare-panel bottom-panel"><div class="panel-title">系统结构化结果</div><div class="compare-grid"><div class="kv" v-for="(value, key) in selectedTask.systemData" :key="`sys-${key}`" :class="{ diff: selectedTask.sourceData[key] !== value }"><span>{{ fieldLabelMap[key] }}</span><strong>{{ value }}</strong></div></div></div>
          <div class="notice fail" v-if="selectedTask.reasons.length"><h4>异常原因</h4><ul><li v-for="r in selectedTask.reasons" :key="r">{{ r }}</li></ul></div>
          <div class="notice pass" v-if="selectedTask.tips.length"><h4>通过建议</h4><ul><li v-for="t in selectedTask.tips" :key="t">{{ t }}</li></ul></div>
        </article>

        <article class="card">
          <h3>知识库与帮助中心</h3>
          <div class="help-box"><h4>FAQ</h4><ul><li v-for="f in adminMeta.helpCenter.faq" :key="f">{{ f }}</li></ul><h4>案例库</h4><ul><li v-for="c in adminMeta.helpCenter.cases" :key="c">{{ c }}</li></ul></div>
        </article>
      </div>

      <article class="card full-card">
        <h3>审核维度评分（文档细化）</h3>
        <div class="score-grid"><div class="score-item" v-for="item in adminMeta.scoreDimensions" :key="item.name"><div><strong>{{ item.name }}</strong><small>{{ item.desc }}</small></div><div class="score-val">{{ item.score }}/{{ item.max }}</div></div></div>
      </article>

      <article class="card full-card">
        <h3>复评监控（每五年）</h3>
        <div class="reeval-list"><div class="reeval-item" v-for="item in adminMeta.reevaluationPlan" :key="item.company"><div><strong>{{ item.company }}</strong><small>负责人：{{ item.owner }}</small></div><div><span>上次：{{ item.last }}</span><span>下次：{{ item.next }}</span></div><strong :class="item.status === '已排程' ? 'ok' : 'warn'">{{ item.status }}</strong></div></div>
      </article>
    </section>
  </main>
</template>
