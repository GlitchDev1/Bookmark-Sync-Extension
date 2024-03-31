// Event listener for messages from content scripts or other parts of the extension
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action == "syncBookmarks") {
      saveOnGithub();
    }
});

async function saveOnGithub(bookmarks) {

    const localstorage = await browser.storage.local.get();

    const accessToken = localstorage.githubToken;
    const fullRepoName = localstorage.githubUsername + "/" + localstorage.githubRepo;
    const branch = "main";
    const commitMessage = "Updated Bookmarks";
    const content = [
      {
        path: "/.bookmark-sync/bookmarks.json",
        content: JSON.stringify(bookmarks),
        encoding: "utf-8"
      }
    ];

    createGithubCommit(accessToken, fullRepoName, branch, commitMessage, content);
}

const createGithubCommit = async (githubAccessToken,
    repoFullName,
    branchName,
    commitMessage,
    articleFiles) => {

    const tree = await createGithubRepoTree(githubAccessToken, repoFullName, branchName, articleFiles)
    const parentSha = await getParentSha(githubAccessToken, repoFullName, branchName)

    const payload = {
        "message": commitMessage,
        "tree": tree,
        "parents": [parentSha]
    }

    const response = await fetch(`https://api.github.com/repos/${repoFullName}/git/commits`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${githubAccessToken}`,
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify(payload)
        })

    const commitResp = await response.json()
    const commitSha = commitResp.sha

    await updateGithubBranchRef(githubAccessToken, repoFullName, branchName, commitSha)
}

const createGithubFileBlob = async (githubAccessToken, repoFullName, content, encoding = "utf-8") => {
    const blobResp = await fetch(`https://api.github.com/repos/${repoFullName}/git/blobs`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${githubAccessToken}`,
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify({
                "content": content,
                "encoding": encoding
            })
        })
    const response = await blobResp.json()

    return response.sha
}

const getShaForBaseTree = async (githubAccessToken, repoFullName, branchName) => {
    const baseTreeResp = await fetch(`https://api.github.com/repos/${repoFullName}/git/trees/${branchName}`,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${githubAccessToken}`,
                'X-GitHub-Api-Version': '2022-11-28'
            },
        })
    const response = await baseTreeResp.json()

    return response.sha
}

const getParentSha = async (githubAccessToken, repoFullName, branchName) => {
    const parentResp = await fetch(`https://api.github.com/repos/${repoFullName}/git/refs/heads/${branchName}`,
        {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${githubAccessToken}`,
                'X-GitHub-Api-Version': '2022-11-28'
            },
        })
    const response = await parentResp.json()

    return response.object.sha
}

/* File Structure:
{
    path: string, (/some/path/and/file.html)
    content: string,
    encoding: string (utf-8, base64...)
}
*/

const createGithubRepoTree = async (githubAccessToken, repoFullName, branchName, files) => {
    const shaForBaseTree = await getShaForBaseTree(githubAccessToken, repoFullName, branchName)

    const tree = []

    for (var i = 0; i < files.length; i++) {
        const fileSha = await createGithubFileBlob(githubAccessToken, repoFullName, files[i].content, files[i].encoding)
        tree.push({
            "path": files[i].path.substring(1),
            "mode": "100644",
            "type": "blob",
            "sha": fileSha
        })
    }

    const payload = {
        "base_tree": shaForBaseTree,
        "tree": tree
    }

    const treeResp = await fetch(`https://api.github.com/repos/${repoFullName}/git/trees`,
        {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${githubAccessToken}`,
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify(payload)
        })
    const response = await treeResp.json()

    return response.sha
}

const updateGithubBranchRef = async (githubAccessToken, repoFullName, branchName, commitSha) => {
    const payload = {
        "sha": commitSha,
        "force": false
    }

    const response = await fetch(`https://api.github.com/repos/${repoFullName}/git/refs/heads/${branchName}`,
        {
            method: 'PATCH',
            headers: {
                'Accept': 'application/vnd.github+json',
                'Authorization': `Bearer ${githubAccessToken}`,
                'X-GitHub-Api-Version': '2022-11-28'
            },
            body: JSON.stringify(payload)
        })

    const commitResp = await response.json()
}