<template>
  <div class="app-container">
    <el-card>
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="敏感词">
          <el-input v-model="queryParams.wordContent" placeholder="模糊搜索敏感词" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查 询</el-button>
          <el-button @click="resetQuery">重 置</el-button>
          <el-button type="success" @click="handleAdd">新 增</el-button>
          <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">批量删除</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="tableData" border stripe v-loading="loading" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" align="center" />
        <el-table-column prop="id" label="ID" align="center" width="80" />
        <el-table-column prop="wordContent" label="敏感词内容" align="center" />

        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">修改</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.id)">删除</el-button>
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="400px">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="80px">
        <el-form-item label="敏感词" prop="wordContent">
          <el-input v-model="form.wordContent" placeholder="请输入敏感词内容" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitForm">确 定</el-button>
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
const selectedIds = ref([])

const dialogVisible = ref(false)
const dialogTitle = ref('')
const formRef = ref(null)

// 【修复】：所有的 word 替换为 wordContent
const queryParams = reactive({ pageNum: 1, pageSize: 20, wordContent: '' })
// 【修复】：wordId 替换为 id，word 替换为 wordContent
const form = reactive({ id: null, wordContent: '' })
const rules = { wordContent: [{ required: true, message: '敏感词不能为空', trigger: 'blur' }] }

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/sensitive-words/admin/page', { params: queryParams })
    if (res.code === 200 || res.code === 1) {
      tableData.value = res.data.list || res.data.records || []
      total.value = res.data.total || 0
    }
  } finally { loading.value = false }
}

const handleSearch = () => { queryParams.pageNum = 1; fetchList() }
const resetQuery = () => { queryParams.wordContent = ''; handleSearch() }
const handleSizeChange = (val) => { queryParams.pageSize = val; fetchList() }
const handleCurrentChange = (val) => { queryParams.pageNum = val; fetchList() }

// 【修复】：提取 item.id
const handleSelectionChange = (selection) => {
  selectedIds.value = selection.map(item => item.id)
}

const handleAdd = () => {
  dialogTitle.value = '新增敏感词'
  Object.assign(form, { id: null, wordContent: '' })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '修改敏感词'
  // 【修复】：赋值 id 和 wordContent
  Object.assign(form, { id: row.id, wordContent: row.wordContent })
  dialogVisible.value = true
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      // 【修复】：判断是不是编辑模式，依据是 form.id 存不存在
      const isEdit = !!form.id
      const url = isEdit ? '/sensitive-words/admin/update' : '/sensitive-words/admin/add'
      const method = isEdit ? 'put' : 'post'
      const res = await request[method](url, form)
      if (res.code === 200 || res.code === 1) {
        ElMessage.success(isEdit ? '修改成功' : '新增成功')
        dialogVisible.value = false
        fetchList()
      } else {
        ElMessage.error(res.msg || '操作失败')
      }
    }
  })
}

const doDelete = (ids) => {
  ElMessageBox.confirm('确认要删除选中的敏感词吗？', '警告', { type: 'warning' }).then(async () => {
    const res = await request.post('/sensitive-words/admin/delete', ids)
    if (res.code === 200 || res.code === 1) {
      ElMessage.success('删除成功')
      fetchList()
    }
  }).catch(() => {})
}

const handleDelete = (id) => doDelete([id])
const handleBatchDelete = () => doDelete(selectedIds.value)

onMounted(() => fetchList())
</script>

<style scoped>
.app-container { padding: 20px; }
.search-form { margin-bottom: 20px; }
.pagination-container { margin-top: 20px; text-align: right; }
</style>
