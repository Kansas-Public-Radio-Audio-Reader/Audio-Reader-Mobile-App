
/* options and settings: */
var streamUrl = "https://streaming.kansaspublicradio.org:8001/audioreader";
var nowPlayingURL = "https://audio-reader.kansaspublicradio.org/nowplaying.json";
var programsURL = "https://audio-reader.kansaspublicradio.org/programs.json?x=3";
var defaultKeepInBackground = true;
var defaultPlaybackSpeed = 1.0;
var defaultFontSize = 12;
/* end options and settings: */

var app = {

    // member variables
    keepPlayingInBackground: defaultKeepInBackground,
    playbackSpeed: defaultPlaybackSpeed,
    audioUrl: streamUrl,
    mediaPlayer: null,

    // Application Constructor
    initialize: function() {
        this.bindEvents();
        console.log('Audio Reader app is initializing');
    },

    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        document.addEventListener('pause', this.onPauseEvent, false);
        document.addEventListener('resume', this.onResumeEvent, false);
    },

    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, 'app.receivedEvent(...);' must be explicitly called.
    onDeviceReady: async function() {

        // initialize the audio player
        app.initAudio();
        app.setPlayerText();
        app.setPlaybackSpeed();

        // initialize the live stream page
        app.getNowPlayingTitlePromise().then(function(response) {
            document.getElementById("nowPlayingSpan").innerText = response;
        });

        // initialize the on-demand page
        var onDemandPage = document.getElementById("ondemand");
        app.buildOnDemandSection(programsURL, onDemandPage)


        // add event listeners here
        document.getElementById("menuButton").addEventListener('click', app.navigationEvent);
        document.querySelectorAll("a.navLink").forEach(function(page){
            page.addEventListener('click', app.changePageEvent);
        });
        document.getElementById("playButton").addEventListener('click', function(){app.playButtonEvent()});
        document.getElementById("pauseButton").addEventListener('click', function(){app.pauseButtonEvent()});
        document.getElementById("playLiveStream").addEventListener('click', function(){
            app.setAudioSource(streamUrl);
            app.playButtonEvent();
            setPlayerText(); // no parameter == set to now playing
        });

        // settings event listeners:
        document.getElementById("playbackSpeedSetting").addEventListener('change', function(event){
            app.changePlaybackSpeedEvent(event.target.value);
        });

        console.log('Audio Reader app is ready!');

        
    },

    /*  _______________________________
     *   E V E N T   C A L L B A C K S
     *  ===============================
     */

    navigationEvent: function() {
        var x = document.getElementById("myLinks");
        if (x.style.display === "block") {
            x.style.display = "none";
        } else {
            x.style.display = "block";
        }
    },

    changePageEvent: function() {

        // close all pages
        document.querySelectorAll(".page").forEach(function(page){
            page.style.display = "none";
        });
        // display only the page we want to see
        var pageName = this.attributes.page.value;
        var x = document.getElementById(pageName);
        x.style.display = "block";
        
        // close the menu
        var menu = document.getElementById("myLinks");
        menu.style.display = "none";
    },

    playButtonEvent: function() {
        this.playAudio(this.mediaPlayer);
        var play = document.getElementById("playButton");
        var pause = document.getElementById("pauseButton");
        play.style.display = "none";
        pause.style.display = "inline-block";
    },

    pauseButtonEvent: function() {
        this.pauseAudio(this.mediaPlayer);
        var play = document.getElementById("playButton");
        var pause = document.getElementById("pauseButton");
        play.style.display = "inline-block";
        pause.style.display = "none";
    },

    changePlaybackSpeedEvent: function(rate) {
        if (isNaN(rate) || (rate < 0) || (rate > 2)) {
            console.log('ERROR: Playback speed incorrect');
            return;
        }
        this.playbackSpeed = rate;
        this.setPlaybackSpeed(rate);
    },

    /*  _____________________________________________
     *   A U D I O   P L A Y E R   F U N C T I O N S 
     *  =============================================
     *
     *  TODO: 
     *    - toggle play button for pause button
     *    - set the now playing label 
     *    - set options for play when screen is locked (ios only?)
     *        { playAudioWhenScreenIsLocked : true }
     *        Note: To allow playback with the screen locked or background audio you have to 
     *          add audio to UIBackgroundModes in the info.plist file.
     *          see: https://developer.apple.com/documentation/uikit#//apple_ref/doc/uid/TP40007072-CH4-SW23
     *    - display "loading" while the stream is buffering and not yet playing..?
     *    - be able to set the playback rate
     */

    initAudio: function() {
        // close the old media player if one exists (important for Android)
        if (this.mediaPlayer != null) {
            this.stopAudio();
        }

        // initialize the media player
        var newMediaPlayer = new Media(this.getAudioSource(),
            // success callback
            function () { console.log("playAudio(): Audio Success"); },
            // error callback
            function (err) { 
                console.log("playAudio(): Audio Error: " + JSON.stringify(err)); 
                alert("Audio Error: " + JSON.stringify(err));
            }
        );
        this.mediaPlayer = newMediaPlayer;
        return newMediaPlayer;
    },

    playAudio: function() {
        if (this.keepPlayingInBackground) {
            this.mediaPlayer.play({ playAudioWhenScreenIsLocked : true }); // for iOS quirk
        } else {
            this.mediaPlayer.play();
        }
        // adjust the playback speed if needed/able
        if (this.audioUrl != streamUrl) {
            this.mediaPlayer.setRate(this.playbackSpeed);
        }
    },

    pauseAudio: function() {
        // TODO: handle differently for stream vs on-demand ??
        this.mediaPlayer.pause();
    },

    stopAudio: function() {
        this.mediaPlayer.stop();
        this.mediaPlayer.release(); // important for android
    },

    setAudioSource: function(url) {
        this.audioUrl = url;
    },

    getAudioSource: function() {
        return this.audioUrl;
    },
    setPlaybackSpeed: function(rate) {
        speed = rate || this.playbackSpeed;
        if (this.mediaPlayer.MEDIA_RUNNING & (this.audioUrl != streamUrl)) {
            this.mediaPlayer.setRate(speed);
        } else {
            this.playbackSpeed = speed;
        }
    },


    /*  ___________________________________
     *   C O N T E N T   F U N C T I O N S
     *  ===================================
     */
    togglePlayerButtons: function() {
        var play = document.getElementById("playButton");
        var pause = document.getElementById("pauseButton");
        if (play.style.display != "none") {
            play.style.display = "none";
            pause.style.display = "inline-block";
        } else {
            play.style.display = "inline-block";
            pause.style.display = "none";
        }
    },
    setPlayerText: async function (text) {
        // if no text given, will set to now currently playing live
        if (!text) {
            app.getNowPlayingTitlePromise().then(function(response) {
                document.getElementById("player-inner").innerText = response;
            });
        } else {
            document.getElementById("player-inner").innerText = text;
        }
    },
    getNowPlayingTitlePromise: function () {
        return fetch(nowPlayingURL)
            .then(response => {
                if (!response.ok) {
                    console.log('now-playing response ERROR: ');
                    console.log(response);
                    console.log('status code: ' + response.status);
                    throw new Error("HTTP error " + response.status);
                }
                return response.json();
            })
            .then(json => {
                if (json['now playing']) {
                    return json['now playing'];
                } else {
                    return "Listen to the live stream"
                }
            })
            .catch(function () {
                this.dataError = true;
            });
    },
    getOnDemandXMLPromise: function (url) {
        return fetch(url)
            .then(response => { // first parse the response text
                if (!response.ok) {
                    console.log('program XML response ERROR: ');
                    console.log(response);
                    console.log('status code: ' + response.status);
                    throw new Error("HTTP error " + response.status);
                }
                return response.text()
            }) 
            .then(str => new window.DOMParser().parseFromString(str, "text/xml")) //Then parse the text with DOMParser()
            .then(data => data)
            .catch(function () {
                this.dataError = true;
            });
    },
    getProgramsPromise: function(programsUrl) {
        return fetch(programsUrl)
            .then(response => {
                if (!response.ok) {
                    console.log('programs JSON response ERROR: ');
                    console.log(response);
                    console.log('status code: ' + response.status);
                    throw new Error("HTTP error " + response.status);
                }
                return response.json();
            })
            .then(json => json.categoryObjs)
            .catch(function () {
                this.dataError = true;
            });

    },
    buildOnDemandSection: async function(programsUrl, containerElement) {
        app.getProgramsPromise(programsUrl)
            .then(function(programCategories) {

                programCategories.forEach(function(category) {
                    var div = document.createElement("div");
                    var header = document.createElement("h2");
                    header.innerText = category.categoryName;
                    div.appendChild(header);

                    category.programs.forEach(function(program) {
                        var title = document.createElement('h3');
                        title.innerText = program.programName;
                        var innerDiv = document.createElement('div')

                        // add event tricker of click/tap
                        title.addEventListener('click', function(){
                            console.log('clicked on ' + program.programName);
                            app.addOnDemandText(program.feed, innerDiv);
                        });
                        div.appendChild(title);
                        div.appendChild(innerDiv);
                    });

                    containerElement.appendChild(div);
                });
                
            });
    },
    addOnDemandText: async function (url, element) {
        app.getOnDemandXMLPromise(url).then(function(data) {
            // use the XML data like we would if we had a normal DOM reference
            const items = data.querySelectorAll("item");
            items.forEach(el => {
                var newElement = document.createElement("p");
                newElement.innerText = el.querySelector('title').innerHTML;
                newElement.addEventListener('click', function(){
                    app.setAudioSource(el.querySelector('enclosure').attributes.url.value);
                    app.initAudio();
                    app.playButtonEvent();
                    app.setPlayerText(el.querySelector('title').innerHTML);
                });
                element.appendChild(newElement);
            });
        });
    },
};

app.initialize();



