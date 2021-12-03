setInterval(() => {



    if (url !== document.location.href || url == undefined) {

        let hostUrl = window.location.origin;

        let pageName = window.location.href.substring(hostUrl.length + 1, window.location.href.length);

        window.dispatchEvent(new CustomEvent('pageChanged', { detail: { host: hostUrl, pageName: pageName } }));

        console.log('pageChanged');
    }

    url = document.location.href;

}, 1000)