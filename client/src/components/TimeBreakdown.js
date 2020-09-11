import React from "react";

import LargeTitleText from "./SubComponents/largeTitleText";

import { Grid, Typography } from "@material-ui/core";

import VerticalBarChart from "./Charts/verticalBarChart";
import FeatureChipBadges from "./SubComponents/featureChipBadges";
import PieChart from "./Charts/pieChart";
class TimeBreakdown extends React.Component {
  constructor(props) {
    super(props);
    let minDecade = "";
    let maxDecade = "";
    if (this.props.user) {
      let keys = Object.keys(this.props.compareValueData.songsByDecade);
      let values = Object.values(this.props.compareValueData.songsByDecade);
      let min = Math.min(...values);
      let max = Math.max(...values);
      minDecade = keys[values.indexOf(min)];
      maxDecade = keys[values.indexOf(max)];
    }
    this.state = {
      decade: this.props.decade,
      compareValue: this.props.compareValue,
      decadeData: this.props.decadeData,
      compareValueData: this.props.compareValueData,
      user: this.props.user,
      minDecade: minDecade,
      maxDecade: maxDecade,
    };
  }

  render() {
    const { decade, compareValue, user, minDecade, maxDecade } = this.state;
    return (
      <Grid container style={{ width: "100%", marginBottom: "1%" }} spacing={4}>
        {this.state.user ? (
          <Grid container spacing={1}>
            <Grid item md={12} xs={12}>
              <LargeTitleText text={"Which Years Were The Most Influential?"} />
              <Typography variant="h6">
                Not all years are equally influentical, so which ones made the
                biggest mark?
                <br />
              </Typography>
            </Grid>
            <Grid item md={9} xs={12}>
              <VerticalBarChart
                decadeData={this.state.decadeData.distributionByYear}
                decade={decade}
                searchKey={"year"}
                user={user}
              ></VerticalBarChart>
            </Grid>
            <Grid style={{ margin: "auto" }} item md={3} xs={12}>
              <FeatureChipBadges
                min={
                  parseInt(
                    this.state.decadeData.distributionByYear.indexOf(
                      Math.min(...this.state.decadeData.distributionByYear)
                    )
                  ) + parseInt(decade)
                }
                max={
                  parseInt(
                    this.state.decadeData.distributionByYear.indexOf(
                      Math.max(...this.state.decadeData.distributionByYear)
                    )
                  ) + parseInt(decade)
                }
                searchKey={"Contribution"}
                title={`${decade}'s`}
              />
            </Grid>
            <Grid item md={12} xs={12}>
              {" "}
              <LargeTitleText
                text={"Where is Your Favourite Music From"}
              ></LargeTitleText>
            </Grid>
            <Grid item md={6} xs={12}>
              <PieChart
                data={this.props.compareValueData.songsByDecade}
                searchKey="decade"
                title="My Favourite Decades"
              />
            </Grid>
            <Grid item md={1} xs={0}></Grid>
            <Grid
              item
              style={{ margin: "auto" }}
              md={3}
              xs={12}
              direction="column"
              alignItems="center"
              justify="center"
            >
              <FeatureChipBadges
                min={minDecade}
                max={maxDecade}
                searchKey={"Contribution"}
                title={`My Favourite Decades's`}
              />
            </Grid>
            <Grid item md={2} xs={0}></Grid>
          </Grid>
        ) : (
          <Grid container spacing={1}>
            <Grid item md={12} xs={12} style={{ margin: "auto" }}>
              <LargeTitleText text={"Which Years Had the Most Influence?"} />
              <Typography variant="h6">
                Not All Years are equal, so which were the most influential in
                determining the top 100...
              </Typography>
            </Grid>
            <Grid item md={9} xs={12}>
              <VerticalBarChart
                decadeData={this.state.decadeData.distributionByYear}
                compareValueData={
                  this.state.compareValueData.distributionByYear
                }
                decade={decade}
                compareValue={compareValue}
                searchKey={"year"}
              ></VerticalBarChart>
            </Grid>
            <Grid style={{ margin: "auto" }} item md={3} xs={12}>
              <FeatureChipBadges
                min={
                  parseInt(
                    this.state.decadeData.distributionByYear.indexOf(
                      Math.min(...this.state.decadeData.distributionByYear)
                    )
                  ) + parseInt(decade)
                }
                max={
                  parseInt(
                    this.state.decadeData.distributionByYear.indexOf(
                      Math.max(...this.state.decadeData.distributionByYear)
                    )
                  ) + parseInt(decade)
                }
                searchKey={"Contribution"}
                title={`${decade}'s`}
              />
              <FeatureChipBadges
                min={
                  parseInt(
                    this.state.compareValueData.distributionByYear.indexOf(
                      Math.min(
                        ...this.state.compareValueData.distributionByYear
                      )
                    )
                  ) + parseInt(compareValue)
                }
                max={
                  parseInt(
                    this.state.compareValueData.distributionByYear.indexOf(
                      Math.max(
                        ...this.state.compareValueData.distributionByYear
                      )
                    )
                  ) + parseInt(compareValue)
                }
                searchKey={"Contribution"}
                t
                title={`${compareValue}'s`}
              />
              <br /> <br />
            </Grid>
            <br /> <br />
          </Grid>
        )}
      </Grid>
    );
  }
}

export default TimeBreakdown;
