import React from "react";
import Typography from "@material-ui/core/Typography";
import Card from "@material-ui/core/Card";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import DictionaryCard from "./dictionaryCard";

const textStyle = {
  color: "#E28497",
  paddingLeft: "3%",
};
const bull = <span>•</span>;

class ModeDescription extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
  }
  //Card inspired from: https://material-ui.com/components/cards/
  render() {
    return (
      <Grid container spacing={6}>
        <Grid item md={12} xs={12}>
          <Typography align="center" variant="h6">
            Mode indicates the modality (major or minor) of a track, the type of
            scale from which its melodic content is derived
          </Typography>
        </Grid>
        <Grid item md={2} xs={0}></Grid>
        <Grid item md={4} xs={12}>
          <DictionaryCard
            word={"maj•or"}
            type={"noun"}
            defention={`(of a scale) having an interval of a semitone between the third
                and fourth degrees and the seventh and eighth degrees.`}
            explanation={`Major chords are often precieved as happy, bright and/or
                  cheery`}
          />
        </Grid>
        <Grid item md={4} xs={12}>
          <DictionaryCard
            word={"mi•nor"}
            type={"noun"}
            defention={`(of a scale) having intervals of a semitone between the second
                and third degrees, and (usually) the fifth and sixth, and the
                seventh and eighth.`}
            explanation={` Minor chords are often precieved as sad, dark and/or gloomy`}
          />
        </Grid>
        <Grid item md={2} xs={0}></Grid>
      </Grid>
    );
  }
}

export default ModeDescription;
