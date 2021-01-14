import Grid from "@material-ui/core/Grid";
import React from "react";
import "../styles/top20.css";
import SongComponent from "./songComponent";

class TopThreeSongs extends React.Component {
  constructor(props) {
    super(props);
    //g(props);
  }
  render() {
    return (
      <Grid class="grid" container width="50vh" spacing={2}>
        <Grid container width="50vh" spacing={3}>
          {this.props.data.map((item, index) => {
            return <SongComponent item={item} index={index} arrItem={0} />;
          })}{" "}
        </Grid>
      </Grid>
    );
  }
}
export default TopThreeSongs;
