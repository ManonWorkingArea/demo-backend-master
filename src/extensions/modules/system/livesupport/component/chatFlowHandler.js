import { generateCustomMessage } from './ai.js';

export const chatFlow = [
  {
    objective: "greet",
    prompt: "greeting and get user name",
    message: "Hello! Welcome to our service. What's your name?",
    contextLabel:'',
    contextKey: "name",
    inputValidate: validateNonEmptyInput,
    validationMessage: "Please enter your name.",
    nextObjective: "getName",
    renameTrigger: true,
  },
  {
    objective: "getName",
    prompt: "hello client name and get user e-mail",
    message: "Nice to meet you, [context.name]! Can I have your email address?",
    contextKey: "email",
    contextLabel:'Name',
    inputValidate: validateEmail,
    validationMessage: "Please enter a valid email address.",
    nextObjective: "getEmail",
    renameTrigger: false,
  },
  {
    objective: "getEmail",
    prompt: "Thank user and get user phone",
    message: "Thanks, [context.name]. Could you also provide your phone number?",
    contextKey: "phone",
    contextLabel:'Email',
    inputValidate: validatePhone,
    validationMessage: "Please enter a valid phone number.",
    nextObjective: "getPhone",
    renameTrigger: false,
  },
  {
    objective: "getPhone",
    prompt: "Thank user and ask to your assistance [yes, no]",
    message: "Thanks, [context.name]! Would you like assistance with something else?",
    contextLabel:'Phone',
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
    inputValidate: validateNonEmptyInput,
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
    inputValidate: validateNonEmptyInput,
    validationMessage: "Please provide the product name or description.",
    nextObjective: "confirmInput",
    summaryLabel: "Product Interest",
    isAssistance: true,
    renameTrigger: false,
  },
  {
    objective: "generalQuestion",
    prompt: "ask user for general qestion only",
    message: "Please ask your question, and I'll do my best to assist you.",
    contextKey: "generalQuestion",
    inputValidate: validateNonEmptyInput,
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
      { label: "no", return: getPreviousObjective }
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
  
];

// Utility functions for validation
export function validateEmail(input) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(input).toLowerCase());
}

export function validatePhone(input) {
  const re = /^[0-9]{10}$/;
  return re.test(String(input));
}

export function validateNonEmptyInput(input) {
  return !!input.trim();
}

export function getPreviousObjective(context) {
  return context.previousObjective;
}

// Function to generate a chat summary
export function generateSummary(context, chatFlow) {
  let summary = "";
  let assistanceMessages = [];
  let details = "";

  if (!chatFlow) {
    throw new Error("chatFlow is undefined or not passed correctly.");
  }

  // Loop through chatFlow to dynamically build the summary
  chatFlow.forEach(step => {
    if (context[step.contextKey]) {
      if (step.contextLabel) {
        // Append each labeled detail to the summary
        summary += `- ${step.contextLabel}: ${context[step.contextKey] || "N/A"}\n`;
      }

      if (step.summaryLabel) {
        // Append each relevant detail to the summary
        details += `${step.summaryLabel}: ${context[step.contextKey]}\n`;

        // Collect assistance-related messages based on isAssistance flag
        if (step.isAssistance) {
          assistanceMessages.push(step.summaryLabel);
        }
      }
    }
  });

  // Join all assistance messages into a single string
  const assistanceMessage = assistanceMessages.length > 0 ? assistanceMessages.join(", ") : "No assistance needed";

  return `
    Here's a summary of our conversation:
    ${summary.trim()}
      - Assistance: ${assistanceMessage}
      - Details: ${details.trim() || "N/A"}
    `;
}

// Function to rename the sender based on the provided name
export function renameSender(conversation, newName) {
  if (!conversation || !newName) return;

  conversation.message.forEach(msg => {
    if (msg.sender === 'bot' || msg.sender === 'agent') {
      msg.sender = newName;
    }
  });
}

// Processing chat steps
export async function processChatStep(input, currentObjective, context, chatFlow) {
  const stepData = chatFlow.find(step => step.objective === currentObjective);

  // Update context with user input
  if (stepData.contextKey) {
    context[stepData.contextKey] = input.trim();
  }

  // Store the current context key and value for the confirmation step
  if (stepData.contextKey && currentObjective !== "confirmInput") {
    context.currentStepContextKey = stepData.contextKey;
    context.currentStepContextValue = context[stepData.contextKey]; // Store the actual value
    context.previousObjective = currentObjective;
  }

  // Create a new context object 'context_ai' with only the relevant fields
  const context_ai = {
    currentStepContextKey: stepData.contextKey,
    currentStepContextValue: context[stepData.contextKey]
  };

  // Validation logic
  if (stepData.inputValidate && !stepData.inputValidate(input.trim())) {
    return {
      nextObjective: currentObjective,
      message: stepData.validationMessage,
      choices: stepData.conditionValidate ? stepData.conditionValidate.map(c => c.label) : null,
      end: false,
      objective: currentObjective // Include the current objective
    };
  }

  let nextObjective;
  let choices = null;
  let rename = false;

  if (stepData.conditionValidate) {
    choices = stepData.conditionValidate.map(c => c.label);
    const choice = stepData.conditionValidate.find(c => c.label.toLowerCase() === input.trim().toLowerCase());
    if (!choice) {
      return {
        nextObjective: currentObjective,
        message: stepData.validationMessage,
        choices: choices,
        end: false,
        objective: currentObjective // Include the current objective
      };
    }
    nextObjective = typeof choice.return === 'function' ? choice.return(context) : choice.return;
  } else {
    nextObjective = typeof stepData.nextObjective === 'function' ? stepData.nextObjective(context) : stepData.nextObjective;
  }

  // Check for renameTrigger and use context.name to set rename value
  if (stepData.renameTrigger && context.name) {
    rename = context.name;
  }

  // Validate the next objective exists
  const nextStepData = chatFlow.find(step => step.objective === nextObjective);
  if (!nextStepData) {
    throw new Error(`No step found for objective: ${nextObjective}`);
  }

  // AI persona with a name
  let persona = `You are "Peter AI Assis," a polite and knowledgeable AI support agent for an E-Learning platform. Your goal is to provide clear, helpful responses, adapting to the user's language and tone.`;

  // Construct the prompt message for the AI to generate the response
  let promptMessage = `${persona} Fulfill the objective: "${nextStepData.prompt}". Use this context: context_ai = ${JSON.stringify(context_ai)}. Ensure clarity and relevance. If there are options in brackets (e.g., [1. xxxx, 2. xxxx, 3. xxxx]), list each option on a new line.`;

  // Use AI to generate the response based on the prompt message and return immediately
  try {
    const nextMessage = await generateCustomMessage(promptMessage);

    return {
      nextObjective: nextStepData.objective,
      message: nextMessage,
      choices: nextStepData.conditionValidate ? nextStepData.conditionValidate.map(c => c.label) : null,
      end: nextObjective === "endConversation",
      objective: nextStepData.objective, // Include the next objective in the return value
      data: context.data || null, // Pass the contextKey data if available
      rename: rename // Pass the context.name or relevant client data
    };
  } catch (error) {
    console.error("Error generating custom message:", error);
    
    return {
      nextObjective: nextStepData.objective,
      message: "Sorry, I couldn't generate a response.",
      choices: nextStepData.conditionValidate ? nextStepData.conditionValidate.map(c => c.label) : null,
      end: nextObjective === "endConversation",
      objective: nextStepData.objective, // Include the next objective in the return value
      data: context.data || null, // Pass the contextKey data if available
      rename: rename // Pass the context.name or relevant client data
    };
  }
}
