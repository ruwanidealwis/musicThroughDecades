import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";

import "./top20.css";

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
            //console.log(item);
            return (
              <Card
                elevation={15}
                className="infoCard"
                bgcolor="grey.700"
                width="50%"
              >
                <CardContent className="cardContent">
                  <Grid container wrap="nowrap" spacing={2}>
                    <Grid className="coverGrid" item>
                      <CardMedia
                        className="cover"
                        image={item.image}
                      ></CardMedia>
                    </Grid>
                    <Grid wrap="nowrap" item xs>
                      {" "}
                      <Typography className="text" component="h5" variant="h5">
                        <strong>
                          {index + 1}. {item.name.replace(/ *\([^)]*\) */g, "")}
                        </strong>
                      </Typography>
                      <Typography
                        align="left"
                        className="text"
                        variant="subtitle2"
                        color="textSecondary"
                      >
                        {item.year}
                      </Typography>
                      <Typography
                        align="left"
                        className="text"
                        variant="subtitle2"
                        color="textSecondary"
                      >
                        {item.artists.toString()}
                      </Typography>
                      <Typography
                        align="left"
                        className="text"
                        variant="subtitle2"
                        color="textSecondary"
                      >
                        <strong>
                          {this.props.searchKey}: {item[this.props.searchKey]}
                        </strong>
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            );
          })}{" "}
        </Grid>
      </Grid>
    );
  }
}
export default TopThreeSongs;
