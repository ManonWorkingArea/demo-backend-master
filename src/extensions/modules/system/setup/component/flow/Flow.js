import { customPrompt } from './FlowPrompt';
import { customWait, showToast, hideToast } from './FlowWait';
import { updateStock } from '@/extensions/modules/ecommerce/shop/component/Product/shop_admin.js';
import { sendEmail } from '@/extensions/modules/system/setup/component/email/sendEmail.js';

import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';

const Request = new requestClient(false);
const configs = storageManager.get('configs');
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
  }

  async executeStep(step) {
    // Skip step if status is false
    if (!step.status) {
      return;
    }

    const input = this.replacePlaceholders(step.input);
    const request = this.replaceRequestPlaceholders(step.request);

    try {
      switch (step.code) {
        case 'continue':
          break;
        case 'stop':
          this.currentStepIndex = this.flowSteps.length;
          break;

        case 'reload':
          await this.handleReload();
          break;

        case 'wait':
          await this.handleWait(request);
          break;

        case 'alert':
          await this.handleAlert(request);
          break;

        case 'debug':
          this.handleDebug(request);
          break;

        case 'prompt':
          await this.handlePrompt(step, request);
          break;

        case 'condition':
          this.handleCondition(step, request);
          break;

        case 'call':
          await this.handleApiCall(step, request);
          break;

          case 'request':
          await this.handleRequest(step, request);
          break;

        case 'http':
          await this.handleHttpRequest(step, request);
          break;

        case 'login':
          await this.handleLogin(step,request);
          break;

        case 'forgot':
          await this.handleForgot(step,request);
          break;

          case 'changepwd':
          await this.handleChangepwd(step,request);
          break;

        case 'display':
          this.handleDisplay(request);
          break;

        case 'stock':
          await this.handleStock(request);
          break;

        case 'visible':
          this.handleVisibility(request);
          break;

        case 'goto':
          this.handleGoto(request);
          break;

        case 'email':
          this.handleEmail(request);
          break;

        default:
          console.log(`Unknown action code: ${step.code}`);
          break;
      }

      if (step.output && step.output.type === 'logic') {
        const logicResult = await this.evaluateLogic(step.output.logic);
        await this.runLogicActions(logicResult, step.output);
      }

      if (step.export && input && step.code !== 'call') {
        try {
          const inputData = JSON.parse(input);
          this.data[`export.${step.code}`] = { ...inputData };
        } catch (e) {
          this.data[`export.${step.code}`] = { text: input };
        }
      }
    } catch (error) {
      console.error(`Error executing step: ${step.name}`, error);
    }
  }

  getDataValue(p1, p2) {
    let dataValue;
    if (p1 === 'data') {
      dataValue = this.data;
    } else {
      const stepCode = p1.split('.')[1];
      dataValue = this.data[`export.${stepCode}`];
    }

    if (p2) {
      const key = p2.slice(1);
      dataValue = dataValue ? dataValue[key] : undefined;
    }

    if (typeof dataValue === 'object' && !Array.isArray(dataValue)) {
      return JSON.stringify(dataValue);
    }
    return dataValue;
  }

  replacePlaceholders(value) {
    if (typeof value === 'string') {
      return value.replace(/\$\{(data|export\.\w+)(\.\w+)?\}/g, (match, p1, p2) => {
        const dataValue = this.getDataValue(p1, p2);
        return dataValue !== undefined ? dataValue : match;
      });
    } else if (Array.isArray(value)) {
      return value.map(item => this.replacePlaceholders(item));
    } else if (typeof value === 'object' && value !== null) {
      const newObject = {};
      for (const key in value) {
        newObject[key] = this.replacePlaceholders(value[key]);
      }
      return newObject;
    }
    return value;
  }

  async handleReload() {
    try {
        window.location.reload();
    } catch (error) {
        console.error('Error during reload:', error);
    }
}

  async handleEmail(request) {
    if (request !== undefined) {
      const emailData = {
        senderName: request.senderName,
        senderEmail: request.senderEmail,
        name: request.recipientName,
        email: request.recipientEmail,
        subject: request.subject,
        body: request.body,
        emailTemplateId: request.emailTemplate
      };
  
      try {
        const response = await sendEmail(emailData);
        console.log('Email sent successfully:', response);
      } catch (error) {
        console.error('Error sending email:', error);
      }
    } else {
      console.error('Request object is undefined');
    }
  }

  replaceRequestPlaceholders(request) {
    if (!request) return request;
    const newRequest = { ...request };
    for (let key in newRequest) {
      newRequest[key] = this.replacePlaceholders(newRequest[key]);
    }
    return newRequest;
  }

  async handleWait(request) {
    if (request && request.seconds !== undefined) {
      await customWait(request.seconds);
    }
  }

  async handleAlert(request) {
    if (request && request.text !== undefined) {
      await customPrompt(request.text, false);
    }
  }

  handleDebug(request) {
    if (request && request.text !== undefined) {
      console.log('Debug:', request.text);
    }
  }

  async handlePrompt(step, request) {
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
  }

  async handleGoto(request) {
    if (request && request.routeOrUrl !== undefined) {
      const { routeOrUrl, target } = request;
  
      if (routeOrUrl.startsWith('https://') || routeOrUrl.startsWith('http://')) {
        if (target === '_blank') {
          window.open(routeOrUrl, '_blank');
        } else {
          window.location.href = routeOrUrl;
        }
      } else {
        const currentHostname = window.location.hostname;
        const fullUrl = `${window.location.protocol}//${currentHostname}${routeOrUrl}`;
        window.location.href = fullUrl;
      }
    }
  }

  handleCondition(step, request) {
    if (request && request.value !== undefined) {
      const conditionValue = this.replacePlaceholders(request.value);

      console.log("request",request);
      const conditionResult = conditionValue === true || conditionValue === 'true';
      if (step.output && step.output.type === 'logic') {
        step.output.logic = conditionResult ? 'true' : 'false';
      }
    }
  }

  handleHttpRequest(step, request) {
    console.log("Handling HTTP request");
  
    let exportData = {};
  
    try {
      // Get the hostname and query string from the browser's address bar
      const hostname = window.location.hostname;
      const searchParams = new URLSearchParams(window.location.search);
  
      // Track the hostname directly in exportData
      exportData.hostname = hostname;
  
      // Flatten the URL parameters directly into exportData
      searchParams.forEach((value, key) => {
        exportData[key] = value;
      });
  
      // Track the request data directly in exportData if any was passed to the function
      if (request?.data) {
        Object.keys(request.data).forEach((key) => {
          exportData[key] = request.data[key];
        });
      }
  
      console.log("exportData", exportData);
  
      // Assign the collected data to the export key
      if (step.export) {
        this.data[`export.${step.code}`] = exportData;
      }
  
    } catch (error) {
      console.error("Error handling HTTP request:", error);
  
      // Handle any unexpected errors
      exportData.error = "Error processing request";
      if (step.export) {
        this.data[`export.${step.code}`] = exportData;
      }
    }
  }
  
  async handleApiCall(step, request) {
    console.log("request", request);
    if (request && request.url !== undefined) {
      showToast('Loading...');
  
      let requestData;
      try {
        // Convert the request data string into a valid JSON format
        requestData = typeof request.data === 'string' ? JSON.parse(request.data.replace(/(\w+):/g, '"$1":').replace(/:\s*([\w]+)/g, ': "$1"')) : request.data;
      } catch (e) {
        console.error("Invalid JSON format in request data:", e);
        hideToast();
        return;
      }
  
      const apiData = await this.callApi(request.url, requestData, request.method);
      hideToast();
  
      if (step.export) {
        this.data[`export.${step.code}`] = apiData;
      }
    }
  }

  async handleRequest(step, request) {
    console.log("request", request);
  
    if (request !== undefined) {
      showToast('Loading...');
  
      let requestData;
      try {
        // Convert the request data string into a valid JSON format
        requestData = typeof request.data === 'string' ? JSON.parse(request.data.replace(/(\w+):/g, '"$1":').replace(/:\s*([\w]+)/g, ': "$1"')) : request.data;
      } catch (e) {
        console.error("Invalid JSON format in request data:", e);
        hideToast();
        return;
      }
  
      try {
        // Call the API using Request.POST
        const resAPISignin = await Request.POST(request.endpoint, requestData, configs.key);
  
        // Log and handle the response
        console.log("resAPISignin", resAPISignin);
        
        hideToast();
  
        // Store the API response in this.data if step.export is true
        if (step.export) {
          this.data[`export.${step.code}`] = resAPISignin.data;
        }
      } catch (error) {
        console.error("API call failed:", error);
        hideToast();
      }
    }
  }
  

  handleDisplay(request) {
    if (request && request.selector !== undefined && request.text !== undefined) {
      this.clearAndDisplayText(request.selector, request.text);
    }
  }
  
  clearAndDisplayText(selector, text) {
    const element = document.querySelector(selector);
    if (element) {
      if (window.getComputedStyle(element).display === 'none' || element.style.visibility === 'hidden' || element.style.display === 'none') {
        element.style.display = 'block';
        element.style.visibility = 'visible';
      }
      element.innerHTML = '';  // Clear the existing text
      element.innerHTML = text;  // Set the new text
    } else {
      console.error(`Element with selector "${selector}" not found.`);
    }
  }

  async handleLogin(step, request) {
    console.log("handleLogin", request);
    let response = { status: false, message: '' };
    try {
        if (request !== undefined) {
            // Send request to signin endpoint
            const resAPISignin = await Request.POST('signin', {
                username: request.username,
                password: request.password
            }, configs.key);

            console.log("resAPISignin", resAPISignin);

            // Handle response based on status and message
            if (resAPISignin.data.status) { // Success
                const signinData = resAPISignin.data;
                const loginData = signinData.session ? signinData.session.user : null;

                if (loginData) {
                    const getEnroll = signinData.session.enroll || [];
                    let unitList = [];
                    let currentAccess = "";
                    const session = {
                        active: true,
                        token: loginData._id,
                        refresh: "",
                        login: true,
                        userID: loginData._id,
                        user: loginData,
                        loader: false,
                        role: loginData.role,
                        nav: "normal-nav",
                        layout: "frontend-layout",
                        current: currentAccess,
                        list: unitList,
                        enroll: getEnroll,
                        channel: 'web',
                    };
                    storageManager.update('session', session);
                    response.status = true;
                    response.message = 'เข้าสู่ระบบเรียบร้อยแล้ว';
                } else {
                    response.message = 'ไม่พบข้อมูลบัญชีผู้ใช้นี้';
                }
            } else { // Failure
                response.message = resAPISignin.data.message;
            }
        } else {
            response.message = 'Invalid request';
        }
    } catch (error) {
        console.error('Error during signin:', error);
        response.message = 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ';
    }

    if (step.export) {
        this.data[`export.${step.code}`] = response;
    }

    return response;
  }

  async handleForgot(step, request) {
    console.log("handleForgot", request);
    let response = { status: false, message: '' };
    try {
        if (request !== undefined) {
            // Send request to forgot endpoint
            const resAPIForgot = await Request.POST('forgot', {
                email: request.email
            }, configs.key);

            console.log("resAPIForgot", resAPIForgot);

            // Handle response based on status and message
            if (resAPIForgot.data.status) { // Success
                response.status = true;
                response.info = resAPIForgot.data.user.firstname + ' ' + resAPIForgot.data.user.lastname;
                response.email = resAPIForgot.data.user.email;
                response.request = resAPIForgot.data.user.requestId;
                response.message = 'อีเมลถูกต้อง';
            } else { // Failure
                response.message = resAPIForgot.data.message;
            }
        } else {
            response.message = 'Invalid request';
        }
    } catch (error) {
        console.error('Error during forgot process:', error);
        response.message = 'เกิดข้อผิดพลาดในการตรวจสอบอีเมล';
    }

    if (step.export) {
        this.data[`export.${step.code}`] = response;
    }

    return response;
}

async handleChangepwd(step, request) {
  console.log("handleChangepwd", request);
  let response = { status: false, message: '' };

  try {
      if (request !== undefined) {
        // Check if newPassword is provided
        // Check if newPassword is provided
if (!request.newPassword || request.newPassword.trim() === '') {
  response.message = 'กรุณาใส่รหัสผ่านใหม่';
  if (step.export) {
      this.data[`export.${step.code}`] = response;
  }
  return response;
}

let unmetConditions = [];
const config = request.passwordConfig;

// Check each condition against the newPassword

// Length condition
if (request.newPassword.length < config.length) {
  unmetConditions.push(`รหัสผ่านต้องยาวอย่างน้อย ${config.length} ตัว`);
}

// Number condition
if (config.includeNumbers && !/\d/.test(request.newPassword)) {
  unmetConditions.push('ต้องมีตัวเลข');
}

// Lowercase condition
if (config.includeLowercase && !/[a-z]/.test(request.newPassword)) {
  unmetConditions.push('ต้องมีตัวอักษรตัวเล็ก');
}

// Uppercase condition
if (config.includeUppercase && !/[A-Z]/.test(request.newPassword)) {
  unmetConditions.push('ต้องมีตัวอักษรตัวใหญ่');
}

// Symbols condition
if (config.includeSymbols && !/[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(request.newPassword)) {
  unmetConditions.push('ต้องมีสัญลักษณ์พิเศษ');
}

// Similar characters condition
if (config.noSimilarCharacters && /[iloILO0]/.test(request.newPassword)) {
  unmetConditions.push('ต้องไม่มีตัวอักษรที่คล้ายกัน (เช่น i, l, 1, L, o, 0, O)');
}

// Duplicate characters condition
if (config.noDuplicateCharacters && /(\w).*\1/.test(request.newPassword)) {
  unmetConditions.push('ต้องไม่มีตัวอักษรซ้ำ');
}

// Sequential characters condition
if (config.noSequentialCharacters && /abc|123|789|XYZ/.test(request.newPassword)) {
  unmetConditions.push('ต้องไม่มีตัวอักษรที่เรียงกัน');
}

// No spaces condition
if (/\s/.test(request.newPassword)) {
  unmetConditions.push('ต้องไม่มีช่องว่าง');
}

// Latin characters only condition
if (/[^a-zA-Z0-9!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/.test(request.newPassword)) {
  unmetConditions.push('ต้องประกอบไปด้วยตัวอักษรละตินและสัญลักษณ์ที่อนุญาตเท่านั้น');
}

// Check if there are any unmet conditions
if (unmetConditions.length > 0) {
  // Create a list of unmet conditions with custom styles
  let conditionList = '<ul style="text-align: left; list-style-type: disc; padding-left: 20px;">';
  unmetConditions.forEach(condition => {
      conditionList += `<li>${condition}</li>`;
  });
  conditionList += '</ul>';

  response.message = `รหัสผ่านใหม่ไม่ตรงตามเงื่อนไขที่กำหนด:<br>${conditionList}`;

  if (step.export) {
      this.data[`export.${step.code}`] = response;
  }
  return response;
}



// If all conditions are met, proceed


        // If all conditions are met, proceed
          
          // Send request to changepwd endpoint if the password is valid
          const resAPIChangepwd = await Request.POST('changepwd', {
              newPassword: request.newPassword,
              requestId: request.requestId
          }, configs.key);
          
          console.log("resAPIChangepwd", resAPIChangepwd);

          // Handle response based on status and message
          if (resAPIChangepwd.data.status) { // Success
              response.status = true;
              response.message = 'Password changed successfully';
          } else { // Failure
              response.message = resAPIChangepwd.data.message;
          }
              
      } else {
          response.message = 'Invalid request';
      }
  } catch (error) {
      console.error('Error during password change process:', error);
      response.message = 'An error occurred during the password change process';
  }

  if (step.export) {
      this.data[`export.${step.code}`] = response;
  }

  return response;
}


  async handleStock(request) {
    try {
      if (request !== undefined) {
        await updateStock(request.product, request.mode, parseInt(request.volume));
      }
    } catch (error) {
      console.error('Error updating stock:', error);
    }
  }

  handleVisibility(request) {
    if (request && request.selector !== undefined && request.mode !== undefined) {
      this.toggleVisibility(request.selector, request.mode);
    }
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

      return {
        status: response.status === 200,
        ... result
      };
    } catch (error) {
      console.error('API Call Error:', error);
      return {
        status: false,
        data: null
      };
    }
  }
  
  displayText(selector, htmlContent) {
    const element = document.querySelector(selector);
    if (element) {
      element.innerHTML = htmlContent;
    } else {
      console.error(`Element with selector "${selector}" not found.`);
    }
  }

  toggleVisibility(selector, mode) {
    const element = document.querySelector(selector);
    if (element) {
      if (mode === 'show') {
        element.style.display = 'block';
      } else if (mode === 'hide') {
        element.style.display = 'none';
      } else {
        console.error(`Unknown mode: "${mode}". Use "show" or "hide".`);
      }
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
