let currentHistoryIndex = 0;
let historyData = [];

document.getElementById('fillFormButton').addEventListener('click', () => {
  console.log('Fill Form button clicked');
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    console.log('Active tab found:', tabs[0].url);
    chrome.tabs.sendMessage(tabs[0].id, {action: "fillForm"});
  });
});

document.getElementById('viewHistoryButton').addEventListener('click', () => {
  chrome.storage.local.get({formDataHistory: []}, (result) => {
    historyData = result.formDataHistory.reverse();  // Reverse the order to show the latest record first
    console.log('Retrieved history:', historyData);
    if (historyData.length === 0) {
      alert('No history found.');
    } else {
      currentHistoryIndex = 0;
      displayHistoryEntry(currentHistoryIndex);
      toggleView();
    }
  });
});

document.getElementById('downloadHistoryButton').addEventListener('click', () => {
  chrome.storage.local.get({formDataHistory: []}, (result) => {
    const history = result.formDataHistory;
    console.log('Retrieved history for download:', history);
    if (history.length === 0) {
      alert('No history found.');
    } else {
      const timestamp = new Date().toISOString();
      const url = new URL(history[0].url);
      const domain = url.hostname;
      const filename = `${timestamp}_${domain}_form_history.json`;
      const blob = new Blob([JSON.stringify(history, null, 2)], {type: 'application/json'});
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  });
});

document.getElementById('downloadAllHistoryButton').addEventListener('click', () => {
  chrome.storage.local.get({formDataHistory: []}, (result) => {
    const history = result.formDataHistory;
    console.log('Retrieved all history for download:', history);
    if (history.length === 0) {
      alert('No history found.');
    } else {
      const timestamp = new Date().toISOString();
      const filename = `${timestamp}_all_form_history.json`;
      const blob = new Blob([JSON.stringify(history, null, 2)], {type: 'application/json'});
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  });
});

document.getElementById('backButton').addEventListener('click', () => {
  toggleView();
});

document.getElementById('prevButton').addEventListener('click', () => {
  if (currentHistoryIndex > 0) {
    currentHistoryIndex--;
    displayHistoryEntry(currentHistoryIndex);
  }
});

document.getElementById('nextButton').addEventListener('click', () => {
  if (currentHistoryIndex < historyData.length - 1) {
    currentHistoryIndex++;
    displayHistoryEntry(currentHistoryIndex);
  }
});

document.getElementById('downloadEntryButton').addEventListener('click', () => {
  if (historyData.length > 0) {
    const entry = historyData[currentHistoryIndex];
    const timestamp = new Date().toISOString();
    const url = new URL(entry.url);
    const domain = url.hostname;
    const filename = `${timestamp}_${domain}_entry_history.json`;
    const blob = new Blob([JSON.stringify(entry, null, 2)], {type: 'application/json'});
    const urlBlob = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = urlBlob;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
});

function displayHistoryEntry(index) {
  const entry = historyData[index];
  const timestamp = new Date(entry.timestamp);
  const formattedTimestamp = timestamp.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  let filledFields = '';
  entry.filledFields.forEach(field => {
    filledFields += `<div>${field.name} (Label: ${field.label}): ${field.value}</div>`;
  });

  let unfilledFields = '';
  entry.allFields.forEach(field => {
    if (!entry.filledFields.some(filledField => filledField.name === field.name)) {
      unfilledFields += `<div>${field.name} (Label: ${field.label}): not found</div>`;
    }
  });

  document.getElementById('historyContent').innerHTML = `
    <div class="history-entry">
      <strong>${formattedTimestamp}</strong>
      <div><a href="${entry.url}" target="_blank">${entry.url}</a></div>
      <div><strong>Filled Fields:</strong>${filledFields}</div>
      <div><strong>Unfilled Fields:</strong>${unfilledFields}</div>
    </div>
  `;

  document.getElementById('currentRecord').textContent = `${index + 1} of ${historyData.length}`;
}

function toggleView() {
  const mainContainer = document.getElementById('mainContainer');
  const historyView = document.getElementById('historyView');
  if (mainContainer.style.display === 'none') {
    mainContainer.style.display = 'block';
    historyView.style.display = 'none';
  } else {
    mainContainer.style.display = 'none';
    historyView.style.display = 'block';
  }
}

// Display the total records in history
chrome.storage.local.get({formDataHistory: []}, (result) => {
  const history = result.formDataHistory;
  document.getElementById('totalRecords').textContent = `Total Records: ${history.length}`;
});
