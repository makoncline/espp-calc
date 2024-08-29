import { z } from "zod";

export const ESPPInputSchema = z.object({
  marketValuePurchaseDate: z.number().min(0, "Market value must be positive"),
  discountPercent: z
    .number()
    .min(0, "Discount percent must be between 0 and 100")
    .max(99.99, "Discount percent must be less than 100"), // Enforce less than 100
  purchaseAmount: z.number().min(0, "Purchase amount must be positive"),
  marketValueSaleDate: z
    .number()
    .min(0, "Market value at sale must be positive"),
  taxRatePercent: z
    .number()
    .min(0)
    .max(100, "Tax rate must be between 0 and 100"),
});

export const ESPPOutputSchema = z.object({
  purchasePricePerShare: z.number(),
  discountPerShare: z.number(),
  capitalGainPerShare: z.number(),
  numberOfShares: z.number().int(),
  totalPurchasePrice: z.number(),
  totalDiscount: z.number(),
  totalCapitalGain: z.number(),
  amountTaxableAsIncome: z.number(),
  totalTax: z.number(),
  totalProfit: z.number(),
  percentageGainLossOnInvestment: z.number(),
});

export type ESPPInput = z.infer<typeof ESPPInputSchema>;
export type ESPPOutput = z.infer<typeof ESPPOutputSchema>;

export function calculateESPP(input: ESPPInput): ESPPOutput {
  ESPPInputSchema.parse(input); // Validate the input using Zod

  const {
    marketValuePurchaseDate,
    discountPercent,
    purchaseAmount,
    marketValueSaleDate,
    taxRatePercent,
  } = input;

  const purchasePricePerShare =
    marketValuePurchaseDate * (1 - discountPercent / 100);
  const discountPerShare = marketValuePurchaseDate * (discountPercent / 100);
  const numberOfShares = Math.floor(purchaseAmount / purchasePricePerShare);
  const totalPurchasePrice = numberOfShares * purchasePricePerShare;
  const totalDiscount = numberOfShares * discountPerShare;
  const capitalGainPerShare = marketValueSaleDate - purchasePricePerShare;
  const totalCapitalGain = numberOfShares * capitalGainPerShare;
  const amountTaxableAsIncome = totalDiscount;
  const totalTax = amountTaxableAsIncome * (taxRatePercent / 100);
  const totalProfit = totalCapitalGain - totalTax;

  // Correct Calculation: Percentage Gain/Loss on Investment
  const percentageGainLossOnInvestment =
    totalPurchasePrice !== 0 ? (totalProfit / totalPurchasePrice) * 100 : 0;

  return {
    purchasePricePerShare,
    discountPerShare,
    capitalGainPerShare,
    numberOfShares,
    totalPurchasePrice,
    totalDiscount,
    totalCapitalGain,
    amountTaxableAsIncome,
    totalTax,
    totalProfit,
    percentageGainLossOnInvestment,
  };
}
