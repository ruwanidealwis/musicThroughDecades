import React from "react";

import { css } from "@emotion/core";
import ClockLoader from "react-spinners/ClockLoader";

import Paper from "@material-ui/core/Paper";

import "./music.css";

import Intro from "./components/intro";
import Grid from "@material-ui/core/Grid";

import AllSongFeatures from "./components/AllSongFeatures";
import UserReccomendations from "./components/UserReccomendations";
import TopSongs from "./components/TopSongs";
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

    if (
      props.location.state == undefined ||
      props.location.state.values == undefined
    ) {
      this.props.history.replace("/");
    } else {
      console.log(props.values);
      let compareValue = props.location.state.values.valueTwo;

      if (props.location.state.user) {
        if (compareValue === "6Months") {
          compareValue = "the last 6 months";
        } else if (compareValue === "1Month") {
          compareValue = "the last month";
        } else if (compareValue === "allTime") {
          compareValue = "All Time";
        }
      }
      this.state = {
        loading: true,
        user: props.location.state.user,
        query: props.location.state.values,
        decade: props.location.state.values.valueOne,
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
  //get decade data first ...
  getData(values) {
    console.log("hello");
    fetch(`/decadeData?decade=${values.valueOne}&code=${this.state.code}`, {
      headers: {
        Authorization: sessionStorage.getItem("Authorization"),
        RefreshToken: sessionStorage.getItem("RefreshToken"),
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        console.log(json);
        this.setState({
          decadeData: json.decadeData,
        });
      })
      .then(() => {
        if (this.state.code === null) {
          //another decade, so same request with different decade
          fetch(`/decadeData?decade=${values.valueTwo}&code=${this.state.code}`, {
            headers: {
              Authorization: localStorage.getItem("Authorization"),
              RefreshToken: localStorage.getItem("RefreshToken"),
            },
          })
            .then((res) => {
              return res.json();
            })
            .then((json) => {
              console.log(json);
              this.setState({
                compareValueData: json.decadeData,
                loading: false,
              });
            });
        } else {
          fetch(
            `/userData?timeLength=${values.valueTwo}&code=${this.state.code}`, 
            {
              headers: {
                Authorization: sessionStorage.getItem("Authorization"),
                RefreshToken: sessionStorage.getItem("RefreshToken"),
              },
            }
          )
            .then((res) => {
              return res.json();
            })
            .then((json) => {
              console.log(json);

              return json;
            })
            .then((data) => {
              fetch(
                `/userReccomendations?decade=${
                  values.valueOne
                }&averageValues=${JSON.stringify(data.averageValue)}`, 
                {
                  headers: {
                    Authorization: sessionStorage.getItem("Authorization"),
                    RefreshToken: sessionStorage.getItem("RefreshToken"),
                  },
                }
              )
                .then((res) => res.json())
                .then((json) => {
                  console.log(json);
                  let compareValueData = data.userData;
                  compareValueData.userReccomendations = json.reccomendations;
                  this.setState({
                    compareValueData: compareValueData,
                    loading: false,
                  });
                });
            });
        }
      });

    //TODO make dynamic

    /* fetch(`/compare/${values}?code=${this.state.code}`)
      .then((res) => {
        res.headers.forEach(console.log);
        return res.json();
      })
      .then((data) => {
        console.log(data);
        this.setState({
          decadeData: data[0].decade,
          compareValueData: data[1].comparator,
          loading: false,
        });
        console.log(this.state);
        localStorage.clear();
      });*/
  }

  render() {
    if (
      //check if null or undefined
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
                decadeDescription={this.state.decadeData.description}
                compareValueDescription={
                  this.state.compareValueData.description
                }
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
                        decade={decade}
                        compareValueData={this.state.compareValueData}
                        compareValue={compareValue}
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
