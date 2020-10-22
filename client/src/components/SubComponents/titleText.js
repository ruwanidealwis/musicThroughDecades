import React from "react";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
class TitleText extends React.Component {
  constructor(props) {
    super(props);
    //console.log(props);
  }

  render() {
    return (
      <div>
        <Typography className="typgoraphyText" align="left" variant="h5">
          <strong>{this.props.text}</strong>
        </Typography>
        <Divider className="divider" variant="middle" />
        <br />
      </div>
    );
  }
}

export default TitleText;
