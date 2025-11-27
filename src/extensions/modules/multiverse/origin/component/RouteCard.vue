<template>
  <div class="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
    <!-- Route Header -->
    <div class="px-6 py-4 border-b border-gray-200" :class="headerClass">
      <div class="flex items-start justify-between">
        <div class="flex items-center flex-1">
          <font-awesome-icon :icon="routeIcon" :class="iconClass"/>
          <div class="flex-1">
            <h4 :class="titleClass">
              {{ routeDisplayName }}
              <span v-if="isVirtual" class="text-sm text-indigo-600 ml-2 font-normal">(Virtual Parent)</span>
            </h4>
            <p :class="pathClass">{{ route.path }}</p>
            <p class="text-xs text-gray-400">Level {{ level }} Route</p>
            <div v-if="hasChildren" class="text-xs text-gray-500 mt-1">
              <font-awesome-icon :icon="['fas','sitemap']" class="mr-1"/>
              Contains {{ route.children.length }} sub-routes
            </div>
          </div>
        </div>
        <div class="flex items-center space-x-2">
          <template v-for="badge in routeBadges" :key="badge.text">
            <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium" :class="badge.color">
              {{ badge.text }}
            </span>
          </template>
          <button 
            @click="toggleConfig"
            class="ml-3 px-3 py-1 rounded-md text-xs hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            :class="buttonClass">
            <font-awesome-icon :icon="isExpanded ? ['fas','chevron-up'] : ['fas','chevron-down']" class="mr-1"/>
            {{ isExpanded ? 'ซ่อนการตั้งค่า' : 'แสดงการตั้งค่า' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Configuration Section -->
    <RouteConfiguration 
      v-show="isExpanded"
      :route="route"
      :group="group"
      :subModule="subModule"
      :parentPath="parentPath"
      :level="level"
      @update-meta="handleUpdateMeta"
      @update-property="handleUpdateProperty"
      @update-role="handleUpdateRole"
    />
    
    <!-- Sub-routes Section -->
    <div v-if="hasChildren" class="border-t border-gray-200 bg-gray-50">
      <div class="px-6 py-4">
        <div class="flex items-center justify-between mb-4">
          <h5 class="text-sm font-medium text-gray-700 flex items-center">
            <font-awesome-icon :icon="['fas','sitemap']" class="mr-2"/>
            Sub-routes ({{ route.children.length }})
          </h5>
          <button 
            @click="toggleSubRoutes"
            class="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300 transition-colors">
            <font-awesome-icon :icon="isSubRoutesExpanded ? ['fas','chevron-up'] : ['fas','chevron-down']" class="mr-1"/>
            {{ isSubRoutesExpanded ? 'ซ่อน Sub-routes' : 'แสดง Sub-routes' }}
          </button>
        </div>
        
        <div v-show="isSubRoutesExpanded" class="space-y-3">
          <RouteCard
            v-for="subChild in route.children" 
            :key="subChild.path || subChild.name"
            :route="subChild"
            :group="group"
            :subModule="subModule"
            :parentPath="route.path"
            :level="level + 1"
            :routeKey="getSubRouteKey(subChild)"
            @update-meta="$emit('update-meta', $event)"
            @update-property="$emit('update-property', $event)"
            @update-role="$emit('update-role', $event)"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import RouteConfiguration from './RouteConfiguration.vue';

export default {
  name: 'RouteCard',
  
  components: {
    RouteConfiguration
  },
  
  props: {
    route: {
      type: Object,
      required: true
    },
    group: {
      type: String,
      required: true
    },
    subModule: {
      type: String,
      required: true
    },
    parentPath: {
      type: String,
      default: ''
    },
    level: {
      type: Number,
      default: 2
    },
    routeKey: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      isExpanded: false,
      isSubRoutesExpanded: false
    };
  },
  computed: {
    isVirtual() {
      return this.route.meta?.virtual === true;
    },
    hasChildren() {
      return this.route.children && this.route.children.length > 0;
    },
    headerClass() {
      return this.isVirtual ? 'bg-indigo-50' : 'bg-blue-50';
    },
    iconClass() {
      return this.isVirtual ? 'text-indigo-500 mr-3 text-lg' : 'text-blue-500 mr-3 text-lg';
    },
    titleClass() {
      return `text-lg font-medium ${this.isVirtual ? 'text-indigo-900' : 'text-blue-900'}`;
    },
    pathClass() {
      return `text-sm ${this.isVirtual ? 'text-indigo-600' : 'text-blue-600'}`;
    },
    buttonClass() {
      return this.isVirtual ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700';
    },
    routeIcon() {
      return this.route.meta?.icon ? ['fas', this.route.meta.icon] : 
             (this.isVirtual ? ['fas','folder-plus'] : ['fas','file']);
    },
    routeDisplayName() {
      return this.getRouteDisplayName(this.route);
    },
    routeBadges() {
      return this.getRouteDetailBadge(this.route);
    }
  },
  methods: {
    // ==========================================
    // Toggle Methods
    // ==========================================
    toggleConfig() {
      this.isExpanded = !this.isExpanded;
    },
    
    toggleSubRoutes() {
      this.isSubRoutesExpanded = !this.isSubRoutesExpanded;
    },

    // ==========================================
    // Helper Methods
    // ==========================================
    getSubRouteKey(subRoute) {
      return `${this.group}-${this.subModule}-${this.route.path}-${subRoute.path}`;
    },

    // ==========================================
    // Event Handlers
    // ==========================================
    handleUpdateMeta(event) {
      this.$emit('update-meta', {
        ...event,
        group: this.group,
        subModule: this.subModule,
        routePath: this.route.path,
        parentPath: this.parentPath
      });
    },
    handleUpdateProperty(event) {
      this.$emit('update-property', {
        ...event,
        group: this.group,
        subModule: this.subModule,
        routePath: this.route.path,
        parentPath: this.parentPath
      });
    },
    handleUpdateRole(event) {
      this.$emit('update-role', {
        ...event,
        group: this.group,
        subModule: this.subModule,
        routePath: this.route.path,
        parentPath: this.parentPath
      });
    },
    // Helper methods (จะต้องส่งผ่าน props หรือ inject จาก parent)
    getRouteDisplayName(route) {
      if (!route || !route.name) return 'Unknown Route';
      return this.formatRouteName(route.name);
    },
    getRouteDetailBadge(route) {
      const badges = [];
      
      if (route.meta?.virtual) {
        badges.push({ text: 'Virtual Parent', color: 'bg-indigo-100 text-indigo-800' });
      }
      
      if (route.meta?.auth) {
        badges.push({ text: 'Auth Required', color: 'bg-orange-100 text-orange-800' });
      }
      
      if (route.meta?.inMenu) {
        badges.push({ text: 'In Menu', color: 'bg-green-100 text-green-800' });
      }
      
      if (route.meta?.role && route.meta.role.includes('root')) {
        badges.push({ text: 'Role: root', color: 'bg-red-100 text-red-800' });
      }
      
      return badges;
    },
    formatRouteName(name) {
      if (!name) return '';
      
      return name
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/[-_]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
  }
};
</script>

<style scoped>
/* Route Card specific styles */
.route-card-enter-active,
.route-card-leave-active {
  transition: all 0.3s ease;
}

.route-card-enter-from,
.route-card-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>