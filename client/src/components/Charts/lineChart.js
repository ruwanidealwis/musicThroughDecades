import React from "react";
import { Line } from "react-chartjs-2";
import "chartjs-plugin-deferred";

const style = {
  width: "100%",
  height: "70%",
};
class LineChart extends React.Component {
  constructor(props) {
    super(props);

    let dataArray = [];
    let decadeDataArray = [];
    let label = `${this.props.compare}'s`;
    if (this.props.user) {
      dataArray = [];
      if (this.props.feature != "Tempo") {
        for (let i = 0; i < 10; i++) {
          dataArray.push(this.props.compareValueData * 100);
          decadeDataArray = this.props.decadeData.map((x) => x * 100);
        }
      } else {
        for (let i = 0; i < 10; i++) {
          dataArray.push(this.props.compareValueData);
        }

        decadeDataArray = this.props.decadeData;
      }

      label = `My Average ${this.props.feature}`;
    } else {
      if (this.props.feature != "Tempo") {
        //taken from: https://stackoverflow.com/questions/8454977/how-do-i-multiply-each-member-of-an-array-by-a-scalar-in-javascript
        dataArray = this.props.compareValueData.map((x) => x * 100);
        decadeDataArray = this.props.decadeData.map((x) => x * 100);
      } else {
        dataArray = this.props.compareValueData;
        decadeDataArray = this.props.decadeData;
      }
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
        //adapted from: https://github.com/jerairrest/react-chartjs-2/blob/master/example/src/components/line.js
        datasets: [
          {
            label: `${this.props.decade}'s`,
            fill: false,
            lineTension: 0,
            backgroundColor: "#81c784",
            borderColor: "#81c784",
            borderCapStyle: "butt",

            pointBorderColor: "#81c784",
            pointBackgroundColor: "#81c784",
            pointBorderWidth: 3,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#81c784",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: decadeDataArray,
          },
          {
            label: label,
            fill: false,
            lineTension: 0.1,
            backgroundColor: "#9fa8da",
            borderColor: "#9fa8da",

            pointBorderColor: "#9fa8da",
            pointBackgroundColor: "#9fa8da",
            pointBorderWidth: 3,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: "#9fa8da",
            pointHoverBorderColor: "rgba(220,220,220,1)",
            pointHoverBorderWidth: 2,
            pointRadius: 1,
            pointHitRadius: 10,
            data: dataArray,
          },
        ],
      },
      options: {
        beginAtZero: true,
        maintainAspectRatio: false,
        animation: {
          duration: 3000,
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
        scales: {
          yAxes: [
            {
              ticks: {
                suggestedMax: this.props.max || 100,
                suggestedMin: this.props.min || 0,
                display: true,
              },
              gridLines: { drawBorder: false, lineWidth: 1 },
              scaleLabel: {
                display: true,
                labelString: this.props.feature,
                fontSize: 14,
              },
            },
          ],
          xAxes: [
            {
              gridLines: { drawBorder: false, lineWidth: 1 },
              scaleLabel: {
                display: true,
                labelString: "Year of Decade",
                fontSize: 14,
              },
            },
          ],
        },
      },
    };
  }

  render() {
    return (
      <div>
        <h5>
          Change in Average {this.props.feature} of Songs Year by Year of Decade
        </h5>
        <Line
          data={this.state.data}
          options={this.state.options}
          width={300}
          height={400}
        />
      </div>
    );
  }
}

export default LineChart;
