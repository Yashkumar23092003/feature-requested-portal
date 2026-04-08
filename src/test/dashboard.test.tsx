import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Index from "@/pages/Index";

// Mock useFeatureData
vi.mock("@/hooks/useFeatureData", () => ({
  useFeatureData: () => ({
    features: [],
    loading: false,
    error: null,
    lastSynced: null,
    needsCredentials: true,
    refetch: vi.fn(),
    totalFeatures: 0,
    totalRequests: 0,
    topCategory: "",
    mostRequested: "",
    categories: [],
    top10: [],
    categoryColorMap: {},
  }),
  getStoredCredentials: () => ({ spreadsheetId: "", apiKey: "" }),
  saveCredentials: vi.fn(),
}));

function renderIndex() {
  return render(
    <MemoryRouter>
      <Index />
    </MemoryRouter>
  );
}

describe("Dashboard — Index Page", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("renders the header with title", () => {
    renderIndex();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Feature Requests");
  });

  it("shows credentials empty state when no sheet is connected", () => {
    renderIndex();
    expect(screen.getByText("Connect your Google Sheet")).toBeInTheDocument();
    expect(screen.getByText("Add Credentials")).toBeInTheDocument();
  });

  it("shows onboarding cards in empty state", () => {
    renderIndex();
    expect(screen.getByText("Here's what you'll get")).toBeInTheDocument();
    expect(screen.getByText("Top Features")).toBeInTheDocument();
    expect(screen.getByText("Category View")).toBeInTheDocument();
    expect(screen.getByText("Full Table")).toBeInTheDocument();
    expect(screen.getByText("PM Brain")).toBeInTheDocument();
  });

  it("dark mode toggle adds and removes dark class", () => {
    renderIndex();
    const toggle = screen.getByTitle("Toggle dark mode");

    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(localStorage.getItem("theme")).toBe("dark");

    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("Coming Soon button is visible", () => {
    renderIndex();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("renders PM Brain navigation link", () => {
    renderIndex();
    const brainLink = screen.getByTitle("PM Brain");
    expect(brainLink).toBeInTheDocument();
    expect(brainLink.closest("a")).toHaveAttribute("href", "/brain");
  });

  it("renders Settings button", () => {
    renderIndex();
    expect(screen.getByTitle("Settings")).toBeInTheDocument();
  });

  it("renders Refresh button", () => {
    renderIndex();
    expect(screen.getByTitle("Refresh")).toBeInTheDocument();
  });
});
