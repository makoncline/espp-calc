import "./style.css";
import { z } from "zod";
import { ESPPInput, ESPPInputSchema, calculateESPP } from "./lib";

const defaultValues = {
  marketValuePurchaseDate: 4.6,
  discountPercent: 15,
  purchaseAmount: 1000,
  marketValueSaleDate: 4.6,
  taxRatePercent: 40,
  stockPercentageGainLoss: 0,
};

function formatCurrency(value: string | number): string {
  const numericValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.-]+/g, ""))
      : value;
  if (isNaN(numericValue)) return value.toString();
  return `$${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue)}`;
}

function formatPercent(value: string | number): string {
  const numericValue =
    typeof value === "string"
      ? parseFloat(value.replace(/[^0-9.-]+/g, ""))
      : value;
  if (isNaN(numericValue)) return value.toString();
  return `${numericValue.toFixed(2)}%`;
}

function sanitizeInput(value: string, type: "currency" | "percent"): string {
  if (type === "currency") {
    return value.replace(/[^0-9.,-]/g, "");
  } else if (type === "percent") {
    return value.replace(/[^0-9.-]/g, "");
  }
  return value;
}

function handleNegative(value: number): string {
  return value < 0
    ? `<span class="text-red-500">${formatCurrency(value.toString())}</span>`
    : formatCurrency(value.toString());
}

function calculateMarketValueSaleDate(
  purchaseValue: number,
  percentageGainLoss: number
): number {
  return purchaseValue * (1 + percentageGainLoss / 100);
}

function calculatePercentageGainLoss(
  purchaseValue: number,
  saleValue: number
): number {
  return ((saleValue - purchaseValue) / purchaseValue) * 100;
}

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <h1 class="text-2xl font-bold mb-4">ESPP Calculator</h1>
  <form id="esppForm" class="bg-gray-800 p-6 rounded-lg shadow-md">
    <div class="mb-4">
      <label for="marketValuePurchaseDate" class="block text-sm font-medium text-gray-400">Market Value at Purchase Date</label>
      <input type="text" id="marketValuePurchaseDate" name="marketValuePurchaseDate" value="${formatCurrency(
        defaultValues.marketValuePurchaseDate.toFixed(2)
      )}" class="mt-1 block w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-md p-2" required>
    </div>
    
    <div class="mb-4">
      <label for="discountPercent" class="block text-sm font-medium text-gray-400">Discount Percent</label>
      <input type="text" id="discountPercent" name="discountPercent" value="${formatPercent(
        defaultValues.discountPercent.toFixed(2)
      )}" class="mt-1 block w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-md p-2" required>
    </div>

    <div class="mb-4">
      <label for="purchaseAmount" class="block text-sm font-medium text-gray-400">Purchase Amount (in dollars)</label>
      <input type="text" id="purchaseAmount" name="purchaseAmount" value="${formatCurrency(
        defaultValues.purchaseAmount.toFixed(2)
      )}" class="mt-1 block w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-md p-2" required>
    </div>

    <div class="mb-4">
      <label for="stockPercentageGainLoss" class="block text-sm font-medium text-gray-400">Stock Percentage Gain/Loss</label>
      <input type="text" id="stockPercentageGainLoss" name="stockPercentageGainLoss" value="${formatPercent(
        defaultValues.stockPercentageGainLoss.toFixed(2)
      )}" class="mt-1 block w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-md p-2" required>
    </div>

    <div class="mb-4">
      <label for="marketValueSaleDate" class="block text-sm font-medium text-gray-400">Market Value at Time of Sale</label>
      <input type="text" id="marketValueSaleDate" name="marketValueSaleDate" value="${formatCurrency(
        defaultValues.marketValueSaleDate.toFixed(2)
      )}" class="mt-1 block w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-md p-2" required>
    </div>

    <div class="mb-4">
      <label for="taxRatePercent" class="block text-sm font-medium text-gray-400">Tax Rate Percent</label>
      <input type="text" id="taxRatePercent" name="taxRatePercent" value="${formatPercent(
        defaultValues.taxRatePercent.toFixed(2)
      )}" class="mt-1 block w-full bg-gray-700 text-gray-100 border border-gray-600 rounded-md p-2" required>
    </div>

    <button type="submit" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md">Calculate</button>
  </form>

  <div id="results" class="mt-6 bg-gray-800 p-6 rounded-lg shadow-md hidden">
    <h2 class="text-xl font-bold mb-4 text-gray-200">Results</h2>
    <div id="resultsContent" class="text-left"></div>
  </div>
`;

const marketValuePurchaseDateInput = document.getElementById(
  "marketValuePurchaseDate"
) as HTMLInputElement;
const marketValueSaleDateInput = document.getElementById(
  "marketValueSaleDate"
) as HTMLInputElement;
const stockPercentageGainLossInput = document.getElementById(
  "stockPercentageGainLoss"
) as HTMLInputElement;

const inputs = document.querySelectorAll('input[type="text"]');

inputs.forEach((input) => {
  input.addEventListener("blur", (e) => {
    const target = e.target as HTMLInputElement;
    const inputType = target.name.includes("Percent") ? "percent" : "currency";
    target.value =
      inputType === "percent"
        ? formatPercent(target.value)
        : formatCurrency(target.value);
  });

  input.addEventListener("input", (e) => {
    const target = e.target as HTMLInputElement;
    const inputType = target.name.includes("Percent") ? "percent" : "currency";
    target.value = sanitizeInput(target.value, inputType);

    if (target === stockPercentageGainLossInput) {
      const purchaseValue = parseFloat(
        marketValuePurchaseDateInput.value.replace(/[^0-9.-]+/g, "")
      );
      const percentageGainLoss = parseFloat(
        target.value.replace(/[^0-9.-]+/g, "")
      );
      if (!isNaN(purchaseValue) && !isNaN(percentageGainLoss)) {
        const updatedSaleValue = calculateMarketValueSaleDate(
          purchaseValue,
          percentageGainLoss
        );
        marketValueSaleDateInput.value = formatCurrency(
          updatedSaleValue.toFixed(2)
        );
      }
    } else if (target === marketValueSaleDateInput) {
      const purchaseValue = parseFloat(
        marketValuePurchaseDateInput.value.replace(/[^0-9.-]+/g, "")
      );
      const saleValue = parseFloat(target.value.replace(/[^0-9.-]+/g, ""));
      if (!isNaN(purchaseValue) && !isNaN(saleValue)) {
        const updatedPercentageGainLoss = calculatePercentageGainLoss(
          purchaseValue,
          saleValue
        );
        stockPercentageGainLossInput.value = formatPercent(
          updatedPercentageGainLoss.toFixed(2)
        );
      }
    }
  });
});

document.getElementById("esppForm")?.addEventListener("submit", (event) => {
  event.preventDefault();

  const formData = new FormData(event.target as HTMLFormElement);
  const input: ESPPInput = {
    marketValuePurchaseDate: parseFloat(
      sanitizeInput(
        formData.get("marketValuePurchaseDate") as string,
        "currency"
      ).replace(/,/g, "")
    ),
    discountPercent: parseFloat(
      sanitizeInput(
        formData.get("discountPercent") as string,
        "percent"
      ).replace("%", "")
    ),
    purchaseAmount: parseFloat(
      sanitizeInput(
        formData.get("purchaseAmount") as string,
        "currency"
      ).replace(/,/g, "")
    ),
    marketValueSaleDate: parseFloat(
      sanitizeInput(
        formData.get("marketValueSaleDate") as string,
        "currency"
      ).replace(/,/g, "")
    ),
    taxRatePercent: parseFloat(
      sanitizeInput(
        formData.get("taxRatePercent") as string,
        "percent"
      ).replace("%", "")
    ),
  };

  try {
    ESPPInputSchema.parse(input); // Validate input
    const result = calculateESPP(input);

    const resultsDiv = document.getElementById("results");
    const resultsContent = document.getElementById("resultsContent");

    if (resultsContent) {
      resultsContent.innerHTML = `
        <h3 class="text-lg font-semibold mb-2">Share Information</h3>
        <p>Number of Shares Purchased: ${result.numberOfShares}</p>
        <p>Purchase Price per Share: ${formatCurrency(
          result.purchasePricePerShare.toString()
        )}</p>
        <p>Discount per Share: ${formatCurrency(
          result.discountPerShare.toString()
        )}</p>
        
        <h3 class="text-lg font-semibold mt-4 mb-2">Financial Impact</h3>
        <p>Total Purchase Price: ${formatCurrency(
          result.totalPurchasePrice.toString()
        )}</p>
        <p>Total Discount: ${formatCurrency(
          result.totalDiscount.toString()
        )}</p>
        
        <h3 class="text-lg font-semibold mt-4 mb-2">Gains/Losses</h3>
        <p>Capital Gain/Loss per Share: ${handleNegative(
          result.capitalGainPerShare
        )}</p>
        <p>Total Capital Gain/Loss: ${handleNegative(
          result.totalCapitalGain
        )}</p>
        
        <h3 class="text-lg font-semibold mt-4 mb-2">Tax Implications</h3>
        <p>Amount Taxable as Income (Total Discount): ${formatCurrency(
          result.amountTaxableAsIncome.toString()
        )}</p>
        <p>Total Tax: ${formatCurrency(result.totalTax.toString())}</p>
        
        <h3 class="text-lg font-semibold mt-4 mb-2">Final Outcome</h3>
        <p class="font-bold">Total Profit/Loss: ${handleNegative(
          result.totalProfit
        )}</p>
        <p class="font-bold">Percentage Gain/Loss on Investment: ${handleNegative(
          result.percentageGainLossOnInvestment
        )}%</p>
`;
    }

    if (resultsDiv) {
      resultsDiv.classList.remove("hidden");
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      alert("Invalid input. Please check your entries and try again.");
    } else {
      console.error("An unexpected error occurred:", error);
    }
  }
});
