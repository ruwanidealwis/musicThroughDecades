import { Doughnut } from "react-chartjs-2";
import { defaults } from "react-chartjs-2";
import React from "react";
import "chartjs-plugin-deferred";

defaults.global.defaultFontColor = "black";
defaults.global.defaultFontFamily = "Roboto";
const style = {
  width: "100%",
  height: "80%",
  padding: "5%",
  paddingBottom: "1%",
  paddingTop: "1%",
  margin: "auto",
};
class PieChart extends React.Component {
  constructor(props) {
    super(props);
    let labelArray = [];
    let valueArray = [];

    if (this.props.searchKey === "decade") {
      labelArray = Object.keys(this.props.data);
      valueArray = Object.values(this.props.data);
    } else {
      this.props.data.forEach((object, index) => {
        if (this.props.searchKey === "mode") {
          labelArray = ["minor", "major"];
          valueArray.push(object.count);
        } else {
          labelArray.push(object[this.props.searchKey]);
          valueArray.push(object.count);
        }
      });
    }

    this.state = {
      data: {
        labels: labelArray,
        borderSkipped: "top",

        datasets: [
          {
            label: ` The Most Popular Genres`,
            backgroundColor: [
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

            hoverBackgroundColor: [
              "#9FC195cc",

              "#408A9Ecc",
              "#B6C8DCcc",
              "#435951cc",
              "#F7F2D3cc",
              "#EDAF7Acc",
              "#F26D79cc",
              "#7B7D88cc",
              "#B08E9Ecc",
              "#5F5E72cc",
              "#736374cc",
              "#EBC459cc",

              "#5F5E72",
              "#736374",
              "#EBC459",
            ],

            data: valueArray,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        animation: {
          duration: 3000,
        },
        legend: {
          position: "right",
        },
        tooltips: {
          //function taken from: https://stackoverflow.com/questions/37257034/chart-js-2-0-doughnut-tooltip-percentages
          callbacks: {
            label: function (tooltipItem, data) {
              //get the concerned dataset
              var dataset = data.datasets[tooltipItem.datasetIndex];
              //calculate the total of this data set
              var total = dataset.data.reduce(function (
                previousValue,
                currentValue,
                currentIndex,
                array
              ) {
                return previousValue + currentValue;
              });
              //get the current items value
              var currentValue = dataset.data[tooltipItem.index];
              //calculate the precentage based on the total and current item, also this does a rough rounding to give a whole number
              var percentage = Math.floor((currentValue / total) * 100 + 0.5);

              return percentage + "%";
            },
          },
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
        <h5>
          <strong>{this.props.title}</strong>
        </h5>
        <Doughnut
          data={this.state.data}
          options={this.state.options}
          width={300}
          height={300}
        />
      </div>
    );
  }
}
export default PieChart;
