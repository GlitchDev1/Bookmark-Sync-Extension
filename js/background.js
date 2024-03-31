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
  if (message.action == "getBookmarkFolders") {
    sendResponse(getBookmarkFolders());
  }
  else if (message.action == "syncBookmarks") {
    const bookmarksToSync = something;
    browser.runtime.sendMessage({ action: "pushToGithub", data: bookmarksToSync });
  }
});

// Function to get bookmark folders
function getBookmarkFolders() {
  return browser.bookmarks.getSubTree("toolbar_____")
    .then((bookmarks) => {
      const folders = extractFolders(bookmarks[0].children, undefined);
      return folders;
    });
}

// Helper function to extract bookmark folders recursively
function extractFolders(bookmarks, parentId) {
  let folders = [];

  bookmarks.forEach((bookmark) => {
    if (bookmark.type === 'folder') {
      folders.push({
        id: bookmark.id,
        title: bookmark.title,
        synced: false,
        parentId: parentId,
        children: []
      });
      if (bookmark.children) {
        folders[folders.length - 1].children = extractFolders(bookmark.children, bookmark.id);
      }
    }
  });

  return folders;
}


async function getBookmarksToSync() {
  const localstorage = await browser.storage.local.get();

  const allBookmarkFolders = localstorage.bookmarks;
  const allBookmarkFoldersToSync = 
}

function updateBookmarks(newBookmarks) {

}


// Helper functions

async function getAllBookmarks() {
  return await browser.bookmarks.getSubTree("toolbar_____");
}
function getSyncedOnlyFoldersRecursively(allFolders) {
  const allBookmarks = getAllBookmarks();

  
}

function populateBookmarkFoldersWithBookmarks(bookmarkFolders, allBookmarks) {

}

// Returns Object of type:
// {
//    bool fullyUnsynced, bookmark[] bookmarks
// }

function recusivelyRemoveNotSyncedFolder(folderToCheck) {
  if (folderToCheck.childern.length == 0 && folderToCheck) {
    return {
      fullyUnsynced: true,
      bookmarks: undefined,
    }
  }
  else {
    folderToCheck.children.forEach(bookmarks => {
      const childResult = recusivelyRemoveNotSyncedFolder(bookmarks);
      if (childResult.fullyUnsynced) {
        return 
      }
    })
    return {

    }
  }
}

// Helper Function's Helper Functions
function flatten(bookmarks) {
  return bookmarks.map(bookmark => {
    const flatChildren = flatten(bookmark.children);
    const parentBookmark = createCopy(bookmark);
    parentBookmark.children = [];
    return flatChildren.concat(parentBookmark);
  }).flat();
}
function toMap(bookmarks) {
  const bookmarksCopy = createCopy(bookmarks);
  const bookmarkMap = new Map();
  if (bookmarksCopy !== undefined) {
    flatten(bookmarksCopy).forEach((bookmark) => bookmarkMap.set(bookmark.id, bookmark));
  }
  return bookmarkMap;
}