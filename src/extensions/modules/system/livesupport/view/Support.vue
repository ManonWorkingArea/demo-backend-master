<script>
import {useTitle} 	from 'vue-page-title';
import {useRoute} 	from 'vue-router'
import List 		from '../component/Support';
import storageManager from '@/plugins/storage';
export default {
	name: 'AdminList',
	components: {
		List
	},
	data() {
		return {
		login: storageManager.get('session','login'),
		// กำหนดความสูงของ header แบบ manual
		manualHeaderHeight: 216, // ปรับค่านี้ตามต้องการ
		}
	},
	computed: {
		// คำนวณความสูงแบบ dynamic
		dynamicHeaderHeight() {
			// ตัวอย่าง: ตรวจสอบว่ามี topbar หรือไม่
			const hasTopbar = document.querySelector('.topbar') !== null;
			const hasBreadcrumb = document.querySelector('.breadcrumb') !== null;
			
			let height = 80; // ความสูงพื้นฐาน
			if (hasTopbar) height += 40;
			if (hasBreadcrumb) height += 40;
			
			return height;
		},
		
		// กำหนดความสูงทั้งหมดแบบ manual
		customContainerHeight() {
			return `calc(100vh - ${this.manualHeaderHeight}px)`;
		}
	},
	methods: {
		showAlert() {
		this.$swal('Hello Vue world!!!');
		},
		
		// Method สำหรับปรับความสูงแบบ manual
		updateHeaderHeight(newHeight) {
			this.manualHeaderHeight = newHeight;
		}
	},
	setup() {
        const route     = useRoute();
        const routeName = route.meta.title;
        useTitle(routeName);
    },
};
</script>

<template>
<!-- ตัวอย่างการใช้งานแบบ Manual -->

<!-- 1. กำหนดความสูงของ header แบบ manual -->
<List v-if="this.login" :header-height="manualHeaderHeight"/>

<!-- 2. ใช้ computed property -->
<!-- <List v-if="this.login" :header-height="dynamicHeaderHeight"/> -->

<!-- 3. กำหนดความสูงทั้งหมดแบบ manual -->
<!-- <List v-if="this.login" :custom-height="customContainerHeight"/> -->

<!-- 4. กำหนดค่าตายตัว -->
<!-- <List v-if="this.login" :header-height="140"/> -->

<!-- 5. ใช้ calc แบบ manual -->
<!-- <List v-if="this.login" custom-height="calc(100vh - 160px)"/> -->

<!-- 6. รวมหลายตัวเลือก -->
<!-- <List v-if="this.login" 
      header-type="full-admin" 
      :header-height="manualHeaderHeight"
      custom-class="manual-support"/> -->

<!-- Controls สำหรับปรับความสูงแบบ manual (สำหรับ testing) -->
<!-- 
<div v-if="this.login" class="p-4 bg-gray-100 mb-4">
  <h3>Manual Header Height Control</h3>
  <input 
    type="range" 
    min="60" 
    max="200" 
    v-model="manualHeaderHeight"
    class="w-full"
  />
  <p>Current Height: {{ manualHeaderHeight }}px</p>
  <button @click="updateHeaderHeight(80)" class="btn">80px</button>
  <button @click="updateHeaderHeight(120)" class="btn">120px</button>
  <button @click="updateHeaderHeight(160)" class="btn">160px</button>
</div>
-->
</template>