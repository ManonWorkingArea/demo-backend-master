<script>
// Component
import {useRoute} from 'vue-router'
import storageManager from '@/plugins/storage';
import Loader from '@/interface/template/Loader.vue';
import Subhead from '@/interface/template/outline/Subhead.vue';
import Pagination from '@/utils/Paginated.vue';
import ItemDisplay from '@/utils/ItemDisplay.vue';
import {translate} from '@/plugins/language.js';

export default {
    data() {
        const route = useRoute();
        const session = storageManager.get('session')
        const configs = storageManager.get("configs");
        const schoolSession = configs;

        return {
            schoolSession: schoolSession,
            PageName: route.meta.title,
            PageIcon: route.meta.icon,
            PagePath: route.meta.path,
            ParentName: route.meta.parent,
            ParentPage: route.meta.page,
            school: session.current.id,
            login: session.login,
            listItems: [],
            categoryData: [],
            loading_sources: true,
            pages: 0,
            current: 0,
            total: 0,
            viewMode: 'list',
            accessToken: storageManager.get('session', 'token'),
            configs: storageManager.get('configs'),
            session: storageManager.get('session'),
            limitItem: 20,
            limitOptions: [5,10, 20, 30, 50, 100, 200, 500, 1000, 2000],
            currentPage: 1,
            totalPages: 0,
            totalItems: 0,
            loading: false,
            showingOverlay: false,
            searchQuery: "",
            typeFilter: ["page", "form", "layout", "menu"],
            statusFilter: [true, false], 
            typeOptions: [{
                name: 'หน้าเว็บ',
                value: 'page'
            },
            {
                name: 'แบบฟอร์ม',
                value: 'form'
            },
            {
                name: 'ดีไซน์',
                value: 'layout'
            },
            {
                name: 'เมนู',
                value: 'menu'
            }],
            statusOptions: [{
                name: this.translate('general-public'),
                value: true
            },
            {
                name: this.translate('general-unpublic'),
                value: false
            }],
        }
    },
    components: {
        Loader,
        Subhead,
        Pagination,
        ItemDisplay
    },
    methods: {
        translate,
        handleLimitChange() {
            const session = storageManager.get('session');
            session.limitItem = this.limitItem;
            storageManager.set('session', session);
            this.currentPage = 1;
            session.currentPage = this.currentPage;
            storageManager.set('session', session);
            const updatedUrlParams = new URLSearchParams(window.location.search);
            updatedUrlParams.set('page', session.currentPage);
            const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
            window.history.replaceState({}, '', updatedUrl);
            this.getData();
        },
        handlePageChanged(page) {
            if (page !== this.currentPage) {
                window.scrollTo(0, 0);
                this.currentPage = page;
                const session = storageManager.get('session');
                session.currentPage = this.currentPage;
                storageManager.set('session', session);
                this.getData();
            }
        },
        clearSearchQuery() {
            this.searchQuery = '';
            const session = storageManager.get('session');
            session.searchQuery = '';
            storageManager.set('session', session);
            this.getData();
        },
        toggleFilter() {
            this.getData();
        },
        async getData() {
            try {
                this.loading = true;
                this.activeBlock = true

                let andConditions = [{
                    owner: this.session.current._id
                }];

                if (!this.typeFilter.includes('all')) {
                    andConditions.push({
                        type: {
                            $in: this.typeFilter
                        }
                    });
                }

                // if (!this.statusFilter.includes('all')) {
                //     andConditions.push({
                //         status: {
                //             $in: this.statusFilter
                //         }
                //     });
                // }

                if (this.searchQuery) {
                    andConditions.push({
                        $or: [
                            { title: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { content: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } },
                            { slug: { $regex: `.*${this.searchQuery}.*`, $options: 'i' } }
                        ]
                    });
                }
                
                if (['manager'].includes(this.session.role)) {
                    andConditions.push({
                        admin: this.session.userID
                    });
                }

                const pipeline = [
                    {
                        $match: {
                            $and: andConditions,
                        },
                    },
                    {
                        $sort: {
                            createdAt: -1,
                            status: -1,
                            type: 1,
                        }
                    },
                    {
                        $lookup: {
                            from: "form",
                            let: { formIdStr: { $toString: "$_id" } },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$$formIdStr", "$formID"]
                                        }
                                    }
                                },
                                {
                                    $count: "formCount"
                                }
                            ],
                            as: "formCountArray"
                        }
                    },
                    {
                        $addFields: {
                            formCount: {
                                $ifNull: [{ $arrayElemAt: ["$formCountArray.formCount", 0] }, 0]
                            }
                        }
                    },
                    {
                        $lookup: {
                            from: "post",
                            let: { postIdStr: { $toString: "$_id" } },
                            pipeline: [
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ["$$postIdStr", "$parent"]
                                        }
                                    }
                                },
                                {
                                    $count: "subItemCount"
                                }
                            ],
                            as: "subItemCountArray"
                        }
                    },
                    {
                        $addFields: {
                            subItemCount: {
                                $ifNull: [{ $arrayElemAt: ["$subItemCountArray.subItemCount", 0] }, 0]
                            }
                        }
                    },
                    {
                        $project: {
                            formCountArray: 0,
                            subItemCountArray: 0,
                        }
                    },
                    {
                        $facet: {
                            paginatedData: [{ $skip: (this.currentPage - 1) * this.limitItem }, { $limit: this.limitItem }],
                            totalCount: [{ $count: "count" }]
                        }
                    }
                ];

                const { data: dataReturn, status } = await this.$Request.POST(`post/aggregate`, { pipeline },this.configs.key);

                if (status === 200) {

                    if (dataReturn.length > 0 && dataReturn[0].paginatedData.length > 0) {
                        const paginatedData = dataReturn[0].paginatedData;
                        const totalCount    = dataReturn[0].totalCount[0].count;

                        const formattedData = {
                            data: paginatedData,
                            total: totalCount,
                            paging: {
                                page: this.currentPage,
                                limit: this.limitItem,
                                totalPages: Math.ceil(totalCount / this.limitItem)
                            }
                        };

                        this.listItems = formattedData.data;
                        this.totalItems = formattedData.total;
                        this.totalPages = formattedData.paging.totalPages;
                        this.loading = false;
                        this.activeBlock = false;
                    } else {
                        this.listItems = [];
                        this.totalItems = 0;
                        this.totalPages = 0;
                        this.loading = false;
                        this.activeBlock = false;
                    }
                }

            } catch (error) {
                console.log(error);
            }
        },
    },
    async mounted() {
        try {
            const urlParams = new URLSearchParams(window.location.search);
            const page = urlParams.get('page');
            if (page && /^\d+$/.test(page)) {
                this.currentPage = parseInt(page);
            } else {
                const session = storageManager.get('session');
                if (session && session.currentPage) {
                    this.currentPage = session.currentPage;
                    const updatedUrlParams = new URLSearchParams(window.location.search);
                    updatedUrlParams.set('page', session.currentPage);
                    const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
                    window.history.replaceState({}, '', updatedUrl);
                }
            }
            const session = storageManager.get('session');
            if (session && session.searchQuery) {
                this.searchQuery = session.searchQuery;
            }
            const storedLimitItem = session.limitItem;
            if (storedLimitItem) {
                this.limitItem = storedLimitItem;
            }

            await this.getData();
        } catch (error) {
            console.log(Error);
        }
    },
    watch: {
        searchQuery() {
            clearTimeout(this.debounceTimer);
            this.debounceTimer = setTimeout(() => {
                this.getData();
                const session = storageManager.get('session');
                session.searchQuery = this.searchQuery;
                storageManager.set('session', session);

                this.currentPage = 1;
                const updatedUrlParams = new URLSearchParams(window.location.search);
                updatedUrlParams.set('page', session.currentPage);
                const updatedUrl = `${window.location.pathname}?${updatedUrlParams.toString()}`;
                window.history.replaceState({}, '', updatedUrl);
            }, 500);
        }
    },
    computed: {
        filteredListItems() {
            if (this.selectedStatus === "All") {
                return this.listItems;
            } else {
                return this.listItems.filter(item => item.status === this.selectedStatus);
            }
        }
    }
};
</script>

<template>

<div v-if="!loading_sources" class="text-center"><Loader /></div>

<div v-if="loading_sources">

    <Subhead :navigation="[{
    name: translate('lesson-new'),
    link: '/lesson/add',
    style: 'plus',
    class: 'default-btn',
    type: 'button',
    }]"
    />
    
    <div class="flex-1 pb-8 bg-gray-100 pt-2 pb-5 border-t">
        <div class="mt-2">
            <div class="mx-auto px-6 sm:px-6 lg:px-6">
                <div class="mt-2 flex flex-col">
                    <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">

                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <label class="block mb-2 font-bold">{{ translate('lesson-type') }}:</label>
                                    <div class="grid grid-cols-3 gap-2">
                                        <div v-for="option in typeOptions" :key="option.value" class="col-span-1">
                                            <input type="checkbox" :id="option.value" :value="option.value" v-model="typeFilter" @change="toggleFilter(option.value)" class="mr-2 rounded-sm" />
                                            <label :for="option.value">{{ option.name }}</label>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label class="block mb-2 font-bold">{{ translate('lesson-status') }}:</label>
                                    <div class="grid grid-cols-2 gap-2">
                                        <div v-for="option in statusOptions" :key="option.value" class="col-span-1">
                                            <input type="checkbox" :id="option.value" :value="option.value" v-model="statusFilter" @change="toggleFilter(option.value)" class="mr-2 rounded-sm" />
                                            <label :for="option.value">{{ option.name }}</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                                <div class="min-w-full divide-y divide-gray-300">
                                    <div class="bg-gray-50">
                                        <div class="hidden md:block p-0 m-0 bg-gray-50 border-b border-gray-200 w-full">
                                            <div colspan="6" class="p-3 m-0">
                                                <div class="grid grid-cols-4">
                                                    <div class="col-span-2 flex items-center">
                                                        <input id="search" type="text" class="px-4 py-2 rounded-md border-gray-300 bg-white focus:outline-none" :placeholder="translate('lesson-search')" v-model="searchQuery" />
                                                        <div v-if="searchQuery.length > 0" class="">
                                                            <div v-if="searchQuery.length > 0" class="text-left ml-2 text-gray-500">
                                                                {{ translate('lesson-result')}} <span class="text-black font-semibold">{{ totalItems }}</span> {{ translate('paging-item')}} (s)
                                                            </div>
                                                            <div v-else class="text-left mt-2">{{translate('lesson-notfound')}}</div>
                                                        </div>
                                                        <button v-if="searchQuery.length > 0" @click="clearSearchQuery" type="button" class="ml-2 text-blue-500 hover:underline focus:outline-none">{{translate('lesson-clear') }}</button>
                                                    </div>

                                                    <div class="col-span-2 flex items-center justify-end">
                                                        <select v-model="limitItem" @change="handleLimitChange" class="block w-20 py-2 px-2 text-sm font-medium bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500">
                                                            <option v-for="option in limitOptions" :key="option" :value="option">{{ option }}</option>
                                                        </select>
                                                        <Pagination :current-page="currentPage" :total-items="totalItems" :total-pages="totalPages" :limit-items="limitItem" :data-loading="loading" :display-mode="'nav'" @page-changed="handlePageChanged" class="ml-2" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="block md:hidden p-0 m-0 border-b border-gray-200">
                                            <div colspan="3" class="p-3 m-0 text-center">
                                                <div class="mb-4 mx-auto max-w-full">
                                                    <input id="search" type="text" class="w-full px-4 py-2 rounded-sm border-gray-300 bg-white focus:outline-none" :placeholder="translate('lesson-search')" v-model="searchQuery" />
                                                    <div v-if="searchQuery.length > 0" class="mt-2 text-gray-500">
                                                        {{ translate('lesson-result')}} <span class="text-black font-semibold">{{ totalItems }}</span> {{ translate('paging-item')}} (s)
                                                    </div>
                                                    <div v-else-if="listItems.length <= 0" class="mt-2">{{translate('lesson-notfound')}}</div>
                                                    <button v-if="searchQuery.length > 0" @click="clearSearchQuery" type="button" class="ml-2 text-blue-500 hover:underline focus:outline-none">{{translate('lesson-clear') }}</button>
                                                </div>
                                                <div class="flex justify-center">
                                                    <Pagination :current-page="currentPage" :total-items="totalItems" :total-pages="totalPages" :limit-items="limitItem" :data-loading="loading" :display-mode="'nav'" @page-changed="handlePageChanged" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="divide-y divide-gray-300 relative" :data-content="translate('database-connect')" :class="[(activeBlock?'isblock' : 'isunblock')]">

                                        <div v-if="listItems.length === 0" class="p-3 text-center text-gray-500">
                                            <div>
                                                <font-awesome-icon :icon="['fas','exclamation-circle']" class="" /> ยังไม่มีข้อมูล
                                            </div>
                                        </div>

                                        <template v-if="viewMode === 'list'">

                                            <div v-for="(item, index) in listItems" :key="item._id" :class="index % 2 === 0 ? 'bg-indigo-50' : 'bg-white'">
                                                <ItemDisplay :item="item" viewMode="list" />
                                            </div>
                                            
                                        </template>

                                        <template v-else>

                                            <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 m-3">
                                                <div v-for="(item) in listItems" :key="item._id" class="thumbnail-item bg-white">
                                                    <ItemDisplay :item="item" viewMode="thumbnail" />
                                                </div>
                                            </div>

                                        </template>

                                        <div class="p-0 m-0 bg-gray-50">
                                            <div class="flex justify-between items-center p-2">

                                                <div class="toggle-view-mode flex space-x-2">

                                                    <button @click="viewMode = 'list'" :class="{'text-blue-500': viewMode === 'list', 'text-gray-400': viewMode !== 'list'}" class="block px-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                                        <font-awesome-icon icon="list" class="h-4 w-4 mt-1" /> <span class="hidden md:block text-sm text-gray-600 mt-1">List</span>
                                                    </button> 

                                                    <button @click="viewMode = 'thumbnail'" :class="{'text-blue-500': viewMode === 'thumbnail', 'text-gray-400': viewMode !== 'thumbnail'}" class="block px-1 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50">
                                                        <font-awesome-icon icon="th-large" class="h-4 w-4 mt-1" /> <span class="hidden md:block text-sm text-gray-600 mt-1">Thumbnail</span>
                                                    </button> 

                                                </div>
                                        
                                                <div class="pagination mt-0" style="margin-top: 0 !important;">
                                                    <Pagination class="mt-0" :current-page="currentPage" :total-items="totalItems" :total-pages="totalPages" :limit-items="limitItem" :data-loading="loading" :display-mode="'summary'" @page-changed="handlePageChanged" />
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
    </div>

</div>
</template>

<style>
input:focus-visible {
    outline: none;
}
.opacity-bg-indigo-50 {
    background-color: rgba(125, 150, 178, 0.5);
}
</style>
