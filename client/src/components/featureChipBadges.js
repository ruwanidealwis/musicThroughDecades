import Chip from "@material-ui/core/Chip";
import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import { Grid, Typography } from "@material-ui/core";

const style = {
  paddingLeft: "2.3%",
};

const iconStyle = {
  transform: "scale(1.4)",
  height: "auto",
};

const LowImportanceIcon = () => {
  return <div style={iconStyle}>🔻</div>;
};

const HighImportanceIcon = () => {
  return <div style={iconStyle}>🔺</div>;
};
const HappyIcon = () => {
  return <div style={iconStyle}>😄</div>;
};
const SadIcon = () => {
  return <div style={iconStyle}>😔</div>;
};
const HighEnergyIcon = () => {
  return <div style={iconStyle}>⚡</div>;
};
const LowEnergyIcon = () => {
  return <div style={iconStyle}>🥱</div>;
};
const HighDanceIcon = () => {
  return <div style={iconStyle}>💃</div>;
};

const LowDanceIcon = () => {
  return <div style={iconStyle}>🧍‍♂️</div>;
};

const HighTempoIcon = () => {
  return <div style={iconStyle}>💨</div>;
};
const LowTempoIcon = () => {
  return <div style={iconStyle}>🐢</div>;
};
const HighAcousticIcon = () => {
  return <div style={iconStyle}>🎻</div>;
};
const LowAcousticIcon = () => {
  return <div style={iconStyle}>🎸</div>;
};
const HighInstrumentalnessIcon = () => {
  return <div style={iconStyle}>🎹</div>;
};
const LowInstrumentalnessIcon = () => {
  return <div style={iconStyle}>🎤</div>;
};
const HighSpeechinessIcon = () => {
  return <div style={iconStyle}>🔊</div>;
};
const LowSpeechinessIcon = () => {
  return <div style={iconStyle}>🔇</div>;
};
const happiest = (
  <Chip style={style} icon={<HappyIcon />} label="Happiest Music" />
);
const saddest = <Chip style={style} icon={<SadIcon />} label="Saddest Music" />;
const mostEnergy = (
  <Chip style={style} icon={<HighEnergyIcon />} label="Most Energy" />
);
const leastEnergy = (
  <Chip style={style} icon={<LowEnergyIcon />} label="Least Energy" />
);

const mostDance = (
  <Chip style={style} icon={<HighDanceIcon />} label="Best to Dance To" />
);

const leastDance = (
  <Chip style={style} icon={<LowDanceIcon />} label="Worst to Dance To" />
);

const lowestTempo = (
  <Chip style={style} icon={<HighTempoIcon />} label="Highest Tempo" />
);

const highestTempo = (
  <Chip style={style} icon={<LowTempoIcon />} label="Lowest Tempo" />
);

const lowestInstrumentalness = (
  <Chip
    style={style}
    icon={<HighInstrumentalnessIcon />}
    label="Most Instrumental"
  />
);

const highestInstrumentalness = (
  <Chip
    style={style}
    icon={<LowInstrumentalnessIcon />}
    label="Least Instrumental"
  />
);
const lowestSpeechiness = (
  <Chip
    style={style}
    icon={<LowSpeechinessIcon />}
    label="Least Spoken Words"
  />
);
const highestSpeechiness = (
  <Chip
    style={style}
    icon={<HighSpeechinessIcon />}
    label="Most Spoken Words"
  />
);

const HighAcousticness = (
  <Chip style={style} icon={<HighAcousticIcon />} label="Most Acoustic" />
);

const LowAcousticness = (
  <Chip style={style} icon={<LowAcousticIcon />} label="Least Acoustic" />
);

const mostContribution = (
  <Chip
    style={style}
    icon={<HighImportanceIcon />}
    label="Most Contributions"
  />
);

const leastContribution = (
  <Chip
    style={style}
    icon={<LowImportanceIcon />}
    label="Least Contributions"
  />
);

const map = {
  minValence: happiest,
  maxValence: saddest,
  minEnergy: leastEnergy,
  maxEnergy: mostEnergy,
  minDanceability: leastDance,
  maxDanceability: mostDance,
  maxTempo: highestTempo,
  minTempo: lowestTempo,
  maxSpeechiness: highestSpeechiness,
  minSpeechiness: lowestSpeechiness,
  maxAcousticness: HighAcousticness,
  minAcousticness: LowAcousticness,
  maxInstrumentalness: lowestInstrumentalness,
  minInstrumentalness: highestInstrumentalness,
  minContribution: leastContribution,
  maxContribution: mostContribution,
};

const divStyle = {
  margin: "auto",
};
class FeatureChipBadges extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Grid container spacing={4}>
        <Grid item md={12} sm={12}>
          <Card style={divStyle} variant="outlined">
            <Typography variant="h6">
              {`${this.props.title}'s` || "Fast Facts"}
            </Typography>

            <List>
              <div>
                <Divider />
                <ListItem>
                  {map[`min${this.props.searchKey}`]}
                  {"  "} : {this.props.min}
                </ListItem>
                <Divider />
                <ListItem>
                  {map[`max${this.props.searchKey}`]} {"  "} : {this.props.max}
                </ListItem>
              </div>
            </List>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default FeatureChipBadges;
