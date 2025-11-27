<script>

// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import storageManager from '@/plugins/storage';
import moment from 'moment';
moment().format();

export default {
    data() {
      return {
        login: storageManager.get('session','login'),
        configs: storageManager.get('configs'),
        session: storageManager.get('session'),
        assetData: [],
        userApply: [],
        dataItem: this.$route.params.id,
        loading_sources: true,
        documentTypeOptions: ['.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx', '.pdf', '.xls', '.xlsx'],
        isFormOpen: false,
        formTitle: '',
        formAction: '',
        form: {
          name: '',
          slug: '',
          description: '',
        },
        editIndex: -1,
        currentSection: '',
        sections: ['status', 'form', 'document']
      }
    },
    components: {
      Loader
    },
    methods: {

      updateDocumentType() {
      if (this.form.documentType.length > 1) {
        this.form.documentType = [this.form.documentType[this.form.documentType.length - 1]];
      }
    },

      capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
      },

      closeForm() {
        this.isFormOpen = false;
      },

      openForm(action, section) {
        this.isFormOpen = true;
        this.currentSection = section;

        if (action === 'add') {
          this.formTitle = 'Add Item';
          this.formAction = 'Add';

          if (section === 'form') {
            this.form = {
              name: '',
              slug: '',
              description: '',
              type: 'form',
              default: false,
              builder: [],
            };
          } else {
            this.form = {
              name: '',
              slug: '',
              description: '',
              default: false,
            };
          }
        } else if (action === 'edit') {
          this.formTitle = 'Edit Item';
          this.formAction = 'Save';
        }
      },

      saveItem() {
        if (this.formAction === 'Add') {
          this.assetData[this.currentSection].push({ ...this.form });
        } else if (this.formAction === 'Save') {
          this.assetData[this.currentSection][this.editIndex] = { ...this.form };
        }
        this.updateData();
        this.isFormOpen = false;
      },

      editItem(index, section) {
        this.openForm('edit', section);
        this.form = { ...this.assetData[section][index] };
        this.editIndex = index;
      },

      removeItem(index, section) {
        this.assetData[section].splice(index, 1);
        this.updateData();
      },

      moveItemUp(index, section) {
        if (index > 0) {
          this.swapItems(index, index - 1, section);
        }
      },

      moveItemDown(index, section) {
        if (index < this.assetData[section].length - 1) {
          this.swapItems(index, index + 1, section);
        }
      },

      swapItems(index1, index2, section) {
        [this.assetData[section][index1], this.assetData[section][index2]] = [this.assetData[section][index2], this.assetData[section][index1]];
        this.updateData();
      },

      makeDefault(index, section) {
        if (section === 'form') {
          this.assetData.form.forEach((item, i) => {
            if (i === index) {
              item.default = true;
            } else {
              item.default = false;
            }
          });
        } else if (section === 'status') {
          this.assetData.status.forEach((item, i) => {
            if (i === index) {
              item.default = true;
            } else {
              item.default = false;
            }
          });
        } else if (section === 'document') {
          this.assetData.document.forEach((item, i) => {
            if (i === index) {
              item.default = true;
            } else {
              item.default = false;
            }
          });
        }
        this.updateData();
      },

      dateTime(value) {
        return moment(value).format("DD/MM/YYYY hh:mm:ss");
      },
      async getUserData() {
        if(storageManager.get('session','login')) {
          try {
            this.loading_sources  = false;
            const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/apply/query", {
                  method: 'POST',
                  headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                  body: JSON.stringify({
                      method: 'find',
                      args: [
                      {
                        $and: [
                          { 
                            userID: this.session.userID,
                            applicationID: this.dataItem
                          }
                        ]
                      }
                      ]
                  })
              });

              const RestReturn   = await resAPI.json();
            if(resAPI.status === 200) {
                return RestReturn[0];
            }
            this.loading_sources = true;
          } catch (error) {
            console.log(error)
          }
        }
      },
      async getData() {
        if(storageManager.get('session','login')) {
          try {
            let item              = this.$route.params.id;
            this.loading_sources  = false;
            const resAPI          = await fetch("https://gateway.cloudrestfulapi.com/api/application/" + item,
            {
              method: 'GET',
              headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
            });

            const RestReturn   = await resAPI.json();
            console.log("RestReturn",RestReturn);

            if(resAPI.status === 200) {
              this.assetData   = RestReturn;
              this.userApply   = await this.getUserData();

              console.log(this.userApply);
              this.loading_sources  = true;
            }
            this.loading_sources = true;

          } catch (error) {
            console.log(error)
          }
        }
      },
      async updateData() {
        try {
          const response = await fetch('https://gateway.cloudrestfulapi.com/api/application/' + this.assetData._id, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json','client-token-key':this.configs.key
            },
            body: JSON.stringify({
              data: {
                form: this.assetData.form,
                document: this.assetData.document,
                status: this.assetData.status,
              },
              options: {}
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
      async applyApplication() {
        let finalRes = null;
        if (this.login) {
          try {
            this.activeBlock = true;

            const statusItem = this.assetData.status.find(item => item.firstItem === true);
            console.log(statusItem);
            
            const registerIndex = this.assetData.status.findIndex((status) => status.slug === statusItem.slug);

            if (registerIndex !== -1 && registerIndex < this.assetData.status.length - 1) {
              const nextStatus = this.assetData.status
              .slice(registerIndex + 1)
              .find((status) => status.submit === true && status.action === 'user');
              console.log("Next status:", nextStatus);
              const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/apply/", {
                method: 'POST',
                headers: {'Content-Type': 'application/json','client-token-key':this.configs.key},
                body: JSON.stringify({
                  data: {
                    "userID":this.session.userID,
                    "applicationID":this.dataItem,
                    "form":[],
                    "document":[],
                    "assign":false,
                    "status":statusItem.slug,
                    "next": nextStatus ? nextStatus.slug : undefined,
                  },
                  options: {}
                })
              });

              finalRes = await resAPI.json();
              console.log("finalRes", finalRes);

              if (resAPI.status === 200) {
                this.activeBlock = false;

                this.$swal({
                  icon: 'success',
                  title: 'ลงทะเบียนเรียบร้อยแล้ว',
                  text: 'ระบบกำลังดึงข้อมูลหลักสูตรของคุณ กรุณารอสักครู่',
                  showCancelButton: false,
                  confirmButtonText: 'OK',
                }).then(() => {
                  this.userApply = finalRes
                });
              }
            } else {
              console.log("No status found after 'register'.");
            }
          } catch (error) {
            console.log(error)
          }
        }
        else
        {
          console.log("not Logic");
        }
      },
      async actionApplication(doStatus) {
        try {
          const currentIndex = this.assetData.status.findIndex(status => status.slug === doStatus);
          const nextStatus = this.assetData.status.slice(currentIndex + 1).find(status => status.slug !== doStatus && status.action === 'user');
          if (nextStatus) {
            console.log("Next status:", nextStatus);
          } else {
            console.log("No next status found.");
          }
          const resAPI = await fetch("https://gateway.cloudrestfulapi.com/api/apply/" + this.userApply._id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json','client-token-key':this.configs.key },
            body: JSON.stringify({
              data: {
                "status": doStatus,
                "next": nextStatus ? nextStatus.slug : '',
              },
              options: {}
            })
          });

          const finalRes = await resAPI.json();
          console.log("finalRes", finalRes);
          this.userApply = finalRes

        } catch (error) {
          console.log(error);
        }
      },
      updated() {
        feather.replace();
      },
    },
    async mounted () {
      try {
        await this.getData();
      } catch (error) {
        console.log(Error);
      }
    },
    setup() {
      //console.log("Setup");
    },
    computed: {
    firstStatusItem() {
      if (this.assetData.status && this.assetData.status.length > 0) {
        return this.assetData.status[0].slug;
      }
      return null; // or any other default value you prefer
    },
    getNextStatusName() {
      const currentIndex = this.assetData.status.findIndex(status => status.slug === this.userApply.next);
      if (currentIndex !== -1 && currentIndex < this.assetData.status.length - 1) {
        return this.assetData.status[currentIndex].name;
      } else {
        return '';
      }
    }
  },
  watch: {
    userApply(newValue) {
      console.log('userApply updated:', newValue);
    },
  },

};
</script>

<template>

  <div v-if="!loading_sources" class="text-center"><Loader/></div>

  <nav class="flex border-b border-gray-200 bg-white" aria-label="Breadcrumb">
    <ol role="list" class="mx-auto flex w-full max-w-screen-xl space-x-4 px-4 sm:px-6 lg:px-8">
      <li class="flex">
        <div class="flex items-center">
          <a href="#" class="text-gray-400 hover:text-gray-500">
            <svg class="h-5 w-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
            </svg>
            <span class="sr-only">Home</span>
          </a>
        </div>
      </li>
      <li class="flex">
        <div class="flex items-center">
          <svg class="h-full w-6 flex-shrink-0 text-gray-200" viewBox="0 0 24 44" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
            <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
          </svg>
          <router-link :to="'/application/home/'" class=" ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            แบบฟอร์มทั้งหมด
          </router-link>
        </div>
      </li>
      <li class="flex">
        <div class="flex items-center">
          <svg class="h-full w-6 flex-shrink-0 text-gray-200" viewBox="0 0 24 44" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
            <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
          </svg>
          <router-link :to="'/application/view/' + assetData._id" class=" ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
            {{assetData.name}}
          </router-link>
        </div>
      </li>
      <li class="flex">
        <div class="flex items-center">
          <svg class="h-full w-6 flex-shrink-0 text-gray-200" viewBox="0 0 24 44" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">
            <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
          </svg>
          <a href="#" class="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700" aria-current="page">แบบฟอร์ม A</a>
        </div>
      </li>
    </ol>
  </nav>
  
<div class="bg-gray-50">

	<main class="mx-auto max-w-2xl pb-24 pt-4 sm:px-6 sm:pt-8 lg:max-w-7xl lg:px-8">
	<div class="space-y-2 px-4 sm:flex sm:items-baseline sm:justify-between sm:space-y-0 sm:px-0">
		<div class="flex sm:items-baseline sm:space-x-4">
		<h1 class="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">แบบฟอร์ม #{{userApply._id}}</h1>
		</div>
		<p class="text-sm text-gray-600">ลงทะเบียนเมื่อ <time datetime="2021-03-22" class="font-medium text-gray-900">March 22, 2021</time></p>
	</div>

	<ul role="list" class="mt-8 grid grid-cols-1 gap-x-3 gap-y-3 lg:grid-cols-4 xl:gap-x-3">
		<li class="bg-white overflow-hidden rounded-xl border border-gray-200">
			<div class="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-3">
			<div class="text-sm font-bold leading-6 text-gray-900">From A</div>
			</div>
			<dl class="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
			<div class="flex justify-between gap-x-4 py-3">
				<dt class="text-gray-500">Last invoice</dt>
				<dd class="text-gray-700"><time datetime="2022-12-13">December 13, 2022</time></dd>
			</div>
			<div class="flex justify-between gap-x-4 py-3">
				<dt class="text-gray-500">Amount</dt>
				<dd class="flex items-start gap-x-2">
				<div class="font-medium text-gray-900">$2,000.00</div>
				<div class="rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset text-red-700 bg-red-50 ring-red-600/10">Overdue</div>
				</dd>
			</div>
			</dl>
		</li>
		<li class="bg-white overflow-hidden rounded-xl border border-gray-200">
			<div class="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-3">
			<div class="text-sm font-bold leading-6 text-gray-900">Form B</div>
			</div>
			<dl class="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
			<div class="flex justify-between gap-x-4 py-3">
				<dt class="text-gray-500">Last invoice</dt>
				<dd class="text-gray-700"><time datetime="2023-01-22">January 22, 2023</time></dd>
			</div>
			<div class="flex justify-between gap-x-4 py-3">
				<dt class="text-gray-500">Amount</dt>
				<dd class="flex items-start gap-x-2">
				<div class="font-medium text-gray-900">$14,000.00</div>
				<div class="rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset text-green-700 bg-green-50 ring-green-600/20">Paid</div>
				</dd>
			</div>
			</dl>
		</li>
		<li class="bg-white overflow-hidden rounded-xl border border-gray-200">
			<div class="flex items-center gap-x-4 border-b border-gray-900/5 bg-gray-50 p-3">
			<div class="text-sm font-bold leading-6 text-gray-900">Form C</div>
			</div>
			<dl class="-my-3 divide-y divide-gray-100 px-6 py-4 text-sm leading-6">
			<div class="flex justify-between gap-x-4 py-3">
				<dt class="text-gray-500">Last invoice</dt>
				<dd class="text-gray-700"><time datetime="2023-01-23">January 23, 2023</time></dd>
			</div>
			<div class="flex justify-between gap-x-4 py-3">
				<dt class="text-gray-500">Amount</dt>
				<dd class="flex items-start gap-x-2">
				<div class="font-medium text-gray-900">$7,600.00</div>
				<div class="rounded-md py-1 px-2 text-xs font-medium ring-1 ring-inset text-green-700 bg-green-50 ring-green-600/20">Paid</div>
				</dd>
			</div>
			</dl>
		</li>
	</ul>

    <section aria-labelledby="products-heading" class="mt-6">
      <h2 id="products-heading" class="sr-only">Products purchased</h2>

      <div class="space-y-8">
        <div class="border-b border-t border-gray-200 bg-white shadow-sm sm:rounded-lg sm:border">


			<form class="px-4 py-6 sm:px-6 lg:p-8">
				<div class="space-y-12">
					<div class="border-b border-gray-900/10 pb-12">
					<h2 class="text-base font-semibold leading-7 text-gray-900">Profile</h2>
					<p class="mt-1 text-sm leading-6 text-gray-600">This information will be displayed publicly so be careful what you share.</p>
			
					<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
						<div class="sm:col-span-4">
						<label for="username" class="block text-sm font-medium leading-6 text-gray-900">Username</label>
						<div class="mt-2">
							<div class="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
							<span class="flex select-none items-center pl-3 text-gray-500 sm:text-sm">workcation.com/</span>
							<input type="text" name="username" id="username" autocomplete="username" class="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6" placeholder="janesmith">
							</div>
						</div>
						</div>
			
						<div class="col-span-full">
						<label for="about" class="block text-sm font-medium leading-6 text-gray-900">About</label>
						<div class="mt-2">
							<textarea id="about" name="about" rows="3" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"></textarea>
						</div>
						<p class="mt-3 text-sm leading-6 text-gray-600">Write a few sentences about yourself.</p>
						</div>
			
						<div class="col-span-full">
						<label for="photo" class="block text-sm font-medium leading-6 text-gray-900">Photo</label>
						<div class="mt-2 flex items-center gap-x-3">
							<svg class="h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
							<path fill-rule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clip-rule="evenodd" />
							</svg>
							<button type="button" class="rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Change</button>
						</div>
						</div>
			
						<div class="col-span-full">
						<label for="cover-photo" class="block text-sm font-medium leading-6 text-gray-900">Cover photo</label>
						<div class="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
							<div class="text-center">
							<svg class="mx-auto h-12 w-12 text-gray-300" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
								<path fill-rule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clip-rule="evenodd" />
							</svg>
							<div class="mt-4 flex text-sm leading-6 text-gray-600">
								<label for="file-upload" class="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
								<span>Upload a file</span>
								<input id="file-upload" name="file-upload" type="file" class="sr-only">
								</label>
								<p class="pl-1">or drag and drop</p>
							</div>
							<p class="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
							</div>
						</div>
						</div>
					</div>
					</div>
			
					<div class="border-b border-gray-900/10 pb-12">
					<h2 class="text-base font-semibold leading-7 text-gray-900">Personal Information</h2>
					<p class="mt-1 text-sm leading-6 text-gray-600">Use a permanent address where you can receive mail.</p>
			
					<div class="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
						<div class="sm:col-span-3">
						<label for="first-name" class="block text-sm font-medium leading-6 text-gray-900">First name</label>
						<div class="mt-2">
							<input type="text" name="first-name" id="first-name" autocomplete="given-name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
						</div>
						</div>
			
						<div class="sm:col-span-3">
						<label for="last-name" class="block text-sm font-medium leading-6 text-gray-900">Last name</label>
						<div class="mt-2">
							<input type="text" name="last-name" id="last-name" autocomplete="family-name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
						</div>
						</div>
			
						<div class="sm:col-span-4">
						<label for="email" class="block text-sm font-medium leading-6 text-gray-900">Email address</label>
						<div class="mt-2">
							<input id="email" name="email" type="email" autocomplete="email" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
						</div>
						</div>
			
						<div class="sm:col-span-3">
						<label for="country" class="block text-sm font-medium leading-6 text-gray-900">Country</label>
						<div class="mt-2">
							<select id="country" name="country" autocomplete="country-name" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:max-w-xs sm:text-sm sm:leading-6">
							<option>United States</option>
							<option>Canada</option>
							<option>Mexico</option>
							</select>
						</div>
						</div>
			
						<div class="col-span-full">
						<label for="street-address" class="block text-sm font-medium leading-6 text-gray-900">Street address</label>
						<div class="mt-2">
							<input type="text" name="street-address" id="street-address" autocomplete="street-address" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
						</div>
						</div>
			
						<div class="sm:col-span-2 sm:col-start-1">
						<label for="city" class="block text-sm font-medium leading-6 text-gray-900">City</label>
						<div class="mt-2">
							<input type="text" name="city" id="city" autocomplete="address-level2" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
						</div>
						</div>
			
						<div class="sm:col-span-2">
						<label for="region" class="block text-sm font-medium leading-6 text-gray-900">State / Province</label>
						<div class="mt-2">
							<input type="text" name="region" id="region" autocomplete="address-level1" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
						</div>
						</div>
			
						<div class="sm:col-span-2">
						<label for="postal-code" class="block text-sm font-medium leading-6 text-gray-900">ZIP / Postal code</label>
						<div class="mt-2">
							<input type="text" name="postal-code" id="postal-code" autocomplete="postal-code" class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6">
						</div>
						</div>
					</div>
					</div>
			
					<div class="border-b border-gray-900/10 pb-12">
					<h2 class="text-base font-semibold leading-7 text-gray-900">Notifications</h2>
					<p class="mt-1 text-sm leading-6 text-gray-600">We'll always let you know about important changes, but you pick what else you want to hear about.</p>
			
					<div class="mt-10 space-y-10">
						<fieldset>
						<legend class="text-sm font-semibold leading-6 text-gray-900">By Email</legend>
						<div class="mt-6 space-y-6">
							<div class="relative flex gap-x-3">
							<div class="flex h-6 items-center">
								<input id="comments" name="comments" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
							</div>
							<div class="text-sm leading-6">
								<label for="comments" class="font-medium text-gray-900">Comments</label>
								<p class="text-gray-500">Get notified when someones posts a comment on a posting.</p>
							</div>
							</div>
							<div class="relative flex gap-x-3">
							<div class="flex h-6 items-center">
								<input id="candidates" name="candidates" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
							</div>
							<div class="text-sm leading-6">
								<label for="candidates" class="font-medium text-gray-900">Candidates</label>
								<p class="text-gray-500">Get notified when a candidate applies for a job.</p>
							</div>
							</div>
							<div class="relative flex gap-x-3">
							<div class="flex h-6 items-center">
								<input id="offers" name="offers" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600">
							</div>
							<div class="text-sm leading-6">
								<label for="offers" class="font-medium text-gray-900">Offers</label>
								<p class="text-gray-500">Get notified when a candidate accepts or rejects an offer.</p>
							</div>
							</div>
						</div>
						</fieldset>
						<fieldset>
						<legend class="text-sm font-semibold leading-6 text-gray-900">Push Notifications</legend>
						<p class="mt-1 text-sm leading-6 text-gray-600">These are delivered via SMS to your mobile phone.</p>
						<div class="mt-6 space-y-6">
							<div class="flex items-center gap-x-3">
							<input id="push-everything" name="push-notifications" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600">
							<label for="push-everything" class="block text-sm font-medium leading-6 text-gray-900">Everything</label>
							</div>
							<div class="flex items-center gap-x-3">
							<input id="push-email" name="push-notifications" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600">
							<label for="push-email" class="block text-sm font-medium leading-6 text-gray-900">Same as email</label>
							</div>
							<div class="flex items-center gap-x-3">
							<input id="push-nothing" name="push-notifications" type="radio" class="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-600">
							<label for="push-nothing" class="block text-sm font-medium leading-6 text-gray-900">No push notifications</label>
							</div>
						</div>
						</fieldset>
					</div>
					</div>
				</div>
			
				<div class="mt-6 flex items-center justify-end gap-x-6">
					<button type="button" class="text-sm font-semibold leading-6 text-gray-900">Cancel</button>
					<button type="submit" class="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">Save</button>
				</div>
				</form>

        </div>
        
      </div>
    </section>

    
    
  </main>
</div>


</template>