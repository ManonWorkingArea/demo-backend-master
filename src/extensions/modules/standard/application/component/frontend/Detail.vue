<script>

// Component
import feather from 'feather-icons';
import Loader from '@/interface/template/Loader.vue';
import Breadcrumbs from '@/interface/template/outline/Breadcrumbs.vue';
import storageManager from '@/plugins/storage';
import moment from 'moment';
moment().format();

export default {
    data() {
      return {
        configs: storageManager.get('configs'),
        assetData: [],
        schoolAdmin: [],
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
      Loader,Breadcrumbs
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
},

};
</script>

<template>

  <div v-if="!loading_sources" class="text-center"><Loader/></div>

  <breadcrumbs v-if="loading_sources"
  :navigation="
  [
    {
      name: 'ย้อนกลับ',
      link: '/application/dashboard',
      style: 'chevron-left'
    }
  ]"
  /> 

  <div v-if="showFormPopup" class="fixed inset-0 z-10 flex items-center justify-center">
    <div class="fixed inset-0 bg-gray-900 opacity-50"></div>
    <div class="bg-white rounded-lg shadow-lg p-6">
      <h2 class="text-lg font-medium mb-4">{{ formTitle }}</h2>
      
      <!-- Add/Edit form fields -->
      <!-- Replace the following input fields with your actual form fields -->
      <div class="mb-4">
        <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
        <input type="text" id="name" v-model="formData.name" class="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md">
      </div>
      
      <!-- Add/Edit buttons -->
      <div class="flex justify-end">
        <button @click="saveForm" class="px-4 py-2 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md">Save</button>
        <button @click="cancelForm" class="ml-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300 rounded-md">Cancel</button>
      </div>
    </div>
  </div>

  <div v-if="loading_sources" class="mt-8 mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
    
    <div class="flex items-center space-x-5">
      <div class="flex-shrink-0">
        <div class="relative">
          <img class="h-16" :src="assetData.loginLogo" alt="">
          <span class="absolute inset-0" aria-hidden="true"></span>
        </div>
      </div>
      <div>
        <h1 class="text-2xl font-bold text-gray-900">{{ this.assetData.siteName }}</h1>
        <p class="text-sm font-medium text-gray-500">
          Update at <font-awesome-icon :icon="['fas','calendar']"/> <span class="pl-1">{{ this.assetData.updatedAt }}</span>
        </p>
      </div>
    </div>

    <div class="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
      
      <button 
      @click="$router.push('/institution/edit/' + this.dataItem)"
      type="button" 
      class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
      <font-awesome-icon :icon="['fas','pencil']" class="text-black text-[12px] mr-2"/> แก้ไขข้อมูล
      </button>

      <button
      @click="$router.push('/institution/admin/'+this.dataItem)"
      type="button" 
      class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
      <font-awesome-icon :icon="['fas','user-tie']" class="text-black text-[12px] mr-2"/> เลือกผู้ดูแลระบบ
      </button>

      <button 
      type="button" 
      class="inline-flex items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-100">
      <font-awesome-icon :icon="['fas','trash']" class="text-black text-[12px] mr-2"/> ลบ
      </button>

    </div>
  </div>

  <div v-if="loading_sources" class="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
    <div class="space-y-6 lg:col-span-2 lg:col-start-1">
    
      <div>
        <section v-for="section in sections" :key="section" :aria-labelledby="`${section}-title`" class="mb-5">
          <div class="bg-white shadow sm:overflow-hidden sm:rounded-lg">
            <div class="divide-y divide-gray-200">
              <div class="px-4 py-5 sm:px-6">
                <h2 :id="`${section}-title`" class="text-lg font-medium text-gray-900">{{ capitalizeFirstLetter(section) }}</h2>
              </div>
              <div class="px-4 py-6 sm:px-6">
              </div>
            </div>
    
            <div>
              <ul role="list" class="space-y-8">
                <li v-for="(item, index) in assetData[section]" :key="index">
                  <div>

                    <template v-if="section === 'form'">
                      <div class="text-sm">
                        <a href="#" class="font-medium text-gray-900">{{ item.name }}</a>
                      </div>
                      <div class="mt-1 text-sm text-gray-700">
                        <p>{{ item.description }}</p>
                        <p>{{ item.test }}</p>
                        <p>{{ item.default }}</p>
                      </div>
                    </template>

                    <template v-else-if="section === 'status'">
                      <div class="text-sm">
                        <a href="#" class="font-medium text-gray-900">{{ item.name }}</a>
                      </div>
                      <div class="mt-1 text-sm text-gray-700">
                        <p>{{ item.description }}</p>
                        <p>{{ item.default }}</p>
                        <p>{{ item.test }}</p>
                      </div>
                    </template>

                    <template v-else-if="section === 'document'">
                      <div class="text-sm">
                        <a href="#" class="font-medium text-gray-900">{{ item.name }}</a>
                      </div>
                      <div class="mt-1 text-sm text-gray-700">
                        <p>{{ item.description }}</p>
                        <p>{{ item.default }}</p>
                        <p>{{ item.test }}</p>
                      </div>
                    </template>

                    <div class="mt-2 space-x-2 text-sm">
                      <template v-if="section === 'form'">

                        <router-link :to="'/application/form/' + this.dataItem + '/' + item.name" class="text-gray-900 hover:text-gray-500 text-md font-medium">
                          <font-awesome-icon :icon="['fas','pencil']" class="text-black mt-[3px] mr-2 text-md"/>
                          <span>Builder</span>
                        </router-link>
                        
                        <span class="font-medium text-gray-500">&middot;</span>
                      </template>

                      <button type="button" class="font-medium text-gray-900" @click="editItem(index, section)">Edit</button>
                      <span class="font-medium text-gray-500">&middot;</span>
                      <button type="button" class="font-medium text-red-600" @click="removeItem(index, section)">Remove</button>
                      <span class="font-medium text-gray-500">&middot;</span>
                      <button type="button" class="font-medium text-blue-600" :disabled="index === 0" @click="moveItemUp(index, section)">Move Up</button>
                      <span class="font-medium text-gray-500">&middot;</span>
                      <button type="button" class="font-medium text-blue-600" :disabled="index === assetData[section].length - 1" @click="moveItemDown(index, section)">Move Down</button>
                      <span class="font-medium text-gray-500">&middot;</span>
                      <button type="button" class="font-medium text-green-600" @click="makeDefault(index, section)">Make Default</button>
                    </div>

                  </div>
                </li>
              </ul>
              
              <div v-if="isFormOpen && currentSection === section" class="fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <div class="w-[600] bg-white p-4 rounded-lg">
                  <h2 class="text-lg font-medium mb-4">{{ formTitle }}</h2>
                  <form @submit.prevent="saveItem">
                    <div class="mb-4">
                      <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                      <input type="text" id="name" v-model="form.name" class="mt-1 p-2 border border-gray-300 rounded-md w-full" required>
                    </div>
                    <div class="mb-4">
                      <label for="slug" class="block text-sm font-medium text-gray-700">Slug</label>
                      <input type="text" id="slug" v-model="form.slug" class="mt-1 p-2 border border-gray-300 rounded-md w-full" required>
                    </div>
                    <div class="mb-4">
                      <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                      <textarea id="description" v-model="form.description" class="mt-1 p-2 border border-gray-300 rounded-md w-full" required></textarea>
                    </div>
    
                    <template v-if="section === 'form'">
                      <div class="grid grid-cols-3 gap-4">
                        <div>
                          <div class="mb-4">
                            <label for="test" class="block text-sm font-medium text-gray-700">Test</label>
                            <input type="text" id="test" v-model="form.test" class="mt-1 p-2 border border-gray-300 rounded-md w-full" required>
                          </div>
                        </div>
                        <div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Form Display</label>
                            <input type="checkbox" v-model="form.display">
                          </div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Form Layout</label>
                            <input type="checkbox" v-model="form.layout">
                          </div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Form Report</label>
                            <input type="checkbox" v-model="form.report">
                          </div>
                        </div>
                        <div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Form Editor</label>
                            <label class="inline-flex items-center">
                              <input type="radio" v-model="form.editor" value="user">
                              <span class="ml-2">User</span>
                            </label>
                            <label class="inline-flex items-center">
                              <input type="radio" v-model="form.editor" value="external">
                              <span class="ml-2">External</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </template>
                    
    
                    <template v-else-if="section === 'status'">
                      <div class="grid grid-cols-3 gap-4">
                        <div class="col-span-1">
                          <div class="mb-4">
                            <label for="status-icon" class="block text-sm font-medium text-gray-700">Icon</label>
                            <select id="status-icon" v-model="form.icon" class="mt-1 p-2 border border-gray-300 rounded-md w-full">
                              <option value="">Select an icon</option>
                              <option value="fas fa-check">Check</option>
                              <option value="fas fa-times">Times</option>
                              <option value="fas fa-star">Star</option>
                              <option value="fas fa-heart">Heart</option>
                              <!-- Add more options for other Font Awesome icons -->
                            </select>
                            
                            <i v-show="form.icon" :class="form.icon"></i>
                          </div>
                          <div class="mb-4">
                            <label for="status-color" class="block text-sm font-medium text-gray-700">Color</label>
                            <input type="color" id="status-color" v-model="form.color" class="mt-1 p-2 border border-gray-300 rounded-md w-full">
                          </div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Status Request</label>
                            <input type="checkbox" v-model="form.request">
                          </div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Status Display</label>
                            <input type="checkbox" v-model="form.display">
                          </div>
                        </div>
                        <div class="col-span-1">
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Status First Item</label>
                            <input type="checkbox" v-model="form.firstItem">
                          </div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Status Default Item (Admin)</label>
                            <input type="checkbox" v-model="form.defaultItem">
                          </div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Status Form Submit</label>
                            <input type="checkbox" v-model="form.submit">
                          </div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Status Comment</label>
                            <input type="checkbox" v-model="form.comment">
                          </div>
                        </div>

                        <div class="col-span-1">
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Status Action</label>
                            <label class="inline-flex items-center">
                              <input type="radio" v-model="form.action" value="user">
                              <span class="ml-2">User</span>
                            </label>
                            <label class="inline-flex items-center">
                              <input type="radio" v-model="form.action" value="linkage">
                              <span class="ml-2">Linkage</span>
                            </label>
                          </div>
                        </div>

                        <div class="col-span-1">
                          
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Status Approve</label>
                            <input type="checkbox" v-model="form.approve">
                          </div>

                          <template v-if="form.approve">
                            <div class="mb-4">
                              <label for="status-approve-type" class="block text-sm font-medium text-gray-700">Approve Type</label>
                              <select id="status-approve-type" v-model="form.approveType" class="mt-1 p-2 border border-gray-300 rounded-md w-full">
                                <option value="">Select a type</option>
                                <option value="user">User</option>
                                <option value="application">Application</option>
                              </select>
                            </div>
                          
                            <template v-if="form.approveType === 'user'">
                              <div class="mb-4">
                                <label for="status-approve-type-condition" class="block text-sm font-medium text-gray-700">Approve Type Condition</label>
                                <select id="status-approve-type-condition" v-model="form.approveTypeCondition" class="mt-1 p-2 border border-gray-300 rounded-md w-full">
                                  <option value="">Select a condition</option>
                                  <option value="consult">Consult</option>
                                  <option value="validator">Validator</option>
                                </select>
                              </div>
                            </template>
                          
                            <template v-else-if="form.approveType === 'application'">
                              <div class="mb-4">
                                <label for="status-approve-type-condition" class="block text-sm font-medium text-gray-700">Approve Type Condition</label>
                                <select id="status-approve-type-condition" v-model="form.approveTypeCondition" class="mt-1 p-2 border border-gray-300 rounded-md w-full">
                                  <option value="">Select a condition</option>
                                  <option value="approve">Approve</option>
                                  <option value="reject">Reject</option>
                                </select>
                              </div>
                            </template>
                          
                            <div v-if="form.approveTypeCondition === 'consult' || form.approveTypeCondition === 'approve' || form.approveTypeCondition === 'validator'" class="mb-4">
                              <label class="block text-sm font-medium text-gray-700">Status Certification</label>
                              <input type="checkbox" v-model="form.certification">
                            </div>
                          </template>
                          
                          

                        </div>
                      </div>
                    </template>
                    
                    
    
                    <template v-else-if="section === 'document'">
                      <div class="grid grid-cols-3 gap-4">
                        <div>
                          <div class="mb-4">
                            <label for="test3" class="block text-sm font-medium text-gray-700">Test3</label>
                            <input type="text" id="test3" v-model="form.test3" class="mt-1 p-2 border border-gray-300 rounded-md w-full" required>
                          </div>
                        </div>
                        <div>
                          <div class="mb-4">
                            <label for="document-iso-number" class="block text-sm font-medium text-gray-700">Document ISO Number</label>
                            <input type="text" id="document-iso-number" v-model="form.isoNumber" class="mt-1 p-2 border border-gray-300 rounded-md w-full" required>
                          </div>
                          <div class="mb-4">
                            <label for="document-type" class="block text-sm font-medium text-gray-700">Document Type</label>
                            <div class="mt-1 space-y-2">
                              <label v-for="(type, index) in documentTypeOptions" :key="index" class="flex items-center">
                                <input
                                  type="checkbox"
                                  :value="type"
                                  v-model="form.documentType"
                                  class="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                                >
                                <span class="ml-2 text-sm text-gray-700">{{ type }}</span>
                              </label>
                            </div>
                          </div>
                        </div>
                        <div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Document Request</label>
                            <input type="checkbox" v-model="form.request">
                          </div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Document Display</label>
                            <input type="checkbox" v-model="form.display">
                          </div>
                          <div class="mb-4">
                            <label class="block text-sm font-medium text-gray-700">Document Type</label>
                            <label class="inline-flex items-center">
                              <input type="radio" v-model="form.docType" value="doc">
                              <span class="ml-2">Doc</span>
                            </label>
                            <label class="inline-flex items-center">
                              <input type="radio" v-model="form.docType" value="cert">
                              <span class="ml-2">Cert</span>
                            </label>
                          </div>
                        </div>
                      </div>
                    </template>
                    
    
                    <div class="flex justify-end">
                      <button type="submit" class="px-4 py-2 bg-blue-500 text-white font-medium rounded-md">{{ formAction }}</button>
                      <button type="button" class="px-4 py-2 bg-gray-500 text-white font-medium rounded-md ml-2" @click="closeForm">Close</button>
                    </div>
                  </form>
                </div>
              </div>
    
              <button type="button" class="px-4 py-2 bg-blue-500 text-white font-medium rounded-md" @click="openForm('add', section)">Add Item</button>
            </div>
          </div>
        </section>
      </div>

      <button type="button" class="px-4 py-2 bg-blue-500 text-white font-medium rounded-md" @click="updateData">Update Data</button>

    </div>

    <section aria-labelledby="timeline-title" class="lg:col-span-1 lg:col-start-3">
      <div class="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">

        <div class="mb-5">
          <h3 class="font-medium text-gray-900">Assetor</h3>
          <ul role="list" class="mt-2 divide-y divide-gray-200 border-t border-b border-gray-200">
            
              <li v-for="(admin,index) in schoolAdmin" :key="index" class="flex items-center justify-between py-3">
                <div class="flex items-center">
                  <img src="https://images.unsplash.com/photo-1502685104226-ee32379fefbe?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=1024&amp;h=1024&amp;q=80" alt="" class="h-8 w-8 rounded-full">
                  <p class="ml-4 text-sm font-medium text-gray-900">{{ admin.email }}<br><small class="text-gray-500">{{ admin.firstname }} {{ admin.lastname }}</small></p>
                </div>
                <div>
                  <button 
                  type="button" 
                  class="ml-6 rounded-md bg-white text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <font-awesome-icon :icon="['fas','edit']" class="pr-2 pl-2"/>
                  </button>
                  <button 
                  @click="deleteData(admin.id)"
                  type="button" 
                  class="ml-6 rounded-md bg-white text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                  <font-awesome-icon :icon="['fas','trash']" class="pr-2 pl-2"/>
                  </button>
                </div>
              </li>
        
              <li class="flex items-center justify-between py-2">
                <button type="button" class="group -ml-1 flex items-center rounded-md bg-white p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  <span class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400">
                    <svg class="h-5 w-5" x-description="Heroicon name: mini/plus" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z"></path>
                    </svg>
                  </span>
                  <span class="ml-4 text-sm font-medium text-indigo-600 group-hover:text-indigo-500" @click="$router.push('/institution/admin/'+this.dataItem)">เพิ่มเจ้าหน้าที่</span>
                </button>
              </li>
          </ul>
        </div>

        <h2 id="timeline-title" class="text-lg font-medium text-gray-900">ประวัติการทำรายการ</h2>

        <!-- Activity Feed -->
        <div class="mt-6 flow-root">
          <ul role="list" class="-mb-8">
            <li>
              <div class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/user -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Applied to <a href="#" class="font-medium text-gray-900">Front End Developer</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-09-20">Sep 20</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <div class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/hand-thumb-up -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Advanced to phone screening by <a href="#" class="font-medium text-gray-900">Bethany Blake</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-09-22">Sep 22</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <div class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/check -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Completed phone screening with <a href="#" class="font-medium text-gray-900">Martha Gardner</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-09-28">Sep 28</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <div class="relative pb-8">
                <span class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/hand-thumb-up -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path d="M1 8.25a1.25 1.25 0 112.5 0v7.5a1.25 1.25 0 11-2.5 0v-7.5zM11 3V1.7c0-.268.14-.526.395-.607A2 2 0 0114 3c0 .995-.182 1.948-.514 2.826-.204.54.166 1.174.744 1.174h2.52c1.243 0 2.261 1.01 2.146 2.247a23.864 23.864 0 01-1.341 5.974C17.153 16.323 16.072 17 14.9 17h-3.192a3 3 0 01-1.341-.317l-2.734-1.366A3 3 0 006.292 15H5V8h.963c.685 0 1.258-.483 1.612-1.068a4.011 4.011 0 012.166-1.73c.432-.143.853-.386 1.011-.814.16-.432.248-.9.248-1.388z" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Advanced to interview by <a href="#" class="font-medium text-gray-900">Bethany Blake</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-09-30">Sep 30</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>

            <li>
              <div class="relative pb-8">
                <div class="relative flex space-x-3">
                  <div>
                    <span class="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                      <!-- Heroicon name: mini/check -->
                      <svg class="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                        <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd" />
                      </svg>
                    </span>
                  </div>
                  <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p class="text-sm text-gray-500">Completed interview with <a href="#" class="font-medium text-gray-900">Katherine Snyder</a></p>
                    </div>
                    <div class="whitespace-nowrap text-right text-sm text-gray-500">
                      <time datetime="2020-10-04">Oct 4</time>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </div>
        <div class="justify-stretch mt-6 flex flex-col">

          <router-link :to="'/application/apply/'+this.assetData._id + '/' + firstStatusItem" class="inline-flex items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
            ดูข้อมูลการลงทะเบียน
          </router-link>

        </div>
      </div>
    </section>
  </div>
</template>