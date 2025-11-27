export const emailTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Template</title>
  <style>
    /* Add your custom CSS styles here */
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      line-height: 1.5;
      background-color: #e5e5e5;
      color: #000000;
      text-align: center;
    }
    .container {
      max-width: 600px;
      margin: 10px auto;
      padding: 10px;
      background-color: #ffffff;
      border-radius: 5px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .header div {
      flex: 1;
      text-align: center;
    }
    .header .left,
    .header .right {
      flex: 1;
    }
    .header .center {
      flex: 1;
      display: flex;
      justify-content: center;
    }
    .header img {
      max-width: 150px;
      height: auto;
    }
    .subheader {
      width: 100%;
      margin-top: 10px;
      display: block;
      text-align: center;
      color: #888888;
    }
    .content {
      padding: 20px;
      border-top: 1px solid #e6e6e6;
      border-bottom: 1px solid #e6e6e6;
    }
    .heading {
      font-size: {{ headingFontSize }}px;
      margin-bottom: 20px;
      color: #000000;
      text-align: {{ headingAlignment }};
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
      margin-top: 10px;
      color: #888888;
      font-size: 14px;
    }
    .footer a {
      color: #888888;
      text-decoration: none;
      transition: color 0.3s ease;
    }
    .footer a:hover {
      color: #000000;
    }
.footer-columns {
        display: flex;
        justify-content: space-around;
        border-bottom: 1px solid #e6e6e6;
        padding-bottom: 5px;
        margin-bottom: 10px;
    }
    .banner {
      width: 100%;
      height: auto;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="left" id="logo-left"></div>
      <div class="center" id="logo-center"></div>
      <div class="right" id="logo-right"></div>
    </div>
    {{ banner }}
    <div class="content">
      
      <h2 class="heading">{{ subject }}</h2>
      <p class="text">{{ content }}</p>
    </div>
    <div class="footer">
      <div class="footer-columns">
        <div>{{ footerColumn1 }}</div>
        <div>{{ footerColumn2 }}</div>
        <div>{{ footerColumn3 }}</div>
      </div>
      &copy; ${new Date().getFullYear()} {{ footerText }}
    </div>
  </div>
</body>
</html>
`;

export function generateHtmlEmail(config, data) {
  const {
    logoUrl,
    logoAlignment,
    bannerImageUrl,
    bannerUrl,
    subheader,
    footerText,
    footerColumns,
    headingAlignment,
    headingFontSize
  } = config;

  let banner = '';
  if (bannerImageUrl) {
    banner = `<a href="${bannerUrl || '#'}"><img src="${bannerImageUrl}" alt="Banner" class="banner"></a>`;
  }

  let template = emailTemplate
    .replace('{{ banner }}', banner)
    .replace('{{ subheader }}', subheader)
    .replace('{{ subject }}', data.subject)
    .replace('{{ content }}', data.content)
    .replace('{{ footerText }}', footerText)
    .replace('{{ footerColumn1 }}', footerColumns[0] || '')
    .replace('{{ footerColumn2 }}', footerColumns[1] || '')
    .replace('{{ footerColumn3 }}', footerColumns[2] || '')
    .replace('{{ headingAlignment }}', headingAlignment || 'left')
    .replace('{{ headingFontSize }}', headingFontSize || 18);

  // Add the logo and subheader based on the logoAlignment
  if (logoAlignment === 'left') {
    template = template
      .replace('<div class="left" id="logo-left"></div>', `<div class="left"><img src="${logoUrl}" alt="Logo"></div>`)
      .replace('<div class="right" id="logo-right"></div>', `<div class="right subheader">${subheader}</div>`);
  } else if (logoAlignment === 'center') {
    template = template
      .replace('<div class="center" id="logo-center"></div>', `<div class="center"><img src="${logoUrl}" alt="Logo"></div>`)
      .replace('<div class="subheader">{{ subheader }}</div>', `<div class="subheader">${subheader}</div>`);
  } else if (logoAlignment === 'right') {
    template = template
      .replace('<div class="right" id="logo-right"></div>', `<div class="right"><img src="${logoUrl}" alt="Logo"></div>`)
      .replace('<div class="left" id="logo-left"></div>', `<div class="left subheader">${subheader}</div>`);
  }

  return template;
}
