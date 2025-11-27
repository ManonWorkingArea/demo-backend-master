<template>
  <div>
    <h1>CRUD Example</h1>
    <form @submit.prevent="submitForm">
      <div>
        <label for="keyName">Key Name:</label>
        <input type="text" id="keyName" v-model="keyName">
      </div>
      <div>
        <label for="name">Name:</label>
        <input type="text" id="name" v-model="formData.name">
      </div>
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="formData.email">
      </div>
      <div>
        <button type="submit" :disabled="loading">{{ buttonText }}</button>
        <button type="button" @click="resetForm">Reset</button>
      </div>
    </form>
    <hr>
    <h2>Data</h2>
    <div>
      <label for="searchKey">Search Key:</label>
      <input type="text" id="searchKey" v-model="searchKeyTerm">
    </div>
    <div>
      <label for="searchValue">Search Value:</label>
      <input type="text" id="searchValue" v-model="searchValueTerm">
    </div>
    <ul>
      <li v-for="item in filteredData" :key="item.id">
        <div>{{ item.name }}</div>
        <div>{{ item.email }}</div>
        <div>
          <button @click="editItem(item)">Edit</button>
          <button @click="deleteItem(item.id)">Delete</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      loading: false,
      keyName: '',
      formData: {
        name: '',
        email: ''
      },
      editItemId: null,
      searchKeyTerm: '',
      searchValueTerm: ''
    }
  },
  computed: {
    ...mapState({
      configData: state => state.configData
    }),
    buttonText() {
      return this.editItemId ? 'Update' : 'Add'
    },
    filteredData() {
      if (this.keyName && this.configData[this.keyName]) {
        return this.configData[this.keyName]
          .filter(item => {
            if (!this.searchKeyTerm && !this.searchValueTerm) {
              return true
            }
            if (!this.searchKeyTerm && this.searchValueTerm) {
              const nameMatch = item.name.toLowerCase().includes(this.searchValueTerm.toLowerCase())
              const emailMatch = item.email.toLowerCase().includes(this.searchValueTerm.toLowerCase())
              return nameMatch || emailMatch
            }
            if (this.searchKeyTerm && this.searchValueTerm) {
              const searchKey = this.searchKeyTerm.toLowerCase()
              const searchValue = this.searchValueTerm.toLowerCase()
              return item[searchKey] && item[searchKey].toLowerCase().includes(searchValue)
            }
            return false
          })
      } else {
        return []
      }
    }
  },
  methods: {
    ...mapActions({
      updateConfigData: 'updateConfigData'
    }),
    submitForm() {
      const newData = {
        id: Date.now(),
        ...this.formData
      }
      const updatedData = [...(this.configData[this.keyName] || []), newData]
      this.updateConfigData({
        ...this.configData,
        [this.keyName]: updatedData
      })
      this.resetForm()
    },
    editItem(item) {
      this.editItemId = item.id
      this.formData = { ...item }
    },
    deleteItem(id) {
      const updatedData = this.configData[this.keyName].filter(item => item.id !== id)
      this.updateConfigData({
        ...this.configData,
        [this.keyName]: updatedData
      })
    },
    resetForm() {
      this.formData = {
        name: '',
        email: ''
      }
      this.editItemId = null
    }
  }
}
</script>
