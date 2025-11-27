// FlowPrompt.js

export function customPrompt(message, isPrompt) {
    return new Promise(resolve => {
      const promptContainer = document.createElement('div');
      promptContainer.style.position = 'fixed';
      promptContainer.style.top = '0';
      promptContainer.style.left = '0';
      promptContainer.style.width = '100%';
      promptContainer.style.height = '100%';
      promptContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
      promptContainer.style.display = 'flex';
      promptContainer.style.justifyContent = 'center';
      promptContainer.style.alignItems = 'center';
      promptContainer.style.zIndex = '9999';
  
      const promptBox = document.createElement('div');
      promptBox.style.backgroundColor = 'white';
      promptBox.style.padding = '20px';
      promptBox.style.borderRadius = '8px';
      promptBox.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      promptBox.style.textAlign = 'center';
      promptBox.style.width = '300px';
      promptBox.style.maxWidth = '80%';
  
      const messageElement = document.createElement('p');
      messageElement.innerHTML = message;
      messageElement.style.marginBottom = '20px';
      promptBox.appendChild(messageElement);
  
      const buttonsContainer = document.createElement('div');
      buttonsContainer.style.display = 'flex';
      buttonsContainer.style.justifyContent = 'center';
  
      if (isPrompt) {
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.style.marginRight = '10px';
        okButton.style.padding = '10px 20px';
        okButton.style.border = 'none';
        okButton.style.borderRadius = '5px';
        okButton.style.backgroundColor = '#007bff';
        okButton.style.color = 'white';
        okButton.style.cursor = 'pointer';
        okButton.addEventListener('click', () => {
          document.body.removeChild(promptContainer);
          resolve(true);
        });
  
        const cancelButton = document.createElement('button');
        cancelButton.textContent = 'Cancel';
        cancelButton.style.padding = '10px 20px';
        cancelButton.style.border = 'none';
        cancelButton.style.borderRadius = '5px';
        cancelButton.style.backgroundColor = '#6c757d';
        cancelButton.style.color = 'white';
        cancelButton.style.cursor = 'pointer';
        cancelButton.addEventListener('click', () => {
          document.body.removeChild(promptContainer);
          resolve(false);
        });
  
        buttonsContainer.appendChild(okButton);
        buttonsContainer.appendChild(cancelButton);
      } else {
        const okButton = document.createElement('button');
        okButton.textContent = 'OK';
        okButton.style.padding = '10px 20px';
        okButton.style.border = 'none';
        okButton.style.borderRadius = '5px';
        okButton.style.backgroundColor = '#007bff';
        okButton.style.color = 'white';
        okButton.style.cursor = 'pointer';
        okButton.addEventListener('click', () => {
          document.body.removeChild(promptContainer);
          resolve();
        });
  
        buttonsContainer.appendChild(okButton);
      }
  
      promptBox.appendChild(buttonsContainer);
      promptContainer.appendChild(promptBox);
      document.body.appendChild(promptContainer);
    });
  }
  