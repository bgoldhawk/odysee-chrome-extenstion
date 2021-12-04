//import ApiService from './ApiService'

//This seems really hacky, but so far is the most reliable way i found to know when a page has changed;
let url;

document.addEventListener('odyseeVideoElementReady', async (data) => {

    if(window.location.host!= "odysee.com")
    {
        return;
    }

    console.log('Video element loaded on ' + data.detail.videoName);
    console.log(data.detail.element);

    var videoElement = data.detail.element;
    var videoName = document.getElementsByClassName("card__title")[0].innerText;
    var channelName = document.getElementsByClassName("channel-name")[0].innerText.replaceAll("@", "");

    checkForVideoAndSetWatchTime(videoElement, channelName, videoName);

});

window.addEventListener('pageChanged', function (data) {
    console.log('pageChanged event handled: '+ data);

    if(data.detail.host != "https://odysee.com")
    {
        return;
    }

    //let odyseePageName = window.location.href.substring(19, window.location.href.length).toLowerCase();
    if (!IsVideoPage(data.detail.pageName)) {

        setTimeout(() => {


            chrome.storage.sync.get("odyse_ext_userId", (data) => {

                userId = data.odyse_ext_userId;

                if (userId != "" || userId != undefined) {
                    var apiService = new APIService("https://myextension.goldhawk.me");

                    apiService.getAllUserWatchedDetails(userId)
                        .then(data => {

                            if (data.length == 0) {
                                return;
                            }

                            var visibleTitles = document.getElementsByClassName("card");

                            console.log("loaded video titles :" + visibleTitles.length);

                            for (const key in visibleTitles) {
                                if (Object.hasOwnProperty.call(visibleTitles, key)) {
                                    const element = visibleTitles[key];

                                    if(!element.getElementsByClassName("channel-name")[0])
                                    {
                                        continue;
                                    }
                                    var channelName = element.getElementsByClassName("channel-name")[0].innerText.toLowerCase().replaceAll("@", "");
                                    var videoName = element.querySelector(".claim-tile__title span").innerText.toLowerCase();


                                    data.forEach(page => {

                                        //console.log(link.substring(19, link.length) + " : " + page.videoTitle )

                                        if (page.channelName === channelName && page.videoName === videoName) {



                                            var titleArea = element.querySelector("[class$='tile__header']");

                                            var timeSpan = element.querySelector("[class$='_overlay-properties'] span")



                                            var watchedPercent = GetPercentageWatch(timeSpan, page.watchTime.toFixed(0));


                                            titleArea.innerHTML = '<div style="background-color:#ba6562;width:' + watchedPercent + '%;height:100%;position:absolute;"></div>' + titleArea.innerHTML;


                                            var watchedTime = displayTime(page.watchTime.toFixed(0));

                                            if (timeSpan != undefined) {
                                                timeSpan.innerHTML = `${watchedTime}/${timeSpan.innerHTML}`;
                                            }

                                        }

                                    });

                                }
                            }

                        });
                }

            });

            chrome.storage.sync.get('watched_urls', (data) => {

                if (data.watched_urls == undefined) {
                    return;
                }


            });

        }, 2000);

    }
    url = location.href;
}, true)


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



        setInterval(function () { storePlayTime(channelName, videoName) }, 10000);




    });
}

function GetVideoDetails(odyseeName) {
    return {
        channelName: odyseeName.substring(1, odyseeName.indexOf(":")),
        videoName: odyseeName.substring(odyseeName.indexOf("/") + 1, odyseeName.indexOf(":", odyseeName.indexOf("/") + 2)).replaceAll("-", " ")
    }
}


const odyseeVideoReadyEvent = new CustomEvent('odyseeVideoLoaded');

window.addEventListener('pageChanged', (data) => {

    if(data.detail.host != "https://odysee.com")
    {   
        return;
    }

    if (IsVideoPage(data.detail.pageName)) {
        GetVideoElement(data.detail.pageName);
    }

    console.log("data from page change " + data.detail.pageName);
})

function IsVideoPage(pageName) {
    if (pageName == undefined) {
        return false;
    }

    return (pageName.startsWith("@") && pageName.indexOf("/") > 0);
}

function GetVideoElement(videoName) {
    var videoElement = document.querySelector('video');

    console.log("Attempting to get video element " + videoElement);

    if (videoElement == undefined) {

        setTimeout(() => {
            GetVideoElement(videoName);
        }, 500);
    }
    else {

        console.log("Event video element loaded: " + videoElement);

        document.dispatchEvent(new CustomEvent('odyseeVideoElementReady',
            {
                detail: {
                    'videoName': videoName,
                    element: videoElement
                }
            }));
    }
}

function displayTime(seconds) {
    const format = val => `0${Math.floor(val)}`.slice(-2)
    const hours = seconds / 3600
    const minutes = (seconds % 3600) / 60

    return [hours, minutes, seconds % 60].map(format).join(':')
}