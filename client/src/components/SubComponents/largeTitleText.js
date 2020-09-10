import React from "react";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

const textStyle = {
  color: "#9489A8",
  padding: "1.5%",
};

const dividerStyle = {
  marginLeft: "17%",
  marginRight: "17%",
  padding: "0.3%",
  backgroundColor: "#9489A8",
};
class LargeTitleText extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
  }

  render() {
    return (
      <div>
        <Typography
          className="largeText"
          style={textStyle}
          align="center"
          variant="h3"
        >
          <strong>{this.props.text} </strong>
        </Typography>
        <Divider style={dividerStyle} variant="middle" />
        <br />
      </div>
    );
  }
}

export default LargeTitleText;
