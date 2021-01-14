import { Radar } from "react-chartjs-2";
import React from "react";

class RadarChart extends React.Component {
  constructor(props) {
    super(props);

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
            backgroundColor: "#426e868e",
            borderColor: "#426e86",
            pointBackgroundColor: "#426e86",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#426e86",
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
            backgroundColor: "#f8a0558e",
            borderColor: "#f8a055",
            pointBackgroundColor: "#f8a055",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#f8a055",
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
