<script>
// Component
import Modal from '@/interface/modal/Session.vue';
import storageManager from '@/plugins/storage.js';
import { translate } from '@/plugins/language.js';

export default {
    
    data() {
      const rowRaw 		    = storageManager?.get('session','role') || 'user';
      const roleDecrypt 	= rowRaw
      return {
        selectSession: storageManager?.get('session', 'current') === 'none' ? true : false,
        listSession: (storageManager?.get('session', 'list') || []).length > 1 ? true : false,
        accessRole: roleDecrypt,
        accessSession: [],
        subColor: storageManager?.get('configs',"siteSubStyle") || 'blue',
        isHovered: false
      }
    },
    components: {Modal},
    methods: {
      translate,
      changeSession() {
        this.selectSession = true;
      },
      changeSessionTrigger(payload) {
        this.selectSession = payload;
      },
      formatRole(role) {
        return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'User';
      },
      getSessionCount() {
        return storageManager?.get('session', 'list')?.length || 0;
      }
    },
    async mounted () {
      try {
        const access = storageManager?.get('session');
        this.accessSession = access?.current || 'none';
      } catch (error) {
        console.log('Error loading session:', error);
        this.accessSession = 'none';
      }
    },
    computed: {
      flexClass() {
        return `flex-1 bg-gradient-to-r from-white via-gray-50/50 to-white border-b border-gray-200/80 backdrop-blur-sm`
      },
      buttonClass() {
        if (!this.listSession) {
          return `ml-2 sm:ml-4 inline-flex items-center rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-gray-400 bg-gray-100/80 cursor-not-allowed border border-gray-200/60`;
        } else {
          return `ml-2 sm:ml-4 inline-flex items-center rounded-lg px-2 py-1 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-${this.subColor}-700 bg-white/90 border border-${this.subColor}-200/60 hover:bg-gradient-to-r hover:from-${this.subColor}-50 hover:to-white hover:border-${this.subColor}-300/80 shadow-sm hover:shadow-md transition-all duration-300 ease-out backdrop-blur-sm`;
        }
      },
      headerClass() {
        return `text-lg font-semibold text-gray-800 tracking-tight leading-tight`
      },
      statusIndicatorClass() {
        return `w-2 h-2 bg-gradient-to-r from-green-400 to-green-500 rounded-full animate-pulse shadow-sm`
      },
      roleClass() {
        return `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-${this.subColor}-100 to-${this.subColor}-50 text-${this.subColor}-700 border border-${this.subColor}-200/50`
      },
      bqclp() {
        return storageManager?.get('bqclp') || null;
      },
    }
};
</script>

<template>
<div v-if="!$route.meta.fullscreen">
  <Modal v-if="this.selectSession" :isWindowsOpen="true" @change-session-trigger="changeSessionTrigger"/>

  <div :class="flexClass" v-if="['admin', 'manager'].includes(this.accessRole) && accessSession !== 'none'">
      <div class="py-1">
        <div class="mx-auto px-2 sm:px-4">
          <div class="flex items-center justify-between">
            <!-- Title Section -->
            <div class="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1 pr-2">
              <!-- Icon Container with Glow Effect -->
              <div class="relative group flex-shrink-0">
                <div :class="`p-1 shadow-sm transition-all duration-300`">
                  <font-awesome-icon :icon="['fas','database']" :class="`text-${subColor}-600 text-sm sm:text-lg transition-transform duration-300`"/>
                  <!-- Subtle glow effect -->
                  <div :class="`absolute inset-0 bg-gradient-to-br from-${subColor}-400/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`"></div>
                </div>
                <!-- Status indicator -->
                <div class="absolute -top-1 -right-1">
                  <div :class="statusIndicatorClass"></div>
                </div>
              </div>
              
              <!-- Text Content -->
              <div class="space-y-0.5 sm:space-y-1 min-w-0 flex-1">
                <div class="flex items-center space-x-2 sm:space-x-3">
                  <h2 :class="headerClass" class="truncate text-sm sm:text-lg font-medium sm:font-semibold">
                    {{ accessSession?.siteName || 'Select Session First' }}
                  </h2>
                  <!-- Role Badge -->
                  <span :class="roleClass" class="text-xs px-1.5 py-0.5 sm:px-2.5">
                    <font-awesome-icon :icon="['fas','shield-alt']" class="mr-1 text-xs"/>
                    <span class="hidden xs:inline sm:inline">{{ formatRole(accessRole) }}</span>
                    <span class="xs:hidden sm:hidden">{{ formatRole(accessRole).charAt(0) }}</span>
                  </span>
                </div>
                
                <!-- User Profile with Enhanced Styling -->
                <div v-if="bqclp && bqclp.user_profile" class="flex items-center space-x-1.5 sm:space-x-2">
                  <div :class="`w-1 h-1 sm:w-1.5 sm:h-1.5 bg-${subColor}-400 rounded-full flex-shrink-0`"></div>
                  <span class="text-xs sm:text-sm text-gray-600 font-medium tracking-wide truncate">
                    {{ bqclp.user_profile }}
                  </span>
                  <div class="text-xs text-gray-400 hidden sm:inline">•</div>
                  <span class="text-xs text-gray-500 uppercase tracking-wider font-medium hidden sm:inline">
                    Active Session
                  </span>
                </div>
              </div>
            </div>
            
            <!-- Action Button with Enhanced Design -->
            <div class="relative flex-shrink-0">
              <button 
                @click="changeSession" 
                type="button" 
                :class="[buttonClass]" 
                :disabled="!listSession"
                @mouseenter="isHovered = true"
                @mouseleave="isHovered = false"
                class="group relative overflow-hidden"
              >
                <!-- Button Content -->
                <span class="relative z-10 flex items-center">
                  <font-awesome-icon :icon="['fas','exchange-alt']" class="mr-1 sm:mr-2 text-xs sm:text-sm group-hover:rotate-180 transition-transform duration-500"/>
                  <span class="hidden sm:inline">{{ translate('database-switch') }}</span>
                  <span class="sm:hidden text-xs">Switch</span>
                  <div class="ml-1 sm:ml-3 pl-1 sm:pl-3 border-l border-current/20">
                    <font-awesome-icon 
                      :icon="['fas','caret-down']" 
                      :class="`text-xs sm:text-sm transition-all duration-300 ${isHovered ? 'rotate-180 scale-110' : ''}`"
                    /> 
                  </div>
                </span>
                
                <!-- Animated Background Effect -->
                <div v-if="listSession" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                
                <!-- Subtle Border Glow -->
                <div v-if="listSession" :class="`absolute inset-0 rounded-xl bg-gradient-to-r from-${subColor}-400/20 to-${subColor}-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm`"></div>
              </button>
              
              <!-- Session Count Indicator -->
              <div v-if="listSession" class="absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                <div :class="`bg-gradient-to-r from-${subColor}-500 to-${subColor}-600 text-white text-xs font-bold rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center shadow-sm `">
                  {{ getSessionCount() }}
                </div>
              </div>
            </div>
          </div>
          
          <!-- Subtle Decorative Line -->
          <!-- <div class="mt-4 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent"></div> -->
        </div>
      </div>
  </div>
</div>
</template>

<style scoped>
/* Enhanced transitions and animations */
* {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Smooth hover effects - only on larger screens */
@media (min-width: 640px) {
  button:not(:disabled):hover {
    transform: translateY(-2px);
  }
}

/* Mobile optimizations */
@media (max-width: 639px) {
  /* Ensure touch targets are appropriate size */
  button {
    min-height: 36px;
    touch-action: manipulation;
  }
  
  /* Prevent text from being too small */
  .text-xs {
    font-size: 0.75rem;
  }
  
  /* Ensure proper truncation */
  .truncate {
    max-width: 140px;
  }
}

/* Custom animations */
@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

@keyframes glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.animate-shimmer {
  animation: shimmer 2s infinite;
}

.animate-glow {
  animation: glow 2s ease-in-out infinite;
}

/* Backdrop blur support */
@supports (backdrop-filter: blur(10px)) {
  .backdrop-blur-sm {
    backdrop-filter: blur(4px);
  }
}

/* Enhanced focus states */
button:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Smooth icon transitions */
.fa-icon {
  transition: transform 0.3s ease;
}

/* Custom scrollbar for better aesthetics */
::-webkit-scrollbar {
  width: 4px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 2px;
}

::-webkit-scrollbar-thumb:hover {
  background: rgba(0, 0, 0, 0.3);
}
</style>