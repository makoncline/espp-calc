// src/lib/__tests__/myFunction.test.ts

import { describe, it, expect } from "vitest";
import { add } from "..";

describe("add", () => {
  it("should return the sum of two numbers", () => {
    expect(add(1, 2)).toBe(3);
    expect(add(-1, -1)).toBe(-2);
  });
});
