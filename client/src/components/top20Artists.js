import React from "react";

import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Grid from "@material-ui/core/Grid";

import "./top20.css";

class TopTwentyArtists extends React.Component {
  constructor(props) {
    super(props);
    //g(props);
  }

  render() {
    let array = [0, 5];
    return (
      <div>
        <Grid container spacing={2}>
          {array.map((arrItem) => {
            return (
              <Grid item md={6} xs={12}>
                {this.props.data
                  .slice(arrItem, arrItem + 5)
                  .map((item, index) => {
                    console.log(item);
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
                                  {index + arrItem + 1}. {item.name}
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
                                variant="subtitle1"
                                color="textSecondary"
                              >
                                {item[this.props.searchKey]}{" "}
                                {this.props.searchKey}
                              </Typography>
                              <Typography
                                align="left"
                                className="text"
                                variant="subtitle1"
                                color="textSecondary"
                              >
                                {item.genres.slice(0, 4).toString()}
                              </Typography>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    );
                  })}
              </Grid>
            );
          })}
        </Grid>
      </div>
    );
  }
}

export default TopTwentyArtists;
