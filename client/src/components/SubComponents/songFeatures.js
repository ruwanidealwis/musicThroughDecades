import React from "react";
import LineChart from "../Charts/lineChart";
import DictionaryCard from "./dictionaryCard";
import TopThreeSongs from "./topThreeSongs";
import Grid from "@material-ui/core/Grid";
import SubTitleText from "./subTitleText";
import Typography from "@material-ui/core/Typography";
import TitleText from "./titleText";
import FeatureChipBadges from "./featureChipBadges";

const style = {
  margin: "auto",
};
class SongFeatures extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    let compareText = `${this.props.compareValue}`;

    let minYear = "";
    let maxYear = "";
    let lowLabel = ` Lowest ${this.props.feature} Songs of the ${this.props.compareValue}'s`;
    let highLabel = ` Highest ${this.props.feature} Songs of the ${this.props.compareValue}'s`;
    console.log(this.props.compareValueData[`average${this.props.feature}`]);

    if (!this.props.user) {
      console.log("hi");
      let decadeMin = Math.min(
        ...this.props.decadeData[`yearlyAverage${this.props.feature}`]
      );
      let compareMin = Math.min(
        ...this.props.compareValueData[`yearlyAverage${this.props.feature}`]
      );

      let decadeMax = Math.max(
        ...this.props.decadeData[`yearlyAverage${this.props.feature}`]
      );
      let compareMax = Math.max(
        ...this.props.compareValueData[`yearlyAverage${this.props.feature}`]
      );

      let min = Math.min(compareMin, decadeMin);
      if (min === compareMin) {
        minYear =
          parseInt(this.props.compareValue) +
          parseInt(
            this.props.compareValueData[
              `yearlyAverage${this.props.feature}`
            ].indexOf(compareMin)
          );
      } else {
        minYear =
          parseInt(this.props.decade) +
          parseInt(
            this.props.decadeData[`yearlyAverage${this.props.feature}`].indexOf(
              decadeMin
            )
          );
      }
      let max = Math.max(compareMax, decadeMax);

      if (max === compareMax) {
        maxYear =
          parseInt(this.props.compareValue) +
          parseInt(
            this.props.compareValueData[
              `yearlyAverage${this.props.feature}`
            ].indexOf(compareMax)
          );
      } else {
        maxYear =
          parseInt(this.props.decade) +
          parseInt(
            this.props.decadeData[`yearlyAverage${this.props.feature}`].indexOf(
              decadeMax
            )
          );
      }
    } else {
      lowLabel = `My Lowest ${this.props.feature} Songs`;
      highLabel = `My Highest ${this.props.feature} songs`;
      compareText = `${this.props.compareValue}`;
    }
    this.state = {
      minYear: minYear,
      maxYear: maxYear,
      highLabel: highLabel,
      lowLabel: lowLabel,
      compareText: compareText,
    };
    console.log(this.state);
  }

  render() {
    const { minYear, maxYear, highLabel, lowLabel } = this.state;
    return (
      <Grid container spacing={4}>
        <Grid item md={12} xs={12}>
          <SubTitleText text={`Spotlight: ${this.props.feature}`} />
        </Grid>
        <Grid
          style={style}
          item
          md={3}
          xs={12}
          direction="column"
          alignItems="center"
          justify="center"
        >
          <DictionaryCard
            word={this.props.word}
            type={this.props.type}
            defention={this.props.defention}
            explanation={this.props.explanation}
            moreInfo={this.props.moreInfo}
          />
          {this.props.user ? null : (
            <div>
              {" "}
              <br />
              <FeatureChipBadges
                min={minYear}
                max={maxYear}
                searchKey={this.props.feature}
                title={"Fast Facts"}
              />
            </div>
          )}
        </Grid>
        <Grid item md={9} xs={12}>
          <LineChart
            decade={this.props.decade}
            compare={this.props.compareValue}
            decadeData={
              this.props.decadeData[`yearlyAverage${this.props.feature}`]
            }
            compareValueData={
              this.props.compareValueData[
                `yearlyAverage${this.props.feature}`
              ] === undefined
                ? this.props.compareValueData[`average${this.props.feature}`]
                : this.props.compareValueData[
                    `yearlyAverage${this.props.feature}`
                  ]
            }
            feature={this.props.feature}
            min={this.props.min}
            max={this.props.max}
            user={this.props.user}
          />
        </Grid>

        <Grid item md={6} xs={12}>
          <TitleText text={`${this.props.decade}'s`} />
        </Grid>
        <Grid item md={6} xs={12}>
          <TitleText text={this.state.compareText} />
        </Grid>
        <Grid item md={3} xs={12}>
          <Typography variant="subtitle1">
            <br /> <br />
            <strong>
              Lowest {this.props.feature} Songs of the {this.props.decade}'s
            </strong>
          </Typography>
          <br />
          <TopThreeSongs
            data={this.props.decadeData[`lowest${this.props.feature}`]}
            searchKey={this.props.searchKey}
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <Typography variant="subtitle1">
            <strong>
              {" "}
              Highest {this.props.feature} Songs of the {this.props.decade}'s
            </strong>
          </Typography>
          <br />
          <TopThreeSongs
            data={this.props.decadeData[`highest${this.props.feature}`]}
            searchKey={this.props.searchKey}
          />
        </Grid>

        <Grid item md={3} xs={12}>
          <Typography variant="subtitle1">
            <strong>{lowLabel}</strong>
          </Typography>
          <br />
          <TopThreeSongs
            data={this.props.compareValueData[`lowest${this.props.feature}`]}
            searchKey={this.props.searchKey}
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <br /> <br />
          <Typography variant="subtitle1">
            <strong>{highLabel}</strong>
          </Typography>
          <br />
          <TopThreeSongs
            data={this.props.compareValueData[`highest${this.props.feature}`]}
            searchKey={this.props.searchKey}
          />{" "}
        </Grid>
      </Grid>
    );
  }
}
export default SongFeatures;
