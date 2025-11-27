<template>
<div>

    <div v-if="loading">Loading...</div>
    <input class="search-input" v-model="searchQuery" placeholder="Search..." />
    <nav>
        <a class="nav-item" :class="{ active: !currentCategory }" @click="$emit('update:currentCategory', null)">Show All</a>
        <template v-for="(group, index) in filterGroups" :key="index">
            <a class="nav-item" :class="{ active: group[0] === currentCategory }" @click="$emit('update:currentCategory', group[0])">{{ group[0] }}</a>
        </template>
    </nav>

    <table v-if="isDesktopSize">
        <thead>
            <tr>
                <th v-for="key in visibleKeys" :key="key">{{ key }}</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="(item, index) in pagedFilteredAndGroupedItems[currentPage]" :key="index">
                <td v-for="key in visibleKeys" :key="key">{{ item[key] }}</td>
                <td>
                    <template v-for="button in actionButtons" :key="button.function">
                        <button @click="onActionButtonClick(button.function, item)">{{ button.name }}</button>
                    </template>
                </td>
            </tr>
        </tbody>
    </table>

    <div v-else>
        <template v-for="(item, index) in pagedFilteredAndGroupedItems[currentPage]" :key="index">
            <div class="accordion" @click="item.expanded = !item.expanded">
                <div>{{ item[headerKey] }} <span class="icon">{{ item.expanded ? '▼' : '▶' }}</span></div>
            </div>
            <div class="accordion-panel" v-if="item.expanded">
                <div v-for="key in visibleKeys" :key="key">{{ key }}: {{ item[key] }}</div>
                <div>
                    <template v-for="button in actionButtons" :key="button.function">
                        <button @click="onActionButtonClick(button.function, item)">{{ button.name }}</button>
                    </template>
                </div>
            </div>
        </template>
    </div>

    <div v-if="totalPages > 1">
        <button class="pagination-item" v-if="currentPage > 0" @click="$emit('update:currentPage', currentPage - 1)">Prev</button>
        Page {{ currentPage + 1 }} of {{ totalPages }}
        <button class="pagination-item" v-if="currentPage < totalPages - 1" @click="$emit('update:currentPage', currentPage + 1)">Next</button>
    </div>

</div>
</template>

    
    
<script>
import axios from 'axios'
import {
    ls
} from 'vue-lsp'
const accesstoken = ls.get("token")
export default {
    name: 'DataTable',
    props: {
        url: {
            type: String,
            required: true
        },
        itemsAttr: {
            type: String,
            required: true
        },
        headerKey: {
            type: String,
            required: true
        },
        actionButtons: {
            type: Array,
            required: true
        },
        columnHidden: {
            type: Array,
            required: true
        },
        filterGroup: {
            type: String,
            required: true
        },
        currentPage: {
            type: Number,
            required: true
        },
        itemsPerPage: {
            type: Number,
            required: true
        },
        currentCategory: {
            type: String,
            required: false
        }
    },
    data() {
        return {
            completeSet: [], // store the complete set of data here
            items: [],
            isDesktopSize: true,
            loading: true,
            searchQuery: '',
        };
    },
    created() {
        this.fetchData()
        const options = {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + accesstoken,
            },
        };
        this.checkScreenSize();
        window.addEventListener('resize', this.checkScreenSize);
        fetch(this.url, options)
            .then((response) => response.json())
            .then((data) => {
                this.items = data[this.itemsAttr];
                this.loading = false;
            });
    },
    beforeUnmount() {
        window.removeEventListener('resize', this.checkScreenSize);
    },
    computed: {

        modifiedSearchQuery: function () {
            return this.searchQuery.trim();
        },
        visibleKeys() {
            if (this.items && this.items.length) {
                return Object.keys(this.items[0]).filter(key => !this.columnHidden.includes(key));
            }
            return [];
        },
        pagedFilteredAndGroupedItems() {
            let items = this.filteredItems
            let groups = {}
            items.forEach(item => {
                let group = item[this.filterGroup]
                if (!groups[group]) {
                    groups[group] = []
                }
                groups[group].push(item)
            })
            let pagedItems = []
            for (let i = 0; i < Math.ceil(items.length / this.itemsPerPage); i++) {
                pagedItems.push(items.slice(i * this.itemsPerPage, (i + 1) * this.itemsPerPage))
            }
            return pagedItems
        }

        ,
        filteredAndGroupedItems() {
            let filteredItems = this.filteredItems;

            // group the items by the filterGroup key if currentCategory is not null
            if (this.currentCategory) {
                const groupedItems = this.groupBy(filteredItems, this.filterGroup);
                if (groupedItems[this.currentCategory]) {
                    filteredItems = groupedItems[this.currentCategory];
                }
            }

            return filteredItems;
        },
        filterGroups() {
            // create an empty object to store the category groups
            const groups = {};

            // loop through the items and group them by category
            for (const item of this.items) {
                if (!groups[item[this.filterGroup]]) {
                    groups[item[this.filterGroup]] = [];
                }
                groups[item[this.filterGroup]].push(item);
            }

            // convert the object to an array and sort it by category name
            return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0]));
        },
        filteredItems() {
            let items = this.completeSet
            if (this.searchQuery) {
                items = items.filter(item => {
                    return Object.values(item).some(value => {
                        return String(value).toLowerCase().includes(this.searchQuery.toLowerCase())
                    })
                })
            }
            if (this.currentCategory) {
                items = items.filter(item => item[this.filterGroup] === this.currentCategory)
            }
            return items
        },
        totalPages() {
            return Math.ceil(this.filteredAndGroupedItems.length / this.itemsPerPage);
        },
        pagedItems() {
            const pages = [];
            for (let i = 0; i < this.totalPages; i++) {
                pages.push(this.filteredItems.slice(i * this.itemsPerPage, (i + 1) * this.itemsPerPage));
            }
            return pages;
        }
    },
    watch: {
        // watch for changes to the currentPage and itemsPerPage props
        currentPage: {
            handler(newValue) {
                this.items = this.filteredItems.slice(newValue * this.itemsPerPage, (newValue + 1) * this.itemsPerPage)
            },
            immediate: true,
        },
        itemsPerPage: {
            handler(newValue) {
                this.items = this.filteredItems.slice(this.currentPage * newValue, (this.currentPage + 1) * newValue)
            },
            immediate: true,
        },
    },
    methods: {
        fetchData() {
            this.loading = true
            // fetch the data and store it in completeSet
            axios.get(this.url, {
                    headers: {
                        "Authorization": `Bearer ${accesstoken}`
                    }
                })
                .then(response => {
                    this.completeSet = response.data[this.itemsAttr]
                    this.items = this.completeSet.slice(this.currentPage * this.itemsPerPage, (this.currentPage + 1) * this.itemsPerPage)
                    this.loading = false
                })
                .catch(error => {
                    console.error(error)
                    this.loading = false
                })
        },
        groupBy(array, key) {
            // create an empty object to store the groups
            const groups = {};

            // loop through the array and add each item to the appropriate group
            array.forEach(item => {
                const group = item[key];
                if (!groups[group]) {
                    groups[group] = [];
                }
                groups[group].push(item);
            });

            return groups;
        },
        filterAndGroupItems(items, searchQuery, currentCategory) {
            // filter the items based on the search query
            let filteredItems = items.filter(item => {
                return Object.values(item).some(value => value.toString().includes(searchQuery));
            });

            // if no category is selected, return the filtered items as-is
            if (!currentCategory) {
                return filteredItems;
            }

            // otherwise, group the filtered items by category
            const groups = {};
            for (const item of filteredItems) {
                if (!groups[item.category]) {
                    groups[item.category] = [];
                }
                groups[item.category].push(item);
            }

            // return only the items in the selected category
            return groups[currentCategory];
        },
        checkScreenSize() {
            this.isDesktopSize = window.innerWidth >= 1024;
        },
        onActionButtonClick(buttonFunction, item) {
            if (typeof this[buttonFunction] === 'function') {
                this[buttonFunction]();
            }
            this.$emit('functionFromDataTable', buttonFunction, item);
        }
    }
};
</script>
    
    
<style>
.search-input {
    border: 1px solid gray;
    border-radius: 5px;
    padding: 5px 10px;
    width: 200px;
}

.nav-item {
    display: inline-block;
    margin-right: 8px;
    text-decoration: none;
    color: #000;
}

.nav-item.active {
    font-weight: bold;
    color: #f00;
}

table {
    border-collapse: collapse;
    width: 100%;
}

th,
td {
    border: 1px solid #dddddd;
    text-align: left;
    padding: 8px;
}

tr:nth-child(even) {
    background-color: #dddddd;
}

.accordion {
    background-color: #eee;
    color: #444;
    cursor: pointer;
    padding: 18px;
    width: 100%;
    border: none;
    text-align: left;
    outline: none;
    font-size: 15px;
    transition: 0.4s;
    font-weight: bold;
}

.accordion:hover {
    background-color: #ccc;
}

.accordion.active,
.accordion:hover {
    background-color: #ddd;
}

.accordion-panel {
    padding: 0 18px;
    background-color: white;
    max-height: 500px;
    /* change this value to make the panel visible by default */
    overflow: hidden;
    transition: max-height 0.2s ease-out;
}

.accordion .icon {
    float: right;
}

.pagination-item {
    display: inline-block;
    border: 1px solid #ccc;
    color: #333;
    text-align: center;
    padding: 8px 16px;
    margin: 0 4px;
    cursor: pointer;
    transition: background-color 0.2s ease-out;
}

.pagination-item:hover {
    background-color: #eee;
}

.pagination-item.active {
    background-color: #ddd;
    color: #333;
    cursor: default;
}

nav {
    display: flex;
    border-bottom: 1px solid gray;
}

.nav-item {
    flex: 1;
    text-align: center;
    padding: 10px 0;
    border-right: 1px solid gray;
    cursor: pointer;
}

.nav-item:last-child {
    border-right: none;
}

.nav-item.active {
    background-color: lightgray;
    color: white;
    font-weight: bold;
}
</style>
