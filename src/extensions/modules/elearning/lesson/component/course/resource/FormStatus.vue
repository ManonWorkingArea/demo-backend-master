<template>
    <div v-if="statusArray && statusArray.length > 0">

        <div class="tab-navigation">
            <!-- Tabbed UI for status -->
            <div class="tab-header pt-5 pl-3 pr-2 bg-gray-100 border-t border-gray-300">
                <div class="tab-line"></div>
                <div class="tab-area flex">
                    <div class="tab-item py-2 px-4 cursor-pointer mr-1 flex" :class="{
                        'bg-white text-gray-700 z-50 rounded-t-sm border-t border-gray-300 border-l border-gray-300 border-r border-gray-300 shadow-[rgba(0,0,15,0.5)_1px_-4px_13px_-11px] active-tab': isAllSelected,
                        'bg-gray-200 text-gray-600 rounded-t-sm border-t border-gray-300 border-l border-gray-300 border-r border-gray-300 border-b border-gray-300': !isAllSelected,
                    }" @click="setCurrentStatusAll()">
                        <div class="tab-icon">
                            <!-- FontAwesome icon for "All" -->
                            <font-awesome-icon :icon="['fas', 'icons']" class="text-sm mr-2" />
                        </div>
                        <div class="flex flex-col">
                            <div class="status-name">{{ 'All' }} 
                                <!-- Badge -->
                                <span v-if="allItemBadge" class="tab-badge ml-1">{{ allItemBadge }}</span>
                            </div>
                            <!-- Description -->
                            <div class="status-description text-xs text-gray-400">ทั้งหมด</div>
                        </div>
                    </div>
                                     
                    <div v-for="(status, index) in statusArray" :key="index" @click="setCurrentStatus(status)" :class="{
                        'tab-item': true, // Add the 'tab-item' class here
                        'py-2 px-4 cursor-pointer mr-1 flex': true,
                        'bg-white text-gray-700 z-50 rounded-t-sm border-t border-gray-300 border-l border-gray-300 border-r border-gray-300 shadow-[rgba(0,0,15,0.5)_1px_-4px_13px_-11px]': status === currentStatus,
                        'bg-gray-200 text-gray-600 rounded-t-sm border-t border-gray-300 border-l border-gray-300 border-r border-gray-300 border-b border-gray-300': status !== currentStatus,
                        'active-tab': status === currentStatus
                        }" style="max-width: calc(70% - 5px);">
                        <div class="tab-icon">
                            <font-awesome-icon :icon="['fas', status.icon]" class="text-sm mr-2" />
                        </div>
    
                        <!-- Title and description in the right column -->
                        <div class="flex flex-col relative">
                            <div><div class="status-name" :class="{ 'font-normal': status.code === currentStatus.code }">{{ status.name }} <span v-if="status.badge !== null" class="tab-badge">{{ status.badge }}</span></div></div>
                            <div class="status-description text-xs text-gray-400 single-line-ellipsis">{{ status.description }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Custom mobile navigation -->
        <div class="mobile-navigation">
            <div class="dropdown" @click="dropdownOpen = !dropdownOpen">
                <div class="dropdown-selected">
                    <div class="flex justify-between">
                        <div class="flex">
                            <div class="tab-icon">
                                <font-awesome-icon :icon="['fas', currentStatus.icon]" class="text-sm mr-2" />
                            </div>
                            <div class="flex flex-col">
                                <div><div class="status-name active-tab font-bold">{{ currentStatus.name }} <span v-if="currentStatus.badge !== null" class="tab-badge">{{ currentStatus.badge }}</span></div></div>
                                <div class="status-description text-xs text-gray-400 single-line-ellipsis">{{ currentStatus.description }}</div>
                            </div>
                        </div>
                        <div class="tab-icon icon-line">
                            <font-awesome-icon :icon="dropdownOpen ? ['fas', 'caret-up'] : ['fas', 'caret-down']" class="text-sm ml-2" />
                        </div>
                    </div>
                </div>
                <div class="dropdown-content" v-show="dropdownOpen">
                    <div class="dropdown-item flex justify-between items-center" @click="setCurrentStatusAll()">
                        <div class="flex items-center">
                            <!-- Icon -->
                            <font-awesome-icon :icon="['fas', 'icons']" class="text-sm mr-2" />
                            <!-- Description -->
                            <div class="flex flex-col">
                                <div class="status-name">{{ 'All' }}
                                    <!-- Badge, shown conditionally -->
                                    <span v-if="badgeContent" class="tab-badge ml-2">{{ badgeContent }}</span>
                                </div>
                                <div class="status-description text-xs text-gray-400">ทั้งหมด</div>
                            </div>
                        </div>
                    </div>
                                      
                    <div class="dropdown-item" v-for="(status, index) in statusArray" :key="index" @click="setCurrentStatus(status)">
                        <div class="flex justify-between">
                            <div class="flex">
                                <div class="tab-icon">
                                    <font-awesome-icon :icon="['fas', status.icon]" class="text-sm mr-2" />
                                </div>
                                <div class="flex flex-col">
                                    <div class="status-name" :class="{ 'font-bold': status.code === currentStatus.code }">{{ status.name }}</div>
                                    <div class="status-description text-xs text-gray-400 single-line-ellipsis">{{ status.description }}</div>
                                </div>
                            </div>
                            <div class="tab-icon icon-line">
                                <span v-if="status.badge !== null" class="tab-badge">{{ status.badge }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    
        <div v-if="debug">
    
            <h1>Status Viewer</h1>
    
            <div>
                <label for="statusCode">Enter Status Code:</label>
                <input id="statusCode" type="text" v-model="inputCode" @input="calculatePercentage" />
                <button @click="getStatusByCode">Get</button>
            </div>
    
            Status Item :: <br/>
            <pre>{{statusArray}}</pre>
            <ul>
                <li v-for="(status, index) in statusArray" :key="index">
                    <strong>Status Name:</strong> {{ status.name }}
                    <p><strong>Code:</strong> {{ status.code }}</p>
    
                    <ul>
                        <li v-for="(option, optionIndex) in status.options" :key="optionIndex">
                            <strong>Option {{ optionIndex + 1 }}:</strong> {{ option }}
                        </li>
                    </ul>
    
                    <div v-if="statusIndices[index].prev !== null">Previous Status Code: {{ statusArray[statusIndices[index].prev].code }}</div>
                    <div v-if="statusIndices[index].next !== null">Next Status Code: {{ statusArray[statusIndices[index].next].code }}</div>
                </li>
            </ul>
    
            <br/>
            <br/>
    
            <!-- Display the active tab's content -->
            <div v-if="currentStatus !== null">
                <strong>Status Name:</strong> {{ currentStatus.name }}
                <p><strong>Code:</strong> {{ currentStatus.code }}</p>
                <p><strong>Percentage:</strong> {{ percentage }}%</p>
                <ul>
                    <li v-for="(option, optionIndex) in currentStatus.options" :key="optionIndex">
                        <strong>Option {{ optionIndex + 1 }}:</strong> {{ option }}
                    </li>
                </ul>
            </div>
    
            <div>
                <p><strong>Total Statuses:</strong> {{ statusArray.length }}</p>
                <p v-if="statusArray.length > 0"><strong>First Status Code:</strong> {{ statusArray[0].code }}</p>
                <p v-if="statusArray.length > 0"><strong>Last Status Code:</strong> {{ statusArray[statusArray.length - 1].code }}</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        statusArray: Array,
        allItemBadge:Number,
        debug: Boolean,
        activeStatus: String,
    },
    data() {
        return {
            dropdownOpen: false,
            inputCode: '',
            percentage: 0,
            selectedStatus: this.statusArray.length > 0 ? this.statusArray[0] : null,
            isAllSelected: true, // Start with "All" being selected
        };
    },
    computed: {
        statusIndices() {
            return this.calculateStatusIndices();
        },
        currentStatus() {
            // Handle the "All" selection state
            if (this.isAllSelected) {
                return { name: 'All', code: 'all', icon:'icons',description: 'ทั้งหมด',badge:this.allItemBadge };
            }
            return this.selectedStatus;
        },
    },
    created() {
        if (this.statusArray.length > 0) {
            this.$emit('status-selected', { all: true, statuses: this.statusArray });
            this.updateStatusObject();
        }
    },
    watch: {
        activeStatus(newStatus) {
            this.setCurrentStatusByCode(newStatus);
        },
    },
    methods: {
        setCurrentStatusByCode(code) {
            if (code === 'all') {
                this.setCurrentStatusAll();
            } else {
                const statusToActivate = this.statusArray.find(status => status.code === code);
                if (statusToActivate) {
                    this.setCurrentStatus(statusToActivate);
                }
            }
        },
        updateStatusObject() {
            const total = this.statusArray.length;
            if (this.isAllSelected) {
                // When "All" is selected
                const statusObject = {
                    first: this.statusArray[0] ? this.statusArray[0].code : null,
                    next: this.statusArray[0] ? this.statusArray[0].code : null, // Next is the first item
                    prev: null, // Prev is null when "All" is selected
                    last: this.statusArray[total - 1] ? this.statusArray[total - 1].code : null,
                    total: total,
                    current: 'All',
                };
                this.$emit('update-status', statusObject);
            } else {
                // Specific status selection handling
                const currentIndex = this.statusArray.findIndex(status => status.code === this.selectedStatus.code);
                const statusObject = {
                    first: this.statusArray[0] ? this.statusArray[0].code : null,
                    next: currentIndex < total - 1 ? this.statusArray[currentIndex + 1].code : null, // Set next to null if current is the last item
                    prev: currentIndex > 0 ? this.statusArray[currentIndex - 1].code : null, // Set prev to null if current is the first item
                    last: this.statusArray[total - 1] ? this.statusArray[total - 1].code : null,
                    total: total,
                    current: this.selectedStatus ? this.selectedStatus.code : null,
                };
                this.$emit('update-status', statusObject);
            }
        },
        setCurrentStatusAll() {
            this.isAllSelected = true;
            this.selectedStatus = null;
            this.$emit('status-selected', 'all');
            this.updateStatusObject();
        },
        setCurrentStatus(status) {
            this.isAllSelected = false;
            this.selectedStatus = status;
            this.calculatePercentage(status.code)
            this.getStatusByCode(status.code)
            console.log("status", status);
            this.$emit('status-selected', this.selectedStatus);
            this.updateStatusObject();
        },
        calculateStatusIndices() {
            const indices = [];
            const totalStatuses = this.statusArray.length;

            for (let i = 0; i < totalStatuses; i++) {
                const prevIndex = i === 0 ? null : i - 1;
                const nextIndex = i === totalStatuses - 1 ? null : i + 1;
                indices.push({ prev: prevIndex, next: nextIndex });
            }

            return indices;
        },
        calculatePercentage(code) {
            if (Array.isArray(this.statusArray)) {
                const foundStatus = this.statusArray.find((status) => status.code === code);
                if (foundStatus) {
                    const index = this.statusArray.indexOf(foundStatus);
                    this.percentage = ((index + 1) / this.statusArray.length) * 100;
                } else {
                    this.percentage = 0;
                }
            }
        },
        getStatusByCode(code) {
            this.selectedStatus = this.statusArray.find((status) => status.code === code) || null;
        },
    },
};
</script>

<style scoped>
.tab-navigation {
    display: block;
}

.mobile-navigation {
    display: none;
}

.icon-line {}

.dropdown {
    position: relative;
    display: inline-block;
    padding: 10px;
    border: 1px solid #d0d0d0;
    width: 100%;
    border-radius: 5px;
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.1);
}

.dropdown-content {
    display: none;
    position: absolute;
    background-color: #fff;
    box-shadow: 0px 1px 4px 0px rgba(0, 0, 0, 0.1);
    z-index: 1;
    width: 100%;
    left: 0;
    top: 70px;
    border: solid 1px #d0d0d0;
    border-radius: 5px;
}

.dropdown-content .dropdown-item {
    color: black;
    padding: 12px 16px;
    text-decoration: none;
    display: block;
}

.dropdown-content .dropdown-item:hover {
    background-color: #717171
}

.dropdown:hover .dropdown-content {
    display: block;
}

/* Hide tab navigation and show custom dropdown on small screens */

@media (max-width: 768px) {
    .tab-navigation {
        display: none;
    }
    .mobile-navigation {
        display: block;
        padding: 10px;
    }
}

.tab-container {
    display: flex;
}

.tab-header {
    height: 70px;
    position: relative;
}

.tab-area {
    position: absolute;
    bottom: 0px;
    display: flex;
    /* Use flex display to adjust tab widths */
    flex-wrap: wrap;
    /* Allow tabs to wrap to the next line when needed */
    justify-content: flex-start;
    /* Start from the left */
    align-items: stretch;
    /* Make sure tabs stretch to fill available space */
}

.tab-item {
    /*flex: 1;
    /* Allow tabs to grow equally within the available space */
    /*max-width: calc(70% - 5px);
    /* Set max-width based on your requirement */
}

.tab-line {
    width: 100%;
    height: 1px;
    background: #d8d8d8;
    position: absolute;
    bottom: 0;
    left: 0;
}

.tab-icon {
    position: relative;
    width: 20px;
    height: 20px;
    margin-right: 5px;
    margin-top: 7px;
    text-align: center;
    padding-left: 0px;
    font-size: 15px;
}

.tab-badge {
    background: #999999;
    color: #fff;
    padding: 0px 5px 0px 5px;
    font-size: 12px;
    border-radius: 3px;
}

.single-line-ellipsis {
    white-space: nowrap;
    /* Prevent line breaks */
    overflow: hidden;
    /* Hide overflowing content */
    text-overflow: ellipsis;
    /* Display ellipsis (...) for truncated text */
}

.tab-area .cursor-pointer:not(.active-tab):hover {
    background-color: #f1f1f1;
    color: #938d8d;
}

.active-tab {
    /*margin-top: -5px;
    padding-top: 14px;*/
}

.active-tab .tab-badge{
    background: #ff0000;
}
</style>
