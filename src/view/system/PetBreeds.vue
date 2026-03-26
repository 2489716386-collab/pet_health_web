<template>
  <div class="app-container">
    <el-card>
      <el-form :inline="true" :model="queryParams" class="search-form">
        <el-form-item label="所属大类">
          <el-select v-model="queryParams.species" placeholder="全部" clearable style="width: 120px">
            <el-option label="猫" value="猫" />
            <el-option label="狗" value="狗" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>
        <el-form-item label="首字母索引">
          <el-input v-model="queryParams.initialLetter" placeholder="如: A" clearable style="width: 120px" maxlength="1" />
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
        <el-table-column prop="breedId" label="ID" align="center" width="80" />
        <el-table-column prop="species" label="所属大类" align="center" width="100">
          <template #default="scope">
            <el-tag :type="scope.row.species === '猫' ? 'warning' : (scope.row.species === '狗' ? '' : 'info')">{{ scope.row.species }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="initialLetter" label="首字母" align="center" width="100" />
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
        <el-form-item label="所属大类" prop="species">
          <el-radio-group v-model="form.species">
            <el-radio label="猫">猫</el-radio>
            <el-radio label="狗">狗</el-radio>
            <el-radio label="仓鼠">仓鼠</el-radio>
            <el-radio label="其他">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="品种名称" prop="breedName">
          <el-input v-model="form.breedName" placeholder="例如：金毛寻回犬" />
        </el-form-item>
        <el-form-item label="首字母" prop="initialLetter">
          <el-input v-model="form.initialLetter" placeholder="大写字母，如：J" maxlength="1" />
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

const queryParams = reactive({ pageNum: 1, pageSize: 10, species: '', initialLetter: '', breedName: '' })
const form = reactive({ breedId: null, species: '猫', breedName: '', initialLetter: '' })
const rules = {
  species: [{ required: true, message: '请选择大类', trigger: 'change' }],
  breedName: [{ required: true, message: '品种名称不能为空', trigger: 'blur' }],
  initialLetter: [{ required: true, message: '首字母不能为空', trigger: 'blur' }]
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
const resetQuery = () => { Object.assign(queryParams, { species: '', initialLetter: '', breedName: '' }); handleSearch() }
const handleSizeChange = (val) => { queryParams.pageSize = val; fetchList() }
const handleCurrentChange = (val) => { queryParams.pageNum = val; fetchList() }

const handleSelectionChange = (selection) => { selectedIds.value = selection.map(item => item.breedId) }

const handleAdd = () => {
  dialogTitle.value = '新增品种'
  Object.assign(form, { breedId: null, species: '猫', breedName: '', initialLetter: '' })
  dialogVisible.value = true
}
const handleEdit = (row) => {
  dialogTitle.value = '修改品种'
  Object.assign(form, { breedId: row.breedId, species: row.species, breedName: row.breedName, initialLetter: row.initialLetter })
  dialogVisible.value = true
}

const submitForm = () => {
  formRef.value.validate(async (valid) => {
    if (valid) {
      // 自动转大写
      form.initialLetter = form.initialLetter.toUpperCase()
      const isEdit = !!form.breedId
      const url = isEdit ? '/pet-breeds/admin/update' : '/pet-breeds/admin/add'
      const method = isEdit ? 'put' : 'post'
      const res = await request[method](url, form)
      if (res.code === 200 || res.code === 1) {
        ElMessage.success(isEdit ? '修改成功' : '新增成功')
        dialogVisible.value = false
        fetchList()
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
