import React from "react";

import { css } from "@emotion/core";
import ClockLoader from "react-spinners/ClockLoader";

import Paper from "@material-ui/core/Paper";

import "./music.css";

import Intro from "./components/intro";
import Grid from "@material-ui/core/Grid";

import AllSongFeatures from "./components/AllSongFeatures";
import UserReccomendations from "./components/UserReccomendations";
import TopSongs from "./components/topSongs";
import MostPopularSongs from "./components/MostPopularSongs";
import TimeBreakdown from "./components/TimeBreakdown";
import GenreBreakdown from "./components/GenreBreakdown";
import TopArtists from "./components/TopArtists";
var Scroll = require("react-scroll");
var Element = Scroll.Element;
const override = css`
  display: wrap;
  margin: "20%";
  border-color: red;
`;

class Music extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    console.log(window.performance);
    if (
      props.location.state == undefined ||
      props.location.state.values == undefined
    ) {
      this.props.history.replace("/");
    } else {
      let compareValue = props.location.state.values.split("-")[1];
      if (props.location.state.user) {
        if (compareValue === "6Months") {
          compareValue = "the last 6 months";
        } else if (compareValue === "1Month") {
          compareValue = "the last month";
        }
      }
      this.state = {
        loading: true,
        user: props.location.state.user,
        query: props.location.state.values,
        decade: props.location.state.values.split("-")[0],
        compareValue: compareValue,
        code: props.location.state.code,
        decadeData: [],
        compareValueData: [],

        populartyInView: false,
      };
    }
  }

  componentDidMount() {
    if (this.state != null) this.getData(this.state.query);
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

  render() {
    if (
      this.props.location.state == null ||
      this.state == null ||
      this.state.decade == null
    ) {
      return null;
    } else {
      const { decade, compareValue, user } = this.state;
      //switch code adapted from:https://material-ui.com/components/switches/#switch
      return (
        <Paper className="infoContainer" elevation={4}>
          <div className="loader">
            <ClockLoader
              size={200}
              color={"#2e8b57"}
              loading={this.state.loading}
            />
          </div>

          {this.state.loading ? null : (
            <div class="recievedData">
              <Intro
                decade={decade}
                comparator={compareValue}
                user={user}
              ></Intro>
              <br />
              <div class="musicInfo">
                <Element name="allInfo">
                  <Grid
                    container
                    spacing={5}
                    style={{ width: "100%", margin: "auto" }}
                  >
                    <Grid container spacing={5}></Grid>
                    <TopSongs
                      decade={decade}
                      compareValue={compareValue}
                      decadeData={this.state.decadeData}
                      compareValueData={this.state.compareValueData}
                      user={this.state.user}
                    />
                    <TopArtists
                      decade={decade}
                      compareValue={compareValue}
                      decadeData={this.state.decadeData}
                      compareValueData={this.state.compareValueData}
                      user={this.state.user}
                    />
                    <MostPopularSongs
                      decade={decade}
                      compareValue={compareValue}
                      decadeData={this.state.decadeData}
                      compareValueData={this.state.compareValueData}
                      user={this.state.user}
                    />
                    <GenreBreakdown
                      decade={decade}
                      compareValue={compareValue}
                      decadeData={this.state.decadeData}
                      compareValueData={this.state.compareValueData}
                      user={this.state.user}
                    />
                    <TimeBreakdown
                      decade={decade}
                      compareValue={compareValue}
                      decadeData={this.state.decadeData}
                      compareValueData={this.state.compareValueData}
                      user={this.state.user}
                    />
                    <AllSongFeatures
                      decade={decade}
                      compareValue={compareValue}
                      decadeData={this.state.decadeData}
                      compareValueData={this.state.compareValueData}
                      user={this.state.user}
                    />
                    {this.state.user ? (
                      <UserReccomendations
                        compareValueData={this.state.compareValueData}
                      />
                    ) : null}
                  </Grid>
                </Element>
              </div>
            </div>
          )}
        </Paper>
      );
    }
  }
}

export default Music;
/* <Grid item md={12} xs={12}>
                    <SubTitleText text={`Spotlight: Key`} />
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <PieChart
                      data={this.state.decadeData.keyDistribution}
                      searchKey={"key"}
                    ></PieChart>
                  </Grid>
                  <Grid item md={6} xs={12}>
                    <PieChart
                      data={this.state.compareValueData.keyDistribution}
                      searchKey={"key"}
                    ></PieChart>
                  </Grid>*/

//TODO fix bad information and add decade descrotion
//TODO make loading and front page nicer
//TODO add decade descriptions
//TODO make playlist create button nicer
