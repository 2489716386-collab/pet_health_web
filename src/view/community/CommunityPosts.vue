<template>
  <div class="app-container">
    <el-card>
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="动态类型">
          <el-select v-model="queryParams.postType" placeholder="全部" clearable style="width: 120px">
            <el-option label="图文" :value="0" />
            <el-option label="视频" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待审核" :value="0" />
            <el-option label="已发布" :value="1" />
            <el-option label="违规拦截" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="发布时间">
          <el-date-picker
            v-model="timeRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
            clearable
            @change="handleTimeChange"
          />
        </el-form-item>
        <el-form-item label="动态内容">
          <el-input v-model="queryParams.content" placeholder="模糊搜索内容" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查 询</el-button>
          <el-button @click="resetQuery">重 置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="postId" label="动态ID" align="center" width="80" />
        <el-table-column prop="userId" label="发布人ID" align="center" width="100" />
        <el-table-column prop="content" label="动态内容" align="center" show-overflow-tooltip />
        <el-table-column prop="reportCount" label="被举报次数" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.reportCount >= 5 ? 'danger' : 'info'">{{ scope.row.reportCount || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-form-item label="审核状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待审核" value="PENDING" />
            <el-option label="已发布" value="APPROVED" />
            <el-option label="违规拦截" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-table-column prop="createTime" label="发布时间" align="center" width="170" />
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === 0"
              type="success" size="small"
              @click="handleAudit(scope.row.postId, 1)">放行</el-button>
            <el-button
              v-if="scope.row.status === 0"
              type="danger" size="small"
              @click="handleAudit(scope.row.postId, 2)">拦截</el-button>
            <span v-if="scope.row.status !== 0" style="color: #909399; font-size: 13px;">已处理</span>
          </template>
        </el-table-column>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/axios'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const timeRange = ref([])

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  postType: null,
  status: null, // 默认不传即查全部，如果想默认查待审核可改为 0
  startDate: '',
  endDate: '',
  content: ''
})

const fetchList = async () => {
  loading.value = true
  try {
    // 假设你的 Controller 前缀是 /community-posts
    const res = await request.get('/community-posts/admin/page', { params: queryParams })
    if (res.code === 200 || res.code === 1) {
      tableData.value = res.data.list || res.data.records || []
      total.value = res.data.total || 0
    }
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const handleTimeChange = (val) => {
  if (val && val.length === 2) {
    queryParams.startDate = val[0]
    queryParams.endDate = val[1]
  } else {
    queryParams.startDate = ''
    queryParams.endDate = ''
  }
}

const handleSearch = () => { queryParams.pageNum = 1; fetchList() }
const resetQuery = () => {
  Object.assign(queryParams, { postType: null, status: null, startDate: '', endDate: '', content: '' })
  timeRange.value = []
  handleSearch()
}
const handleSizeChange = (val) => { queryParams.pageSize = val; fetchList() }
const handleCurrentChange = (val) => { queryParams.pageNum = val; fetchList() }

const handleAudit = (postId, status) => {
  const actionText = status === 1 ? '放行(显示)' : '拦截(封禁)'
  const statusEnumStr = status === 1 ? 'APPROVED' : 'REJECTED'
  ElMessageBox.confirm(`确定要将该动态设为 ${actionText} 吗？`, '审核提示', { type: 'warning' }).then(async () => {
    const res = await request.post(`/community-posts/admin/audit?status=${statusEnumStr}`, [postId])
    if (res.code === 200 || res.code === 1) {
      ElMessage.success('审核成功')
      fetchList() // 刷新列表
    } else {
      ElMessage.error(res.msg || '审核失败')
    }
  }).catch(() => {})
}

onMounted(() => { fetchList() })
</script>

<style scoped>
.app-container { padding: 20px; }
.search-form { margin-bottom: 20px; }
.pagination-container { margin-top: 20px; text-align: right; }
</style>
