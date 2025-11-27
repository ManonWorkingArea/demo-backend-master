<template>
    <div>
      <h2>Survey Configuration</h2>
      <table>
        <tbody>
          <tr>
            <td><label for="surveyName">Survey Name:</label></td>
            <td><input type="text" id="surveyName" v-model="surveyData.surveyName" /></td>
          </tr>
          <tr>
            <td><label for="scoreLevels">Score Levels:</label></td>
            <td><input type="number" id="scoreLevels" v-model="surveyData.scoreConfig" min="1" /></td>
          </tr>
        </tbody>
      </table>

      <div v-for="(label, index) in scoreItemLabels" :key="index">
        <label for="scoreItemLabel">Score Item {{ index + 1 }} Label:</label>
        <input type="text" v-model="scoreItemLabels[index]" />
      </div>
  
      <h3>Choice Groups:</h3>
      <button @click="addChoiceGroup">Add Group</button>
      <div v-for="(choiceGroup, groupIndex) in surveyData.choiceGroups" :key="groupIndex" class="choice-group">
        <table>
          <tbody>
            <tr>
              <td><label for="groupName">Group Name:</label></td>
              <td><input type="text" v-model="choiceGroup.groupName" /></td>
              <td>
                <button @click="moveGroupUp(groupIndex)" :disabled="groupIndex === 0">Up</button>
                <button @click="moveGroupDown(groupIndex)" :disabled="groupIndex === surveyData.choiceGroups.length - 1">Down</button>
                <button @click="removeChoiceGroup(groupIndex)">Remove</button>
              </td>
            </tr>
          </tbody>
        </table>
        <h4>Choices:</h4>
        <button @click="addChoice(groupIndex)">Add Choice</button>
        <button @click="addTextareaChoice(groupIndex)">Add Text Area</button>
        <div v-for="(choice, choiceIndex) in choiceGroup.choices" :key="choiceIndex">
          <table>
            <tbody>
              <tr>
                <td><label for="choiceText">Choice Text:</label></td>
                <td><input type="text" v-model="choice.choiceText" /></td>
                <td>
                    <button @click="moveChoiceUp(groupIndex, choiceIndex)" :disabled="choiceIndex === 0">Up</button>
                    <button @click="moveChoiceDown(groupIndex, choiceIndex)" :disabled="choiceIndex === choiceGroup.choices.length - 1">Down</button>
                    <button @click="removeChoice(groupIndex, choiceIndex)">Remove</button></td>
                <td>
                  <label for="isRequested">*:</label>
                  <input type="checkbox" v-model="choice.isRequested" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <button @click="saveSurveyConfig">Save Survey</button>
      <SurveyResult :surveyData="surveyData" :scoreItemLabels="scoreItemLabels" :surveyResults="surveyResults" @save-result="saveSurveyResult" />
      <pre>{{ surveyResults }}</pre>
    </div>
  </template>
  
  <script>
  import SurveyResult from './resource/SurveyResult.vue'; // Adjust the path as needed
  
  export default {
    data() {
      return {
        surveyData: {
          surveyName: "",
          scoreConfig: 0,
          choiceGroups: [],
        },
        surveyResults: [],
        scoreItemLabels: [],
      };
    },
    watch: {
        'surveyData.scoreConfig': function(newConfig) {
            // Initialize the score item labels array with empty strings
            this.scoreItemLabels = Array.from({ length: newConfig }, () => "");
        },
    },
    components: {
      SurveyResult
    },
    methods: {
      addChoiceGroup() {
        this.surveyData.choiceGroups.push({
          groupName: "",
          choices: [],
        });
      },
      addChoice(groupIndex) {
        this.surveyData.choiceGroups[groupIndex].choices.push({
          choiceText: "",
          type: "radio", // Default to radio input
          choiceValue: null, // Initialize choiceValue
          isRequested: false,
        });
      },
      addTextareaChoice(groupIndex) {
        this.surveyData.choiceGroups[groupIndex].choices.push({
          choiceText: "",
          type: "textarea", // Set to textarea input
          choiceValue: null, // Initialize choiceValue
          isRequested: false,
        });
      },
      removeChoiceGroup(groupIndex) {
        this.surveyData.choiceGroups.splice(groupIndex, 1);
      },
      removeChoice(groupIndex, choiceIndex) {
        this.surveyData.choiceGroups[groupIndex].choices.splice(choiceIndex, 1);
      },
      moveGroupUp(groupIndex) {
        if (groupIndex > 0) {
          const tempGroup = this.surveyData.choiceGroups[groupIndex];
          this.surveyData.choiceGroups.splice(groupIndex, 1);
          this.surveyData.choiceGroups.splice(groupIndex - 1, 0, tempGroup);
        }
      },
      moveGroupDown(groupIndex) {
        if (groupIndex < this.surveyData.choiceGroups.length - 1) {
          const tempGroup = this.surveyData.choiceGroups[groupIndex];
          this.surveyData.choiceGroups.splice(groupIndex, 1);
          this.surveyData.choiceGroups.splice(groupIndex + 1, 0, tempGroup);
        }
      },
      moveChoiceUp(groupIndex, choiceIndex) {
        if (choiceIndex > 0) {
            const tempChoice = this.surveyData.choiceGroups[groupIndex].choices[choiceIndex];
            this.surveyData.choiceGroups[groupIndex].choices.splice(choiceIndex, 1);
            this.surveyData.choiceGroups[groupIndex].choices.splice(choiceIndex - 1, 0, tempChoice);
        }
        },
        moveChoiceDown(groupIndex, choiceIndex) {
        if (choiceIndex < this.surveyData.choiceGroups[groupIndex].choices.length - 1) {
            const tempChoice = this.surveyData.choiceGroups[groupIndex].choices[choiceIndex];
            this.surveyData.choiceGroups[groupIndex].choices.splice(choiceIndex, 1);
            this.surveyData.choiceGroups[groupIndex].choices.splice(choiceIndex + 1, 0, tempChoice);
        }
        },
      saveSurveyConfig() {
        console.log(this.surveyData);
      },
      saveSurveyResult(result) {
        this.surveyResults = result;
        console.log("Survey Result Saved:", result);
      },
    },
  };
  </script>
  
  <style scoped>
  /* Style the container div */
  div {
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    padding: 5px;
  }
  
  /* Style the headings */
  h2 {
    font-size: 24px;
    margin-bottom: 20px;
  }
  
  h3 {
    font-size: 20px;
    margin-top: 30px;
    margin-bottom: 10px;
  }
  
  h4 {
    font-size: 16px;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  
  /* Style the table */
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 10px;
    border: 1px solid #ccc;
    text-align: left;
  }
  
  /* Style the input fields */
  input[type="text"], input[type="number"], input[type="checkbox"] {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    margin-top: 4px;
    margin-bottom: 8px;
  }
  
  /* Style the buttons */
  button {
    padding: 8px 16px;
    background-color: #007BFF;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    margin-right: 10px;
  }
  
  button:hover {
    background-color: #0056b3;
  }
  
  /* Style the choice groups and choices */
  .choice-group {
    margin-top: 20px;
    padding: 10px;
    background-color: #f5f5f5;
  }
  
  .choice-group input[type="text"] {
    margin-bottom: 4px;
  }
  
  /* Style the SurveyResult component if needed */
  /* .survey-result {
    // Add styles for the SurveyResult component here
  } */
  </style>
  