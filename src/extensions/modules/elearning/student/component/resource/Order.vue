<template>
  <div class="flex flex-col lg:flex-row gap-6">
    <!-- Sidebar - Widgets -->
    <div class="w-full lg:w-80 space-y-4">
      <!-- Order Statistics Widget -->
      <div v-if="order.length > 0" class="bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl p-4 border border-emerald-100">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-sm font-semibold text-gray-900 flex items-center">
            <font-awesome-icon :icon="['fas','shopping-cart']" class="mr-2 text-emerald-600" />
            สถิติคำสั่งซื้อ
          </h3>
          <span class="text-xs text-gray-500">{{ order.length }} รายการ</span>
        </div>
        
        <div class="grid grid-cols-2 gap-2">
          <div class="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 text-center">
            <div class="text-lg font-bold text-emerald-600">{{ orderStats.total }}</div>
            <div class="text-xs text-gray-600">คำสั่งซื้อทั้งหมด</div>
          </div>
          <div class="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 text-center">
            <div class="text-lg font-bold text-blue-600">{{ orderStats.paid }}</div>
            <div class="text-xs text-gray-600">ชำระเงินแล้ว</div>
          </div>
          <div class="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 text-center">
            <div class="text-lg font-bold text-amber-600">{{ orderStats.pending }}</div>
            <div class="text-xs text-gray-600">รอชำระเงิน</div>
          </div>
          <div class="bg-white/70 backdrop-blur-sm rounded-lg p-2.5 text-center">
            <div class="text-lg font-bold text-purple-600">{{ orderStats.totalAmount }}฿</div>
            <div class="text-xs text-gray-600">มูลค่ารวม</div>
          </div>
        </div>
      </div>

      <!-- Status Distribution Widget -->
      <div v-if="order.length > 0" class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-900 flex items-center mb-3">
          <font-awesome-icon :icon="['fas','chart-bar']" class="mr-2 text-indigo-600" />
          การแจกแจงสถานะ
        </h3>
        
        <div class="space-y-2">
          <div v-for="(statusInfo, statusKey) in statusDistribution" :key="statusKey" class="space-y-1">
            <div class="flex items-center justify-between text-xs">
              <span class="text-gray-600">{{ statusInfo.name }}</span>
              <span class="font-medium" :class="statusInfo.color">{{ statusInfo.count }} รายการ</span>
            </div>
            <div class="w-full bg-gray-100 rounded-full h-1.5">
              <div 
                :class="statusInfo.bgColor" 
                class="h-1.5 rounded-full transition-all duration-300" 
                :style="{ width: (statusInfo.count / order.length * 100) + '%' }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Payment Summary Widget -->
      <div v-if="order.length > 0" class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-900 flex items-center mb-3">
          <font-awesome-icon :icon="['fas','credit-card']" class="mr-2 text-green-600" />
          สรุปการชำระเงิน
        </h3>
        
        <div class="space-y-3">
          <div class="bg-green-50 rounded-lg p-2 border border-green-100">
            <div class="flex items-center justify-between">
              <span class="text-xs text-green-700">ชำระเงินแล้ว</span>
              <span class="text-sm font-bold text-green-800">{{ paymentStats.paidAmount }}฿</span>
            </div>
          </div>
          
          <div class="bg-amber-50 rounded-lg p-2 border border-amber-100">
            <div class="flex items-center justify-between">
              <span class="text-xs text-amber-700">รอชำระเงิน</span>
              <span class="text-sm font-bold text-amber-800">{{ paymentStats.pendingAmount }}฿</span>
            </div>
          </div>
          
          <div class="bg-gray-50 rounded-lg p-2 border border-gray-100">
            <div class="flex items-center justify-between">
              <span class="text-xs text-gray-700">ราคาเฉลี่ย</span>
              <span class="text-sm font-bold text-gray-800">{{ Math.round(paymentStats.averageAmount) }}฿</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Activity Widget -->
      <div v-if="order.length > 0" class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-900 flex items-center mb-3">
          <font-awesome-icon :icon="['fas','clock']" class="mr-2 text-blue-600" />
          กิจกรรมล่าสุด
        </h3>
        
        <div class="space-y-2">
          <div v-for="recentOrder in recentOrders" :key="recentOrder._id" class="flex items-center space-x-2 text-xs">
            <div class="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0"></div>
            <div class="flex-1 min-w-0">
              <p class="text-gray-900 truncate">{{ recentOrder.course.name }}</p>
              <p class="text-gray-500">{{ formatThaidate(recentOrder.createdAt) }}</p>
            </div>
            <span class="text-blue-600 font-medium">{{ recentOrder.price }}฿</span>
          </div>
        </div>
      </div>

      <!-- Quick Actions Widget -->
      <div class="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
        <h3 class="text-sm font-semibold text-gray-900 flex items-center mb-3">
          <font-awesome-icon :icon="['fas','lightning-bolt']" class="mr-2 text-yellow-600" />
          การดำเนินการด่วน
        </h3>
        
        <div class="space-y-2">
          <button 
            v-if="pendingOrders.length > 0"
            class="w-full flex items-center justify-between p-2 text-xs bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition-colors"
          >
            <span class="text-amber-700">ดูคำสั่งซื้อรอชำระ</span>
            <font-awesome-icon :icon="['fas','arrow-right']" class="text-amber-600" />
          </button>
          
          <button 
            v-if="orderStats.paid > 0"
            class="w-full flex items-center justify-between p-2 text-xs bg-green-50 hover:bg-green-100 rounded-lg border border-green-200 transition-colors"
          >
            <span class="text-green-700">ดาวน์โหลดใบเสร็จ</span>
            <font-awesome-icon :icon="['fas','download']" class="text-green-600" />
          </button>
          
          <button class="w-full flex items-center justify-between p-2 text-xs bg-purple-50 hover:bg-purple-100 rounded-lg border border-purple-200 transition-colors">
            <span class="text-purple-700">ส่งออกรายงาน</span>
            <font-awesome-icon :icon="['fas','file-export']" class="text-purple-600" />
          </button>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="flex-1 space-y-4">
      <!-- Empty State -->
      <div v-if="order.length === 0" class="text-center py-12 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-gray-100">
        <div class="w-16 h-16 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <font-awesome-icon :icon="['fas','shopping-bag']" class="text-emerald-500 text-xl" />
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">ยังไม่มีคำสั่งซื้อ</h3>
        <p class="text-sm text-gray-500">เริ่มต้นลงทะเบียนหลักสูตรเพื่อสร้างคำสั่งซื้อแรก</p>
      </div>

      <!-- Order Cards -->
      <div v-else class="space-y-3">
        <div 
          v-for="(item, index) in order" 
          :key="item._id" 
          class="group bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-emerald-200 transition-all duration-300"
        >
          <div class="p-4">
            <!-- Order Header -->
            <div class="flex items-start justify-between mb-3">
              <div class="flex-1 min-w-0">
                <div class="flex items-center space-x-3 mb-2">
                  <h3 class="text-sm font-semibold text-gray-900">
                    #{{ item._id }}
                  </h3>
                  <span 
                    :class="getStatusStyle(item.forms?.process, item.posts?.status)"
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                  >
                    <div 
                      :class="getStatusDotStyle(item.forms?.process, item.posts?.status)"
                      class="w-1.5 h-1.5 rounded-full mr-1"
                    ></div>
                    {{ findStatusByCode(item.forms?.process, item.posts?.status)?.name || 'ไม่ทราบสถานะ' }}
                  </span>
                </div>
                
                <p class="text-sm text-gray-600 mb-1">{{ item.course.name }}</p>
                <p class="text-xs text-gray-500">{{ formatThaidate(item.createdAt) }}</p>
              </div>
              
              <!-- Price and QR Button -->
              <div class="flex items-center space-x-3">
                <div class="text-right">
                  <div class="text-lg font-bold text-gray-900">{{ item.price }}฿</div>
                  <div class="text-xs text-gray-500">ราคา</div>
                </div>
                
                <button 
                  @click="openNewTab(item._id)"
                  class="inline-flex items-center px-3 py-2 border border-blue-200 rounded-lg text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                >
                  <font-awesome-icon :icon="['fas','qrcode']" class="mr-1" />
                  ชำระเงิน
                </button>
              </div>
            </div>

            <!-- Order Details Grid -->
            <div class="grid grid-cols-2 gap-3 mb-3">
              <div class="bg-gray-50 rounded-lg p-2 border border-gray-100">
                <div class="text-xs text-gray-500 mb-1">REF1</div>
                <div class="text-sm font-medium text-gray-900">{{ item.ref1 }}</div>
              </div>
              
              <div class="bg-gray-50 rounded-lg p-2 border border-gray-100">
                <div class="text-xs text-gray-500 mb-1">REF2</div>
                <div class="text-sm font-medium text-gray-900">{{ item.ref2 }}</div>
              </div>
            </div>

            <!-- Expand Button -->
            <div v-if="item.forms" class="border-t border-gray-100 pt-3">
              <button 
                @click="toggleExpand(index)"
                class="w-full flex items-center justify-between p-2 text-xs bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
              >
                <span class="text-gray-700">
                  <font-awesome-icon :icon="['fas','file-alt']" class="mr-1" />
                  รายละเอียดแบบฟอร์ม
                </span>
                <font-awesome-icon 
                  :icon="['fas', item.expanded ? 'chevron-up' : 'chevron-down']" 
                  class="text-gray-600" 
                />
              </button>
            </div>

            <!-- Expanded Content -->
            <div v-if="item.expanded && item.forms" class="mt-4 pt-4 border-t border-gray-100">
              <!-- Compact Info Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Course Info Card -->
                <div class="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
                  <div class="flex items-center mb-2">
                    <div class="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
                      <font-awesome-icon :icon="['fas','graduation-cap']" class="text-blue-600 text-xs" />
                    </div>
                    <h4 class="text-sm font-semibold text-blue-900">หลักสูตร</h4>
                  </div>
                  <p class="text-sm text-blue-800 leading-relaxed">{{ item.course.name }}</p>
                </div>

                <!-- Status Info Card -->
                <div class="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg p-3 border border-emerald-100">
                  <div class="flex items-center mb-2">
                    <div class="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center mr-2">
                      <font-awesome-icon :icon="['fas','info-circle']" class="text-emerald-600 text-xs" />
                    </div>
                    <h4 class="text-sm font-semibold text-emerald-900">สถานะปัจจุบัน</h4>
                  </div>
                  <div class="text-sm text-emerald-800">
                    <p class="font-medium">{{ findStatusByCode(item.forms?.process, item.posts?.status)?.name || 'ไม่ทราบสถานะ' }}</p>
                    <p class="text-xs text-emerald-600 mt-1">{{ findStatusByCode(item.forms?.process, item.posts?.status)?.description || 'ไม่มีรายละเอียด' }}</p>
                  </div>
                </div>
              </div>

              <!-- Form Data Section -->
              <div class="mt-4">
                <div class="flex items-center mb-3">
                  <div class="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-2">
                    <font-awesome-icon :icon="['fas','id-card']" class="text-purple-600 text-xs" />
                  </div>
                  <h4 class="text-sm font-semibold text-gray-900">ข้อมูลใบสมัคร</h4>
                  <div class="flex-1 border-t border-gray-200 ml-3"></div>
                </div>
                
                <!-- Compact Form Render -->
                <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100">
                  <div class="compact-form-container">
                    <DataSetRender :formData="item" :formID="item.forms._id" />
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

<script>
import debug from '@/plugins/Logger.js';
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import DataSetRender from '@/utils/DataSetRender/Loader.vue';

export default {
  props: {
    member: Object,
  },
  components: {
    DataSetRender
  },
  data() {
    return {
      config: storageManager.get('configs'),
      profile: storageManager.get('session','user'),
      session: storageManager.get('session'),
      message: 'Order',
      order:[],
    };
  },
  computed: {
    orderStats() {
      if (!this.order.length) return { total: 0, paid: 0, pending: 0, totalAmount: 0 };
      
      let paid = 0;
      let pending = 0;
      let totalAmount = 0;
      
      this.order.forEach(order => {
        totalAmount += order.price || 0;
        const status = this.findStatusByCode(order.forms?.process, order.posts?.status);
        if (status && status.name === 'ชำระเงินแล้ว') {
          paid++;
        } else {
          pending++;
        }
      });
      
      return {
        total: this.order.length,
        paid,
        pending,
        totalAmount
      };
    },
    statusDistribution() {
      if (!this.order.length) return {};
      
      const distribution = {};
      
      this.order.forEach(order => {
        const status = this.findStatusByCode(order.forms?.process, order.posts?.status);
        const statusName = status?.name || 'ไม่ทราบสถานะ';
        
        if (!distribution[statusName]) {
          distribution[statusName] = {
            name: statusName,
            count: 0,
            color: this.getStatusTextColor(statusName),
            bgColor: this.getStatusBgColor(statusName)
          };
        }
        distribution[statusName].count++;
      });
      
      return distribution;
    },
    paymentStats() {
      if (!this.order.length) return { paidAmount: 0, pendingAmount: 0, averageAmount: 0 };
      
      let paidAmount = 0;
      let pendingAmount = 0;
      let totalAmount = 0;
      
      this.order.forEach(order => {
        const amount = order.price || 0;
        totalAmount += amount;
        
        const status = this.findStatusByCode(order.forms?.process, order.posts?.status);
        if (status && status.name === 'ชำระเงินแล้ว') {
          paidAmount += amount;
        } else {
          pendingAmount += amount;
        }
      });
      
      return {
        paidAmount,
        pendingAmount,
        averageAmount: this.order.length > 0 ? totalAmount / this.order.length : 0
      };
    },
    recentOrders() {
      return this.order
        .slice() // Create a copy to avoid mutating original array
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5); // Show only 5 most recent
    },
    pendingOrders() {
      return this.order.filter(order => {
        const status = this.findStatusByCode(order.forms?.process, order.posts?.status);
        return !status || status.name !== 'ชำระเงินแล้ว';
      });
    }
  },
  methods: {
    findStatusByCode(code, status) {
      return status?.find(s => s.code === code) || null;
    },
    getStatusStyle(code, status) {
      const statusObj = this.findStatusByCode(code, status);
      const statusName = statusObj?.name || 'ไม่ทราบสถานะ';
      
      switch (statusName) {
        case 'ชำระเงินแล้ว':
          return 'bg-green-100 text-green-700';
        case 'รอชำระเงิน':
          return 'bg-amber-100 text-amber-700';
        case 'ยกเลิก':
          return 'bg-red-100 text-red-700';
        default:
          return 'bg-gray-100 text-gray-700';
      }
    },
    getStatusDotStyle(code, status) {
      const statusObj = this.findStatusByCode(code, status);
      const statusName = statusObj?.name || 'ไม่ทราบสถานะ';
      
      switch (statusName) {
        case 'ชำระเงินแล้ว':
          return 'bg-green-400';
        case 'รอชำระเงิน':
          return 'bg-amber-400';
        case 'ยกเลิก':
          return 'bg-red-400';
        default:
          return 'bg-gray-400';
      }
    },
    getStatusTextColor(statusName) {
      switch (statusName) {
        case 'ชำระเงินแล้ว':
          return 'text-green-600';
        case 'รอชำระเงิน':
          return 'text-amber-600';
        case 'ยกเลิก':
          return 'text-red-600';
        default:
          return 'text-gray-600';
      }
    },
    getStatusBgColor(statusName) {
      switch (statusName) {
        case 'ชำระเงินแล้ว':
          return 'bg-green-500';
        case 'รอชำระเงิน':
          return 'bg-amber-500';
        case 'ยกเลิก':
          return 'bg-red-500';
        default:
          return 'bg-gray-500';
      }
    },
    toggleExpand(index) {
      // Toggle the expanded state of the item at the specified index
      this.order[index].expanded = !this.order[index].expanded;
    },
    openNewTab(url) {
      // Open the URL in a new tab
      window.open("https://" + this.session.current.hostname + '/lesson/pay/' + url, '_blank');
    },
    formatThaidate(date) {
      return convertUtils.toThaiDatetime(date);
    },
    countEnrollmentsByStatus(enrollments = [], status) {
      if (!enrollments || enrollments.length === 0) {
        return 0;
      }
      return enrollments.filter((enrollment) => enrollment.analytics && enrollment.analytics.status && enrollment.analytics.status.trim() === status).length;
    },
    countTotalEnrollments(enrollments = []) {
      if (!enrollments) {
        return 0;
      }
      return enrollments.length;
    },
    async getData() {
      try {
        this.activeBlock = true;
        const pipeline = [
          {
              $match: {
                  $and: [{ userID: this.member._id }]
              }
          },
          {
              $lookup: {
                  from: "form",
                  let: { userId: "$userID", courseId: "$courseID" },
                  pipeline: [
                      {
                          $match: {
                              $expr: {
                                  $and: [
                                      { $eq: ["$userID", "$$userId"] },
                                      { $eq: ["$courseID", "$$courseId"] }
                                  ]
                              }
                          }
                      },
                      {
                          $set: { formID: { $toObjectId: "$formID" } }
                      }
                  ],
                  as: "forms"
              }
          },
          {
              $set: { courseID: { $toObjectId: "$courseID" } }
          },
          {
              $lookup: {
                  from: "course",
                  localField: "courseID",
                  foreignField: "_id",
                  as: "course"
              }
          },
          {
              $unwind: "$course"
          },
          {
              $unwind: "$forms" // Unwind the "forms" array
          },
          {
              $set: { formID: "$forms.formID" } // Set formID
          },
          {
              $lookup: {
                  from: "post",
                  localField: "formID",
                  foreignField: "_id",
                  as: "posts"
              }
          },
          {
              $unwind: "$posts" // Unwind the "posts" array
          },
          {
              $set: { enrollID: { $toObjectId: "$forms.enrollID" }  } // Set formID
          },
          {
              $lookup: {
                  from: "enroll",
                  localField: "enrollID",
                  foreignField: "_id",
                  as: "enroll"
              }
          },
          {
              $unwind: { 
                  path: "$enroll", 
                  preserveNullAndEmptyArrays: true // Preserve documents even if "enroll" is not found or is empty
              }
          },
          {
              $sort: { "posts.createdAt": -1 } // Sort based on the "createdAt" field of the "posts"
          },
          {
              $facet: {
                  enroll: [{ $skip: (1 - 1) * 100 }, { $limit: 100 }],
                  totalCount: [{ $count: 'count' }],
              }
          }
      ];

      const resAPI = await Request.POST('order/aggregate', { pipeline }, this.config.key);
      const data = resAPI.data[0]['enroll'];
      

      this.order = data; // Assuming you want to assign the entire response to the 'order' key

      this.activeBlock = false;

    } catch (error) {
        console.log(error);
    }
}

},
mounted () {
  
  this.getData();
  debug.log("this.member.firstname:", this.member.firstname);
  debug.log("this.member.lastname:", this.member.lastname);

  const pageTitle = this.member.firstname + " " + this.member.lastname + " / เอกสาร";
  debug.log("pageTitle:", pageTitle);

  this.$setPageTitle(pageTitle);
},
};
</script>

<style scoped>
.styled-text {
  color: blue;
  font-size: 20px;
}

/* Compact Form Styling */
.compact-form-container {
  @apply text-sm;
}

/* Override DataSetRender styles for more compact display */
.compact-form-container :deep(.form-field) {
  @apply mb-2 p-2 bg-white rounded-lg border border-purple-200;
}

.compact-form-container :deep(.form-label) {
  @apply text-xs font-medium text-purple-700 mb-1;
}

.compact-form-container :deep(.form-value) {
  @apply text-sm text-gray-900;
}

.compact-form-container :deep(.form-grid) {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2;
}

.compact-form-container :deep(.form-row) {
  @apply flex flex-col space-y-1;
}

.compact-form-container :deep(.form-section) {
  @apply mb-3;
}

.compact-form-container :deep(.form-section-title) {
  @apply text-sm font-semibold text-purple-800 mb-2 pb-1 border-b border-purple-200;
}

/* Input field styling */
.compact-form-container :deep(input),
.compact-form-container :deep(textarea),
.compact-form-container :deep(select) {
  @apply text-sm px-2 py-1 border border-purple-200 rounded focus:border-purple-400 focus:ring-1 focus:ring-purple-200;
}

/* Table styling if any */
.compact-form-container :deep(table) {
  @apply w-full text-xs;
}

.compact-form-container :deep(th) {
  @apply bg-purple-100 text-purple-800 px-2 py-1 text-left font-medium;
}

.compact-form-container :deep(td) {
  @apply px-2 py-1 border-b border-purple-100;
}

/* List styling */
.compact-form-container :deep(ul),
.compact-form-container :deep(ol) {
  @apply text-sm space-y-1;
}

.compact-form-container :deep(li) {
  @apply flex items-start space-x-2;
}

/* Remove excessive margins and padding */
.compact-form-container :deep(h1),
.compact-form-container :deep(h2),
.compact-form-container :deep(h3),
.compact-form-container :deep(h4),
.compact-form-container :deep(h5),
.compact-form-container :deep(h6) {
  @apply text-sm font-semibold text-purple-800 mb-1 mt-2;
}

.compact-form-container :deep(p) {
  @apply text-sm text-gray-700 mb-1;
}

.compact-form-container :deep(.field-group) {
  @apply bg-gradient-to-r from-white to-purple-50 rounded-lg p-2 mb-2 border border-purple-100;
}

/* Modern card-like field appearance */
.compact-form-container :deep(.data-field) {
  @apply bg-white rounded-lg border border-purple-100 p-2 shadow-sm hover:shadow-md transition-shadow duration-200;
}

.compact-form-container :deep(.data-field .label) {
  @apply text-xs font-medium text-purple-600 mb-1 flex items-center;
}

.compact-form-container :deep(.data-field .value) {
  @apply text-sm text-gray-900 font-medium;
}

/* Icon styling for fields */
.compact-form-container :deep(.field-icon) {
  @apply w-4 h-4 text-purple-500 mr-1;
}

/* Responsive grid for form fields */
@media (min-width: 768px) {
  .compact-form-container :deep(.form-grid-responsive) {
    @apply grid-cols-2;
  }
}

@media (min-width: 1024px) {
  .compact-form-container :deep(.form-grid-responsive) {
    @apply grid-cols-3;
  }
}

/* Custom scrollbar for form content */
.compact-form-container::-webkit-scrollbar {
  width: 4px;
}

.compact-form-container::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.compact-form-container::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 2px;
}

.compact-form-container::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
  