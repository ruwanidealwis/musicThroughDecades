import React from "react";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

const textStyle = {
  color: "#E28497",
  paddingLeft: "3%",
};

class SubTitleText extends React.Component {
  constructor(props) {
    super(props);
    console.log(props);
  }

  render() {
    return (
      <div>
        <Typography style={textStyle} align="center" variant="h4">
          <strong>{this.props.text.toUpperCase()} </strong>
        </Typography>

        <br />
      </div>
    );
  }
}

export default SubTitleText;