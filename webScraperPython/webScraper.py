# import requests
import os
import requests
import re
from bs4 import BeautifulSoup
import sys
import csv
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv
load_dotenv()


def getDecadeInfo(decade):
    """[gets top 100 billboard songs of the specified decade]

    Args:
        decade ([stirng]): [specified decade]

    Returns:
        [finalList]: [list of the top 100 songs]
    """
    finalList = [["Song", "Artists", "Year",
                  "ArtistRank", "SongsId", "ArtistsId", "albumID"]]

    if(decade in ["1950", "1960", "1970", "1980", "1990", "2000"]):

        # TAKEN FROM: http://tsort.info/music/index.htm
        page = requests.get(
            "http://tsort.info/music/ds" + decade + ".htm")  # data from website...
        src = page.content
        soup = BeautifulSoup(src, 'html.parser')

        songs = [re.sub("\((.*?)\)", "", s.get_text().replace("'", ""))
                 for s in soup.find_all(class_="tit")]

        artists = [s.get_text().replace("'", "").replace("$", "s")
                   for s in soup.find_all(class_="art")]

        songTable = soup.findAll("table", {"class": "linkitem"})

        topArtists = []
        count = 0
        spotify = spotipy.Spotify(
            client_credentials_manager=SpotifyClientCredentials())

        for song in songTable[1].findAll("tr"):
            if(count != 0):
                songRow = song.find("td")
                if(songRow != None):
                    text = songRow.find("a")

                    topArtists.append(text.get_text().replace(
                        "'", "").replace("$", "s"))

            count += 1
       # print(topArtists)
        year = [s.get_text().replace("'", "")

                for s in soup.find_all(class_="yer")]

        for i in range(100):
            rank = 101
            results = spotify.search(
                q=songs[i] + " " + artists[i], type="track", limit=1)
            songId = ""
            artistsId = ""
            if(len(results['tracks']['items']) > 0):
                songId = results['tracks']['items'][0]['id']
                artistsId = ""
                albumId = results['tracks']['items'][0]['album']['id']
                for j in range(0, len(results['tracks']['items'][0]['artists'])):
                    songArtists = results['tracks']['items'][0]['artists'][j]
                    if len == 1:
                        artistsId = songArtists['id']
                    else:
                        if(j == 0):
                            artistsId = artistsId + songArtists['id']
                        else:
                            artistsId = artistsId + "," + songArtists['id']
                print(songId)
                print(artistsId)

            if(artists[i] in topArtists):
                rank = topArtists.index(artists[i]) + 1
            finalList.append([songs[i],
                              artists[i], int(year[i]), rank, songId, artistsId, albumId])
            with open("dataFiles/" + decade + ".csv", "w", newline='') as csvfile:
                writer = csv.writer(
                    csvfile, quoting=csv.QUOTE_NONNUMERIC, delimiter='|')
                writer.writerows(finalList)
        # get top artists of the decade...

    if(decade == "2010"):
        spotify = spotipy.Spotify(
            client_credentials_manager=SpotifyClientCredentials())

        # CSV TAKE FROM: http://chart2000.com/about.htm
        with open('/Users/ruwanidealwis/Downloads/GitHub/musicThroughDecades/webScraperPython/files/2010scharts.csv') as csv_file:
            csv_reader = csv.reader(csv_file, delimiter=',')
            line_count = 0
            for row in csv_reader:
                if line_count == 0:

                    line_count += 1
                else:
                    artist = row[2].replace("'", "").replace(
                        ",", " &").replace("$", "s")
                    song = re.sub("\((.*?)\)", "", row[3].replace("'", ""))
                    results = spotify.search(
                        q=song + " " + artist, type="track", limit=1)
                    songId = results['tracks']['items'][0]['id']
                    # albumId = results['tracks']['items'][0]['aprint(results['tracks']['items'][0])
                    albumId = results['tracks']['items'][0]['album']['id']
                    artistsId = ""
                    for j in range(0, len(results['tracks']['items'][0]['artists'])):
                        songArtists = results['tracks']['items'][0]['artists'][j]
                        if len == 1:
                            artistsId = songArtists['id']
                        else:
                            if(j == 0):
                                artistsId = artistsId + songArtists['id']
                            else:
                                artistsId = artistsId + "," + songArtists['id']
                    print(songId)
                    print(artistsId)

                    finalList.append(
                        [song, artist, 0, 101, songId, artistsId, albumId])
                    line_count += 1
                if(line_count == 101):
                    break  # only want first 10
        with open(decade + ".csv", "w", newline='') as csvfile:
            writer = csv.writer(
                csvfile, quoting=csv.QUOTE_NONNUMERIC, delimiter='|')
            writer.writerows(finalList)

    return finalList
    '''songTable = soup.find("tbody", {"class": "songlist"})
        for song in songTable.findAll("tr"):
            songRow = song.findAll("td")
            if(songRow[2].get_text() != "ARTIST"):
                artistNames.append(songRow[2].get_text().replace(
                    '"', "").replace("Featuring", "&").replace("'", ""))

        nextPage = ""

        for i in range(1, 4):
            page = requests.get(
                "http://tsort.info/music/ds" + decade + ".htm")

            src = page.content
            soup = BeautifulSoup(src, 'html.parser')

            # get the top songs and artists
            itemNames = [s.get_text().replace("'", "").split("/", 1)[0]
                         for s in soup.find_all(class_="item-name")]
            itemNamesFormatted = [' '.join(myString.split())
                                  for myString in itemNames]

            nextPage = "/list/" + str(i + 1)  # iterate to next page
            finalList = finalList + itemNamesFormatted
    elif(decade == "00s"):
        # must use different site for this data....
        page = requests.get(
            "https://www.cs.ubc.ca/~davet/music/list/Chart25.html")
        src = page.content
        soup = BeautifulSoup(src, 'html.parser')
        # get all song names
        songNames = [' '.join(myString.split()) for myString in (re.sub("\[(.*?)\]", "", s.get_text().replace(
            '"', "").replace("'", ""))
            for s in soup.tbody.select("a[href*=title]"))]
        artistNames = []
        songTable = soup.find("tbody")
        # get all artists (need to loop because there are multiple artists for some songs)
        for song in songTable.findAll("tr"):
            songRow = song.findAll("td")
            if(songRow[2].get_text() != "ARTIST"):
                artistNames.append(songRow[2].get_text().replace(
                    '"', "").replace("Featuring", "&").replace("'", ""))

        for i in range(100):
            # format like other ones
            finalList.append(songNames[i] + " - " + artistNames[i])
    elif(decade == "10s"):
        # must use different site for this data....
        page = requests.get(
            "https://www.billboard.com/charts/decade-end/hot-100")
        src = page.content
        soup = BeautifulSoup(src, 'html.parser')
        # get all the song names and artist names
        songNames = [' '.join(myString.split()) for myString in (re.sub("\((.*?)\)", "", s.get_text().replace("'", ""))
                                                                 for s in soup.find_all(class_="ye-chart-item__title"))]
        artistNames = [' '.join(myString.split()) for myString in (s.get_text().replace("Featuring", "&").replace("'", "")
                                                                   for s in soup.find_all(class_="ye-chart-item__artist"))]
        for i in range(100):
            # format like others
            finalList.append(songNames[i] + " - " + artistNames[i])

    return finalList


def getYearInfo(year):
    """[gets top songs for specificed year]

    Args:
        year ([type]): [specified year]

    Returns:
        [list]: [list of all top 100 songs of the year]
    """
    page = requests.get(
        "https://en.wikipedia.org/wiki/Billboard_Year-End_Hot_100_singles_of_" + str(year))
    src = page.content
    soup = BeautifulSoup(src, 'html.parser')
    songTable = soup.find("tbody")
    finalList = []
    # go through each row and get 2nd and third column to get it from table
    for song in songTable.findAll("tr"):
        songRow = song.findAll("td")
        if(len(songRow) != 0):
            print(songRow[0].get_text().replace('"', ""))
            print(songRow[1].get_text())
            # replace featuring and to match other formats
            finalList.append(songRow[0].get_text().replace('"', "") +
                             " - " + ' '.join((songRow[1].get_text().replace("featuring", "&").replace("and", "&").split())))
        print(len(finalList))
    return finalList'''


def getArtistInfo(decade):
    """[gets top artists of the specified decade]

    Args:
        decade ([stirng]): [specified decade]

    Returns:
        [finalList]: [list of the top 100 songs]
    """
    finalList = []

    if(decade in ["1950", "1960", "1970", "1980", "1990", "2000"]):

        page = requests.get(
            "http://tsort.info/music/ds" + decade + ".htm")  # data from website...

        src = page.content
        soup = BeautifulSoup(src, 'html.parser')
        songTable = soup.findAll("table", {"class": "linkitem"})
        count = 0
        topArtists = []
        spotify = spotipy.Spotify(
            client_credentials_manager=SpotifyClientCredentials())
        for song in songTable[1].findAll("tr"):
            if(count != 0):
                songRow = song.find("td")
                if(songRow != None):
                    text = songRow.find("a")
                    id = ""
                    result = spotify.search(q=text, type="artist", limit=1)
                    if(len(result['artists']['items']) > 0):

                        id = result['artists']['items'][0]['id']

                    print(id)

                topArtists.append([text.get_text().replace(
                    "'", "").replace("$", "s"), id])
            count += 1
            if(count > 10):
                break

        with open("dataFiles/" + decade + "Artists.csv", "w", newline='') as csvfile:
            writer = csv.writer(
                csvfile, quoting=csv.QUOTE_NONNUMERIC, delimiter='|')
            writer.writerows(topArtists)

        print(topArtists)
        # print(getDecadeInfo(sys.argv[1]))


print(getArtistInfo("1950"))
print(getArtistInfo("1960"))

print(getArtistInfo("1970"))
print(getArtistInfo("1980"))
print(getArtistInfo("1990"))
print(getArtistInfo("2000"))
