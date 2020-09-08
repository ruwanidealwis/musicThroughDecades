import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
//import music from "./components/music";
import Home from "./home";
import Music from "./music";

import { Route, BrowserRouter } from "react-router-dom";

class App extends React.Component {
  constructor(props, context) {
    super(props, context);
  }
  render() {
    return (
      <BrowserRouter>
        <Route exact path="/" component={Home} />
        <Route exact path="/music" render={(props) => <Music {...props} />} />
      </BrowserRouter>
    );
  }
}

export default App;
