<template>
    <!-- Notification Panel -->
    <div v-if="notifications.length > 0" class="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        <!-- Debug Info Panel (แสดงเมื่อ development mode) -->
        <div v-if="showDebugInfo" class="bg-gray-800 text-white text-xs p-2 rounded shadow">
            <div>📊 Total: {{ notifications.length }}</div>
            <div>🔄 Recent: {{ getTotalDuplicatesPrevented() }}</div>
        </div>
        
        <transition-group name="notification" tag="div" class="space-y-2">
            <div v-for="notification in visibleNotifications" :key="notification.id"
                 class="bg-white rounded-lg shadow-lg border-l-4 p-4 transform transition-all duration-300 ease-in-out notification-card flex flex-col"
                 :class="[
                     notification.urgent ? 'border-red-500 ring-2 ring-red-200 urgent-pulse' : 'border-gray-300',
                     notification.color.replace('bg-', 'border-l-')
                 ]">
                
                <!-- Notification Header -->
                <div class="flex items-start justify-between">
                    <div class="flex items-center space-x-2">
                        <div class="flex-shrink-0">
                            <div class="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm"
                                 :class="notification.color">
                                <font-awesome-icon :icon="['fas', notification.icon]"/>
                            </div>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center space-x-2 mb-1">
                                <h4 class="text-sm font-medium text-gray-900 truncate">
                                    {{ notification.title }}
                                </h4>
                                <span v-if="notification.urgent" 
                                      class="px-1.5 py-0.5 bg-red-100 text-red-700 text-xs rounded-full font-medium">
                                    🚨 URGENT
                                </span>
                                <span v-else-if="notification.priority !== 'normal'" 
                                      class="px-1.5 py-0.5 text-xs rounded-full font-medium"
                                      :class="getPriorityClass(notification.priority)">
                                    {{ notification.priority.toUpperCase() }}
                                </span>
                            </div>
                            <!-- Fixed height message container -->
                            <div class="h-12 overflow-hidden">
                                <p class="text-sm text-gray-600 line-clamp-2 leading-6">{{ notification.message }}</p>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Close Button -->
                    <button @click="removeNotification(notification.id)"
                            class="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors">
                        <font-awesome-icon :icon="['fas', 'times']" class="text-xs"/>
                    </button>
                </div>
                
                <!-- Notification Footer -->
                <div class="mt-auto pt-2 flex items-center justify-between text-xs text-gray-500">
                    <span class="flex items-center space-x-1">
                        <font-awesome-icon :icon="['fas', 'clock']"/>
                        <span>{{ formatTime(notification.timestamp) }}</span>
                    </span>
                    <span class="uppercase tracking-wide font-medium">{{ notification.type }}</span>
                </div>
                
                <!-- Progress Bar -->
                <div class="mt-2 w-full bg-gray-200 rounded-full h-1">
                    <div class="h-1 rounded-full transition-all duration-100 ease-linear"
                         :class="notification.color"
                         :style="`animation: shrink ${notification.duration}ms linear forwards`"></div>
                </div>
            </div>
        </transition-group>
        
        <!-- Clear All Button -->
        <div v-if="notifications.length > 1" class="text-center">
            <button @click="clearAllNotifications"
                    class="text-xs text-gray-500 hover:text-gray-700 bg-white rounded-full px-3 py-1 shadow border hover:shadow-md transition-all">
                <font-awesome-icon :icon="['fas', 'trash-alt']" class="mr-1"/>
                Clear All ({{ notifications.length }})
            </button>
        </div>
        
        <!-- Notification Counter -->
        <div v-if="notifications.length > maxVisible" class="text-center">
            <div class="text-xs text-gray-500 bg-white rounded-full px-2 py-1 shadow border">
                +{{ notifications.length - maxVisible }} more
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'NotificationPanel',
    props: {
        notifications: {
            type: Array,
            default: () => []
        },
        maxVisible: {
            type: Number,
            default: 5
        }
    },
    emits: ['remove-notification', 'clear-all'],
    data() {
        return {
            showDebugInfo: process.env.NODE_ENV === 'development'
        };
    },
    computed: {
        visibleNotifications() {
            return this.notifications.slice(0, this.maxVisible);
        }
    },
    methods: {
        removeNotification(id) {
            this.$emit('remove-notification', id);
        },
        
        clearAllNotifications() {
            this.$emit('clear-all');
        },
        
        getPriorityClass(priority) {
            const classes = {
                high: 'bg-orange-100 text-orange-700',
                critical: 'bg-red-100 text-red-700',
                low: 'bg-gray-100 text-gray-700'
            };
            return classes[priority] || 'bg-gray-100 text-gray-700';
        },
        
        formatTime(timestamp) {
            const now = new Date();
            const time = new Date(timestamp);
            const diffInSeconds = Math.floor((now - time) / 1000);
            
            if (diffInSeconds < 60) {
                return 'เมื่อสักครู่';
            } else if (diffInSeconds < 3600) {
                const minutes = Math.floor(diffInSeconds / 60);
                return `${minutes} นาทีที่แล้ว`;
            } else {
                return time.toLocaleTimeString('th-TH', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
            }
        },
        
        getTotalDuplicatesPrevented() {
            // ฟังก์ชันนี้จะต้องเชื่อมต่อกับ NotificationManager
            // สำหรับตอนนี้ return 0
            return 0;
        }
    }
};
</script>

<style scoped>
/* Notification progress bar animation */
@keyframes shrink {
    from {
        width: 100%;
    }
    to {
        width: 0%;
    }
}

/* Notification entrance/exit animations */
.notification-enter-active {
    transition: all 0.4s ease-out;
}

.notification-leave-active {
    transition: all 0.4s ease-in;
}

.notification-enter-from {
    transform: translateX(100%);
    opacity: 0;
}

.notification-leave-to {
    transform: translateX(100%);
    opacity: 0;
    transform: scale(0.8);
}

.notification-move {
    transition: transform 0.3s ease;
}

/* Line clamp utility for consistent text height */
.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

/* Ensure consistent notification card sizing */
.notification-card {
    width: 320px;
    min-height: 120px;
    max-height: 140px;
}

/* Urgent notification pulse */
.urgent-pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4);
    }
    50% {
        transform: scale(1.02);
        box-shadow: 0 0 0 8px rgba(239, 68, 68, 0);
    }
}

/* Hover effects */
.notification-panel {
    backdrop-filter: blur(10px);
}

/* Custom scrollbar for overflow */
.notification-container::-webkit-scrollbar {
    width: 4px;
}

.notification-container::-webkit-scrollbar-track {
    background: transparent;
}

.notification-container::-webkit-scrollbar-thumb {
    background: rgba(156, 163, 175, 0.5);
    border-radius: 2px;
}

.notification-container::-webkit-scrollbar-thumb:hover {
    background: rgba(156, 163, 175, 0.8);
}
</style>