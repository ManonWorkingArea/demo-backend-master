<template>
    <ul class="absolute">
      <li v-for="(classItem, index) in classes" :class="classItem" :key="index"></li>
    </ul>
  </template>
  
  <script>
  export default {
    data() {
      return {
        classes: [
          // Text Color Classes
          "text-green-500", "text-green-600", "text-green-700", "text-green-800", "text-green-900",
          "text-red-500", "text-red-600", "text-red-700", "text-red-800", "text-red-900",
          "text-yellow-500", "text-yellow-600", "text-yellow-700", "text-yellow-800", "text-yellow-900",
          "text-pink-500", "text-pink-600", "text-pink-700", "text-pink-800", "text-pink-900",
          "text-blue-300", "text-blue-400", "text-blue-500", "text-blue-600", "text-blue-700",
          "text-indigo-500", "text-indigo-600", "text-indigo-700", "text-indigo-800", "text-indigo-900",
          "text-purple-500", "text-purple-600", "text-purple-700", "text-purple-800", "text-purple-900",
          "text-orange-500", "text-orange-600", "text-orange-700", "text-orange-800", "text-orange-900",
          "text-teal-500", "text-teal-600", "text-teal-700", "text-teal-800", "text-teal-900",
          "text-gray-500", "text-gray-600", "text-gray-700", "text-gray-800", "text-gray-900",
          // Border Color Classes
          "border-green-500", "border-green-600", "border-green-700", "border-green-800", "border-green-900",
          "border-red-500", "border-red-600", "border-red-700", "border-red-800", "border-red-900",
          "border-yellow-500", "border-yellow-600", "border-yellow-700", "border-yellow-800", "border-yellow-900",
          "border-pink-500", "border-pink-600", "border-pink-700", "border-pink-800", "border-pink-900",
          "border-blue-300", "border-blue-400", "border-blue-500", "border-blue-600", "border-blue-700",
          "border-indigo-500", "border-indigo-600", "border-indigo-700", "border-indigo-800", "border-indigo-900",
          "border-purple-500", "border-purple-600", "border-purple-700", "border-purple-800", "border-purple-900",
          "border-orange-500", "border-orange-600", "border-orange-700", "border-orange-800", "border-orange-900",
          "border-teal-500", "border-teal-600", "border-teal-700", "border-teal-800", "border-teal-900",
          "border-gray-500", "border-gray-600", "border-gray-700", "border-gray-800", "border-gray-900",
          // Background Color Classes
          "bg-green-500", "bg-green-600", "bg-green-700", "bg-green-800", "bg-green-900",
          "bg-red-500", "bg-red-600", "bg-red-700", "bg-red-800", "bg-red-900",
          "bg-yellow-500", "bg-yellow-600", "bg-yellow-700", "bg-yellow-800", "bg-yellow-900",
          "bg-pink-500", "bg-pink-600", "bg-pink-700", "bg-pink-800", "bg-pink-900",
          "bg-blue-300", "bg-blue-400", "bg-blue-500", "bg-blue-600", "bg-blue-700",
          "bg-indigo-500", "bg-indigo-600", "bg-indigo-700", "bg-indigo-800", "bg-indigo-900",
          "bg-purple-500", "bg-purple-600", "bg-purple-700", "bg-purple-800", "bg-purple-900",
          "bg-orange-500", "bg-orange-600", "bg-orange-700", "bg-orange-800", "bg-orange-900",
          "bg-teal-500", "bg-teal-600", "bg-teal-700", "bg-teal-800", "bg-teal-900",
          "bg-gray-500", "bg-gray-600", "bg-gray-700", "bg-gray-800", "bg-gray-900",
        ]
      };
    },
  };
  </script>
  