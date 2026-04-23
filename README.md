# Supplier Qualification Frontend

供应商资质审核前端演示项目（纯前端交互 + 虚拟数据）。

## Tech Stack

- Vue 3
- Vue Router 4
- Vite 4

## Features

- 首页登录入口（供应商/管理员）
- 供应商端：
  - 基础信息填写
  - PDF/图片上传交互
  - 自动审核流程进度展示
  - 审核结论（通过/有条件通过/未通过）
  - 原因提示与申诉输入
- 管理员端：
  - 审核任务列表
  - 原始数据 vs 系统结果对比
  - 差异高亮
  - 评分维度、版本信息、复评监控展示

## Run

```bash
npm install
npm run dev
```

默认开发地址（Vite）：

- http://127.0.0.1:5173/
- 如果端口占用会自动切换

## Build

```bash
npm run build
```

## Project Structure

```text
src/
  data/          # 虚拟数据
  router/        # 路由
  styles/        # 全局样式
  views/         # 页面
public/assets/   # 静态资源
```

## Notes

- 本项目当前为纯前端演示，不依赖后端接口。
- 数据保存在浏览器 localStorage（管理员任务列表会持久化）。
