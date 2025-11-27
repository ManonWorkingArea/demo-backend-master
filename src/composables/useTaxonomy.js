import { ref, computed, onMounted } from 'vue'
import storageManager from '@/plugins/storage'
import requestClient from '@/plugins/requestClient'

const Request = new requestClient(false)

/**
 * Composable สำหรับการจัดการ Taxonomy
 * ใช้สำหรับดึงข้อมูล taxonomy groups และ terms ตาม content type
 */
export function useTaxonomy() {
  // Session and configs from storage
  const session = storageManager.get('session')
  const configs = storageManager.get('configs')
  
  // Reactive state
  const taxonomyGroups = ref([])
  const terms = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastFetch = ref(null)
  
  // เพิ่ม state object สำหรับการเข้าถึงข้อมูลที่ง่ายขึ้น
  const state = computed(() => ({
    groups: taxonomyGroups.value,
    terms: terms.value,
    loading: loading.value,
    error: error.value,
    isReady: !loading.value && taxonomyGroups.value.length >= 0 && terms.value.length >= 0
  }))
  
  // Content types definition
  const contentTypes = ref([
    { key: 'course', label: 'คอร์สเรียน', icon: 'fas fa-graduation-cap', color: 'blue' },
    { key: 'post', label: 'โพสต์', icon: 'fas fa-file-alt', color: 'green' },
    { key: 'member', label: 'สมาชิก', icon: 'fas fa-users', color: 'purple' },
    { key: 'resource', label: 'ทรัพยากร', icon: 'fas fa-folder', color: 'orange' },
    { key: 'product', label: 'สินค้า', icon: 'fas fa-box', color: 'red' }
  ])

  /**
   * ดึงข้อมูล taxonomy จาก API
   */
  const fetchTaxonomyData = async (force = false) => {
    // ถ้าเพิ่งดึงข้อมูลมาแล้วไม่เกิน 5 นาที และไม่ได้บังคับให้ดึงใหม่
    if (!force && lastFetch.value && (Date.now() - lastFetch.value) < 300000) {
      console.log('🔄 ใช้ข้อมูล taxonomy จาก cache')
      return
    }

    if (!session?.current?._id || !configs?.key) {
      error.value = 'ไม่พบ session หรือ config key'
      console.error('❌ ไม่พบ session หรือ config key')
      return
    }

    loading.value = true
    error.value = null
    console.log('🔄 กำลังดึงข้อมูล taxonomy...')

    try {
      // ใช้ requestClient แทน fetch ธรรมดา
      const payload = {
        method: 'find',
        args: [
          {
            $and: [
              { unit: session.current._id },
              { active: { $ne: false } } // เฉพาะที่ active
            ],
          },
        ],
        paging: { page: 1, limit: 500 },
      }

      const response = await Request.POST('taxonomy/query', payload, configs.key)
      
      console.log('🔍 Raw API response:', response)
      
      // ตรวจสอบ response structure
      let dataArray = []
      
      if (response && response.data) {
        // ถ้า response.data เป็น array
        if (Array.isArray(response.data)) {
          dataArray = response.data
        }
        // ถ้า response.data มี property อื่นที่เป็น array
        else if (response.data.data && Array.isArray(response.data.data)) {
          dataArray = response.data.data
        }
        // ถ้า response.data มี items property
        else if (response.data.items && Array.isArray(response.data.items)) {
          dataArray = response.data.items
        }
        // ถ้า response.data เป็น object เดียว
        else if (typeof response.data === 'object' && response.data._id) {
          dataArray = [response.data]
        }
        else {
          console.warn('⚠️ Unexpected response structure:', response.data)
          dataArray = []
        }
      } else {
        console.warn('⚠️ No data in response:', response)
        dataArray = []
      }
      
      console.log('📦 Processed data array:', dataArray)
      
      // แยก taxonomy groups และ terms
      const groups = dataArray.filter(item => item && item.type === 'group') || []
      const termItems = dataArray.filter(item => item && item.type === 'term') || []
      
      taxonomyGroups.value = groups
      terms.value = termItems
      lastFetch.value = Date.now()
      
      console.log('✅ โหลดข้อมูล taxonomy สำเร็จ:', { 
        groups: groups.length, 
        terms: termItems.length,
        totalItems: dataArray.length
      })
      console.log('📊 Groups:', groups)
      console.log('📋 Terms:', termItems)
      
    } catch (err) {
      error.value = `เกิดข้อผิดพลาดในการดึงข้อมูล taxonomy: ${err.message}`
      console.error('❌ Error fetching taxonomy data:', err)
      
      // ตั้งค่า default ให้เป็น array ว่าง
      taxonomyGroups.value = []
      terms.value = []
    } finally {
      loading.value = false
    }
  }

  /**
   * เพิ่ม Term ใหม่
   * @param {string} contentTypeKey - content type key
   * @param {Object} termData - ข้อมูล term ใหม่
   * @returns {Promise<Object>} term ที่สร้างใหม่
   */
  const addTerm = async (contentTypeKey, termData) => {
    if (!session?.current?._id || !configs?.key) {
      throw new Error('ไม่พบ session หรือ config key')
    }

    console.log('🔄 กำลังเพิ่ม term ใหม่:', termData)

    try {
      // เตรียมข้อมูลสำหรับส่ง API
      const newTermData = {
        unit: session.current._id,
        type: 'term',
        taxonomy: termData.taxonomy,
        name: termData.name,
        code: termData.code || '',
        parentId: termData.parentId || null,
        customData: termData.customData || {},
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      // เพิ่ม sortOrder โดยนับจาก terms ที่มีอยู่แล้วในกลุ่มเดียวกัน
      const existingTermsInGroup = terms.value.filter(term => 
        term.taxonomy === termData.taxonomy && 
        term.parentId === termData.parentId
      )
      newTermData.sortOrder = existingTermsInGroup.length

      console.log('📤 ส่งข้อมูล term ใหม่:', newTermData)

      // เรียก API เพื่อสร้าง term ใหม่
      const response = await Request.POST('taxonomy', {
        data: newTermData,
        options: {}
      }, configs.key)

      console.log('✅ สร้าง term สำเร็จ:', response)

      // เพิ่ม term ใหม่เข้าไปใน local state
      if (response && response._id) {
        terms.value.push(response)
        console.log('📋 เพิ่ม term ใหม่เข้า local state:', response._id)
      }

      return response

    } catch (err) {
      console.error('❌ Error adding term:', err)
      throw new Error(`เกิดข้อผิดพลาดในการเพิ่ม term: ${err.message}`)
    }
  }

  /**
   * ดึง taxonomy groups ตาม content type
   * @param {string} contentTypeKey - content type key เช่น 'course', 'post'
   * @returns {Array} array ของ taxonomy groups
   */
  const getGroupsByContentType = (contentTypeKey) => {
    if (!contentTypeKey) return []
    
    const groups = taxonomyGroups.value.filter(group => 
      group.contentTypes && 
      group.contentTypes.includes(contentTypeKey) &&
      group.active !== false
    )
    
    console.log(`🔍 Groups for content type '${contentTypeKey}':`, groups)
    return groups
  }

  /**
   * ดึง terms ทั้งหมดสำหรับ content type
   * @param {string} contentTypeKey - content type key
   * @returns {Array} array ของ terms
   */
  const getTermsByContentType = (contentTypeKey) => {
    const groups = getGroupsByContentType(contentTypeKey)
    const groupIds = groups.map(g => g._id)
    
    const filteredTerms = terms.value.filter(term => 
      groupIds.includes(term.taxonomy) &&
      term.active !== false
    )
    
    console.log(`🔍 Terms for content type '${contentTypeKey}':`, filteredTerms)
    return filteredTerms
  }

  /**
   * ดึง root terms (terms ที่ไม่มี parent) สำหรับ content type
   * @param {string} contentTypeKey - content type key
   * @returns {Array} array ของ root terms
   */
  const getRootTermsByContentType = (contentTypeKey) => {
    const allTerms = getTermsByContentType(contentTypeKey)
    
    return allTerms
      .filter(term => !term.parentId)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  }

  /**
   * ดึง child terms ของ parent term
   * @param {string} parentId - parent term id
   * @returns {Array} array ของ child terms
   */
  const getChildTerms = (parentId) => {
    return terms.value
      .filter(term => term.parentId === parentId && term.active !== false)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
  }

  /**
   * ดึงข้อมูล term โดย ID
   * @param {string} termId - term id
   * @returns {Object|null} term object หรือ null
   */
  const getTermById = (termId) => {
    const term = terms.value.find(term => term._id === termId) || null
    console.log(`🔍 หาข้อมูล term ID '${termId}':`, term)
    return term
  }

  /**
   * ดึงข้อมูล taxonomy group โดย ID
   * @param {string} groupId - group id
   * @returns {Object|null} group object หรือ null
   */
  const getGroupById = (groupId) => {
    const group = taxonomyGroups.value.find(group => group._id === groupId) || null
    console.log(`🔍 หาข้อมูล group ID '${groupId}':`, group)
    return group
  }

  /**
   * ดึงชื่อแสดงผลของ term
   * @param {string} termId - term id
   * @returns {string} ชื่อสำหรับแสดงผล
   */
  const getTermDisplayName = (termId) => {
    const term = getTermById(termId)
    if (!term) {
      console.warn(`⚠️ ไม่พบ term ID: ${termId}`)
      return `รายการ ${termId}`
    }
    
    // ลำดับความสำคัญในการหาชื่อ
    const displayName = term.customData?.name || 
                       term.customData?.ชื่อ || 
                       term.customData?.title ||
                       term.name || 
                       term.code ||
                       'ไม่มีชื่อ'
    
    console.log(`📄 Display name for term '${termId}':`, displayName)
    return displayName
  }

  /**
   * ดึงชื่อกลุ่มของ term
   * @param {string} termId - term id  
   * @returns {string} ชื่อกลุ่ม
   */
  const getTermGroupName = (termId) => {
    const term = getTermById(termId)
    if (!term || !term.taxonomy) {
      console.warn(`⚠️ ไม่พบ term หรือ taxonomy group สำหรับ ID: ${termId}`)
      return 'ไม่ระบุกลุ่ม'
    }
    
    const group = getGroupById(term.taxonomy)
    if (!group) {
      console.warn(`⚠️ ไม่พบ group ID: ${term.taxonomy}`)
      return 'ไม่ระบุกลุ่ม'
    }
    
    const groupName = group.name || group.code || 'ไม่ระบุกลุ่ม'
    console.log(`📁 Group name for term '${termId}':`, groupName)
    return groupName
  }

  /**
   * ดึงข้อมูล content type
   * @param {string} key - content type key
   * @returns {Object|null} content type object หรือ null
   */
  const getContentTypeInfo = (key) => {
    return contentTypes.value.find(ct => ct.key === key) || { 
      label: key, 
      icon: 'fas fa-tag', 
      color: 'gray' 
    }
  }

  /**
   * สร้าง hierarchical tree structure สำหรับ terms
   * @param {string} contentTypeKey - content type key
   * @returns {Array} array ของ terms ในรูปแบบ tree
   */
  const getTermsTree = (contentTypeKey) => {
    const rootTerms = getRootTermsByContentType(contentTypeKey)
    
    const buildTree = (parentTerms) => {
      return parentTerms.map(term => ({
        ...term,
        children: buildTree(getChildTerms(term._id))
      }))
    }
    
    return buildTree(rootTerms)
  }

  /**
   * ค้นหา terms ตามคำค้นหา
   * @param {string} query - คำค้นหา
   * @param {string} contentTypeKey - content type key (optional)
   * @returns {Array} array ของ terms ที่ตรงกับคำค้นหา
   */
  const searchTerms = (query, contentTypeKey = null) => {
    if (!query?.trim()) return []
    
    const searchQuery = query.toLowerCase().trim()
    let searchTerms = contentTypeKey ? getTermsByContentType(contentTypeKey) : terms.value
    
    return searchTerms.filter(term => {
      // ค้นหาใน name
      if (term.name?.toLowerCase().includes(searchQuery)) return true
      
      // ค้นหาใน code
      if (term.code?.toLowerCase().includes(searchQuery)) return true
      
      // ค้นหาใน customData
      if (term.customData) {
        return Object.values(term.customData).some(value => 
          typeof value === 'string' && value.toLowerCase().includes(searchQuery)
        )
      }
      
      return false
    })
  }

  /**
   * ดึง field configuration สำหรับ taxonomy group
   * @param {string} groupId - group id
   * @returns {Array} array ของ field configuration
   */
  const getFieldConfig = (groupId) => {
    const group = getGroupById(groupId)
    return group?.fieldConfig || []
  }

  /**
   * สถิติสำหรับ content type
   * @param {string} contentTypeKey - content type key
   * @returns {Object} object ที่มีสถิติต่างๆ
   */
  const getContentTypeStats = (contentTypeKey) => {
    const groups = getGroupsByContentType(contentTypeKey)
    const allTerms = getTermsByContentType(contentTypeKey)
    const rootTerms = getRootTermsByContentType(contentTypeKey)
    
    return {
      totalGroups: groups.length,
      totalTerms: allTerms.length,
      rootTerms: rootTerms.length,
      subTerms: allTerms.length - rootTerms.length,
      activeGroups: groups.filter(g => g.active !== false).length,
      activeTerms: allTerms.filter(t => t.active !== false).length
    }
  }

  // Computed properties
  const allContentTypes = computed(() => contentTypes.value)
  
  const availableContentTypes = computed(() => {
    return contentTypes.value.filter(ct => {
      const hasGroups = taxonomyGroups.value.some(group => 
        group.contentTypes && group.contentTypes.includes(ct.key)
      )
      return hasGroups
    })
  })

  const isDataReady = computed(() => {
    return !loading.value && taxonomyGroups.value.length >= 0 && terms.value.length >= 0
  })

  // Main API object ที่ return ออกไป
  const taxonomy = {
    // เพิ่ม state สำหรับการเข้าถึงข้อมูลโดยตรง
    state: state.value,
    
    /**
     * ดึง taxonomy groups สำหรับ content type
     * @param {string} contentTypeKey 
     * @returns {Array}
     */
    get: (contentTypeKey) => getGroupsByContentType(contentTypeKey),
    
    /**
     * ดึง terms สำหรับ content type
     * @param {string} contentTypeKey 
     * @returns {Array}
     */
    getTerms: (contentTypeKey) => getTermsByContentType(contentTypeKey),
    
    /**
     * ดึง root terms สำหรับ content type
     * @param {string} contentTypeKey 
     * @returns {Array}
     */
    getRootTerms: (contentTypeKey) => getRootTermsByContentType(contentTypeKey),
    
    /**
     * ดึง terms ในรูปแบบ tree structure
     * @param {string} contentTypeKey 
     * @returns {Array}
     */
    getTree: (contentTypeKey) => getTermsTree(contentTypeKey),
    
    /**
     * ค้นหา terms
     * @param {string} query 
     * @param {string} contentTypeKey 
     * @returns {Array}
     */
    search: (query, contentTypeKey) => searchTerms(query, contentTypeKey),
    
    /**
     * ดึงสถิติสำหรับ content type
     * @param {string} contentTypeKey 
     * @returns {Object}
     */
    getStats: (contentTypeKey) => getContentTypeStats(contentTypeKey),
    
    /**
     * รีเฟรชข้อมูล
     * @param {boolean} force 
     * @returns {Promise}
     */
    refresh: (force = false) => fetchTaxonomyData(force),
    
    /**
     * ดึงข้อมูล term โดย ID
     * @param {string} termId 
     * @returns {Object|null}
     */
    getTermById: (termId) => getTermById(termId),
    
    /**
     * ดึงข้อมูล group โดย ID
     * @param {string} groupId 
     * @returns {Object|null}
     */
    getGroupById: (groupId) => getGroupById(groupId),
    
    /**
     * ดึงชื่อแสดงผลของ term
     * @param {string} termId 
     * @returns {string}
     */
    getTermDisplayName: (termId) => getTermDisplayName(termId),
    
    /**
     * ดึงชื่อกลุ่มของ term
     * @param {string} termId 
     * @returns {string}
     */
    getTermGroupName: (termId) => getTermGroupName(termId),
    
    /**
     * ดึงข้อมูล taxonomy ใหม่
     * @param {boolean} force 
     * @returns {Promise}
     */
    fetchTaxonomyData: (force = false) => fetchTaxonomyData(force),
    
    /**
     * เพิ่ม Term ใหม่
     * @param {string} contentTypeKey 
     * @param {Object} termData 
     * @returns {Promise<Object>}
     */
    addTerm: (contentTypeKey, termData) => addTerm(contentTypeKey, termData)
  }

  // Auto-load data on mount
  onMounted(() => {
    fetchTaxonomyData()
  })

  return {
    // Main API
    taxonomy,
    
    // Reactive state
    state,
    taxonomyGroups,
    terms,
    loading,
    error,
    
    // Computed
    allContentTypes,
    availableContentTypes,
    isDataReady,
    
    // Helper methods
    getGroupById,
    getTermById,
    getChildTerms,
    getContentTypeInfo,
    getFieldConfig,
    getTermDisplayName,
    getTermGroupName,
    
    // Data management
    fetchTaxonomyData,
    addTerm,
    
    // Statistics
    getContentTypeStats
  }
}

/**
 * Lightweight composable สำหรับใช้เฉพาะการดึงข้อมูล taxonomy
 * ไม่มีการ auto-fetch และมี memory เบา
 */
export function useTaxonomyLite() {
  const { taxonomy } = useTaxonomy()
  return { taxonomy }
}

export default useTaxonomy