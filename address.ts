export const addressess: any = {
  sepolia: {
    STX_ADDRESS: "0x7Ae44D9950Db7b464b459b7BCF52616b3e91B1D6",
    RSTX_ADDRESS: "0xf62B24460Fda0cce125f63987C6f9fcF38320c27",
    FACTORY_ADDRESS: "0xF62c03E08ada871A0bEb309762E260a7a6a880E6",
    ROUTER_ADDRESS: "0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3",
    STX_FAUCET_ADDRESS: "0x963f22BAb21Db36884215ee77fD9Ce887241f36f",
    WETH_ADDRESS: "",
  },
  arbitrum_sepolia: {
    STX_ADDRESS: "0x7dE5CEdca10d8b851aD55Be6434c39a86674bb54",
    RSTX_ADDRESS: "0x2BCb93F7D8884410845fa1F8B8Df5df820673be3",
    FACTORY_ADDRESS: "0xD73c96023dd38ceF2fB7bc6A5dF7C99E734cb471",
    ROUTER_ADDRESS: "0x8983097150471FbbA0e0be8A49398D9F8744dD5C",
    STX_FAUCET_ADDRESS: "0x963f22BAb21Db36884215ee77fD9Ce887241f36f",
    WETH_ADDRESS: "0x980B62Da83eFf3D4576C647993b0c1D7faf17c73",
  },
  localhost: {
    DAI_ADDRESS: "0x4ed7c70F96B99c776995fB64377f0d4aB3B0e1C1",
    USDT_ADDRESS: "0xa85233C63b9Ee964Add6F2cffe00Fd84eb32338f",
    USDC_ADDRESS: "0x322813Fd9A801c5507c9de605d63CEA4f2CE6c44",
    WETH_ADDRESS: "0x4A679253410272dd5232B3Ff7cF5dbB88f295319",
    FACTORY_ADDRESS: "0x7a2088a1bFc9d81c55368AE168C2C02570cB814F",
    ROUTER_ADDRESS: "0xc5a5C42992dECbae36851359345FE25997F5C42d",
  },
};

export type SupportedToken = "STX" | "RSTX";

export type TokenInfo = {
  symbol?: SupportedToken;
  image?: string;
  addresses?: Record<number, string>; // token address per chain
  faucetAddresses?: Record<number, string>; // faucet address per chain
};

export type TokenCooldowns = Record<any, number>;

export const TOKENS: Record<string, TokenInfo> = {
  STX: {
    symbol: "STX",
    image: "/tokens/stx.svg",
    addresses: {
      421614: "0x7dE5CEdca10d8b851aD55Be6434c39a86674bb54",
    },
    faucetAddresses: {
      421614: "0x963f22BAb21Db36884215ee77fD9Ce887241f36f",
    },
  },
  RSTX: {
    symbol: "RSTX",
    image: "/tokens/rstx.svg",
    addresses: {
      421614: "0x2BCb93F7D8884410845fa1F8B8Df5df820673be3",
    },
    faucetAddresses: {
      421614: "0x2A71DB352DD6B4630327fc0C3f01fB3cc165EeF5",
    },
  },

  // APXFaucet: {
  //   faucetAddresses: {
  //     421614: "0x21c7789d1983A362d64b9EC25FD98E83719182b4",
  //   },
  // },
};
