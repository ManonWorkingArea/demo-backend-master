import { customPrompt } from './FlowPrompt';
import { customWait, showToast, hideToast } from './FlowWait';

class Flow {
  constructor(flowSteps) {
    this.flowSteps = flowSteps;
    this.currentStepIndex = 0;
    this.data = {};
  }

  async run(initialData = {}) {
    this.data = { ...initialData };
    this.currentStepIndex = 0;
    while (this.currentStepIndex < this.flowSteps.length) {
      const step = this.flowSteps[this.currentStepIndex];
      await this.executeStep(step);
      this.currentStepIndex++;
    }
    console.log('Flow execution completed.');
  }

  async executeStep(step) {
    console.log(`Executing step: ${step.name}`);

    // Replace placeholders dynamically
    const input = this.replacePlaceholders(step.input);
    const request = this.replaceRequestPlaceholders(step.request);

    switch (step.code) {
      case 'continue':
        break;
      case 'stop':
        console.log('Flow execution stopped.');
        this.currentStepIndex = this.flowSteps.length;
        break;
      case 'wait':
        if (request && request.seconds !== undefined) {
          await customWait(request.seconds);
        }
        break;
      case 'alert':
        if (request && request.text !== undefined) {
          await customPrompt(request.text, false);
        }
        break;
      case 'debug':
        if (request && request.text !== undefined) {
          console.log('Debug:', request.text);
        }
        break;
      case 'prompt':
        if (request && request.text !== undefined) {
          const result = await customPrompt(request.text, true);
          if (step.output && step.output.type === 'continue') {
            if (!result) {
              this.currentStepIndex = this.flowSteps.length;
            }
          } else if (step.output && step.output.type === 'logic') {
            step.output.logic = result ? 'true' : 'false';
          }
        }
        break;
      case 'condition':
        if (request && request.value !== undefined) {
          const conditionValue = this.replacePlaceholders(request.value);
          const conditionResult = conditionValue === 'true';
          if (step.output && step.output.type === 'logic') {
            step.output.logic = conditionResult ? 'true' : 'false';
          }
        }
        break;
      case 'call':
        if (request && request.url !== undefined) {
          showToast('Loading...');
          const apiData = await this.callApi(request.url, request.data, request.method);
          hideToast();
          if (step.export) {
            this.data[`export.${this.currentStepIndex}`] = apiData;
          }
        }
        break;
      case 'display':
        if (request && request.selector !== undefined && request.text !== undefined) {
          this.displayText(request.selector, request.text);
        }
        break;
      default:
        console.log(`Unknown action code: ${step.code}`);
        break;
    }

    if (step.output && step.output.type === 'logic') {
      const logicResult = await this.evaluateLogic(step.output.logic);
      await this.runLogicActions(logicResult, step.output);
    }

    // Export data if export is checked and not already exported by the call case
    if (step.export && input && step.code !== 'call') {
      try {
        const inputData = JSON.parse(input);
        this.data[`export.${this.currentStepIndex}`] = { ...inputData };
      } catch (e) {
        this.data[`export.${this.currentStepIndex}`] = { text: input };
      }
    }
  }

  replacePlaceholders(text) {
    if (typeof text !== 'string') return text;
    return text.replace(/\$\{(data|export\.\d+)(\.\w+)?\}/g, (match, p1, p2) => {
      let value;
      if (p1 === 'data') {
        value = this.initialData;
      } else {
        const index = p1;
        value = this.data[index];
      }

      if (p2) {
        const key = p2.slice(1); // Remove the dot
        value = value ? value[key] : undefined;
      }

      if (typeof value === 'object') {
        return JSON.stringify(value);
      }
      return value !== undefined ? value : match;
    });
  }

  replaceRequestPlaceholders(request) {
    if (!request) return request;
    const newRequest = { ...request };
    for (let key in newRequest) {
      newRequest[key] = this.replacePlaceholders(newRequest[key]);
    }
    return newRequest;
  }

  async callApi(url, data, method = 'POST') {
    try {
      const options = {
        method,
        headers: {
          'Content-Type': 'application/json'
        }
      };

      if (method !== 'GET' && method !== 'HEAD') {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      const result = await response.json();
      console.log('API Response:', result);
      return result;
    } catch (error) {
      console.error('API Call Error:', error);
      return null;
    }
  }

  displayText(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
      element.innerText = text;
    } else {
      console.error(`Element with selector "${selector}" not found.`);
    }
  }

  async evaluateLogic(logic) {
    return logic === 'true';
  }

  async runLogicActions(logicResult, output) {
    const actions = logicResult ? output.trueActions : output.falseActions;
    for (const action of actions) {
      await this.executeStep(action);
    }
  }
}

export default Flow;
