function storePlayTime(channelName, videoName) {


    let media = document.querySelector('video');

    chrome.storage.sync.get("odyse_ext_userId", (data) => {

        userId = data.odyse_ext_userId;

        if (userId == "") {
            userId = null;
        }

        var apiService = new APIService("https://myextension.goldhawk.me");

        apiService.setNewSyncTime(userId, channelName, videoName, media.currentTime)
            .then(retrievedUserId => {

                console.log("Synced Successfully");

                if (userId == "" || userId == undefined) {
                    console.log("storing new users id: " + retrievedUserId)
                    chrome.storage.sync.set({ "odyse_ext_userId": retrievedUserId });
                }


            })

    });
}

function GetPercentageWatch(timeSpan, watchedTime) {
    if (timeSpan == undefined) {
        return 100;
    }

    var timeParts = timeSpan.innerHTML.split(":");

    var totalTimeInSecs;

    if (timeParts.length > 2) {
        totalTimeInSecs = ((timeParts[0] * 60) * 60) + (timeParts[1] * 60) + (timeParts[2] * 1);
    }
    else {
        totalTimeInSecs = (timeParts[0] * 60) + (timeParts[1] * 1);
    }

    console.log("Total time in seconds: " + totalTimeInSecs);

    var percent = Math.floor((watchedTime * 1 / totalTimeInSecs) * 100);

    console.log(`percent: ${percent}`);
    return percent;

}