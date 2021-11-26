//This seems really hacky, but so far is the most reliable way i found to know when a page has changed;
let url = window.location.href;

['click', 'popstate', 'load'].forEach(evt =>
    window.addEventListener(evt, function () {
        requestAnimationFrame(() => {
            if (url !== location.href) {

                //temporary work around to allow page elements and video to load
                setTimeout(() => {

                    console.log(`changed ${url}`);
                    let urlLocation = window.location.href.substring(19, window.location.href.length);

                    if (urlLocation.startsWith('@')) {
                        checkForVideoAndSetWatchTime();
                    }

                }, 5000);

            }
            else {
                setTimeout(() => {

                    chrome.storage.sync.get('watched_urls', (data) => {

                    if(data.watched_urls == undefined)
                    {
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
        });
    }, true)
);


function checkForVideoAndSetWatchTime() {
    var video = document.querySelector('video');
    var url = window.location.href.substring(19, window.location.href.length);

    if (video == undefined) {

        console.log("video not loaded");
        setTimeout(() => {
            checkForVideoAndSetWatchTime();
        }, 1000);
    }
    else {
        video.pause();
        console.log("vidoe loaded");

        console.log("Getting watch time for " + url);
        chrome.storage.sync.get("watched_urls", (data) => {


            if (data == undefined) {
                console.log("No Data loaded");
                return;
            }

            if (data.watched_urls != undefined) {
                console.log("Retrieveing Existing User Data");


                var time;

                data.watched_urls.pages.forEach(page => {

                    if (page.url === url) {
                        time = page.time;
                    }

                });

                let video = document.querySelector('video');

                console.log("retrieved watch time: " + time);
            }

            if (time != undefined) {
                console.log("going to: " + time);


                console.log(video.currentTime);
                video.currentTime = time;
                video.play();
            }
            else {
                console.log("No watch time defined");
            }

            setInterval(function () { storePlayTime(video, url) }, 10000);


        });

    }
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