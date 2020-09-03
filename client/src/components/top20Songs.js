import React from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";

import "./top20.css";

class TopTwentySongs extends React.Component {
  constructor(props) {
    super(props);
    //g(props);
  }

  render() {
    let array = [0, 5];
    let size = 6;
    let addValue = 5;
    if (this.props.size != undefined) {
      size = this.props.size;
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
      <Grid container spacing={4}>
        {array.map((arrItem) => {
          return (
            <Grid item md={size} xs={12}>
              {this.props.data
                .slice(arrItem, arrItem + addValue)
                .map((item, index) => {
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
                            <Typography
                              className="text"
                              component="h5"
                              variant="h5"
                            >
                              <strong>
                                {index + arrItem + 1}.{" "}
                                {item.name.replace(/ *\([^)]*\) */g, "")}
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
                              {item.artists.toString()}
                            </Typography>
                            {this.props.popularity ? (
                              <div>
                                <Typography
                                  align="left"
                                  className="text"
                                  variant="subtitle2"
                                  color="textSecondary"
                                >
                                  <strong>popularity: {item.popularity}</strong>
                                </Typography>
                                <Typography
                                  align="left"
                                  className="text"
                                  variant="subtitle2"
                                  color="textSecondary"
                                >
                                  <strong> original rank: {item.rank}</strong>
                                </Typography>
                              </div>
                            ) : null}
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
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
