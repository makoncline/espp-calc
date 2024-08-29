import { z } from "zod";

export const ESPPInputSchema = z.object({
  marketValuePurchaseDate: z.number().positive("Market value must be positive"),
  discountPercent: z
    .number()
    .min(0)
    .max(100, "Discount percent must be between 0 and 100"),
  purchaseAmount: z.number().positive("Purchase amount must be positive"),
  marketValueSaleDate: z
    .number()
    .positive("Market value at sale must be positive"),
  taxRatePercent: z
    .number()
    .min(0)
    .max(100, "Tax rate percent must be between 0 and 100"),
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

  const discountPerShare = +(
    marketValuePurchaseDate *
    (discountPercent / 100)
  ).toFixed(2);
  const purchasePricePerShare = +(
    marketValuePurchaseDate - discountPerShare
  ).toFixed(2);
  const numberOfShares = Math.floor(purchaseAmount / purchasePricePerShare);
  const totalPurchasePrice = +(numberOfShares * purchasePricePerShare).toFixed(
    2
  );
  const totalDiscount = +(numberOfShares * discountPerShare).toFixed(2);
  const capitalGainPerShare = +(
    marketValueSaleDate - purchasePricePerShare
  ).toFixed(2);
  const totalCapitalGain = +(numberOfShares * capitalGainPerShare).toFixed(2);
  const amountTaxableAsIncome = totalDiscount;
  const totalTax = +(amountTaxableAsIncome * (taxRatePercent / 100)).toFixed(2);
  const totalProfit = +(totalCapitalGain - totalTax).toFixed(2);

  const result = {
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
  };

  return ESPPOutputSchema.parse(result); // Validate the output using Zod
}
