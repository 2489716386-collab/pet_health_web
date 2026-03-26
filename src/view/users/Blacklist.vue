<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="用户ID">
          <el-input v-model="queryParams.userId" placeholder="请输入被封禁用户ID" clearable />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="queryParams.nickname" placeholder="请输入昵称" clearable />
        </el-form-item>
        <el-form-item label="进入黑名单时间">
          <el-date-picker
            v-model="queryParams.createDate"
            type="date"
            placeholder="请选择明确日期"
            value-format="YYYY-MM-DD"
            clearable
            @change="handleSearch"
          />
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查 询</el-button>
          <el-button @click="resetQuery">重 置</el-button>
        </el-form-item>

      </el-form>

      <el-table
        :data="tableData"
        border stripe
        v-loading="loading"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="userId" label="被封禁用户ID" align="center" width="120" />
        <el-table-column prop="reason" label="封禁原因" align="center" show-overflow-tooltip />
        <el-table-column prop="createTime" label="进入黑名单时间" align="center" width="140" />
        <el-table-column prop="expireTime" label="封禁过期时间" align="center" width="180">
          <template #default="scope">
            <span style="color: #F56C6C;">{{ scope.row.expireTime }}</span>
          </template>
        </el-table-column>

        <el-table-column label="操作" align="center" width="120" fixed="right">
          <template #default="scope">
            <el-button type="success" size="small" plain @click="unbanSingle(scope.row)">
              解 封
            </el-button>
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

// 表格与查询参数
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const selectedIds = ref([]) // 选中的被封禁用户ID列表

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20,
  userId: '',
  nickname: '',
  createDate: '' // 存储下拉框选中的天数
})

// 获取黑名单列表
const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/user-blacklist/page', { params: queryParams })
    tableData.value = res.data.records || res.data.list || []
    total.value = res.data.total || 0
  } catch (error) {
    console.error('获取黑名单失败', error)
  } finally {
    loading.value = false
  }
}

// 表格多选框改变事件
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.userId)
}

// 单个解封操作
const unbanSingle = (row) => {
  executeUnban([row.userId])
}

// 执行解封的通用请求方法
const executeUnban = (userIds) => {
  ElMessageBox.confirm(
    `确定要将选中的 ${userIds.length} 名用户解封并移出黑名单吗？`,
    '确认解封',
    {
      confirmButtonText: '确定解封',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    try {
      await request.post('/user-blacklist/unban/batch', userIds)
      ElMessage.success('操作成功，用户已恢复正常状态')
      fetchList() // 刷新表格
    } catch (error) {
      console.error('解封失败', error)
    }
  }).catch(() => {})
}

// 查与重置
const handleSearch = () => { queryParams.pageNum = 1; fetchList() }
const resetQuery = () => { queryParams.userId = ''; queryParams.nickname = ''; queryParams.createDate = ''; handleSearch() }

// 分页处理
const handleSizeChange = (val) => { queryParams.pageSize = val; fetchList() }
const handleCurrentChange = (val) => { queryParams.pageNum = val; fetchList() }

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.app-container { padding: 20px; }
.pagination-container { margin-top: 20px; text-align: right; }
</style>
