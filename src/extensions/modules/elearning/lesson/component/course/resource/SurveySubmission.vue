<template>
  <!-- <pre>{{surveySubmission}}</pre> -->
  <!-- <pre>{{getUniqueGroups()}}</pre> -->
    <div class="p-4 relative">
        <h2 id="notes-title" class="text-lg font-normal text-gray-900">
            <span class="bg-red-600 text-white text-sm px-2 rounded-sm">{{ surveySubmission.length }}</span> รายชื่อผู้ที่กรอกข้อมูล 
        </h2>
        <span class="absolute top-1 right-0">
            <button
              @click="exportToCSV"
              type="button"
              class="ml-3 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
            <font-awesome-icon :icon="['fas', 'download']" class="text-gray-200 pr-3" /> Export CSV
          </button>
        </span>
    </div>
    <div class="w-full overflow-auto relative">
      <table class="table-striped border-collapse border border-slate-300 min-w-max">
        <thead>
          <tr>
            <th class="border border-slate-300 p-2" rowspan="2">ลำดับ</th>
            <th class="border border-slate-300 p-2" rowspan="2">รายชื่อ</th>
            <th class="border border-slate-300 font-bold p-2"
                v-for="(group, groupIndex) in getUniqueGroups()"
                :key="groupIndex"
                :colspan="group.type === 'score' ? group.count : 1"
                :rowspan="group.type === 'custom' ? group.count : 1">
              {{ group.text }}
            </th>
          </tr>
          <tr>
            <template v-for="(choice, choiceIndex) in getUniqueChoices()" :key="choiceIndex">
              <th class="border border-slate-300 font-normal p-2"
                  v-if="choice.type !== 'custom'"
                  :colspan="1">
                {{ choice.text }}
              </th>
            </template>
          </tr>
        </thead>
        <tbody>
          <tr class="border border-slate-300" v-for="(submission, index) in surveySubmission" :key="index">
            <td class="border border-slate-300 text-center p-1">{{ index + 1 }}</td>
            <td class="border border-slate-300 text-left p-1">{{submission._id}} {{ submission.user.firstname + ' ' + submission.user.lastname }}</td>
            <template v-for="(group, groupIndex) in submission.survey.choiceGroups" :key="groupIndex">
              <template v-if="group.groupType === 'custom'">
                <td class="border border-slate-300 text-center p-1" :colspan="1">
                  {{ group.selectedChoice || '-' }}
                </td>
              </template>
              <template v-if="group.groupType === 'score'">
                <template v-for="(choice, choiceIndex) in group.choices" :key="choiceIndex">
                  <td class="border border-slate-300 text-center p-1">
                    {{ choice.choiceValue || '-' }}
                  </td>
                </template>
              </template>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      surveySubmission: Array,
    },
    
    methods: {
      escapeCSV(text) {
        if (text === null || text === undefined) return '-';
        let string = text.toString();
        string = string.replace(/"/g, '""');
        return `"${string}"`;
      },
      exportToCSV() {
        const data = [];
        const headerRow = ['ลำดับ', 'รายชื่อ'];
        this.surveySubmission[0].survey.choiceGroups.forEach((group) => {
          if (group.groupType === 'custom') {
            headerRow.push(group.groupName); // For custom groups, just the group name
          } else {
            group.choices.forEach((choice) => {
              headerRow.push(choice.choiceText); // For score groups, list all choices
            });
          }
        });
        data.push(headerRow.join(','));

        this.surveySubmission.forEach((submission, index) => {
          const row = [
            this.escapeCSV(index + 1),
            this.escapeCSV(`${submission.user.firstname} ${submission.user.lastname}`)
          ];
          submission.survey.choiceGroups.forEach((group) => {
            if (group.groupType === 'custom') {
              row.push(this.escapeCSV(group.selectedChoice));
            } else {
              group.choices.forEach((choice) => {
                row.push(this.escapeCSV(choice.choiceValue));
              });
            }
          });
          data.push(row.join(','));
        });

        const csvContent = data.join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `survey_submission_${new Date().toISOString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
        getUniqueGroups() {
          const uniqueGroups = new Map();
          this.surveySubmission[0]?.survey?.choiceGroups?.forEach((group) => {
              if (uniqueGroups.has(group.groupName)) {
                  const current = uniqueGroups.get(group.groupName);
                  const updatedCount = current.count + group.choices.length;
                  uniqueGroups.set(group.groupName, {
                      text: group.groupName,
                      type: group.type,
                      count: updatedCount < 2 ? 2 : updatedCount // Ensure count is at least 2
                  });
              } else {
                  uniqueGroups.set(group.groupName, {
                      text: group.groupName,
                      type: group.groupType,
                      count: group.choices.length < 2 ? 2 : group.choices.length
                  });
              }
          });
          return Array.from(uniqueGroups.values());
        },
        getGroupColumnSpan(group) {
            return this.surveySubmission[0]?.survey?.choiceGroups.reduce((count, groupItem) => {
                return count + (groupItem.groupName === group ? groupItem.choices.length : 0);
            }, 0) || 0;
        },
        getUniqueChoices() {
          const uniqueChoices = new Map();
          this.surveySubmission[0]?.survey?.choiceGroups.forEach((group) => {
              group.choices.forEach((choice) => {
                  const uniqueKey = `${group.groupName}:${group.groupType}:${choice.choiceText}`;
                  uniqueChoices.set(uniqueKey, {
                    groupName: group.groupName,
                    type: group.groupType,
                    text: choice.choiceText,
                    count: group.choices.length
                  });
              });
          });
          return Array.from(uniqueChoices.values()).reduce((acc, item) => {
            if (item.type === "custom") {
              const existing = acc.find(entry => entry.groupName === item.groupName && entry.type === "custom");
              if (!existing) {
                acc.push(item); // Add it if not already present
              }
            } else {
              acc.push(item);
            }
            return acc;
          }, []);
        },
        getChoices(submission, groupIndex) {
          const group = Array.from(this.getUniqueGroups())[groupIndex];
          const choices = [];
          submission.survey?.choiceGroups.forEach((groupItem) => {
          if (groupItem.groupName === group) {
              groupItem.choices.forEach((choice) => {
                  choices.push(choice);
              });
          }
          });
          return choices;
        },
    },
  };
  </script>
  <style scoped>
  .overflow-auto {
    overflow-x: scroll; /* This ensures the horizontal scrollbar is always shown */
}

.table-striped tbody tr:nth-child(odd) {
  background-color: rgba(255, 255, 255, var(--tw-bg-opacity)); /* This is the Tailwind gray-200 color */
}

.table-striped tbody tr:nth-child(even) {
  background-color: rgba(243, 244, 246, var(--tw-bg-opacity)); /* This is the Tailwind gray-100 color */
}

</style>