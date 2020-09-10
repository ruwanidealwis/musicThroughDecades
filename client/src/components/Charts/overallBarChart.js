import "chartjs-plugin-deferred";
import React from "react";
import { defaults, HorizontalBar } from "react-chartjs-2";

defaults.global.defaultFontColor = "black";
defaults.global.defaultFontFamily = "Roboto";
const style = {
  width: "80%",
  height: "50%",
  padding: "5%",
  paddingBottom: "1%",
  paddingTop: "1%",
  margin: "auto",
};
class OverallBarChart extends React.Component {
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
          "Tempo",
        ],
        borderSkipped: "top",
        beginAtZero: true,
        borderColor: "black",
        datasets: [
          {
            label: `${this.props.decade}'s`,
            backgroundColor: "#8894b6",
            borderColor: "#8894b6",

            hoverBackgroundColor: ["#8894b6cc"],
            hoverBorderColor: "rgba(255,99,132,1)",
            data: [
              this.props.decadeData.averageValence * 100,
              this.props.decadeData.averageEnergy * 100,
              this.props.decadeData.averageSpeechiness * 100,
              this.props.decadeData.averageDanceability * 100,
              this.props.decadeData.averageAcousticness * 100,

              this.props.decadeData.averageInstrumentalness * 100,
              this.props.decadeData.averageTempo,
            ],
          },
          {
            label: `${this.props.compareValue}'s`,
            backgroundColor: "#E28497",
            borderColor: "#E28497",

            hoverBackgroundColor: ["#8894b6cc"],
            hoverBorderColor: "rgba(255,99,132,1)",
            data: [
              this.props.compareValueData.averageValence * 100,
              this.props.compareValueData.averageEnergy * 100,
              this.props.compareValueData.averageSpeechiness * 100,
              this.props.compareValueData.averageDanceability * 100,
              this.props.compareValueData.averageAcousticness * 100,

              this.props.compareValueData.averageInstrumentalness * 100,
              this.props.compareValueData.averageTempo,
            ],
          },
        ],
      },
      options: {
        animation: {
          duration: 3000,
        },
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Feature",
                fontSize: 14,
              },
              maxBarThickness: 20,
              ticks: {},
              gridLines: { drawBorder: false, lineWidth: 1 },
            },
          ],
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Average Value",
                fontSize: 14,
              },

              gridLines: { drawBorder: true, lineWidth: 0 },
              ticks: {
                beginAtZero: true,
                suggestedMax: 1,
                display: true,
              },
            },
          ],
        },
        legend: {
          position: "right",
        },
        plugins: {
          deferred: {
            xOffset: 150, // defer until 150px of the canvas width are inside the viewport
            yOffset: "50%", // defer until 50% of the canvas height are inside the viewport
            delay: 500, // delay of 500 ms after the canvas is considered inside the viewport
          },
        },
      },
    };
  }

  render() {
    return (
      <div>
        <h6>Average Value of Music Features in Decade</h6>
        <HorizontalBar
          data={this.state.data}
          options={this.state.options}
          width={400}
          height={390}
        />
      </div>
    );
  }
}
export default OverallBarChart;
