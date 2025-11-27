<template>

  <!-- <div class="relative text-white py-20 rounded-lg" style="background-image: url('https://doa-academy.sgp1.digitaloceanspaces.com/2024/07/1720579667090.png'); background-size: cover; background-position: center;">
    <div class="absolute inset-0 rounded-lg" style="background-color: rgba(75, 85, 99, 0.7);"></div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
            <h1 class="text-4xl font-extrabold mb-4">หลักสูตรผู้ควบคุมการการขายวัตถุอันตรายทางการเกษตร</h1>
            <p class="text-xl mb-8">รุ่นที่ 3/2567 ระหว่างวันที่ 10 - 24 ก.ค. 67</p>
            <a href="/cms/page/doa-67-register-form" class="inline-block bg-white text-gray-500 font-semibold py-3 px-6 rounded-lg shadow-md hover:bg-gray-100 transition duration-300">
                คลิ๊กเพื่อลงทะเบียน
            </a>
        </div>
    </div>
  </div> -->

  <template v-for="(item, index) in order" :key="item._id">
    
    <!-- Order Information -->
    <div class="bg-white mb-4 border border-gray-200 mt-3">

      <div class="px-4 py-5 sm:px-6 hover:bg-blue-50 cursor-pointer" :class="{ 'bg-blue-50': item.expanded }" @click="toggleExpand(index)">

        <div class="grid sm:grid-cols-2 gap-4">
          <div>
            <span>
              <h2 id="applicant-information-title" class="text-lg font-bold leading-6 text-gray-800 mb-2 sm:mb-0">
              {{index+1}}. #{{ item._id }} <span v-if="item.forms"><font-awesome-icon :icon="item.expanded ? ['fas', 'caret-up'] : ['fas', 'caret-down']" class="text-gray-600 pr-3" /></span></h2>
              <p class="text-gray-600">{{ item.course.name }}</p>
            </span>
          </div>
        
          <div class="flex justify-center sm:justify-end items-center mb-2 sm:mb-0">
            <span class="bg-green-500 text-white p-2 rounded-sm">
              สถานะ: {{ findStatusByCode(item.forms.process, item.posts.status)?.name || 'Not Found' }}<br/>
              <small>{{ findStatusByCode(item.forms.process, item.posts.status)?.description || 'Not Found' }}</small>
            </span>
          </div>
        </div>
      
        <!-- This div centers its children horizontally and aligns them vertically in the center -->
        <div class="w-full flex justify-center items-center mt-4">
          <!-- If you have multiple items to center together, wrap them in this inner div -->
          <div class="bg-gray-500 px-3 py-1 rounded-sm text-white text-sm">
            คลิ๊กเพื่อแสดงข้อมูลการลงทะเบียนของคุณ
            <font-awesome-icon :icon="item.expanded ? ['fas', 'angle-up'] : ['fas', 'angle-down']" class="ml-2" @click="toggleExpand(index)"/>
          </div>
        </div>
        
      </div>
      
        <div class="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 p-2">

          <!-- Card for สอบก่อนเรียน -->
          <div class="flex flex-col border rounded-sm shadow-sm items-center p-6 text-center">
            <div class="text-3xl font-bold mb-2">{{ item.enroll.analytics.pre.score || 0 }}</div>
            <div class="text-base uppercase tracking-wide text-gray-600">คะแนนก่อนเรียน</div>
          </div>

          <!-- Card for สอบหลังเรียน -->
          <div class="flex flex-col border rounded-sm shadow-sm items-center p-6 text-center">

            <template v-if="item.forms.formData['radiobox-23-10-10'].value.value === 'round-1'">

                <!-- <div class="text-blue-600">
                  <p class="text-lg mt-2">ประกาศผลสอบวันที่ 4 ก.ย. 67</p>
                </div> -->


                <template v-if="item.enroll?.analytics?.post?.score < 33">

                  <template v-if="item.enroll?.analytics?.retest?.score">
  
                    <div :class="[item.enroll?.analytics?.retest?.score > 32 ? 'text-green-700' : 'text-red-700']">
                      <div class="text-3xl font-bold mb-2">{{ item.enroll?.analytics?.retest?.score }}</div>
                      <p>{{ item.enroll?.analytics?.retest?.message }} (สอบซ่อม)</p>
                    </div>
  
                  </template>
  
                  <template v-else>
                    <div :class="[item.enroll?.analytics?.post?.score > 32 ? 'text-green-700' : 'text-red-700']">
                      <div class="text-3xl font-bold mb-2">{{ item.enroll?.analytics?.post?.score }}</div>
                      <p>{{ item.enroll?.analytics?.post?.message }}</p>
                    </div>
                  </template>
                  
                </template>
  
                <template v-else>
                  <div :class="[item.enroll?.analytics?.post?.score > 32 ? 'text-green-700' : 'text-red-700']">
                    <div class="text-3xl font-bold mb-2">{{ item.enroll?.analytics?.post?.score }}</div>
                    <p>{{ item.enroll?.analytics?.post?.message }}</p>
                  </div>
                </template> 


            </template>

            <template v-if="item.forms.formData['radiobox-23-10-10'].value.value === 'round-2'">

              <!-- <div class="text-blue-600">
                <p class="text-lg mt-2">สอบวันที่ 6-7 ก.ย. 67</p>
              </div> -->

              <template v-if="item.enroll?.analytics?.post?.score < 33">

                <template v-if="item.enroll?.analytics?.retest?.score">

                  <div :class="[item.enroll?.analytics?.retest?.score > 32 ? 'text-green-700' : 'text-red-700']">
                    <div class="text-3xl font-bold mb-2">{{ item.enroll?.analytics?.retest?.score }}</div>
                    <p>{{ item.enroll?.analytics?.retest?.message }} (สอบซ่อม)</p>
                  </div>

                </template>

                <template v-else>
                  <div :class="[item.enroll?.analytics?.post?.score > 32 ? 'text-green-700' : 'text-red-700']">
                    <div class="text-3xl font-bold mb-2">{{ item.enroll?.analytics?.post?.score }}</div>
                    <p>{{ item.enroll?.analytics?.post?.message }}</p>
                  </div>
                </template>
                
              </template>

              <template v-else>
                <div :class="[item.enroll?.analytics?.post?.score > 32 ? 'text-green-700' : 'text-red-700']">
                  <div class="text-3xl font-bold mb-2">{{ item.enroll?.analytics?.post?.score }}</div>
                  <p>{{ item.enroll?.analytics?.post?.message }}</p>
                </div>
              </template>

            </template>

            <!-- <template v-else>
              <template v-if="item.enroll?.analytics?.post?.score < 33 && item.enroll?.analytics?.retest?.score !== undefined">
                <div :class="[item.enroll?.analytics?.retest?.score > 32 ? 'text-green-700' : 'text-red-700']">
                  <div class="text-3xl font-bold mb-2">{{ item.enroll?.analytics?.retest?.score }}</div>
                  <p>{{ item.enroll?.analytics?.retest?.message }} (สอบซ่อม)</p>
                </div>
              </template>
              <template v-else>
                <div :class="[item.enroll?.analytics?.post?.score > 32 ? 'text-green-700' : 'text-red-700']">
                  <div class="text-3xl font-bold mb-2">{{ item.enroll?.analytics?.post?.score }}</div>
                  <p>{{ item.enroll?.analytics?.post?.message }}</p>
                </div>
              </template>
            </template> -->
          
            <div class="text-base uppercase tracking-wide text-gray-600">คะแนนหลังเรียน</div>
          </div>

          <!-- Card for ความคืบหน้า -->
          <div class="flex flex-col border rounded-sm shadow-sm items-center p-6 text-center">
            <div class="text-3xl font-bold mb-2">{{ item.enroll.analytics.complete }}/{{ item.enroll.analytics.total }} <small class="font-normal text-xs">EP</small></div>
            <div class="text-base uppercase tracking-wide text-gray-600">เรียนไปแล้ว <small class="font-normal text-xs"> ({{ item.enroll.analytics.percent }}%)</small></div>
          </div>

          <!-- Card for รอบสอบ -->
          <div class="flex flex-col border rounded-sm shadow-sm items-center p-6 text-center">
            <div class="text-3xl font-bold mb-2">{{ item.forms.formData['radiobox-23-10-10'].value.label }}</div>
            <div class="text-base uppercase tracking-wide text-gray-600">รอบสอบ วันที่ {{ item.forms.formData['radiobox-23-10-10'].value.description }}</div>
          </div>

          <!-- New row for buttons, responsive across breakpoints -->
          <div v-if="item.forms.process!='draft'" class="col-span-2 sm:col-span-2 md:col-span-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 mt-1">

              <!-- <router-link :to="'/lesson/detail/'+item.course._id" class="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
                <div class="flex items-center"> 
                  <font-awesome-icon :icon="['fas','play-circle']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                  <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                    <div class="flex flex-col text-left">
                      <span class="font-bold">เข้าเรียน</span>
                      <span class="font-normal text-sm">เข้าสู่เนื้อหาการเรียน</span>
                    </div>
                  </div>
                </div>
              </router-link> -->

              <!-- <template v-if="!item.enroll?.analytics?.post || item.enroll.analytics.post.length === 0 || item.enroll?.analytics?.post?.score==='N/a'">

                  <button 
                    v-if="item.enroll.analytics.complete === 13"
                    class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    @click="navigateToLesson"
                    >
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                      <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                        <div class="flex flex-col text-left">
                          <span class="font-bold">สอบวัดผล (พิเศษ)</span>
                          <span class="font-normal text-sm">ทำแบบทดสอบ </span>
                        </div>
                      </div>
                    </div>
                  </button>

              </template>
              <template v-else>
                <template v-if="item.enroll?.analytics?.post?.score < 33 && (!item.enroll?.analytics?.retest || item.enroll.analytics.retest.length === 0 || item.enroll?.analytics?.retest?.score==='N/a')">
                      <button 
                        v-if="item.enroll.analytics.complete === 13"
                        class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        @click="navigateToRetest"
                        >
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                          <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                            <div class="flex flex-col text-left">
                              <span class="font-bold">สอบซ่อม (พิเศษ)</span>
                              <span class="font-normal text-sm">ทำแบบทดสอบ </span>
                            </div>
                          </div>
                        </div>
                      </button>
                </template>
              </template> -->
              
              <template v-if="item.forms.formData['radiobox-23-10-10'].value.value === 'round-1'">

                <template v-if="(item.enroll.analytics.post.score === 0 || item.enroll?.analytics?.post?.score == null || item.enroll?.analytics?.post?.score === 'N/a')">
                    
                  <!-- <button 
                    v-if="item.enroll.analytics.complete === 13"
                    class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    @click="navigateToLesson"
                    >
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                      <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                        <div class="flex flex-col text-left">
                          <span class="font-bold">สอบวัดผลรอบที่ 1</span>
                          <span class="font-normal text-sm">ทำแบบทดสอบ </span>
                        </div>
                      </div>
                    </div>
                  </button> -->

                  <!-- <div class="flex items-center">
                    <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                    <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                      <div class="flex flex-col text-left">
                        <span class="font-bold">ไม่ได้สอบวัดผลรอบที่ 1 </span>
                        <span class="font-normal text-sm">รอสอบรอบ 2 วันที่ 6-7 ก.ย. 67 เวลา 9:00 น. </span>
                      </div>
                    </div>
                  </div> -->

                  <!-- <button 
                    v-if="item.enroll.analytics.complete === 13"
                    class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    @click="navigateToLesson"
                    >
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                      <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                        <div class="flex flex-col text-left">
                          <span class="font-bold">สอบวัดผลรอบที่ 2 (เสริม)</span>
                          <span class="font-normal text-sm">ทำแบบทดสอบ </span>
                        </div>
                      </div>
                    </div>
                  </button> -->

                </template>

                <template v-else>

                  <template v-if="item.enroll?.analytics?.post?.score">
    
                    <!-- <template v-if="(item.enroll?.analytics?.post?.score < 33 || item.enroll?.analytics?.post?.score==='N/a') && item.enroll?.analytics?.retest?.score < 33"> -->
                    
                    <template v-if="(item.enroll?.analytics?.post?.score < 33 || item.enroll?.analytics?.post?.score==='N/a')">

                      <template v-if="item.enroll?.analytics?.retest?.score">

                        <template v-if="(item.enroll?.analytics?.retest?.score < 33)">

                          <div class="flex items-center">
                            <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                            <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                              <div class="flex flex-col text-left">
                                <span class="font-bold">ไม่ผ่านการรับรอง</span>
                                <span class="font-normal text-sm">ลงทะเบียนใหม่ในรุ่นถัดไป </span>
                              </div>
                            </div>
                          </div>

                        </template>

                        <template v-else>

                          <button 
                              class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded"
                              @click="navigateToCertificationn"
                              >
                              <div class="flex items-center">
                                <font-awesome-icon :icon="['fas','download']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                                <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                                  <div class="flex flex-col text-left">
                                    <span class="font-bold">ดาวน์โหลดใบรับรอง</span>
                                    <span class="font-normal text-sm">ผ่านการรับรอง </span>
                                  </div>
                                </div>
                              </div>
                            </button>

                        </template>

                      </template>

                      <template v-else>
                        <!-- <button 
                        v-if="item.enroll.analytics.complete === 13"
                        class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        @click="navigateToRetest"
                        >
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                          <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                            <div class="flex flex-col text-left">
                              <span class="font-bold">สอบซ่อมรอบที่ 1</span>
                              <span class="font-normal text-sm">ทำแบบทดสอบ </span>
                            </div>
                          </div>
                        </div>
                      </button> -->
                      </template>
                      
                      <!-- <template v-if="checkDateDiff(item.course.retestDateRound1, item.course.retestDateEndDateRound1).status === 'not'">
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                          <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                            <div class="flex flex-col text-left">
                              <span class="font-bold">ไม่ผ่านการรับรอง</span>
                              <span class="font-normal text-sm">สอบซ่อม {{ formatThaidate(item.course.retestDateRound1) }} </span>
                            </div>
                          </div>
                        </div>
                      </template>
                      
                      <template v-else-if="checkDateDiff(item.course.retestDateRound1, item.course.retestDateEndDateRound1).status === 'over'">
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                          <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                            <div class="flex flex-col text-left">
                              <span class="font-bold">ไม่ผ่านการรับรอง</span>
                              <span class="font-normal text-sm">ลงทะเบียนใหม่ในรุ่นถัดไป </span>
                            </div>
                          </div>
                        </div>
                      </template>

                      <template v-else-if="checkDateDiff(item.course.retestDateRound1, item.course.retestDateEndDateRound1).status === 'in' && !item.enroll?.analytics?.retest?.score">
                        
                        <button 
                          class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
                          @click="navigateToRetest"
                          >
                          <div class="flex items-center">
                            <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                            <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                              <div class="flex flex-col text-left">
                                <span class="font-bold">สอบซ่อมสำหรับรอบที่ 1</span>
                                <span class="font-normal text-sm">ทำแบบทดสอบ </span>
                              </div>
                            </div>
                          </div>
                        </button>

                      </template>

                      <template v-else-if="checkDateDiff(item.course.retestDateRound1, item.course.retestDateEndDateRound1).status === 'in' && item.enroll?.analytics?.retest?.score">
                        
                        <template v-if="item.enroll?.analytics?.retest?.score<33">
                          <div class="flex items-center">
                            <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                            <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                              <div class="flex flex-col text-left">
                                <span class="font-bold">ไม่ผ่านการรับรอง</span>
                                <span class="font-normal text-sm">ลงทะเบียนใหม่ในรุ่นถัดไป </span>
                              </div>
                            </div>
                          </div>
                          </template>
                          <template v-else>
                            <div :class="[item.enroll?.analytics?.retest?.score > 32 ? 'text-green-700' : 'text-red-700']">
                              <button 
                                class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded"
                                @click="navigateToCertificationn"
                                >
                                <div class="flex items-center">
                                  <font-awesome-icon :icon="['fas','download']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                                  <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                                    <div class="flex flex-col text-left">
                                      <span class="font-bold">ดาวน์โหลดใบรับรอง</span>
                                      <span class="font-normal text-sm">ผ่านการรับรอง </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          </template>

                      </template> -->
                      
                    </template>
      
                    <template v-else-if="item.enroll?.analytics?.post?.score > 32 || item.enroll?.analytics?.retest?.score > 32">
                      <div :class="[item.enroll?.analytics?.post?.score > 32 ? 'text-green-700' : 'text-red-700']">
                        <button 
                          class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded"
                          @click="navigateToCertificationn"
                          >
                          <div class="flex items-center">
                            <font-awesome-icon :icon="['fas','download']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                            <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                              <div class="flex flex-col text-left">
                                <span class="font-bold">ดาวน์โหลดใบรับรอง</span>
                                <span class="font-normal text-sm">ผ่านการรับรอง </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </template>
                </template>

                </template>

              </template>

              

              <template v-else>


                <template v-if="item.enroll?.analytics?.post?.score">
    
                  <!-- <template v-if="(item.enroll?.analytics?.post?.score < 33 || item.enroll?.analytics?.post?.score==='N/a') && item.enroll?.analytics?.retest?.score < 33"> -->
                  
                  <template v-if="(item.enroll?.analytics?.post?.score < 33 || item.enroll?.analytics?.post?.score==='N/a')">

                    <template v-if="item.enroll?.analytics?.retest?.score">

                      <template v-if="(item.enroll?.analytics?.retest?.score < 33)">

                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                          <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                            <div class="flex flex-col text-left">
                              <span class="font-bold">ไม่ผ่านการรับรอง</span>
                              <span class="font-normal text-sm">ลงทะเบียนใหม่ในรุ่นถัดไป </span>
                            </div>
                          </div>
                        </div>

                      </template>

                      <template v-else>

                        <button 
                            class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded"
                            @click="navigateToCertificationn"
                            >
                            <div class="flex items-center">
                              <font-awesome-icon :icon="['fas','download']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                              <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                                <div class="flex flex-col text-left">
                                  <span class="font-bold">ดาวน์โหลดใบรับรอง</span>
                                  <span class="font-normal text-sm">ผ่านการรับรอง </span>
                                </div>
                              </div>
                            </div>
                          </button>

                      </template>

                    </template>

                    <template v-else>

                      <!-- <div class="flex items-center">
                        <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                        <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                          <div class="flex flex-col text-left">
                            <span class="font-bold">ไม่ผ่านการรับรอง</span>
                            <span class="font-normal text-sm">สอบซ่อม {{ formatThaidate(item.course.retestDateRound2) }} </span>
                          </div>
                        </div>
                      </div> -->

                      <!-- <button 
                        v-if="item.enroll.analytics.complete === 13"
                        class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        @click="navigateToRetest"
                        >
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                          <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                            <div class="flex flex-col text-left">
                              <span class="font-bold">สอบซ่อมรอบที่ 2</span>
                              <span class="font-normal text-sm">ทำแบบทดสอบ </span>
                            </div>
                          </div>
                        </div>
                      </button> -->

                    </template>
                    
                    <!-- <template v-if="checkDateDiff(item.course.retestDateRound1, item.course.retestDateEndDateRound1).status === 'not'">
                      <div class="flex items-center">
                        <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                        <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                          <div class="flex flex-col text-left">
                            <span class="font-bold">ไม่ผ่านการรับรอง</span>
                            <span class="font-normal text-sm">สอบซ่อม {{ formatThaidate(item.course.retestDateRound1) }} </span>
                          </div>
                        </div>
                      </div>
                    </template>
                    
                    <template v-else-if="checkDateDiff(item.course.retestDateRound1, item.course.retestDateEndDateRound1).status === 'over'">
                      <div class="flex items-center">
                        <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                        <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                          <div class="flex flex-col text-left">
                            <span class="font-bold">ไม่ผ่านการรับรอง</span>
                            <span class="font-normal text-sm">ลงทะเบียนใหม่ในรุ่นถัดไป </span>
                          </div>
                        </div>
                      </div>
                    </template>

                    <template v-else-if="checkDateDiff(item.course.retestDateRound1, item.course.retestDateEndDateRound1).status === 'in' && !item.enroll?.analytics?.retest?.score">
                      
                      <button 
                        class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
                        @click="navigateToRetest"
                        >
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                          <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                            <div class="flex flex-col text-left">
                              <span class="font-bold">สอบซ่อมสำหรับรอบที่ 1</span>
                              <span class="font-normal text-sm">ทำแบบทดสอบ </span>
                            </div>
                          </div>
                        </div>
                      </button>

                    </template>

                    <template v-else-if="checkDateDiff(item.course.retestDateRound1, item.course.retestDateEndDateRound1).status === 'in' && item.enroll?.analytics?.retest?.score">
                      
                      <template v-if="item.enroll?.analytics?.retest?.score<33">
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                          <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                            <div class="flex flex-col text-left">
                              <span class="font-bold">ไม่ผ่านการรับรอง</span>
                              <span class="font-normal text-sm">ลงทะเบียนใหม่ในรุ่นถัดไป </span>
                            </div>
                          </div>
                        </div>
                        </template>
                        <template v-else>
                          <div :class="[item.enroll?.analytics?.retest?.score > 32 ? 'text-green-700' : 'text-red-700']">
                            <button 
                              class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded"
                              @click="navigateToCertificationn"
                              >
                              <div class="flex items-center">
                                <font-awesome-icon :icon="['fas','download']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                                <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                                  <div class="flex flex-col text-left">
                                    <span class="font-bold">ดาวน์โหลดใบรับรอง</span>
                                    <span class="font-normal text-sm">ผ่านการรับรอง </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          </div>
                        </template>

                    </template> -->
                    
                  </template>
    
                  <template v-else-if="item.enroll?.analytics?.post?.score > 32 || item.enroll?.analytics?.retest?.score > 32">
                    <div :class="[item.enroll?.analytics?.post?.score > 32 ? 'text-green-700' : 'text-red-700']">
                      <button 
                        class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded"
                        @click="navigateToCertificationn"
                        >
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas','download']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                          <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                            <div class="flex flex-col text-left">
                              <span class="font-bold">ดาวน์โหลดใบรับรอง</span>
                              <span class="font-normal text-sm">ผ่านการรับรอง </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    </div>
                  </template>
              </template>

              </template>
              <!-- <template v-if="item.forms.formData['radiobox-23-10-10'].value.value === 'round-1'">

                <template v-if="item.enroll?.analytics?.post?.score">
    
                    <template v-if="(item.enroll?.analytics?.post?.score < 33 || item.enroll?.analytics?.post?.score==='N/a') && item.enroll?.analytics?.retest?.score < 33">
                      
                      <template v-if="checkDateDiff(item.course.retestDateRound1, item.course.retestDateEndDateRound1).status === 'not'">
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                          <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                            <div class="flex flex-col text-left">
                              <span class="font-bold">ไม่ผ่านการรับรอง</span>
                              <span class="font-normal text-sm">สอบซ่อม {{ formatThaidate(item.course.retestDateRound1) }} </span>
                            </div>
                          </div>
                        </div>
                      </template>
                      
                      <template v-else-if="checkDateDiff(item.course.retestDateRound1, item.course.retestDateEndDateRound1).status === 'over'">
                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                          <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                            <div class="flex flex-col text-left">
                              <span class="font-bold">ไม่ผ่านการรับรอง</span>
                              <span class="font-normal text-sm">ลงทะเบียนใหม่ในรุ่นถัดไป </span>
                            </div>
                          </div>
                        </div>
                      </template>

                      <template v-else-if="checkDateDiff(item.course.retestDateRound1, item.course.retestDateEndDateRound1).status === 'in' && !item.enroll?.analytics?.retest?.score">
                        
                        <button 
                          class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
                          @click="navigateToRetest"
                          >
                          <div class="flex items-center">
                            <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                            <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                              <div class="flex flex-col text-left">
                                <span class="font-bold">สอบซ่อมสำหรับรอบที่ 1</span>
                                <span class="font-normal text-sm">ทำแบบทดสอบ </span>
                              </div>
                            </div>
                          </div>
                        </button>

                      </template>

                      <template v-else-if="checkDateDiff(item.course.retestDateRound1, item.course.retestDateEndDateRound1).status === 'in' && item.enroll?.analytics?.retest?.score">
                        
                        <template v-if="item.enroll?.analytics?.retest?.score<33">
                          <div class="flex items-center">
                            <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                            <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                              <div class="flex flex-col text-left">
                                <span class="font-bold">ไม่ผ่านการรับรอง</span>
                                <span class="font-normal text-sm">ลงทะเบียนใหม่ในรุ่นถัดไป </span>
                              </div>
                            </div>
                          </div>
                          </template>
                          <template v-else>
                            <div :class="[item.enroll?.analytics?.retest?.score > 32 ? 'text-green-700' : 'text-red-700']">
                              <button 
                                class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded"
                                @click="navigateToCertificationn"
                                >
                                <div class="flex items-center">
                                  <font-awesome-icon :icon="['fas','download']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                                  <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                                    <div class="flex flex-col text-left">
                                      <span class="font-bold">ดาวน์โหลดใบรับรอง</span>
                                      <span class="font-normal text-sm">ผ่านการรับรอง </span>
                                    </div>
                                  </div>
                                </div>
                              </button>
                            </div>
                          </template>

                      </template>
                      
                    </template>
      
                    <template v-else-if="item.enroll?.analytics?.post?.score > 32 || item.enroll?.analytics?.retest?.score > 32">
                      <div :class="[item.enroll?.analytics?.post?.score > 32 ? 'text-green-700' : 'text-red-700']">
                        <button 
                          class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded"
                          @click="navigateToCertificationn"
                          >
                          <div class="flex items-center">
                            <font-awesome-icon :icon="['fas','download']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                            <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                              <div class="flex flex-col text-left">
                                <span class="font-bold">ดาวน์โหลดใบรับรอง</span>
                                <span class="font-normal text-sm">ผ่านการรับรอง </span>
                              </div>
                            </div>
                          </div>
                        </button>
                      </div>
                    </template>
                </template>

                <template v-else>
                  <div class="flex items-center">
                    <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                    <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                      <div class="flex flex-col text-left">
                        <span class="font-bold">สอบประเมินผลรอบที่ 2</span>
                        <span class="font-normal text-sm">เปิดสอบ {{formatThaidate(this.order[0].course.posttestDate)}} </span>
                      </div>
                    </div>
                  </div>
                </template>

              </template>


              <template v-if="item.forms.formData['radiobox-23-10-10'].value.value === 'round-2'">
                
                <template v-if="item.enroll?.analytics?.post?.score&&item.enroll?.analytics?.post?.score!='N/a'">

                    <template v-if="(item.enroll?.analytics?.post?.score < 33) || item.enroll?.analytics?.retest?.score < 33">

                      <template v-if="checkDateDiff(item.course.certDate).status === 'not'">

                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                          <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                            <div class="flex flex-col text-left">
                              <span class="font-bold">สอบวัดผลแล้ว</span>
                              <span class="font-normal text-sm">ประกาศผลสอบ {{ formatThaidate(item.course.certDate) }} </span>
                            </div>
                          </div>
                        </div>
                        
                      </template>

                      <template v-if="checkDateDiff(item.course.certDate).status === 'over' || checkDateDiff(item.course.certDate).status === 'in'">

                        <template v-if="checkDateDiff(item.course.retestDateRound2, item.course.retestDateEndDateRound2).status === 'not'">
                          <div class="flex items-center">
                            <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                            <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                              <div class="flex flex-col text-left">
                                <span class="font-bold">ไม่ผ่านการรับรอง</span>
                                <span class="font-normal text-sm">สอบซ่อม {{ formatThaidate(item.course.retestDateRound2) }} </span>
                              </div>
                            </div>
                          </div>
                        </template>
    
                        <template v-else-if="checkDateDiff(item.course.retestDateRound2, item.course.retestDateEndDateRound2).status === 'over'">
                          <div class="flex items-center">
                            <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                            <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                              <div class="flex flex-col text-left">
                                <span class="font-bold">ไม่ผ่านการรับรอง</span>
                                <span class="font-normal text-sm">ลงทะเบียนใหม่ในรุ่นถัดไป </span>
                              </div>
                            </div>
                          </div>
                        </template>

                        <template v-else-if="checkDateDiff(item.course.retestDateRound2, item.course.retestDateEndDateRound2).status === 'in' && !item.enroll?.analytics?.retest?.score">
                          
                          <button 
                            class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
                            @click="navigateToRetest"
                            >
                            <div class="flex items-center">
                              <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                              <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                                <div class="flex flex-col text-left">
                                  <span class="font-bold">สอบซ่อมสำหรับรอบที่ 2</span>
                                  <span class="font-normal text-sm">ทำแบบทดสอบ </span>
                                </div>
                              </div>
                            </div>
                          </button>
  
                        </template>
  
                        <template v-else-if="checkDateDiff(item.course.retestDateRound2, item.course.retestDateEndDateRound2).status === 'in' && item.enroll?.analytics?.retest?.score">
                          
                          <template v-if="item.enroll?.analytics?.retest?.score<33">

                            <div class="flex items-center">
                              <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                              <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                                <div class="flex flex-col text-left">
                                  <span class="font-bold">ไม่ผ่านการรับรอง</span>
                                  <span class="font-normal text-sm">ลงทะเบียนใหม่ในรุ่นถัดไป </span>
                                </div>
                              </div>
                            </div>
                            </template>
  
                            <template v-else-if="item.enroll?.analytics?.post?.score > 32 || item.enroll?.analytics?.retest?.score > 32">
                              <div :class="[item.enroll?.analytics?.retest?.score > 32 ? 'text-green-700' : 'text-red-700']">
                                <button 
                                  class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded"
                                  @click="navigateToCertificationn"
                                  >
                                  <div class="flex items-center">
                                    <font-awesome-icon :icon="['fas','download']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                                    <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                                      <div class="flex flex-col text-left">
                                        <span class="font-bold">ดาวน์โหลดใบรับรอง 3</span>
                                        <span class="font-normal text-sm">ผ่านการรับรอง </span>
                                      </div>
                                    </div>
                                  </div>
                                </button>
                              </div>
                            </template>
  
                        </template>

                      </template>

                    </template>

                    <template v-else>

                      <template v-if="checkDateDiff(item.course.certDate).status === 'not'">

                        <div class="flex items-center">
                          <font-awesome-icon :icon="['fas', 'edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                          <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                            <div class="flex flex-col text-left">
                              <span class="font-bold">สอบวัดผลแล้ว</span>
                              <span class="font-normal text-sm">ประกาศผลสอบ {{ formatThaidate(item.course.certDate) }} </span>
                            </div>
                          </div>
                        </div>

                      </template>

                      <template v-if="checkDateDiff(item.course.certDate).status === 'over' || checkDateDiff(item.course.certDate).status === 'in'">

                        <div :class="[item.enroll?.analytics?.post?.score > 32 ? 'text-green-700' : 'text-red-700']">
                          <button 
                            class="w-full bg-green-600 text-white font-bold py-2 px-4 rounded"
                            @click="navigateToCertificationn"
                            >
                            <div class="flex items-center">
                              <font-awesome-icon :icon="['fas','download']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                              <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                                <div class="flex flex-col text-left">
                                  <span class="font-bold">ดาวน์โหลดใบรับรอง 4</span>
                                  <span class="font-normal text-sm">ผ่านการรับรอง </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        </div>

                      </template>

                    </template>
                </template>

                <template v-else>
                  
                  <button 
                    class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
                    @click="navigateToLesson"
                    >
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                      <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                        <div class="flex flex-col text-left">
                          <span class="font-bold">สอบวัดผลรอบที่ 2</span>
                          <span class="font-normal text-sm">เข้าสู่แบบทดสอบ </span>
                        </div>
                      </div>
                    </div>
                  </button>
                  
                </template>

              </template> -->

          </div>
        </div>






          <!-- <template v-if="checkDuedate(order[0].course.posttestDate)===false">

                  <template v-if="(item.enroll.analytics.post.score === 0 || item.enroll.analytics.post.score < 33 || item.enroll?.analytics?.post?.score == null || item.enroll?.analytics?.post?.score === 'N/a')">
                    
                    <button 
                      v-if="item.enroll.analytics.complete === 13"
                      class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
                      @click="navigateToLesson"
                      >
                      <div class="flex items-center">
                        <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                        <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                          <div class="flex flex-col text-left">
                            <span class="font-bold">สอบวัดผลรอบที่ 1</span>
                            <span class="font-normal text-sm">ทำแบบทดสอบ </span>
                          </div>
                        </div>
                      </div>
                    </button>

                  </template>

                  <template v-else>

                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                      <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                        <div class="flex flex-col text-left">
                          <span class="font-bold">ประกาศผลสอบรอบที่ 1</span>
                          <span class="font-normal text-sm">วันที่ {{formatThaidate(this.order[0].course.scoreDate)}} </span>
                        </div>
                      </div>
                    </div>

                  </template>
                </template>

                <template v-else>

                  <div class="flex items-center">
                    <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                    <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                      <div class="flex flex-col text-left">
                        <span class="font-bold">สอบประเมินผลรอบที่ 1</span>
                        <span class="font-normal text-sm">เปิดสอบ {{formatThaidate(this.order[0].course.posttestDate)}} </span>
                      </div>
                    </div>
                  </div>

                </template> -->

                
        <!-- <template v-if="checkDuedate(order[0].course.posttestDate)===false && checkDuedate(order[0].course.posttestEndDate)===true">
                  <template v-if="(item.enroll.analytics.post.score === 0 || item.enroll.analytics.post.score < 33 || item.enroll?.analytics?.post?.score == null || item.enroll?.analytics?.post?.score === 'N/a')">
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                      <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                        <div class="flex flex-col text-left">
                          <span class="font-bold">สอบประเมินผลรอบที่ 1</span>
                          <span class="font-normal text-sm">เปิดสอบ {{formatThaidate(this.order[0].course.posttestDate)}} </span>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                      <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                        <div class="flex flex-col text-left">
                          <span class="font-bold">ประกาศผลสอบรอบที่ 1</span>
                          <span class="font-normal text-sm">วันที่ {{formatThaidate(this.order[0].course.posttestEndDate)}} </span>
                        </div>
                      </div>
                    </div>
                  </template>
                </template>

                <template v-if="checkDuedate(order[0].course.posttestDate)===false && checkDuedate(order[0].course.posttestEndDate)===false">
                  <template v-if="(item.enroll.analytics.post.score === 0 || item.enroll.analytics.post.score < 33 || item.enroll?.analytics?.post?.score == null || item.enroll?.analytics?.post?.score === 'N/a')">
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                      <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                        <div class="flex flex-col text-left">
                          <span class="font-bold">สอบซ่อมรอบที่ 1</span>
                          <span class="font-normal text-sm">เปิดสอบ {{formatThaidate(this.order[0].course.posttestDate)}} </span>
                        </div>
                      </div>
                    </div>
                  </template>
                  <template v-else>
                    <div class="flex items-center">
                      <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                      <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                        <div class="flex flex-col text-left">
                          <span class="font-bold">ประกาศผลสอบรอบที่ 1</span>
                          <span class="font-normal text-sm">วันที่ {{formatThaidate(this.order[0].course.posttestEndDate)}} </span>
                        </div>
                      </div>
                    </div>
                  </template>
                </template>
          
                <template v-else>

                  <div class="flex items-center">
                    <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                    <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                      <div class="flex flex-col text-left">
                        <span class="font-bold">ประกาศผลสอบรอบที่ 1</span>
                        <span class="font-normal text-sm">วันที่ {{formatThaidate(this.order[0].course.posttestEndDate)}} </span>
                      </div>
                    </div>
                  </div>

                </template>

                {{ checkDuedate(order[0].course.posttestDate) }}
                {{ checkDuedate(order[0].course.posttestEndDate) }}
                
              </template> -->

              <!-- <template v-if="checkDuedate(this.order[0].course.posttestDate) && item.forms.formData['radiobox-23-10-10'].value.value==='round-1' && checkDuedate(this.order[0].course.posttestEndDate)">

                <button 
                  v-if="item.enroll.analytics.complete === 13 && item.forms.formData['radiobox-23-10-10'].value.value==='round-1'"
                  class="w-full bg-blue-300 text-white font-bold py-2 px-4 rounded cursor-not-allowed" 
                  disabled>
                  <div class="flex items-center">
                    <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/> 
                    <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                      <div class="flex flex-col text-left">
                        <span class="font-bold">สอบประเมินผลรอบที่ 1</span>
                        <span class="font-normal text-sm">เปิดสอบ {{formatThaidate(this.order[0].course.posttestDate)}} </span>
                      </div>
                    </div>
                  </div>
                </button>
              </template>
              <template v-else>

                <button 
                v-if="item.enroll.analytics.complete === 13 &&
                item.forms.formData['radiobox-23-10-10'].value.value === 'round-1' &&
                (item.enroll.analytics.post.score === 0 || item.enroll.analytics.post.score < 33 || item.enroll?.analytics?.post?.score == null || item.enroll?.analytics?.post?.score === 'N/a')"
                class="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded"
                @click="navigateToLesson"
                >
                <div class="flex items-center">
                  <font-awesome-icon :icon="['fas','edit']" class="text-gray-200 flex-shrink-0 text-3xl"/>
                  <div class="ml-3 pl-3 pr-3 border-l border-white border-opacity-50">
                    <div class="flex flex-col text-left">
                      <span class="font-bold">สอบซ่อมรอบที่ 2</span>
                      <span class="font-normal text-sm">ทำแบบทดสอบ </span>
                    </div>
                  </div>
                </div>
              </button>
              

              </template> -->



        <div class="border-t border-b border-gray-200 px-4 py-5 sm:px-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p><strong>REF1:</strong> {{ item.ref1 }}</p>
            <p><strong>REF2:</strong> {{ item.ref2 }}</p>
            <p><strong>ราคา:</strong> {{ item.price }} บาท</p>
            <p><strong>วันที่ลงทะเบียน:</strong> {{ item.createdAt }}</p>
          </div>
          <div class="text-center sm:text-right" v-if="item.forms.process==='draft'">
            <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="openNewTab(item._id)">
              QR CODE <br/><small>ชำระเงิน</small>
            </button>
          </div>
        </div>

      <!-- Course Information -->
      <template v-if="item.expanded && item.forms">
        <div class="px-4 py-5 sm:px-6">
          <h2 id="course-information-title" class="text-lg font-bold leading-6 text-gray-900">รายละเอียดหลักสูตร</h2>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
          <p><strong>ชื่อหลักสูตร:</strong> {{ item.course.name }}</p>
        </div>

        <div class="px-4 py-5 sm:px-6">
          <h2 id="form-data-title" class="text-lg font-bold leading-6 text-gray-900">รายละเอียดแบบฟอร์ม</h2>
        </div>
        <div class="border-t border-gray-200 px-4 py-5 sm:px-6">
          <div class="overflow-x-auto">

            <h2 class="leading-6 text-gray-900 p-3 mb-3 bg-blue-50 border border-gray-200 rounded-sm"><font-awesome-icon :icon="['fas', 'id-card']" class="" /> ข้อมูลทั่วไป</h2>

            <DynamicFormRender :formData="item" :formID="item.forms._id"/>

          </div>
        </div>
      </template>
    </div>
  </template>

</template>

<script>
import { checkDateStatus } from '@/plugins/duedate.js';
import debug from '@/plugins/Logger.js';
import storageManager from '@/plugins/storage';
import convertUtils from "@/plugins/convertUtils";
import requestClient from '@/plugins/requestClient';
const Request = new requestClient(false);

import DynamicFormRender from '@/utils/DataSetRender/Loader.vue';

export default {
  components: {
    DynamicFormRender
  },
  data() {
    return {
      config: storageManager.get('configs'),
      member: storageManager.get('session','user'),
      session: storageManager.get('session'),
      message: 'Order',
      order:[],
      round:{'round-1':'9-10 เม.ย. 67','round-2':'18-19 เม.ย. 67'}
    };
  },
  methods: {
    checkDateDiff(start,end) {
        return checkDateStatus(start, end);
      },
    navigateToLesson() {
      this.$router.push('/lesson/assessment/668c94ea7fb1dd8057b5f360/65eb076bef03bebf9ead6f1c');
    },
    navigateToRetest() {
      this.$router.push('/lesson/assessment/668c94ea7fb1dd8057b5f360/65eb076bef03bebf9ead6f1c/retest/1');
    },
    navigateToCertificationn() {
      this.$router.push('/lesson/detail/668c94ea7fb1dd8057b5f360/');
    },
    checkDuedate(date) {
      const timeZoneOffset = 7 * 60; // Thailand is GMT+7, in minutes
      // Convert posttestDate to Date object in UTC and adjust for Thailand timezone
      const dueDate = new Date(date);
      const dueDateInThailand = new Date(dueDate.getUTCFullYear(), dueDate.getUTCMonth(), dueDate.getUTCDate(), dueDate.getUTCHours(), dueDate.getUTCMinutes() + timeZoneOffset);
      
      // Now in UTC adjusted for Thailand timezone
      const now = new Date();
      const nowInThailand = new Date(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes() + timeZoneOffset);
      
      return nowInThailand < dueDateInThailand;
    },
    toggleExpand(index) {
      // Toggle the expanded state of the item at the specified index
      this.order[index].expanded = !this.order[index].expanded;
    },
    openNewTab(url) {
      // Open the URL in a new tab
      window.open('/lesson/pay/' + url, '_blank');
    },
    openNewPlayTab(url) {
      // Open the URL in a new tab
      window.open('/lesson/detail/' + url);
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
    findStatusByCode(code,status) {
      return status.find(s => s.code === code) || null;
    },
    createDefaultOrderItem(item) {
      // Define a default analytics structure
      const defaultAnalytics = {
        pre: { score: 0 },
        post: { score: 0 },
        complete: 0,
        total: 0,
        percent: 0
      };

      // Ensure the item has an enroll object, and within it, an analytics object, applying defaults as necessary
      const analytics = item.enroll?.analytics ? {
        ...defaultAnalytics,
        ...item.enroll.analytics,
        pre: { score: item.enroll.analytics.pre?.score ?? 'N/a' },
        post: { score: item.enroll.analytics.post?.score ?? 'N/a', message: item.enroll.analytics.post?.message ?? 'N/a' },
        complete: item.enroll.analytics.complete ?? 'N/a',
        total: item.enroll.analytics.total ?? 'N/a',
        percent: item.enroll.analytics.percent ?? 'N/a'
      } : defaultAnalytics;

      return { ...item, enroll: { ...item.enroll, analytics } };
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
          $unwind: "$forms"
      },
      {
          $lookup: {
              from: "enroll",
              let: {
                  userId: "$forms.userID", // Using userID from forms
                  courseId: "$forms.courseID", // Using courseID from forms
              },
              pipeline: [
                  {
                      $match: {
                          $expr: {
                              $and: [
                                  { $eq: ["$userID", "$$userId"] },
                                  { $eq: ["$courseID", "$$courseId"] },
                              ]
                          }
                      }
                  }
              ],
              as: "enroll"
          }
      },
      {
          $unwind: {
              path: "$enroll",
              preserveNullAndEmptyArrays: true
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
              $unwind: "$forms"
          },
          {
              $set: { formID: "$forms.formID" }
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
              $unwind: "$posts"
          },
          {
          $set: {
              userId: "$userID",
              courseId: "$courseID"
          }
      },
          {
              $sort: { "createdAt": -1 } // Sorting based on "createdAt" field of "posts"
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
          

          // Apply default structure to each order item
          this.order = data.map(item => this.createDefaultOrderItem(item));
          // Assuming you want to assign the entire response to the 'order' key
          this.codeToFind = this.order
          this.activeBlock = false;
          console.log("Order",this.order);
          //this.order[0].course.posttestDate = "2024-06-29T02:00:00.000Z";
          //this.order[0].course.posttestEndDate = "2024-06-24T02:00:00.000Z";

      } catch (error) {
          console.log(error);
      }
  }

  },
  computed: {
    foundStatus() {
      return this.posts.status.find(s => s.code === this.codeToFind) || null;
    }
  },
  mounted () {
    
    this.getData();
    debug.slack("Member:", this.member.firstname + " " + this.member.lastname);
    const pageTitle = this.member.firstname + " " + this.member.lastname + " / Dashboard";
    //debug.slack("pageTitle:", pageTitle);
    this.$setPageTitle(pageTitle);
  },
};
</script>
