<template>
  <div class="dashboard-container">
    <el-card class="welcome-card" shadow="never">
      <div class="welcome-header">
        <el-avatar :size="60" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
        <div class="welcome-text">
          <h2 class="greeting">{{ greeting }}，{{ username }}！</h2>
          <p class="subtitle">欢迎回到宠物健康社区后台管理系统，今天又是充满活力的一天！</p>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="data-cards">
      <el-col :span="6">
        <el-card shadow="hover" class="data-card user-bg">
          <div class="data-title">今日新增用户</div>
          <div class="data-value">{{ stats.dailyUsers }} <span class="unit">人</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card user-bg">
          <div class="data-title">本月新增用户</div>
          <div class="data-value">{{ stats.monthlyUsers }} <span class="unit">人</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card post-bg">
          <div class="data-title">今日新增动态</div>
          <div class="data-value">{{ stats.dailyPosts }} <span class="unit">条</span></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover" class="data-card post-bg">
          <div class="data-title">本月新增动态</div>
          <div class="data-value">{{ stats.monthlyPosts }} <span class="unit">条</span></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" class="main-content">
      <el-col :span="16">
        <el-card shadow="never" class="chart-card">
          <template #header>
            <div class="card-header">
              <span>📊 用户与动态增长趋势 (近7天模拟数据)</span>
            </div>
          </template>
          <div ref="chartRef" style="height: 320px;"></div>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="never" class="notice-card">
          <template #header>
            <div class="card-header">
              <span>🔔 最新系统通知</span>
            </div>
          </template>
          <div v-loading="noticeLoading" class="notice-list">
            <div v-for="item in noticeList" :key="item.noticeId" class="notice-item">
              <el-tag size="small" :type="item.noticeType === 1 || item.noticeType === 'SYSTEM_MAINTENANCE' ? 'info' : 'danger'">
                {{ item.noticeType === 1 || item.noticeType === 'SYSTEM_MAINTENANCE' ? '维护' : '违规' }}
              </el-tag>
              <span class="notice-title" :title="item.title">{{ item.title }}</span>
              <span class="notice-date">{{ item.createTime ? item.createTime.substring(5, 10) : '' }}</span>
            </div>
            <el-empty v-if="noticeList.length === 0" description="暂无通知" :image-size="60" />
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import request from '@/axios'

// 1. 获取当前登录用户名 (依赖于你登录时 localStorage.setItem('username', '...') 的保存逻辑)
const username = ref(localStorage.getItem('username') || 'admin')

// 2. 根据时间计算智能问候语
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour >= 6 && hour < 11) return '早上好'
  if (hour >= 11 && hour < 14) return '中午好'
  if (hour >= 14 && hour < 18) return '下午好'
  return '晚上好'
})

// 3. 核心统计数据 (模拟数据，后期需要后端提供一个统一看板接口对接)
const stats = ref({
  dailyUsers: 15,
  monthlyUsers: 188,
  dailyPosts: 45,
  monthlyPosts: 512
})

// 4. ECharts 图表渲染逻辑
const chartRef = ref(null)
let myChart = null

const initChart = () => {
  if (chartRef.value) {
    myChart = echarts.init(chartRef.value)
    const option = {
      tooltip: { trigger: 'axis' },
      legend: { data: ['新增用户', '新增动态'], right: 20 },
      grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['03-20', '03-21', '03-22', '03-23', '03-24', '03-25', '03-26'] // 模拟日期
      },
      yAxis: { type: 'value' },
      series: [
        {
          name: '新增用户',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          itemStyle: { color: '#4facfe' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(79, 172, 254, 0.4)' },
              { offset: 1, color: 'rgba(79, 172, 254, 0.0)' }
            ])
          },
          data: [5, 12, 8, 15, 22, 18, 15] // 模拟数据
        },
        {
          name: '新增动态',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          itemStyle: { color: '#764ba2' },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(118, 75, 162, 0.4)' },
              { offset: 1, color: 'rgba(118, 75, 162, 0.0)' }
            ])
          },
          data: [30, 45, 38, 55, 62, 70, 45] // 模拟数据
        }
      ]
    }
    myChart.setOption(option)
  }
}

// 5. 获取最新通知
const noticeList = ref([])
const noticeLoading = ref(false)

const fetchNotifications = async () => {
  noticeLoading.value = true
  try {
    // 调用后台已有的系统通知分页查询接口，只取前 5 条
    const res = await request.get('/notifications/admin/page', { params: { pageNum: 1, pageSize: 5 } })
    if (res.code === 200 || res.code === 1) {
      noticeList.value = res.data.list || res.data.records || []
    }
  } catch (error) {
    console.error('获取首页通知失败:', error)
  } finally {
    noticeLoading.value = false
  }
}

onMounted(() => {
  initChart()
  fetchNotifications()
  // 监听窗口大小变化，让图表自适应
  window.addEventListener('resize', () => myChart && myChart.resize())
})

onUnmounted(() => {
  window.removeEventListener('resize', () => myChart && myChart.resize())
  // 销毁实例，防止内存泄漏
  if (myChart) myChart.dispose()
})
</script>

<style scoped>
.dashboard-container { padding: 20px; background-color: #f5f7fa; min-height: 100%; box-sizing: border-box; }
.welcome-card { margin-bottom: 20px; border-radius: 8px; border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.welcome-header { display: flex; align-items: center; gap: 20px; }
.welcome-text h2 { margin: 0 0 8px 0; color: #303133; font-size: 20px; font-weight: 600; }
.welcome-text .subtitle { margin: 0; color: #909399; font-size: 14px; }

.data-cards { margin-bottom: 20px; }
.data-card { border-radius: 8px; color: #fff; text-align: center; border: none; transition: transform 0.3s; }
.data-card:hover { transform: translateY(-5px); }
.user-bg { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
.post-bg { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.data-title { font-size: 13px; opacity: 0.9; margin-bottom: 8px; letter-spacing: 0.5px; }
.data-value { font-size: 36px; font-weight: bold; line-height: 1; margin-bottom: 5px; }
.unit { font-size: 14px; font-weight: normal; opacity: 0.8; margin-left: 2px; }

.main-content { margin-bottom: 20px; }
.card-header { font-weight: bold; color: #303133; font-size: 15px; display: flex; align-items: center; }
.chart-card, .notice-card { border-radius: 8px; border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.05); height: 100%; }

.notice-list { min-height: 320px; }
.notice-item { display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid #ebeef5; gap: 10px; }
.notice-item:last-child { border-bottom: none; }
.notice-title { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #606266; font-size: 14px;}
.notice-title:hover { color: #409EFF; cursor: default; }
.notice-date { color: #909399; font-size: 13px; width: 45px; text-align: right; }
</style>
