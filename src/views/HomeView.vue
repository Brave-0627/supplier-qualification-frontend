<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { homeData } from '@/data/mockData'

const router = useRouter()
const form = reactive({ username: '', password: '', role: 'supplier' })

const handleLogin = () => {
  if (form.role === 'admin') router.push('/admin')
  else router.push('/supplier')
}
</script>

<template>
  <div class="ambient-layer"></div>
  <main class="app-shell">
    <section class="page active">
      <div class="home-grid">
        <article class="panel intro-panel">
          <div class="badge">悟空 · 智能审核平台</div>
          <h1>供应商资质自动核验助手</h1>
          <p>纯前端交互演示页面，全部采用虚拟数据，不依赖后端接口。</p>
          <div class="feature-list">
            <div class="feature-item" v-for="point in homeData.painPoints" :key="point.title">
              <h3>{{ point.title }}</h3>
              <p>{{ point.text }}</p>
            </div>
          </div>
          <div class="goal-wrap">
            <h3>建设目标</h3>
            <ul class="goal-list">
              <li v-for="goal in homeData.goals" :key="goal">{{ goal }}</li>
            </ul>
          </div>
          <div class="hero-image-wrap">
            <img src="/assets/wukong-hero.svg" alt="悟空系统视觉图" />
          </div>
        </article>

        <aside class="panel login-panel">
          <h2>系统登录</h2>
          <p class="subtext">登录后进入二级页面：供应商用户 / 管理员用户。</p>
          <form class="login-form" @submit.prevent="handleLogin">
            <label>用户名<input v-model.trim="form.username" type="text" required /></label>
            <label>密码<input v-model="form.password" type="password" required /></label>
            <label>
              用户类型
              <select v-model="form.role" required>
                <option value="supplier">供应商用户</option>
                <option value="admin">管理员用户</option>
              </select>
            </label>
            <button type="submit" class="btn-primary">登录并进入系统</button>
          </form>
        </aside>
      </div>
    </section>
  </main>
</template>
