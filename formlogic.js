// formLogic.js

// List of keywords to be replaced in field names
const replacementKeywords = ['_systemfield_', '_example_', '_replace_'];

// Normalize field names by converting to lowercase and replacing dashes and underscores
function normalizeFieldName(name) {
  return name.toLowerCase().replace(/[-_]/g, '');
}

// Function to get the label text associated with an input field
function getLabelText(input) {
  let label = document.querySelector(`label[for="${input.id}"]`);
  return label ? label.textContent.trim() : '';
}

// Match form field with JSON keys using normalization and includes operator
function findMatchingKeys(name, label, formData) {
  console.log("formData", formData);
  const normalizedFieldName = normalizeFieldName(name);
  const normalizedLabel = normalizeFieldName(label);
  const matchingKeys = [];

  // Iterate over formData keys to find matches in the field name or label
  for (const key in formData) {
    if (normalizedFieldName.includes(normalizeFieldName(key)) || normalizedLabel.includes(normalizeFieldName(key))) {
      matchingKeys.push(key);
    }
  }

  // Apply specific rules by replacing keywords in the field name or label
  replacementKeywords.forEach(keyword => {
    if (name.includes(keyword)) {
      const specificMatch = name.replace(new RegExp(keyword, 'g'), '');
      for (const key in formData) {
        if (normalizeFieldName(key) === normalizeFieldName(specificMatch)) {
          matchingKeys.push(key);
        }
      }
    }
    if (label.includes(keyword)) {
      const specificMatch = label.replace(new RegExp(keyword, 'g'), '');
      for (const key in formData) {
        if (normalizeFieldName(key) === normalizeFieldName(specificMatch)) {
          matchingKeys.push(key);
        }
      }
    }
  });

  return matchingKeys;
}

// Expose functions globally
window.formLogic = {
  normalizeFieldName,
  getLabelText,
  findMatchingKeys
};
