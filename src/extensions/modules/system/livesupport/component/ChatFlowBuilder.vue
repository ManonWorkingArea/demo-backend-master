<template>
  <div class="chat-flow-builder">
    <h2>Chat Flow Builder</h2>
    <div v-for="(step, index) in chatFlow" :key="index" class="chat-flow-step">
      <h3>Step {{ index + 1 }}: {{ step.objective }}</h3>
      <div>
        <label>Objective:</label>
        <input v-model="step.objective" />
      </div>
      <div>
        <label>Prompt:</label>
        <input v-model="step.prompt" />
      </div>
      <div>
        <label>Message:</label>
        <textarea v-model="step.message" />
      </div>
      <div>
        <label>Context Key:</label>
        <input v-model="step.contextKey" />
      </div>
      <div>
        <label>Context Label:</label>
        <input v-model="step.contextLabel" />
      </div>
      <div>
        <label>Validation Message:</label>
        <input v-model="step.validationMessage" />
      </div>
      <div>
        <label>Next Objective:</label>
        <select v-model="step.nextObjective">
          <option v-for="objective in objectiveList" :key="objective" :value="objective">
            {{ objective }}
          </option>
        </select>
      </div>
      <div>
        <label>Rename Trigger:</label>
        <input type="checkbox" v-model="step.renameTrigger" />
      </div>
      <div v-if="step.conditionValidate">
        <h4>Condition Validation</h4>
        <div class="condition-grid">
          <div v-for="(condition, condIndex) in step.conditionValidate" :key="condIndex" class="condition-item">
            <div>
              <label>Label:</label>
              <input v-model="condition.label" />
            </div>
            <div>
              <label>Return:</label>
              <select v-model="condition.return">
                <option v-for="objective in objectiveList" :key="objective" :value="objective">
                  {{ objective }}
                </option>
              </select>
            </div>
          </div>
        </div>
        <div class="button-row">
          <button @click="addCondition(index)">Add Condition</button>
        </div>
      </div>
      <button @click="removeStep(index)">Remove Step</button>
      <hr />
    </div>
    <button @click="addStep">Add New Step</button>
    <button @click="saveChatFlow">Save Chat Flow</button>
  </div>
</template>

<script>
export default {
  data() {
    return {
      chatFlow: [
        {
          objective: "greet",
          prompt: "greeting and get user name",
          message: "Hello! Welcome to our service. What's your name?",
          contextLabel: '',
          contextKey: "name",
          inputValidate: this.validateNonEmptyInput,
          validationMessage: "Please enter your name.",
          nextObjective: "getName",
          renameTrigger: true,
        },
        {
          objective: "getName",
          prompt: "hello client name and get user e-mail",
          message: "Nice to meet you, [context.name]! Can I have your email address?",
          contextKey: "email",
          contextLabel: 'Name',
          inputValidate: this.validateEmail,
          validationMessage: "Please enter a valid email address.",
          nextObjective: "getEmail",
          renameTrigger: false,
        },
        {
          objective: "getEmail",
          prompt: "Thank user and get user phone",
          message: "Thanks, [context.name]. Could you also provide your phone number?",
          contextKey: "phone",
          contextLabel: 'Email',
          inputValidate: this.validatePhone,
          validationMessage: "Please enter a valid phone number.",
          nextObjective: "getPhone",
          renameTrigger: false,
        },
        {
          objective: "getPhone",
          prompt: "Thank user and ask to your assistance [yes, no]",
          message: "Thanks, [context.name]! Would you like assistance with something else?",
          contextLabel: 'Phone',
          contextKey: "assistanceChoice",
          conditionValidate: [
            { label: "yes", return: "offerHelp" },
            { label: "no", return: "endConversation" }
          ],
          validationMessage: "Please answer with 'yes' or 'no'.",
          renameTrigger: false,
        },
        {
          objective: "offerHelp",
          prompt: "offer help options: [1.Product Support, 2.Sales Inquiry, 3.General Question] to user select",
          message: "Please select from the following options: \n1. Product Support \n2. Sales Inquiry \n3. General Question",
          contextKey: "helpType",
          conditionValidate: [
            { label: "1", return: "productSupport" },
            { label: "2", return: "salesInquiry" },
            { label: "3", return: "generalQuestion" }
          ],
          validationMessage: "Please select a valid option (1, 2, or 3).",
          renameTrigger: false,
        },
        {
          objective: "productSupport",
          prompt: "ask user for product support help only",
          message: "For product support, please describe the issue you're facing.",
          contextKey: "productIssue",
          inputValidate: this.validateNonEmptyInput,
          validationMessage: "Please describe your issue.",
          nextObjective: "confirmInput",
          summaryLabel: "Product Issue",
          isAssistance: true,
          renameTrigger: false,
        },
        {
          objective: "salesInquiry",
          prompt: "ask user for sale inquiry help only",
          message: "For sales inquiries, what product are you interested in?",
          contextKey: "productInterest",
          inputValidate: this.validateNonEmptyInput,
          validationMessage: "Please provide the product name or description.",
          nextObjective: "confirmInput",
          summaryLabel: "Product Interest",
          isAssistance: true,
          renameTrigger: false,
        },
        {
          objective: "generalQuestion",
          prompt: "ask user for general question only",
          message: "Please ask your question, and I'll do my best to assist you.",
          contextKey: "generalQuestion",
          inputValidate: this.validateNonEmptyInput,
          validationMessage: "Please ask your question.",
          nextObjective: "confirmInput",
          summaryLabel: "General Question",
          isAssistance: true,
          renameTrigger: false,
        },
        {
          objective: "confirmInput",
          prompt: "confirm user input data [yes, no]",
          message: 'You said: "[context.currentStepContextValue]". Is that correct?',
          contextKey: "confirmation",
          conditionValidate: [
            { label: "yes", return: "moreQuestions" },
            { label: "no", return: this.getPreviousObjective }
          ],
          validationMessage: "Please answer with 'yes' or 'no'.",
          renameTrigger: false,
        },
        {
          objective: "moreQuestions",
          prompt: "ask user for more question [yes, no]",
          message: "Do you have any more questions, [context.name]?",
          contextKey: "moreQuestions",
          conditionValidate: [
            { label: "yes", return: "offerHelp" },
            { label: "no", return: "endConversation" }
          ],
          validationMessage: "Please answer with 'yes' or 'no'.",
          renameTrigger: false,
        },
        {
          objective: "endConversation",
          prompt: "thank user and tell no worry issue we will support soon and make summary from context_ai show user",
          message: [
            "Thank you, [context.name]! Have a great day!",
            "[summary]"
          ],
          contextKey: null,
          validation: null,
          validationMessage: null,
          nextObjective: null,
          renameTrigger: false,
        },
      ],
    };
  },
  computed: {
    objectiveList() {
      return this.chatFlow.map(step => step.objective);
    }
  },
  methods: {
    validateNonEmptyInput(input) {
      return input.trim().length > 0;
    },
    validateEmail(email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email);
    },
    validatePhone(phone) {
      const phoneRegex = /^[0-9]{10}$/; // Adjust the regex according to your needs
      return phoneRegex.test(phone);
    },
    addStep() {
      this.chatFlow.push({
        objective: "",
        prompt: "",
        message: "",
        contextLabel: '',
        contextKey: "",
        inputValidate: null,
        validationMessage: "",
        nextObjective: "",
        renameTrigger: false,
        conditionValidate: [],
      });
    },
    addCondition(stepIndex) {
      this.chatFlow[stepIndex].conditionValidate.push({ label: "", return: "" });
    },
    removeStep(index) {
      this.chatFlow.splice(index, 1);
    },
    saveChatFlow() {
      // Implement save functionality as needed
      console.log("Chat Flow saved:", this.chatFlow);
    },
  },
};
</script>

<style scoped>
.chat-flow-builder {
  max-width: 600px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.chat-flow-step {
  margin-bottom: 20px;
}

.chat-flow-step h3 {
  margin-bottom: 10px;
}

.chat-flow-step div {
  margin-bottom: 8px;
}

textarea, input[type="text"], select {
  width: 100%;
  padding: 8px;
  margin: 4px 0;
  box-sizing: border-box;
}

.condition-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.condition-item {
  display: contents;
}

.button-row {
  grid-column: 1 / -1;
  text-align: right;
}

button {
  margin-top: 10px;
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
