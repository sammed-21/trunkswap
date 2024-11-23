import React from "react";

type Props = {};

export const RouteDetails = (props: Props) => {
  return (
    <div className="order-routing">
      <h2>Order Routing</h2>
      <p>Route: Uniswap → SushiSwap → PancakeSwap</p>
      <p>Estimated Gas Fee: ~0.003 ETH</p>
      <p>Price Impact: ~0.2%</p>
    </div>
  );
};
