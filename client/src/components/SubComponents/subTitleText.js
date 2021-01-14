import React from "react";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";

const textStyle = {
  color: "#68968F",
  paddingLeft: "3%",
};

class SubTitleText extends React.Component {
  constructor(props) {
    super(props);
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
