import { Button, Grid, Typography } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import DialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import Link from "@material-ui/core/Link";
import CloseIcon from "@material-ui/icons/Close";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import React from "react";
import LargeTitleText from "./SubComponents/largeTitleText";
import TopTwentySongs from "./SubComponents/top20Songs";

class UserReccomendations extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      decade: this.props.decade,
      compareValue: this.props.compareValue,
      decadeData: this.props.decadeData,
      compareValueData: this.props.compareValueData,
      user: this.props.user,
      open: false,
      playlistURL: "",
    };
  }
  createPlaylist() {
    fetch(`/music/createPlaylist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        timeLength:this.state.compareValue,
        decade: this.state.decade,
        userID: this.state.compareValueData.userID,
        songIDArray: this.state.compareValueData.userReccomendations,
      }),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        this.setState({ playlistURL: data.url, open: true });
      });
  }
  componentDidUpdate() {}
  render() {
    const { open } = this.state;
    return (
      <Grid container style={{ margin: "1%" }} spacing={4}>
        <Grid item md={12} xs={12}>
          <LargeTitleText text={"We Think You Might Love These Tracks...."} />
        </Grid>

        <Grid
          className="playlistCreateGrid"
          item
          lg={4}
          md={12}
          xs={12}
          align="left"
        >
          <Button
            variant="contained"
            className="playlistButton"
            startIcon={<PlaylistAddIcon />}
            onClick={() => {
              this.createPlaylist();
            }}
          >
            Make Me a Playlist
          </Button>
        </Grid>
        <Grid item md={8} xs={12} align="left">
          <Typography variant="h6">
            These songs fit your average listening habits.
          </Typography>
        </Grid>

        <Grid item md={12} xs={12}>
          <TopTwentySongs
            data={this.state.compareValueData.userReccomendations}
            popularity={false}
            length={this.state.compareValueData.userReccomendations.length}
            size={3}
          />
        </Grid>
        <div>
          <Dialog
            open={open}
            className="dialogBox"
            keepMounted
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
          >
            {" "}
            <IconButton
              aria-label="close"
              style={{ width: "12%", align: "right" }}
              onClick={() => {
                this.setState({ open: !this.state.open });
              }}
            >
              <CloseIcon style={{ color: "white" }} />
            </IconButton>
            <Typography variant="subtitle1" style={{ fontSize: "1.8rem" }}>
              {"Just made you a playlist :)"}
            </Typography>
            <DialogContent>
              <Typography variant="body1">
                Check out your new{" "}
                <Link
                  className="link"
                  target="_blank"
                  href={this.state.playlistURL}
                >
                  playlist
                </Link>
              </Typography>
            </DialogContent>
          </Dialog>
        </div>
      </Grid>
    );
  }
}
export default UserReccomendations;
