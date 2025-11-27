<template>
    <div>
      <h2 class="text-lg font-semibold mb-2">Global Rounds</h2>
      <input v-model="newRoundName" placeholder="Enter round name" class="border p-2 mr-2" />
      <button @click="addRound" class="bg-blue-500 text-white px-4 py-2 rounded">Add Round</button>
  
      <ul class="mt-2">
        <li v-for="(round, index) in rounds" :key="index" class="p-2 border-b">
          {{ round.name }}
          <label class="flex items-center mb-2">
            <input type="checkbox" v-model="round.StartDateUsed" class="mr-2" />
            Use Start Date
          </label>
          <CustomDateTimePicker v-if="round.StartDateUsed" v-model="round.StartDate" />
  
          <label class="flex items-center mb-2">
            <input type="checkbox" v-model="round.EndDateUsed" class="mr-2" />
            Use End Date
          </label>
          <CustomDateTimePicker v-if="round.EndDateUsed" v-model="round.EndDate" />
  
          <button @click="removeRound(index)" class="ml-2 text-red-500">Remove</button>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import CustomDateTimePicker from './CustomDateTimePicker.vue';
  
  export default {
    components: {
      CustomDateTimePicker,
    },
    props: {
      rounds: Array,
    },
    data() {
      return {
        newRoundName: '',
      };
    },
    methods: {
      addRound() {
        if (!this.newRoundName.trim()) return;
        const newRound = {
          name: this.newRoundName.trim(),
          StartDate: '',
          EndDate: '',
          StartDateUsed: false,
          EndDateUsed: false,
        };
        this.$emit('add-round', newRound);
        this.$emit('update-rounds', [...this.rounds, newRound]);
        this.newRoundName = '';
      },
      removeRound(index) {
        this.$emit('remove-round', index);
        const updatedRounds = this.rounds.filter((_, i) => i !== index);
        this.$emit('update-rounds', updatedRounds);
      },
    },
  };
  </script>
  