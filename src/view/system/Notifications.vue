<template>
  <div class="app-container">
    <el-card>
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="通知类型">
          <el-select v-model="queryParams.type" placeholder="全部" clearable style="width: 130px">
            <el-option label="系统维护类" :value="1" />
            <el-option label="违规提醒类" :value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="发送时间">
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
        <el-form-item label="通知内容">
          <el-input v-model="queryParams.content" placeholder="模糊搜索正文/标题" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查 询</el-button>
          <el-button @click="resetQuery">重 置</el-button>
          <el-button type="success" @click="handleAdd">发送新通知</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading">
        <el-table-column prop="noticeId" label="通知ID" align="center" width="80" />
        <el-table-column prop="noticeType" label="通知类型" align="center" width="130">
          <template #default="scope">
            <el-tag v-if="scope.row.noticeType === 1 || scope.row.noticeType === 'SYSTEM_MAINTENANCE'" type="info">
              系统维护类
            </el-tag>
            <el-tag v-else-if="scope.row.noticeType === 2 || scope.row.noticeType === 'VIOLATION_WARNING'" type="danger">
              违规提醒类
            </el-tag>
            <el-tag v-else type="warning">未知类型</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="title" label="通知标题" align="center" width="200" show-overflow-tooltip />
        <el-table-column prop="content" label="正文内容" align="center" show-overflow-tooltip />
        <el-table-column prop="targetUserId" label="接收对象" align="center" width="120">
          <template #default="scope">
            <el-tag v-if="!scope.row.targetUserId || scope.row.targetUserId === 0" type="success">全部用户</el-tag>
            <span v-else>用户ID: {{ scope.row.targetUserId }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="发送时间" align="center" width="170" />
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

    <el-dialog title="发布新通知" v-model="dialogVisible" width="600px">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="100px">
        <el-form-item label="通知类型" prop="type">
          <el-radio-group v-model="form.type">
            <el-radio :label="1">系统维护类</el-radio>
            <el-radio :label="2">违规提醒类</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="接收对象" prop="sendTarget">
          <el-radio-group v-model="form.sendTarget">
            <el-radio label="ALL">全部用户</el-radio>
            <el-radio label="SINGLE">指定用户</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.sendTarget === 'SINGLE'" label="接收人ID" prop="targetUserId">
          <el-input v-model="form.targetUserId" placeholder="请输入接收通知的用户ID" type="number" />
        </el-form-item>
        <el-form-item label="通知标题" prop="title">
          <el-input v-model="form.title" placeholder="请输入通知标题" />
        </el-form-item>
        <el-form-item label="通知正文" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="4" placeholder="请输入通知详细内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确认发送</el-button>
        </span>
      </template>
    </el-dialog>
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
const dialogVisible = ref(false)
const formRef = ref(null)

const queryParams = reactive({ pageNum: 1, pageSize: 10, type: null, content: '', startDate: '', endDate: '' })
// 表单中的 sendTarget 是前端辅助字段，不传给后端
const form = reactive({ type: 1, sendTarget: 'ALL', targetUserId: '', title: '', content: '' })

const rules = {
  title: [{ required: true, message: '标题不能为空', trigger: 'blur' }],
  content: [{ required: true, message: '正文不能为空', trigger: 'blur' }],
  targetUserId: [{ required: true, message: '指定用户时必须填写用户ID', trigger: 'blur' }]
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/notifications/admin/page', { params: queryParams })
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
  Object.assign(queryParams, { type: null, content: '', startDate: '', endDate: '' })
  timeRange.value = []; handleSearch()
}
const handleSizeChange = (val) => { queryParams.pageSize = val; fetchList() }
const handleCurrentChange = (val) => { queryParams.pageNum = val; fetchList() }

const handleAdd = () => {
  Object.assign(form, { type: 1, sendTarget: 'ALL', targetUserId: '', title: '', content: '' })
  dialogVisible.value = true
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      ElMessageBox.confirm('通知发送后无法撤回，确定要发送吗？', '提示', { type: 'warning' }).then(async () => {
        // 组装传给后端的数据：如果选了全部用户，把 targetUserId 设为 0 或 null
        const submitData = {
          noticeType: form.type === 1 ? 'SYSTEM_MAINTENANCE' : 'VIOLATION_WARNING',
          title: form.title,
          content: form.content,
          targetUserId: form.sendTarget === 'ALL' ? 0 : Number(form.targetUserId)
        }
        const res = await request.post('/notifications/admin/add', submitData)
        if (res.code === 200 || res.code === 1) {
          ElMessage.success('通知发送成功')
          dialogVisible.value = false
          fetchList()
        }
      }).catch(() => {})
    }
  })
}

onMounted(() => fetchList())
</script>

<style scoped>
.app-container { padding: 20px; }
.search-form { margin-bottom: 20px; }
.pagination-container { margin-top: 20px; text-align: right; }
</style>
