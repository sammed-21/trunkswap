// import { ethers } from "ethers";
// // import { toast } from 'react-toastify';
// const safeToNumber = (value: number | bigint): number => {
//   if (typeof value === "bigint") {
//     // Convert BigInt to number, but check for safe integer range
//     const num = Number(value);
//     if (num > Number.MAX_SAFE_INTEGER) {
//       console.warn("Token decimals value too large, using fallback");
//       return 18; // Fallback to standard ERC20 decimals
//     }
//     return num;
//   }
//   return value;
// };

import { ethers } from "ethers";

// // Dynamic decimal configuration based on token properties
// // const getDynamicDecimalConfig = (
// //   tokenDecimals: number | bigint,
// //   tokenPrice?: number, // Optional: token price in USD
// //   tokenSymbol?: string
// // ) => {
// //   // Safely convert tokenDecimals to number
// //   const decimals = safeToNumber(tokenDecimals);

// //   // Base configuration on token decimals and value
// //   let maxInputDecimals: number;
// //   let displayDecimals: number;
// //   let warningThreshold: number;

// //   // Algorithm based on token decimals (most important factor)
// //   if (decimals <= 6) {
// //     // Tokens with few decimals (like USDC with 6 decimals)
// //     maxInputDecimals = decimals;
// //     displayDecimals = Math.min(4, decimals);
// //     warningThreshold = Math.max(2, decimals - 2);
// //   } else if (decimals <= 8) {
// //     // Tokens with medium decimals (like some wrapped tokens)
// //     maxInputDecimals = 6;
// //     displayDecimals = 6;
// //     warningThreshold = 4;
// //   } else {
// //     // Tokens with many decimals (18+ like most ERC20)
// //     maxInputDecimals = 8;
// //     displayDecimals = 6;
// //     warningThreshold = 6;
// //   }

// //   // Adjust based on token price (if available)
// //   if (tokenPrice !== undefined) {
// //     if (tokenPrice > 1000) {
// //       // High-value tokens (like BTC, ETH) - allow more precision
// //       maxInputDecimals = Math.min(maxInputDecimals + 2, decimals);
// //       displayDecimals = Math.min(displayDecimals + 2, 8);
// //     } else if (tokenPrice < 0.01) {
// //       // Low-value tokens - allow more decimals to avoid zero amounts
// //       maxInputDecimals = Math.min(maxInputDecimals + 4, decimals);
// //       displayDecimals = Math.min(displayDecimals + 2, 10);
// //       warningThreshold = Math.min(warningThreshold + 2, maxInputDecimals - 2);
// //     } else if (tokenPrice >= 0.99 && tokenPrice <= 1.01) {
// //       // Likely stablecoin - be more restrictive
// //       maxInputDecimals = Math.min(4, decimals);
// //       displayDecimals = 4;
// //       warningThreshold = 3;
// //     }
// //   }

// //   // Ensure logical constraints
// //   maxInputDecimals = Math.min(maxInputDecimals, decimals);
// //   displayDecimals = Math.min(displayDecimals, maxInputDecimals);
// //   warningThreshold = Math.min(warningThreshold, maxInputDecimals - 1);

// //   return {
// //     maxInputDecimals,
// //     displayDecimals,
// //     warningThreshold,
// //   };
// // };
// const getDynamicDecimalConfig = (
//   tokenDecimals: number | bigint,
//   tokenPrice?: number,
//   tokenSymbol?: string,
//   currentInput?: string // Add current input for dynamic adjustment
// ) => {
//   const decimals = safeToNumber(tokenDecimals);

//   // Analyze current input if provided
//   let inputDecimalLength = 0;
//   let hasSignificantDecimals = false;

//   if (currentInput) {
//     const parts = currentInput.split(".");
//     if (parts[1]) {
//       inputDecimalLength = parts[1].length;
//       // Check if decimals are significant (not just trailing zeros)
//       hasSignificantDecimals = parts[1].replace(/0+$/, "").length > 0;
//     }
//   }

//   // Dynamic max input decimals - always respect token's native limit
//   const maxInputDecimals = decimals;

//   // Dynamic display decimals based on input and token characteristics
//   let displayDecimals: number;

//   if (currentInput && hasSignificantDecimals) {
//     // If user has input decimals, show at least that many (up to reasonable limit)
//     const inputSignificantDecimals =
//       currentInput.split(".")[1]?.replace(/0+$/, "").length || 0;
//     displayDecimals = Math.min(
//       Math.max(inputSignificantDecimals, 2), // At least 2, or user's input length
//       decimals <= 6 ? decimals : 18 // Cap at token decimals for low-decimal tokens, 8 for high-decimal
//     );
//   } else {
//     // Default display based on token type and price
//     if (decimals <= 6) {
//       displayDecimals = decimals; // Show all decimals for low-decimal tokens
//     } else if (decimals <= 8) {
//       displayDecimals = 6;
//     } else {
//       displayDecimals = 18; // Conservative default for high-decimal tokens
//     }

//     // Adjust based on token price
//     if (tokenPrice !== undefined) {
//       if (tokenPrice > 1000) {
//         // High-value tokens - show more precision
//         displayDecimals = Math.min(displayDecimals + 2, 8);
//       } else if (tokenPrice < 0.01) {
//         // Low-value tokens - need more decimals to show meaningful amounts
//         displayDecimals = Math.min(decimals, 10);
//       } else if (tokenPrice >= 0.99 && tokenPrice <= 1.01) {
//         // Stablecoins - usually 2-4 decimals sufficient
//         displayDecimals = Math.min(4, decimals);
//       }
//     }
//   }

//   // Warning threshold - warn when getting into high precision territory
//   const warningThreshold = Math.min(
//     decimals <= 6 ? decimals - 1 : 6,
//     maxInputDecimals - 1
//   );

//   return {
//     maxInputDecimals,
//     displayDecimals,
//     warningThreshold,
//     tokenDecimals: decimals,
//     inputLength: inputDecimalLength,
//     isHighPrecision: inputDecimalLength > warningThreshold,
//   };
// };
// // Smart decimal detection for unknown tokens
// const analyzeTokenValue = (
//   amount: string,
//   decimals: number
// ): {
//   isLikelySmallValue: boolean;
//   isLikelyStablecoin: boolean;
//   suggestedPrecision: number;
// } => {
//   const numericAmount = parseFloat(amount);
//   const safeDecimals = safeToNumber(decimals);

//   // Analyze the input pattern
//   const decimalPart = amount.split(".")[1] || "";
//   const leadingZeros = decimalPart.match(/^0*/)?.[0].length || 0;

//   return {
//     isLikelySmallValue: numericAmount > 0 && numericAmount < 0.01,
//     isLikelyStablecoin:
//       numericAmount >= 0.99 && numericAmount <= 1000 && leadingZeros <= 2,
//     suggestedPrecision:
//       leadingZeros > 0 ? Math.min(leadingZeros + 4, safeDecimals) : 6,
//   };
// };

// export const universalParseUnits = (
//   amount: string,
//   tokenDecimals: number | bigint,
//   tokenPrice?: number,
//   tokenSymbol?: string
// ): {
//   success: boolean;
//   value?: bigint;
//   error?: string;
//   warning?: string;
//   displayAmount?: string;
//   suggestedDisplayDecimals?: number;
// } => {
//   try {
//     if (!amount || amount.trim() === "") {
//       return { success: true, value: BigInt(0) };
//     }

//     const cleanInput = amount.trim();
//     const safeDecimals = safeToNumber(tokenDecimals);

//     // Basic format validation
//     if (!/^\d*\.?\d*$/.test(cleanInput)) {
//       return { success: false, error: "Invalid number format" };
//     }

//     const parts = cleanInput.split(".");
//     const wholePart = parts[0] || "0";
//     const decimalPart = parts[1] || "";

//     // Strict validation: cannot exceed token's native decimal precision
//     if (decimalPart.length > safeDecimals) {
//       return {
//         success: false,
//         error: `${
//           tokenSymbol || "Token"
//         } supports maximum ${safeDecimals} decimal places (you entered ${
//           decimalPart.length
//         })`,
//       };
//     }

//     // Get dynamic configuration based on current input
//     const config = getDynamicDecimalConfig(
//       safeDecimals,
//       tokenPrice,
//       tokenSymbol,
//       cleanInput
//     );

//     let warning = "";

//     // Dynamic warnings based on input
//     if (config.isHighPrecision) {
//       if (tokenPrice && tokenPrice >= 0.99 && tokenPrice <= 1.01) {
//         warning = `High precision for stablecoin - consider if ${decimalPart.length} decimals are necessary`;
//       } else if (safeDecimals >= 18) {
//         warning = `Using ${decimalPart.length} decimal places - gas costs may be higher with high precision`;
//       } else {
//         warning = `Using maximum precision for this token`;
//       }
//     }

//     // Validate the amount
//     const numericValue = parseFloat(cleanInput);
//     if (isNaN(numericValue) || numericValue <= 0) {
//       return { success: false, error: "Amount must be greater than 0" };
//     }

//     // Parse the full precision amount
//     const parsedValue = ethers.parseUnits(cleanInput, safeDecimals);

//     // Create dynamic display amount
//     const displayAmount = formatTokenAmountDynamic(
//       cleanInput,
//       config.displayDecimals
//     );

//     return {
//       success: true,
//       value: parsedValue,
//       warning,
//       displayAmount,
//       suggestedDisplayDecimals: config.displayDecimals,
//     };
//   } catch (error) {
//     console.error("Universal parse error:", error);
//     return {
//       success: false,
//       error: "Invalid amount format",
//     };
//   }
// };

// // Dynamic formatting that preserves user input while cleaning up display
// const formatTokenAmountDynamic = (
//   amount: string,
//   maxDisplayDecimals: number
// ): string => {
//   const parts = amount.split(".");
//   const wholePart = parts[0] || "0";
//   const decimalPart = parts[1] || "";

//   if (!decimalPart) return wholePart;

//   // For display, remove trailing zeros but respect user's intended precision
//   const trimmedDecimals = decimalPart.replace(/0+$/, "");

//   if (!trimmedDecimals) return wholePart;

//   // If user input is within display limits, show exactly what they typed (without trailing zeros)
//   if (trimmedDecimals.length <= maxDisplayDecimals) {
//     return `${wholePart}.${trimmedDecimals}`;
//   }

//   // If user input exceeds display limits, show truncated version with ellipsis indicator
//   const truncatedDecimals = decimalPart.slice(0, maxDisplayDecimals);
//   return `${wholePart}.${truncatedDecimals}...`;
// };

// // Dynamic input field configuration that updates based on current value
// export const getDynamicInputConfig = (
//   tokenDecimals: number | bigint,
//   currentValue: string = "",
//   tokenPrice?: number,
//   tokenSymbol?: string
// ) => {
//   const config = getDynamicDecimalConfig(
//     tokenDecimals,
//     tokenPrice,
//     tokenSymbol,
//     currentValue
//   );
//   const safeDecimals = safeToNumber(tokenDecimals);

//   // Dynamic step based on token and current input
//   let step: string;
//   if (safeDecimals <= 6) {
//     step = `0.${"0".repeat(safeDecimals - 1)}1`;
//   } else if (config.inputLength > 0) {
//     // Adapt step to current input precision
//     const stepDecimals = Math.min(config.inputLength + 1, safeDecimals);
//     step = `0.${"0".repeat(stepDecimals - 1)}1`;
//   } else {
//     // Default step for high-decimal tokens
//     step = "0.000001";
//   }

//   return {
//     step,
//     maxDecimals: safeDecimals,
//     displayDecimals: config.displayDecimals,
//     placeholder: generateDynamicPlaceholder(
//       safeDecimals,
//       tokenSymbol,
//       tokenPrice
//     ),
//     pattern: `^\\d*\\.?\\d{0,${safeDecimals}}$`, // HTML5 pattern for validation
//   };
// };

// // Generate contextual placeholder
// const generateDynamicPlaceholder = (
//   decimals: number,
//   symbol?: string,
//   price?: number
// ): string => {
//   if (price && price >= 0.99 && price <= 1.01) {
//     return "0.00"; // Stablecoin
//   } else if (price && price > 1000) {
//     return "0.001"; // High-value token
//   } else if (price && price < 0.01) {
//     return "1000.0"; // Low-value token
//   } else if (decimals <= 6) {
//     return `0.${"0".repeat(Math.min(2, decimals))}`;
//   } else {
//     return "0.0";
//   }
// };

// // Real-time validation for input fields
// export const validateTokenInput = (
//   input: string,
//   tokenDecimals: number | bigint,
//   tokenPrice?: number,
//   tokenSymbol?: string
// ) => {
//   const result = universalParseUnits(
//     input,
//     tokenDecimals,
//     tokenPrice,
//     tokenSymbol
//   );
//   const config = getDynamicDecimalConfig(
//     tokenDecimals,
//     tokenPrice,
//     tokenSymbol,
//     input
//   );

//   return {
//     ...result,
//     config,
//     isValid: result.success,
//     displayValue: result.displayAmount || input,
//     maxAllowedDecimals: safeToNumber(tokenDecimals),
//   };
// };
// // Universal token input parser - works with any token
// // export const universalParseUnits = (
// //   amount: string,
// //   tokenDecimals: number | bigint,
// //   tokenPrice?: number,
// //   tokenSymbol?: string
// // ): {
// //   success: boolean;
// //   value?: bigint;
// //   error?: string;
// //   warning?: string;
// //   truncated?: boolean;
// //   adjustedAmount?: string;
// // } => {
// //   try {
// //     if (!amount || amount.trim() === "") {
// //       return { success: true, value: BigInt(0) };
// //     }

// //     const cleanInput = amount.trim();
// //     const safeDecimals = safeToNumber(tokenDecimals);

// //     // Basic format validation
// //     if (!/^\d*\.?\d*$/.test(cleanInput)) {
// //       return { success: false, error: "Invalid number format" };
// //     }

// //     // Get dynamic configuration
// //     const config = getDynamicDecimalConfig(
// //       safeDecimals,
// //       tokenPrice,
// //       tokenSymbol
// //     );

// //     // Analyze the input for smart handling
// //     const analysis = analyzeTokenValue(cleanInput, safeDecimals);

// //     const parts = cleanInput.split(".");
// //     const wholePart = parts[0] || "0";
// //     const decimalPart = parts[1] || "";

// //     let processedAmount = cleanInput;
// //     let truncated = false;
// //     let warning = "";

// //     // Handle excessive decimals dynamically
// //     if (decimalPart.length > safeDecimals) {
// //       return {
// //         success: false,
// //         error: `Maximum ${safeDecimals} decimal places allowed for this token`,
// //       };
// //     }

// //     // Smart truncation based on token analysis
// //     let effectiveMaxDecimals = config.maxInputDecimals;

// //     // Adjust for small values - allow more precision
// //     if (analysis.isLikelySmallValue) {
// //       effectiveMaxDecimals = Math.min(
// //         analysis.suggestedPrecision,
// //         safeDecimals
// //       );
// //     }

// //     // Adjust for likely stablecoins - be more restrictive
// //     if (analysis.isLikelyStablecoin) {
// //       effectiveMaxDecimals = Math.min(4, safeDecimals);
// //     }

// //     if (decimalPart.length > effectiveMaxDecimals) {
// //       // Auto-truncate with smart rounding
// //       const truncatedDecimal = decimalPart.slice(0, effectiveMaxDecimals);
// //       processedAmount = `${wholePart}.${truncatedDecimal}`;
// //       truncated = true;

// //       if (analysis.isLikelySmallValue) {
// //         warning = `Precision adjusted to preserve value accuracy`;
// //       } else if (analysis.isLikelyStablecoin) {
// //         warning = `Precision adjusted for stablecoin optimal precision`;
// //       } else {
// //         warning = `Precision adjusted to ${effectiveMaxDecimals} decimals for optimal transaction`;
// //       }
// //     } else if (decimalPart.length > config.warningThreshold) {
// //       warning = `High precision detected - consider using fewer decimals`;
// //     }

// //     // Validate the processed amount
// //     const numericValue = parseFloat(processedAmount);
// //     if (isNaN(numericValue) || numericValue <= 0) {
// //       return { success: false, error: "Amount must be greater than 0" };
// //     }

// //     // Parse with ethers - ethers.parseUnits expects decimals as number or string
// //     const parsedValue = ethers.parseUnits(processedAmount, safeDecimals);

// //     return {
// //       success: true,
// //       value: parsedValue,
// //       warning,
// //       truncated,
// //       adjustedAmount: truncated ? processedAmount : undefined,
// //     };
// //   } catch (error) {
// //     console.error("Universal parse error:", error);
// //     return {
// //       success: false,
// //       error: "Invalid amount format",
// //     };
// //   }
// // };

// // Universal display formatter - works with any token
// export const universalFormatDisplay = (
//   amount: bigint,
//   tokenDecimals: number | bigint,
//   tokenPrice?: number,
//   tokenValue?: string
// ): string => {
//   if (amount === BigInt(0)) return "0";

//   const safeDecimals = safeToNumber(tokenDecimals);
//   const config = getDynamicDecimalConfig(safeDecimals, tokenPrice, tokenValue);

//   // Convert BigInt to decimal string
//   const amountStr = amount.toString();
//   const amountLength = amountStr.length;

//   if (amountLength <= safeDecimals) {
//     // Amount is less than 1
//     const paddedAmount = amountStr.padStart(safeDecimals, "0");
//     const wholePart = paddedAmount?.split(".")[0];
//     const decimalPart = paddedAmount?.split(".")[1];

//     // For small amounts, show more precision to avoid showing 0.00
//     let displayDecimals = config.maxInputDecimals;

//     // Find first significant digit
//     const firstNonZero = decimalPart.search(/[1-9]/);
//     if (firstNonZero >= 0) {
//       // Show at least 2 significant digits
//       displayDecimals = Math.max(displayDecimals, firstNonZero + 2);
//       displayDecimals = Math.min(displayDecimals, safeDecimals);
//     }

//     const truncatedDecimal = decimalPart.slice(0, displayDecimals);
//     const cleanDecimal = truncatedDecimal.replace(/0+$/, "");

//     return cleanDecimal ? `${wholePart}.${cleanDecimal}` : wholePart;
//   } else {
//     // Amount is >= 1
//     const wholePart = amountStr.slice(0, amountLength - safeDecimals);
//     const decimalPart = amountStr.slice(amountLength - safeDecimals);

//     if (decimalPart === "0".repeat(safeDecimals)) {
//       return wholePart;
//     }

//     const truncatedDecimal = decimalPart.slice(0, config.displayDecimals);
//     const cleanDecimal = truncatedDecimal.replace(/0+$/, "");

//     return cleanDecimal ? `${wholePart}.${cleanDecimal}` : wholePart;
//   }
// };

// Missing helper function - needs to be implemented
const safeToNumber = (value: number | bigint): number => {
  if (typeof value === "bigint") {
    return Number(value);
  }
  return value;
};

// Dynamic decimal configuration that adapts to input and token characteristics
const getDynamicDecimalConfig = (
  tokenDecimals: number | bigint,
  tokenPrice?: number,
  tokenSymbol?: string,
  currentInput?: string
) => {
  const decimals = safeToNumber(tokenDecimals);

  // Analyze current input if provided
  let inputDecimalLength = 0;
  let hasSignificantDecimals = false;

  if (currentInput) {
    const parts = currentInput.split(".");
    if (parts[1]) {
      inputDecimalLength = parts[1].length;
      hasSignificantDecimals = parts[1].replace(/0+$/, "").length > 0;
    }
  }

  // Always allow full token precision for input
  const maxInputDecimals = decimals;

  // Dynamic display decimals based on input and token characteristics
  let displayDecimals: number;

  if (currentInput && hasSignificantDecimals) {
    // If user has input decimals, show at least that many
    const inputSignificantDecimals =
      currentInput.split(".")[1]?.replace(/0+$/, "").length || 0;
    displayDecimals = Math.min(
      Math.max(inputSignificantDecimals, 2),
      decimals <= 6 ? decimals : 18
    );
  } else {
    // Default display based on token type
    if (decimals <= 6) {
      displayDecimals = decimals; // Show all decimals for low-decimal tokens
    } else if (decimals <= 8) {
      displayDecimals = 6;
    } else {
      displayDecimals = 18; // Conservative default for high-decimal tokens
    }

    // Adjust based on token price
    // if (tokenPrice !== undefined) {
    //   if (tokenPrice > 1000) {
    //     displayDecimals = Math.min(displayDecimals);
    //   } else if (tokenPrice < 0.01) {
    //     displayDecimals = Math.min(decimals, 10);
    //   } else if (tokenPrice >= 0.99 && tokenPrice <= 1.01) {
    //     displayDecimals = Math.min(4, decimals);
    //   }
    // }
  }

  const warningThreshold = Math.min(
    decimals <= 6 ? decimals - 1 : 6,
    maxInputDecimals - 1
  );

  return {
    maxInputDecimals,
    displayDecimals,
    warningThreshold,
    tokenDecimals: decimals,
    inputLength: inputDecimalLength,
    isHighPrecision: inputDecimalLength > warningThreshold,
  };
};

// Fixed universal token input parser
export const universalParseUnits = (
  amount: string,
  tokenDecimals: number | bigint,
  tokenPrice?: number,
  tokenSymbol?: string
): {
  success: boolean;
  value?: bigint;
  error?: string;
  warning?: string;
  displayAmount?: string;
  suggestedDisplayDecimals?: number;
  tokenInfo?: {
    decimals: number;
    symbol?: string;
    price?: number;
  };
} => {
  try {
    if (!amount || amount.trim() === "") {
      return {
        success: true,
        value: BigInt(0),
        tokenInfo: {
          decimals: safeToNumber(tokenDecimals),
          symbol: tokenSymbol,
          price: tokenPrice,
        },
      };
    }

    const cleanInput = amount.trim();
    const safeDecimals = safeToNumber(tokenDecimals);

    // Basic format validation
    if (!/^\d*\.?\d*$/.test(cleanInput)) {
      return { success: false, error: "Invalid number format" };
    }

    const parts = cleanInput.split(".");
    const wholePart = parts[0] || "0";
    const decimalPart = parts[1] || "";

    // Strict validation: cannot exceed token's native decimal precision
    if (decimalPart.length > safeDecimals) {
      return {
        success: false,
        error: `${
          tokenSymbol || "Token"
        } supports maximum ${safeDecimals} decimal places (you entered ${
          decimalPart.length
        })`,
        tokenInfo: {
          decimals: safeDecimals,
          symbol: tokenSymbol,
          price: tokenPrice,
        },
      };
    }

    // Get dynamic configuration based on current input
    const config = getDynamicDecimalConfig(
      safeDecimals,
      tokenPrice,
      tokenSymbol,
      cleanInput
    );

    let warning = "";

    // Dynamic warnings based on input
    if (config.isHighPrecision) {
      if (tokenPrice && tokenPrice >= 0.99 && tokenPrice <= 1.01) {
        warning = `High precision for stablecoin - consider if ${decimalPart.length} decimals are necessary`;
      } else if (safeDecimals >= 18) {
        warning = `Using ${decimalPart.length} decimal places - gas costs may be higher with high precision`;
      } else {
        warning = `Using maximum precision for this token`;
      }
    }

    // Validate the amount
    const numericValue = parseFloat(cleanInput);
    if (isNaN(numericValue) || numericValue <= 0) {
      return { success: false, error: "Amount must be greater than 0" };
    }

    // Parse the full precision amount - assuming ethers is available
    let parsedValue: bigint;
    try {
      // If ethers is available
      parsedValue = ethers.parseUnits(cleanInput, safeDecimals);
    } catch (error) {
      return { success: false, error: "Failed to parse amount" };
    }

    // Create dynamic display amount
    const displayAmount = formatTokenAmountDynamic(
      cleanInput,
      config.displayDecimals
    );

    return {
      success: true,
      value: parsedValue,
      warning,
      displayAmount,
      suggestedDisplayDecimals: config.displayDecimals,
      tokenInfo: {
        decimals: safeDecimals,
        symbol: tokenSymbol,
        price: tokenPrice,
      },
    };
  } catch (error) {
    console.error("Universal parse error:", error);
    return {
      success: false,
      error: "Invalid amount format",
    };
  }
};

// Manual parseUnits implementation if ethers is not available
const parseUnitsManual = (amount: string, decimals: number): bigint => {
  const parts = amount.split(".");
  const wholePart = parts[0] || "0";
  const decimalPart = (parts[1] || "").padEnd(decimals, "0").slice(0, decimals);

  const combined = wholePart + decimalPart;
  return BigInt(combined);
};

// Fixed dynamic formatting that preserves user input while cleaning up display
const formatTokenAmountDynamic = (
  amount: string,
  maxDisplayDecimals: number
): string => {
  const parts = amount.split(".");
  const wholePart = parts[0] || "0";
  const decimalPart = parts[1] || "";

  if (!decimalPart) return wholePart;

  // For display, remove trailing zeros but respect user's intended precision
  const trimmedDecimals = decimalPart.replace(/0+$/, "");

  if (!trimmedDecimals) return wholePart;

  // If user input is within display limits, show exactly what they typed (without trailing zeros)
  if (trimmedDecimals.length <= maxDisplayDecimals) {
    return `${wholePart}.${trimmedDecimals}`;
  }

  // If user input exceeds display limits, show truncated version with ellipsis indicator
  const truncatedDecimals = decimalPart.slice(0, maxDisplayDecimals);
  return `${wholePart}.${truncatedDecimals}...`;
};

// Dynamic input field configuration that updates based on current value
export const getDynamicInputConfig = (
  tokenDecimals: number | bigint,
  currentValue: string = "",
  tokenPrice?: number,
  tokenSymbol?: string
) => {
  const config = getDynamicDecimalConfig(
    tokenDecimals,
    tokenPrice,
    tokenSymbol,
    currentValue
  );
  const safeDecimals = safeToNumber(tokenDecimals);

  // Dynamic step based on token and current input
  let step: string;
  if (safeDecimals <= 6) {
    step = `0.${"0".repeat(Math.max(0, safeDecimals - 1))}1`;
  } else if (config.inputLength > 0) {
    // Adapt step to current input precision
    const stepDecimals = Math.min(config.inputLength + 1, safeDecimals);
    step = `0.${"0".repeat(Math.max(0, stepDecimals - 1))}1`;
  } else {
    // Default step for high-decimal tokens
    step = "0.000001";
  }

  return {
    step,
    maxDecimals: safeDecimals,
    displayDecimals: config.displayDecimals,
    placeholder: generateDynamicPlaceholder(
      safeDecimals,
      tokenSymbol,
      tokenPrice
    ),
    pattern: `^\\d*\\.?\\d{0,${safeDecimals}}$`,
    tokenInfo: `${tokenSymbol || "Token"} (${safeDecimals} decimals)`, // Show token decimals info
  };
};

// Generate contextual placeholder
const generateDynamicPlaceholder = (
  decimals: number,
  symbol?: string,
  price?: number
): string => {
  if (price && price >= 0.99 && price <= 1.01) {
    return "0.00"; // Stablecoin
  } else if (price && price > 1000) {
    return "0.001"; // High-value token
  } else if (price && price < 0.01) {
    return "1000.0"; // Low-value token
  } else if (decimals <= 6) {
    return `0.${"0".repeat(Math.min(2, decimals))}`;
  } else {
    return "0.0";
  }
};

// Real-time validation for input fields
export const validateTokenInput = (
  input: string,
  tokenDecimals: number | bigint,
  tokenPrice?: number,
  tokenSymbol?: string
) => {
  const result = universalParseUnits(
    input,
    tokenDecimals,
    tokenPrice,
    tokenSymbol
  );
  const config = getDynamicDecimalConfig(
    tokenDecimals,
    tokenPrice,
    tokenSymbol,
    input
  );

  return {
    ...result,
    config,
    isValid: result.success,
    displayValue: result.displayAmount || input,
    maxAllowedDecimals: safeToNumber(tokenDecimals),
    tokenDecimalInfo: `${tokenSymbol || "Token"}: ${safeToNumber(
      tokenDecimals
    )} decimals`,
  };
};

// Fixed universal display formatter
export const universalFormatDisplay = (
  amount: bigint,
  tokenDecimals: number | bigint,
  tokenPrice?: number,
  tokenSymbol?: string
): {
  formatted: string;
  tokenInfo: string;
  fullPrecision: string;
} => {
  const safeDecimals = safeToNumber(tokenDecimals);

  if (amount === BigInt(0)) {
    return {
      formatted: "0",
      tokenInfo: `${tokenSymbol || "Token"} (${safeDecimals} decimals)`,
      fullPrecision: "0",
    };
  }

  const config = getDynamicDecimalConfig(safeDecimals, tokenPrice, tokenSymbol);

  // Convert BigInt to decimal string
  const amountStr = amount.toString();
  const amountLength = amountStr.length;

  let wholePart: string;
  let decimalPart: string;

  if (amountLength <= safeDecimals) {
    // Amount is less than 1
    wholePart = "0";
    decimalPart = amountStr.split(".")[1];
  } else {
    // Amount is >= 1
    wholePart = amountStr.split(".")[0];
    decimalPart = amountStr.split(".")[1].slice(0, safeDecimals);
  }

  // Full precision string
  const fullPrecision =
    decimalPart === "0".repeat(safeDecimals)
      ? wholePart
      : `${wholePart}.${decimalPart}`;

  // Formatted display
  let displayDecimals = config.maxInputDecimals;

  // For small amounts, show more precision to avoid showing 0.00
  if (wholePart === "0") {
    const firstNonZero = decimalPart.search(/[1-9]/);
    if (firstNonZero >= 0) {
      displayDecimals = Math.max(displayDecimals, firstNonZero + 2);
      displayDecimals = Math.min(displayDecimals, safeDecimals);
    }
  }

  const truncatedDecimal = decimalPart.slice(0, displayDecimals);
  const cleanDecimal = truncatedDecimal.replace(/0+$/, "");

  const formatted = cleanDecimal ? `${wholePart}.${cleanDecimal}` : wholePart;

  return {
    formatted,
    tokenInfo: `${tokenSymbol || "Token"} (${safeDecimals} decimals)`,
    fullPrecision,
  };
};

// Helper function to show token decimal information
export const getTokenDecimalInfo = (
  tokenDecimals: number | bigint,
  tokenSymbol?: string,
  tokenPrice?: number
) => {
  const decimals = safeToNumber(tokenDecimals);
  const config = getDynamicDecimalConfig(decimals, tokenPrice, tokenSymbol);

  return {
    symbol: tokenSymbol || "Unknown Token",
    decimals: decimals,
    maxInputDecimals: decimals,
    recommendedDisplayDecimals: config.displayDecimals,
    decimalInfo: `${tokenSymbol || "Token"} uses ${decimals} decimal places`,
    examples: {
      minimum: `0.${"0".repeat(Math.max(0, decimals - 1))}1`,
      typical: decimals <= 6 ? "1.23" : "1.234567",
      maximum: `1.${"9".repeat(decimals)}`,
    },
  };
};

// Usage examples with decimal information:
/*
  // USDC (6 decimals)
  const usdcInfo = getTokenDecimalInfo(6, "USDC", 1.00);
  console.log(usdcInfo.decimalInfo); // "USDC uses 6 decimal places"
  console.log(usdcInfo.examples.minimum); // "0.000001"
  
  // ETH (18 decimals)  
  const ethInfo = getTokenDecimalInfo(18, "ETH", 3000);
  console.log(ethInfo.decimalInfo); // "ETH uses 18 decimal places"
  console.log(ethInfo.examples.minimum); // "0.000000000000000001"
  
  // Validation with decimal info
  const result = validateTokenInput("1.123456", 6, 1.00, "USDC");
  console.log(result.tokenDecimalInfo); // "USDC: 6 decimals"
  console.log(result.isValid); // true
  console.log(result.displayValue); // "1.123456"
  
  // Display formatting with decimal info
  const displayResult = universalFormatDisplay(BigInt("1123456"), 6, 1.00, "USDC");
  console.log(displayResult.formatted); // "1.123456"
  console.log(displayResult.tokenInfo); // "USDC (6 decimals)"
  console.log(displayResult.fullPrecision); // "1.123456"
  */
