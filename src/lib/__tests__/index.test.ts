import { describe, it, expect } from "vitest";
import { ESPPInput, ESPPOutput, calculateESPP } from "..";

describe("calculateESPP", () => {
  it("should correctly calculate ESPP values", () => {
    const input: ESPPInput = {
      marketValuePurchaseDate: 50,
      discountPercent: 15,
      purchaseAmount: 1500,
      marketValueSaleDate: 60,
      taxRatePercent: 25,
    };

    const expectedOutput: ESPPOutput = {
      purchasePricePerShare: 42.5,
      discountPerShare: 7.5,
      capitalGainPerShare: 17.5,
      numberOfShares: 35,
      totalPurchasePrice: 1487.5,
      totalDiscount: 262.5,
      totalCapitalGain: 612.5,
      amountTaxableAsIncome: 262.5,
      totalTax: 65.63,
      totalProfit: 546.87,
    };

    const result = calculateESPP(input);
    expect(result).toEqual(expectedOutput);
  });
  it("should handle 0% discount correctly", () => {
    const input: ESPPInput = {
      marketValuePurchaseDate: 50,
      discountPercent: 0,
      purchaseAmount: 1500,
      marketValueSaleDate: 60,
      taxRatePercent: 25,
    };

    const expectedOutput: ESPPOutput = {
      purchasePricePerShare: 50.0,
      discountPerShare: 0.0,
      capitalGainPerShare: 10.0,
      numberOfShares: 30,
      totalPurchasePrice: 1500.0,
      totalDiscount: 0.0,
      totalCapitalGain: 300.0,
      amountTaxableAsIncome: 0.0,
      totalTax: 0.0,
      totalProfit: 300.0,
    };

    const result = calculateESPP(input);
    expect(result).toEqual(expectedOutput);
  });
  it("should handle 100% discount correctly", () => {
    const input: ESPPInput = {
      marketValuePurchaseDate: 50,
      discountPercent: 100,
      purchaseAmount: 1500,
      marketValueSaleDate: 60,
      taxRatePercent: 25,
    };

    const expectedOutput: ESPPOutput = {
      purchasePricePerShare: 0.0,
      discountPerShare: 50.0,
      capitalGainPerShare: 60.0,
      numberOfShares: Infinity, // This should be handled if possible
      totalPurchasePrice: 0.0,
      totalDiscount: Infinity,
      totalCapitalGain: Infinity,
      amountTaxableAsIncome: Infinity,
      totalTax: Infinity,
      totalProfit: Infinity,
    };

    expect(() => calculateESPP(input)).toThrow(); // Handle unexpected edge cases
  });

  it("should handle no capital gain or loss correctly", () => {
    const input: ESPPInput = {
      marketValuePurchaseDate: 50,
      discountPercent: 10,
      purchaseAmount: 1500,
      marketValueSaleDate: 45,
      taxRatePercent: 25,
    };

    const expectedOutput: ESPPOutput = {
      purchasePricePerShare: 45.0,
      discountPerShare: 5.0,
      capitalGainPerShare: 0.0,
      numberOfShares: 33,
      totalPurchasePrice: 1485.0,
      totalDiscount: 165.0,
      totalCapitalGain: 0.0,
      amountTaxableAsIncome: 165.0,
      totalTax: 41.25,
      totalProfit: -41.25,
    };

    const result = calculateESPP(input);
    expect(result).toEqual(expectedOutput);
  });
  it("should throw an error for negative market value at purchase", () => {
    const input: ESPPInput = {
      marketValuePurchaseDate: -50,
      discountPercent: 15,
      purchaseAmount: 1500,
      marketValueSaleDate: 60,
      taxRatePercent: 25,
    };

    expect(() => calculateESPP(input)).toThrow();
  });
  it("should throw an error for invalid discount percent", () => {
    const input: ESPPInput = {
      marketValuePurchaseDate: 50,
      discountPercent: 105,
      purchaseAmount: 1500,
      marketValueSaleDate: 60,
      taxRatePercent: 25,
    };

    expect(() => calculateESPP(input)).toThrow();
  });
  it("should handle large purchase amounts correctly", () => {
    const input: ESPPInput = {
      marketValuePurchaseDate: 50,
      discountPercent: 10,
      purchaseAmount: 1000000,
      marketValueSaleDate: 60,
      taxRatePercent: 25,
    };

    const expectedOutput: ESPPOutput = {
      purchasePricePerShare: 45.0,
      discountPerShare: 5.0,
      capitalGainPerShare: 15.0,
      numberOfShares: 22222,
      totalPurchasePrice: 999990.0,
      totalDiscount: 111110.0,
      totalCapitalGain: 333330.0,
      amountTaxableAsIncome: 111110.0,
      totalTax: 27777.5,
      totalProfit: 305552.5,
    };

    const result = calculateESPP(input);
    expect(result).toEqual(expectedOutput);
  });
});
