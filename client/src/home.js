import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import ToggleButton from "react-bootstrap/ToggleButton";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import "./home.css";
import { ReactComponent as Headphones } from "./images/headphones.svg";

class Home extends React.Component {
  constructor(props) {
    super(props);

    const urlParams = new URLSearchParams(window.location.search);

    const isAuthorized = urlParams.has("authorized") ? true : false;
    this.state = {
      code: urlParams.get("code"),
      data: {},
      isAuthorized: isAuthorized,
      needsAuthorization: isAuthorized,
      decade: "",
      toCompare: "",
      fifties: false,
      sixties: false,
      seventies: false,
      eighties: false,
      nineties: false,
      twothousands: false,
      twenty10s: false,
      sixMonths: false,
      oneMonth: false,
      allTime: false,
      count: 0,
      disabled: false,
      firstValue: true,
      userPicked: false,
      fetching: false,
      picked: ["____________", "___________"],
    };
    this.needsUser = this.needsUser.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.toCompare = this.toCompare.bind(this);
    this.getData = this.getData.bind(this);
    this.checkToDisable = this.checkToDisable.bind(this);
    //this.style = this.style.bind(this);
  }

  componentDidMount() {
    //this.getStats();

    if (this.state.isAuthorized) {
      const values = JSON.parse(localStorage.getItem("query"));
      fetch(`/authTokens?code=${this.state.code}`)
        .then((response) => {
          sessionStorage.setItem("Authorization", response.headers.get("Authorization"));
          sessionStorage.setItem("RefreshToken", response.headers.get("refreshToken"));
        })
        .then(() => {
          console.log(localStorage.getItem("query").values);
          console.log(localStorage.getItem("query").valueOne);
          this.getData(values);
        });
    }
  }
  componentDidUpdate(previousProps, previousState) {}

  //TODO refactor : make this a map and get by key value
  getFormat(value) {
    switch (value) {
      case "fifties":
        return "1950";

      case "1950s":
        return "fifties";

      case "sixties":
        return "1960";

      case "1960s":
        return "sixties";

      case "seventies":
        return "1970";

      case "1970s":
        return "seventies";

      case "eighties":
        return "1980";

      case "1980s":
        return "eighties";

      case "nineties":
        return "1990";

      case "1990s":
        return "nineties";

      case "twothousands":
        return "2000";

      case "2000s":
        return "twothousands";

      case "twenty10s":
        return "2010";

      case "2010s":
        return "twenty10s";

      case "sixMonths":
        return "6Months";

      case "All Time":
        return "allTime";
      case "oneMonth":
        return "1Month";
      case "Last 6 Months":
        return "sixMonths";

      case "Last Month":
        return "oneMonth";

      default:
        return value;
    }
  }
  needsUser(secondValue) {
    let userSpotify = ["allTime", "sixMonths", "oneMonth"];
    if (userSpotify.includes(secondValue)) {
      this.setState({ needsAuthorization: true }); //need user authorization....
      return true;
    } else return false;
  }
  allowLogin() {
    fetch("/authorize", {method:"GET"})
      .then((res) => res.json())
      .then((data) => {
        window.location = data.url; //redirect to authorization  URL
      });
  }

  getData(values) {
    console.log(values);
    this.props.history.push({
      pathname: `/music`,
      state: {
        values: values,
        code: this.state.code,
        user: this.state.needsAuthorization,
      },
    });
  }

  async toCompare() {
    let keys = [
      "fifties",
      "sixties",
      "seventies",
      "eighties",
      "nineties",
      "twothousands",
      "twenty10s",
      "sixMonths",
      "oneMonth",
      "allTime",
    ];
    let userAuth = false;
    let values = "";
    let valueOne;
    let valueTwo;
    for (const key of keys) {
      if (this.state[key] === true) {
        if (values != "") {
          valueTwo = this.getFormat(key);
          values = values + this.getFormat(key);
        } else {
          values = values + this.getFormat(key) + "-";
          valueOne = this.getFormat(key);
        }
        userAuth = this.needsUser(key);
      }
    }
    if (userAuth) {
      const query = { valueOne: valueOne, valueTwo: valueTwo };
      localStorage.setItem("query", JSON.stringify(query));
      await this.allowLogin();
    } else {
      const values = { valueOne: valueOne, valueTwo: valueTwo };
      this.getData(values);
    }
  }

  checkToDisable(event) {
    if (event.checked === false) {
      this.setState({ count: this.state.count === 0 ? 0 : --this.state.count }); //dont decrease count if its already 0
    } else {
      this.setState({ count: ++this.state.count });
    }

    if (this.state.count >= 2) {
      this.setState({ disabled: true });
    } else {
      this.setState({ disabled: false });
    }
  }
  handleChange(event) {
    localStorage.setItem([event.value], event.checked); //set local storage...

    this.checkToDisable(event); //if reached limit --> disable
    let firstVal = this.state.count === 0 ? true : false; //first value picked
    let needUser = this.needsUser(event.value);

    if (event.checked === true) {
      //selected a value will be one of the two picked....
      //only two elements in the array so...

      let userPicked = [event.value, this.state.userPicked[1]];

      //console.log(ReactDOM.findDOMNode("1970s"));
      this.state[this.getFormat(this.state.picked[0])] === true
        ? this.setState({
            picked: [this.state.picked[0], event.parentNode.id],
          })
        : this.setState({
            picked: [event.parentNode.id, this.state.picked[1]],
          });
    } else {
      //unchecks...

      this.state.picked[0] === event.parentNode.id
        ? this.setState({
            picked: ["____________", this.state.picked[1]],
            needsAuthorization: needUser
              ? false
              : this.state.needsAuthorization,
          })
        : this.setState({
            picked: [this.state.picked[0], "____________"],
            needsAuthorization: needUser
              ? false
              : this.state.needsAuthorization,
          });
    }

    this.setState({
      firstValue: firstVal,
      [event.value]: event.checked,
      userPicked:
        (needUser && event.checked === true) ||
        (this.state.userPicked && !event.checked === false && needUser) ||
        (this.state.userPicked && !needUser), //unpick if the user unselects a value that needs a user... (has to select (ie:checked must be true))
      //doesnt pick a user but user one alreadu picked, so should stay true-->
      //needs to check if the one that was picked was unselected....
    });
  }

  render() {
    const {
      allTime,
      fifties,
      sixties,
      seventies,
      eighties,
      nineties,
      twenty10s,
      twothousands,
      firstValue,
      oneMonth,
      sixMonths,
      disabled,
    } = this.state;

    return (
      <Container fluid className="App">
        <h1 className="title"> MUSIC THROUGH THE DECADES </h1>
        <div>
          <Headphones className="headphones" />
        </div>

        <h5>
          Click on two decades to compare how different the top 100 hits of the
          decade are!
        </h5>

        <Container className="justify-content-md-center" fluid>
          <Row className="justify-content-md-center row-fluid" md={12} sm={1}>
            <Col className="col-md-12 justify-content-md-center" md={12} sm={1}>
              <ToggleButtonGroup
                className="buttonGroup justify-content-md-center"
                type="checkbox"
              >
                <ToggleButton
                  style={{
                    backgroundColor: fifties ? "#9fa8da" : "#81c784",
                  }}
                  id={"1950s"}
                  className="buttonToggle"
                  size="lg"
                  disabled={disabled && !fifties}
                  checked={fifties}
                  onChange={(e) => this.handleChange(e.currentTarget)}
                  value="fifties"
                >
                  1950s
                </ToggleButton>

                <ToggleButton
                  style={{
                    backgroundColor: sixties ? "#9fa8da" : "#81c784",
                  }}
                  id={"1960s"}
                  className="buttonToggle"
                  size="lg"
                  disabled={disabled && !sixties}
                  checked={sixties}
                  onChange={(e) => this.handleChange(e.currentTarget)}
                  value="sixties"
                >
                  1960s
                </ToggleButton>

                <ToggleButton
                  style={{
                    backgroundColor: seventies ? "#9fa8da" : "#81c784",
                  }}
                  id={"1970s"}
                  className="buttonToggle"
                  size="lg"
                  disabled={disabled && !seventies}
                  checked={seventies}
                  onChange={(e) => this.handleChange(e.currentTarget)}
                  value="seventies"
                >
                  1970s
                </ToggleButton>
                <ToggleButton
                  style={{
                    backgroundColor: eighties ? "#9fa8da" : "#81c784",
                  }} //={this.style(eighties)}
                  id={"1980s"}
                  className="buttonToggle"
                  type="checkbox"
                  size="lg"
                  disabled={disabled && !eighties}
                  checked={eighties}
                  value="eighties"
                  onChange={(e) => this.handleChange(e.currentTarget)}
                >
                  1980s
                </ToggleButton>
              </ToggleButtonGroup>
            </Col>
          </Row>
          <Row className="justify-content-md-center row-fluid" md={12} sm={1}>
            <Col className="col-md-12 justify-content-md-center" md={12} sm={1}>
              <ToggleButtonGroup
                className="buttonGroup justify-content-md-center"
                type="checkbox"
              >
                <ToggleButton
                  style={{
                    backgroundColor: nineties ? "#9fa8da" : "#81c784",
                  }}
                  id={"1990s"}
                  className="buttonToggle"
                  size="lg"
                  disabled={disabled && !nineties}
                  checked={nineties}
                  onChange={(e) => this.handleChange(e.currentTarget)}
                  value="nineties"
                >
                  1990s
                </ToggleButton>
                <ToggleButton
                  style={{
                    backgroundColor: twothousands ? "#9fa8da" : "#81c784",
                  }}
                  className="buttonToggle"
                  id={"2000s"}
                  size="lg"
                  disabled={disabled && !twothousands}
                  checked={twothousands}
                  onChange={(e) => this.handleChange(e.currentTarget)}
                  value="twothousands"
                  children="eighties"
                >
                  2000s
                </ToggleButton>
                <ToggleButton
                  id={"2010s"}
                  style={{
                    backgroundColor: twenty10s ? "#9fa8da" : "#81c784",
                  }}
                  className="buttonToggle"
                  size="lg"
                  disabled={disabled && !twenty10s}
                  checked={twenty10s}
                  onChange={(e) => this.handleChange(e.currentTarget)}
                  value="twenty10s"
                  children="eighties"
                >
                  2010s
                </ToggleButton>
                <Col></Col>
              </ToggleButtonGroup>
            </Col>
            <br></br>
          </Row>
        </Container>
        <div className="justify-content-md-center row-fluid">
          <br />
          <h5>
            You can also compare top tracks (within the given time range) to see
            how closely it matches a decade! If you click one of the options
            below,{" "}
            <strong>you will be redirected to the Spotify login page</strong>
          </h5>
          <ToggleButtonGroup type="checkbox" className=" buttonGroup">
            <ToggleButton
              style={{
                backgroundColor: allTime ? "#9fa8da" : "#81c784",
              }}
              size="lg"
              id={"All Time"}
              className="buttonToggle"
              disabled={
                (this.state.userPicked && !allTime) || (!allTime && disabled)
              } //first value has been picked, but second value hasnt
              checked={allTime}
              onChange={(e) => this.handleChange(e.currentTarget)}
              value="allTime"
            >
              All Time
            </ToggleButton>

            <ToggleButton
              style={{
                backgroundColor: sixMonths ? "#9fa8da" : "#81c784",
              }}
              id={"Last 6 Months"}
              className="buttonToggle"
              size="lg"
              disabled={
                (this.state.userPicked && !sixMonths) ||
                (!sixMonths && disabled)
              } //first value has been picked, but second value hasnt
              checked={sixMonths}
              onChange={(e) => this.handleChange(e.currentTarget)}
              value="sixMonths"
            >
              Last 6 Months
            </ToggleButton>

            <ToggleButton
              style={{
                backgroundColor: oneMonth ? "#9fa8da" : "#81c784",
              }}
              id={"Last Month"}
              className="buttonToggle"
              size="lg"
              disabled={
                (this.state.userPicked && !oneMonth) || (!oneMonth && disabled)
              } //first value has been picked, but second value hasnt
              checked={oneMonth}
              onChange={(e) => this.handleChange(e.currentTarget)}
              value="oneMonth"
            >
              Last Month
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
        <br></br>
        {this.state.firstValue ? (
          <h4>___________ vs ___________</h4>
        ) : (
          <h4>
            {this.state.picked[0]} vs {this.state.picked[1]}{" "}
          </h4>
        )}
        <Button
          className="compareButton"
          disabled={this.state.count < 2}
          onClick={() => {
            this.toCompare();
          }}
        >
          {this.state.needsAuthorization ? (
            <div>Login With Spotify & Compare</div>
          ) : (
            <div>Compare</div>
          )}
        </Button>
      </Container>
    );
  }
}

export default Home;

/* <FormControl component="fieldset">
              <FormGroup>
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={disabled && !seventies}
                      checked={seventies}
                      onChange={(e) => this.handleChange(e)}
                      name="seventies"
                    />
                  }
                  label="1970s"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={disabled && !seventies}
                      checked={seventies}
                      onChange={(e) => this.handleChange(e)}
                      name="seventies"
                    />
                  }
                  label="1970s"
                />
                <FormControlLabel
                  control={
                    <ToggleButton
                      disabled={disabled && !seventies}
                      selected={seventies}
                      onChange={(e) => this.handleChange(e)}
                      name="seventies"
                    />
                  }
                  label="1970s"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={disabled && !seventies}
                      checked={seventies}
                      onChange={(e) => this.handleChange(e)}
                      name="seventies"
                    />
                  }
                  label="1970s"
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={disabled && !eighties} //has to have met limit and also be unchecked
                      checked={eighties}
                      onChange={(e) => this.handleChange(e)}
                      name="eighties"
                    />
                  }
                  label="1980s"
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      disabled={this.state.firstValue || (!allTime && disabled)} //first value has been picked, but second value hasnt
                      checked={allTime}
                      onChange={(e) => this.handleChange(e)}
                      name="allTime"
                    />
                  }
                  label="allTime"
                />
              </FormGroup>
            </FormControl>*/
/*<div className="animation">
          <WaveSpinner color="#2e8b57" size={100} loading={true}></WaveSpinner>
        </div>*/
