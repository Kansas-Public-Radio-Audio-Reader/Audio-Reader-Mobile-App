
_______________________________________________
 A U D I O   R E A D E R   M O B I L E   A P P 
===============================================

Developed for the Apache Cordova framework, to be ported
to the Android and iOS platforms. 

Author: Danny Mantyla
Date: October 2024 

FILES:
 - source/www/index.html
 	this defines the document structure, no JS code allowed in here, not even onclick="alert()" for example
 - spource/www/js/index.js
 	this is where all the logics goes. This is like the main file of the application.
 	everything has to be done with listener events sinse no inline code allowed in the html files

TODO: 
- [CHECK] now playing information for live
- [CHECK] on-demand catalog
- [CHECK] program guide
- [CHECK] app icons
-   audio player progress bar
- [CHECK] toggle play button for pause button
- [CHECK] set the now playing label 
- [CHECK] set options for play when screen is locked (ios only?)
     *        { playAudioWhenScreenIsLocked : true }
     *        Note: To allow playback with the screen locked or background audio you have to 
     *          add audio to UIBackgroundModes in the info.plist file.
     *          see: https://developer.apple.com/documentation/uikit#//apple_ref/doc/uid/TP40007072-CH4-SW23
- [CHECK] display "loading" while the stream is buffering and not yet playing [working in Android only
- [CHECK] be able to set the playback rate
- [CHECK] implement PAUSE
- [CHECK] implement back button/swipe [working in Android only]
- [CHECK] implement program schedule page
-  implement HLS stream for iOS ?
-  test Keep Playing in Background
-  add a "playing" label to On Demand recording when its selected and playing
- [CHECK] KC stream
-   test on screen readers 
- [CHECK] fix padding

___________________________
hot to use Apache Cordova:
===========================

to run the app in android: 
 - open Android Studio as needed
 - open the Virtual Device Manager from the More Actions dropdown
 - launch a virtual device
 - !IMPORTANT! In the virtual device, say 'yes' to allowing connected computer to control device
 - open a terminal
 - cd to AudioReaderApp
 - run `sudo cordova run android` 

to run the app in ios
 - open a terminal
 - cd to AudioReaderApp
 - run `cordova run ios`

