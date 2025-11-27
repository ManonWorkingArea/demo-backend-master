<script>
import Loader from '@/interface/template/Loader.vue';
import Subhead from '@/interface/template/outline/Subhead.vue';
import ConnectionGateway from './gateway/Host.vue';
import ClientTestPanel from './gateway/Client.vue';

export default {
    name: 'ConnectionGatewayTestPage',
    data() {
        return {
            loading_sources: false,
            PageName: 'Connection Gateway Test',
            PageIcon: 'network-wired',
            
            // Split view controls
            leftWidth: 50, // Percentage
            isDragging: false,
            
            // Communication stats
            totalCommandsSent: 0,
            totalMessagesReceived: 0,
            connectionCount: 0
        }
    },
    components: {
        Loader,
        Subhead,
        ConnectionGateway,
        ClientTestPanel
    },
    methods: {
        // Handle split view resizing
        startDrag(event) {
            this.isDragging = true;
            document.addEventListener('mousemove', this.drag);
            document.addEventListener('mouseup', this.stopDrag);
            event.preventDefault();
        },
        
        drag(event) {
            if (!this.isDragging) return;
            
            const container = this.$refs.splitContainer;
            const rect = container.getBoundingClientRect();
            const newLeftWidth = ((event.clientX - rect.left) / rect.width) * 100;
            
            // Limit between 20% and 80%
            this.leftWidth = Math.max(20, Math.min(80, newLeftWidth));
        },
        
        stopDrag() {
            this.isDragging = false;
            document.removeEventListener('mousemove', this.drag);
            document.removeEventListener('mouseup', this.stopDrag);
        },
        
        resetSplit() {
            this.leftWidth = 50;
        },
        
        // Listen for cross-component communication
        setupEventListeners() {
            // Listen for commands sent from Gateway
            window.addEventListener('gateway-command', this.onCommandSent);
            
            // Listen for client connections
            window.addEventListener('client-connection-update', this.onClientConnection);
            
            // Listen for messages received by client
            window.addEventListener('client-message-received', this.onMessageReceived);
        },
        
        onCommandSent() {
            this.totalCommandsSent++;
        },
        
        onClientConnection(event) {
            const data = event.detail;
            if (data.isConnecting) {
                this.connectionCount++;
            } else {
                this.connectionCount = Math.max(0, this.connectionCount - 1);
            }
        },
        
        onMessageReceived() {
            this.totalMessagesReceived++;
        },
        
        // Utility methods
        clearStats() {
            this.totalCommandsSent = 0;
            this.totalMessagesReceived = 0;
            this.connectionCount = 0;
        }
    },
    
    mounted() {
        this.setupEventListeners();
    },
    
    beforeUnmount() {
        // Clean up event listeners
        window.removeEventListener('gateway-command', this.onCommandSent);
        window.removeEventListener('client-connection-update', this.onClientConnection);
        window.removeEventListener('client-message-received', this.onMessageReceived);
        
        // Clean up drag listeners
        document.removeEventListener('mousemove', this.drag);
        document.removeEventListener('mouseup', this.stopDrag);
    }
};
</script>

<template>
    <div v-if="loading_sources" class="text-center py-8">
        <Loader/>
    </div>
    
    <Subhead :button="false" :name="'ย้อนกลับ'" :style="'chevron-left'" :link="'/setup/index'" />

    <div class="flex-1 bg-gray-100" v-if="!loading_sources">
        
        <!-- Header with Stats -->
        <div class="bg-white shadow-sm border-b">
            <div class="mx-auto max-w-full px-6 py-4">
                <div class="flex items-center justify-between">
                    <div>
                        <h1 class="text-2xl font-bold text-gray-900">
                            <font-awesome-icon :icon="['fas', PageIcon]" class="text-blue-600 mr-3"/>
                            Connection Gateway Test Environment
                        </h1>
                        <p class="mt-1 text-sm text-gray-600">ทดสอบการสื่อสารระหว่าง Host และ Client แบบ Real-time</p>
                    </div>
                    <div class="flex items-center space-x-6">
                        <!-- Real-time Stats -->
                        <div class="flex items-center space-x-4 text-sm">
                            <div class="bg-blue-50 px-3 py-1 rounded-full">
                                <span class="text-blue-700 font-medium">Commands Sent: {{ totalCommandsSent }}</span>
                            </div>
                            <div class="bg-green-50 px-3 py-1 rounded-full">
                                <span class="text-green-700 font-medium">Messages Received: {{ totalMessagesReceived }}</span>
                            </div>
                            <div class="bg-purple-50 px-3 py-1 rounded-full">
                                <span class="text-purple-700 font-medium">Active Connections: {{ connectionCount }}</span>
                            </div>
                        </div>
                        <div class="flex space-x-2">
                            <button @click="resetSplit" 
                                    class="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded transition-colors">
                                Reset Split
                            </button>
                            <button @click="clearStats" 
                                    class="px-3 py-1 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors">
                                Clear Stats
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Split View Container -->
        <div ref="splitContainer" class="flex h-screen relative">
            
            <!-- Left Panel - Host (Connection Gateway) -->
            <div class="bg-white overflow-auto" :style="{ width: leftWidth + '%' }">
                <div class="sticky top-0 bg-blue-600 text-white px-4 py-2 z-10">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <font-awesome-icon :icon="['fas', 'server']" class="mr-2"/>
                            <span class="font-semibold">HOST - Connection Gateway</span>
                        </div>
                        <div class="text-xs bg-blue-500 px-2 py-1 rounded">
                            Admin Panel
                        </div>
                    </div>
                </div>
                <div class="h-full">
                    <ConnectionGateway />
                </div>
            </div>

            <!-- Resize Handle -->
            <div @mousedown="startDrag" 
                 class="w-2 bg-gray-300 hover:bg-gray-400 cursor-col-resize relative group transition-colors">
                <div class="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-1 bg-gray-400 group-hover:bg-gray-600"></div>
                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gray-500 group-hover:bg-gray-700 rounded-full p-1">
                    <font-awesome-icon :icon="['fas', 'grip-lines-vertical']" class="text-white text-xs"/>
                </div>
            </div>

            <!-- Right Panel - Client -->
            <div class="bg-gray-50 overflow-auto" :style="{ width: (100 - leftWidth) + '%' }">
                <div class="sticky top-0 bg-green-600 text-white px-4 py-2 z-10">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center">
                            <font-awesome-icon :icon="['fas', 'desktop']" class="mr-2"/>
                            <span class="font-semibold">CLIENT - Test Panel</span>
                        </div>
                        <div class="text-xs bg-green-500 px-2 py-1 rounded">
                            Client Simulator
                        </div>
                    </div>
                </div>
                <div class="h-full">
                    <ClientTestPanel />
                </div>
            </div>
        </div>

        <!-- Quick Actions Bar -->
        <div class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white shadow-lg rounded-lg border px-6 py-3 z-20">
            <div class="flex items-center space-x-4">
                <div class="text-sm font-medium text-gray-700">Quick Actions:</div>
                <button @click="$refs.splitContainer.querySelector('.bg-blue-600').scrollIntoView()" 
                        class="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors">
                    Focus Host
                </button>
                <button @click="$refs.splitContainer.querySelector('.bg-green-600').scrollIntoView()" 
                        class="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded transition-colors">
                    Focus Client
                </button>
                <div class="text-xs text-gray-500">
                    Drag the center bar to resize panels
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* Custom scrollbar for better UX */
.overflow-auto::-webkit-scrollbar {
    width: 6px;
}

.overflow-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.overflow-auto::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.overflow-auto::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
}

/* Smooth transitions */
.transition-colors {
    transition: background-color 0.2s ease;
}

/* Prevent text selection during drag */
.cursor-col-resize {
    user-select: none;
}

/* Responsive adjustments */
@media (max-width: 768px) {
    .flex {
        flex-direction: column;
    }
    
    .w-2 {
        width: 100%;
        height: 8px;
        cursor: row-resize;
    }
}
</style> 