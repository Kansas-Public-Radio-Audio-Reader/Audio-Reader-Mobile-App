    /*  _______________________________________________
     *   A U D I O   R E A D E R   M O B I L E   A P P 
     *  ===============================================
     *  source/js/index.js
     *  author: Danny Mantyla
     *  date: Q4 2024 to Q? 2025
     *
     *  TODO: 
     *    - [CHECK] toggle play button for pause button
     *    - [CHECK] set the now playing label 
     *    - [CHECK] set options for play when screen is locked (ios only?)
     *        { playAudioWhenScreenIsLocked : true }
     *        Note: To allow playback with the screen locked or background audio you have to 
     *          add audio to UIBackgroundModes in the info.plist file.
     *          see: https://developer.apple.com/documentation/uikit#//apple_ref/doc/uid/TP40007072-CH4-SW23
     *    - [CHECK] display "loading" while the stream is buffering and not yet playing [working in Android only
     *    - [CHECK] be able to set the playback rate
     *    - [CHECK] implement PAUSE
     *    - [CHECK] implement back button/swipe [working in Android only]
     *    - implement HLS stream for iOS ?
     *    - implement Keep Playing in Background
     *    - add a "playing" label to On Demand recording when its selected and playing
     */


/* options and settings: */
const streamUrl = "https://streaming.kansaspublicradio.org:8001/audioreader";
const hlsStreamUrl = ""; // "https://streams.kut.org/4426/playlist.m3u8" = sample HLS stream
const nowPlayingURL = "https://audio-reader.kansaspublicradio.org/nowplaying.json";
const programsURL = "https://audio-reader.kansaspublicradio.org/programs.json?x=3";
const alertsURL = "https://portal.kansaspublicradio.org/widgets/aralerts.php";
const defaultKeepInBackground = true;
const defaultPlaybackSpeed = 1.0;
const defaultFontSize = 14; // in points
/* end options and settings: */

var app = {

    // member variables
    keepPlayingInBackground: defaultKeepInBackground,
    playbackSpeed: defaultPlaybackSpeed,
    audioUrl: [streamUrl],
    mediaPlayer: null,
    playing: false,

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

        // lock the device orientation
        screen.orientation.lock('portrait');

        // look for alert messages
        app.displayAlerts();

        // initialize the audio player
        app.setAudioSource(streamUrl);
        app.initAudio(); // yes this is needed
        app.setPlayerText();
        app.changeFontSizeEvent(defaultFontSize);

        // initialize the live stream page
        app.getNowPlayingTitlePromise().then(function(response) {
            document.getElementById("nowPlayingSpan").innerText = response;
        });

        // initialize the on-demand page
        var onDemandPage = document.getElementById("ondemand");
        app.buildOnDemandSection(programsURL, onDemandPage);

        // add event listeners here
        document.addEventListener("backbutton", app.onBackButtonEvent, false);
        $(document).bind('swipeleft',function(){app.onBackButtonEvent}); // not working, does nothing

        // navigation event listeners
        document.getElementById("menuButton").addEventListener('click', app.navigationEvent);
        document.querySelectorAll("a.navLink").forEach(function(page){
            page.addEventListener('click', app.changePageEvent);
        });

        // audio controls event listeners
        document.getElementById("playButton").addEventListener('click', function(){
            app.playButtonEvent();
        });
        document.getElementById("pauseButton").addEventListener('click', function(){
            app.pauseButtonEvent();
        });
        document.getElementById("playLiveStream").addEventListener('click', function(){
            app.setAudioSource(streamUrl);
            app.playButtonEvent();
            app.setPlayerText(); // no parameter == set to now playing
        });

        // settings event listeners:
        document.getElementById("playbackSpeedSetting").addEventListener('change', function(event){
            app.changePlaybackSpeedEvent(event.target.value);
        });
        document.getElementById("fontSizeSetting").addEventListener('change', function(event){
            app.changeFontSizeEvent(event.target.value);
        });
        document.getElementById("backgroundPlaySetting").addEventListener('change', function(event){
            app.changePlayInBackroundEvent(event.target.value);
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
        
        app.togglePages(this.attributes.page.value);

        // close the menu
        var menu = document.getElementById("myLinks");
        menu.style.display = "none";
    },

    onBackButtonEvent: function(){

        // get what 'page' we're currently on
        var oldPage = null;
        document.querySelectorAll(".page").forEach(function(page){
            if (page.style.display == 'block') {
                oldPage = page;
            }
        });

        // display the correct page
        var newPageName = null;
        switch (oldPage.id) {
            case "live":
                // exit the app?
                newPageName = 'live';
                break;
            case "ondemand":
                newPageName = 'live';
                break;
            case "program":
                newPageName = 'ondemand';
                break;
            default:
                newPageName = 'live';
                break;
        }
        app.togglePages(newPageName);

    },

    playButtonEvent: function() {
        this.playAudio();
        var play = document.getElementById("playButton");
        var pause = document.getElementById("pauseButton");
        play.style.display = "none";
        pause.style.display = "block";
    },

    pauseButtonEvent: function() {
        this.pauseAudio();
        var play = document.getElementById("playButton");
        var pause = document.getElementById("pauseButton");
        play.style.display = "block";
        pause.style.display = "none";
    },

    changePlaybackSpeedEvent: function(rate) {
        if (isNaN(rate) || (rate < 0) || (rate > 2)) {
            console.log('ERROR: Playback speed incorrect');
            return;
        }
        console.log('playback rate: ' + rate)
        this.playbackSpeed = rate;

        // if we're already playing on demand, set the rate now
        if ((this.audioUrl[0] != streamUrl) & this.playing) {
            this.pauseAudio();
            this.playAudio();
        }
    },

    changeFontSizeEvent: function(size) {
        document.getElementById("htmlBody").style["font-size"] = size+"pt";
    },

    changePlayInBackroundEvent: function(bool) {
        this.keepPlayingInBackground = bool;

        // if we're already playing on demand, pause and resume to set the new setting
        if (this.playing) {
            this.pauseAudio();
            this.playAudio();
        }
    },

    /*  _____________________________________________
     *   A U D I O   P L A Y E R   F U N C T I O N S 
     *  =============================================
     */

    initAudio: function() {
        // create a new mediaPlayer object and delete/release any existing such objects

        // close the old media player if one exists (important for Android)
        // note: error in android: "stopPlaying called during invalid state" means it's not playing
        if (this.mediaPlayer) {
            console.log('mediaPlayer already exists, releasing audio player object.')
            this.stopAudio(); // important for android
        }

        // initialize the new media player
        var newMediaPlayer = new Media(this.getAudioSource(),
            // success callback
            function () { 
                console.log("playAudio(): Audio Success"); 
            },
            // error callback
            function (err) { 
                console.log("playAudio(): Audio Error: " + JSON.stringify(err)); 
                alert("Audio Error: " + JSON.stringify(err));
            },
            // media status callback
            function (status) {
                // executes to indicate status changes
                switch(status) {
                    case Media.MEDIA_NONE:
                        console.log('status change detected: MEDIA_NONE');
                        break;
                    case Media.MEDIA_STARTING:
                        console.log('status change detected: MEDIA_STARTING');
                        // display the "loading" sign
                        //document.getElementById("loadingDiv").style.display = "block";
                        $('#loadingDiv').show(500);
                        break;
                    case Media.MEDIA_RUNNING:
                        console.log('status change detected: MEDIA_RUNNING');
                        // remove the "loading" sign
                        //document.getElementById("loadingDiv").style.display = "none";
                        $('#loadingDiv').hide(500);
                        break;
                    case Media.MEDIA_PAUSED:
                        console.log('status change detected: MEDIA_PAUSED');
                        break;
                    case Media.MEDIA_STOPPED:
                        console.log('status change detected: MEDIA_STOPPED');
                        break;
                    case defualt:
                        console.log('status change detected: unknown');
                        break;
                }
            }
        );
        this.mediaPlayer = newMediaPlayer;
        return;
    },

    playAudio: function() {

        // if the new audio source is the same as the old audio source
        // then only resume playing it, otherwise start new
        var resume = (this.audioUrl[0] == this.audioUrl[1]); 

        if (resume) {
            // resume playing the same audio source

            // adjust the playback speed if needed/able
            if (this.audioUrl[0] != streamUrl) {
                this.setPlaybackSpeed();
            }

            // begin playing the audio
            if (this.keepPlayingInBackground) {
                this.mediaPlayer.play({ playAudioWhenScreenIsLocked : true }); // for iOS quirk
            } else {
                this.mediaPlayer.play({ playAudioWhenScreenIsLocked : false });
            }

        } else {
            // playing a new audio source. Delete the old mediaPlayer object and create a new one. 
            this.initAudio();

            // adjust the playback speed if needed/able
            if (this.audioUrl[0] != streamUrl) {
                this.setPlaybackSpeed();
            }

            // begin playing the audio
            if (this.keepPlayingInBackground) {
                this.mediaPlayer.play({ playAudioWhenScreenIsLocked : true }); // for iOS quirk
            } else {
                this.mediaPlayer.play({ playAudioWhenScreenIsLocked : false });
            }
        }
        this.playing = true;
        return;
    },

    pauseAudio: function() {
        // TODO: handle differently for stream vs on-demand ??
        this.mediaPlayer.pause();
        this.playing = false;
        this.setAudioSource(this.getAudioSource()); // add it to the queue of urls so we can know to resume
    },

    stopAudio: function() {
        // if anything is playing, stop it. 
        if (this.playing) {
            console.log('stopping audio that is playing')
            this.mediaPlayer.stop();
        }
        this.mediaPlayer.release(); // important for android
        this.playing = false;
    },

    setAudioSource: function(url) {
        this.audioUrl.unshift(url); // add it to the beginning
    },

    getAudioSource: function() {
        return this.audioUrl[0];
    },

    setPlaybackSpeed: function(rate) {
        if (rate) {
            this.playbackSpeed = speed;
            this.mediaPlayer.setRate(rate);
        } else {
            this.mediaPlayer.setRate(this.playbackSpeed);
        }
    },


    /*  ___________________________________
     *   C O N T E N T   F U N C T I O N S
     *  ===================================
     */

    togglePagesBackup: function(pageName) {
        // first, close all pages
        document.querySelectorAll(".page").forEach(function(page){
            page.style.display = "none";
        });
        // next, display only the page we want to see
        var x = document.getElementById(pageName);
        x.style.display = "block";

        // set the viewport to the top
        window.scrollTo(0, 0);
    },

    togglePages: function(pageName) {
        // set the viewport to the top
        window.scrollTo(0, 0);
        
        $('.page').fadeOut(500);
        $('#'+pageName).fadeIn(500);
        
    },


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
                console.log('ERROR: unknown error getting now-playing content')
                alert('ERROR: unknown error getting now-playing information')
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
                console.log('ERROR: unknown error getting on-demand content')
                alert('ERROR: unknown error getting on-demand content')
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
                console.log('ERROR: unknown error getting programs data')
                alert('ERROR: unknown error getting program information')
            });

    },

    buildOnDemandSection: async function(programsUrl, containerElement) {
        // build the on-demand listings page
        app.getProgramsPromise(programsUrl)
            .then(function(programCategories) {

                programCategories.forEach(function(category) {
                    var div = document.createElement("div");
                    div.classList.add('border-div');
                    var header = document.createElement("h2");
                    header.innerText = category.categoryName;
                    div.appendChild(header);

                    var programRows = document.createElement('div');
                    programRows.classList.add("programRows");

                    var i = 0;
                    category.programs.forEach(function(program) {
                        var title = document.createElement('p');
                        title.innerText = program.programName;
                        title.classList.add("programRow");
                        if (isEven(i)) {
                            title.classList.add("evenProgramRow");
                        } else {
                            title.classList.add("oddProgramRow");
                        }

                        var programPage = document.getElementById('program');

                        // add event tracker of click/tap
                        title.addEventListener('click', function(){
                            console.log('clicked on ' + program.programName);
                            programPage.innerText = ''; // make sure it's empty
                            app.addOnDemandText(program.feed, programPage);
                            app.togglePages('program');
                        });
                        programRows.appendChild(title);
                        i++;
                    });
                    div.appendChild(programRows);
                    containerElement.appendChild(div);
                });
                
            });
    },

    addOnDemandText: async function (url, element) {
        // build the on-demand content for a specific program
        app.getOnDemandXMLPromise(url).then(function(data) {
            // use the XML data like we would if we had a normal DOM reference

            // title
            var title = document.createElement('h1');
            title.innerText = data.querySelector("title").innerHTML;
            element.append(title);

            // escape button
            var button = document.createElement('button');
            button.innerText = "Go Back";
            button.addEventListener('click', function(){
                app.togglePages('ondemand')
            });
            element.appendChild(button);

            // summary text
            var summary = document.createElement('p');
            summary.innerHTML = data.querySelector("summary").innerHTML;
            element.appendChild(summary);

            // recordings
            var recordings = document.createElement('div');
            const items = data.querySelectorAll("item");
            var i = 0;
            items.forEach(el => {
                var newElement = document.createElement("p");
                newElement.classList.add("recordingRow");
                if (isEven(i)) {
                    newElement.classList.add("evenRecordingRow");
                } else {
                    newElement.classList.add("oddRecordingRow");
                }
                newElement.innerText = el.querySelector('title').innerHTML;
                newElement.addEventListener('click', function(){
                    app.setAudioSource(el.querySelector('enclosure').attributes.url.value);
                    app.playButtonEvent();
                    app.setPlayerText(el.querySelector('title').innerHTML);
                });
                recordings.appendChild(newElement);
                i++;
            });
            element.appendChild(recordings);
        });
    },
    
    displayAlerts: async function () {
        const response = await fetch(alertsURL);
        const alerts = await response.json();
        
        if (alerts.length > 0) {
          alerts.forEach(function(alert) {
            document.getElementById('ar-alerts').innerHTML += "<div class='AlertBar'><div class='AlertBar-message'>" + alert + "</div></div>";
          });
        } else {
          var element = document.getElementById('ar-alerts');
          element.style.display = 'none';
        }
    },

};

app.initialize();

// genaric helper functions
function isEven(n) {
   return n % 2 == 0;
}

