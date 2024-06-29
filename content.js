// content.js

console.log('Content script started');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fillForm") {
    console.log('Received fill form request');
    chrome.storage.local.get('formData', ({ formData }) => {
      console.log('Retrieved form data from storage:', formData);
      const formFields = document.querySelectorAll('input, textarea, select');
      const filledFields = [];
      const allFields = [];

      formFields.forEach(field => {
        const name = field.name || field.id;
        const label = window.formLogic.getLabelText(field);
        allFields.push({ name, label });
        const matchingKeys = window.formLogic.findMatchingKeys(name, label, formData);
        let fieldFilled = false;
        for (const key of matchingKeys) {
          if (formData[key]) {
            field.value = formData[key];
            filledFields.push({ name, label, value: formData[key] });
            console.log(`Filled field: ${name} (label: ${label}, matched with ${key}) with value: ${formData[key]}`);
            fieldFilled = true;
            break; // Stop trying after the first successful match
          }
        }
        if (!fieldFilled) {
          console.log(`No matching data found for field: ${name} (label: ${label})`);
        }
      });

      // Send data to background script for storage
      chrome.runtime.sendMessage({
        action: "storeHistory",
        url: window.location.href,
        allFields: JSON.stringify(allFields), // Convert to JSON string
        filledFields: JSON.stringify(filledFields), // Convert to JSON string
        timestamp: new Date().toISOString()
      });
    });
  }
});
