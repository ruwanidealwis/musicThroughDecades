import React from "react";

import { Grid } from "@material-ui/core";

import LargeTitleText from "./largeTitleText";
import PieChart from "./pieChart";

import TopTwentySongs from "./top20Songs";
import TitleText from "./titleText";
import BarChart from "./barChart";

class MostPopularSongs extends React.Component {
  constructor(props) {
    super(props);
    let title = `Most Popular Songs of the ${this.props.compareValue}'s in 2020`;
    if (this.props.user) {
      title = `My Most Popular Tracks (of ${this.props.compareValue} )`;
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
      <Grid container style={{ margin: "auto" }} spacing={4}>
        <Grid item md={12} xs={12}>
          <LargeTitleText text={"Which Songs Stood The Test Of Time?"} />
          Some Songs, are more popular than others, so which of the top 100
          songs from the {decade}'s and {compareValue} are popular today ?
          <br />
          <br />
          <BarChart
            decade={decade}
            compare={compareValue}
            feature={"popularity"}
            decadeValue={this.state.decadeData.averagePopularity}
            compareValue={this.state.compareValueData.averagePopularity}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <TitleText text={`Most Popular Songs of the ${decade}'s in 2020`} />
          <TopTwentySongs
            data={this.state.decadeData.mostPopular}
            popularity={true}
          />
        </Grid>
        <Grid item md={6} xs={12}>
          <TitleText text={title} />
          <TopTwentySongs
            data={this.state.compareValueData.mostPopular}
            popularity={true}
          />
          <br /> <br />
          <br /> <br />
        </Grid>
      </Grid>
    );
  }
}

export default MostPopularSongs;
