/*import ChipBadges from "./chipBadges";
import OverallBarChart from "./overallBarChart";
import LargeTitleText from "./largeTitleText";
import PieChart from "./pieChart";
import SubTitleText from "./subTitleText";
import ModeDescription from "./modeDescription";
import { Grid, Button } from "@material-ui/core";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import TopTwentySongs from "./top20Songs";
class UserReccomendations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      decade: this.props.decade,
      compareValue: this.props.compareValue,
      decadeData: this.props.decadeData,
      compareValueData: this.props.compareValueData,
      user: this.props.user,
    };
  }

  render() {
    return (
      <Grid container style={{ margin: "1%" }} spacing={4}>
        <Grid item md={12} xs={12}>
          <LargeTitleText text={"Which Artists Ruled The Decade?"} />
        </Grid>
        <Grid item md={6} xs={12}>
          <TitleText text={`Top 10 Artists of the ${decade}'s`} />
          <Grid container spacing={6}>
            <Grid item md={9} xs={0}></Grid>
            <Grid item alignItems="flex-start" md={3} xs={12}>
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
        </Grid>
        <Grid item md={6} xs={12}>
          <TitleText text={`Top 10 Artists of the ${compareValue}'s`} />
          <Grid container spacing={6}>
            <Grid item md={9} xs={0}></Grid>
            <Grid item alignItems="flex-start" md={3} xs={12}>
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
        </Grid>
      </Grid>
    );
  }
}
*/
