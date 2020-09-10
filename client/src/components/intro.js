import React from "react";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Link from "@material-ui/core/Link";
import Button from "@material-ui/core/Button";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import "./styles/intro.css";
var Scroll = require("react-scroll");
var scroller = Scroll.scroller;
class Intro extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    let title = `${this.props.comparator}'s`;
    if (this.props.user) {
      title = `My Top Tracks`;
    }

    this.state = {
      title: title,
    };
  }

  scrollToElement(element) {
    scroller.scrollTo(element, {
      duration: 1500,
      smooth: true,
    });
  }
  render() {
    return (
      <Box className="box">
        <Grid container spacing={2}>
          <Grid item md={5} xs={12}>
            <Card className="decadeCard" elevation={14}>
              <CardContent>
                <Typography align="center" variant="h2">
                  {this.props.decade}'s
                </Typography>
                <br />
                <Typography align="center" variant="subtitle1">
                  {this.props.decadeDescription}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid
            item
            md={2}
            xs={12}
            direction="column"
            alignItems="center"
            justify="center"
            className="versusText"
          >
            <Typography align="center" variant="h3">
              VS
            </Typography>
          </Grid>
          <Grid item md={5} xs={12}>
            <Card className="decadeCard" id="card2" elevation={14}>
              <CardContent>
                <Typography align="center" variant="h2">
                  {this.state.title}
                </Typography>
                <br />
                <Typography align="center" variant="subtitle1">
                  {this.props.compareValueDescription ||
                    `(${this.props.comparator})`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid className="basicInfo" item md={12} xs={12}>
            <br></br>
            <Typography align="center" color="textPrimary" variant="h5">
              <strong>
                FIND OUT HOW DIFFERENT THE MUSIC FROM THESE TWO DECADES WERE...
              </strong>
              <Typography align="center" variant="subtitle1">
                <strong>
                  All the information is based on the 100 top songs gathered
                  from:
                  <Link target="_blank" href="http://tsort.info/">
                    {" "}
                    tsort.info
                  </Link>
                </strong>
              </Typography>
            </Typography>

            <Button
              className="scrollButton"
              onClick={() => {
                this.scrollToElement("allInfo");
              }}
            >
              v
            </Button>
          </Grid>
        </Grid>
      </Box>
    );
  }
}
export default Intro;
