// tailwind-utils.js
export function markTailwind(className) {
    switch (className) {
      case 'input-plaintext':
        return 'pl-0 focus:outline-none focus:ring-0 shadow-none border-0';

      case 'primary-btn':
      return 'px-4 py-2 text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-50';

      case 'icon-btn':
      return 'px-4 py-2 text-gray-700 bg-transparent hover:bg-transparent hover:text-gray-800';
      
      case 'default-btn':
      return 'px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 focus:ring-offset-gray-50';

      case 'danger-btn':
      return 'px-4 py-2 text-white bg-red-600 rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-50';

      case 'success-btn':
      return 'px-4 py-2 text-white bg-green-600 rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-50';

      default:
      return '';
    }
  }
  