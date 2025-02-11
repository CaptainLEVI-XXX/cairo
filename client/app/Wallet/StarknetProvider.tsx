"use client";
import React from "react";

// import { InjectedConnector } from "starknetkit/injected";
// import {
//   ArgentMobileConnector,
//   isInArgentMobileAppBrowser,
// } from "starknetkit/argentMobile";
// import { WebWalletConnector } from "starknetkit/webwallet";
import { mainnet, sepolia } from "@starknet-react/chains";
import {
  StarknetConfig,
  argent,
  braavos,
  publicProvider,
} from "@starknet-react/core";
const connectors = [braavos(), argent()];
// const connectors = isInArgentMobileAppBrowser()
//   ? [
//       ArgentMobileConnector.init({
//         options: {
//           dappName: "Example dapp",
//           projectId: "example-project-id",
//           url: "example-url.com",
//         },
//         inAppBrowserOptions: {},
//       }),
//     ]
//   : [
//       new InjectedConnector({ options: { id: "braavos", name: "Braavos" } }),
//       new InjectedConnector({ options: { id: "argentX", name: "Argent X" } }),
//       new WebWalletConnector({ url: "https://web.argent.xyz" }),
//     ];
export default function StarknetProvider({ children }) {
  const chains = [mainnet, sepolia];

  return (
    <StarknetConfig
      chains={chains}
      provider={publicProvider()}
      connectors={connectors}
    >
      {children}
    </StarknetConfig>
  );
}
