// This script runs in the background and interacts with bookmarks API

// Event listener for when the extension is installed or updated
browser.runtime.onInstalled.addListener((details) => {
  console.log('Extension installed or updated:', details.reason);
  // Perform any initialization tasks here if necessary
});

// Event listener for when the extension is started
browser.runtime.onStartup.addListener(() => {
  console.log('Extension started');
  // Perform any startup tasks here if necessary
});

// Event listener for when the extension's settings are changed
browser.storage.onChanged.addListener((changes, areaName) => {
  console.log('Settings changed:', changes, 'in area:', areaName);
  // React to changes in settings here if necessary
});


// Update Bookmark


// Event listener for messages from content scripts or other parts of the extension
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message, 'from sender:', sender);
  if (message.action == "getBookmarkFolders") {
    sendResponse(getBookmarkFolders());
  }
});

// Function to get bookmark folders
function getBookmarkFolders() {
  return browser.bookmarks.getSubTree("toolbar_____")
    .then((bookmarks) => {
      const folders = extractFolders(bookmarks[0].children);
      return folders;
    });
}

// Helper function to extract bookmark folders recursively
function extractFolders(bookmarks) {
  let folders = [];

  bookmarks.forEach((bookmark) => {
    if (bookmark.type === 'folder') {
      folders.push({
        id: bookmark.id,
        title: bookmark.title,
        children: []
      });
      if (bookmark.children) {
        folders[folders.length - 1].children = extractFolders(bookmark.children);
      }
    }
  });

  return folders;
}