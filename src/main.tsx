import React from "react";
import ReactDOM from "react-dom/client";
import "@radix-ui/themes/styles.css";
import { Theme } from "@radix-ui/themes";
import App from "./App";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <Theme appearance="light" accentColor="blue" grayColor="slate" radius="large" scaling="100%">
      <App />
    </Theme>
  </React.StrictMode>,
);
