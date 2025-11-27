<template>
    <div>
      <div>
        <input type="text" v-model="searchQuery" placeholder="Search..." class="border border-gray-200 p-1 mb-2" />
      </div>
      <div v-if="loading" class="text-center">Loading...</div>
      <table v-else class="w-full table-auto border-collapse text-center" :class="[styles.classes]" :style="styles.style">
        <!-- Table headers -->
        <thead class="bg-gray-100">
          <tr>
            <th class="border border-gray-200 p-1">#</th>
            <th v-for="column in (data.columns.length ? data.columns : tableData.columns)" :key="column.id" class="border border-gray-200 p-1" @click="sortData(column.field)">
              {{ column.label }}
              <span v-if="column.field === sortedColumn.field">
                {{ sortedColumn.order === 'asc' ? '▲' : '▼' }}
              </span>
            </th>
          </tr>
        </thead>
        <!-- Table body -->
        <tbody>
          <tr v-for="(row, index) in displayedRows" :key="row.id">
            <td class="border border-gray-200">{{ getRowIndex(index) }}</td>
            <td v-for="column in tableData.columns" :key="column.id" class="border border-gray-200">
              {{ getCellValue(row.content, column.field) }}
            </td>
          </tr>
        </tbody>
      </table>
      <!-- Pagination controls -->
      <div class="flex justify-center mt-4">
        <button @click.prevent="goToFirstPage" :disabled="currentPage === 1" class="px-2 py-1 border border-gray-200">First</button>
        <button @click.prevent="previousPage" :disabled="currentPage === 1" class="px-2 py-1 border border-gray-200">Previous</button>
        <template v-for="page in visiblePages" :key="page">
          <button @click.prevent="goToPage(page)" :class="{ 'bg-gray-200': page === currentPage }" class="px-2 py-1 border border-gray-200">{{ page }}</button>
        </template>
        <button @click.prevent="nextPage" :disabled="currentPage === totalPages" class="px-2 py-1 border border-gray-200">Next</button>
        <button @click.prevent="goToLastPage" :disabled="currentPage === totalPages" class="px-2 py-1 border border-gray-200">Last</button>
        <select v-model="pageLimit" @change="changePageLimit" class="border border-gray-200 ml-2">
          <option v-for="limit in availablePageLimits" :key="limit" :value="limit">{{ limit }}</option>
        </select>
      </div>
    </div>
  </template>
  
  <script>
  import { generateStyles } from '@/plugins/builder.js';
  
  export default {
    props: {
      data: {
        type: Object,
        required: true
      }
    },
    data() {
      return {
        tableData: {},
        loading: false,
        searchQuery: '',
        currentPage: 1,
        pageLimit: 10,
        maxVisiblePages: 5,
        sortedColumn: {
          field: '',
          order: ''
        }
      };
    },
    methods: {
      getCellValue(content, field) {
        const cell = content.find(item => Object.prototype.hasOwnProperty.call(item, field));
        return cell ? cell[field] : '';
      },
      getRowIndex(index) {
        return (this.currentPage - 1) * this.pageLimit + index + 1;
      },
      async fetchFromAPI() {
        try {
          this.loading = true;
          const response = await fetch(this.data.apiEndpoint, {
            method: this.data.selectedMethodType,
            headers: {
              'Content-Type': 'application/json',
            },
          });
  
          if (!response.ok) {
            throw new Error('Failed to fetch data from API');
          }
  
          const apiData = await response.json();
  
          const allKeys = apiData.reduce((keys, record) => {
            Object.keys(record).forEach((key) => {
              if (!keys.includes(key)) {
                keys.push(key);
              }
            });
            return keys;
          }, []);
  
          const columns = allKeys.map((key) => ({
            id: key,
            label: key,
            field: key,
            editMode: false,
          }));
  
          const rows = apiData.map((record) => {
            const newRow = {
              id: Date.now().toString(),
              content: columns.map((column) => ({
                [column.field]: record[column.field] || '',
              })),
            };
            return newRow;
          });
  
          this.tableData = {
            columns,
            rows,
          };
        } catch (error) {
          console.error('Error fetching data from API:', error);
        } finally {
          this.loading = false;
        }
      },
      changePageLimit() {
        this.currentPage = 1;
      },
      previousPage() {
        if (this.currentPage > 1) {
          this.currentPage--;
        }
      },
      nextPage() {
        if (this.currentPage < this.totalPages) {
          this.currentPage++;
        }
      },
      goToPage(page) {
        this.currentPage = page;
      },
      goToFirstPage() {
        this.currentPage = 1;
      },
      goToLastPage() {
        this.currentPage = this.totalPages;
      },
      sortData(field) {
        if (field === this.sortedColumn.field) {
          this.sortedColumn.order = this.sortedColumn.order === 'asc' ? 'desc' : 'asc';
        } else {
          this.sortedColumn.field = field;
          this.sortedColumn.order = 'asc';
        }
  
        this.tableData.rows.sort((row1, row2) => {
          const value1 = this.getCellValue(row1.content, field);
          const value2 = this.getCellValue(row2.content, field);
  
          if (this.sortedColumn.order === 'asc') {
            return value1 > value2 ? 1 : -1;
          } else {
            return value1 < value2 ? 1 : -1;
          }
        });
  
        this.currentPage = 1;
      }
    },
    computed: {
      styles() {
        return generateStyles(this.data);
      },
      availablePageLimits() {
        return [10, 20, 50];
      },
      displayedRows() {
        const start = (this.currentPage - 1) * this.pageLimit;
        const end = start + this.pageLimit;
        let filteredRows = this.tableData.rows;
  
        if (this.searchQuery) {
          const query = this.searchQuery.toLowerCase();
          filteredRows = filteredRows.filter((row) => {
            return Object.values(row.content).some((cell) =>
              Object.values(cell)[0].toString().toLowerCase().includes(query)
            );
          });
        }
  
        return filteredRows.slice(start, end);
      },
      totalPages() {
        if (this.tableData.rows) {
          return Math.ceil(this.tableData.rows.length / this.pageLimit);
        } else {
          return 0;
        }
      },
      visiblePages() {
        const totalPages = this.totalPages;
        const currentPage = this.currentPage;
        const maxVisiblePages = this.maxVisiblePages;
  
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
        if (endPage - startPage + 1 < maxVisiblePages) {
          startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }
  
        return Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
      },
    },
    created() {
      if (this.data.dataSourceType === 'api') {
        this.fetchFromAPI();
      } else {
        this.tableData = this.data;
      }
    },
  };
  </script>
  