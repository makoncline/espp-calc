import { g } from "vitest/dist/chunks/suite.CcK46U-P.js";
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
  gainPerShare: z.number(),
  capitalGainPerShare: z.number(),
  numberOfShares: z.number().int(),
  totalPurchasePrice: z.number(),
  totalDiscount: z.number(),
  totalGain: z.number(),
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

  const purchasePricePerShare = parseFloat(
    (marketValuePurchaseDate * (1 - discountPercent / 100)).toFixed(2)
  );
  const numberOfShares = Math.floor(purchaseAmount / purchasePricePerShare);
  const totalPurchasePrice = parseFloat(
    (numberOfShares * purchasePricePerShare).toFixed(2)
  );
  const discountPerShare = parseFloat(
    (marketValuePurchaseDate - purchasePricePerShare).toFixed(2)
  );
  const totalDiscount = parseFloat(
    (discountPerShare * numberOfShares).toFixed(2)
  );
  const gainPerShare = parseFloat(
    (marketValueSaleDate - purchasePricePerShare).toFixed(2)
  );
  const totalGain = parseFloat((gainPerShare * numberOfShares).toFixed(2));
  const capitalGainPerShare = parseFloat(
    (marketValueSaleDate - marketValuePurchaseDate).toFixed(2)
  );
  const totalCapitalGain = parseFloat(
    (capitalGainPerShare * numberOfShares).toFixed(2)
  );
  const amountTaxableAsIncome = totalDiscount;
  const totalTax = parseFloat(
    ((amountTaxableAsIncome * taxRatePercent) / 100).toFixed(2)
  );
  const totalProfit = parseFloat((totalGain - totalTax).toFixed(2));
  const percentageGainLossOnInvestment = parseFloat(
    ((totalProfit / totalPurchasePrice) * 100).toFixed(2)
  );

  console.log(
    { ...input },
    {
      purchasePricePerShare,
      discountPerShare,
      gainPerShare,
      capitalGainPerShare,
      numberOfShares,
      totalPurchasePrice,
      totalDiscount,
      totalGain,
      totalCapitalGain,
      amountTaxableAsIncome,
      totalTax,
      totalProfit,
      percentageGainLossOnInvestment,
    }
  );

  return {
    purchasePricePerShare,
    discountPerShare,
    gainPerShare,
    capitalGainPerShare,
    numberOfShares,
    totalPurchasePrice,
    totalDiscount,
    totalGain,
    totalCapitalGain,
    amountTaxableAsIncome: parseFloat(amountTaxableAsIncome.toFixed(2)),
    totalTax,
    totalProfit,
    percentageGainLossOnInvestment,
  };
}
