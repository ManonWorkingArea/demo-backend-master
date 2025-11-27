<script>
import storageManager from '@/plugins/storage';
import Builder              from '@/interface/template/MainBuilderContainer.vue';

export default {
    data() {
      return {
		configs: storageManager.get('configs'),
        session: storageManager.get('session'),
		dataItem: this.$route.params.id,
        accessSession: [],
        selectSession: false,
        rows: [],
      }
    },
    components: {
		Builder
    },
    methods: {
		changeSession() {
			this.selectSession = true;
		},
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
		// async updateData(layout) {
		// 	try {
		// 		const requestBody = {
		// 		data: {
		// 			builder: layout.builder,
		// 		},
		// 		options: {}
		// 		};

		// 		const { data, status } = await this.$Request.PUT(`post/${this.post._id}`, requestBody, this.configs.key);
		// 		console.log(data);

		// 		if(status === 200) {
		// 		this.$swal({
		// 			toast: true,
		// 			position: 'bottom-end',
		// 			showConfirmButton: false,
		// 			timer: 3000,
		// 			icon: 'success',
		// 			title: 'บันทึกข้อมูลหน้าเว็บ',
		// 			text: 'บันทึกข้อมูลสำหรับหน้าเว็บนี้ สำเร็จแล้ว',
		// 		});
		// 		}
		// 	} catch (error) {
		// 		console.error(error);
		// 	}
		// },
		async updateData(layout) {
			console.log('Debug updateData, layout:', layout);
			this.$swal({
				toast: true,
				position: 'bottom-end',
				showConfirmButton: false,
				timer: 3000,
				icon: 'info',
				title: 'Debug Mode',
				text: 'updateData ถูกเรียกใช้งาน (dummy function)',
			});
			// Simulate successful update
			return Promise.resolve({ status: 200, data: { message: 'Debug update successful' } });
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
	<div>
		<Builder 
		@update-layout="updateData" 
		:builderData="this.rows"
		:getBuilder="getData"
		:backUrl="'/cms/pages/'"
		/>
	</div>
</template>