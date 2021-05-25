import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import Map from "./views/Map";

const App = () => {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <Map />
        </Route>
      </Switch>
    </Router>
  );
};

export default App;
