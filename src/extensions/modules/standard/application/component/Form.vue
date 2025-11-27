<script>
import storageManager from '@/plugins/storage';
import Builder              from '@/interface/template/Builder.vue';

export default {
    data() {
      return {
		configs: storageManager.get('configs'),
        session: storageManager.get('session'),
		dataItem: this.$route.params.slug,
        accessSession: [],
        selectSession: false,
        rows: [],
		formData:[],
		applicationData:[],
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
			if (storageManager.get('session', 'login')) {
			try {
				this.activeBlock = true
				let item = this.$route.params.id;
				let form = this.$route.params.form;

				const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/application/" + item, {
				method: 'GET',
				headers: { 'Content-Type': 'application/json' ,'client-token-key':this.configs.key},
				});

				const RestReturn = await resAPI.json();

				if (Array.isArray(RestReturn.form)) {
				this.formData = RestReturn.form.find((item) => item.name === form);
				} else {
				// Handle the case when RestReturn.form is not an array
				console.error("RestReturn.form is not an array");
				}
				this.applicationData = RestReturn
				console.log(this.formData);
				this.rows = this.formData;
				this.$swal({
				toast: true,
				position: 'bottom-end',
				showConfirmButton: false,
				timer: 3000,
				icon: 'success',
				title: 'ดึงข้อมูลหน้าเว็บ',
				text: 'ดึงข้อมูลหน้าเว็บนี้ สำเร็จแล้ว',
				});
				this.activeBlock = false
				return this.rows;

			} catch (error) {
			console.log(error)
			}
			}
		},
		async updateData(layout) {
			try {
			// Find the form with the name "4gfqweg" and update its builder
			// Find the form with the name "4gfqweg" and update its builder
			let form = this.$route.params.form;
			this.applicationData.form = this.applicationData.form.map((item) => {
			if (item.name === form) {
				return {
				...item,
				builder: layout // Assuming `layout` holds the updated builder data
				};
			}
			return item;
			});

			console.log(this.applicationData.form)
			// Perform the API request to update the data
			const response = await fetch(`https://gateway.cloudrestfulapi.com/api/application/${this.$route.params.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json','client-token-key':this.configs.key
			},
			body: JSON.stringify({
				data: {
				form: this.applicationData.form
				}
			})
			});
			const data = await response.json();
			console.log(data);

			if(response.status===200) {
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
	<div>
		<Builder 
		@update-layout="updateData" 
		:builderData="this.rows"
		:getBuilder="getData"
		:backUrl="'/application/view/'+this.$route.params.id"
		/>
	</div>
</template>