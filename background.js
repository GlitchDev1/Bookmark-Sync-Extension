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

// Event listener for messages from content scripts or other parts of the extension
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Message received:', message, 'from sender:', sender);
  // Process messages and respond if necessary
});

// Function to get bookmarks in a folder
function getBookmarksInFolder(folderId) {
  return browser.bookmarks.getChildren(folderId);
}

// Example: Get bookmarks in the "Bookmarks Toolbar" folder
getBookmarksInFolder("toolbar_____").then(bookmarks => {
  console.log(bookmarks);
});


// Function to get bookmark folders
function getBookmarkFolders() {
  return browser.bookmarks.getTree()
    .then((bookmarks) => {
      // Filter out only the bookmark folders
      const folders = extractFolders(bookmarks);
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
        title: bookmark.title
      });
      if (bookmark.children) {
        folders = folders.concat(extractFolders(bookmark.children));
      }
    }
  });

  return folders;
}