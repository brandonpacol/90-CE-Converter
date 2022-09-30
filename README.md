# 90% Clean Converter
Demo website that converts explicit playlists to a 90% (or mostly) clean playlist on Spotify!
Go to https://brandonpacol.github.io/90-Clean-Converter/ to test it out!

## Introduction
Turning off explicit content in the Spotify app makes explicit songs unplayable across the application. For users who have playlists that only contain explicit music, they would not even have the ability to play a clean version of their playlist. This is where the 90% Clean Converter comes to help!

#### Why would I want a 90% Clean Playlist?
1. You want a mostly clean playlist but do not mind if a few songs are explicit. Some songs do not have a clean version. So adding the explicit version to your playlist is better than not adding the song at all!
2. If you do decide to turn off explicit content temporarily, 90% of your playlist is still playable! This is good for filtering your playlist when you play it to sensitive ears (ex. children, family parties, etc.).

## Technologies
Project is created using:
- HTML
- Javascript
- Bootstrap 5
- Spotify Web API

## Launch
To launch this demo app, you need to have a Spotify Developer account and a registered app with the correct settings.
In a real application, these steps would not be needed as the Client ID and Client Secret would be hidden on the server side. However, since I wanted to host this website on Github, this information would need to be entered.
1. Sign up or log into Spotify for Developers (it's free!): https://developer.spotify.com/
2. Go to https://developer.spotify.com/dashboard/applications and press create an app.
3. Give the app a name and description, check the agreement box, and press create.
4. Enter the app overview page and click on "Edit Settings".
5. Under redirect URIs enter the following: https://brandonpacol.github.io/90-Clean-Converter/home.html
6. Scroll down and click save.
7. In the app overview page, press "Show Client Secret".
8. Copy your Client ID and Client Secret.
9. Go to https://brandonpacol.github.io/90-Clean-Converter/ and enter your Client ID and Client Secret.
10. Press Login (this should redirect you to a Spotify URL).
11. Press Agree and you should be redirected to https://brandonpacol.github.io/90-Clean-Converter/home.html
12. Select a playlist you want to convert.
13. Check if you want to keep the explicit version if no clean version is found.
14. Press convert.
15. You should see the newly converted playlist in your account!

## Sources
- Video for that helped with Spotify authentication (https://www.youtube.com/watch?v=1vR3m0HupGI&t=1140s)
- Video for helping me learn how to use the Spotify API with Javascript (https://www.youtube.com/watch?v=SbelQW2JaDQ&t=62s)
