import { createStore } from 'vuex'
import CryptoJS from 'crypto-js'

const store = createStore({
  state: {
    data: {}
  },
  mutations: {
    addData(state, payload) {
      state.data[payload.keyName] = payload.data
      localStorage.setItem('data', encryptData(state.data))
    },
    updateData(state, payload) {
      state.data[payload.keyName] = payload.data
      localStorage.setItem('data', encryptData(state.data))
    },
    deleteData(state, payload) {
      delete state.data[payload]
      localStorage.setItem('data', encryptData(state.data))
    },
    loadData(state) {
      const data = localStorage.getItem('data')
      if (data) {
        state.data = decryptData(data)
      }
    },
    searchByKey(state, payload) {
      const regex = new RegExp(payload.toLowerCase())
      state.data = Object.keys(state.data)
        .filter(keyName => regex.test(keyName.toLowerCase()))
        .reduce((obj, keyName) => {
          obj[keyName] = state.data[keyName]
          return obj
        }, {})
    },
    searchByValue(state, payload) {
      state.data = Object.keys(state.data)
        .filter(keyName => {
          const item = state.data[keyName]
          const nameMatch = item.name.toLowerCase().includes(payload.toLowerCase())
          const emailMatch = item.email.toLowerCase().includes(payload.toLowerCase())
          return nameMatch || emailMatch
        })
        .reduce((obj, keyName) => {
          obj[keyName] = state.data[keyName]
          return obj
        }, {})
    }    
  },
  actions: {
    addData({ commit }, payload) {
      commit('addData', payload)
    },
    updateData({ commit }, payload) {
      commit('updateData', payload)
    },
    deleteData({ commit }, payload) {
      commit('deleteData', payload)
    },
    loadData({ commit }) {
      commit('loadData')
    },
    searchByKey({ commit }, payload) {
      commit('searchByKey', payload)
    },
    searchByValue({ commit }, payload) {
      commit('searchByValue', payload)
    }
  },
  getters: {
    getDataByKeyName: (state) => (keyName) => {
      return state.data[keyName] || {}
    }
  }
})

function encryptData(data, useEncryption = false, key = 'my-secret-key') {
  if (useEncryption) {
    const ciphertext = CryptoJS.AES.encrypt(JSON.stringify(data), key)
    return ciphertext.toString()
  } else {
    return JSON.stringify(data)
  }
}

function decryptData(data, useEncryption = false, key = 'my-secret-key') {
  if (useEncryption) {
    const bytes = CryptoJS.AES.decrypt(data, key)
    const plaintext = bytes.toString(CryptoJS.enc.Utf8)
    return JSON.parse(plaintext)
  } else {
    return JSON.parse(data)
  }
}

store.commit('loadData')

export default store
