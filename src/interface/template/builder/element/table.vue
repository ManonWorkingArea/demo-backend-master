<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <div class="p-2 border rounded-md shadow-sm overflow-x-auto">
        <div v-if="localItem.rows && localItem.rows.length > 0">
          <h4 v-if="localItem.tableName" class="text-md font-semibold mb-2">{{ localItem.tableName }}</h4>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th 
                  v-for="(col, colIndex) in localItem.columns" 
                  :key="col.id || colIndex" 
                  scope="col" 
                  class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {{ col.label }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="(row, rowIndex) in localItem.rows" :key="row.id || rowIndex">
                <td 
                  v-for="(col, colIndex) in localItem.columns" 
                  :key="col.id || colIndex" 
                  class="px-4 py-2 whitespace-nowrap text-sm text-gray-700"
                >
                  {{ getValue(row, col, rowIndex, colIndex) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="text-sm text-gray-500 p-2">
          Table is empty or not configured.
        </div>
      </div>
    </template>

    <!-- Edit Mode -->
    <template v-if="mode === 'edit'">
      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <i class="fas fa-table text-green-600 h-4 w-4"></i>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Table Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของตาราง</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 space-y-6">
          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-3">
            <label class="popup-label block mb-1 font-semibold">Table Name (Optional):</label>
            <input type="text" v-model="localItem.tableName" @input="updateLocalItem" class="popup-input w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="Enter table name" />
          </div>

          <div class="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <label class="popup-label block mb-1 font-semibold">Data Source Type:</label>
            <div class="flex items-center space-x-4 mb-3">
              <label class="flex items-center">
                <input type="radio" id="manual" value="manual" v-model="localItem.dataSourceType" @change="updateLocalItem" class="form-radio" />
                <span class="ml-2 popup-label">Manual Input</span>
              </label>
              <label class="flex items-center">
                <input type="radio" id="api" value="api" v-model="localItem.dataSourceType" @change="updateLocalItem" class="form-radio" />
                <span class="ml-2 popup-label">API</span>
              </label>
            </div>

            <div v-if="localItem.dataSourceType === 'manual'">
              <div class="mb-3">
                <button @click="addColumn" class="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm mr-2">
                  <font-awesome-icon :icon="['fas', 'plus']" class="mr-1" /> Add Column
                </button>
                <button @click="addRow" class="px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm mr-2">
                   <font-awesome-icon :icon="['fas', 'plus']" class="mr-1" /> Add Row
                </button>
                <button
                  v-if="localItem.columns && localItem.columns.length > 0 && localItem.rows && localItem.rows.length > 0"
                  @click="clearTableData"
                  class="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm"
                >
                  Clear Table Data
                </button>
              </div>
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-300 border border-gray-300">
                  <thead class="bg-gray-100">
                    <tr>
                      <th v-for="(column, colIndex) in localItem.columns" :key="column.id || colIndex" class="p-2 border-b border-r border-gray-300 text-left text-sm font-semibold">
                        <div class="flex items-center">
                          <input v-model="column.label" @input="updateLocalItem" type="text" class="popup-input flex-grow text-sm mr-1 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="Column Name" />
                          <button @click="deleteColumn(colIndex)" class="text-red-500 hover:text-red-700 ml-1">
                            <font-awesome-icon :icon="['fas', 'times']" />
                          </button>
                        </div>
                      </th>
                      <th v-if="localItem.columns && localItem.columns.length > 0" class="p-2 border-b border-gray-300 text-center text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="(row, rowIndex) in localItem.rows" :key="row.id || rowIndex">
                      <td v-for="(column, colIndex) in localItem.columns" :key="column.id || colIndex" class="p-1 border-r border-gray-200">
                        <input v-model="row.data[column.label]" @input="updateLocalItem" type="text" class="popup-input w-full text-sm rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="Enter data" />
                      </td>
                      <td v-if="localItem.columns && localItem.columns.length > 0" class="p-1 text-center">
                        <button @click="deleteRow(rowIndex)" class="text-red-500 hover:text-red-700">
                          <font-awesome-icon :icon="['fas', 'trash']" />
                        </button>
                      </td>
                    </tr>
                    <tr v-if="!localItem.rows || localItem.rows.length === 0 && localItem.columns && localItem.columns.length > 0">
                      <td :colspan="localItem.columns.length + 1" class="text-center p-3 text-gray-500">
                        No rows yet. Click 'Add Row' to start.
                      </td>
                    </tr>
                    <tr v-if="!localItem.columns || localItem.columns.length === 0">
                      <td class="text-center p-3 text-gray-500">
                        No columns yet. Click 'Add Column' to start.
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div v-else-if="localItem.dataSourceType === 'api'">
              <div class="flex items-end space-x-2 mb-3">
                <div class="flex-grow">
                  <label class="popup-label block mb-1 font-semibold">API Endpoint URL:</label>
                  <input type="text" v-model="localItem.apiEndpoint" @input="updateLocalItem" placeholder="https://api.example.com/data" class="popup-input w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" />
                </div>
                <div>
                  <label class="popup-label block mb-1 font-semibold">Method:</label>
                  <select v-model="localItem.apiMethod" @change="updateLocalItem" class="popup-input rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500">
                    <option value="GET">GET</option>
                    <option value="POST">POST</option>
                  </select>
                </div>
                <button @click="fetchDataFromApi" :disabled="apiLoading" class="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 text-sm">
                  <font-awesome-icon :icon="['fas', apiLoading ? 'spinner' : 'download']" :spin="apiLoading" class="mr-1" />
                  {{ apiLoading ? 'Fetching...' : 'Fetch Data' }}
                </button>
              </div>
              <div v-if="apiError" class="text-red-500 text-sm mb-2 p-2 border border-red-300 bg-red-50 rounded-md">
                {{ apiError }}
              </div>
              <div v-if="localItem.apiDataStructureHint && localItem.apiDataStructureHint.length > 0" class="mb-2 p-2 border border-yellow-300 bg-yellow-50 rounded-md text-sm">
                <p class="font-semibold">API Data Structure Hint (first item):</p>
                <pre class="overflow-x-auto bg-gray-700 text-white p-2 rounded-md text-xs">{{ localItem.apiDataStructureHint[0] }}</pre>
              </div>
              <div class="mb-2">
                <label class="popup-label block mb-1 font-semibold">Data Path (e.g., data.items or leave empty if response is array):</label>
                <input type="text" v-model="localItem.apiDataPath" @input="updateLocalItem" class="popup-input w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="data.records" />
              </div>
              <p class="text-xs text-gray-500 mb-3">After fetching, manually add columns below based on the API response structure. The table will then populate using these column labels as keys for the data.</p>
              <div class="mb-3">
                <button @click="addColumnForApi" class="px-3 py-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 text-sm mr-2">
                  <font-awesome-icon :icon="['fas', 'plus']" class="mr-1" /> Add Column for API Data
                </button>
              </div>
              <div v-if="localItem.apiColumns && localItem.apiColumns.length > 0" class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-300 border border-gray-300">
                  <thead class="bg-gray-100">
                    <tr>
                      <th v-for="(column, colIndex) in localItem.apiColumns" :key="column.id || colIndex" class="p-2 border-b border-r border-gray-300 text-left text-sm font-semibold">
                        <div class="flex items-center">
                          <input v-model="column.label" @input="updateLocalItem" type="text" class="popup-input flex-grow text-sm mr-1 rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-500" placeholder="Column Key/Label" />
                          <button @click="deleteApiColumn(colIndex)" class="text-red-500 hover:text-red-700 ml-1">
                            <font-awesome-icon :icon="['fas', 'times']" />
                          </button>
                        </div>
                      </th>
                    </tr>
                  </thead>
                </table>
                <p class="text-xs text-gray-500 mt-1">Preview will use these column labels to map data from the API response.</p>
              </div>
              <div v-else class="text-sm text-gray-500 p-2 border rounded-md">
                Add columns to define how API data should be displayed.
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'; // Assuming you use FontAwesome
import axios from 'axios'; // For API calls

function generateUid() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export default {
  name: 'TableElement',
  components: {
    FontAwesomeIcon,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      required: true, // 'edit' or 'preview'
    },
    // fullscreen prop for divStyles, if needed from parent
    // fullscreen: {
    //   type: Boolean,
    //   default: false,
    // }
  },
  emits: ['update-item'],
  data() {
    return {
      localItem: {},
      apiLoading: false,
      apiError: null,
    };
  },
  computed: {
    divStyles() {
      // If you need fullscreen prop from parent, uncomment props and use this.fullscreen
      // For now, assuming it's not controlled by a parent prop here.
      const isFullScreenMode = false; // Replace with actual logic if needed
      if (isFullScreenMode) {
        const height = `calc(100vh - 190px)`;
        return {
          height,
          overflowY: 'scroll',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
          right: '-20px',
        };
      } else {
        return {
          minHeight: '600px',
          maxHeight: '600px',
          overflowY: 'scroll',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(0, 0, 0, 0.2) transparent',
          right: '-20px',
        };
      }
    },
  },
  watch: {
    item: {
      handler(newItem) {
        const defaultValues = {
          tableName: '',
          dataSourceType: 'manual', // 'manual' or 'api'
          columns: [], // For manual: [{ id: 'uid', label: 'Column 1' }]
          rows: [],    // For manual: [{ id: 'uid', data: { 'Column 1': 'Value' } }]
          apiEndpoint: '',
          apiMethod: 'GET',
          apiDataPath: '', // e.g., 'data.items'
          apiColumns: [], // For API: [{ id: 'uid', label: 'api_key_or_label' }]
                          // This defines what to show in preview from API data
          apiDataStructureHint: null, // To show a preview of fetched data structure
        };
        const initialData = { ...defaultValues, ...JSON.parse(JSON.stringify(newItem)) };
        
        // Ensure arrays exist
        initialData.columns = initialData.columns || [];
        initialData.rows = initialData.rows || [];
        initialData.apiColumns = initialData.apiColumns || [];

        if (JSON.stringify(initialData) !== JSON.stringify(this.localItem)) {
          this.localItem = initialData;
        }
      },
      deep: true,
      immediate: true,
    },
  },
  methods: {
    updateLocalItem() {
      this.$emit('update-item', JSON.parse(JSON.stringify(this.localItem)));
    },
    // --- Manual Table Methods ---
    addColumn() {
      if (!this.localItem.columns) this.localItem.columns = [];
      const newColId = `col_${generateUid()}`;
      this.localItem.columns.push({ id: newColId, label: `Column ${this.localItem.columns.length + 1}` });
      // Optionally add this new column to existing rows with default empty value
      if (this.localItem.rows) {
          this.localItem.rows.forEach(row => {
              if (!row.data) row.data = {};
              row.data[`Column ${this.localItem.columns.length}`] = ''; // Use the new label
          });
      }
      this.updateLocalItem();
    },
    addRow() {
      if (!this.localItem.rows) this.localItem.rows = [];
      const newRow = { id: `row_${generateUid()}`, data: {} };
      if (this.localItem.columns) {
        this.localItem.columns.forEach(col => {
          newRow.data[col.label] = ''; // Initialize with current column labels
        });
      }
      this.localItem.rows.push(newRow);
      this.updateLocalItem();
    },
    deleteColumn(index) {
      if (this.localItem.columns && this.localItem.columns[index]) {
        const removedColumnLabel = this.localItem.columns[index].label;
        this.localItem.columns.splice(index, 1);
        // Remove data associated with this column from all rows
        if (this.localItem.rows) {
            this.localItem.rows.forEach(row => {
                if (row.data && Object.prototype.hasOwnProperty.call(row.data, removedColumnLabel)) {
                    delete row.data[removedColumnLabel];
                }
            });
        }
        this.updateLocalItem();
      }
    },
    deleteRow(index) {
      if (this.localItem.rows) {
        this.localItem.rows.splice(index, 1);
        this.updateLocalItem();
      }
    },
    clearTableData() {
      this.localItem.rows = [];
      // this.localItem.columns = []; // Decide if columns should also be cleared
      this.updateLocalItem();
    },

    // --- API Table Methods ---
    addColumnForApi() {
      if (!this.localItem.apiColumns) this.localItem.apiColumns = [];
      this.localItem.apiColumns.push({ id: `api_col_${generateUid()}`, label: '' });
      this.updateLocalItem();
    },
    deleteApiColumn(index) {
      if (this.localItem.apiColumns) {
        this.localItem.apiColumns.splice(index, 1);
        this.updateLocalItem();
      }
    },
    async fetchDataFromApi() {
      if (!this.localItem.apiEndpoint) {
        this.apiError = 'API Endpoint URL is required.';
        return;
      }
      this.apiLoading = true;
      this.apiError = null;
      this.localItem.apiDataStructureHint = null; 

      try {
        const response = await axios({
          method: this.localItem.apiMethod || 'GET',
          url: this.localItem.apiEndpoint,
          // Add headers or body for POST if needed based on localItem properties
        });
        
        let dataToProcess = response.data;
        if (this.localItem.apiDataPath) {
            const pathParts = this.localItem.apiDataPath.split('.');
            let current = response.data;
            for (const part of pathParts) {
                if (current && typeof current === 'object' && part in current) {
                    current = current[part];
                } else {
                    throw new Error(`Path '${this.localItem.apiDataPath}' not found in API response.`);
                }
            }
            dataToProcess = current;
        }

        if (Array.isArray(dataToProcess)) {
          if (dataToProcess.length > 0) {
            // Store a hint of the data structure from the first item
            this.localItem.apiDataStructureHint = [JSON.stringify(dataToProcess[0], null, 2)];
          }
          // For API mode, we don't directly populate rows/columns here.
          // The user defines apiColumns, and the preview mode will use those to map the fetched data.
          // We could potentially store the fetched data in localItem.apiFetchedData if needed for other purposes.
          // this.localItem.apiFetchedData = dataToProcess; 
        } else {
          throw new Error('Data at the specified path is not an array.');
        }

        // No direct update to localItem.rows/columns for API mode here
        // User needs to define localItem.apiColumns based on the response structure

      } catch (error) {
        console.error('API Fetch Error:', error);
        this.apiError = error.message || 'Failed to fetch data from API.';
        if (error.response) {
          this.apiError += ` (Status: ${error.response.status})`;
        }
      } finally {
        this.apiLoading = false;
        this.updateLocalItem(); // Emit update even on error/finally to save apiEndpoint etc.
      }
    },

    // --- Preview Mode Helper ---
    getValue(row, col, /* rowIndex, colIndex */) { // Commented out unused params for now
      if (this.localItem.dataSourceType === 'manual') {
        return row.data && col.label in row.data ? row.data[col.label] : '';
      }
      // For API, we'd need to map from fetched API data if we stored it
      // This simplified version assumes columns are already mapped for preview
      // or that row data is somehow pre-processed. For a true API preview,
      // you'd iterate over apiFetchedData and use apiColumns for keys.
      
      // Improved API data access for preview
      if (this.localItem.dataSourceType === 'api') {
        // Assuming row here is an item from the fetched API data
        // and col.label is the key for that data.
        // This part needs to be aligned with how API data is fetched and stored.
        // If localItem.apiFetchedData holds the array and apiColumns define the keys:
        // This getValue method receives a `row` from `localItem.rows` in preview template.
        // For API, `localItem.rows` should ideally be populated from `apiFetchedData` based on `apiColumns`.
        // Let's assume for now that 'row' IS an item from the API data and 'col.label' is the direct key.
        return row && col.label in row ? row[col.label] : '';
      }
      return ''; // Default empty string
    }
  },
};
</script>

<style scoped>
.popup-label {
  font-size: 0.875rem; /* text-sm */
  color: #4a5568; /* gray-700 */
}
.popup-input {
  border-width: 1px;
  border-color: #e2e8f0; /* gray-300 */
  padding: 0.25rem 0.5rem; /* Smaller padding for table inputs */
  font-size: 0.875rem; /* text-sm */
  border-radius: 0.25rem;
}
.form-radio {
    color: #4f46e5; /* indigo-600 */
}
.section-group {
  margin-bottom: 1rem;
  padding: 0.5rem;
}
/* Add any specific table styling if needed */
</style> 