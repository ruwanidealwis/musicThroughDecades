import { Button, Grid, Typography } from "@material-ui/core";
import PlaylistAddIcon from "@material-ui/icons/PlaylistAdd";
import React from "react";
import LargeTitleText from "./SubComponents/largeTitleText";
import TopTwentySongs from "./SubComponents/top20Songs";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import Link from "@material-ui/core/Link";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";

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
    fetch(`/music/createPlaylist`)
      .then((res) => res.json())
      .then((data) => {
        console.log(data);

        this.setState({ playlistURL: data.url, open: true });
        console.log(this.state.playlistURL);
      });
  }
  componentDidUpdate() {
    console.log(this.state);
  }
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
                Checkout your new{" "}
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
