<template>
  <div class="app-container">
    <el-card>
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="所属大类">
          <el-select v-model="queryParams.speciesType" placeholder="请选择或输入" clearable filterable allow-create style="width: 140px">
            <el-option label="猫" value="猫" />
            <el-option label="狗" value="狗" />
            <el-option label="兔" value="兔" />
            <el-option label="鸟" value="鸟" />
            <el-option label="异宠" value="异宠" />
          </el-select>
        </el-form-item>
        <el-form-item label="品种名称">
          <el-input v-model="queryParams.breedName" placeholder="模糊搜索品种" clearable />
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

        <el-table-column prop="breedId" label="ID" align="center" width="100" sortable />

        <el-table-column prop="speciesType" label="所属大类" align="center" width="120">
          <template #default="scope">
            <el-tag :type="getSpeciesTagType(scope.row.speciesType)">
              {{ scope.row.speciesType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="breedName" label="品种名称" align="center" />
        <el-table-column label="操作" align="center" width="150" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">修改</el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row.breedId)">删除</el-button>
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

    <el-dialog :title="dialogTitle" v-model="dialogVisible" width="500px">
      <el-form :model="form" ref="formRef" :rules="rules" label-width="100px">
        <el-form-item label="所属大类" prop="speciesType">
          <el-select v-model="form.speciesType" placeholder="请选择或直接输入新大类" filterable allow-create style="width: 100%">
            <el-option label="猫" value="猫" />
            <el-option label="狗" value="狗" />
            <el-option label="兔" value="兔" />
            <el-option label="鸟" value="鸟" />
            <el-option label="异宠" value="异宠" />
          </el-select>
        </el-form-item>
        <el-form-item label="品种名称" prop="breedName">
          <el-input v-model="form.breedName" placeholder="例如：金毛寻回犬" />
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

// 移除 initial
const queryParams = reactive({ pageNum: 1, pageSize: 20, speciesType: '', breedName: '' })
const form = reactive({ breedId: null, speciesType: '猫', breedName: '' })

const rules = {
  speciesType: [{ required: true, message: '请选择或输入大类', trigger: 'change' }],
  breedName: [{ required: true, message: '品种名称不能为空', trigger: 'blur' }]
}

const getSpeciesTagType = (type) => {
  if (type === '猫') return 'warning'
  if (type === '狗') return ''
  if (type === '兔') return 'success'
  return 'info'
}

const fetchList = async () => {
  loading.value = true
  try {
    const res = await request.get('/pet-breeds/admin/page', { params: queryParams })
    if (res.code === 200 || res.code === 1) {
      tableData.value = res.data.list || res.data.records || []
      total.value = res.data.total || 0
    }
  } finally { loading.value = false }
}

const handleSearch = () => { queryParams.pageNum = 1; fetchList() }
const resetQuery = () => { Object.assign(queryParams, { speciesType: '', breedName: '' }); handleSearch() }
const handleSizeChange = (val) => { queryParams.pageSize = val; fetchList() }
const handleCurrentChange = (val) => { queryParams.pageNum = val; fetchList() }

const handleSelectionChange = (selection) => { selectedIds.value = selection.map(item => item.breedId) }

const handleAdd = () => {
  dialogTitle.value = '新增品种'
  Object.assign(form, { breedId: null, speciesType: '猫', breedName: '' })
  dialogVisible.value = true
}

const handleEdit = (row) => {
  dialogTitle.value = '修改品种'
  Object.assign(form, { breedId: row.breedId, speciesType: row.speciesType, breedName: row.breedName })
  dialogVisible.value = true
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      const isEdit = !!form.breedId
      const url = isEdit ? '/pet-breeds/admin/update' : '/pet-breeds/admin/add'
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
  ElMessageBox.confirm('确认要删除选中的品种吗？', '警告', { type: 'warning' }).then(async () => {
    const res = await request.post('/pet-breeds/admin/delete', ids)
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
