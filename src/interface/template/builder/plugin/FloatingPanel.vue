<template>
    <div v-if="showPanel" :class="['floating-panel', { collapsed: isCollapsed }]">
      <button class="toggle-btn" @click="togglePanel">
        <i :class="toggleIcon"></i>
      </button>
  
      <div v-if="!isCollapsed" class="icon-container">

        <button class="icon-btn" @click="emitAction('addRow')">
            <i class="fas fa-plus"></i> <span class="btn-text text-sm">เพิ่ม Row</span>
          </button>

        <button class="icon-btn" @click="emitAction('save')">
          <i class="fas fa-save"></i> <span class="btn-text text-sm">บันทึก</span>
        </button>

        <button class="icon-btn" @click="emitAction('reload')">
          <i class="fas fa-refresh"></i> <span class="btn-text text-sm">โหลดใหม่</span>
        </button>
        
      </div>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        showPanel: false,
        isCollapsed: false, // Initially expanded
      };
    },
    computed: {
      toggleIcon() {
        return this.isCollapsed ? "fas fa-chevron-right" : "fas fa-chevron-left";
      },
    },
    mounted() {
      window.addEventListener("scroll", this.toggleVisibility);
    },
    beforeUnmount() {
      window.removeEventListener("scroll", this.toggleVisibility);
    },
    methods: {
      toggleVisibility() {
        this.showPanel = window.scrollY > 100; // Show when scrolled 100px
      },
      togglePanel() {
        this.isCollapsed = !this.isCollapsed;
      },
      emitAction(action) {
        this.$emit("actionTriggered", action); // Emit event to parent
        },
    },
  };
  </script>
  
  <style scoped>
  .floating-panel {
    position: fixed;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 5px;
    background: rgba(0, 0, 0, 0.7);
    padding: 5px;
    border-radius: 5px;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
    transition: transform 0.3s ease-in-out;
    z-index: 9999;
  }
  
  /* When collapsed, slide left */
  .floating-panel.collapsed {
    left: 20px; /* Move left */
    transform: translateX(0);
  }
  
  .toggle-btn {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 8px;
  }
  
  .icon-container {
    display: flex;
    gap: 10px;
    transition: all 0.3s ease-in-out;
  }
  
  .icon-btn {
    background: none;
    border: none;
    color: white;
    font-size: 20px;
    cursor: pointer;
    padding: 8px;
    display: flex;
    align-items: center;
    gap: 5px; /* Space between icon and text */
  }
  
  .icon-btn:hover {
    color: #f8d210; /* Highlight effect */
  }
  
  /* HIDE TEXT ON SMALL SCREENS */
  @media (max-width: 768px) {
    .btn-text {
      display: none;
    }
  }
  </style>
  