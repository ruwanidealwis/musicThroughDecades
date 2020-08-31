import { Doughnut } from "react-chartjs-2";
import { defaults } from "react-chartjs-2";
import React from "react";
import "chartjs-plugin-deferred";
import TitleText from "./titleText";
import Typography from "@material-ui/core/Typography";

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
    this.props.data.forEach((object) => {
      labelArray.push(object.genre);
      valueArray.push(object.count);
    });

    this.state = {
      data: {
        labels: labelArray,
        borderSkipped: "top",

        datasets: [
          {
            label: ` The Most Popular Genres`,
            backgroundColor: [
              "#435951",
              "#9FC195",
              "#F7F2D3",
              "#EDAF7A",
              "#F26D79",
              "#7B7D88",
              "#B08E9E",
              "#408A9E",
              "#B6C8DC",
              "#5F5E72",
            ],

            hoverBackgroundColor: ["#8894b6cc", "#8e6692cc"],
            hoverBorderColor: "rgba(255,99,132,1)",
            data: valueArray,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        animation: {
          duration: 3000,
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
        <Typography color="textSecondary" variant="h5">
          Average Popularity
        </Typography>
        <Doughnut
          data={this.state.data}
          options={this.state.options}
          width={400}
          height={400}
        />
      </div>
    );
  }
}
export default PieChart;
