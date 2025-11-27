// checkPath.js
export function checkPath(checkedItems, path) {
  const item = checkedItems.find(item => item.path === path);
  if (!item) {
    return false; // Return false if the item is not found (empty value)
  }
  return item.checked ? true : false; // Return the negation of the checked value
}
