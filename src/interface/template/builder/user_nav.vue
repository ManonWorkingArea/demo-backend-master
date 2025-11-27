<template>
    <div class="user-profile-actions flex items-center justify-end space-x-4">
      <button @click="editProfile" class="btn btn-edit px-4 py-2 bg-blue-500 text-white rounded-lg">
        Edit Profile
      </button>

      <button @click="logout" class="btn btn-logout px-4 py-2 bg-red-500 text-white rounded-lg">
        Logout
      </button>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        mockData: {
          avatar: 'https://doa-academy.sgp1.digitaloceanspaces.com/upload/1721201928175-8123610343.jpg',
          name: 'นิรันดร์ จันทร์ดี',
          email: 'Usa26a@gmail.com',
          role: 'User'
        }
      };
    },
    methods: {
      editProfile() {
        // Logic to edit the profile
        alert("Edit Profile clicked");
      },
      changePassword() {
        // Logic to change the password
        alert("Change Password clicked");
      },
      logout() {
        // Logic to logout the user
        alert("Logout clicked");
      }
    }
  };
  </script>
  
  <style scoped>
  .user-profile-actions {
    padding: 1rem;
    background-color: transparent; /* No background */
  }
  
  .btn {
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .btn-edit:hover {
    background-color: #2563eb; /* Darker blue on hover */
  }
  
  .btn-logout:hover {
    background-color: #b91c1c; /* Darker red on hover */
  }
  </style>
  