<template>
    <div class="min-h-screen bg-white p-8" style="width: 8.27in; height: 11.69in; margin: 0 auto;">
      <!-- Top Section of the Header -->
      <header class="flex justify-between mb-4">
        <!-- Left Section (Logo and Company Address) -->
        <div class="flex">
          <!-- Logo -->
          <img src="https://vue-project.sgp1.digitaloceanspaces.com/Logo/color-logopng.png" alt="Logo" class="h-20" />
          
          <!-- Company Address -->
          <div class="ml-4 text-sm">
            <!-- Add your company address details here -->
            <p>Company Name</p>
            <p>Company Address</p>
            <p>City, State ZIP</p>
            <p>City, State ZIP</p>
          </div>
        </div>

        <div class="text-lg">
          <p><strong>ใบแจ้งชำระเงิน</strong></p>
          <p><strong>Bill Payment</strong></p>
        </div>
      </header>

      <header class="flex justify-between mb-8">
        <div>
          <h3 class="text-lg font-semibold">Customer Information</h3>
          <p><strong>Customer Name:</strong> John Doe</p>
          <p><strong>Address:</strong> 123 Main St, Cityville</p>
          <p><strong>Email:</strong> john@example.com</p>
        </div>
    
        <div>
          <p><strong>Date:</strong> January 15, 2023</p>
          <p><strong>Due Date:</strong> February 15, 2023</p>
        </div>
      </header>
  
      <!-- Billing Items Section -->
    <section>
        <h2 class="text-xl font-semibold mb-4">Billing Items</h2>
        <table class="w-full border">
          <thead>
            <tr class="border-b">
              <th class="py-2 border-r">Item</th>
              <th class="py-2 border-r">Description</th>
              <th class="py-2 border-r">Quantity</th>
              <th class="py-2 border-r">Unit Price</th>
              <th class="py-2">Total</th>
            </tr>
          </thead>
          <tbody>
            <!-- Repeat this section for each bill item -->
            <tr class="border-b">
              <td class="py-2 border-r">1</td>
              <td class="py-2 border-r">Product A</td>
              <td class="py-2 border-r">2</td>
              <td class="py-2 border-r">$50.00</td>
              <td class="py-2">$100.00</td>
            </tr>
            <tr class="border-b">
              <td class="py-2 border-r">2</td>
              <td class="py-2 border-r">Product B</td>
              <td class="py-2 border-r">3</td>
              <td class="py-2 border-r">$30.00</td>
              <td class="py-2">$90.00</td>
            </tr>
          </tbody>
        </table>
        <!-- Total -->
        <div class="mt-4 text-right">
            <p><strong>Total Amount:</strong> $190.00</p>
            <p><strong>Total Amount:</strong> $190.00</p>
          <p><strong>Total Amount:</strong> $190.00</p>
        </div>
  
        <!-- Discount Section -->
        <div class="mt-4">
          <h2 class="text-xl font-semibold">Discount</h2>
          <p>
            You have received a discount of $10.00 on this invoice.
          </p>
        </div>
      </section>

      <div class="my-4">
        <p class="text-lg font-semibold">Demo Text Description</p>
        <p>
          This is a demo invoice for demonstration purposes. Please do not use for actual payment. Payment details provided here are for illustration only.
        </p>
      </div>

      <section class="flex justify-between mt-4">
        <!-- Left Column (Barcode) -->
        <div class="w-1/2">
          <h2 class="text-xl font-semibold">Payment Barcode</h2>
          <!-- Payment Barcode Image -->
          <div class="mt-4">
            <!-- Barcode goes here -->
            <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSqgm0pULuBkg2fbjzEB5asMXFK4WvjlvsrXA&usqp=CAU" alt="Barcode" class="h-20" />
          </div>
        </div>
  
        <!-- Right Column (QR Code) -->
        <div class="w-1/2">
          <h2 class="text-xl font-semibold">Payment QR Code</h2>
          <!-- Payment QR Code Image -->
          <div class="mt-4">
            <!-- QR Code goes here -->
            <img src="https://d3pb9c7cezktlk.cloudfront.net/wp-content/uploads/2015/03/ticketing1.gif" alt="Barcode" class="h-20" />
          </div>
        </div>
      </section>

      <div class="my-4">
        <p class="text-lg font-semibold">Demo Text Description</p>
        <p>
          This is a demo invoice for demonstration purposes. Please do not use for actual payment. Payment details provided here are for illustration only.
        </p>
      </div>

    </div>
  </template>
  
  <script>
  export default {
    name: "MainLayout",
  };
  </script>
  
  <style scoped>
  /* Add your custom styles here */
  </style>
  