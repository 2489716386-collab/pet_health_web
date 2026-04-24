<template>
  <div class="app-container">
    <el-card class="filter-container" shadow="never" style="margin-bottom: 20px;">
      <el-input v-model="listQuery.species" placeholder="物种 (如: 猫)" style="width: 150px;" clearable />
      <el-input v-model="listQuery.breed" placeholder="品种 (如: 布偶猫)" style="width: 150px; margin-left: 10px;" clearable />
      <el-input v-model="listQuery.keyword" placeholder="搜索建议内容..." style="width: 250px; margin-left: 10px;" clearable />
      <el-button type="primary" icon="el-icon-search" style="margin-left: 10px;" @click="handleFilter">查询</el-button>
      <el-button type="success" icon="el-icon-plus" style="float: right;" @click="handleCreate">新增知识</el-button>
    </el-card>

    <el-table :data="list" border stripe style="width: 100%">
      <el-table-column prop="id" label="ID" width="80" align="center" />
      <el-table-column prop="species" label="物种" width="100" align="center" />
      <el-table-column prop="breed" label="品种" width="120" align="center" />
      <el-table-column prop="lifeStage" label="生长阶段" width="100" align="center" />
      <el-table-column prop="dietAdvice" label="饮食建议" show-overflow-tooltip />
      <el-table-column prop="medicalAdvice" label="医疗建议" show-overflow-tooltip />
      <el-table-column label="操作" width="180" align="center">
        <template v-slot="scope">
          <el-button size="mini" type="primary" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="mini" type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="dialogStatus === 'create' ? '新增养护知识' : '编辑养护知识'" v-model:visible="dialogFormVisible" width="600px">
      <el-form ref="dataForm" :model="temp" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="物种">
              <el-input v-model="temp.species" :disabled="dialogStatus === 'update'" placeholder="如: 猫" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品种">
              <el-input v-model="temp.breed" :disabled="dialogStatus === 'update'" placeholder="如: 布偶猫" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="生长阶段">
          <el-input v-model="temp.lifeStage" :disabled="dialogStatus === 'update'" placeholder="如: 幼年期 / 全阶段" />
        </el-form-item>

        <el-form-item label="饮食建议">
          <el-input v-model="temp.dietAdvice" type="textarea" :rows="3" />
        </el-form-item>
        <el-form-item label="卫生建议">
          <el-input v-model="temp.hygieneAdvice" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="医疗建议">
          <el-input v-model="temp.medicalAdvice" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="环境要求">
          <el-input v-model="temp.environmentAdvice" type="textarea" :rows="2" />
        </el-form-item>
        <el-form-item label="养护忌讳">
          <el-input v-model="temp.caution" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogFormVisible = false">取消</el-button>
          <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">提交</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data () {
    return {
      list: [],
      listQuery: {
        species: '',
        breed: '',
        keyword: ''
      },
      temp: {
        id: undefined,
        species: '',
        breed: '',
        lifeStage: '',
        dietAdvice: '',
        hygieneAdvice: '',
        medicalAdvice: '',
        environmentAdvice: '',
        caution: ''
      },
      dialogFormVisible: false,
      dialogStatus: ''
    }
  },
  created () {
    this.getList()
  },
  methods: {
    getList () {
      // 调用后端重构后的 getKnowledgeList 接口
      this.$axios.get('/knowledge-base/list', { params: this.listQuery }).then(res => {
        if (res.data.code === 200) {
          this.list = res.data.data
        }
      })
    },
    handleFilter () {
      this.getList()
    },
    handleCreate () {
      this.temp = { id: undefined, species: '', breed: '', lifeStage: '' }
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    createData () {
      this.$axios.post('/knowledge-base/add', this.temp).then(() => {
        this.dialogFormVisible = false
        this.getList()
        this.$message.success('添加成功')
      })
    },
    handleUpdate (row) {
      this.temp = Object.assign({}, row) // 复制对象避免直接修改列表
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
    },
    updateData () {
      this.$axios.put('/knowledge-base/update', this.temp).then(() => {
        this.dialogFormVisible = false
        this.getList()
        this.$message.success('修改成功')
      })
    },
    handleDelete (row) {
      this.$confirm('确定删除该养护记录吗？', '警告', { type: 'warning' }).then(() => {
        this.$axios.delete(`/knowledge-base/${row.id}`).then(() => {
          this.getList()
          this.$message.success('删除成功')
        })
      })
    }
  }
}
</script>
