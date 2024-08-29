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
      totalTax: 65.625, // Adjusted for precision
      totalProfit: 546.875, // Adjusted for precision
      percentageGainLossOnInvestment: 41.17647058823529, // Adjusted for precision
    };

    const result = calculateESPP(input);
    expect(result.purchasePricePerShare).toBeCloseTo(
      expectedOutput.purchasePricePerShare,
      2
    );
    expect(result.discountPerShare).toBeCloseTo(
      expectedOutput.discountPerShare,
      2
    );
    expect(result.capitalGainPerShare).toBeCloseTo(
      expectedOutput.capitalGainPerShare,
      2
    );
    expect(result.numberOfShares).toBe(expectedOutput.numberOfShares);
    expect(result.totalPurchasePrice).toBeCloseTo(
      expectedOutput.totalPurchasePrice,
      2
    );
    expect(result.totalDiscount).toBeCloseTo(expectedOutput.totalDiscount, 2);
    expect(result.totalCapitalGain).toBeCloseTo(
      expectedOutput.totalCapitalGain,
      2
    );
    expect(result.amountTaxableAsIncome).toBeCloseTo(
      expectedOutput.amountTaxableAsIncome,
      2
    );
    expect(result.totalTax).toBeCloseTo(expectedOutput.totalTax, 2);
    expect(result.totalProfit).toBeCloseTo(expectedOutput.totalProfit, 2);
    expect(result.percentageGainLossOnInvestment).toBeCloseTo(
      expectedOutput.percentageGainLossOnInvestment,
      2
    );
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
      percentageGainLossOnInvestment: 20.0,
    };

    const result = calculateESPP(input);
    expect(result).toEqual(expectedOutput);
  });

  it("should handle 100% discount correctly", () => {
    const input: ESPPInput = {
      marketValuePurchaseDate: 50,
      discountPercent: 100, // This should now be invalid
      purchaseAmount: 1500,
      marketValueSaleDate: 60,
      taxRatePercent: 25,
    };

    // Expect this to throw an error because 100% discount is not allowed
    expect(() => calculateESPP(input)).toThrow(
      "Discount percent must be less than 100"
    );
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
      percentageGainLossOnInvestment: 0.0,
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
      percentageGainLossOnInvestment: 33.33333333333333, // Adjusted for precision
    };

    const result = calculateESPP(input);
    expect(result.purchasePricePerShare).toBeCloseTo(
      expectedOutput.purchasePricePerShare,
      2
    );
    expect(result.discountPerShare).toBeCloseTo(
      expectedOutput.discountPerShare,
      2
    );
    expect(result.capitalGainPerShare).toBeCloseTo(
      expectedOutput.capitalGainPerShare,
      2
    );
    expect(result.numberOfShares).toBe(expectedOutput.numberOfShares);
    expect(result.totalPurchasePrice).toBeCloseTo(
      expectedOutput.totalPurchasePrice,
      2
    );
    expect(result.totalDiscount).toBeCloseTo(expectedOutput.totalDiscount, 2);
    expect(result.totalCapitalGain).toBeCloseTo(
      expectedOutput.totalCapitalGain,
      2
    );
    expect(result.amountTaxableAsIncome).toBeCloseTo(
      expectedOutput.amountTaxableAsIncome,
      2
    );
    expect(result.totalTax).toBeCloseTo(expectedOutput.totalTax, 2);
    expect(result.totalProfit).toBeCloseTo(expectedOutput.totalProfit, 2);
    expect(result.percentageGainLossOnInvestment).toBeCloseTo(
      expectedOutput.percentageGainLossOnInvestment,
      2
    );
  });
});
