# การใช้งาน useTaxonomy Composable

## ภาพรวม

`useTaxonomy` เป็น Vue 3 Composable ที่สร้างขึ้นเพื่อจัดการข้อมูล Taxonomy ในระบบ e-learning ช่วยให้สามารถดึงข้อมูล taxonomy groups และ terms ตาม content type ได้อย่างง่ายดาย

## การติดตั้งและ Import

```javascript
import { useTaxonomy } from '@/composables/useTaxonomy'
```

## API หลัก

### taxonomy Object

```javascript
const { taxonomy } = useTaxonomy()

// ดึง taxonomy groups สำหรับ content type
const courseGroups = taxonomy.get('course')

// ดึง terms สำหรับ content type  
const courseTerms = taxonomy.getTerms('course')

// ดึง root terms (terms ที่ไม่มี parent)
const rootTerms = taxonomy.getRootTerms('course')

// ดึง terms ในรูปแบบ tree structure
const termsTree = taxonomy.getTree('course')

// ค้นหา terms
const searchResults = taxonomy.search('วิทยาศาสตร์', 'course')

// ดึงสถิติ
const stats = taxonomy.getStats('course')

// รีเฟรชข้อมูล
await taxonomy.refresh(true)
```

## ตัวอย่างการใช้งานใน CourseForm.vue

### 1. เพิ่ม Taxonomy Section ใน CourseForm

```vue
<template>
  <div>
    <!-- เนื้อหาเดิมของ CourseForm -->
    
    <!-- Taxonomy Section -->
    <div class="bg-blue-50 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 mt-3 mb-3 border-t border-b border-blue-100">
      <h3 class="text-sm font-semibold text-blue-800">การจัดหมวดหมู่ (Taxonomy)</h3>
    </div>
    
    <div class="p-4 border border-gray-200 rounded-md">
      <TaxonomySelector
        v-model="selectedTaxonomyTerms"
        content-type="course"
        content-type-label="คอร์สเรียน"
        :max-selections="10"
      />
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useTaxonomy } from '@/composables/useTaxonomy'
import TaxonomySelector from './resource/TaxonomySelector.vue'

export default {
  components: {
    TaxonomySelector
  },
  
  setup() {
    const { taxonomy, isDataReady, loading } = useTaxonomy()
    const selectedTaxonomyTerms = ref([])
    
    // ตัวอย่างการใช้งาน API
    const loadCourseCategories = async () => {
      // รอให้ข้อมูลพร้อม
      if (!isDataReady.value) {
        await taxonomy.refresh()
      }
      
      // ดึง taxonomy groups สำหรับ course
      const courseGroups = taxonomy.get('course')
      console.log('Course taxonomy groups:', courseGroups)
      
      // ดึงสถิติ
      const stats = taxonomy.getStats('course')
      console.log('Course taxonomy stats:', stats)
    }
    
    return {
      selectedTaxonomyTerms,
      loadCourseCategories,
      taxonomy,
      isDataReady,
      loading
    }
  }
}
</script>
```

### 2. การส่งข้อมูลไปยัง Backend

```javascript
// ใน saveCourse method
const saveCourse = async () => {
  const courseData = {
    name: this.name,
    slug: this.slug,
    description: this.description,
    // ... ข้อมูลอื่นๆ
    
    // เพิ่มข้อมูล taxonomy
    taxonomyTerms: this.selectedTaxonomyTerms,
    
    // หรือ แยกตาม group
    categories: this.getTermsByGroup('CATEGORY'),
    subjects: this.getTermsByGroup('SUBJECT'),
    levels: this.getTermsByGroup('LEVEL')
  }
  
  // ส่งไปยัง API
  const response = await fetch('/api/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(courseData)
  })
}

// Helper method
const getTermsByGroup = (groupCode) => {
  const { getTermById } = useTaxonomy()
  
  return this.selectedTaxonomyTerms.filter(termId => {
    const term = getTermById(termId)
    const group = this.taxonomy.getGroupById(term?.taxonomy)
    return group?.code === groupCode
  })
}
```

### 3. การใช้งานแบบ Simple

```javascript
// สำหรับการใช้งานเบื้องต้น
import { useTaxonomyLite } from '@/composables/useTaxonomy'

export default {
  setup() {
    const { taxonomy } = useTaxonomyLite()
    
    // ใช้งานง่ายๆ
    const categories = computed(() => taxonomy.get('course'))
    
    return { categories }
  }
}
```

## ตัวอย่างการแสดงผล Taxonomy ใน Course Detail

```vue
<template>
  <div class="course-taxonomy">
    <h4 class="text-lg font-semibold mb-3">หมวดหมู่</h4>
    
    <div class="space-y-3">
      <div v-for="group in taxonomyDisplay" :key="group.id" class="taxonomy-group">
        <h5 class="text-sm font-medium text-gray-700 mb-2">{{ group.name }}</h5>
        <div class="flex flex-wrap gap-2">
          <span 
            v-for="term in group.terms" 
            :key="term.id"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            :class="getTermColorClass(group.code)"
          >
            {{ term.name }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useTaxonomy } from '@/composables/useTaxonomy'

export default {
  props: {
    courseData: Object
  },
  
  setup(props) {
    const { getTermById, getGroupById } = useTaxonomy()
    
    const taxonomyDisplay = computed(() => {
      if (!props.courseData?.taxonomyTerms) return []
      
      const grouped = {}
      
      props.courseData.taxonomyTerms.forEach(termId => {
        const term = getTermById(termId)
        if (!term) return
        
        const group = getGroupById(term.taxonomy)
        if (!group) return
        
        if (!grouped[group._id]) {
          grouped[group._id] = {
            id: group._id,
            name: group.name,
            code: group.code,
            terms: []
          }
        }
        
        grouped[group._id].terms.push({
          id: term._id,
          name: term.customData?.name || term.name
        })
      })
      
      return Object.values(grouped)
    })
    
    const getTermColorClass = (groupCode) => {
      const colors = {
        'CATEGORY': 'bg-blue-100 text-blue-800',
        'SUBJECT': 'bg-green-100 text-green-800',
        'LEVEL': 'bg-purple-100 text-purple-800',
        'DEFAULT': 'bg-gray-100 text-gray-800'
      }
      return colors[groupCode] || colors.DEFAULT
    }
    
    return {
      taxonomyDisplay,
      getTermColorClass
    }
  }
}
</script>
```

## ตัวอย่างการค้นหา Course ด้วย Taxonomy

```vue
<template>
  <div class="course-search">
    <div class="mb-4">
      <label class="block text-sm font-medium mb-2">กรองตามหมวดหมู่</label>
      <select v-model="selectedCategory" class="w-full border rounded-md px-3 py-2">
        <option value="">ทั้งหมด</option>
        <option v-for="term in categoryTerms" :key="term._id" :value="term._id">
          {{ term.customData?.name || term.name }}
        </option>
      </select>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div v-for="course in filteredCourses" :key="course.id" class="course-card">
        <!-- Course content -->
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { useTaxonomy } from '@/composables/useTaxonomy'

export default {
  setup() {
    const { taxonomy } = useTaxonomy()
    const selectedCategory = ref('')
    const courses = ref([]) // จาก API
    
    const categoryTerms = computed(() => {
      const groups = taxonomy.get('course')
      const categoryGroup = groups.find(g => g.code === 'CATEGORY')
      
      if (!categoryGroup) return []
      
      return taxonomy.getTerms('course').filter(term => 
        term.taxonomy === categoryGroup._id && !term.parentId
      )
    })
    
    const filteredCourses = computed(() => {
      if (!selectedCategory.value) return courses.value
      
      return courses.value.filter(course => 
        course.taxonomyTerms?.includes(selectedCategory.value)
      )
    })
    
    return {
      selectedCategory,
      categoryTerms,
      filteredCourses
    }
  }
}
</script>
```

## Content Types ที่รองรับ

- `course` - คอร์สเรียน
- `post` - โพสต์
- `member` - สมาชิก  
- `resource` - ทรัพยากร
- `product` - สินค้า

## Features

- ✅ Auto-loading data on mount
- ✅ Caching ข้อมูล (5 นาทีต่อครั้ง)
- ✅ Error handling และ retry
- ✅ Search และ filter
- ✅ Tree structure support
- ✅ Statistics และ analytics
- ✅ Reactive updates
- ✅ TypeScript-friendly

## Performance Tips

1. ใช้ `useTaxonomyLite()` สำหรับการใช้งานเบื้องต้น
2. เรียก `taxonomy.refresh(true)` เมื่อต้องการข้อมูลล่าสุด
3. ใช้ computed properties สำหรับการ filter ข้อมูล
4. Cache ผลลัพธ์การค้นหาที่ซับซ้อน

## Error Handling

```javascript
const { taxonomy, error, loading } = useTaxonomy()

// ตรวจสอบ error
if (error.value) {
  console.error('Taxonomy error:', error.value)
  
  // ลองใหม่
  taxonomy.refresh(true)
}

// ตรวจสอบการโหลด
if (loading.value) {
  // แสดง loading state
}
``` 