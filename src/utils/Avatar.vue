<template>
  <div
    :class="[
      'avatar-container',
      `avatar-${size}`,
      {
        'avatar-clickable': clickable,
        'avatar-online': showOnlineStatus && isOnline,
        'avatar-offline': showOnlineStatus && !isOnline,
      }
    ]"
    @click="handleClick"
  >
    <!-- Avatar with Image -->
    <div
      v-if="hasImage"
      class="avatar avatar-image"
      :style="avatarStyle"
    >
      <img 
        :src="imageSrc" 
        :alt="displayName"
        class="avatar-img"
        @error="handleImageError"
        @load="handleImageLoad"
      >
      <div v-if="showLoadingState && imageLoading" class="avatar-loading">
        <div class="loading-spinner"></div>
      </div>
    </div>

    <!-- Avatar with Initials -->
    <div
      v-else
      class="avatar avatar-initials"
      :style="avatarStyle"
      :class="[
        `bg-${backgroundColor}`,
        `text-${textColor}`,
        fontSizeClass
      ]"
    >
      {{ initials }}
    </div>

    <!-- Online Status Indicator -->
    <div
      v-if="showOnlineStatus"
      class="status-indicator"
      :class="{
        'status-online': isOnline,
        'status-offline': !isOnline
      }"
    ></div>

    <!-- Badge/Notification Count -->
    <div
      v-if="badge && badge > 0"
      class="avatar-badge"
      :class="badgeSize"
    >
      {{ badge > 99 ? '99+' : badge }}
    </div>

    <!-- Verified Badge -->
    <div
      v-if="verified"
      class="verified-badge"
    >
      <font-awesome-icon :icon="['fas', 'check']" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    // Image source
    image: {
      type: String,
      default: null
    },
    // Display name for initials
    name: {
      type: String,
      default: ''
    },
    // Email for fallback initials
    email: {
      type: String,
      default: ''
    },
    // Size variants
    size: {
      type: String,
      default: 'medium',
      validator: value => ['xs', 'small', 'medium', 'large', 'xl', '2xl'].includes(value)
    },
    // Shape variants
    shape: {
      type: String,
      default: 'circle',
      validator: value => ['circle', 'square', 'rounded'].includes(value)
    },
    // Background color for initials
    backgroundColor: {
      type: String,
      default: 'blue-500'
    },
    // Text color for initials
    textColor: {
      type: String,
      default: 'white'
    },
    // Click handler
    clickable: {
      type: Boolean,
      default: false
    },
    // Online status
    showOnlineStatus: {
      type: Boolean,
      default: false
    },
    isOnline: {
      type: Boolean,
      default: false
    },
    // Badge/notification count
    badge: {
      type: Number,
      default: 0
    },
    // Verified badge
    verified: {
      type: Boolean,
      default: false
    },
    // Loading state
    showLoadingState: {
      type: Boolean,
      default: true
    },
    // Fallback icon
    fallbackIcon: {
      type: String,
      default: 'user'
    },
    // Custom styles
    customStyle: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      imageLoading: true,
      imageError: false
    }
  },
  computed: {
    // For backward compatibility
    data() {
      return {
        image: this.image,
        name: this.name,
        email: this.email,
        size: this.sizeValue
      }
    },
    hasImage() {
      return this.image && !this.imageError
    },
    imageSrc() {
      return this.hasImage ? this.image : ''
    },
    displayName() {
      return this.name || this.email || 'User'
    },
    initials() {
      if (this.name) {
        const nameParts = this.name.trim().split(' ')
        if (nameParts.length >= 2) {
          return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
        }
        return nameParts[0].slice(0, 2).toUpperCase()
      } else if (this.email) {
        return this.email.slice(0, 2).toUpperCase()
      }
      return 'U'
    },
    sizeValue() {
      const sizeMap = {
        'xs': 6,
        'small': 8,
        'medium': 10,
        'large': 12,
        'xl': 16,
        '2xl': 20
      }
      return sizeMap[this.size] || 10
    },
    fontSizeClass() {
      const fontSizeMap = {
        'xs': 'text-xs',
        'small': 'text-sm',
        'medium': 'text-base',
        'large': 'text-lg',
        'xl': 'text-xl',
        '2xl': 'text-2xl'
      }
      return fontSizeMap[this.size] || 'text-base'
    },
    badgeSize() {
      const badgeSizeMap = {
        'xs': 'badge-xs',
        'small': 'badge-small',
        'medium': 'badge-medium',
        'large': 'badge-large',
        'xl': 'badge-xl',
        '2xl': 'badge-2xl'
      }
      return badgeSizeMap[this.size] || 'badge-medium'
    },
    avatarStyle() {
      return {
        ...this.customStyle
      }
    }
  },
  methods: {
    handleClick() {
      if (this.clickable) {
        this.$emit('click', {
          name: this.displayName,
          email: this.email,
          image: this.image
        })
      }
    },
    handleImageError() {
      this.imageError = true
      this.imageLoading = false
      this.$emit('image-error')
    },
    handleImageLoad() {
      this.imageLoading = false
      this.$emit('image-loaded')
    }
  },
  mounted() {
    // Pre-load image if provided
    if (this.image) {
      const img = new Image()
      img.onload = this.handleImageLoad
      img.onerror = this.handleImageError
      img.src = this.image
    }
  }
}
</script>

<style scoped>
/* Avatar Container */
.avatar-container {
  position: relative;
  display: inline-block;
  flex-shrink: 0;
}

.avatar-clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.avatar-clickable:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* Avatar Sizes */
.avatar-xs {
  width: 1.5rem;
  height: 1.5rem;
}

.avatar-small {
  width: 2rem;
  height: 2rem;
}

.avatar-medium {
  width: 2.5rem;
  height: 2.5rem;
}

.avatar-large {
  width: 3rem;
  height: 3rem;
}

.avatar-xl {
  width: 4rem;
  height: 4rem;
}

.avatar-2xl {
  width: 5rem;
  height: 5rem;
}

/* Avatar Base Styles */
.avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 2px solid #e5e7eb;
  background-color: #f3f4f6;
}

.avatar-image {
  border: 2px solid #e5e7eb;
}

.avatar-initials {
  font-weight: 600;
  color: white;
  text-transform: uppercase;
  border: 2px solid transparent;
}

/* Image Styles */
.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* Loading State */
.avatar-loading {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
}

.loading-spinner {
  width: 1rem;
  height: 1rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* Status Indicator */
.status-indicator {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 25%;
  height: 25%;
  min-width: 8px;
  min-height: 8px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.status-online {
  background-color: #10b981;
}

.status-offline {
  background-color: #6b7280;
}

/* Badge Styles */
.avatar-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background-color: #ef4444;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid white;
  min-width: 1.25rem;
  min-height: 1.25rem;
}

.badge-xs {
  font-size: 0.625rem;
  min-width: 1rem;
  min-height: 1rem;
}

.badge-small {
  font-size: 0.75rem;
  min-width: 1.125rem;
  min-height: 1.125rem;
}

.badge-medium {
  font-size: 0.75rem;
  min-width: 1.25rem;
  min-height: 1.25rem;
}

.badge-large {
  font-size: 0.875rem;
  min-width: 1.5rem;
  min-height: 1.5rem;
}

.badge-xl {
  font-size: 1rem;
  min-width: 1.75rem;
  min-height: 1.75rem;
}

.badge-2xl {
  font-size: 1rem;
  min-width: 2rem;
  min-height: 2rem;
}

/* Verified Badge */
.verified-badge {
  position: absolute;
  bottom: -2px;
  right: -2px;
  background-color: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border: 2px solid white;
  font-size: 0.5rem;
}

/* Online Status Animation */
.avatar-online .status-indicator {
  animation: pulse-online 2s infinite;
}

@keyframes pulse-online {
  0% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
  }
  70% {
    box-shadow: 0 0 0 6px rgba(16, 185, 129, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
  }
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 640px) {
  .avatar-xl {
    width: 3rem;
    height: 3rem;
  }
  
  .avatar-2xl {
    width: 4rem;
    height: 4rem;
  }
}

/* Dark Mode Support */
@media (prefers-color-scheme: dark) {
  .avatar {
    border-color: #374151;
    background-color: #1f2937;
  }
  
  .status-indicator {
    border-color: #1f2937;
  }
  
  .avatar-badge,
  .verified-badge {
    border-color: #1f2937;
  }
}
</style>
