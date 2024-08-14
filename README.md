# Creating a Client-Server TVML App

Display and navigate between TVML documents on Apple TV by retrieving and parsing information from a remote server.

## Overview

A TVML app creates a client-server connection to retrieve information stored on a server. The retrieved information is parsed into a document and displayed on a TV screen. Use this sample code project to create your first client-server app. The app uses JavaScript to load an initial TVML document from a local server. The user navigates between two images and the app loads a new document after the user selects one of the images. For detailed information about the TVML framework, see [TVML](https://developer.apple.com/documentation/tvml).

## Configure the Sample Code Project

Before running the app, you need to set up a local server on your machine:
1. In Finder, navigate to the fokusOnTVOSJSPlayerDemo directory inside of the fokusOnTVOSJSPlayerDemo project directory..
2. In Terminal, enter at the prompt, `cd` followed by a space.
3. Drag the fokusOnTVOSJSPlayerDemo folder from the Finder window into the Terminal window, and press Return. This changes the directory to that folder.
4. In Terminal enter `cd Server` to change to this folder.This folder contains our TVML app files.  
5. In Terminal, enter `ruby -run -ehttpd . -p9001` to run the server.
6. Build and run the app.

After testing the sample app in Apple TV Simulator, you can close the local server by pressing Control-C in Terminal. Closing the Terminal window also kills the server.

