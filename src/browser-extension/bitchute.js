window.addEventListener('pageChanged', function (data) {
    console.log("from bitchute js");

    if (data.detail.pageName.startsWith("video")) {
        console.log("Video Page Loaded")

        SetupVideoWatcher();
    }
    else {
        console.log("non video page loaded");


        PerformVideoCardProcessing();

    }

});

document.addEventListener('newItemsLoaded', (eventData) => {

    console.log("New event revieved for: " + eventData.detail.element.id);

    UpdateVideoCards(eventData.detail.element);
    
});

function PerformVideoCardProcessing()
{
    var subscribedElement = document.getElementById('listing-subscribed');    

    if (subscribedElement == undefined) {

        console.log("Waiting for video card div to be ready");

        setTimeout(() => { PerformVideoCardProcessing()}, 1000);
        return;
    }
        
        //subscribedElement.getElementsByClassName("video-card")
        watchForNewItems(subscribedElement, subscribedElement.clientHeight);
        UpdateVideoCards(subscribedElement);
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


document.body.addEventListener("change", () => {
    console.log("changed body");
})

function watchForNewItems(element, lastRecordedHeight) {

    let currentHeight = element.clientHeight;

    if (lastRecordedHeight != currentHeight) {
        console.log("Triggering new event");
        document.dispatchEvent(new CustomEvent('newItemsLoaded', { detail: { element } }));
    }

    setTimeout(() => {
        watchForNewItems(element, currentHeight)

    }, 2000);

};

function UpdateVideoCards(cardContainer)
{
    chrome.storage.sync.get("odyse_ext_userId", (data) => {

        userId = data.odyse_ext_userId;

        if (userId != "" || userId != undefined) {
            var apiService = new APIService("https://myextension.goldhawk.me");

            apiService.getAllUserWatchedDetails(userId)
                .then(data => {

                    if (data.length == 0) {
                        return;
                    }

                    let videoCards = cardContainer.getElementsByClassName("video-card");

                    for (const key in videoCards) {
                        if (Object.hasOwnProperty.call(videoCards, key)) {
                            const videoCard = videoCards[key];

                            let videoName = videoCard.getElementsByClassName("video-card-title")[0].innerText;
                            let channelLink = videoCard.querySelector(".video-card-channel a").href;

                            let channelName = channelLink.substring(33, channelLink.length - 1);

                            data.forEach(page => {

                                //console.log(link.substring(19, link.length) + " : " + page.videoTitle )

                                if (page.channelName === channelName.toLowerCase() && page.videoName === videoName.toLowerCase()) {



                                    var titleArea = videoCard.getElementsByClassName("video-card-text")[0];

                                    var timeSpan = videoCard.querySelector("span.video-duration")

                                    var progress = videoCard.getElementsByClassName("progress");

                                    if(progress.length > 0)
                                    {
                                        return;
                                    }



                                    var watchedPercent = GetPercentageWatch(timeSpan, page.watchTime.toFixed(0));


                                    titleArea.innerHTML = '<div class="progress" style="background-color:#ba6562;width:' + watchedPercent + '%;height:100%;position:absolute; left:-2px"></div><div style="position: relative;">' + titleArea.innerHTML +"</div>";


                                    //var watchedTime = displayTime(page.watchTime.toFixed(0));

                                    /*if (timeSpan != undefined) {
                                        timeSpan.innerHTML = `${watchedTime}/${timeSpan.innerHTML}`;
                                    }*/

                                }

                            });

                        }
                    }

                });
        }

    });

}

function SetupVideoWatcher()
{
    let videoElement = document.getElementsByTagName("video")[0];
    let channelLink =  document.querySelector(".image-container a.spa").href;

    let channelName = channelLink.substring(33, channelLink.length - 1)
    let videoName =  document.getElementById("video-title").innerText;

    checkForVideoAndSetWatchTime(videoElement, channelName, videoName);
}

function checkForVideoAndSetWatchTime(videoElement, channelName, videoName) {


    if (videoElement.readyState < 4) {

        console.log("Waiting for video to be ready, current state is " + videoName.readyState);

        setTimeout(() => { checkForVideoAndSetWatchTime(videoElement, channelName, videoName) }, 1000);
        return;
    }

    chrome.storage.sync.get("odyse_ext_userId", async (data) => {

        let userId = data.odyse_ext_userId;

        if (userId != '' && userId != undefined) {

            videoElement.pause();

            console.log("Getting watch time for " + videoName);

            var apiService = new APIService("https://myextension.goldhawk.me");


            console.log(`${channelName} : ${videoName}`);

            await apiService.getWatchedDetails(userId, channelName, videoName)
                .then(watchedDetails => {

                    if (watchedDetails == null) {
                        console.log("No Data loaded");
                        return;
                    }

                    if (watchedDetails != undefined) {
                        console.log("Retrieveing Existing User Data");


                        var time = watchedDetails.watchTime;


                        let video = document.querySelector('video');

                        console.log("retrieved watch time: " + time);
                    }

                    if (time != undefined) {
                        console.log("going to: " + time);


                        console.log(videoElement.currentTime);
                        videoElement.currentTime = time;

                    }
                    else {
                        console.log("No watch time defined");
                    }
                });

            videoElement.play();
        }



        //setInterval(function () { storePlayTime(channelName, videoName) }, 10000);




    });
}