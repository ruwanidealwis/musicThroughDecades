import { Grid, Typography } from "@material-ui/core";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";
import React from "react";
import LargeTitleText from "./SubComponents/largeTitleText";
import TitleText from "./SubComponents/titleText";
import TopTwentyArtists from "./SubComponents/top20Artists";

class TopArtists extends React.Component {
  constructor(props) {
    super(props);

    let title = `Top 10 Artists of the ${this.props.compareValue}'s`;
    if (this.props.user) {
      title = `My Top Artists (${this.props.compareValue})`;
    }

    this.state = {
      decade: this.props.decade,
      compareValue: this.props.compareValue,
      decadeData: this.props.decadeData,
      compareValueData: this.props.compareValueData,
      user: this.props.user,
      toggleDecadeOn: false,
      toggleComparatorOn: false,
      title: title,
    };

    this.changeToggle = this.changeToggle.bind(this);
    this.switchControl = this.switchControl.bind(this);
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
  changeToggle(key, value) {
    this.setState({ [key]: !value });
  }

  render() {
    const { decade, toggleComparatorOn, toggleDecadeOn, title } = this.state;
    return (
      <Grid container spacing={6} style={{ margin: "auto" }}>
        {" "}
        <Grid item md={12} xs={12}>
          <LargeTitleText text={"Which Artists  Recieved The Most Love?"} />
        </Grid>
        <Grid item md={6} sm={12} xs={12}>
          <TitleText text={`Top 10 Artists of the ${decade}'s`} />
          <Grid container spacing={10}>
            <Grid item md={8} sm={0} xs={0}></Grid>
            <Grid
              item
              style={{ paddingRight: "0" }}
              alignItems="left"
              md={12}
              lg={4}
              sm={12}
              xs={12}
            >
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
          <Grid item>
            {this.state.decade === "2010" ? (
              <Typography variant="body1">
                The top overall artists of the 2010s is based on US data because
                the worldwide data is not yet available
              </Typography>
            ) : null}
          </Grid>
        </Grid>
        <Grid item md={6} xs={12}>
          <TitleText text={title} />
          <Grid container spacing={10}>
            <Grid item md={8} sm={0} xs={0}></Grid>
            <Grid
              item
              item
              style={{ paddingRight: "0", marginRight: "0" }}
              alignItems="left"
              md={12}
              lg={4}
              sm={12}
              xs={12}
              alignItems="flex-start"
            >
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
          <Grid item>
            {this.state.compareValue === "2010" ? (
              <Typography variant="body1">
                The top overall artists of the 2010s is based on US data because
                the worldwide data is not yet available
              </Typography>
            ) : null}
          </Grid>
        </Grid>
      </Grid>
    );
  }
}

export default TopArtists;
