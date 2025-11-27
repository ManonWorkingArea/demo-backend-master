// Simulated API responses for demonstration purposes
const mockApiResponse = {
    changeStatus: { success: true, message: "Status changed successfully" },
    executeCommand: { success: true, message: "Command executed successfully" },
    executeAction: { success: true, message: "Action executed successfully" },
    callApi: { success: true, message: "API called successfully" },
  };
  
  // Helper function to simulate an API call
  const callApi = (endpoint, requestBody) => {
    console.log(`Calling API Endpoint: ${endpoint}`, requestBody);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simplification for example purposes; you'd typically make a real API call here.
        if (mockApiResponse[endpoint]) {
          resolve(mockApiResponse[endpoint]);
        } else {
          reject(`API Endpoint ${endpoint} not found.`);
        }
      }, 1000); // Simulate network delay
    });
  };
  
  const workflowFunctions = {
    executeTask: async function(actionTask, index, demoData, matchedWorkItemStatuses, executeCommand, changeStatus, executeRespond, executeAction) {
      console.log(`Executing task for item at index ${index}:`, actionTask);
      for (let task of actionTask.tasks) {
        switch (task.action) {
            case "executeCommand": {
              // Enclose case block in curly braces
              await executeCommand(task.command, task.mapping, index, demoData);
              break;
            }
            case "changeStatus": {
              // Enclose case block in curly braces
              const status = matchedWorkItemStatuses(demoData[index].flow).find(status => status.id === task.statusId);
              if (status) await changeStatus(status.name, index, demoData);
              else console.error("Status not found for ID:", task.statusId);
              break;
            }
            case "respond": {
              // Enclose case block in curly braces
              await executeRespond(task.command, task.mapping, index, demoData);
              break;
            }
            default: {
              // Enclose default case in curly braces if needed
              await executeAction(task.action, task.command, task.dataKey, index, demoData);
              break;
            }
          }
          
      }
    },
  
    executeCommand: async function(command, mapping, index, demoData) {
      const requestBody = {};
      for (const key in mapping) {
        const dataKey = mapping[key];
        requestBody[key] = demoData[index][dataKey];
      }
      await callApi(command, requestBody);
    },
  
    executeAction: async function(action, command, dataKey, index, demoData) {
      const data = demoData[index][dataKey];
      console.log(`Executing action: ${action} with command: ${command} and data:`, data);
      await callApi(command, data);
    },
  
    changeStatus: async function(newStatus, index, demoData) {
      demoData[index].status = newStatus;
      console.log(`Changed status of item at index ${index} to ${newStatus}`);
      // Simulate a status change call to an API or internal logic
      await callApi('changeStatus', { newStatus });
    },
  
    executeRespond: async function(command, mapping, index, demoData) {
      const response = await callApi(command, {});
      for (const key in mapping) {
        const responseKey = mapping[key];
        demoData[index][key] = response[responseKey];
      }
    },
  
    simulateApiCall: async function(endpoint) {
      // This function wraps callApi for use where a direct simulation is necessary
      return await callApi(endpoint, {});
    }
  };
  
  export default workflowFunctions;
  