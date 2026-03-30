<template>
  <div class="app-container">
    <el-card>
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="审核状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待审核" value="PENDING" />
            <el-option label="已发布" value="APPROVED" />
            <el-option label="违规拦截" value="REJECTED" />
          </el-select>
        </el-form-item>
        <el-form-item label="评论时间">
          <el-date-picker
            v-model="timeRange"
            type="daterange"
            range-separator="至"
            value-format="YYYY-MM-DD"
            clearable
            @change="handleTimeChange"
          />
        </el-form-item>
        <el-form-item label="评论内容">
          <el-input v-model="queryParams.content" placeholder="模糊搜索评论" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查 询</el-button>
          <el-button @click="resetQuery">重 置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="commentId" label="评论ID" align="center" width="80" />
        <el-table-column prop="postId" label="所属动态ID" align="center" width="100" />
        <el-table-column prop="userId" label="评论人ID" align="center" width="100" />
        <el-table-column prop="content" label="评论内容" align="center" show-overflow-tooltip />
        <el-table-column prop="reportCount" label="被举报次数" align="center" width="100">
          <template #default="scope">
            <el-tag
              :type="scope.row.reportCount >= 5 ? 'danger' : 'info'"
              :style="{ cursor: scope.row.reportCount > 0 ? 'pointer' : 'default' }"
              @click="handleViewReports(scope.row.commentId, scope.row.reportCount)"
              title="点击查看举报详情"
            >
              {{ scope.row.reportCount || 0 }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">待审核</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="success">已发布</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="danger">违规拦截</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="评论时间" align="center" width="170" />
        <el-table-column label="操作" align="center" width="180" fixed="right">
          <template #default="scope">
            <el-button v-if="scope.row.status === 0" type="success" size="small" @click="handleAudit(scope.row.commentId, 1)">放行</el-button>
            <el-button v-if="scope.row.status === 0" type="danger" size="small" @click="handleAudit(scope.row.commentId, 2)">拦截</el-button>
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

    <el-drawer v-model="drawerVisible" :title="drawerTitle" direction="rtl" size="40%" class="report-drawer">
      <el-table :data="reportList" border stripe v-loading="reportLoading" size="small">
        <el-table-column prop="reporterId" label="举报人ID" align="center" width="100" />
        <el-table-column prop="reason" label="举报理由" show-overflow-tooltip />
        <el-table-column prop="createTime" label="举报时间" align="center" width="170" />
      </el-table>
    </el-drawer>
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
  pageNum: 1, pageSize: 20, status: null, startDate: '', endDate: '', content: ''
})

// 抽屉变量
const drawerVisible = ref(false)
const drawerTitle = ref('')
const reportLoading = ref(false)
const reportList = ref([])

const fetchList = async () => {
  loading.value = true
  try {
    // 【修复】恢复为你原本正确的请求路径
    const res = await request.get('/comments/admin/page', { params: queryParams })
    if (res.code === 200 || res.code === 1) {
      tableData.value = res.data.list || res.data.records || []
      total.value = res.data.total || 0
    }
  } finally { loading.value = false }
}

const handleTimeChange = (val) => {
  if (val && val.length === 2) { queryParams.startDate = val[0]; queryParams.endDate = val[1] } else { queryParams.startDate = ''; queryParams.endDate = '' }
}

const handleSearch = () => { queryParams.pageNum = 1; fetchList() }
const resetQuery = () => {
  Object.assign(queryParams, { status: null, startDate: '', endDate: '', content: '' })
  timeRange.value = []; handleSearch()
}
const handleSizeChange = (val) => { queryParams.pageSize = val; fetchList() }
const handleCurrentChange = (val) => { queryParams.pageNum = val; fetchList() }

// 【修复】恢复为你原本正确的审核逻辑
const handleAudit = (commentId, status) => {
  const actionText = status === 1 ? '放行(显示)' : '拦截(封禁)'
  const statusEnumStr = status === 1 ? 'APPROVED' : 'REJECTED'
  ElMessageBox.confirm(`确定要将该评论设为 ${actionText} 吗？`, '审核提示', { type: 'warning' }).then(async () => {
    const res = await request.post(`/comments/admin/audit?status=${statusEnumStr}`, [commentId])
    if (res.code === 200 || res.code === 1) {
      ElMessage.success('审核成功')
      fetchList()
    }
  }).catch(() => {})
}

// 获取抽屉举报数据
const handleViewReports = async (commentId, count) => {
  if (!count || count === 0) return
  drawerVisible.value = true
  drawerTitle.value = `评论 ID: ${commentId} 的举报详情`
  reportLoading.value = true
  reportList.value = []

  try {
    // 【修复】传 'comment'
    const res = await request.get('/reports/admin/page', { params: { targetType: 'comment', targetId: commentId, pageNum: 1, pageSize: 1000 } })
    if (res.code === 200 || res.code === 1) reportList.value = res.data.list || res.data.records || []
  } finally { reportLoading.value = false }
}

onMounted(() => { fetchList() })
</script>

<style scoped>
.app-container { padding: 20px; }
.search-form { margin-bottom: 20px; }
.pagination-container { margin-top: 20px; text-align: right; }
:deep(.report-drawer .el-drawer__body) { padding: 10px 20px 20px 20px; }
</style>
