<script>
  import storageManager from '@/plugins/storage';
  import Subhead from '@/interface/template/outline/Subhead.vue';
  export default {
    data() {
      return {
        menuItems: [
          { id: 1, title: 'Menu Item 1', target: '#url1', auth: true },
          { id: 2, title: 'Menu Item 2', target: '#url2', auth: false },
          { id: 3, title: 'Menu Item 3', target: '#url3', auth: true },
        ],
        menuData: [],
        droppedItems: [],
        itemDragging: null,
        submenuDragging: null,
        newMenuItemTitle: '',
        newMenuItemTarget: '',
        newMenuItemAuth: false,
        showAddMenuItem: false,
        dataItem: this.$route.params.id,
        configs:storageManager.get('configs')
      };
    },
    components: {
        Subhead
    },
    mounted() {
      this.fetchData();
    },
    methods: {
      async fetchData() {
        try {
          let item       = this.$route.params.id;
          const response = await fetch('https://multisource-api-edsdv.ondigitalocean.app/api/DU1eYMDG7j8yb199YDPg2/hostname/' + item, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'}
          });
          const data = await response.json();
          if (data.menu) {
            this.droppedItems = data.menu;
            } else {
            // Handle case where data is falsy or undefined
            this.droppedItems = [];
            }
        } catch (error) {
          console.error(error);
        }
      },
      async updateData() {
        try {
          this.activeBlock  = true
          const response    = await fetch('https://multisource-api-edsdv.ondigitalocean.app/api/DU1eYMDG7j8yb199YDPg2/hostname/' + this.dataItem, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              data: {
                menu: this.menuData,
              },
            })
          });
          const data = await response.json();
          console.log(data);
        } catch (error) {
          console.error(error);
        }
      },
      showAddMenuItemPopup() {
          this.showAddMenuItem = true;
      },
      dragStartHandler(item, index) {
        event.dataTransfer.setData('text/plain', item.id);
        event.dataTransfer.effectAllowed = 'move';
        this.itemDragging = index;
      },
      dropHandler(event) {
        const itemId = event.dataTransfer.getData('text/plain');
        const item = this.menuItems.find(item => item.id === Number(itemId));
        if (item) {
          const newItem = { ...item, oldTitle: item.title, id: Date.now(), submenu: [] };
          this.menuItems = this.menuItems.filter(menuItem => menuItem.id !== item.id);
          this.droppedItems.push(newItem);
        }
      },
      dragEndHandler() {
        this.itemDragging = null;
        this.submenuDragging = null;
      },
      dropItemHandler(toIndex) {
        if (this.itemDragging !== null && this.itemDragging !== toIndex) {
          this.droppedItems.splice(toIndex, 0, this.droppedItems.splice(this.itemDragging, 1)[0]);
        }
      },
      deleteHandler(index) {
        const item = this.droppedItems.splice(index, 1)[0];
        if (item.oldTitle) {
          item.title = item.oldTitle;
          delete item.oldTitle;
        }
        this.menuItems.push(item);
      },
      renameHandler(index) {
        const oldName = this.droppedItems[index].title;
        const newName = prompt('Enter new name:', oldName);
        if (newName) {
          this.droppedItems[index].oldTitle = oldName;
          this.droppedItems[index].title = newName;
        }
      },
      renameSubmenuHandler(itemIndex, subindex) {
          const oldName = this.droppedItems[itemIndex].submenu[subindex].title;
          const newName = prompt('Enter new name:', oldName);
          if (newName) {
              this.droppedItems[itemIndex].submenu[subindex].oldTitle = oldName;
              this.droppedItems[itemIndex].submenu[subindex].title = newName;
          }
      },
      viewAllHandler() {
        this.menuData = this.droppedItems.map(item => ({ title: item.title, target: item.target, auth: item.auth, submenu: item.submenu.map(subitem => ({ title: subitem.title, target: subitem.target })) }))
        this.updateData();
        console.log(this.droppedItems.map(item => ({ title: item.title, target: item.target, auth: item.auth, submenu: item.submenu.map(subitem => ({ title: subitem.title, target: subitem.target })) })));
      },
      addMenuItemHandler() {
        if (this.newMenuItemTitle) {
          const newMenuItem = {
            id: Date.now(),
            title: this.newMenuItemTitle,
            target: this.newMenuItemTarget,
            auth: this.newMenuItemAuth,
          };
          this.menuItems.push(newMenuItem);
          this.newMenuItemTitle = '';
          this.newMenuItemTarget = '';
          this.newMenuItemAuth = false;
          this.showAddMenuItem = false
        }
      },
      dropSubmenuHandler(itemIndex, event) {
        const subitemId = event.dataTransfer.getData('text/plain');
        const subitem = this.menuItems.find(item => item.id === Number(subitemId));
        if (subitem) {
          const newSubitem = { ...subitem, oldTitle: subitem.title, id: Date.now() };
          this.menuItems = this.menuItems.filter(menuItem => menuItem.id !== subitem.id);
          this.droppedItems[itemIndex].submenu.push(newSubitem);
        }
      },
      submenuDragStartHandler(subitem, subindex) {
        event.dataTransfer.setData('text/plain', subitem.id);
        event.dataTransfer.effectAllowed = 'move';
        this.submenuDragging = subindex;
      },
      submenuDragEndHandler() {
        this.submenuDragging = null;
      },
      deleteSubmenuHandler(itemIndex, subindex) {
        const subitem = this.droppedItems[itemIndex].submenu.splice(subindex, 1)[0];
        if (subitem.oldTitle) {
          subitem.title = subitem.oldTitle;
          delete subitem.oldTitle;
        }
        this.menuItems.push(subitem);
      },
    },
  };
  
  </script>

<template>
    <Subhead 
      :navigation="
      [
        {
          name: 'ปรับแต่งเมนู',
          link: '/school/menu/' + this.dataItem,
          style: 'list',
          class: 'primary-btn',
          visible: true,
          type: 'button',
        },
        {
          name: 'ย้อนกลับ',
          link: '/school/edit/' + this.dataItem,
          style: 'chevron-left',
          class: 'primary-btn',
          visible: true,
          type: 'button',
        }
      ]"
  />
    <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t">
        <div class="mt-8">
            <div class="mx-auto max-w-7xl px-6 sm:px-6 lg:px-6">
  
                <div class="mt-8 flex flex-col">
                  <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                      <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                      <div class="overflow-hidden ring-1 ring-black ring-opacity-5 md:rounded-lg">
  
                          <div class="divide-y divide-gray-200 overflow-hidden rounded-lg bg-gray-200 sm:grid sm:grid-cols-2 sm:gap-px sm:divide-y-0">
                              <div class="rounded-tl-lg rounded-tr-lg sm:rounded-tr-none relative group bg-white p-3">
                                <div class="mt-4">
  
                                  <div class="column menu">
                                    <div class="title">Plugin</div>
                                    <div
                                      class="w-full py-2 px-2 border border-gray-200"
                                      v-for="item in menuItems"
                                      :key="item.id"
                                      :draggable="true"
                                      :class="{ auth: item.auth }"
                                      @dragstart="dragStartHandler(item)"
                                    >
                                      <p>{{ item.title }}</p>
                                    </div>
          
                                    <button class="mt-5 mb-5 mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2" 
                                    @click="showAddMenuItemPopup"
                                    >
                                    <font-awesome-icon :icon="['fas','plus']" class="mr-1 h-4 w-4 text-gray-600"/> Add Menu Item
                                    </button>
                            
                                    <div class="popup" v-if="showAddMenuItem">
                                      <div class="popup-content">
                                        <h2>Add Menu Item</h2>
                                        <label>Title</label>
                                        <input type="text" v-model="newMenuItemTitle" />
                                        <label>Target</label>
                                        <input type="text" v-model="newMenuItemTarget" />
                                        <label>Requires Auth</label>
                                        <input type="checkbox" v-model="newMenuItemAuth" />
                                        <button @click="addMenuItemHandler">Add</button>
                                        <button @click="hideAddMenuItemPopup">Cancel</button>
                                      </div>
                                    </div>
                                  </div>
                                  
                                </div>
                              </div>
                          
                              <div class="sm:rounded-tr-lg relative group bg-white p-3">
                                <div class="mt-4">
  
                                  <div class="column main p-3" @dragover.prevent @drop="dropHandler">
                                    <div class="title">Main Menu</div>
                                    <div v-if="!droppedItems || droppedItems.length === 0">Drop items here</div>

                                    <div
                                      v-for="(item, index) in droppedItems"
                                      :key="item.id"
                                      :draggable="true"
                                      :class="{ dragging: itemDragging === index }"
                                      @dragstart="dragStartHandler(item, index)"
                                      @dragend="dragEndHandler(index)"
                                      @dragover.prevent
                                      @drop="dropItemHandler(index)"
                                      class="w-full py-2 px-2 border border-gray-200 p-2 mb-2"
                                    >
  
                                      <div class="flex w-full">
  
                                        <div class="w-4/5">
                                          <div class="item-title font-medium text-black">{{ item.title }}</div>
                                          <div class="item-old-title" v-if="item.oldTitle">{{ item.oldTitle }}</div>
                                        </div>
  
                                        <div class="w-1/5 flex justify-end items-center">
                                          <button class="mr-1" @click="renameHandler(index)"><font-awesome-icon :icon="['fas','pencil']" class="mx-auto h-3 w-3 text-gray-600"/></button>
                                          <button class="ml-1" @click="deleteHandler(index)"><font-awesome-icon :icon="['fas','trash']" class="mx-auto h-3 w-3 text-gray-600"/></button>
                                        </div>
  
                                      </div>
  
                                      <div class="submenu bg-gray-100 mt-2 p-2" @dragover.prevent @drop="dropSubmenuHandler(index, $event)">
                                        <div v-if="item.submenu.length === 0" class="bg-gray-100 py-3 px-3 text-center text-xs text-gray-400">Drag items here to create a submenu</div>
                                        
                                          <div class="submenu-item py-1 px-1 bg-white border border-gray-200 text-[15px]"
                                            v-for="(subitem, subindex) in item.submenu"
                                            :key="subitem.id"
                                            :draggable="true"
                                            :class="{ dragging: submenuDragging === subindex }"
                                            @dragstart="submenuDragStartHandler(subitem, subindex)"
                                            @dragend="submenuDragEndHandler"
                                          >
                                            <div class="flex w-full">
  
                                              <div class="w-4/5">{{ subitem.title }}</div>
  
                                              <div class="w-1/5 flex justify-end items-center">
                                                <button class="rename-submenu-btn mr-1" @click="renameSubmenuHandler(index, subindex)"><font-awesome-icon :icon="['fas','pencil']" class="mx-auto h-3 w-3 text-gray-600"/></button>
                                                <button class="delete-submenu-btn ml-1" @click="deleteSubmenuHandler(index, subindex)"><font-awesome-icon :icon="['fas','trash']" class="mx-auto h-3 w-3 text-gray-600"/></button>
                                              </div>
  
                                            </div>
                                          </div>
  
                                      </div>
  
                                    </div>
  
                                    <button class="mt-5 mb-5 mr-2 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2" 
                                    @click="viewAllHandler"
                                    >
                                    <font-awesome-icon :icon="['fas','save']" class="mr-1 h-4 w-4 text-gray-600"/> Save
                                    </button>
  
                                  </div>
  
                                </div>
                              </div>
  
                          </div>
      
                      </div>
                      </div>
                  </div>
                </div>
            </div>
            
        </div>
    </div>
  
  </template>
  
  <style>
  .container {
    display: flex;
  }
  
  .column {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 1px solid #ccc;
  }
  
  .title {
    font-size: 1.5rem;
    font-weight: bold;
    margin-bottom: 1rem;
  }
  
  .item {
    padding: 10px;
    margin: 5px;
    cursor: grab;
  }
  
  .item.dragging {
    opacity: 0.5;
  }
  
  .delete-btn,
  .rename-btn {
    margin-left: 10px;
    padding: 5px;
    background-color: #f00;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .rename-btn {
    background-color: #00f;
  }
  
  .add-item {
    margin-top: 1rem;
  }
  
  .add-item input[type="text"] {
    padding: 5px;
    margin-right: 5px;
  }
  
  .add-item button {
    padding: 5px;
    background-color: #0f0;
    color: #fff;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  
  .item-title {
    display: inline-block;
    width: 100%;
  }
  
  .item-old-title {
    display: inline-block;
    margin-left: 10px;
    font-style: italic;
  }
  </style>
  