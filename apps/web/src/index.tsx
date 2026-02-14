import "./index.css";

import { FocusStyleManager } from "@blueprintjs/core";
import { createRoot } from "react-dom/client";
import { BrowserRouter as Router } from "react-router-dom";

import App from "./App";
import ConfigProvider from "./context/ConfigContext";
import * as serviceWorker from "./serviceWorker";

FocusStyleManager.onlyShowFocusOnTabs();

const container = document.querySelector("#root");
if (!container) {
  throw new Error("Root element not found");
}
const root = createRoot(container);

root.render(
  <Router>
    <ConfigProvider>
      <App />
    </ConfigProvider>
  </Router>,
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
