import storageManager from '@/plugins/storage';
import requestClient from '@/plugins/requestClient';
import Flow from '@/extensions/modules/system/setup/component/flow/Flow.js'; // Ensure this path is correct

const Request = new requestClient(false);
const configs = storageManager.get('configs');

// Fetch flow by ID
const fetchFlowById = async (flowId) => {
  try {
    const response = await Request.GET(`flow/${flowId}`, configs.key, true);
    if (response.status === 200) {
      return response.data;
    }
    throw new Error('Failed to fetch flow by ID');
  } catch (error) {
    console.error('Error fetching flow by ID:', error);
    throw error;
  }
};

// Execute flow by ID and initial data
const doFlow = async (flowId, initialData) => {
  try {
    const flowData = await fetchFlowById(flowId);
    const flow = new Flow(flowData.steps);
    await flow.run(initialData); // Ensure this method returns a Promise
  } catch (error) {
    console.error('Error executing flow:', error);
    throw error;
  }
};

export {
  doFlow // Export the doFlow function
};
