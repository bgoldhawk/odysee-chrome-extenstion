//This seems really hacky, but so far is the most reliable way i found to know when a page has changed;
let url;

document.addEventListener('odyseeVideoElementReady', (data) => {

    console.log('Video element loaded on ' + data.detail.videoName);
    console.log(data.detail.element);

    var videoElement = data.detail.element;
    var videoName = data.detail.videoName;

    checkForVideoAndSetWatchTime(videoElement, videoName);

});


window.addEventListener('odyseePageChanged', function () {
    console.log('pageChanged event handled');

    let odyseePageName = window.location.href.substring(19, window.location.href.length);
    if (odyseePageName.startsWith('@')) {
    }
    else {
        setTimeout(() => {

            chrome.storage.sync.get('watched_urls', (data) => {

                if (data.watched_urls == undefined) {
                    return;
                }

                //card claim-preview--tile
                //.claim-tile__header a
                //.claim-preview__file-property-overlay span
                var visibleTitles = document.getElementsByClassName("card");

                console.log("loaded video titles :" + visibleTitles.length);

                for (const key in visibleTitles) {
                    if (Object.hasOwnProperty.call(visibleTitles, key)) {
                        const element = visibleTitles[key];

                        var link = element.querySelector('.card a').href;

                        data.watched_urls.pages.forEach(page => {

                            if (page.url === link.substring(19, link.length)) {
                                element.style.backgroundColor = 'red';

                                var watchedTime = (page.time / 60).toFixed(2);

                                var timeSpan = element.querySelector("[class$='_overlay-properties'] span")
                                timeSpan.innerHTML = `${watchedTime}\\${timeSpan.innerHTML}`;
                            }

                        });


                    }
                }
            });

        }, 5000);

    }
    url = location.href;
}, true)


function checkForVideoAndSetWatchTime(videoElement, videoName) {


    if (videoElement.readyState < 4) {

        console.log("Waiting for video to be ready, current state is " + videoName.readyState);

        setTimeout(() => {checkForVideoAndSetWatchTime(videoElement, videoName)}, 1000);
        return;
    }


    chrome.storage.sync.get("watched_urls", (data) => {

        videoElement.pause();

        console.log("Getting watch time for " + videoName);


        if (data == undefined) {
            console.log("No Data loaded");
            return;
        }

        if (data.watched_urls != undefined) {
            console.log("Retrieveing Existing User Data");


            var time;

            data.watched_urls.pages.forEach(page => {

                if (page.url === videoName) {
                    time = page.time;
                }

            });

            let video = document.querySelector('video');

            console.log("retrieved watch time: " + time);
        }

        if (time != undefined) {
            console.log("going to: " + time);


            console.log(videoElement.currentTime);
            videoElement.currentTime = time;
            videoElement.play();
        }
        else {
            console.log("No watch time defined");
        }

        setInterval(function () { storePlayTime(videoElement, videoName) }, 10000);


    });
}



function storePlayTime() {

    let name = window.location.href.substring(19, window.location.href.length);
    let media = document.querySelector('video');


    chrome.storage.sync.get('watched_urls', (data) => {

        if (media == undefined || media.currentTime < 30) {
            return;
        }

        let time = media.currentTime;
        let extData;
        let pageData;

        extData = data.watched_urls;

        if (extData == undefined) {
            extData = {
                pages: Array()
            };
        }

        extData.pages.forEach(page => {

            if (page.url === name) {
                pageData = page;
            }

        });

        if (pageData == undefined) {
            console.log("New Page");

            pageData = {
                url: name
            }

            extData.pages.push(pageData);
        }

        pageData.time = media.currentTime;


        chrome.storage.sync.set({ 'watched_urls': extData }, () => {

            extData.pages.forEach(page => {
                console.log(`${page.time} - ${page.url}`);
            })
            console.log("Synced Successfully");
        });

    });
}

setInterval(() => {

    if (url !== document.location.href || url == undefined) {

        let odyseePageName = window.location.href.substring(19, window.location.href.length);

        window.dispatchEvent(new CustomEvent('odyseePageChanged', { detail: { pageName: odyseePageName } }));

        console.log('odyseePageChanged');
    }

    url = document.location.href;

}, 1000)

const odyseeVideoReadyEvent = new CustomEvent('odyseeVideoLoaded');

window.addEventListener('odyseePageChanged', (data) => {

    if (data.detail.pageName.startsWith('@')) {
        GetVideoElement(data.detail.pageName);
    }

    console.log("data from page change " + data.detail.pageName);
})

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