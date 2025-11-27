<template>
    <div class="max-w-2xl mx-auto p-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search items..."
        class="w-full px-4 py-2 border rounded shadow-sm focus:outline-none focus:ring"
      />
  
      <ul v-if="filteredItems.length" class="border rounded mt-2 max-h-60 overflow-auto shadow absolute z-10 bg-white">
        <li
          v-for="item in filteredItems"
          :key="item.id"
          @click="addItem(item)"
          class="px-4 py-2 cursor-pointer hover:bg-gray-100"
        >
          {{ item.name }}
        </li>
      </ul>
    </div>
  
    <div class="w-full mx-auto p-4">
      <div class="mt-4 border rounded shadow p-2">
        <h3 class="font-bold">Selected Items:</h3>
        <div class="flex space-x-2 mb-4">
          <button @click="sortItems('asc')" class="text-blue-500">Sort A-Z</button>
          <button @click="sortItems('desc')" class="text-blue-500">Sort Z-A</button>
        </div>
        <div v-if="selectedItems.length" class="grid gap-4 md:gap-6 lg:gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <div
            v-for="(item, index) in selectedItems"
            :key="item.id"
            ref="setItemRef"
            class="flex flex-col border-2 border-gray-300 items-center p-2 md:p-4 bg-white rounded shadow"
          >
            <img :src="item.cover" alt="Cover Image" class="w-full h-24 md:h-32 object-cover rounded" />
            <h4 class="font-semibold mt-2 text-sm md:text-base">{{ item.name }}</h4>
            <p class="text-gray-600 text-xs md:text-sm">{{ item.description }}</p>
            <p class="text-blue-600 font-bold text-sm md:text-base">{{ formatCurrency(item.price) }}</p>
            <div class="mt-auto flex space-x-1 md:space-x-2 border-t pt-2 w-full justify-center">
              <button v-if="index !== 0" @click="moveUp(index)" class="text-blue-500 text-sm md:text-base">←</button>
              <button v-if="index !== selectedItems.length - 1" @click="moveDown(index)" class="text-blue-500 text-sm md:text-base">→</button>
              <button @click="removeItem(index)" class="text-red-500 text-sm md:text-base">🗑️</button>
            </div>
          </div>
        </div>
        <div v-else class="text-gray-500">No items selected.</div>
      </div>
    </div>
  </template>
  
  
  <script setup>
  import { ref, computed } from 'vue';
  

  // Original array of items with more details
  const items = ref([
    { id: 1, name: 'Item One', cover: 'https://plus.unsplash.com/premium_photo-1661964088064-dd92eaaa7dcf?q=80&w=3812&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'Description for Item One', price: 10.00 },
    { id: 2, name: 'Item Two', cover: 'https://plus.unsplash.com/premium_photo-1661964088064-dd92eaaa7dcf?q=80&w=3812&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'Description for Item Two', price: 15.00 },
    { id: 3, name: 'Item Three', cover: 'https://plus.unsplash.com/premium_photo-1661964088064-dd92eaaa7dcf?q=80&w=3812&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'Description for Item Three', price: 20.00 },
    { id: 4, name: 'Item Four', cover: 'https://plus.unsplash.com/premium_photo-1661964088064-dd92eaaa7dcf?q=80&w=3812&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'Description for Item Four', price: 25.00 },
    { id: 5, name: 'Item Five', cover: 'https://plus.unsplash.com/premium_photo-1661964088064-dd92eaaa7dcf?q=80&w=3812&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D', description: 'Description for Item Five', price: 30.00 },
  ]);
  const selectedItems = ref([]);
  const searchQuery = ref('');
  
  const filteredItems = computed(() => {
    const query = searchQuery.value.toLowerCase();
    if (!query) return [];
    return items.value.filter(
      (item) =>
        item.name.toLowerCase().includes(query) &&
        !selectedItems.value.some((selected) => selected.id === item.id)
    );
  });
  
  const addItem = (item) => {
    if (item && !selectedItems.value.some(selected => selected.id === item.id)) {
        selectedItems.value.push(item);
        searchQuery.value = '';
    } else {
        alert('Item already selected or invalid item.');
    }
  };
  
  const removeItem = (index) => selectedItems.value.splice(index, 1);
  const moveUp = (index) => {
    if (index > 0) selectedItems.value.splice(index - 1, 0, selectedItems.value.splice(index, 1)[0]);
  };
  const moveDown = (index) => {
    if (index < selectedItems.value.length - 1) selectedItems.value.splice(index + 1, 0, selectedItems.value.splice(index, 1)[0]);
  };
  const formatCurrency = (value) => `$${value.toFixed(2)}`;
  const sortItems = (order) => selectedItems.value.sort((a, b) => (order === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)));
  </script>
  
  <style scoped>
  /* Remove styles related to connectors */
  </style>