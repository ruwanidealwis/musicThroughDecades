import { Radar } from "react-chartjs-2";
import React from "react";

class RadarChart extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
    this.state = {
      data: {
        labels: [
          "Valence",
          "Energy",
          "Speechiness",
          "Danceability",
          "Acousticness",
          "Instrumentalness",
        ],
        datasets: [
          {
            label: `${this.props.decade}`,
            backgroundColor: "#8894b68e",
            borderColor: "#8894b6",
            pointBackgroundColor: "#8894b6",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#8894b6",
            data: [
              this.props.decadeData.averageValence,
              this.props.decadeData.averageEnergy,
              this.props.decadeData.averageSpeechiness,
              this.props.decadeData.averageDanceability,
              this.props.decadeData.averageAcousticness,

              this.props.decadeData.averageInstrumentalness,
            ],
          },
          {
            label: `${this.props.compareValue}`,
            backgroundColor: "#E284978e",
            borderColor: "#E28497",
            pointBackgroundColor: "#E28497",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#E28497",
            data: [
              this.props.compareValueData.averageValence,
              this.props.compareValueData.averageEnergy,
              this.props.compareValueData.averageSpeechiness,
              this.props.compareValueData.averageDanceability,
              this.props.compareValueData.averageAcousticness,

              this.props.compareValueData.averageInstrumentalness,
            ],
          },
        ],
      },
    };
  }
  render() {
    return <Radar data={this.state.data} />;
  }
}
export default RadarChart;
