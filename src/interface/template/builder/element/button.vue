<!-- eslint-disable vue/no-mutating-props -->
<template>
  <div>
    <!-- Preview Mode -->
    <template v-if="mode === 'preview'">
      <form class="p-2 border rounded-md shadow-sm">
        <div class="mb-2">
          <label class="block popup-label font-semibold mb-1">{{ localItem.label || 'Button' }}<span v-if="localItem.name" class="text-xs text-gray-500 ml-1">({{ localItem.name }})</span></label>
          <button
            :class="['px-3 py-1.5 text-xs font-medium rounded', buttonStyleClass]"
            :style="{ fontSize: localItem.textSize || 'text-sm' }"
            type="button"
          >
            {{ localItem.label || 'Preview' }}
          </button>
        </div>
        <div v-if="localItem.flows && localItem.flows.length > 0" class="text-xs text-blue-600 mt-2">
          <font-awesome-icon :icon="['fas', 'code-fork']" class="mr-1" />
          Contains {{ localItem.flows.length }} Flow Step(s)
        </div>
      </form>
    </template>

    <!-- Edit Mode -->
    <template v-else-if="mode === 'edit'">
      <div class="content-editor overflow-auto bg-white rounded-lg h-full">
        <!-- Section Header -->
        <div class="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <font-awesome-icon :icon="['fas', 'mouse-pointer']" class="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900">Button Configuration</h3>
              <p class="text-sm text-gray-500">ตั้งค่าการแสดงผลของปุ่ม</p>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 space-y-6">
          <!-- Tabs -->
          <div class="tabs border-b border-gray-200 flex sticky top-0 bg-white z-10">
            <button
              :class="{
                'border-b-2 border-blue-500 font-bold text-blue-600': activeFlowTab === 'button',
                'text-gray-500 hover:text-gray-700': activeFlowTab !== 'button',
              }"
              class="px-4 py-2 focus:outline-none"
              @click="activeFlowTab = 'button'"
            >
              Button Config
            </button>
            <button
              :class="{
                'border-b-2 border-blue-500 font-bold text-blue-600': activeFlowTab === 'flow',
                'text-gray-500 hover:text-gray-700': activeFlowTab !== 'flow',
              }"
              class="px-4 py-2 focus:outline-none"
              @click="activeFlowTab = 'flow'"
            >
              Flow Config
            </button>
            <button
              :class="{
                'border-b-2 border-blue-500 font-bold text-blue-600': activeFlowTab === 'mapping',
                'text-gray-500 hover:text-gray-700': activeFlowTab !== 'mapping',
              }"
              class="px-4 py-2 focus:outline-none"
              @click="activeFlowTab = 'mapping'"
            >
              Data Mapping
            </button>
          </div>
          <!-- Tab Content -->
          <div v-show="activeFlowTab === 'button'" class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div class="section-group">
                <label class="block popup-label font-semibold">Name (Identifier):</label>
                <input v-model="localItem.name" type="text" class="popup-input w-full rounded-md border border-gray-300" placeholder="e.g., submit_form_button"/>
                <p class="text-xs text-gray-500 mt-1">Used internally and for data mapping. Not visible to users.</p>
              </div>
              <div class="section-group">
                <label class="block popup-label font-semibold">Label (Visible Text):</label>
                <input v-model="localItem.label" type="text" class="popup-input w-full rounded-md border border-gray-300" placeholder="e.g., Click Me"/>
              </div>
              <div class="section-group">
                <label class="block popup-label font-semibold">Button Style:</label>
                <select v-model="localItem.style" class="popup-select w-full rounded-md border border-gray-300">
                  <option value="primary">Primary (Blue)</option>
                  <option value="secondary">Secondary (Gray)</option>
                  <option value="success">Success (Green)</option>
                  <option value="danger">Danger (Red)</option>
                  <option value="warning">Warning (Yellow)</option>
                  <option value="info">Info (Light Blue)</option>
                  <option value="light">Light (White/Gray)</option>
                  <option value="dark">Dark (Black/Dark Gray)</option>
                  <option value="link">Link Style</option>
                </select>
              </div>
              <div class="section-group">
                <label class="block popup-label font-semibold">Button Text Size:</label>
                <select v-model="localItem.textSize" class="popup-select w-full rounded-md border border-gray-300">
                  <option value="text-xs">Extra Small</option>
                  <option value="text-sm">Small</option>
                  <option value="text-base">Base (Default)</option>
                  <option value="text-lg">Large</option>
                  <option value="text-xl">Extra Large</option>
                </select>
              </div>
            </div>
          </div>
          <div v-show="activeFlowTab === 'flow'" class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-4">
            <!-- Flow steps config (เหมือนเดิม) -->
            <slot name="flow-config">
              <div class="section-group border-b border-gray-200 pb-3 mb-3">
                <span class="block font-bold text-md">Flow Configuration</span>
                <span class="text-gray-500 text-sm">Define actions that happen when the button is clicked.</span>
              </div>
              <div class="section-group grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 items-end">
                <div>
                  <label class="popup-label font-semibold">Add New Step:</label>
                  <select v-model="newStep.type" class="popup-select w-full rounded-md border border-gray-300 mt-1">
                    <option disabled value="">Select a Step Type</option>
                    <option value="database">Save Data to DB</option>
                    <option value="alert">Show Alert</option>
                    <option value="modal">Show Modal</option>
                    <option value="email">Send Email</option>
                    <option value="redirect">Redirect Page</option>
                    <option value="delay">Add Delay</option>
                    <option value="trigger">Trigger Element Action</option>
                    <option value="webhook">Call Webhook</option>
                    <option value="script">Run Custom Script</option>
                  </select>
                </div>
                <div class="md:col-span-2 flex items-end">
                  <button @click="addFlowStep" class="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none w-full md:w-auto" :disabled="!newStep.type">
                    <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" /> Add Step
                  </button>
                </div>
              </div>
              <div class="section-group mt-5">
                <span class="block popup-label font-semibold mb-2">Defined Flow Steps:</span>
                <ul v-if="localItem.flows && localItem.flows.length > 0" class="flow-steps list-none p-0 text-sm space-y-3">
                  <li v-for="(step, index) in localItem.flows" :key="step.id || index" class="border border-gray-200 rounded-md p-3 bg-gray-50">
                    <div class="flex items-center justify-between w-full mb-2">
                      <span class="font-medium text-gray-700">{{ index + 1 }}. {{ getHumanFriendlyStepType(step.type) }}</span>
                      <div class="flex items-center space-x-1.5">
                        <button @click="toggleFlowStepEdit(index)" class="p-1.5 text-xs bg-gray-200 hover:bg-gray-300 rounded-md focus:outline-none" :title="step.isEditing ? 'Collapse' : 'Edit'">
                          <font-awesome-icon :icon="['fas', step.isEditing ? 'chevron-up' : 'pencil-alt']" />
                        </button>
                        <button @click="duplicateFlowStep(index)" class="p-1.5 text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 rounded-md focus:outline-none" title="Duplicate">
                          <font-awesome-icon :icon="['fas', 'clone']" />
                        </button>
                        <button @click="moveFlowStep(index, -1)" :disabled="index === 0" class="p-1.5 text-xs bg-gray-200 hover:bg-gray-300 rounded-md focus:outline-none disabled:opacity-50" title="Move Up">
                          <font-awesome-icon :icon="['fas', 'arrow-up']" />
                        </button>
                        <button @click="moveFlowStep(index, 1)" :disabled="index === localItem.flows.length - 1" class="p-1.5 text-xs bg-gray-200 hover:bg-gray-300 rounded-md focus:outline-none disabled:opacity-50" title="Move Down">
                          <font-awesome-icon :icon="['fas', 'arrow-down']" />
                        </button>
                        <button @click="removeFlowStep(index)" class="p-1.5 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-md focus:outline-none" title="Remove">
                          <font-awesome-icon :icon="['fas', 'trash']" />
                        </button>
                      </div>
                    </div>
                    <div v-if="step.isEditing" class="mt-3 bg-white p-3 rounded-md border border-gray-200 text-sm space-y-3">
                      <!-- Common field: Step Name/Description -->
                      <div>
                        <label class="block popup-label text-xs font-medium text-gray-600">Step Name/Description (Optional):</label>
                        <input v-model="step.options.stepName" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="Briefly describe this step"/>
                      </div>
                      
                      <div v-if="step.type === 'delay'">
                        <label class="block popup-label text-xs font-medium text-gray-600">Delay Duration (seconds):</label>
                        <input v-model.number="step.options.duration" type="number" class="popup-input w-full text-xs mt-0.5" placeholder="e.g., 5" min="0"/>
                      </div>

                      <div v-if="step.type === 'database'">
                        <label class="block popup-label text-xs font-medium text-gray-600">Database Collection:</label>
                        <input v-model="step.options.collection" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="Enter target collection name"/>
                         <p class="text-xs text-gray-500 mt-0.5">Data from mappings will be saved here.</p>
                      </div>

                      <div v-if="step.type === 'alert'">
                        <label class="block popup-label text-xs font-medium text-gray-600">Alert Text:</label>
                        <textarea v-model="step.options.text" class="popup-input w-full text-xs mt-0.5" placeholder="Enter text to display in alert" rows="2"></textarea>
                        <p class="text-xs text-gray-500 mt-0.5">You can use mapped keywords like {{keyword}}.</p>
                      </div>

                      <div v-if="step.type === 'modal'">
                        <label class="block popup-label text-xs font-medium text-gray-600">Modal Title:</label>
                        <input v-model="step.options.title" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="Enter modal title"/>
                        <label class="block popup-label text-xs font-medium text-gray-600 mt-2">Modal Message:</label>
                        <textarea v-model="step.options.message" class="popup-input w-full text-xs mt-0.5" placeholder="Enter modal message" rows="3"></textarea>
                        <p class="text-xs text-gray-500 mt-0.5">Use mapped keywords: {{keyword}}.</p>
                      </div>

                      <div v-if="step.type === 'email'">
                        <label class="block popup-label text-xs font-medium text-gray-600">Recipient Email Address(es):</label>
                        <input v-model="step.options.to" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="email@example.com, another@example.com"/>
                         <label class="block popup-label text-xs font-medium text-gray-600 mt-2">Subject:</label>
                        <input v-model="step.options.subject" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="Email Subject"/>
                        <label class="block popup-label text-xs font-medium text-gray-600 mt-2">Email Body (HTML supported):</label>
                        <textarea v-model="step.options.body" class="popup-input w-full text-xs mt-0.5" placeholder="Enter email body. Use {{keyword}} for mapped values." rows="4"></textarea>
                         <label class="block popup-label text-xs font-medium text-gray-600 mt-2">Sender Name (Optional):</label>
                        <input v-model="step.options.senderName" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="Your Site Name"/>
                        <label class="block popup-label text-xs font-medium text-gray-600 mt-2">Sender Email (Optional):</label>
                        <input v-model="step.options.senderEmail" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="noreply@yourdomain.com"/>
                      </div>

                      <div v-if="step.type === 'redirect'">
                        <label class="block popup-label text-xs font-medium text-gray-600">Redirect URL:</label>
                        <input v-model="step.options.url" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="https://example.com or /page-slug"/>
                        <p class="text-xs text-gray-500 mt-0.5">Can use mapped keywords: {{keyword}}.</p>
                      </div>

                      <div v-if="step.type === 'trigger'">
                        <label class="block popup-label text-xs font-medium text-gray-600">Target Element Selector:</label>
                        <input v-model="step.options.element" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="e.g., #myElement, .my-class"/>
                         <label class="block popup-label text-xs font-medium text-gray-600 mt-2">Action:</label>
                        <select v-model="step.options.action" class="popup-select w-full text-xs mt-0.5">
                            <option value="addClass">Add CSS Class</option>
                            <option value="removeClass">Remove CSS Class</option>
                            <option value="toggleClass">Toggle CSS Class</option>
                            <option value="show">Show Element (display: block)</option>
                            <option value="hide">Hide Element (display: none)</option>
                            <option value="toggle">Toggle Element Visibility</option>
                        </select>
                        <div v-if="step.options.action === 'addClass' || step.options.action === 'removeClass' || step.options.action === 'toggleClass'">
                          <label class="block popup-label text-xs font-medium text-gray-600 mt-2">CSS Class Name:</label>
                          <input v-model="step.options.cssClass" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="e.g., is-active, hidden"/>
                        </div>
                      </div>
                      <div v-if="step.type === 'webhook'">
                          <label class="block popup-label text-xs font-medium text-gray-600">Webhook URL:</label>
                          <input v-model="step.options.url" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="https://api.example.com/hook"/>
                          <label class="block popup-label text-xs font-medium text-gray-600 mt-2">HTTP Method:</label>
                          <select v-model="step.options.method" class="popup-select w-full text-xs mt-0.5">
                              <option value="POST">POST</option>
                              <option value="GET">GET</option>
                              <option value="PUT">PUT</option>
                              <option value="DELETE">DELETE</option>
                          </select>
                          <label class="block popup-label text-xs font-medium text-gray-600 mt-2">Payload (JSON, uses mapped data):</label>
                          <textarea v-model="step.options.payload" class="popup-input w-full text-xs mt-0.5 font-mono" placeholder='{
  "value1": "{{mapped_keyword1}}",
  "value2": "Static Text",
  "user_id": "{{user.id}}"
}' rows="4"></textarea>
                           <p class="text-xs text-gray-500 mt-0.5">Data from mappings will be sent. Use {{keyword}}.</p>
                      </div>
                       <div v-if="step.type === 'script'">
                          <label class="block popup-label text-xs font-medium text-gray-600">Custom JavaScript (Use with caution):</label>
                          <textarea v-model="step.options.scriptContent" class="popup-input w-full text-xs mt-0.5 font-mono" placeholder="// Access mapped data via data.keyword
// Example: console.log(data.email_address);
alert('Hello ' + (data.user_name || 'Guest'));" rows="5"></textarea>
                          <p class="text-xs text-red-500 mt-0.5">Warning: Incorrect scripts can break functionality. Mapped data is available in a 'data' object (e.g., data.your_keyword).</p>
                      </div>

                    </div>
                  </li>
                </ul>
                <div v-else class="text-center text-gray-500 py-4">
                  No flow steps defined yet. Add a step above to get started.
                </div>
              </div>
            </slot>
          </div>
          <div v-show="activeFlowTab === 'mapping'" class="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mt-4">
            <slot name="mapping-config">
              <div class="section-group border-b border-gray-200 pb-3 mb-3">
                <span class="block font-bold text-md">Data Mapping</span>
                <span class="text-gray-500 text-sm">Map form fields or other data to keywords for use in Flow steps.</span>
              </div>
              <div class="section-group grid grid-cols-1 md:grid-cols-3 gap-4 mt-3 items-end">
                <div>
                  <label class="popup-label font-semibold">Keyword:</label>
                  <input v-model="newMapping.keyword" @input="sanitizeKeyword" type="text" class="popup-input w-full rounded-md border border-gray-300 mt-1" placeholder="e.g., user_email"/>
                  <p class="text-xs text-gray-500 mt-0.5">Alphanumeric and underscores only.</p>
                </div>
                <div>
                  <label class="popup-label font-semibold">Value Source:</label>
                  <!-- This select should be populated with available form fields, user data, etc. -->
                  <!-- For now, a placeholder or a simpler input -->
                  <select v-model="newMapping.source" class="popup-select w-full rounded-md border border-gray-300 mt-1">
                      <option value="" disabled>Select Source</option>
                      <option value="form_input">Form Input by Name</option>
                      <option value="fixed_value">Fixed Text/Value</option>
                      <option value="user_data">User Data (e.g., user.id, user.email)</option>
                      <option value="url_param">URL Parameter</option>
                      <!-- Add more sources as needed -->
                  </select>
                </div>
                <div class="md:col-span-1 flex items-end">
                   <button @click="addMapping" class="py-2 px-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none w-full md:w-auto" :disabled="!newMapping.keyword || !newMapping.source">
                     <font-awesome-icon :icon="['fas', 'plus']" class="mr-1.5" /> Add Mapping
                  </button>
                </div>
              </div>
              
              <!-- Conditional inputs based on selected source -->
              <div v-if="newMapping.source === 'form_input'" class="mt-2">
                  <label class="popup-label text-xs font-medium text-gray-600">Form Input Name:</label>
                  <input v-model="newMapping.sourceIdentifier" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="Enter the 'name' attribute of the form input"/>
              </div>
              <div v-if="newMapping.source === 'fixed_value'" class="mt-2">
                  <label class="popup-label text-xs font-medium text-gray-600">Fixed Value:</label>
                  <input v-model="newMapping.sourceIdentifier" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="Enter the static value"/>
              </div>
              <div v-if="newMapping.source === 'user_data'" class="mt-2">
                  <label class="popup-label text-xs font-medium text-gray-600">User Data Key:</label>
                  <input v-model="newMapping.sourceIdentifier" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="e.g., id, email, name.first"/>
                   <p class="text-xs text-gray-500 mt-0.5">Example: user.id, user.custom_field. See documentation for available keys.</p>
              </div>
              <div v-if="newMapping.source === 'url_param'" class="mt-2">
                  <label class="popup-label text-xs font-medium text-gray-600">URL Parameter Name:</label>
                  <input v-model="newMapping.sourceIdentifier" type="text" class="popup-input w-full text-xs mt-0.5" placeholder="e.g., ref_id from ?ref_id=123"/>
              </div>


              <div class="section-group mt-5">
                <span class="block popup-label font-semibold mb-2">Defined Mappings:</span>
                <ul v-if="localItem.mappings && localItem.mappings.length > 0" class="mapping-list list-none p-0 text-sm space-y-2">
                  <li v-for="(mapping, index) in localItem.mappings" :key="mapping.keyword" class="border border-gray-200 rounded-md p-3 bg-gray-50 flex justify-between items-center">
                    <div>
                      <span class="font-medium text-gray-800">{{ mapping.keyword }}</span>
                      <span class="text-gray-600 text-xs ml-2"> &larr; {{ getHumanFriendlyMappingSource(mapping.source, mapping.sourceIdentifier) }}</span>
                    </div>
                    <button @click="removeMapping(index)" class="p-1.5 text-xs bg-red-100 text-red-600 hover:bg-red-200 rounded-md focus:outline-none" title="Remove Mapping">
                      <font-awesome-icon :icon="['fas', 'trash']" />
                    </button>
                  </li>
                </ul>
                <div v-else class="text-center text-gray-500 py-4">
                  No data mappings defined yet. Add a mapping to use dynamic data in your flows.
                </div>
              </div>
            </slot>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
//fas
import { faMousePointer, faCodeFork, faPlus, faPencilAlt, faChevronUp, faArrowUp, faArrowDown, faClone, faTrash } from '@fortawesome/free-solid-svg-icons';
import { library } from '@fortawesome/fontawesome-svg-core';
library.add(faMousePointer, faCodeFork, faPlus, faPencilAlt, faChevronUp, faArrowUp, faArrowDown, faClone, faTrash);

function generateUid(prefix = 'step_') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
}

export default {
  name: 'ButtonElement',
  components: {
    FontAwesomeIcon,
  },
  props: {
    item: {
      type: Object,
      required: true,
    },
    mode: {
      type: String,
      required: true,
      validator: (value) => ['edit', 'preview'].includes(value),
    },
    // Possible prop for providing available form fields or other context for mapping
    // mappingContext: {
    //   type: Array,
    //   default: () => [] // e.g., [{name: 'email_input', label: 'Email Field'}]
    // },
  },
  emits: ['update-item'],
  data() {
    return {
      localItem: {},
      activeFlowTab: 'button', // Default to button config tab
      newStep: {
        type: '',
        options: {},
      },
      newMapping: {
        keyword: '',
        source: '',
        sourceIdentifier: ''
      },
      // selectedOption: '', // Could be used if mapping source is a dynamic select later
    };
  },
  computed: {
    buttonStyleClass() {
      const style = this.localItem.style || 'primary';
      const styles = {
        primary: 'bg-blue-500 hover:bg-blue-600 text-white',
        secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
        success: 'bg-green-500 hover:bg-green-600 text-white',
        danger: 'bg-red-500 hover:bg-red-600 text-white',
        warning: 'bg-yellow-400 hover:bg-yellow-500 text-gray-800',
        info: 'bg-sky-500 hover:bg-sky-600 text-white',
        light: 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300',
        dark: 'bg-gray-800 hover:bg-gray-900 text-white',
        link: 'text-blue-600 hover:text-blue-700 hover:underline focus:outline-none',
      };
      return styles[style] || styles.primary;
    },
    stepTypeOptions() { // For select, if needed later
        return [
            { value: "database", label: "Save Data to DB" },
            { value: "alert", label: "Show Alert" },
            { value: "modal", label: "Show Modal" },
            // ... more options
        ];
    }
  },
  watch: {
    item: {
      handler(newItem) {
        const defaults = {
          uid: generateUid('button_'),
          type: 'button',
          name: '',
          label: 'Button',
          style: 'primary',
          textSize: 'text-base',
          flows: [], // Array of flow steps
          mappings: [], // Array of data mappings
        };
        this.localItem = {
          ...defaults,
          ...JSON.parse(JSON.stringify(newItem)),
          // Ensure flows and mappings are arrays and steps have unique IDs and default options
          flows: (newItem.flows || []).map(f => ({ ...f, id: f.id || generateUid('flow_'), options: f.options || {}, isEditing: f.isEditing === undefined ? false : f.isEditing })),
          mappings: (newItem.mappings || []).map(m => ({ ...m, keyword: m.keyword || generateUid('map_') })),
        };
      },
      deep: true,
      immediate: true,
    },
    localItem: {
      handler(newItem) {
        this.$emit('update-item', JSON.parse(JSON.stringify(newItem)));
      },
      deep: true,
    },
  },
  methods: {
    generateUid, // Make it available in template if needed, or just use internally
    sanitizeKeyword() {
        this.newMapping.keyword = this.newMapping.keyword.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    },
    getHumanFriendlyStepType(type) {
        const names = {
            database: "Save to Database",
            alert: "Show Alert Message",
            modal: "Display Modal Popup",
            email: "Send Email Notification",
            redirect: "Redirect Page",
            delay: "Add Delay/Pause",
            trigger: "Trigger Element Action",
            webhook: "Call External Webhook",
            script: "Run Custom JavaScript"
        };
        return names[type] || type.charAt(0).toUpperCase() + type.slice(1);
    },
    getHumanFriendlyMappingSource(source, identifier) {
        const names = {
            form_input: `Form Input: '${identifier}'`,
            fixed_value: `Fixed Value: "${identifier}"`,
            user_data: `User Data: user.${identifier}`,
            url_param: `URL Parameter: '${identifier}'`
        };
        return names[source] || `${source}: ${identifier}`;
    },
    addFlowStep() {
      if (!this.newStep.type) return;
      const defaultOptions = {
        stepName: '', // Default name for the step
        duration: 5, // for delay
        collection: '', // for database
        text: 'Alert!', // for alert
        title: 'Modal Title', message: 'Modal Message', // for modal
        to: '', subject: '', body: '', senderName:'', senderEmail:'', // for email
        url: '', // for redirect & webhook
        element: '', action: 'show', cssClass: '', // for trigger
        method: 'POST', payload: '{}', // for webhook
        scriptContent: '// Custom script here\nconsole.log("Script executed with data:", data);' // for script
      };
      this.localItem.flows.push({
        id: generateUid('flow_'),
        type: this.newStep.type,
        options: { ...(defaultOptions || {}), ...(this.newStep.options || {}) }, // Merge general defaults with type-specific if any from newStep.options
        isEditing: true, // Open for editing immediately
      });
      this.newStep = { type: '', options: {} }; // Reset form
    },
    toggleFlowStepEdit(index) {
      this.localItem.flows[index].isEditing = !this.localItem.flows[index].isEditing;
    },
    duplicateFlowStep(index) {
      const originalStep = this.localItem.flows[index];
      const duplicatedStep = JSON.parse(JSON.stringify(originalStep)); // Deep copy
      duplicatedStep.id = generateUid('flow_'); // New unique ID
      duplicatedStep.isEditing = false; // Start collapsed
      this.localItem.flows.splice(index + 1, 0, duplicatedStep);
    },
    moveFlowStep(index, direction) {
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= this.localItem.flows.length) return;
      const [step] = this.localItem.flows.splice(index, 1);
      this.localItem.flows.splice(newIndex, 0, step);
    },
    removeFlowStep(index) {
      this.localItem.flows.splice(index, 1);
    },

    addMapping() {
      if (!this.newMapping.keyword || !this.newMapping.source) return;
      // Prevent duplicate keywords
      if (this.localItem.mappings.some(m => m.keyword === this.newMapping.keyword)) {
          alert(`Keyword "${this.newMapping.keyword}" already exists. Please use a unique keyword.`);
          return;
      }
      this.localItem.mappings.push({
        keyword: this.newMapping.keyword,
        source: this.newMapping.source,
        sourceIdentifier: this.newMapping.sourceIdentifier || '',
      });
      this.newMapping = { keyword: '', source: '', sourceIdentifier: '' }; // Reset form
    },
    removeMapping(index) {
      this.localItem.mappings.splice(index, 1);
    },

    // Placeholder for a method that might provide options for mapping values
    // getAllBuilderOptionsFlow() {
    //   // This would need access to the overall builder structure or a context prop
    //   // For now, returning an empty array or a placeholder
    //   console.warn("getAllBuilderOptionsFlow is not fully implemented in ButtonElement.vue");
    //   return [{ name: 'Placeholder Field 1', value: 'field1' }];
    // }
  },
};
</script>

<style scoped>
.popup-label {
  font-size: 0.875rem; /* Tailwind text-sm */
}
.popup-input, .popup-select {
  border-width: 1px;
  /* border-color: #d1d5db; Tailwind gray-300 */
  padding: 0.5rem 0.75rem; /* More padding for better click targets */
  font-size: 0.875rem;
  border-radius: 0.25rem; /* Tailwind rounded-md */
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* Tailwind shadow-sm */
  background-color: white;
  line-height: 1.25;
}
.popup-input:focus, .popup-select:focus {
 outline: 2px solid transparent;
 outline-offset: 2px;
 --tw-ring-offset-shadow: var(--tw-ring-offset-width, 0px) 0 0 0 var(--tw-ring-offset-color, #fff), var(--tw-ring-shadow, 0 0 #0000);
 --tw-ring-shadow: 0 0 0 calc(1px + var(--tw-ring-offset-width, 0px)) var(--tw-ring-color, #3b82f6);
 box-shadow: var(--tw-ring-offset-shadow), var(--tw-ring-shadow), var(--tw-shadow, 0 0 #0000);
 border-color: #3b82f6; /* Tailwind ring-blue-500 */
}
.section-group { margin-bottom: 1rem; }
.tabs button.font-bold { /* Ensure active tab text is clearly visible */
    color: #2563eb; /* Tailwind blue-600 */
}
</style> 