import React from "react";

import LargeTitleText from "./SubComponents/largeTitleText";

import { Grid, Button } from "@material-ui/core";

import TopTwentySongs from "./SubComponents/top20Songs";
import TitleText from "./SubComponents/titleText";
class TopSongs extends React.Component {
  constructor(props) {
    super(props);

    let title = `Top 10 Songs of the ${this.props.compareValue}'s`;
    if (this.props.user) {
      title = `My Top Tracks (${this.props.compareValue})`;
    }

    this.state = {
      decade: this.props.decade,
      compareValue: this.props.compareValue,
      decadeData: this.props.decadeData,
      compareValueData: this.props.compareValueData,
      user: this.props.user,
      title: title,
    };
  }

  render() {
    const { decade, compareValue, title } = this.state;
    return (
      <Grid container spacing={6} style={{ margin: "auto" }}>
        <Grid item md={12} xs={12}>
          <LargeTitleText text={"Which Songs Made The Biggest Mark?"} />
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
          <TitleText text={title} />
          <TopTwentySongs
            data={this.state.compareValueData.top10Songs}
            popularity={false}
          />
          <br /> <br />
        </Grid>
      </Grid>
    );
  }
}

export default TopSongs;
