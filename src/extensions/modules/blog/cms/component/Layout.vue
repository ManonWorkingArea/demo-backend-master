<script>
import storageManager from '@/plugins/storage';
export default {
    data() {
      return {
		configs: storageManager.get('configs'),
        session: storageManager.get('session'),
		dataItem: this.$route.params.id,
        accessSession: [],
        rows: [],
        activeTab: 0,
        tabs: [
          { name: 'แท็บ 1', content: 'เนื้อหาแท็บ 1' },
          { name: 'แท็บ 2', content: 'เนื้อหาแท็บ 2' },
          { name: 'แท็บ 3', content: 'เนื้อหาแท็บ 3' },
          { name: 'แท็บ 4', content: 'เนื้อหาแท็บ 4' },
        ],
      }
    },
    methods: {
		async getData() {
			try {
				const { data } = await this.$Request.GET(`post/${this.dataItem}`, this.configs.key);
				const pageLayout = data;
				const savedLayout = data;
				this.$setPageTitle(data.title);
				if (savedLayout) {
				this.rows = savedLayout;
				this.post = pageLayout;
				}
			} catch (error) {
				console.log(error);
			}
		},
		async updateData(layout) {
			try {
				const requestBody = {
				data: {
					builder: layout,
				},
				options: {}
				};
				const { data, status } = await this.$Request.PUT(`post/${this.post._id}`, requestBody, this.configs.key);
				console.log(data);

				if(status === 200) {
				this.$swal({
					toast: true,
					position: 'bottom-end',
					showConfirmButton: false,
					timer: 3000,
					icon: 'success',
					title: 'บันทึกข้อมูลหน้าเว็บ',
					text: 'บันทึกข้อมูลสำหรับหน้าเว็บนี้ สำเร็จแล้ว',
				});
				}
			} catch (error) {
				console.error(error);
			}
		},
	},
  async mounted () {
    try {
		this.accessSession  = storageManager.get('session','current');
		await this.getData();
    } catch (error) {
      console.log(Error);
    }
  },
  setup() {},
};
</script>

<template>
	<div class="p-4">
		<div class="flex border-b border-gray-300">
			<div v-for="(tab, index) in tabs" :key="index" @click="activeTab = index" :class="{ 'border-b-2 border-blue-500': activeTab === index }" class="cursor-pointer py-2 px-4 text-gray-600 hover:text-blue-500">
				{{ tab.name }}
			</div>
		</div>
		<div class="mt-4 p-4 bg-gray-100 rounded-lg shadow">
			{{ tabs[activeTab].content }}
		</div>
	</div>
</template>