<template>
  <div class="spider-chart-container">
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">🕷️ กราฟแมงมุมแสดงผลระดับทักษะ</h3>
        <div class="text-sm text-gray-500">
          ระดับ 1-{{ maxLevel }}
        </div>
      </div>
      
      <!-- Chart Canvas -->
      <div class="relative h-96 flex items-center justify-center">
        <canvas ref="chartCanvas" class="max-w-full max-h-full"></canvas>
      </div>
      
      <!-- Legend -->
      <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div v-for="skill in skillData" :key="skill.name"
             class="flex items-center p-3 border rounded-lg"
             :style="{ borderColor: skill.color }">
          <div class="w-4 h-4 rounded-full mr-3"
               :style="{ backgroundColor: skill.color }"></div>
          <div class="flex-1">
            <div class="font-medium text-gray-900 text-sm">{{ skill.name }}</div>
            <div class="text-xs text-gray-500">
              ระดับ {{ skill.level }}/{{ maxLevel }} ({{ skill.percentage.toFixed(1) }}%)
            </div>
          </div>
        </div>
      </div>
      
      <!-- Summary -->
      <div class="mt-4 p-4 bg-gray-50 rounded-lg">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm font-medium text-gray-700">คะแนนเฉลี่ยรวม</div>
            <div class="text-2xl font-bold" 
                 :class="overallScore >= passPercentage ? 'text-green-600' : 'text-red-600'">
              {{ overallScore.toFixed(1) }}%
            </div>
          </div>
          <div class="text-right">
            <div class="text-sm font-medium" 
                 :class="overallScore >= passPercentage ? 'text-green-600' : 'text-red-600'">
              {{ overallScore >= passPercentage ? '✅ ผ่านเกณฑ์' : '❌ ไม่ผ่านเกณฑ์' }}
            </div>
            <div class="text-xs text-gray-500">เกณฑ์ผ่าน {{ passPercentage }}%</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { markRaw, toRaw } from 'vue';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  RadarController
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  RadarController
);

export default {
  name: 'SpiderChart',
  props: {
    skillData: {
      type: Array,
      required: true,
      default: () => []
      // Format: [{ name, level, percentage, color }]
    },
    maxLevel: {
      type: Number,
      default: 10
    },
    overallScore: {
      type: Number,
      default: 0
    },
    passPercentage: {
      type: Number,
      default: 60
    }
  },
  data() {
    return {
      chart: null
    }
  },
  mounted() {
    this.createChart();
  },
  beforeUnmount() {
    if (this.chart) {
      this.chart.destroy();
    }
  },
  watch: {
    skillData: {
      handler() {
        if (this.chart) {
          this.updateChart();
        } else {
          this.$nextTick(() => {
            this.createChart();
          });
        }
      },
      deep: true
    }
  },
  methods: {
    createChart() {
      if (!this.$refs.chartCanvas) return;
      
      const ctx = this.$refs.chartCanvas.getContext('2d');
      
      // ใช้ toRaw เพื่อป้องกัน reactivity issues
      const skillData = toRaw(this.skillData);
      
      const chartData = {
        labels: skillData.map(skill => skill.name),
        datasets: [{
          label: 'ระดับทักษะ',
          data: skillData.map(skill => skill.level),
          borderColor: 'rgba(59, 130, 246, 0.8)',
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderWidth: 3,
          pointBackgroundColor: skillData.map(skill => skill.color),
          pointBorderColor: skillData.map(skill => skill.color),
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true
        }]
      };

      const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const skillIndex = context.dataIndex;
                const skill = skillData[skillIndex];
                return [
                  `${skill.name}: ระดับ ${skill.level}/${this.maxLevel}`,
                  `คะแนน: ${skill.percentage.toFixed(1)}%`
                ];
              }
            }
          }
        },
        scales: {
          r: {
            min: 0,
            max: this.maxLevel,
            stepSize: 1,
            ticks: {
              display: true,
              font: {
                size: 12
              },
              color: '#6B7280'
            },
            grid: {
              color: 'rgba(156, 163, 175, 0.3)'
            },
            angleLines: {
              color: 'rgba(156, 163, 175, 0.3)'
            },
            pointLabels: {
              font: {
                size: 14,
                weight: 'bold'
              },
              color: '#374151',
              callback: (label, index) => {
                const skill = skillData[index];
                return skill ? `${label}\n(${skill.level}/${this.maxLevel})` : label;
              }
            }
          }
        },
        elements: {
          line: {
            tension: 0.2
          }
        }
      };

      // ใช้ markRaw เพื่อป้องกัน chart จากการเป็น reactive
      this.chart = markRaw(new ChartJS(ctx, {
        type: 'radar',
        data: chartData,
        options: options
      }));
    },
    
    updateChart() {
      if (!this.chart) return;
      
      const skillData = toRaw(this.skillData);
      
      this.chart.data.labels = skillData.map(skill => skill.name);
      this.chart.data.datasets[0].data = skillData.map(skill => skill.level);
      this.chart.data.datasets[0].pointBackgroundColor = skillData.map(skill => skill.color);
      this.chart.data.datasets[0].pointBorderColor = skillData.map(skill => skill.color);
      
      this.chart.options.scales.r.pointLabels.callback = (label, index) => {
        const skill = skillData[index];
        return skill ? `${label}\n(${skill.level}/${this.maxLevel})` : label;
      };
      
      this.chart.update('active');
    }
  }
}
</script>

<style scoped>
.spider-chart-container {
  width: 100%;
}

/* การปรับแต่ง responsive */
@media (max-width: 768px) {
  .spider-chart-container .relative {
    height: 300px;
  }
}

/* Animation สำหรับ chart */
.spider-chart-container canvas {
  transition: all 0.3s ease-in-out;
}
</style> 