import Chip from "@material-ui/core/Chip";
import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import { Grid, Typography } from "@material-ui/core";

const style = {
  paddingLeft: "3.2%",
  scale: "1.3",
};

const iconStyle = {
  transform: "scale(1.4)",
};
const HappyIcon = () => {
  return <div style={iconStyle}>😄</div>;
};

const EnergyIcon = () => {
  return <div style={iconStyle}>⚡</div>;
};

const DanceIcon = () => {
  return <div style={iconStyle}>💃</div>;
};

const TempoIcon = () => {
  return <div style={iconStyle}>💨</div>;
};

const AcousticIcon = () => {
  return <div style={iconStyle}>🎻</div>;
};

const InstrumentalnessIcon = () => {
  return <div style={iconStyle}>🎹</div>;
};

const SpeechinessIcon = () => {
  return <div style={iconStyle}>🔊</div>;
};

const happier = <Chip style={style} icon={<HappyIcon />} label="Happier" />;

const moreEnergetic = (
  <Chip style={style} icon={<EnergyIcon />} label="Higher Energy" />
);

const dancing = (
  <Chip style={style} icon={<DanceIcon />} label="Better for Dancing" />
);

const speechiness = (
  <Chip style={style} icon={<SpeechinessIcon />} label="More Spoken Word" />
);

const instrumentalness = (
  <Chip
    style={style}
    icon={<InstrumentalnessIcon />}
    label="More Instrumental"
  />
);

const tempo = <Chip style={style} icon={<TempoIcon />} label="Higher Tempo" />;

const acoustic = (
  <Chip style={style} icon={<AcousticIcon />} label="More Accoustic" />
);

class ChipBadges extends React.Component {
  constructor(props) {
    super(props);
    let title = `${this.props.decade}'s`;
    if (this.props.user) {
      title = `My Top Tracks (${this.props.decade})`;
    }
    this.state = { title: title };
  }

  render() {
    return (
      <Grid container spacing={4}>
        <Grid item md={12} sm={12}>
          <Card variant="outlined">
            <Typography variant="h6">{this.state.title}</Typography>

            <List>
              {this.props.firstValue.averageValence >
              this.props.secondValue.averageValence ? (
                <div>
                  <Divider />
                  <ListItem>{happier}</ListItem>
                </div>
              ) : null}
              {this.props.firstValue.averageEnergy >
              this.props.secondValue.averageEnergy ? (
                <div>
                  <Divider />
                  <ListItem>{moreEnergetic}</ListItem>
                </div>
              ) : null}

              {this.props.firstValue.averageDanceability >
              this.props.secondValue.averageDanceability ? (
                <div>
                  <Divider />
                  <ListItem>{dancing}</ListItem>
                </div>
              ) : null}

              {this.props.firstValue.averageAcousticness >
              this.props.secondValue.averageAcousticness ? (
                <div>
                  <Divider />
                  <ListItem>{acoustic}</ListItem>
                </div>
              ) : null}

              {this.props.firstValue.averageInstrumentalness >
              this.props.secondValue.averageInstrumentalness ? (
                <div>
                  <Divider />
                  <ListItem>{instrumentalness}</ListItem>
                </div>
              ) : null}

              {this.props.firstValue.averageSpeechiness >
              this.props.secondValue.averageSpeechiness ? (
                <div>
                  <Divider />
                  <ListItem>{speechiness}</ListItem>
                </div>
              ) : null}
              {this.props.firstValue.averageTempo >
              this.props.secondValue.averageTempo ? (
                <div>
                  <Divider />
                  <ListItem>{tempo}</ListItem>
                </div>
              ) : null}
            </List>
          </Card>
        </Grid>
      </Grid>
    );
  }
}

export default ChipBadges;
