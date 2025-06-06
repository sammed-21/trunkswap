// Add these utilities to your swap store or create a separate utilities file

import { PoolDetails } from "@/state/poolStore";
import { Token } from "@/lib/types";

export interface SwapRoute {
  path: string[];
  symbols: string[];
  type: "direct" | "multihop";
  hops: number;
}

// Build a graph of available pairs for route finding
export const buildPairGraph = (poolData: PoolDetails[]) => {
  const pairGraph: Record<string, Set<string>> = {};
  const tokenMap: Record<string, any> = {};

  poolData.forEach((pool) => {
    const token0 = pool.token0.address.toLowerCase();
    const token1 = pool.token1.address.toLowerCase();

    // Only include pairs with meaningful liquidity
    if (pool.reserve0 > 0 && pool.reserve1 > 0) {
      if (!pairGraph[token0]) pairGraph[token0] = new Set();
      if (!pairGraph[token1]) pairGraph[token1] = new Set();

      pairGraph[token0] + token1;
      pairGraph[token1] + token0;

      // Store token info for route building
      tokenMap[token0] = {
        address: pool.token0.address,
        symbol: pool.token0.symbol,
      };
      tokenMap[token1] = {
        address: pool.token1.address,
        symbol: pool.token1.symbol,
      };
    }
  });
  console.log(pairGraph, tokenMap, "this is the buildPirGraph");

  return { pairGraph, tokenMap };
};

// Check if token is ETH variant
export const isETHVariant = (token: Token): boolean => {
  return token.symbol === "ETH" || token.symbol === "WETH";
};

// Check if direct pair exists
export const hasDirectPair = (
  tokenA: string,
  tokenB: string,
  pairGraph: { [key: string]: Set<string> }
): boolean => {
  const tokenALower = tokenA.toLowerCase();
  const tokenBLower = tokenB.toLowerCase();
  return pairGraph[tokenALower]?.has(tokenBLower) || false;
};

// Find multi-hop route using BFS (Breadth-First Search)
export const findMultiHopRoute = (
  tokenA: string,
  tokenB: string,
  pairGraph: { [key: string]: Set<string> },
  tokenMap: { [key: string]: { address: string; symbol: string } },
  maxHops: number = 3
): { path: string[]; symbols: string[] } | null => {
  const tokenALower = tokenA.toLowerCase();
  const tokenBLower = tokenB.toLowerCase();

  if (tokenALower === tokenBLower) return null;

  // BFS to find shortest path
  const queue: { token: string; path: string[] }[] = [
    { token: tokenALower, path: [tokenALower] },
  ];
  const visited = new Set<string>([tokenALower]);

  while (queue.length > 0) {
    const { token: currentToken, path } = queue.shift()!;

    // If we've reached max hops, skip
    if (path.length > maxHops) continue;

    // Check all connected tokens
    const connectedTokens = pairGraph[currentToken];

    for (const nextToken of Array.from(connectedTokens)) {
      if (nextToken === tokenBLower) {
        // Found the target token
        const fullPath = [...path, nextToken];
        const symbols = fullPath.map(
          (addr) => tokenMap[addr]?.symbol || "Unknown"
        );
        return { path: fullPath, symbols };
      }

      if (!visited.has(nextToken) && path.length < maxHops) {
        visited.add(nextToken);
        queue.push({ token: nextToken, path: [...path, nextToken] });
      }
    }
  }

  return null;
};

// Check if multi-hop route exists (simplified version for quick checks)
export const hasMultiHopRoute = (
  tokenA: string,
  tokenB: string,
  pairGraph: { [key: string]: Set<string> }
): boolean => {
  const tokenALower = tokenA.toLowerCase();
  const tokenBLower = tokenB.toLowerCase();

  // Check direct route first
  if (hasDirectPair(tokenALower, tokenBLower, pairGraph)) {
    return true;
  }

  // Check 2-hop routes through intermediate tokens
  const intermediateTokens = pairGraph[tokenALower];
  if (!intermediateTokens) return false;

  for (const intermediate of Array.from(intermediateTokens)) {
    if (pairGraph[intermediate]?.has(tokenBLower)) {
      return true;
    }
  }

  return false;
};

// Find the best route between two tokens
export const findBestRoute = (
  tokenA: Token,
  tokenB: Token,
  poolData: PoolDetails[]
): SwapRoute | null => {
  const { pairGraph, tokenMap } = buildPairGraph(poolData);
  const tokenALower = tokenA.address.toLowerCase();
  const tokenBLower = tokenB.address.toLowerCase();

  // Handle ETH/WETH cases
  if (isETHVariant(tokenA) && isETHVariant(tokenB)) {
    return {
      path: [tokenA.address, tokenB.address],
      symbols: [tokenA.symbol, tokenB.symbol],
      type: "direct",
      hops: 1,
    };
  }

  // Check direct route
  if (hasDirectPair(tokenALower, tokenBLower, pairGraph)) {
    return {
      path: [tokenA.address, tokenB.address],
      symbols: [tokenA.symbol, tokenB.symbol],
      type: "direct",
      hops: 1,
    };
  }

  // Find multi-hop route
  const route = findMultiHopRoute(
    tokenALower,
    tokenBLower,
    pairGraph,
    tokenMap
  );
  if (route) {
    return {
      path: route.path,
      symbols: route.symbols,
      type: "multihop",
      hops: route.path.length - 1,
    };
  }

  return null;
};

// Check if any trading route exists between two tokens
export const canTrade = (
  tokenA: Token,
  tokenB: Token,
  poolData: PoolDetails[]
): boolean => {
  if (!tokenA || !tokenB) return true;

  // Handle ETH/WETH cases
  if (isETHVariant(tokenA) && isETHVariant(tokenB)) return true;

  const { pairGraph } = buildPairGraph(poolData);
  console.log({ pairGraph });
  return hasMultiHopRoute(tokenA.address, tokenB.address, pairGraph);
};

// Get all tradeable tokens for a given token
export const getTradableTokens = (
  baseToken: Token,
  allTokens: Token[],
  poolData: PoolDetails[]
): Token[] => {
  if (!baseToken) return allTokens;

  const { pairGraph } = buildPairGraph(poolData);

  return allTokens.filter((token) => {
    if (token.address.toLowerCase() === baseToken.address.toLowerCase()) {
      return false; // Exclude the base token itself
    }

    return canTrade(baseToken, token, poolData);
  });
};

// Get route information for display
export const getRouteInfo = (
  tokenA: Token,
  tokenB: Token,
  poolData: PoolDetails[]
): { type: string; hops: number; path?: string[] } => {
  const route = findBestRoute(tokenA, tokenB, poolData);

  if (!route) {
    return { type: "No route", hops: 0 };
  }

  return {
    type: route.type === "direct" ? "Direct" : "Multi-hop",
    hops: route.hops,
    path: route.symbols,
  };
};
