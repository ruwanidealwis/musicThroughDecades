import { HorizontalBar } from "react-chartjs-2";
import { defaults } from "react-chartjs-2";
import React from "react";
import "chartjs-plugin-deferred";
import TitleText from "../SubComponents/titleText";
import Typography from "@material-ui/core/Typography";

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
class BarChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {
        labels: [this.props.decade, this.props.compare],
        borderSkipped: "top",
        beginAtZero: true,
        borderColor: "black",
        datasets: [
          {
            label: ` average ${this.props.feature} score`,
            backgroundColor: ["#81c784", "#9fa8da"],
            borderColor: "#9fa8da",

            hoverBackgroundColor: ["#81c784cc", "#9fa8dacc"],
            hoverBorderColor: "rgba(255,99,132,1)",
            data: [this.props.decadeValue, this.props.compareValue],
          },
        ],
      },
      options: {
        legend: {
          display: false,
        },
        animation: {
          duration: 3000,
        },
        maintainAspectRatio: false,
        scales: {
          yAxes: [
            {
              maxBarThickness: 20,
              ticks: {
                fontSize: 20,
              },
              gridLines: { drawBorder: false, lineWidth: 1 },
            },
          ],
          xAxes: [
            {
              gridLines: { drawBorder: true, lineWidth: 0 },
              ticks: {
                beginAtZero: true,
                suggestedMax: 100,
                display: true,
              },
            },
          ],
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
      <div style={style}>
        <Typography color="textSecondary" variant="h5">
          Average Popularity
        </Typography>
        <HorizontalBar data={this.state.data} options={this.state.options} />
      </div>
    );
  }
}
export default BarChart;
