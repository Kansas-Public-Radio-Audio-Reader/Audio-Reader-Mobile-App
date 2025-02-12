
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
 - now playing information for live
 - on-demand catalog
 - program guide
 - app icons
 - audio player progress bar

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

