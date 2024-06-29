let formData;

fetch(chrome.runtime.getURL('data.json'))
  .then(response => response.json())
  .then(data => {
    formData = data;
    console.log('Form data loaded:', formData);
    chrome.storage.local.set({formData: formData});
  })
  .catch(error => console.error('Error loading form data:', error));

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "storeHistory") {
    console.log('Received store history request');
    storeHistory(request.url, JSON.parse(request.allFields), JSON.parse(request.filledFields), request.timestamp);
  }
});

chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

function storeHistory(url, allFields, filledFields, timestamp) {
  chrome.storage.local.get({formDataHistory: []}, (result) => {
    const history = result.formDataHistory;
    history.push({
      url: url,
      allFields: allFields,
      filledFields: filledFields,
      timestamp: timestamp
    });
    chrome.storage.local.set({formDataHistory: history}, () => {
      console.log('History stored successfully:', history);
    });
  });
}
