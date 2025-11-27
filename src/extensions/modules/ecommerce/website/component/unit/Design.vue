<template>
    <div class="grid-container">
        <div v-for="(row, rowIndex) in rows" :key="rowIndex" :class="rowClasses(row)">
            <div class="controls">
                <label for="columns-select" class="mr-2">Columns:</label>
                <select v-model="row.columns" class="rounded-md py-2 px-4 border border-gray-400">
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                </select>
                <button @click="addItem(rowIndex)" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                    Add Item
                </button>
                <div class="ml-auto flex gap-4">
                    <div>
                        <button @click="moveRowUp(rowIndex)" :disabled="rowIndex === 0" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Up
                        </button>
                        <button @click="moveRowDown(rowIndex)" :disabled="rowIndex === rows.length - 1" class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded">
                            Down
                        </button>
                    </div>
                    <div>
                        <input type="checkbox" v-model="row.fullWidth" id="fullwidth">
                        <label for="fullwidth">Full Width</label>
                    </div>
                    <div>
                        <input type="checkbox" v-model="row.block" id="block">
                        <label for="block">Block</label>
                    </div>
                    <div>
                        <label for="padding" class="mr-2">Padding:</label>
                        <input type="text" v-model="row.padding" class="rounded-md py-2 px-4 border border-gray-400">
                    </div>
                    <div>
                        <label for="margin" class="mr-2">Margin:</label>
                        <input type="text" v-model="row.margin" class="rounded-md py-2 px-4 border border-gray-400">
                    </div>
                    <button @click="removeRow(rowIndex)" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
                        Remove Row
                    </button>
                </div>
            </div>
            <div class="grid" :style="gridStyle(row)">
                <div v-for="(item, index) in row.items" :key="item.id" class="item" :style="itemStyle(item)">
                    <div class="bg-gray-100 p-4 rounded-lg shadow-md">
                        <div class="mb-4">
                            <label for="title" class="mr-2">Title:</label>
                            <input type="text" v-model="item.title" id="title" class="rounded-md py-2 px-4 border border-gray-400">
                        </div>
                        <div class="mb-4">
                            <label for="description" class="mr-2">Description:</label>
                            <textarea v-model="item.description" id="description" rows="4" class="rounded-md py-2 px-4 border border-gray-400"></textarea>
                        </div>
                        <div class="mb-4">
                            <label for="padding" class="mr-2">Padding:</label>
                            <input type="text" v-model="item.padding" class="rounded-md py-2 px-4 border border-gray-400" @blur="addDefaultUnit(item, 'padding')">
                        </div>
                        <div class="mb-4">
                            <label for="margin" class="mr-2">Margin:</label>
                            <input type="text" v-model="item.margin" class="rounded-md py-2 px-4 border border-gray-400" @blur="addDefaultUnit(item, 'margin')">
                        </div>
                        <button @click="removeItem(rowIndex, index)" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mt-4">
                            Remove
                        </button>
                    </div>
                </div>
            </div>
        </div>
        <button @click="addRow" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Add Row
        </button>
        <button @click="showLayoutJson" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
            Show Layout JSON
        </button>
        <!-- show layout json button -->
    <button @click="showLayoutJson" class="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
        Show Layout JSON
      </button>
      <!-- preview area -->
      <div class="preview" v-html="previewHtml"></div>
    </div>
</template>

<script>
export default {
  data() {
    return {
      rows: [
        {
          columns: 3,
          fullWidth: false,
          block: false,
          padding: '',
          margin: '',
          items: [],
        },
      ],
    };
  },
  computed: {
    gridStyle() {
      return function(row) {
        const styles = [`grid-template-columns: repeat(${row.columns}, 1fr)`];
        if (row.fullWidth) {
          styles.push('width: 100%');
        }
        if (row.padding) {
          styles.push(`padding: ${row.padding}`);
        }
        if (row.margin) {
          styles.push(`margin: ${row.margin}`);
        }
        return styles.join(';');
      };
    },
  },
  methods: {
    addRow() {
      const newRow = {
        columns: 3,
        fullWidth: false,
        block: false,
        padding: '',
        margin: '',
        items: [],
      };
      this.rows.push(newRow);
    },
    addItem(rowIndex) {
      const newItem = {
        id: this.rows[rowIndex].items.length + 1,
        title: 'New Item',
        description: 'Description for new item',
        padding: '',
        margin: '',
      };
      this.rows[rowIndex].items.push(newItem);
    },
    removeItem(rowIndex, index) {
      this.rows[rowIndex].items.splice(index, 1);
    },
    rowClasses(row) {
      return {
        'w-full': row.fullWidth,
        'block': row.block,
        'p-2': row.padding,
        'm-2': row.margin,
      };
    },
    moveRowUp(rowIndex) {
      if (rowIndex > 0) {
        const temp = this.rows[rowIndex];
        this.rows.splice(rowIndex, 1);
        this.rows.splice(rowIndex - 1, 0, temp);
      }
    },
    moveRowDown(rowIndex) {
      if (rowIndex < this.rows.length - 1) {
        const temp = this.rows[rowIndex];
        this.rows.splice(rowIndex, 1);
        this.rows.splice(rowIndex + 1, 0, temp);
      }
    },
    removeRow(rowIndex) {
      this.rows.splice(rowIndex, 1);
    },
    addDefaultUnit(element, property) {
      if (element[property] && !element[property].endsWith('px')) {
        element[property] += 'px';
      }
    },
    itemStyle(item) {
      const styles = [];
      if (item.padding) {
        styles.push(`padding: ${item.padding}`);
      }
      if (item.margin) {
        styles.push(`margin: ${item.margin}`);
      }
      return styles.join(';');
    },
    showLayoutJson() {
        const layout = [];
        this.rows.forEach((row, rowIndex) => {
            const rowObj = {
                id: `row-${rowIndex}`,
                type: 'row',
                class: this.rowClasses(row),
                columns: row.columns,
                inner: [],
            };
            row.items.forEach((item, itemIndex) => {
            const itemObj = {
                id: `item-${rowIndex}-${itemIndex}`,
                type: 'column',
                class: this.itemStyle(item),
            };
            rowObj.inner.push(itemObj);
            });
            layout.push(rowObj);
        });
        console.log(JSON.stringify(layout));
        this.renderPreview(layout);
    },
    renderPreview(layout) {
    const preview = document.querySelector('.preview');
    preview.innerHTML = convertLayoutToHtml(layout);
    }

  },
};

function convertLayoutToHtml(layout) {
  let html = '';

  layout.forEach(row => {
    const rowClasses = Object.keys(row.class || {}).filter(key => row.class[key]).concat(`grid-cols-${row.columns}`).join(' ');
    const rowStyles = row.style || '';

    html += `<div id="${row.id}" class="grid ${rowClasses}" style="${rowStyles}">`;

    row.inner.forEach((item) => {
      const itemClasses = Object.keys(item.class || {}).filter(key => item.class[key]).join(' ');
      const itemStyles = item.style || '';

      html += `<div id="${item.id}" class="item ${itemClasses} ${itemStyle(item)}" style="${itemStyles}">
        <h2>${item.title}</h2>
        <p>${item.description}</p>
      </div>`;
    });

    html += '</div>';
  });

  return html;
}

function itemStyle(item) {
  const styles = [];
  if (item.padding) {
    styles.push(`p-${item.padding.split('-').join(' ')}`);
  }
  if (item.margin) {
    styles.push(`m-${item.margin.split('-').join(' ')}`);
  }
  return styles.join(' ');
}


</script>


  
  <style>
  .grid-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .row {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  
  .grid {
    display: grid;
    grid-gap: 16px;
  }
  
  .item {
    background-color: #f7fafc;
    padding: 16px;
    border-radius: 8px;
    box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  }
  
  .controls {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  </style>
  