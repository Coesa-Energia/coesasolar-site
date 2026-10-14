import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SolarDaySection } from "./SolarDaySection";

afterEach(() => vi.useRealTimers());

describe("SolarDaySection", () => {
  it("avança devagar sozinha e pausa quando a pessoa ajusta o horário", () => {
    vi.useFakeTimers();
    render(<SolarDaySection />);
    expect(screen.getByText("07:10")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByText("07:15")).toBeInTheDocument();

    fireEvent.change(screen.getByRole("slider", { name: "Horário do sol" }), { target: { value: "720" } });
    expect(screen.getByText("12:00")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(1500));
    expect(screen.getByText("12:00")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Reproduzir passagem do sol" }));
    act(() => vi.advanceTimersByTime(750));
    expect(screen.getByText("12:05")).toBeInTheDocument();
  });
});
