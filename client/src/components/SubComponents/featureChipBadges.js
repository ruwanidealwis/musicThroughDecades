import Chip from "@material-ui/core/Chip";
import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import { Grid, Typography } from "@material-ui/core";

const style = {
  paddingLeft: "2.3%",
  minWidth: "60%",
};

const iconStyle = {
  transform: "scale(1.4)",
  height: "auto",
};

const LowImportanceIcon = () => {
  return (
    <span aria-label="less important" role="img" style={iconStyle}>
      🔻
    </span>
  );
};

const HighImportanceIcon = () => {
  return (
    <span aria-label="highly important" role="img" style={iconStyle}>
      🔺
    </span>
  );
};
const HappyIcon = () => {
  return (
    <span aria-label="happy emoji" role="img" style={iconStyle}>
      😄
    </span>
  );
};
const SadIcon = () => {
  return (
    <span role="img" aria-label="sad emoji" style={iconStyle}>
      😔
    </span>
  );
};
const HighEnergyIcon = () => {
  return (
    <span aria-label="lightening bolt" role="img" style={iconStyle}>
      ⚡
    </span>
  );
};
const LowEnergyIcon = () => {
  return (
    <span aria-label="yawning" role="img" style={iconStyle}>
      🥱
    </span>
  );
};
const HighDanceIcon = () => {
  return (
    <span role="img" aria-label="woman dancing" style={iconStyle}>
      💃
    </span>
  );
};

const LowDanceIcon = () => {
  return (
    <span aria-label="man standing" role="img" style={iconStyle}>
      🧍‍♂️
    </span>
  );
};

const HighTempoIcon = () => {
  return (
    <span aria-label="dash" role="img" style={iconStyle}>
      💨
    </span>
  );
};
const LowTempoIcon = () => {
  return (
    <span aria-label="turtle" role="img" style={iconStyle}>
      🐢
    </span>
  );
};
const HighAcousticIcon = () => {
  return (
    <span aria-label="violin" role="img" style={iconStyle}>
      🎻
    </span>
  );
};
const LowAcousticIcon = () => {
  return (
    <span aria-label="electric guitar" role="img" style={iconStyle}>
      🎸
    </span>
  );
};
const HighInstrumentalnessIcon = () => {
  return (
    <span aria-label="keyboard" role="img" style={iconStyle}>
      🎹
    </span>
  );
};
const LowInstrumentalnessIcon = () => {
  return (
    <span aria-label="microphone" role="img" style={iconStyle}>
      🎤
    </span>
  );
};
const HighSpeechinessIcon = () => {
  return (
    <span aria-label="louad speaker" role="img" style={iconStyle}>
      🔊
    </span>
  );
};
const LowSpeechinessIcon = () => {
  return (
    <span aria-label="muted speaker" role="img" style={iconStyle}>
      🔇
    </span>
  );
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
        <Grid item md={12} sm={12} style={{ width: "90%", margin: "auto" }}>
          <Card style={divStyle} variant="outlined">
            <Typography variant="h6">
              {`${this.props.title}` || "Fast Facts"}
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
