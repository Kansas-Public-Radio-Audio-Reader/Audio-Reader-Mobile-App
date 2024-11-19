var app = {

    // member variables
    audioUrl: "https://streaming.kansaspublicradio.org:8001/audioreader",
    keepPlayingInBackground: true,
    mediaPlayer: null,
    playing: false,

    // Application Constructor
    initialize: function() {
        this.bindEvents();
        console.log('Audio Reader app is initialized');
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
    onDeviceReady: function() {

        // initialize the audio player
        app.initAudio();
        app.setPlayerText();

        // add event listeners here
        document.getElementById("menuButton").addEventListener('click', app.navigationEvent);
        document.querySelectorAll("a.navLink").forEach(function(page){
            page.addEventListener('click', app.changePageEvent);
        });
        document.getElementById("playButton").addEventListener('click', function(){app.playButtonEvent()});
        document.getElementById("pauseButton").addEventListener('click', function(){app.pauseButtonEvent()});

        // initialize the on-demand page
        var onDemandPage = document.getElementById("ondemand");
        fetch('https://audio-reader.kansaspublicradio.org/usa-today.xml')
            .then(response => response.text()) // first parse the response text
            .then(str => new window.DOMParser().parseFromString(str, "text/xml")) //Then parse the text with DOMParser()
            .then(data => {
                // Then use the data like we would if we had a normal DOM reference
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
                    onDemandPage.appendChild(newElement);
                });
            });
    },

    /*  _______________________________
     *   E V E N T   C A L L B A C K S
     *  ===============================
     */
    onPauseEvent: function() {
        console.log('paused');
    },

    onResumeEvent: function() {
        console.log('resumed');
    },

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

    /*  _____________________________________________
     *   A U D I O   P L A Y E R   F U N C T I O N S 
     *  =============================================
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
            function (err) { console.log("playAudio(): Audio Error: " + JSON.stringify(err)); }
        );
        this.mediaPlayer = newMediaPlayer;
        return newMediaPlayer;
    },

    /*    
     *   P L A Y   A U D I O
     *  url param: optional
     *  TODO: 
     *    - toggle play button for pause button
     *    - set the now playing label 
     *    - set options for play when screen is locked (ios only?)
     *        { playAudioWhenScreenIsLocked : true }
     *        Note: To allow playback with the screen locked or background audio you have to 
                add audio to UIBackgroundModes in the info.plist file.
                see: https://developer.apple.com/documentation/uikit#//apple_ref/doc/uid/TP40007072-CH4-SW23
     */
    playAudio: function() {
        this.mediaPlayer.play();
        this.playing = true;
    },

    pauseAudio: function() {
        // TODO: handle differently for stream vs on-demand ??
        this.mediaPlayer.pause();
        this.playing = false;
    },

    stopAudio: function() {
        this.mediaPlayer.stop();
        this.mediaPlayer.release(); // important for android
        this.playing = false;
    },

    setAudioSource: function(url) {
        this.audioUrl = url;
    },

    getAudioSource: function() {
        return this.audioUrl;
    },


    /*  _________________________________
     *   H E L P E R   F U N C T I O N S
     *  =================================
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

    getNowPlayingString: function () {
        return "now playing details coming soon...";
    },

    setPlayerText: function (text) {
        if (text == null) {
            document.getElementById("player-inner").innerText = app.getNowPlayingString();
        } else {
            document.getElementById("player-inner").innerText = text;
        }
    },
};

app.initialize();



