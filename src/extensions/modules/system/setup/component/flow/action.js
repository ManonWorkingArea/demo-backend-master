// action.js

export const actionGroups = [
  {
    name: 'Basic',
    actions: [
      { name: 'HTTP', config: true, code: 'http', component: 'Http', request: { text: '' } },
      { name: 'Reload', config: false, code: 'reload', component: 'Default' },
      { name: 'Continue', config: false, code: 'continue', component: 'Default' },
      { name: 'Stop', config: false, code: 'stop', component: 'Default' },
      { name: 'Debug', config: true, code: 'debug', component: 'Debug', request: { text: '' } },
    ]
  },
  {
    name: 'Time-based',
    actions: [
      { name: 'Wait', config: true, code: 'wait', component: 'Wait', request: { seconds: 0 } },
    ]
  },
  {
    name: 'Communication',
    actions: [
      { name: 'Call', config: true, code: 'call', component: 'Call', request: { url: '', data: '', method: '' } },
      { name: 'Request', config: true, code: 'request', component: 'Request', request: { endpoint: '', data: '', method: '' } },
      { name: 'Email', config: true, code: 'email', component: 'Email', request: { email: '', subject: '', body: '' } },
      { name: 'Goto', config: true, code: 'goto', component: 'Goto', request: { routeOrUrl: '', target: 'self' } },
    ]
  },
  {
    name: 'UI',
    actions: [
      { name: 'Alert', config: true, code: 'alert', component: 'Alert', request: { text: '' } },
      { name: 'Prompt', config: true, code: 'prompt', component: 'Prompt', request: { text: '' } },
      { name: 'Display', config: true, code: 'display', component: 'Display', request: { selector: '', text: '' } },
      { name: 'Visible', config: true, code: 'visible', component: 'Visible', request: { selector: '', mode: '' } },
    ]
  },
  {
    name: 'Shop',
    actions: [
      { name: 'Stock', config: true, code: 'stock', component: 'Stock', request: { product: '', volume: '', mode: '' } },
    ]
  },
  {
    name: 'Built-in',
    actions: [
      { name: 'Prompt', config: true, code: 'prompt', component: 'Prompt', request: { text: '' } },
      { name: 'Condition', config: true, code: 'condition', component: 'Condition', request: { text: '' } },
      { name: 'Login', config: true, code: 'login', component: 'Login', request: { username: '', password: '' } },
      { name: 'Register', config: true, code: 'register', component: 'Default', request: { firstname: '', lastname: '', email: '', phone: '', username: '', password: '', info: [] } },
      { name: 'Forgot Password', config: true, code: 'forgot', component: 'Forgot', request: { email: '' } },
      { name: 'Change Password', config: true, code: 'changepwd', component: 'Changepwd', request: { newPassword: '', requestId: '', generatedRegex: '', passwordConfig: [] } },
    ]
  }
];
