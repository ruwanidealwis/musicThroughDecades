# Music Through The Decades
An app that lets the user compare their top Spotify music to the top hundred songs from any of the past 5 decades.

## Motivation
I've always loved music from the past and I wanted to know how similar my general music taste was to that of mainstream music from the past. It was also a great way of discovering new music.

## What Does the Site Do?
* Allow comparison of two decades of music (top 100 hits of the 70s vs 80s)
* Allow comparisong of user and decade data  (top 100 hits of the 70s vs my top hits of all time)
* Comparison of: Songs, Artists, Valence (Happiness), Energy, Danceability, Mode (Major/Minor), Genres using ChartJs
* Reccomendations for user based on the decade they picked.

## Usage

The live site is available at: https://musicthroughdecades.herokuapp.com

## Data Credits

* The information of the top 100 hits comes from: https://tsort.info
* The audio features are derived using the Spotify API

## Tools

The backend is built with NodeJs (ExpressJs) and the front end is built with ReactJs with Material-UI. PostgreSQL is used as temporary storage (the data is only stored during the computation) and Python (BeautifulSoup) was used to read CSV and webscrape sites in order to retrive music data.
* NodeJs/ExpressJs
* ReactJs
* Material UI
* PostgreSQL
* Sequelize
* BeautifulSoup
* ChartJs

## Next Steps
* Use of Machine Learning to develop a more intelligent music reccomendation alogrithm. 
