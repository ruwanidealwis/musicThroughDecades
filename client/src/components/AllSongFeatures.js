import React from "react";
import SongFeatures from "./songFeatures";
import { Grid } from "@material-ui/core";
import ChipBadges from "./chipBadges";
import OverallBarChart from "./overallBarChart";
import LargeTitleText from "./largeTitleText";
import PieChart from "./pieChart";
import SubTitleText from "./subTitleText";
import ModeDescription from "./modeDescription";

class AllSongFeatures extends React.Component {
  constructor(props) {
    super(props);
    let modeTitle = `Breakdown of the Mode of Songs in the ${this.props.compareValue}'s`;
    if (this.props.user) {
      modeTitle = `Breakdown of the Mode of My Top Songs (${this.props.compareValue})`;
    }
    this.state = {
      decade: this.props.decade,
      compareValue: this.props.compareValue,
      decadeData: this.props.decadeData,
      compareValueData: this.props.compareValueData,
      user: this.props.user,
      modeTitle: modeTitle,
    };
  }

  render() {
    const { decade, compareValue, modeTitle } = this.state;
    return (
      <Grid container spacing={4}>
        <Grid item md={12} xs={12}>
          <LargeTitleText text={"What Did The Music Sound Like?"} />
        </Grid>

        <Grid item md={12} xs={12}>
          <SubTitleText text={`Spotlight: Mode`} />
          <ModeDescription />
        </Grid>
        <Grid item md={6} xs={12}>
          <PieChart
            data={this.state.decadeData.modeDistribution}
            searchKey={"mode"}
            title={`Breakdown of the Mode of Songs in the ${decade}'s`}
          ></PieChart>
        </Grid>
        <Grid item md={6} xs={12}>
          <PieChart
            data={this.state.compareValueData.modeDistribution}
            searchKey={"mode"}
            title={modeTitle}
          ></PieChart>
        </Grid>
        <Grid item md={12} xs={12}>
          <SongFeatures
            decade={decade}
            feature={"Valence"}
            compareValue={compareValue}
            decadeData={this.state.decadeData}
            compareValueData={this.state.compareValueData}
            word={"Va•lence"}
            searchKey={"valence"}
            type={"noun"}
            defention={`A measure from 0.0 to 1.0 describing the musical positiveness conveyed by a track.`}
            explanation={`Tracks with high valence sound more positive (e.g. happy, cheerful, euphoric), while tracks with low valence sound more negative (e.g. sad, depressed, angry). `}
            user={this.state.user}
            moreInfo={
              "https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/"
            }
          />
        </Grid>
        <Grid item md={12} xs={12}>
          <SongFeatures
            decade={decade}
            feature={"Energy"}
            compareValue={compareValue}
            decadeData={this.state.decadeData}
            compareValueData={this.state.compareValueData}
            word={"En•er•gy"}
            type={"noun"}
            searchKey={"energy"}
            defention={`	Energy is a measure from 0.0 to 1.0 and represents a perceptual measure of intensity and activity.`}
            explanation={`Typically, energetic tracks feel fast, loud, and noisy. For example, death metal has high energy, while a Bach prelude scores low on the scale.`}
            user={this.state.user}
            moreInfo={
              "https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/"
            }
          />
        </Grid>
        <Grid item md={12} xs={12}>
          <SongFeatures
            decade={decade}
            feature={"Danceability"}
            compareValue={compareValue}
            decadeData={this.state.decadeData}
            compareValueData={this.state.compareValueData}
            word={"Dance·a·blity"}
            type={"noun"}
            searchKey={"danceability"}
            defention={`	Danceability describes how suitable a track is for dancing based on a combination of musical elements including tempo, rhythm stability, beat strength, and overall regularity. `}
            explanation={`TA value of 0.0 is least danceable and 1.0 is most danceable. `}
            user={this.state.user}
            moreInfo={
              "https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/"
            }
          />
        </Grid>
        <Grid item md={12} xs={12}>
          <SongFeatures
            decade={decade}
            feature={"Speechiness"}
            compareValue={compareValue}
            decadeData={this.state.decadeData}
            compareValueData={this.state.compareValueData}
            word={"Speech·iness"}
            type={"noun"}
            searchKey={"speechiness"}
            defention={`	Speechiness detects the presence of spoken words in a track. `}
            explanation={`Values above 0.66 describe tracks that are probably made entirely of spoken words. Values between 0.33 and 0.66 describe tracks that may contain both music and speech, either in sections or layered, including such cases as rap music. `}
            user={this.state.user}
            max={60}
            moreInfo={
              "https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/"
            }
          />
        </Grid>
        <Grid item md={12} xs={12}>
          <SongFeatures
            decade={decade}
            feature={"Tempo"}
            compareValue={compareValue}
            decadeData={this.state.decadeData}
            compareValueData={this.state.compareValueData}
            word={"tem·po"}
            type={"noun"}
            searchKey={"tempo"}
            defention={`the speed at which a passage of music is or should be played. `}
            explanation={`In musical terminology, tempo is the speed or pace of a given piece and derives directly from the average beat duration.  `}
            min={70}
            user={this.state.user}
            moreInfo={
              "https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/"
            }
          />
        </Grid>
        <Grid item md={12} xs={12}>
          <SongFeatures
            decade={decade}
            feature={"Acousticness"}
            compareValue={compareValue}
            decadeData={this.state.decadeData}
            compareValueData={this.state.compareValueData}
            word={"A·cous·tic·ness"}
            type={"noun"}
            searchKey={"acousticness"}
            defention={`(of popular music or musical instruments) not having electrical amplification.`}
            explanation={`1.0 represents high confidence the track is acoustic.   `}
            user={this.state.user}
            moreInfo={
              "https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/"
            }
          />
        </Grid>
        <Grid item md={12} xs={12}>
          <SongFeatures
            decade={decade}
            feature={"Instrumentalness"}
            compareValue={compareValue}
            decadeData={this.state.decadeData}
            compareValueData={this.state.compareValueData}
            word={"In·stru·men·tal·ness"}
            type={"noun"}
            searchKey={"instrumentalness"}
            defention={`	Predicts whether a track contains no vocals. “Ooh” and “aah” sounds are treated as instrumental in this context. Rap or spoken word tracks are clearly “vocal”. `}
            explanation={`The closer the instrumentalness value is to 1.0, the greater likelihood the track contains no vocal content.`}
            max={50}
            user={this.state.user}
            moreInfo={
              "https://developer.spotify.com/documentation/web-api/reference/tracks/get-audio-features/"
            }
          />
        </Grid>
        <Grid item md={12} xs={12}>
          <LargeTitleText
            text={`${decade}'s vs ${compareValue}'s: Head to Head`}
          />
        </Grid>
        <Grid item md={9} xs={12}>
          <OverallBarChart
            decade={decade}
            compareValue={compareValue}
            decadeData={this.state.decadeData}
            compareValueData={this.state.compareValueData}
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <ChipBadges
            decade={decade}
            firstValue={this.state.decadeData}
            secondValue={this.state.compareValueData}
            user={false}
          />

          <ChipBadges
            decade={compareValue}
            firstValue={this.state.compareValueData}
            secondValue={this.state.decadeData}
            user={this.state.user}
          />
        </Grid>
      </Grid>
    );
  }
}
export default AllSongFeatures;
