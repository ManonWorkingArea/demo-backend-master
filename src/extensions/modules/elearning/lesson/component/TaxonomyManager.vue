          const groupData = {
            type: 'group',
            name: taxonomyGroupForm.value.name.trim(),
            code: taxonomyGroupForm.value.code?.trim() || '',
            description: taxonomyGroupForm.value.description?.trim() || '',
            active: taxonomyGroupForm.value.active !== false,
            fieldConfig: taxonomyGroupForm.value.fieldConfig || [],
            contentTypes: taxonomyGroupForm.value.contentTypes || [], // Save content types
            selectionMode: taxonomyGroupForm.value.selectionMode || 'multiple', // Save selection mode
            selectionLimit: taxonomyGroupForm.value.selectionMode === 'limited' 
              ? (taxonomyGroupForm.value.selectionLimit || 3) 
              : null // Save selection limit only for limited mode
          } 

      const closeTaxonomyModal = () => {
        showTaxonomyModal.value = false
        editingTaxonomyGroup.value = null
        selectedTaxonomyModalTab.value = 'basic' // Reset tab when closing
        taxonomyGroupForm.value = { 
          name: '', 
          code: '', 
          description: '', 
          active: true, 
          fieldConfig: [],
          contentTypes: [], // Reset content types
          selectionMode: 'multiple', // Reset selection mode
          selectionLimit: 3 // Reset selection limit
        }
      } 