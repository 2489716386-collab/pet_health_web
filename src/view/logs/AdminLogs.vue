<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="管理员ID">
          <el-input v-model="queryParams.adminId" placeholder="请输入管理员ID" clearable />
        </el-form-item>
        <el-form-item label="操作内容">
          <el-input v-model="queryParams.action" placeholder="输入关键词 (如:解封)" clearable />
        </el-form-item>

        <el-form-item label="操作时间">
          <el-date-picker
            v-model="timeRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD HH:mm:ss"
            @change="handleTimeChange"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查 询</el-button>
          <el-button @click="resetQuery">重 置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        :data="tableData"
        border
        stripe
        v-loading="loading"
        style="width: 100%"
      >
        <el-table-column prop="logId" label="日志ID" align="center" width="100" />
        <el-table-column prop="adminId" label="管理员ID" align="center" width="120">
          <template #default="scope">
            <el-tag size="small">{{ scope.row.adminId }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="action" label="操作内容" align="center" show-overflow-tooltip />
        <el-table-column prop="ipAddress" label="IP地址" align="center" width="150" />
        <el-table-column prop="createTime" label="操作时间" align="center" width="180" />
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 30, 50]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/axios' // 确保你的 axios 路径正确

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const timeRange = ref([]) // 用于绑定 el-date-picker 的数组

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  adminId: '',
  action: '',
  beginTime: '',
  endTime: ''
})

// 获取日志列表
const fetchList = async () => {
  loading.value = true
  try {
    // 注意：请确保后端的 Controller 路径是 /admin-logs/page
    const res = await request.get('/admin-logs/page', { params: queryParams })
    if (res.code === 200 || res.code === 1) { // 根据你后端的 Result 统一格式判断
      // 适配你的 PageInfo DTO
      tableData.value = res.data.list || res.data.records || []
      total.value = res.data.total || 0
    } else {
      ElMessage.error(res.msg || '获取日志失败')
    }
  } catch (error) {
    console.error('获取日志列表报错:', error)
  } finally {
    loading.value = false
  }
}

// 处理时间选择器变化
const handleTimeChange = (val) => {
  if (val && val.length === 2) {
    queryParams.beginTime = val[0]
    queryParams.endTime = val[1]
  } else {
    queryParams.beginTime = ''
    queryParams.endTime = ''
  }
}

// 搜索与重置
const handleSearch = () => {
  queryParams.pageNum = 1
  fetchList()
}

const resetQuery = () => {
  queryParams.adminId = ''
  queryParams.action = ''
  queryParams.beginTime = ''
  queryParams.endTime = ''
  timeRange.value = []
  handleSearch()
}

// 分页条数变化
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  fetchList()
}

// 分页页码变化
const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  fetchList()
}

// 页面挂载时初始化数据
onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}
.search-form {
  margin-bottom: 20px;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
