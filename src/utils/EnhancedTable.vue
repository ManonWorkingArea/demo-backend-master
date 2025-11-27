<template>
  <div class="enhanced-table-container" :class="containerClasses">
    <!-- Table Header Controls -->
    <div v-if="showControls" class="table-controls">
      <!-- Search -->
      <div v-if="searchable" class="table-search">
        <div class="search-input-wrapper">
          <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="search-input"
            @input="handleSearch"
          />
          <button
            v-if="searchQuery"
            @click="clearSearch"
            class="search-clear"
          >
            <font-awesome-icon :icon="['fas', 'times']" />
          </button>
        </div>
      </div>

      <!-- Filters -->
      <div v-if="filterable && filters.length" class="table-filters">
        <select
          v-for="filter in filters"
          :key="filter.key"
          v-model="activeFilters[filter.key]"
          @change="handleFilter"
          class="filter-select"
        >
          <option value="">{{ filter.placeholder || `Filter by ${filter.label}` }}</option>
          <option
            v-for="option in filter.options"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>

      <!-- Actions -->
      <div v-if="actions.length" class="table-actions">
        <button
          v-for="action in actions"
          :key="action.key"
          @click="handleAction(action)"
          :class="['action-button', `action-${action.variant || 'default'}`]"
          :disabled="action.disabled || (action.requiresSelection && !hasSelection)"
        >
          <font-awesome-icon v-if="action.icon" :icon="action.icon" class="action-icon" />
          {{ action.label }}
        </button>
      </div>

      <!-- Export -->
      <div v-if="exportable" class="table-export">
        <button @click="showExportMenu = !showExportMenu" class="export-button">
          <font-awesome-icon :icon="['fas', 'download']" />
          Export
        </button>
        <div v-if="showExportMenu" class="export-menu">
          <button @click="exportData('csv')" class="export-option">CSV</button>
          <button @click="exportData('json')" class="export-option">JSON</button>
          <button @click="exportData('excel')" class="export-option">Excel</button>
        </div>
      </div>
    </div>

    <!-- Table Wrapper -->
    <div class="table-wrapper" :class="{ 'table-loading': loading }">
      <table class="enhanced-table" :class="tableClasses">
        <!-- Table Header -->
        <thead class="table-header">
          <tr>
            <!-- Select All Checkbox -->
            <th v-if="selectable" class="select-column">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isPartiallySelected"
                @change="toggleSelectAll"
                class="select-checkbox"
              />
            </th>

            <!-- Column Headers -->
            <th
              v-for="column in visibleColumns"
              :key="column.key"
              :class="getColumnClasses(column)"
              @click="handleSort(column)"
            >
              <div class="column-header">
                <span class="column-title">{{ column.label }}</span>
                <div v-if="column.sortable" class="sort-indicators">
                  <font-awesome-icon
                    :icon="['fas', 'chevron-up']"
                    :class="['sort-icon', 'sort-asc', { active: sortColumn === column.key && sortDirection === 'asc' }]"
                  />
                  <font-awesome-icon
                    :icon="['fas', 'chevron-down']"
                    :class="['sort-icon', 'sort-desc', { active: sortColumn === column.key && sortDirection === 'desc' }]"
                  />
                </div>
                <button
                  v-if="column.filterable"
                  @click.stop="toggleColumnFilter(column)"
                  :class="['filter-toggle', { active: columnFilters[column.key] }]"
                >
                  <font-awesome-icon :icon="['fas', 'filter']" />
                </button>
              </div>

              <!-- Column Filter -->
              <div
                v-if="column.filterable && showColumnFilter === column.key"
                class="column-filter"
                @click.stop
              >
                <input
                  v-model="columnFilters[column.key]"
                  type="text"
                  :placeholder="`Filter ${column.label}`"
                  class="column-filter-input"
                  @input="handleColumnFilter"
                />
              </div>
            </th>

            <!-- Actions Column -->
            <th v-if="rowActions.length" class="actions-column">
              Actions
            </th>
          </tr>
        </thead>

        <!-- Table Body -->
        <tbody class="table-body">
          <tr
            v-for="(item, index) in paginatedData"
            :key="getRowKey(item, index)"
            :class="getRowClasses(item, index)"
            @click="handleRowClick(item, index)"
          >
            <!-- Select Checkbox -->
            <td v-if="selectable" class="select-column">
              <input
                type="checkbox"
                :checked="isSelected(item)"
                @change="toggleSelect(item)"
                @click.stop
                class="select-checkbox"
              />
            </td>

            <!-- Data Columns -->
            <td
              v-for="column in visibleColumns"
              :key="column.key"
              :class="getCellClasses(column, item)"
            >
              <!-- Custom Slot -->
              <slot
                v-if="$slots[`cell-${column.key}`]"
                :name="`cell-${column.key}`"
                :value="getCellValue(item, column)"
                :item="item"
                :column="column"
                :index="index"
              ></slot>

              <!-- Default Cell -->
              <div v-else class="cell-content">
                {{ formatCellValue(getCellValue(item, column), column) }}
              </div>
            </td>

            <!-- Row Actions -->
            <td v-if="rowActions.length" class="actions-column">
              <div class="row-actions">
                <button
                  v-for="action in getRowActions(item)"
                  :key="action.key"
                  @click.stop="handleRowAction(action, item, index)"
                  :class="['row-action', `action-${action.variant || 'default'}`]"
                  :disabled="action.disabled"
                  :title="action.tooltip"
                >
                  <font-awesome-icon v-if="action.icon" :icon="action.icon" />
                  <span v-if="action.label">{{ action.label }}</span>
                </button>
              </div>
            </td>
          </tr>

          <!-- Empty State -->
          <tr v-if="!loading && paginatedData.length === 0" class="empty-row">
            <td :colspan="totalColumns" class="empty-cell">
              <div class="empty-state">
                <slot name="empty">
                  <font-awesome-icon :icon="['fas', 'inbox']" class="empty-icon" />
                  <p class="empty-text">{{ emptyMessage }}</p>
                </slot>
              </div>
            </td>
          </tr>

          <!-- Loading State -->
          <tr v-if="loading" class="loading-row">
            <td :colspan="totalColumns" class="loading-cell">
              <div class="loading-state">
                <div class="loading-spinner"></div>
                <p class="loading-text">{{ loadingMessage }}</p>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Table Footer -->
    <div v-if="showFooter" class="table-footer">
      <!-- Selection Info -->
      <div v-if="selectable" class="selection-info">
        <span class="selection-count">
          {{ selectedItems.length }} of {{ filteredData.length }} selected
        </span>
        <button
          v-if="selectedItems.length > 0"
          @click="clearSelection"
          class="clear-selection"
        >
          Clear selection
        </button>
      </div>

      <!-- Pagination -->
      <div v-if="paginated" class="table-pagination">
        <select v-model="pageSize" @change="handlePageSizeChange" class="page-size-select">
          <option v-for="size in pageSizeOptions" :key="size" :value="size">
            {{ size }} per page
          </option>
        </select>

        <div class="pagination-info">
          {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, filteredData.length) }}
          of {{ filteredData.length }}
        </div>

        <div class="pagination-controls">
          <button
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            class="pagination-button"
          >
            <font-awesome-icon :icon="['fas', 'chevron-left']" />
          </button>
          <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
          <button
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            class="pagination-button"
          >
            <font-awesome-icon :icon="['fas', 'chevron-right']" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'EnhancedTable',
  props: {
    // Data
    data: {
      type: Array,
      default: () => []
    },
    columns: {
      type: Array,
      required: true
    },
    
    // Table Features
    selectable: {
      type: Boolean,
      default: false
    },
    searchable: {
      type: Boolean,
      default: true
    },
    filterable: {
      type: Boolean,
      default: true
    },
    sortable: {
      type: Boolean,
      default: true
    },
    paginated: {
      type: Boolean,
      default: true
    },
    exportable: {
      type: Boolean,
      default: false
    },

    // Styling
    striped: {
      type: Boolean,
      default: false
    },
    bordered: {
      type: Boolean,
      default: true
    },
    hoverable: {
      type: Boolean,
      default: true
    },
    compact: {
      type: Boolean,
      default: false
    },
    size: {
      type: String,
      default: 'medium',
      validator: value => ['small', 'medium', 'large'].includes(value)
    },

    // Configuration
    rowKey: {
      type: String,
      default: 'id'
    },
    defaultPageSize: {
      type: Number,
      default: 10
    },
    pageSizeOptions: {
      type: Array,
      default: () => [5, 10, 25, 50, 100]
    },
    searchPlaceholder: {
      type: String,
      default: 'Search...'
    },
    emptyMessage: {
      type: String,
      default: 'No data available'
    },
    loadingMessage: {
      type: String,
      default: 'Loading...'
    },

    // External state
    loading: {
      type: Boolean,
      default: false
    },
    
    // Actions and Filters
    actions: {
      type: Array,
      default: () => []
    },
    rowActions: {
      type: Array,
      default: () => []
    },
    filters: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      // Search and Filter
      searchQuery: '',
      activeFilters: {},
      columnFilters: {},
      showColumnFilter: null,
      
      // Sorting
      sortColumn: null,
      sortDirection: 'asc',
      
      // Selection
      selectedItems: [],
      
      // Pagination
      currentPage: 1,
      pageSize: this.defaultPageSize,
      
      // UI State
      showExportMenu: false
    }
  },
  computed: {
    containerClasses() {
      return {
        [`table-${this.size}`]: true,
        'table-striped': this.striped,
        'table-bordered': this.bordered,
        'table-hoverable': this.hoverable,
        'table-compact': this.compact
      }
    },
    tableClasses() {
      return {
        'table-selectable': this.selectable
      }
    },
    visibleColumns() {
      return this.columns.filter(col => col.visible !== false)
    },
    showControls() {
      return this.searchable || this.filterable || this.actions.length || this.exportable
    },
    showFooter() {
      return this.selectable || this.paginated
    },
    totalColumns() {
      let count = this.visibleColumns.length
      if (this.selectable) count++
      if (this.rowActions.length) count++
      return count
    },
    filteredData() {
      let filtered = [...this.data]

      // Apply search
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase()
        filtered = filtered.filter(item => {
          return this.visibleColumns.some(column => {
            const value = this.getCellValue(item, column)
            return String(value).toLowerCase().includes(query)
          })
        })
      }

      // Apply filters
      Object.keys(this.activeFilters).forEach(key => {
        const filterValue = this.activeFilters[key]
        if (filterValue) {
          filtered = filtered.filter(item => {
            const value = this.getCellValue(item, { key })
            return String(value) === String(filterValue)
          })
        }
      })

      // Apply column filters
      Object.keys(this.columnFilters).forEach(key => {
        const filterValue = this.columnFilters[key]
        if (filterValue) {
          const query = filterValue.toLowerCase()
          filtered = filtered.filter(item => {
            const value = this.getCellValue(item, { key })
            return String(value).toLowerCase().includes(query)
          })
        }
      })

      return filtered
    },
    sortedData() {
      if (!this.sortColumn) return this.filteredData

      return [...this.filteredData].sort((a, b) => {
        const aVal = this.getCellValue(a, { key: this.sortColumn })
        const bVal = this.getCellValue(b, { key: this.sortColumn })

        let comparison = 0
        if (aVal < bVal) comparison = -1
        if (aVal > bVal) comparison = 1

        return this.sortDirection === 'desc' ? -comparison : comparison
      })
    },
    paginatedData() {
      if (!this.paginated) return this.sortedData

      const start = (this.currentPage - 1) * this.pageSize
      const end = start + this.pageSize
      return this.sortedData.slice(start, end)
    },
    totalPages() {
      return Math.ceil(this.filteredData.length / this.pageSize)
    },
    isAllSelected() {
      return this.paginatedData.length > 0 && this.selectedItems.length === this.paginatedData.length
    },
    isPartiallySelected() {
      return this.selectedItems.length > 0 && this.selectedItems.length < this.paginatedData.length
    },
    hasSelection() {
      return this.selectedItems.length > 0
    }
  },
  methods: {
    // Data Access
    getCellValue(item, column) {
      if (column.key.includes('.')) {
        return column.key.split('.').reduce((obj, key) => obj?.[key], item)
      }
      return item[column.key]
    },
    getRowKey(item, index) {
      return item[this.rowKey] || index
    },
    formatCellValue(value, column) {
      if (column.formatter && typeof column.formatter === 'function') {
        return column.formatter(value)
      }
      if (value === null || value === undefined) return ''
      return String(value)
    },

    // Styling
    getColumnClasses(column) {
      return {
        'sortable': column.sortable !== false && this.sortable,
        'filtered': this.columnFilters[column.key],
        [`align-${column.align || 'left'}`]: true,
        [`width-${column.width}`]: column.width
      }
    },
    getRowClasses(item, index) {
      return {
        'selected': this.isSelected(item),
        'clickable': !!this.$listeners.rowClick || !!this.$attrs.onRowClick
      }
    },
    getCellClasses(column, item) {
      return {
        [`align-${column.align || 'left'}`]: true,
        [`cell-${column.key}`]: true
      }
    },

    // Search and Filter
    handleSearch() {
      this.currentPage = 1
      this.$emit('search', this.searchQuery)
    },
    clearSearch() {
      this.searchQuery = ''
      this.handleSearch()
    },
    handleFilter() {
      this.currentPage = 1
      this.$emit('filter', this.activeFilters)
    },
    toggleColumnFilter(column) {
      this.showColumnFilter = this.showColumnFilter === column.key ? null : column.key
    },
    handleColumnFilter() {
      this.currentPage = 1
      this.$emit('columnFilter', this.columnFilters)
    },

    // Sorting
    handleSort(column) {
      if (column.sortable === false || !this.sortable) return

      if (this.sortColumn === column.key) {
        this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortColumn = column.key
        this.sortDirection = 'asc'
      }

      this.$emit('sort', { column: this.sortColumn, direction: this.sortDirection })
    },

    // Selection
    isSelected(item) {
      return this.selectedItems.some(selected => 
        this.getRowKey(selected) === this.getRowKey(item)
      )
    },
    toggleSelect(item) {
      if (this.isSelected(item)) {
        this.selectedItems = this.selectedItems.filter(selected => 
          this.getRowKey(selected) !== this.getRowKey(item)
        )
      } else {
        this.selectedItems.push(item)
      }
      this.$emit('selectionChange', this.selectedItems)
    },
    toggleSelectAll() {
      if (this.isAllSelected) {
        this.selectedItems = []
      } else {
        this.selectedItems = [...this.paginatedData]
      }
      this.$emit('selectionChange', this.selectedItems)
    },
    clearSelection() {
      this.selectedItems = []
      this.$emit('selectionChange', this.selectedItems)
    },

    // Pagination
    goToPage(page) {
      if (page >= 1 && page <= this.totalPages) {
        this.currentPage = page
        this.$emit('pageChange', page)
      }
    },
    handlePageSizeChange() {
      this.currentPage = 1
      this.$emit('pageSizeChange', this.pageSize)
    },

    // Actions
    handleAction(action) {
      this.$emit('action', { action, selectedItems: this.selectedItems })
    },
    handleRowAction(action, item, index) {
      this.$emit('rowAction', { action, item, index })
    },
    getRowActions(item) {
      return this.rowActions.filter(action => {
        if (typeof action.condition === 'function') {
          return action.condition(item)
        }
        return true
      })
    },
    handleRowClick(item, index) {
      this.$emit('rowClick', { item, index })
    },

    // Export
    exportData(format) {
      const data = {
        format,
        data: this.filteredData,
        columns: this.visibleColumns
      }
      this.$emit('export', data)
      this.showExportMenu = false
    }
  },
  watch: {
    data() {
      // Reset pagination when data changes
      this.currentPage = 1
      this.selectedItems = []
    }
  }
}
</script>

<style scoped>
/* Container */
.enhanced-table-container {
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* Controls */
.table-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  gap: 1rem;
  flex-wrap: wrap;
}

.table-search {
  flex: 1;
  min-width: 200px;
  max-width: 400px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 0.75rem;
  color: #6b7280;
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-clear {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
}

.table-filters {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
}

.table-actions {
  display: flex;
  gap: 0.5rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-button:hover:not(:disabled) {
  background: #f9fafb;
}

.action-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.action-primary {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.action-primary:hover:not(:disabled) {
  background: #2563eb;
}

.action-danger {
  background: #ef4444;
  color: white;
  border-color: #ef4444;
}

.action-danger:hover:not(:disabled) {
  background: #dc2626;
}

.table-export {
  position: relative;
}

.export-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #059669;
  color: white;
  border: none;
  border-radius: 0.375rem;
  cursor: pointer;
  font-size: 0.875rem;
}

.export-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.export-option {
  display: block;
  width: 100%;
  padding: 0.5rem 1rem;
  text-align: left;
  border: none;
  background: none;
  color: #374151;
  cursor: pointer;
  font-size: 0.875rem;
}

.export-option:hover {
  background: #f9fafb;
}

/* Table Wrapper */
.table-wrapper {
  overflow-x: auto;
  position: relative;
}

.table-loading {
  opacity: 0.7;
}

/* Table */
.enhanced-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

.table-bordered {
  border: 1px solid #e5e7eb;
}

.table-small .enhanced-table {
  font-size: 0.75rem;
}

.table-large .enhanced-table {
  font-size: 1rem;
}

/* Header */
.table-header {
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.table-header th {
  padding: 0.75rem;
  text-align: left;
  font-weight: 600;
  color: #374151;
  border-bottom: 1px solid #e5e7eb;
  position: relative;
}

.table-compact .table-header th {
  padding: 0.5rem;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.column-title {
  flex: 1;
  min-width: 0;
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background: #f3f4f6;
}

.sort-indicators {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.sort-icon {
  font-size: 0.625rem;
  color: #d1d5db;
  transition: color 0.2s;
}

.sort-icon.active {
  color: #3b82f6;
}

.filter-toggle {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
}

.filter-toggle:hover,
.filter-toggle.active {
  color: #3b82f6;
  background: #eff6ff;
}

.column-filter {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  padding: 0.5rem;
  background: white;
  border: 1px solid #d1d5db;
  border-top: none;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.column-filter-input {
  width: 100%;
  padding: 0.375rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.75rem;
}

/* Body */
.table-body tr {
  border-bottom: 1px solid #e5e7eb;
  transition: background-color 0.2s;
}

.table-striped .table-body tr:nth-child(even) {
  background: #f9fafb;
}

.table-hoverable .table-body tr:hover {
  background: #f3f4f6;
}

.table-body tr.selected {
  background: #eff6ff;
}

.table-body tr.clickable {
  cursor: pointer;
}

.table-body td {
  padding: 0.75rem;
  vertical-align: middle;
}

.table-compact .table-body td {
  padding: 0.5rem;
}

.cell-content {
  word-break: break-word;
}

.align-left { text-align: left; }
.align-center { text-align: center; }
.align-right { text-align: right; }

/* Special Columns */
.select-column {
  width: 2.5rem;
  text-align: center;
}

.select-checkbox {
  cursor: pointer;
}

.actions-column {
  width: auto;
  white-space: nowrap;
}

.row-actions {
  display: flex;
  gap: 0.25rem;
}

.row-action {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  color: #6b7280;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s;
}

.row-action:hover:not(:disabled) {
  background: #f9fafb;
  color: #374151;
}

.row-action:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* States */
.empty-cell,
.loading-cell {
  padding: 3rem;
  text-align: center;
}

.empty-state,
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
}

.empty-icon {
  font-size: 2rem;
  color: #d1d5db;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Footer */
.table-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  gap: 1rem;
  flex-wrap: wrap;
}

.selection-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.clear-selection {
  color: #3b82f6;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.875rem;
  text-decoration: underline;
}

.table-pagination {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.page-size-select {
  padding: 0.375rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  font-size: 0.875rem;
  background: white;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
}

.pagination-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-button:hover:not(:disabled) {
  background: #f9fafb;
  border-color: #9ca3af;
}

.pagination-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 0.875rem;
  color: #6b7280;
  min-width: 4rem;
  text-align: center;
}

/* Animations */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-search {
    max-width: none;
  }
  
  .table-filters,
  .table-actions {
    justify-content: flex-start;
    flex-wrap: wrap;
  }
  
  .table-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-pagination {
    justify-content: space-between;
  }
  
  .enhanced-table {
    font-size: 0.75rem;
  }
  
  .table-header th,
  .table-body td {
    padding: 0.5rem 0.25rem;
  }
  
  .row-actions {
    flex-direction: column;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .enhanced-table-container {
    background: #1f2937;
    color: #e5e7eb;
  }
  
  .table-controls {
    border-color: #374151;
  }
  
  .table-header {
    background: #374151;
    border-color: #4b5563;
    color: #f3f4f6;
  }
  
  .enhanced-table th,
  .enhanced-table td {
    border-color: #374151;
  }
  
  .table-striped .table-body tr:nth-child(even) {
    background: #374151;
  }
  
  .table-hoverable .table-body tr:hover {
    background: #4b5563;
  }
  
  .search-input,
  .filter-select,
  .page-size-select {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }
  
  .action-button {
    background: #374151;
    border-color: #4b5563;
    color: #e5e7eb;
  }
  
  .table-footer {
    background: #374151;
    border-color: #4b5563;
  }
}
</style>
