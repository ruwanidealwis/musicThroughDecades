import "chartjs-plugin-deferred";
import React from "react";
import { Bar, defaults } from "react-chartjs-2";

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
class VerticalBarChart extends React.Component {
  constructor(props) {
    super(props);
    let decadeLabelArray = [];
    let decadeValueArray = [];
    let compareLabelArray = [];
    let compareValueArray = [];
    this.props.decadeData.forEach((object, index) => {
      decadeLabelArray.push(parseInt(this.props.decade) + index);
      decadeValueArray.push(object);
    });

    if (!this.props.user) {
      this.props.compareValueData.forEach((object, index) => {
        compareLabelArray.push(parseInt(this.props.decade) + index);
        compareValueArray.push(object);
      });
    }

    this.state = {
      data: {
        labels: [
          "Year 0",
          "Year 1",
          "Year 2",
          "Year 3",
          "Year 4",
          "Year 5",
          "Year 6",
          "Year 7",
          "Year 8",
          "Year 9",
        ],
        borderSkipped: "top",
        beginAtZero: true,
        borderColor: "black",
        datasets: [
          {
            label: `${this.props.decade}'s`,
            backgroundColor: "#81c784",
            borderColor: "#81c784",

            hoverBackgroundColor: [
              "#9FC195",
              "#408A9E",
              "#B6C8DC",
              "#435951",
              "#F7F2D3",
              "#EDAF7A",
              "#F26D79",
              "#7B7D88",
              "#B08E9E",
              "#5F5E72",
              "#736374",
              "#EBC459",
            ],
            hoverBorderColor: [
              "#9FC195",
              "#408A9E",
              "#B6C8DC",
              "#435951",
              "#F7F2D3",
              "#EDAF7A",
              "#F26D79",
              "#7B7D88",
              "#B08E9E",
              "#5F5E72",
              "#736374",
              "#EBC459",
            ],
            data: decadeValueArray,
          },
          {
            label: `${this.props.compareValue}'s`,
            backgroundColor: "#9fa8da",
            borderColor: "#9fa8da",

            hoverBackgroundColor: [
              "#9FC195",
              "#408A9E",
              "#B6C8DC",
              "#435951",
              "#F7F2D3",
              "#EDAF7A",
              "#F26D79",
              "#7B7D88",
              "#B08E9E",
              "#5F5E72",
              "#736374",
              "#EBC459",
            ],
            hoverBorderColor: [
              "#9FC195",
              "#408A9E",
              "#B6C8DC",
              "#435951",
              "#F7F2D3",
              "#EDAF7A",
              "#F26D79",
              "#7B7D88",
              "#B08E9E",
              "#5F5E72",
              "#736374",
              "#EBC459",
            ],
            data: compareValueArray,
          },
        ],
      },
      options: {
        animation: {
          duration: 3000,
        },

        aspectRatio: 2,
        responsive: true,
        scales: {
          xAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Year of Decade",
                fontSize: 14,
              },
              maxBarThickness: 20,
              ticks: {},
              gridLines: { drawBorder: false, lineWidth: 1 },
            },
          ],
          yAxes: [
            {
              scaleLabel: {
                display: true,
                labelString: "Number of Songs",
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

    if (this.props.user) {
      this.state.data.datasets.pop();
    }
  }

  render() {
    return (
      <div>
        <h6>Contribution by Year to Top 100 Songs of Decade</h6>
        <Bar data={this.state.data} options={this.state.options} />
      </div>
    );
  }
}
export default VerticalBarChart;
