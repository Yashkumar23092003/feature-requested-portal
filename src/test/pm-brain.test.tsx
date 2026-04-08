import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import PMBrain from "@/pages/PMBrain";

// Mock useFeatureData
vi.mock("@/hooks/useFeatureData", () => ({
  useFeatureData: () => ({
    features: [
      { feature_key: "f1", normalized_feature_name: "API Webhooks", category: "Integrations", count: 15 },
      { feature_key: "f2", normalized_feature_name: "SSO Login", category: "Security", count: 10 },
    ],
    loading: false,
    error: null,
    lastSynced: null,
    needsCredentials: false,
    refetch: vi.fn(),
    totalFeatures: 2,
    totalRequests: 25,
    topCategory: "Integrations",
    mostRequested: "API Webhooks",
    categories: [],
    top10: [],
    categoryColorMap: {},
  }),
  getStoredCredentials: () => ({ spreadsheetId: "", apiKey: "" }),
  saveCredentials: vi.fn(),
}));

function renderBrain() {
  return render(
    <MemoryRouter initialEntries={["/brain"]}>
      <PMBrain />
    </MemoryRouter>
  );
}

describe("PM Brain Page", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders header", () => {
    renderBrain();
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("PM Brain");
  });

  it("shows Dashboard link", () => {
    renderBrain();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("shows Reference Documents section with upload and paste tabs", () => {
    renderBrain();
    expect(screen.getByText("Reference Documents")).toBeInTheDocument();
    expect(screen.getByText("Upload File")).toBeInTheDocument();
    expect(screen.getByText("Paste Text")).toBeInTheDocument();
  });

  it("switches between Upload and Paste tabs", () => {
    renderBrain();
    expect(screen.getByText("Click to upload")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Paste Text"));
    expect(screen.getByPlaceholderText(/Title/)).toBeInTheDocument();

    fireEvent.click(screen.getByText("Upload File"));
    expect(screen.getByText("Click to upload")).toBeInTheDocument();
  });

  it("can paste and add a document", () => {
    renderBrain();
    fireEvent.click(screen.getByText("Paste Text"));

    fireEvent.change(screen.getByPlaceholderText(/Title/), { target: { value: "My Expertise" } });
    fireEvent.change(screen.getByPlaceholderText(/Describe your/), {
      target: { value: "I know workflow automation." },
    });
    fireEvent.click(screen.getByText("Add to Brain"));

    expect(screen.getByText("My Expertise")).toBeInTheDocument();
    expect(screen.getByText("1 doc")).toBeInTheDocument();
  });

  it("shows AI Prioritization section with top 5 label", () => {
    renderBrain();
    expect(screen.getByText("AI Prioritization")).toBeInTheDocument();
    expect(screen.getByText(/top 5 features/)).toBeInTheDocument();
  });

  it("Analyze button is disabled without documents", () => {
    renderBrain();
    const btn = screen.getByText("Analyze & Prioritize").closest("button");
    expect(btn).toBeDisabled();
  });

  it("shows AI provider options", () => {
    renderBrain();
    expect(screen.getByText("AI Provider")).toBeInTheDocument();
    expect(screen.getByText("Default")).toBeInTheDocument();
    expect(screen.getByText("Claude")).toBeInTheDocument();
    expect(screen.getByText("OpenAI")).toBeInTheDocument();
    expect(screen.getByText("Gemini")).toBeInTheDocument();
  });

  it("Default provider shows no API key required", () => {
    renderBrain();
    expect(screen.getByText("No API key required")).toBeInTheDocument();
  });

  it("switching to Claude shows API key input", () => {
    renderBrain();
    fireEvent.click(screen.getByText("Claude"));
    expect(screen.getByPlaceholderText("sk-ant-...")).toBeInTheDocument();
  });
});
