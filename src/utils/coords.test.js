import { describe, it, expect } from "vitest";
import { toPercent, toPixels, eventToPercent, normalizeRect } from "./coords";

describe("toPercent", () => {
    it("converts a pixel value to the correct percentage", () => {
        expect(toPercent(200, 800)).toBe(25);
    });

    it("returns 0 when pixels is 0", () => {
        expect(toPercent(0, 800)).toBe(0);
    });

    it("returns 100 when pixels equals containerPixels", () => {
        expect(toPercent(800, 800)).toBe(100);
    });
});

describe("toPixels", () => {
    it("converts a percentage to the correct pixel value", () => {
        expect(toPixels(25, 800)).toBe(200);
    });

    it("returns 0 when percent is 0", () => {
        expect(toPixels(0, 800)).toBe(0);
    });

    it("returns containerPixels when percent is 100", () => {
        expect(toPixels(100, 800)).toBe(800);
    });
});

describe("toPercent and toPixels round-trip", () => {
    it("recovers the original pixel value after converting to percent and back", () => {
        expect(toPixels(toPercent(123, 800), 800)).toBeCloseTo(123);
    });
});

describe("eventToPercent", () => {
    it("returns the correct percentage position from a mouse event and container rect", () => {
        const event = { clientX: 200, clientY: 150 };
        const containerRect = { left: 0, top: 0, width: 800, height: 600 };
        expect(eventToPercent(event, containerRect)).toEqual({ x: 25, y: 25 });
    });

    it("accounts for the container offset", () => {
        const event = { clientX: 300, clientY: 250 };
        const containerRect = { left: 100, top: 100, width: 800, height: 600 };
        expect(eventToPercent(event, containerRect)).toEqual({ x: 25, y: 25 });
    });
});

describe("normalizeRect", () => {
    it("returns a well-formed rect when dragging top-left to bottom-right", () => {
        expect(normalizeRect(10, 20, 50, 60)).toEqual({ x: 10, y: 20, width: 40, height: 40 });
    });

    it("normalizes a rect when dragging bottom-right to top-left", () => {
        expect(normalizeRect(50, 60, 10, 20)).toEqual({ x: 10, y: 20, width: 40, height: 40 });
    });

    it("normalizes a rect when dragging bottom-left to top-right", () => {
        expect(normalizeRect(10, 60, 50, 20)).toEqual({ x: 10, y: 20, width: 40, height: 40 });
    });

    it("returns zero width and height when both corners are the same point", () => {
        expect(normalizeRect(10, 20, 10, 20)).toEqual({ x: 10, y: 20, width: 0, height: 0 });
    });
});