'use strict'

class APIService {
    #baseUrl;
    constructor(serverUrl) {
        this.baseUrl = serverUrl;
    }

    setNewSyncTime(userId, channelName, videoName, watchTime) {


        var data = {
            userId,
            channelName,
            videoName,
            watchTime
        };

        var requestData = {
            method: "POST",
            headers:
            {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json',
                "accept": "*/*"
            },
            body: JSON.stringify(data)
        };



        return fetch(this.baseUrl + "/UserVideo/SyncNewTime", requestData)
            .then(response => response.text())
            .then(data => data.replaceAll('"', ""));

    }

    getAllUserWatchedDetails(userId) {

        var requestData = {
            headers:
            {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json',
                "accept": "*/*"
            }
        };

        return fetch(this.baseUrl + "/UserVideo/GetAllWatched/" + userId, requestData)
            .then(response => {

                if (response.ok) {
                    return Promise.resolve(response.json());
                }

                return Promise.resolve(null);

            });
    }

    getWatchedDetails(userId, channelName, videoName) {

        var requestData = {
            headers:
            {
                "Access-Control-Allow-Origin": "*",
                'Content-Type': 'application/json',
                "accept": "*/*"
            }
        };

        return fetch(this.baseUrl + "/UserVideo/GetAllWatched/" + userId + "/" + encodeURIComponent(channelName) + "/" + encodeURIComponent(videoName), requestData)
            .then(response => {


                if (response.ok) {
                    return Promise.resolve(response.json())
                }

                return Promise.resolve(null);
            });
    }


}