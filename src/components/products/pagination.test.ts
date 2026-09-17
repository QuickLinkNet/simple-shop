import { describe, expect, it } from "vitest";
import { pageRange } from "./pagination";

describe("pageRange", () => {
  it("zeigt alle Seiten bei wenigen Seiten", () => {
    expect(pageRange(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(pageRange(7, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("setzt Ellipsen um die aktuelle Seite", () => {
    expect(pageRange(1, 10)).toEqual([1, 2, "…", 10]);
    expect(pageRange(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]);
    expect(pageRange(10, 10)).toEqual([1, "…", 9, 10]);
  });

  it("verzichtet auf Ellipsen, wenn die Lücke nur eine Seite wäre", () => {
    expect(pageRange(3, 10)).toEqual([1, 2, 3, 4, "…", 10]);
  });
});
