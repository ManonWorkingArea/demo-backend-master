export const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    /* Add your custom CSS styles here */
    /* For example: */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      text-align: center;
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.5;
      background-color: #f2f2f2;
      color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0px auto;
      padding: 20px;
      background-color: #ffffff;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      margin-bottom: 20px;
    }
    .header img {
      max-width: 150px;
      height: auto;
    }
    .content {
      padding: 20px;
      border-top: 1px solid #e6e6e6;
      border-bottom: 1px solid #e6e6e6;
    }
    .heading {
      font-size: 18px;
      margin-bottom: 20px;
      color: #000000;
      text-align: center;
    }
    .text {
      margin-bottom: 20px;
      color: #000000;
      text-align: left;
      font-size: 16px;
    }
    .container p {
      margin-bottom: 20px;
      color: #000000;
      text-align: left;
      font-size: 16px;
    }
    .text p {
      margin-bottom: 20px;
      color: #000000;
      text-align: left;
      font-size: 16px;
    }
    .footer {
      text-align: center;
      margin-top: 20px;
      color: #888888;
      font-size: 14px;
    }
    .footer a {
      color: #888888;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    .footer a:hover {
      color: #ffffff;
    }
  </style>
</head>
<body>
  <div class="container" style="margin-top:20px;">
    <div class="header">
      <img src="https://vue-project.sgp1.digitaloceanspaces.com/Logo/color-logopng.png" alt="Logo">
    </div>
    <div class="content">
      <h2 class="heading">{{ subject }}</h2>
      <p class="text">{{ content }}</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} {{ provider }}. All rights reserved.</a>
    </div>
  </div>
</body>
</html>
`;
