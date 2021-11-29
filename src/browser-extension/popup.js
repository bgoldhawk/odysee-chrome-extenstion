let userIdInput = document.getElementById("userId");
let serverUrlInput = document.getElementById("serverUrl");
let saveBtn = document.getElementById("save");
let messageElem = document.getElementById("message");

saveBtn.addEventListener("click", async () => {

    try {
        userId = userIdInput.value;
        serverUrl = serverUrlInput.value;

        console.log(userId);
        console.log(serverUrlInput);


        await chrome.storage.sync.set({ "odyse_ext_userId": userId });

        await chrome.storage.sync.set({ "odyse_ext_serverUrl": serverUrl });


        messageElem.innerHTML = "Updated Successful"

    } catch (error) {

        messageElem.innerHTML = "Sorry, something went wrong"
        throw error;
    }

});

window.addEventListener("load", () => {

    chrome.storage.sync.get("odyse_ext_userId", (data) => {

        let retrieveUserId = data.odyse_ext_userId;

        if (retrieveUserId != undefined) {
            userIdInput.value = retrieveUserId;
        }

    });

    chrome.storage.sync.get("odyse_ext_serverUrl", (data) => {

        let retrieveServerUrl = data.odyse_ext_serverUrl;

        if (retrieveServerUrl != undefined) {
            serverUrlInput.value = retrieveServerUrl;
        }

    })

});