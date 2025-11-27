<template>
  <div class="bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="px-4 py-3 border-b border-gray-200">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <i class="fas fa-user-crown text-blue-600"></i>
          <h3 class="font-medium text-gray-900">👑 การจัดการเจ้าของ Collection</h3>
        </div>
        <div class="flex items-center gap-2">
          <button
            v-if="!isEditing"
            @click="startEditing"
            class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <i class="fas fa-edit mr-1"></i>
            แก้ไข
          </button>
          <button
            v-if="isEditing"
            @click="saveOwnership"
            :disabled="saving"
            class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
          >
            <i class="fas fa-save mr-1"></i>
            {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
          </button>
          <button
            v-if="isEditing"
            @click="cancelEditing"
            class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <i class="fas fa-times mr-1"></i>
            ยกเลิก
          </button>
        </div>
      </div>
    </div>

    <div class="p-4">
      <!-- Ownership Summary (View Mode) -->
      <div v-if="!isEditing" class="space-y-6">
        <!-- Primary Owner -->
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium text-blue-900 flex items-center gap-2">
              <i class="fas fa-crown text-blue-600"></i>
              เจ้าของหลัก (Primary Owner)
            </h4>
            <div class="flex items-center gap-2">
              <span :class="[
                'text-xs px-2 py-1 rounded-full',
                ownershipData.primaryOwner?.ownerType === 'individual' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
              ]">
                {{ ownershipData.primaryOwner?.ownerType === 'individual' ? 'บุคคล' : 'นิติบุคคล' }}
              </span>
              <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                Primary
              </span>
            </div>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-blue-700">ชื่อ-นามสกุล</label>
              <p class="text-sm text-blue-900 font-medium">
                {{ ownershipData.primaryOwner?.name || 'ไม่ระบุ' }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-blue-700">อีเมล</label>
              <p class="text-sm text-blue-900">
                {{ ownershipData.primaryOwner?.email || 'ไม่ระบุ' }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-blue-700">เบอร์โทรศัพท์</label>
              <p class="text-sm text-blue-900">
                {{ ownershipData.primaryOwner?.phone || 'ไม่ระบุ' }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-blue-700">ตำแหน่ง</label>
              <p class="text-sm text-blue-900">
                {{ ownershipData.primaryOwner?.position || 'ไม่ระบุ' }}
              </p>
            </div>
            <div class="md:col-span-2">
              <label class="text-xs font-medium text-blue-700">ที่อยู่</label>
              <p class="text-sm text-blue-900">
                {{ formatAddress(ownershipData.primaryOwner?.address) || 'ไม่ระบุ' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Billing Contact -->
        <div class="bg-green-50 rounded-lg p-4 border border-green-200">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium text-green-900 flex items-center gap-2">
              <i class="fas fa-credit-card text-green-600"></i>
              ผู้ติดต่อด้านการเงิน (Billing Contact)
            </h4>
            <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Billing
            </span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-green-700">ชื่อ-นามสกุล</label>
              <p class="text-sm text-green-900 font-medium">
                {{ ownershipData.billingContact?.name || ownershipData.primaryOwner?.name || 'ไม่ระบุ' }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-green-700">อีเมล</label>
              <p class="text-sm text-green-900">
                {{ ownershipData.billingContact?.email || ownershipData.primaryOwner?.email || 'ไม่ระบุ' }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-green-700">เบอร์โทรศัพท์</label>
              <p class="text-sm text-green-900">
                {{ ownershipData.billingContact?.phone || ownershipData.primaryOwner?.phone || 'ไม่ระบุ' }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-green-700">แผนก</label>
              <p class="text-sm text-green-900">
                {{ ownershipData.billingContact?.department || 'ไม่ระบุ' }}
              </p>
            </div>
            <div class="md:col-span-2">
              <label class="text-xs font-medium text-green-700">ที่อยู่ (สำหรับออกใบเสร็จ)</label>
              <p class="text-sm text-green-900">
                {{ formatAddress(ownershipData.billingContact?.address || ownershipData.primaryOwner?.address) || 'ไม่ระบุ' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Technical Contact -->
        <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div class="flex items-center justify-between mb-3">
            <h4 class="font-medium text-purple-900 flex items-center gap-2">
              <i class="fas fa-cogs text-purple-600"></i>
              ผู้ติดต่อด้านเทคนิค (Technical Contact)
            </h4>
            <span class="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">
              Technical
            </span>
          </div>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-purple-700">ชื่อ-นามสกุล</label>
              <p class="text-sm text-purple-900 font-medium">
                {{ ownershipData.technicalContact?.name || ownershipData.primaryOwner?.name || 'ไม่ระบุ' }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-purple-700">อีเมล</label>
              <p class="text-sm text-purple-900">
                {{ ownershipData.technicalContact?.email || ownershipData.primaryOwner?.email || 'ไม่ระบุ' }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-purple-700">เบอร์โทรศัพท์</label>
              <p class="text-sm text-purple-900">
                {{ ownershipData.technicalContact?.phone || ownershipData.primaryOwner?.phone || 'ไม่ระบุ' }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-purple-700">ความเชี่ยวชาญ</label>
              <p class="text-sm text-purple-900">
                {{ ownershipData.technicalContact?.expertise || 'ไม่ระบุ' }}
              </p>
            </div>
            <div class="md:col-span-2">
              <label class="text-xs font-medium text-purple-700">ที่อยู่</label>
              <p class="text-sm text-purple-900">
                {{ formatAddress(ownershipData.technicalContact?.address || ownershipData.primaryOwner?.address) || 'ไม่ระบุ' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Company/Organization Info - แสดงเฉพาะเมื่อเป็นนิติบุคคล -->
        <div v-if="ownershipData.primaryOwner?.ownerType === 'corporate'" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 class="font-medium text-gray-900 mb-3 flex items-center gap-2">
            <i class="fas fa-building text-gray-600"></i>
            ข้อมูลองค์กร (Organization Info)
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-xs font-medium text-gray-700">ชื่อบริษัท/องค์กร</label>
              <p class="text-sm text-gray-900 font-medium">
                {{ ownershipData.organization?.name || 'ไม่ระบุ' }}
              </p>
            </div>
            <div>
              <label class="text-xs font-medium text-gray-700">เลขประจำตัวผู้เสียภาษี</label>
              <p class="text-sm text-gray-900">
                {{ ownershipData.organization?.taxId || 'ไม่ระบุ' }}
              </p>
            </div>
            <div class="md:col-span-2">
              <label class="text-xs font-medium text-gray-700">ที่อยู่</label>
              <p class="text-sm text-gray-900">
                {{ formatAddress(ownershipData.organization?.address) || 'ไม่ระบุ' }}
              </p>
            </div>
          </div>
        </div>

        <!-- Ownership History -->
        <div class="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <h4 class="font-medium text-yellow-900 mb-3 flex items-center gap-2">
            <i class="fas fa-history text-yellow-600"></i>
            ประวัติการเปลี่ยนแปลงเจ้าของ
            <span class="text-xs bg-yellow-200 px-2 py-1 rounded-full ml-2">{{ ownershipHistory ? ownershipHistory.length : 0 }}</span>
          </h4>
          
          <!-- Debug Info (ลบออกหลังจากแก้ไขเสร็จ) -->
          <div class="text-xs text-yellow-600 mb-2 p-2 bg-yellow-100 rounded flex items-center justify-between">
            <span>
              Debug: currentOwnerId = {{ currentOwnerId }}, 
              historyLength = {{ ownershipHistory ? ownershipHistory.length : 'null' }},
              hasHistory = {{ hasOwnershipHistory }}
            </span>
            <button 
              @click="loadOwnershipHistory" 
              class="px-2 py-1 bg-yellow-300 text-yellow-800 rounded text-xs hover:bg-yellow-400"
            >
              รีเฟรช
            </button>
          </div>
          
          <div class="space-y-2">
            <div v-if="hasOwnershipHistory">
              <div v-for="history in ownershipHistory" :key="history._id" 
                   class="flex items-center justify-between py-2 border-b border-yellow-200 last:border-b-0">
                <div>
                  <p class="text-sm text-yellow-900 font-medium">{{ history.action }}</p>
                  <p class="text-xs text-yellow-700">{{ history.details }}</p>
                </div>
                <span class="text-xs text-yellow-600">{{ formatDate(history.timestamp) }}</span>
              </div>
            </div>
            
            <div v-else class="text-center py-4">
              <i class="fas fa-info-circle text-yellow-400 text-2xl mb-2"></i>
              <p class="text-sm text-yellow-700">ยังไม่มีประวัติการเปลี่ยนแปลง</p>
              <p class="text-xs text-yellow-600 mt-1">จำนวนประวัติ: {{ ownershipHistory ? ownershipHistory.length : 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Edit Form -->
      <div v-else class="space-y-6">
        <!-- Primary Owner Form -->
        <div class="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 class="font-medium text-blue-900 mb-4 flex items-center gap-2">
            <i class="fas fa-crown text-blue-600"></i>
            เจ้าของหลัก (Primary Owner)
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Owner Type -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-blue-700 mb-2">ประเภทเจ้าของ *</label>
              <div class="flex gap-4">
                <label class="flex items-center gap-2">
                  <input
                    v-model="editForm.primaryOwner.ownerType"
                    type="radio"
                    value="individual"
                    class="w-4 h-4 text-blue-600 border-blue-300 focus:ring-blue-500"
                  />
                  <span class="text-sm text-blue-700">บุคคลธรรมดา</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    v-model="editForm.primaryOwner.ownerType"
                    type="radio"
                    value="corporate"
                    class="w-4 h-4 text-blue-600 border-blue-300 focus:ring-blue-500"
                  />
                  <span class="text-sm text-blue-700">นิติบุคคล</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-blue-700 mb-1">
                {{ editForm.primaryOwner.ownerType === 'individual' ? 'ชื่อ-นามสกุล *' : 'ชื่อบริษัท/องค์กร *' }}
              </label>
              <input
                v-model="editForm.primaryOwner.name"
                type="text"
                required
                class="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :placeholder="editForm.primaryOwner.ownerType === 'individual' ? 'กรอกชื่อ-นามสกุล' : 'กรอกชื่อบริษัท/องค์กร'"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-blue-700 mb-1">อีเมล *</label>
              <input
                v-model="editForm.primaryOwner.email"
                type="email"
                required
                class="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="example@email.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-blue-700 mb-1">เบอร์โทรศัพท์</label>
              <input
                v-model="editForm.primaryOwner.phone"
                type="tel"
                class="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="08X-XXX-XXXX"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-blue-700 mb-1">
                {{ editForm.primaryOwner.ownerType === 'individual' ? 'ตำแหน่ง' : 'ผู้ติดต่อ/ตำแหน่ง' }}
              </label>
              <input
                v-model="editForm.primaryOwner.position"
                type="text"
                class="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                :placeholder="editForm.primaryOwner.ownerType === 'individual' ? 'เช่น เจ้าของ, ผู้บริหาร' : 'เช่น ผู้จัดการ, ผู้ติดต่อหลัก'"
              />
            </div>
            
            <!-- ID Number for Corporate -->
            <div v-if="editForm.primaryOwner.ownerType === 'corporate'">
              <label class="block text-sm font-medium text-blue-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
              <input
                v-model="editForm.primaryOwner.taxId"
                type="text"
                class="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0123456789012"
              />
            </div>
            
            <!-- ID Number for Individual -->
            <div v-if="editForm.primaryOwner.ownerType === 'individual'">
              <label class="block text-sm font-medium text-blue-700 mb-1">เลขประจำตัวประชาชน</label>
              <input
                v-model="editForm.primaryOwner.nationalId"
                type="text"
                class="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="1234567890123"
                maxlength="13"
              />
            </div>

            <!-- Address -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-blue-700 mb-1">ที่อยู่</label>
              <textarea
                v-model="editForm.primaryOwner.address"
                rows="3"
                class="w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Billing Contact Form -->
        <div class="bg-green-50 rounded-lg p-4 border border-green-200">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-medium text-green-900 flex items-center gap-2">
              <i class="fas fa-credit-card text-green-600"></i>
              ผู้ติดต่อด้านการเงิน
            </h4>
            <label class="flex items-center gap-2">
              <input
                v-model="useSameAsPrimary.billing"
                type="checkbox"
                class="w-4 h-4 text-green-600 border-green-300 rounded focus:ring-green-500"
              />
              <span class="text-sm text-green-700">ใช้ข้อมูลเดียวกับเจ้าของหลัก</span>
            </label>
          </div>
          
          <div v-if="!useSameAsPrimary.billing" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-green-700 mb-1">ชื่อ-นามสกุล</label>
              <input
                v-model="editForm.billingContact.name"
                type="text"
                class="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-green-700 mb-1">อีเมล</label>
              <input
                v-model="editForm.billingContact.email"
                type="email"
                class="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="billing@email.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-green-700 mb-1">เบอร์โทรศัพท์</label>
              <input
                v-model="editForm.billingContact.phone"
                type="tel"
                class="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="08X-XXX-XXXX"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-green-700 mb-1">แผนก</label>
              <input
                v-model="editForm.billingContact.department"
                type="text"
                class="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="เช่น การเงิน, บัญชี"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-green-700 mb-1">ที่อยู่ (สำหรับออกใบเสร็จ)</label>
              <textarea
                v-model="editForm.billingContact.address"
                rows="3"
                class="w-full px-3 py-2 border border-green-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="ที่อยู่สำหรับออกใบเสร็จ/ใบกำกับภาษี"
              ></textarea>
            </div>
          </div>
          
          <div v-else class="text-sm text-green-700 bg-green-100 p-3 rounded-md">
            <i class="fas fa-info-circle mr-2"></i>
            จะใช้ข้อมูลจากเจ้าของหลักสำหรับการติดต่อด้านการเงิน
          </div>
        </div>

        <!-- Technical Contact Form -->
        <div class="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-medium text-purple-900 flex items-center gap-2">
              <i class="fas fa-cogs text-purple-600"></i>
              ผู้ติดต่อด้านเทคนิค
            </h4>
            <label class="flex items-center gap-2">
              <input
                v-model="useSameAsPrimary.technical"
                type="checkbox"
                class="w-4 h-4 text-purple-600 border-purple-300 rounded focus:ring-purple-500"
              />
              <span class="text-sm text-purple-700">ใช้ข้อมูลเดียวกับเจ้าของหลัก</span>
            </label>
          </div>
          
          <div v-if="!useSameAsPrimary.technical" class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-purple-700 mb-1">ชื่อ-นามสกุล</label>
              <input
                v-model="editForm.technicalContact.name"
                type="text"
                class="w-full px-3 py-2 border border-purple-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="กรอกชื่อ-นามสกุล"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-purple-700 mb-1">อีเมล</label>
              <input
                v-model="editForm.technicalContact.email"
                type="email"
                class="w-full px-3 py-2 border border-purple-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="tech@email.com"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-purple-700 mb-1">เบอร์โทรศัพท์</label>
              <input
                v-model="editForm.technicalContact.phone"
                type="tel"
                class="w-full px-3 py-2 border border-purple-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="08X-XXX-XXXX"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-purple-700 mb-1">ความเชี่ยวชาญ</label>
              <input
                v-model="editForm.technicalContact.expertise"
                type="text"
                class="w-full px-3 py-2 border border-purple-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="เช่น Web Development, System Admin"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-purple-700 mb-1">ที่อยู่</label>
              <textarea
                v-model="editForm.technicalContact.address"
                rows="3"
                class="w-full px-3 py-2 border border-purple-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="ที่อยู่สำหรับการติดต่อด้านเทคนิค"
              ></textarea>
            </div>
          </div>
          
          <div v-else class="text-sm text-purple-700 bg-purple-100 p-3 rounded-md">
            <i class="fas fa-info-circle mr-2"></i>
            จะใช้ข้อมูลจากเจ้าของหลักสำหรับการติดต่อด้านเทคนิค
          </div>
        </div>

        <!-- Organization Form - แสดงเฉพาะเมื่อเป็นนิติบุคคล -->
        <div v-if="editForm.primaryOwner.ownerType === 'corporate'" class="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h4 class="font-medium text-gray-900 mb-4 flex items-center gap-2">
            <i class="fas fa-building text-gray-600"></i>
            ข้อมูลองค์กร
          </h4>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อบริษัท/องค์กร</label>
              <input
                v-model="editForm.organization.name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="บริษัท ABC จำกัด"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">เลขประจำตัวผู้เสียภาษี</label>
              <input
                v-model="editForm.organization.taxId"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0123456789012"
              />
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">ที่อยู่</label>
              <textarea
                v-model="editForm.organization.address"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="123 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110"
              ></textarea>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import OwnershipService from '../function/OwnershipService.js';
import CollectionService from '../function/CollectionService.js';

export default {
  name: 'OwnershipManager',
  props: {
    collectionId: {
      type: String,
      required: true
    },
    initialOwnership: {
      type: Object,
      default: () => ({})
    },
    hostkey: {
      type: String,
      required: true
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    hasOwnershipHistory() {
      return this.ownershipHistory && this.ownershipHistory.length > 0;
    }
  },
  data() {
    return {
      isEditing: false,
      saving: false,
      ownershipService: null,
      collectionService: null,
      currentOwnerId: null, // ID ของ ownership record ปัจจุบัน
      ownershipData: {
        primaryOwner: {
          name: '',
          email: '',
          phone: '',
          position: '',
          ownerType: 'individual', // individual or corporate
          address: '',
          nationalId: '', // for individual
          taxId: '' // for corporate
        },
        billingContact: {
          name: '',
          email: '',
          phone: '',
          department: '',
          address: ''
        },
        technicalContact: {
          name: '',
          email: '',
          phone: '',
          expertise: '',
          address: ''
        },
        organization: {
          name: '',
          taxId: '',
          address: ''
        }
      },
      editForm: {
        primaryOwner: {
          name: '',
          email: '',
          phone: '',
          position: '',
          ownerType: 'individual', // individual or corporate
          address: '',
          nationalId: '', // for individual
          taxId: '' // for corporate
        },
        billingContact: {
          name: '',
          email: '',
          phone: '',
          department: '',
          address: ''
        },
        technicalContact: {
          name: '',
          email: '',
          phone: '',
          expertise: '',
          address: ''
        },
        organization: {
          name: '',
          taxId: '',
          address: ''
        }
      },
      useSameAsPrimary: {
        billing: false,
        technical: false
      },
      ownershipHistory: []
    };
  },
  async mounted() {
    // Initialize services
    try {
      // Try normal import first
      if (OwnershipService && CollectionService) {
        this.ownershipService = new OwnershipService(this.hostkey);
        this.collectionService = new CollectionService(this.hostkey);
        console.log('Services initialized successfully');
        console.log('OwnershipService:', this.ownershipService);
        console.log('CollectionService:', this.collectionService);
      } else {
        console.warn('Services not available via static import, trying dynamic import...');
        // Fallback to dynamic import
        const [OwnershipServiceModule, CollectionServiceModule] = await Promise.all([
          import('../function/OwnershipService.js'),
          import('../function/CollectionService.js')
        ]);
        
        this.ownershipService = new OwnershipServiceModule.default(this.hostkey);
        this.collectionService = new CollectionServiceModule.default(this.hostkey);
        console.log('Services initialized via dynamic import');
      }
    } catch (error) {
      console.error('Error initializing services:', error);
      this.$emit('error', 'ไม่สามารถเริ่มต้นระบบได้: ' + error.message);
    }
  },
  watch: {
    initialOwnership: {
      handler(newData) {
        if (newData && Object.keys(newData).length > 0) {
          this.loadOwnershipData(newData);
        }
      },
      immediate: true,
      deep: true
    },
    'useSameAsPrimary.billing'(useSame) {
      if (useSame) {
        this.editForm.billingContact = { ...this.editForm.primaryOwner };
      }
    },
    'useSameAsPrimary.technical'(useSame) {
      if (useSame) {
        this.editForm.technicalContact = { ...this.editForm.primaryOwner };
      }
    }
  },
  methods: {
    async loadOwnershipData(data) {
      console.log('Loading ownership data:', data);
      
      // ถ้าเป็น ownership object ที่มี _id แสดงว่าเป็นข้อมูลจาก ownership collection
      if (data && data._id) {
        this.currentOwnerId = data._id;
        console.log('Set currentOwnerId to:', this.currentOwnerId);
        
        this.ownershipData = {
          primaryOwner: data.primaryOwner || this.ownershipData.primaryOwner,
          billingContact: data.billingContact || this.ownershipData.billingContact,
          technicalContact: data.technicalContact || this.ownershipData.technicalContact,
          organization: data.organization || this.ownershipData.organization
        };
        
        // Load ownership history
        await this.loadOwnershipHistory();
      } else {
        console.log('No _id found, treating as embedded data');
        // ข้อมูลเก่าแบบ embedded - ไม่มี _id
        this.ownershipData = {
          primaryOwner: data.primaryOwner || this.ownershipData.primaryOwner,
          billingContact: data.billingContact || this.ownershipData.billingContact,
          technicalContact: data.technicalContact || this.ownershipData.technicalContact,
          organization: data.organization || this.ownershipData.organization
        };
        
        this.ownershipHistory = data.ownershipHistory || [];
      }
      
      // Check if billing/technical contacts are same as primary
      this.checkSameAsPrimary();
    },

    async loadOwnershipHistory() {
      if (this.currentOwnerId) {
        try {
          console.log('Loading history for ownerId:', this.currentOwnerId);
          
          // ตรวจสอบว่า ownershipService มีอยู่หรือไม่
          if (!this.ownershipService) {
            console.error('OwnershipService is null, trying to reinitialize...');
            this.ownershipService = new OwnershipService(this.hostkey);
          }
          
          // ตรวจสอบว่า method มีอยู่หรือไม่
          if (!this.ownershipService.getOwnershipHistory) {
            console.error('getOwnershipHistory method not found');
            return;
          }
          
          const historyResult = await this.ownershipService.getOwnershipHistory(this.currentOwnerId);
          console.log('History result:', historyResult);
          if (historyResult.success) {
            this.ownershipHistory = historyResult.data;
            console.log('Updated ownershipHistory:', this.ownershipHistory);
            console.log('ownershipHistory length:', this.ownershipHistory.length);
            
            // Force reactivity update
            this.$forceUpdate();
          } else {
            console.error('Failed to load history:', historyResult.message);
          }
        } catch (error) {
          console.error('Error loading ownership history:', error);
          this.$emit('error', 'ไม่สามารถโหลดประวัติการเปลี่ยนแปลงได้: ' + error.message);
        }
      } else {
        console.log('No currentOwnerId, skipping history load');
      }
    },
    
    checkSameAsPrimary() {
      const primary = this.ownershipData.primaryOwner;
      const billing = this.ownershipData.billingContact;
      const technical = this.ownershipData.technicalContact;
      
      this.useSameAsPrimary.billing = (
        billing.name === primary.name &&
        billing.email === primary.email &&
        billing.phone === primary.phone
      );
      
      this.useSameAsPrimary.technical = (
        technical.name === primary.name &&
        technical.email === primary.email &&
        technical.phone === primary.phone
      );
    },
    
    startEditing() {
      if (this.readonly) return;
      
      this.isEditing = true;
      // Copy current data to edit form
      this.editForm = JSON.parse(JSON.stringify(this.ownershipData));
      this.checkSameAsPrimary();
    },
    
    cancelEditing() {
      this.isEditing = false;
      this.editForm = JSON.parse(JSON.stringify(this.ownershipData));
      this.useSameAsPrimary = { billing: false, technical: false };
    },
    
    async saveOwnership() {
      if (!this.validateForm()) {
        return;
      }
      
      this.saving = true;
      
      try {
        // Apply same-as-primary logic
        if (this.useSameAsPrimary.billing) {
          this.editForm.billingContact = { ...this.editForm.primaryOwner };
        }
        
        if (this.useSameAsPrimary.technical) {
          this.editForm.technicalContact = { ...this.editForm.primaryOwner };
        }

        let response;
        
        // ถ้ามี ownership record อยู่แล้ว ให้อัพเดท ไม่งั้นสร้างใหม่
        if (this.currentOwnerId) {
          response = await this.ownershipService.updateOwner(this.currentOwnerId, this.editForm);
        } else {
          response = await this.ownershipService.createOwner(this.editForm);
          
          // ถ้าสร้างใหม่สำเร็จ ให้ผูกกับ Collection
          if (response.success) {
            this.currentOwnerId = response.data._id;
            console.log('Created new owner with ID:', this.currentOwnerId);
            
            // อัพเดท Collection ให้มี ownerId
            const assignResult = await this.collectionService.assignOwnerToCollection(this.collectionId, this.currentOwnerId);
            console.log('Assign owner to collection result:', assignResult);
          }
        }
        
        if (response.success) {
          // Update local data
          this.ownershipData = JSON.parse(JSON.stringify(this.editForm));
          
          // Add to history
          await this.ownershipService.addOwnershipHistory(
            this.currentOwnerId,
            'อัพเดทข้อมูลเจ้าของ',
            'อัพเดทข้อมูลการติดต่อและองค์กร'
          );
          
          // Refresh history
          await this.loadOwnershipHistory();
          
          // Exit edit mode
          this.isEditing = false;
          
          // Emit success
          this.$emit('ownership-updated', this.ownershipData);
          this.$emit('success', 'บันทึกข้อมูลเจ้าของเรียบร้อยแล้ว');
        } else {
          throw new Error(response.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
        }
      } catch (error) {
        console.error('Error saving ownership:', error);
        this.$emit('error', error.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      } finally {
        this.saving = false;
      }
    },
    
    validateForm() {
      const primary = this.editForm.primaryOwner;
      
      if (!primary.name || !primary.email) {
        this.$emit('error', 'กรุณากรอกชื่อและอีเมลของเจ้าของหลัก');
        return false;
      }
      
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(primary.email)) {
        this.$emit('error', 'รูปแบบอีเมลไม่ถูกต้อง');
        return false;
      }
      
      return true;
    },
    
    // Method นี้เก็บไว้เพื่อ backward compatibility (ถ้ามีการใช้งานจากที่อื่น)
    async updateOwnershipData(ownershipData) {
      console.warn('updateOwnershipData is deprecated. Use OwnershipService instead.');
      
      // ใช้ service ใหม่แทน
      if (this.currentOwnerId) {
        return await this.ownershipService.updateOwner(this.currentOwnerId, ownershipData);
      } else {
        const result = await this.ownershipService.createOwner(ownershipData);
        if (result.success) {
          this.currentOwnerId = result.data._id;
          await this.collectionService.assignOwnerToCollection(this.collectionId, this.currentOwnerId);
        }
        return result;
      }
    },
    
    formatAddress(address) {
      if (!address) return '';
      return address.replace(/\n/g, ', ');
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      return new Date(dateString).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }
};
</script>

<style scoped>
/* Custom transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Form styling */
input:focus, textarea:focus, select:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* Card hover effects */
.bg-blue-50:hover {
  background-color: rgb(239 246 255);
}

.bg-green-50:hover {
  background-color: rgb(240 253 244);
}

.bg-purple-50:hover {
  background-color: rgb(250 245 255);
}

.bg-gray-50:hover {
  background-color: rgb(249 250 251);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .grid-cols-1.md\\:grid-cols-2 {
    grid-template-columns: 1fr;
  }
}
</style> 