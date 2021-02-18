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
            backgroundColor: "#81c7848e",
            borderColor: "#81c784",
            pointBackgroundColor: "#81c784",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#81c784",
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
            backgroundColor: "#9fa8da8e",
            borderColor: "#9fa8da",
            pointBackgroundColor: "#9fa8da",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "#9fa8da",
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
