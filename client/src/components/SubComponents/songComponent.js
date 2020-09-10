import React from "react";

import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import IconButton from "@material-ui/core/IconButton";
import "../styles/top20.css";

class SongComponent extends React.Component {
  constructor(props) {
    super(props);
    let songAudio = new Audio(this.props.item.previewURL || "");

    this.state = {
      item: this.props.item,
      index: this.props.index,
      arrItem: this.props.arrItem,
      isPlaying: false,

      audio: new Audio(this.props.item.previewURL || ""),
    };
    this.playAudio = this.playAudio.bind(this);
  }
  playAudio() {
    if (!this.state.audio.paused) {
      this.state.audio.pause();
      this.setState({ isPlaying: false });
    } else {
      this.state.audio.play();
      this.setState({ isPlaying: true });
    }
  }
  //adapoted from: https://stackoverflow.com/questions/47686345/playing-sound-in-reactjs
  componentDidMount() {
    this.state.audio.addEventListener("ended", () => {
      this.setState({ isPlaying: false });
    });
  }

  componentWillUnmount() {
    this.state.audio.addEventListener("ended", () => {
      this.setState({ isPlaying: false });
    });
  }

  pauseAudio() {
    var audio = new Audio(
      "https://p.scdn.co/mp3-preview/3eb16018c2a700240e9dfb8817b6f2d041f15eb1?cid=774b29d4f13844c495f206cafdad9c86"
    );

    audio.pause();
  }
  render() {
    const { item, index, arrItem } = this.state;
    return (
      <Card elevation={15} className="infoCard" bgcolor="grey.700" width="50%">
        <CardContent className="cardContent">
          <Grid container wrap="nowrap" spacing={2}>
            <Grid className="coverGrid" item>
              <CardMedia className="cover" image={item.image}>
                {" "}
                {item.previewURL != null ? (
                  <IconButton
                    style={{
                      scale: 0.8,
                      marginTop: "32%",
                      backgroundColor: "#ffffffb8",
                    }}
                    aria-label="play/pause"
                    onClick={() => this.playAudio()}
                  >
                    {!this.state.isPlaying ? (
                      <PlayArrowIcon style={{ scale: 0.8, marginTop: "10%" }} />
                    ) : (
                      <PauseIcon style={{ scale: 0.8, marginTop: "10%" }} />
                    )}
                  </IconButton>
                ) : null}
              </CardMedia>
            </Grid>
            <Grid wrap="nowrap" item xs>
              {" "}
              <Typography className="text" component="h5" variant="h5">
                <strong>
                  {index + arrItem + 1}.{" "}
                  {item.name.split("-")[0].replace(/ *\([^)]*\) */g, "")}
                </strong>
              </Typography>
              {this.props.popularity ? null : (
                <Typography
                  align="left"
                  className="text"
                  variant="subtitle2"
                  color="textSecondary"
                >
                  {item.year}
                </Typography>
              )}
              <Typography
                align="left"
                className="text"
                variant="subtitle2"
                color="textSecondary"
              >
                {item.artists.join(",  ")}
              </Typography>
              {this.props.popularity && item.rank != null ? (
                <div>
                  <Typography
                    align="left"
                    className="text"
                    variant="subtitle2"
                    color="textSecondary"
                  >
                    <strong> original rank: {item.rank + 1}</strong>
                  </Typography>
                </div>
              ) : null}
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  }
}
export default SongComponent;
