import React from "react";
import LineChart from "./lineChart";
import DictionaryCard from "./dictionaryCard";
import TopThreeSongs from "./topThreeSongs";
import Grid from "@material-ui/core/Grid";
import SubTitleText from "./subTitleText";
import Typography from "@material-ui/core/Typography";
import TitleText from "./titleText";

const style = {
  margin: "auto",
};
class SongFeatures extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    console.log(this.props.compareValueData[`average${this.props.feature}`]);
  }

  render() {
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
          />
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
              ] == undefined
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
          <TitleText text={`${this.props.compareValue}'s`} />
        </Grid>
        <Grid item md={3} xs={12}>
          <Typography variant="subtitle1">
            Lowest {this.props.feature} Songs of {this.props.decade}'s
          </Typography>
          <br />
          <TopThreeSongs
            data={this.props.decadeData[`lowest${this.props.feature}`]}
            searchKey={this.props.searchKey}
          />
        </Grid>
        <Grid item md={3} xs={12}>
          <br /> <br />
          <Typography variant="subtitle1">
            Highest {this.props.feature} Songs of {this.props.decade}'s
          </Typography>
          <br />
          <TopThreeSongs
            data={this.props.decadeData[`highest${this.props.feature}`]}
            searchKey={this.props.searchKey}
          />
        </Grid>

        <Grid item md={3} xs={12}>
          <Typography variant="subtitle1">
            Lowest {this.props.feature} Songs of {this.props.compareValue}'s
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
            Highest {this.props.feature} Songs of {this.props.compareValue}'s
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
