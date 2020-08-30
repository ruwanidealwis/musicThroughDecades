import React from "react";
import { css } from "@emotion/core";
import ScaleLoader from "react-spinners/ScaleLoader";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import "./music.css";
import TopTwentySongs from "./components/top20Songs";
import TopTwentyArtists from "./components/top20Artists";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Switch from "@material-ui/core/Switch";
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
      query: props.location.state.values,
      decade: props.location.state.values.split("-")[0],
      compareValue: props.location.state.values.split("-")[1],
      code: props.location.state.code,
      decadeData: [],
      compareValueData: [],
      toggleDecadeOn: false,
      toggleComparatorOn: false,
    };

    this.changeToggle = this.changeToggle.bind(this);
  }

  componentDidMount() {
    if (this.state.query == null) {
      this.props.history.replace({
        pathname: `/`,
      });
    }
    this.getData(this.state.query);
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
      <Paper className="infoContainer">
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
            <Typography align="center" color="textPrimary" variant="h3">
              <strong>
                {decade}'s vs {compareValue}'s
              </strong>
            </Typography>
            <Typography align="center" color="textSeconday" variant="subtitle1">
              <strong>
                All the top songs and artists have been gathered from:
                <Link
                  target="_blank"
                  color="textSecondary"
                  href="http://tsort.info/"
                >
                  tsort.info
                </Link>
              </strong>
            </Typography>
            <br />
            <Grid container spacing={6}>
              <Grid item md={6} xs={12}>
                <Typography align="center" color="textPrimary" variant="h6">
                  <strong>Top 10 Songs of the {decade}'s </strong>
                </Typography>
                <TopTwentySongs data={this.state.decadeData.top10Songs} />
                <br />
                <Typography align="center" color="textPrimary" variant="h6">
                  <strong>Top 10 Artists of the {decade}'s </strong>
                </Typography>
                <Grid container spacing={6}>
                  <Grid item alignItems="flex-start" md={4} xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={toggleDecadeOn}
                          onChange={() =>
                            this.changeToggle("toggleDecadeOn", toggleDecadeOn)
                          }
                          color="primary"
                          name="checkedB"
                          inputProps={{ "aria-label": "primary checkbox" }}
                          label="primary"
                        />
                      }
                      label="By Hits"
                    />
                  </Grid>
                  <Grid item md={8} xs={0}></Grid>
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
                <Typography align="center" color="textPrimary" variant="h6">
                  <strong>Top 10 Songs of the {compareValue}'s </strong>
                </Typography>
                <TopTwentySongs data={this.state.compareValueData.top10Songs} />
                <br />
                <Typography align="center" color="textPrimary" variant="h6">
                  <strong>Top 10 Artists of the {compareValue}'s </strong>
                </Typography>
                <Typography
                  align="center"
                  color="textSecondary"
                  variant="caption"
                ></Typography>
                <Grid container spacing={6}>
                  <Grid item alignItems="flex-start" md={4} xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={toggleComparatorOn}
                          onChange={() =>
                            this.changeToggle(
                              "toggleComparatorOn",
                              toggleComparatorOn
                            )
                          }
                          color="primary"
                          name="checkedB"
                          inputProps={{ "aria-label": "primary checkbox" }}
                          label="primary"
                        />
                      }
                      label="By Hits"
                    />
                  </Grid>
                  <Grid item md={8} xs={0}></Grid>
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
            </Grid>
          </div>
        )}
      </Paper>
    );
  }
}

export default Music;
