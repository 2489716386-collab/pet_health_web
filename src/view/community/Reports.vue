<template>
  <div class="app-container">
    <el-card>
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="目标类型">
          <el-select v-model="queryParams.targetType" placeholder="全部" clearable style="width: 120px">
            <el-option label="动态帖子" value="post" />
            <el-option label="动态评论" value="comment" />
          </el-select>
        </el-form-item>
        <el-form-item label="处理状态">
          <el-select v-model="queryParams.status" placeholder="全部" clearable style="width: 120px">
            <el-option label="待处理" :value="0" />
            <el-option label="已忽略" :value="1" />
            <el-option label="已删除内容" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="举报时间">
          <el-date-picker
            v-model="timeRange"
            type="daterange"
            range-separator="至"
            value-format="YYYY-MM-DD"
            clearable
            @change="handleTimeChange"
          />
        </el-form-item>
        <el-form-item label="举报理由">
          <el-input v-model="queryParams.reason" placeholder="搜索理由" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查 询</el-button>
          <el-button @click="resetQuery">重 置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="reportId" label="举报ID" align="center" width="80" />
        <el-table-column prop="userId" label="举报人ID" align="center" width="100" />
        <el-table-column prop="targetType" label="目标类型" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.targetType === 'post' ? '' : 'success'">
              {{ scope.row.targetType === 'post' ? '动态帖子' : '动态评论' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="targetId" label="目标内容ID" align="center" width="100" />
        <el-table-column prop="reason" label="举报理由" align="center" show-overflow-tooltip />
        <el-table-column prop="status" label="处理状态" align="center" width="120">
          <template #default="scope">
            <el-tag v-if="scope.row.status === 0" type="warning">待处理</el-tag>
            <el-tag v-else-if="scope.row.status === 1" type="info">已忽略</el-tag>
            <el-tag v-else-if="scope.row.status === 2" type="danger">已删除内容</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="举报时间" align="center" width="170" />
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
import request from '@/axios'

const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const timeRange = ref([])

const queryParams = reactive({
  pageNum: 1, pageSize: 20, targetType: '', status: null, startDate: '', endDate: '', reason: ''
})

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/reports/admin/page', { params: queryParams })
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
  Object.assign(queryParams, { targetType: '', status: null, startDate: '', endDate: '', reason: '' })
  timeRange.value = []; handleSearch()
}
const handleSizeChange = (val) => { queryParams.pageSize = val; fetchList() }
const handleCurrentChange = (val) => { queryParams.pageNum = val; fetchList() }

onMounted(() => { fetchList() })
</script>

<style scoped>
.app-container { padding: 20px; }
.search-form { margin-bottom: 20px; }
.pagination-container { margin-top: 20px; text-align: right; }
</style>
