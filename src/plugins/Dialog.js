const createDialog = (options) => {

  const confirmIcon = require('@/assets/images/success-tick.svg');
  const cancelIcon = require('@/assets/images/error.svg');

  const overlay = document.createElement('div');
  overlay.className = `fixed top-0 left-0 w-full h-full bg-opacity-50 bg-black flex justify-center items-center z-50`;
  
  const dialog = document.createElement('div');
  dialog.className = `bg-white rounded-lg max-w-md md:w-3/5 w-full`;

  const header = document.createElement('div');
  header.classList.add('border-b', 'border-gray-200', 'py-2');
  const title = document.createElement('h2');
  title.textContent = options.title || 'Confirm';
  title.classList.add('text-xl', 'font-bold', 'text-center');
  header.appendChild(title);

  const content = document.createElement('div');
  content.classList.add('border-b', 'border-gray-200', 'p-4');
  const message = document.createElement('p');
  message.classList.add('text-gray-500','text-center');
  message.textContent = options.message || '';
  content.appendChild(message);

  const footer = document.createElement('div');
  footer.classList.add('p-2', 'text-center');

  const addButton = (text, className, clickHandler, iconSrc, iconWidth, invert) => {
    const button = document.createElement('button');
    button.innerHTML = `
      <span style="display: inline-flex; align-items: center; margin-right: 8px;">
        <img src="${iconSrc}" alt="${text}" style="margin-right:5px; width: ${iconWidth}px; filter: invert(${invert});">
        ${text}
      </span>
    `;
    button.classList.add(
      'mr-2',
      'rounded-md',
      'border',
      'border-transparent',
      className,
      'pt-[10px]',
      'pl-[10px]',
      'pr-[10px]',
      'pb-[7px]',
      'text-sm',
      'font-medium',
      'shadow-sm'
    );
    if (className.includes('bg-indigo-600')) {
      button.classList.add('text-white', 'hover:bg-indigo-700');
    }
    button.onclick = () => {
      clickHandler();
      document.body.removeChild(overlay);
    };
    footer.appendChild(button);
  };
  
  addButton('ตกลง', 'bg-indigo-600', options.onConfirm || options.confirm, confirmIcon, 15, 1);
  if (options.showCancel && (options.onCancel || options.cancel)) {
    addButton('ยกเลิก', 'bg-gray-200', options.onCancel || options.cancel, cancelIcon, 15, 0);
  }

  dialog.appendChild(header);
  dialog.appendChild(content);
  dialog.appendChild(footer);
  overlay.appendChild(dialog);

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.classList.add('fade-out');
  }, 0);
};

const dialog = {
  confirm: (options) => {
    options.showCancel = true;
    // ถ้าไม่มี cancel function ให้ใส่ function เปล่า
    if (!options.cancel && !options.onCancel) {
      options.cancel = () => {};
    }
    createDialog(options);
  },
  prompt: (options) => {
    options.cancel = () => {};
    options.showCancel = false;
    createDialog(options);
  },
};

export default dialog;