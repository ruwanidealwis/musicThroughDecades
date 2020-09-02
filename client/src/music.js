import React from "react";
import { css } from "@emotion/core";
import ScaleLoader from "react-spinners/ScaleLoader";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import "./music.css";
import TopTwentySongs from "./components/top20Songs";
import TopTwentyArtists from "./components/top20Artists";
import TitleText from "./components/titleText";
import LargeTitleText from "./components/largeTitleText";
import Intro from "./components/intro";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Switch from "@material-ui/core/Switch";
import Divider from "@material-ui/core/Divider";
import BarChart from "./components/barChart";
import PieChart from "./components/pieChart";
import SubTitleText from "./components/subTitleText";
import ModeDescription from "./components/modeDescription";
import SongFeatures from "./components/songFeatures";
var Scroll = require("react-scroll");
var Element = Scroll.Element;
const override = css`
  display: wrap;
  margin: 5% 5%;
  border-color: red;
`;

class Music extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      loading: true,
      user: props.location.state.user,
      query: props.location.state.values,
      decade: props.location.state.values.split("-")[0],
      compareValue: props.location.state.values.split("-")[1],
      code: props.location.state.code,
      decadeData: [],
      compareValueData: [],
      toggleDecadeOn: false,
      toggleComparatorOn: false,
      populartyInView: false,
    };

    this.changeToggle = this.changeToggle.bind(this);
    this.switchControl = this.switchControl.bind(this);
  }

  componentDidMount() {
    if (this.state.query == null) {
      this.props.history.replace({
        pathname: `/`,
      });
    }
    this.getData(this.state.query);
  }
  switchControl(value) {
    let toggle;
    let key = "";
    if (value === "toggleDecadeOn") {
      toggle = this.state.toggleDecadeOn;
      key = "toggleDecadeOn";
    } else {
      toggle = this.state.toggleComparatorOn;
      key = "toggleComparatorOn";
    }

    return (
      <FormControlLabel
        control={
          <Switch
            checked={toggle}
            onChange={() => this.changeToggle(key, toggle)}
            color="primary"
            name="checkedB"
            inputProps={{ "aria-label": "primary checkbox" }}
            label="primary"
          />
        }
        label="By Hits"
      />
    );
  }
  getData(values) {
    fetch(`/compare/${values}?code=${this.state.code}`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
        this.setState({
          decadeData: data.decade,
          compareValueData: data.comparator,
          loading: false,
        });
        localStorage.clear();
      });
  }
  changeToggle(key, value) {
    console.log(key);
    this.setState({ [key]: !value });
  }

  render() {
    const {
      decade,
      compareValue,
      toggleDecadeOn,
      toggleComparatorOn,
    } = this.state;
    //switch code adapted from:https://material-ui.com/components/switches/#switch
    return (
      <Paper className="infoContainer" elevation={4}>
        <ScaleLoader
          css={override}
          height={70}
          width={10}
          radius={300}
          margin={3}
          color={"#2e8b57"}
          loading={this.state.loading}
          text
        />

        {this.state.loading ? (
          <div> Getting Data....</div>
        ) : (
          <div class="recievedData">
            <Intro decade={decade} comparator={compareValue}></Intro>
            <br />
            <div class="musicInfo">
              <Element name="allInfo">
                <Grid container spacing={5}>
                  <Grid item md={12} xs={12}>
                    <LargeTitleText text={"Which Songs Had The Most Love?"} />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TitleText text={`Top 10 Songs of the ${decade}'s`} />
                    <TopTwentySongs
                      data={this.state.decadeData.top10Songs}
                      popularity={false}
                    />
                    <br /> <br />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TitleText text={`Top 10 Songs of the ${compareValue}'s`} />
                    <TopTwentySongs
                      data={this.state.compareValueData.top10Songs}
                      popularity={false}
                    />
                    <br /> <br />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <LargeTitleText text={"Which Artists Ruled The Decade?"} />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TitleText text={`Top 10 Artists of the ${decade}'s`} />
                    <Grid container spacing={6}>
                      <Grid item md={9} xs={0}></Grid>
                      <Grid item alignItems="flex-start" md={3} xs={12}>
                        {this.switchControl("toggleDecadeOn")}
                      </Grid>
                    </Grid>
                    {toggleDecadeOn ? (
                      <TopTwentyArtists
                        searchKey={"hits"}
                        data={this.state.decadeData.top10ArtistsByHits}
                      />
                    ) : (
                      <TopTwentyArtists
                        searchKey={""}
                        data={this.state.decadeData.topArtists}
                      />
                    )}
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TitleText
                      text={`Top 10 Artists of the ${compareValue}'s`}
                    />
                    <Grid container spacing={6}>
                      <Grid item md={9} xs={0}></Grid>
                      <Grid item alignItems="flex-start" md={3} xs={12}>
                        {this.switchControl("toggleComparatorOn")}
                      </Grid>
                    </Grid>
                    {toggleComparatorOn ? (
                      <TopTwentyArtists
                        searchKey={"hits"}
                        data={this.state.compareValueData.top10ArtistsByHits}
                      />
                    ) : (
                      <TopTwentyArtists
                        searchKey={""}
                        data={this.state.compareValueData.topArtists}
                      />
                    )}
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <LargeTitleText
                      text={"Which Songs Stood The Test Of Time?"}
                    />
                    Some Songs, are more popular than others, so which of the
                    top 100 songs from the {decade}'s and {compareValue} are
                    popular today (August, 2020)?
                    <br />
                    <br />
                    <BarChart
                      decade={decade}
                      compare={compareValue}
                      feature={"popularity"}
                      decadeValue={this.state.decadeData.averagePopularity}
                      compareValue={
                        this.state.compareValueData.averagePopularity
                      }
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TitleText
                      text={`Most Popular Songs of the ${decade}'s in 2020`}
                    />
                    <TopTwentySongs
                      data={this.state.decadeData.mostPopular}
                      popularity={true}
                    />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TitleText
                      text={`Most Popular Songs of the ${compareValue}'s in 2020`}
                    />
                    <TopTwentySongs
                      data={this.state.compareValueData.mostPopular}
                      popularity={true}
                    />
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <LargeTitleText text={"Which Genres Defined The Decade?"} />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TitleText text={`Most Popular Genres of ${decade}'s`} />
                    <PieChart
                      data={this.state.decadeData.mostPopularGenres}
                      searchKey={"genre"}
                    ></PieChart>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TitleText
                      text={`Most Popular Genres of ${compareValue}'s`}
                    />
                    <PieChart
                      data={this.state.compareValueData.mostPopularGenres}
                      searchKey={"genre"}
                    ></PieChart>
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <LargeTitleText text={"What Did The Music Sound Like?"} />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TitleText
                      text={`Most Popular Genres of ${compareValue}'s`}
                    />
                    <PieChart
                      data={this.state.decadeData.keyDistribution}
                      searchKey={"key"}
                    ></PieChart>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <TitleText
                      text={`Most Popular Genres of ${compareValue}'s`}
                    />
                    <PieChart
                      data={this.state.compareValueData.keyDistribution}
                      searchKey={"key"}
                    ></PieChart>
                  </Grid>
                  <Grid item md={12} xs={12}>
                    <SubTitleText text={`Spotlight: Mode`} />
                    <ModeDescription />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <PieChart
                      data={this.state.decadeData.modeDistribution}
                      searchKey={"mode"}
                    ></PieChart>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <PieChart
                      data={this.state.compareValueData.modeDistribution}
                      searchKey={"mode"}
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
                      max={0.5}
                      user={this.state.user}
                    />
                  </Grid>
                </Grid>
              </Element>
            </div>
          </div>
        )}
      </Paper>
    );
  }
}

export default Music;
