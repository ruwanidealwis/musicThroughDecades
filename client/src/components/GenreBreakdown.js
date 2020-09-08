import React from "react";

import LargeTitleText from "./largeTitleText";

import Grid from "@material-ui/core/Grid";

import PieChart from "./pieChart";
class GenreBreakdown extends React.Component {
  constructor(props) {
    super(props);
    let genreTitle = `Breakdown of Most Popular Genres in the ${this.props.compareValue}'s`;
    if (this.props.user) {
      genreTitle = `Breakdown of My Favourite Genres (${this.props.compareValue})`;
    }
    this.state = {
      decade: this.props.decade,
      compareValue: this.props.compareValue,
      decadeData: this.props.decadeData,
      compareValueData: this.props.compareValueData,
      user: this.props.user,
      genreTitle: genreTitle,
    };
  }

  render() {
    const { decade, compareValue, genreTitle } = this.state;
    return (
      <Grid container style={{ margin: "auto" }} spacing={4}>
        <Grid item md={12} xs={12}>
          <LargeTitleText text={"Which Genres Defined The Decade?"} />
        </Grid>
        <Grid item md={6} xs={12}>
          <PieChart
            data={this.state.decadeData.mostPopularGenres}
            searchKey={"genre"}
            title={`Breakdown of Most Popular Genres in the ${decade}`}
          ></PieChart>
        </Grid>
        <Grid item md={6} xs={12}>
          <PieChart
            data={this.state.compareValueData.mostPopularGenres}
            searchKey={"genre"}
            title={genreTitle}
          ></PieChart>
          <br /> <br />
        </Grid>
      </Grid>
    );
  }
}
export default GenreBreakdown;
