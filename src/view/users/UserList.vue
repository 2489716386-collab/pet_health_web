<template>
  <div class="app-container">
    <el-card class="box-card">
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="用户ID">
          <el-input v-model="queryParams.userId" placeholder="请输入用户ID" clearable />
        </el-form-item>
        <el-form-item label="昵称">
          <el-input v-model="queryParams.nickname" placeholder="请输入昵称模糊搜索" clearable />
        </el-form-item>

        <el-form-item label="角色" style="width: 30%">
          <el-select v-model="queryParams.role" placeholder="选择角色" clearable @change="handleSearch">
            <el-option label="普通用户" value="user" />
            <el-option label="管理员" value="admin" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch">查 询</el-button>
          <el-button @click="resetQuery">重 置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading" style="width: 100%">
        <el-table-column prop="userId" label="用户ID" align="center" width="120" />
        <el-table-column prop="nickname" label="昵称" align="center" />

        <el-table-column prop="status" label="状态" align="center" width="120">
          <template #default="scope">
            <div v-if="scope.row">
              <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
                {{ scope.row.status || '未知' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="身份" align="center" width="120">
          <template #default="scope">
            <div v-if="scope.row">
              <el-tag :type="scope.row.role === 'admin' ? 'danger' : 'success'">
                {{ scope.row.role === 'admin' ? '管理员' : '普通用户' }}
              </el-tag>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="createTime" label="注册时间" align="center" width="180" />

        <el-table-column label="操作" align="center" width="150">
          <template #default="scope">
            <el-button
              v-if="scope.row.status === '正常'"
              type="danger"
              size="small"
              @click="openBanDialog(scope.row)">
              封 禁
            </el-button>
            <el-button v-else type="info" size="small" disabled>
              已封禁
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

    <el-dialog title="拉黑/封禁用户" v-model="banDialogVisible" width="400px" @close="resetBanForm">
      <el-form ref="banFormRef" :model="banForm" :rules="banRules" label-width="80px">
        <el-form-item label="封禁时长" prop="duration">
          <el-select v-model="banForm.duration" placeholder="请选择封禁时长" style="width: 100%;">
            <el-option label="两周 (14天)" :value="14" />
            <el-option label="一个月 (30天)" :value="30" />
            <el-option label="三个月 (90天)" :value="90" />
            <el-option label="六个月 (180天)" :value="180" />
            <el-option label="十二个月 (365天)" :value="365" />
          </el-select>
        </el-form-item>
        <el-form-item label="封禁原因" prop="reason">
          <el-input v-model="banForm.reason" type="textarea" placeholder="请输入封禁原因..." rows="3" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="banDialogVisible = false">取 消</el-button>
          <el-button type="danger" @click="submitBan" :loading="banLoading">确 定 封 禁</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import request from '@/axios'

// 表格与查询参数
const loading = ref(false)
const tableData = ref([])
const total = ref(0)

const queryParams = reactive({
  pageNum: 1,
  pageSize: 10,
  userId: '',
  nickname: '',
  role: null // 初始为 null 表示不限角色
})

// 获取用户列表数据
const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/users/admin/page', { params: queryParams })
    // 【核心修正】：使用可选链 ?. 防止极端情况下的空指针报错
    tableData.value = res?.data?.records || res?.data?.list || []
    total.value = res?.data?.total || 0
  } catch (error) {
    console.error('获取列表失败', error)
  } finally {
    loading.value = false
  }
}

// 查询操作
const handleSearch = () => {
  queryParams.pageNum = 1
  fetchList()
}

// 重置操作
const resetQuery = () => {
  queryParams.userId = ''
  queryParams.nickname = ''
  queryParams.role = null
  handleSearch()
}

// 分页处理
const handleSizeChange = (val) => {
  queryParams.pageSize = val
  fetchList()
}
const handleCurrentChange = (val) => {
  queryParams.pageNum = val
  fetchList()
}

// --- 封禁业务逻辑 ---
const banDialogVisible = ref(false)
const banLoading = ref(false)
const banFormRef = ref(null)
const banForm = reactive({
  userId: null,
  banDays: 30, // 默认1个月
  reason: ''
})
const banRules = reactive({
  duration: [{ required: true, message: '请选择封禁时长', trigger: 'change' }],
  reason: [{ required: true, message: '封禁原因不能为空', trigger: 'blur' }]
})

const openBanDialog = (row) => {
  banForm.userId = row.userId
  banDialogVisible.value = true
}

const resetBanForm = () => {
  if (banFormRef.value) banFormRef.value.resetFields()
  banForm.userId = null
}

const submitBan = async () => {
  if (!banFormRef.value) return
  await banFormRef.value.validate(async (valid) => {
    if (valid) {
      banLoading.value = true
      try {
        // 显式构造参数，确保字段名与后端 UserBanDTO 一致
        const postData = {
          userId: banForm.userId, // 对应后端 Long userId
          banDays: banForm.banDays, // 对应后端 Integer banDays
          reason: banForm.reason // 对应后端 String reason
        }

        await request.post('/users/admin/unban', postData)

        ElMessage.success('封禁成功，已加入黑名单')
        banDialogVisible.value = false
        fetchList()
      } catch (error) {
        // 如果这里报错，请查看浏览器控制台 Network 选项卡的 Response
        console.error('封禁失败', error)
      } finally {
        banLoading.value = false
      }
    }
  })
}

onMounted(() => {
  fetchList()
})
</script>

<style scoped>
.app-container {
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  text-align: right;
}
</style>
