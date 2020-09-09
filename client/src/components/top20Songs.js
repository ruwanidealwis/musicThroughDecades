import React from "react";

import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";
import PlayArrowIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import IconButton from "@material-ui/core/IconButton";
import "./top20.css";
import SongComponent from "./songComponent";

class TopTwentySongs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      audio: new Audio(
        "https://p.scdn.co/mp3-preview/3eb16018c2a700240e9dfb8817b6f2d041f15eb1?cid=774b29d4f13844c495f206cafdad9c86"
      ),
    };
  }
  playAudio() {
    if (!this.state.audio.paused) {
      this.state.audio.pause();
    } else {
      this.state.audio.play();
    }
  }

  pauseAudio() {
    var audio = new Audio(
      "https://p.scdn.co/mp3-preview/3eb16018c2a700240e9dfb8817b6f2d041f15eb1?cid=774b29d4f13844c495f206cafdad9c86"
    );

    audio.pause();
  }
  render() {
    let array = [0, 5];
    let size = 6;
    let addValue = 5;
    if (this.props.size !== undefined) {
      size = this.props.size;
      if (this.props.length % 4 === 0) {
        addValue = Math.floor(this.props.length / 4);
      } else if (this.props.length % 4 < 2) {
        addValue = Math.floor(this.props.length / 4) + (this.props.length % 4);
      } else if (this.props.length % 4 === 2) {
        addValue = Math.floor(this.props.length / 4) + 1;
      } else
        addValue =
          Math.floor(this.props.length / 4) + (4 - (this.props.length % 4));
      array = [];
      let i = 0;
      while (i < this.props.length) {
        array.push(i);
        i = i + addValue;
      }
    }

    //regex taken from:https://stackoverflow.com/questions/4292468/javascript-regex-remove-text-between-parentheses
    return (
      <Grid container spacing={2}>
        {array.map((arrItem) => {
          return (
            <Grid item lg={size} md={12} sm={12} xs={12}>
              {this.props.data
                .slice(arrItem, arrItem + addValue)
                .map((item, index) => {
                  //console.log(item);
                  return (
                    <div>
                      {" "}
                      <SongComponent
                        item={item}
                        index={index}
                        arrItem={arrItem}
                      ></SongComponent>
                      <iframe
                        src="https://open.spotify.com/embed/track/1eT2CjXwFXNx6oY5ydvzKU"
                        width="0"
                        height="0"
                        frameborder="0"
                        allowtransparency="true"
                        allow="encrypted-media"
                      ></iframe>
                    </div>
                  );
                })}{" "}
            </Grid>
          );
        })}
      </Grid>
    );
  }
}

export default TopTwentySongs;
