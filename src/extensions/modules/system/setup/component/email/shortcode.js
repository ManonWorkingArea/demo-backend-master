export function replaceShortcodes(text, data) {
    return text.replace(/\[([a-zA-Z_]+)\]/g, (match, p1) => data[p1] || match);
  }
  
  export function replaceShortcodesWithConfig(text, data) {
    const placeholders = {
      sitename: 'Your Site Name',
      customer_name: data.name,
      customer_email: data.email
    };
  
    return replaceShortcodes(text, placeholders);
  }
  