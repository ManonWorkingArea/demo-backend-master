<template>
<div>
    <div v-if="loading" class="overlay fixed inset-0 bg-white/90 z-50">
        <Loading />
        <div class="preload">
            <div class="loading-text">{{ loadingText }}</div>
            <div class="loading-dot"><span class="dot dot1">.</span><span class="dot dot2">.</span><span class="dot dot3">.</span></div>
        </div>
        
    </div>
    <div v-if="!loading">

        <div class="top-4 space-y-4">

            <section aria-labelledby="who-to-follow-heading">
            <div class="rounded-lg bg-white shadow">
                    <input v-model="searchTerm" placeholder="Search..." />
                    <button @click="reloadData">Reload</button>

                    <div>
                        <label for="email" class="block text-sm font-medium text-gray-700">Search candidates</label>
                        <div class="mt-1 flex rounded-md shadow-sm">
                            <div class="relative flex flex-grow items-stretch focus-within:z-10">
                                <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <!-- Heroicon name: mini/users -->
                                    <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                                    </svg>
                                </div>
                                <input type="email" name="email" id="email" class="block w-full rounded-none rounded-l-md border-gray-300 pl-10 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" placeholder="John Smith">
                            </div>
                            <button type="button" class="relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                <!-- Heroicon name: mini/bars-arrow-up -->
                                <svg class="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fill-rule="evenodd" d="M2 3.75A.75.75 0 012.75 3h11.5a.75.75 0 010 1.5H2.75A.75.75 0 012 3.75zM2 7.5a.75.75 0 01.75-.75h6.365a.75.75 0 010 1.5H2.75A.75.75 0 012 7.5zM14 7a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02l-1.95-2.1v6.59a.75.75 0 01-1.5 0V9.66l-1.95 2.1a.75.75 0 11-1.1-1.02l3.25-3.5A.75.75 0 0114 7zM2 11.25a.75.75 0 01.75-.75H7A.75.75 0 017 12H2.75a.75.75 0 01-.75-.75z" clip-rule="evenodd" />
                                </svg>
                                <span>Sort</span>
                            </button>
                        </div>
                    </div>

                    <nav>
                        <ul>
                            <li v-for="property in filterList" :key="property" class="inline">
                                <h3>{{ property }}</h3>
                                <ul>
                                    <li v-for="item in this[property]" :key="item" class="inline">
                                        <label class="inline">
                                            <input type="checkbox" :value="item" @change="selectOption(property, item)" />
                                            {{ item }}
                                        </label>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </nav>
                </div>
            </section>

            <section aria-labelledby="who-to-follow-heading">

                <table class="min-w-full divide-y divide-gray-300">
                    <thead class="bg-gray-50">
                        <tr>
                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900" v-for="column in columns" :key="column.key" @click="sortData(column.key)">
                                {{ column.label }}
                                <span v-if="sortKey === column.key">
                                    {{ computeSet[0][column.key] > computeSet[computeSet.length - 1][column.key] ? '▼' : '▲' }}
                                </span>
                                <span v-else>▼</span>
                            </th>
                            <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200 bg-white">
                        <tr v-for="item in displayedSet" :key="item.id">
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500" v-for="column in columns" :key="column.key">
                                <!-- Use custom component or custom function for column "Some Column" based on prop values -->
                                <template v-if="column.key === columnCompute.column">
                                    <template v-if="columnCompute.function">
                                        {{ columnCompute.function(item[column.key]) }}
                                    </template>
                                    <template v-else>
                                        <!-- Use the registered component -->
                                        <some-column-component :value="item[column.key]"></some-column-component>
                                    </template>
                                </template>
                                <!-- Display data in other columns directly -->
                                <template v-else>
                                    {{ item[column.key] }}
                                </template>
                            </td>
                            <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                <button type="button" class="mr-3 inline-flex justify-center rounded-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2" v-for="button in actionButton" :key="button.name" @click="handleButtonClick(button.function, item)">
                                    <font-awesome-icon :icon="['fas',button.icon]" class="text-black mt-[3px] mr-2 text-md" />
                                    {{ button.name }}
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="computeSet !== null && computeSet.length === 0">
                    No items found
                </div>

                <div class="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
                    <div class="flex flex-1 justify-between sm:hidden">
                        <a href="#" class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Previous</a>
                        <a href="#" class="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Next</a>
                        <button class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="prevPage" :disabled="currentPage === 1">prev</button>
                        <button class="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50" @click="nextPage" :disabled="currentPage === totalPages">next</button>
                    </div>
                    <div class="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div class="sm:col-span-3">
                            <div class="mt-1">
                                <label for="country" class="text-sm font-medium text-gray-700">Item Per Page</label>
                                <select v-model="selectedItemsPerPage" id="selectedItemsPerPage" name="selectedItemsPerPage" autocomplete="selectedItemsPerPage" class="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
                                    <option v-for="n in [5, 10, 20, 50, 100]" :key="n">{{ n }}</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <p class="text-sm text-gray-700" v-if="computeSet !== null && computeSet.length > 0">
                                Showing <span class="font-medium">{{ (currentPage - 1) * itemsPerPage + 1 }}</span> to <span class="font-medium">{{ currentPage * itemsPerPage }}</span> of <span class="font-medium">{{ computeSet.length }}</span> results
                            </p>
                        </div>
                        <div>
                            <nav class="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">

                                <button class="relative inline-flex items-center rounded-l-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20" @click="prevPage" :disabled="currentPage === 1">
                                    <span class="sr-only">Previous</span>
                                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clip-rule="evenodd" />
                                    </svg>
                                </button>

                                <!-- Current: "z-10 bg-indigo-50 border-indigo-500 text-indigo-600", Default: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50" -->
                                <button class="relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20" v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="{ active: page === currentPage }">{{ page }}</button>

                                <button class="relative inline-flex items-center rounded-r-md border border-gray-300 bg-white px-2 py-2 text-sm font-medium text-gray-500 hover:bg-gray-50 focus:z-20" @click="nextPage" :disabled="currentPage === totalPages">
                                    <span class="sr-only">Next</span>
                                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
                                    </svg>
                                </button>

                            </nav>
                        </div>
                    </div>
                </div>

            </section>
        </div>

    </div>
</div>
</template>

<script>
import axios from 'axios';
import Loading from '../utils/Loading';
import {
    ls
} from 'vue-lsp'
const accesstoken = ls.get("token")

export default {
    props: {
        dataUrl: {
            type: String,
            required: true,
        },
        dataKey: {
            type: String,
            required: true,
        },
        dataSort: {
            type: String,
            required: true,
        },
        columnShow: {
            type: Array,
            required: true,
        },
        itemsPerPage: {
            type: Number,
            default: 10,
        },
        actionButton: {
            type: Array,
            required: true
        },
        filterList: {
            type: Array,
            required: true
        },
        callFunction: {
            type: Function,
            required: true,
        },
        columnCompute: {
            type: Object,
            required: true,
        },
        loadingText: {
            type: String,
            default: 'กำลังโหลดข้อมูล',
        },
    },
    data() {
        return {
            masterSet: [],
            computeSet: [],
            propertyArray: [],
            searchTerm: '',
            currentPage: 1,
            sortKey: '',
            loading: false,
            filterCheck: {},
            selectedItemsPerPage: 10,
        };
    },
    components: {
        Loading,
    },
    computed: {
        properties() {
            const properties = {};
            this.filterList.forEach(property => {
                const propertyArray = this.data.map(item => item[property]);
                properties[property] = propertyArray.filter((item, index) => propertyArray.indexOf(item) === index);
            });
            return properties;
        },
        selectedOptions() {
            return Object.values(this.filterCheck).reduce((acc, val) => acc.concat(val), []);
        },
        columns() {
            return this.columnShow.map((column) => {
                return {
                    key: column.key,
                    label: column.label,
                };
            });
        },
        totalPages() {
            if (this.computeSet !== null) {
                return Math.ceil(this.computeSet.length / this.selectedItemsPerPage);
            }

            return [];
        },
        displayedSet() {
            if (this.computeSet !== null) {
                return this.computeSet.slice((this.currentPage - 1) * this.selectedItemsPerPage, this.currentPage * this.selectedItemsPerPage);
            }
            // Add a default return value
            return [];
        }
    },
    created() {
        this.loadData();
        axios.get(this.dataUrl).then((response) => {
            this.masterSet = response.data[this.dataKey];
            this.computeSet = this.masterSet;
            this.masterSet.sort(this.sortArrayData(this.dataSort));
            this.computeSet.sort(this.sortArrayData(this.dataSort));
        });
    },
    watch: {
        searchTerm: {
            handler: "searchData",
            immediate: true
        },
        masterSet() {
            // When the "masterSet" data property changes, call the "emitMasterSetLength" method
            this.emitMasterSetLength();
        }
    },
    methods: {
        emitMasterSetLength() {
            if (this.masterSet !== null) {
                this.$emit('data-length', this.masterSet.length);
            }
        },
        updateItem(itemId, newItemData) {
            const index = this.masterSet.findIndex(item => item.id === itemId);
            this.masterSet.splice(index, 1, newItemData);
            //this.refreshData();
            this.refreshData(itemId);
            console.log("Update Success");
        },
        refreshAllData() {
            // reset the propertyArray data property
            this.propertyArray = {};

            // filter the masterSet data array based on the search term and selected options
            this.computeSet = this.masterSet.filter(item => {
                let match = true;

                // check if the search term matches any property of the item
                if (this.searchTerm) {
                    match = false;
                    for (const key in item) {
                        if (item[key] && item[key].toString().toLowerCase().includes(this.searchTerm.toLowerCase())) {
                            match = true;
                            break;
                        }
                    }
                }

                // check if the item matches all the selected options
                for (const property in this.propertyArray) {
                    if (this.propertyArray[property].length > 0 && !this.propertyArray[property].includes(item[property])) {
                        match = false;
                        break;
                    }
                }

                return match;
            });

            // update the total pages and go to the first page
            this.totalPages = Math.ceil(this.computeSet.length / this.itemsPerPage);
            this.goToPage(1);

            // force update the component to display the updated data
            this.$forceUpdate();
        },
        refreshData(itemId) {
            // find the index of the modified item in the computeSet data array
            const index = this.computeSet.findIndex(item => item.id === itemId);

            // update the modified item in the computeSet data array
            this.computeSet.splice(index, 1, this.masterSet[index]);

            // force update the component to display the updated data
            this.$forceUpdate();
        },
        selectOption(property, option) {
            this.filterCheck[property] = this.filterCheck[property] || [];
            if (!this.filterCheck[property].includes(option)) {
                this.filterCheck[property].push(option);
            } else {
                this.filterCheck[property] = this.filterCheck[property].filter(opt => opt !== option);
            }
            this.filterData()
        },
        filterData() {
            let filteredSet = this.masterSet;
            for (const [property, values] of Object.entries(this.filterCheck)) {
                if (values.length === 0) continue;
                filteredSet = filteredSet.filter(item => values.includes(item[property]));
            }
            this.computeSet = filteredSet;
        },
        handleButtonClick(functionName, item) {
            this.$emit('callFunction', functionName, item);
        },
        loadNew() {
            this.reloadData()
        },
        async reloadData() {
            try {
                this.loading = true;
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accesstoken,
                };
                const response = await axios.get(this.dataUrl, {
                    headers
                });
                this.data = response.data[this.dataKey];
                this.masterSet = response.data[this.dataKey];
                this.computeSet = response.data[this.dataKey];

                this.masterSet.sort(this.sortArrayData(this.dataSort));
                this.computeSet.sort(this.sortArrayData(this.dataSort));
                this.data.sort(this.sortArrayData(this.dataSort));

                this.filterList.forEach(property => {
                    const propertyArray = this.data.map(item => item[property]);
                    this[property] = propertyArray.filter((item, index) => propertyArray.indexOf(item) === index);
                    console.log(this[property])
                });

            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        async loadData() {
            try {
                this.loading = true;
                const headers = {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + accesstoken,
                };
                const response = await axios.get(this.dataUrl, {
                    headers
                });
                this.data = response.data[this.dataKey];

                // Re-Index Item
                // this.data.sort(function(a,b){return a.createdAt._seconds < b.createdAt._seconds ? -1 : 1});
                //this.data.sort(this.sortArrayData("order"));

                this.filterList.forEach(property => {
                    const propertyArray = this.data.map(item => item[property]);
                    this[property] = propertyArray.filter((item, index) => propertyArray.indexOf(item) === index);
                    console.log(this[property])
                });

            } catch (error) {
                console.error(error);
            } finally {
                this.loading = false;
            }
        },
        convertTimestampToDate(timestamp) {
            // Use the "seconds" and "nanoseconds" fields of the Timestamp object to get the number of milliseconds since the Unix epoch
            const timestampMillis = timestamp._seconds * 1000 + timestamp._nanoseconds / 1000000;
            // Create a new Date object using the timestampMillis value
            return new Date(timestampMillis);
        },
        compareTimestamps(a, b) {
            // Convert the timestamps to Date objects
            const dateA = this.convertTimestampToDate(a.createdAt);
            const dateB = this.convertTimestampToDate(b.createdAt);
            // Compare the dates and return the result
            if (dateA > dateB) return -1;
            if (dateA < dateB) return 1;
            return 0;
        },
        sortArrayData(key) {
            return (a, b) => {
                if (a[key] > b[key]) {
                    return -1;
                }
                if (a[key] < b[key]) {
                    return 1;
                }
                return 0;
            };
        },
        searchData() {
            this.currentPage = 1;
            this.computeSet = this.masterSet.filter((item) => {
                return this.columnShow.some((column) => {
                    if (item && column.key && (typeof item[column.key] === 'string' || typeof item[column.key] === 'number')) {
                        return item[column.key].toString().toLowerCase().includes(this.searchTerm.toString().toLowerCase());
                    }
                });
            });
        },
        sortData(key) {
            if (this.sortKey === key) {
                this.computeSet = this.computeSet.reverse();
            } else {
                this.sortKey = key;
                this.computeSet = this.computeSet.sort((a, b) => {
                    if (a[key] < b[key]) return -1;
                    if (a[key] > b[key]) return 1;
                    return 0;
                });
            }
        },
        goToPage(page) {
            console.log(`goToPage called with page: ${page}`);
            this.currentPage = page;
        },
        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            } else {
                this.currentPage = this.totalPages;
            }
        },
        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            } else {
                this.currentPage = 1;
            }
        },
    },
};
</script>

<style>
.loader-spinner {
    width: 64px;
    height: 44px;
    position: relative;
    border: 5px solid #000;
    border-radius: 8px;
}

.loader-spinner::before {
    content: '';
    position: absolute;
    border: 5px solid #000;
    width: 32px;
    height: 28px;
    border-radius: 50% 50% 0 0;
    left: 50%;
    top: 0;
    transform: translate(-50%, -100%)
}

.loader-spinner::after {
    content: '';
    position: absolute;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #000;
    box-shadow: 16px 0 #000, -16px 0 #000;
    animation: flash 0.5s ease-out infinite alternate;
}



.overlay {
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.active {
    background-color: blue;
    color: white;
}

.inline {
    display: inline-block;
    margin-right: 10px;
}

.spinner {
    font-size: 16px;
    font-weight: bold;
    color: #333;
}
</style>
