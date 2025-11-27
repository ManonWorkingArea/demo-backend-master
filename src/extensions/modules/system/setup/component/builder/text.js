export function editText(selector) {
    return {
      data() {
        return {
          showPopup: false,
          editingText: '',
          originalElement: null,
          editableText: []
        }
      },
      methods: {
        // Method to add the "Edit" buttons to the editable text elements
        addEditButtons() {
          // Create a MutationObserver to monitor the element for changes to its text content
          const observer = new MutationObserver(mutations => {
            for (const mutation of mutations) {
              if (mutation.type === 'characterData') {
                // The text content of the element has changed, so update the edit button
                this.updateEditButton();
              }
            }
          });
  
          // Get all elements matching the selector
          const editElements = document.querySelectorAll(selector);
  
          // Loop through the edit elements
          for (const element of editElements) {
            // Observe the element for changes to its text content
            observer.observe(element, { characterData: true });
  
            // Update the edit button for the element
            this.updateEditButton(element);
          }
        },
  
        // Method to update the "Edit" button for a single editable text element
        updateEditButton(element) {
          // Store the original contents of the element
          const originalText = element.innerText;
  
          // Check if the element already has an edit button
          let button = element.querySelector('button');
          if (!button) {
            // Create a button element
            button = document.createElement('button');
            button.innerText = 'Edit';
          }
  
          // Add a click event listener to the button that shows the edit popup
          button.addEventListener('click', () => {
            this.editingText = originalText;
            this.originalElement = element;
            this.showPopup = true;
            this.showTextPopup = true;
        });
  
          // Append the button to the element
          element.appendChild(button);
  
          // Add the element to the editable text array
          this.editableText.push(element);
        },
  
        // Method to save the edited text for a single editable text element
        saveEditingText() {
            this.originalElement.innerText = this.editingText;
          
            // Check if the htmlContainer ref is defined
            if (this.$parent.$refs.htmlContainer) {
              // Get the HTML string from the v-html directive
              this.$parent.htmlContent = this.$parent.$refs.htmlContainer.innerHTML;
            }
          
            // Add the edit buttons again
            this.addEditButtons();
          
            // Hide the edit text popup and reset the showTextPopup property
            this.showPopup = false;
            this.showTextPopup = false;
            this.editingText = '';
          }
          
      }
    }
  }
  