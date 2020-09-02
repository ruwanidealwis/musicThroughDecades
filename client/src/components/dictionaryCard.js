import React from "react";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
class DictionaryCard extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
  }
  //Card inspired from: https://material-ui.com/components/cards/
  render() {
    return (
      <Card elevation={3}>
        <CardContent>
          {" "}
          <Typography variant="h5" component="h2">
            {this.props.word}
          </Typography>
          <Typography color="textSecondary"> {this.props.type}</Typography>
          <Typography variant="body2" component="p">
            {this.props.defention}
            <br /> <br />
            <strong>{this.props.explanation}</strong>
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small">Learn More</Button>
        </CardActions>
      </Card>
    );
  }
}
export default DictionaryCard;
