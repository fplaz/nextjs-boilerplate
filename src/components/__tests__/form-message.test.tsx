import { render, screen } from "@testing-library/react";
import { FormMessage } from "../form-message";

const mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useSearchParams: () => mockSearchParams,
}));

beforeEach(() => {
  // Clear params between tests
  [...mockSearchParams.keys()].forEach((key) => mockSearchParams.delete(key));
});

describe("FormMessage", () => {
  it("renders nothing when no query params", () => {
    const { container } = render(<FormMessage />);
    expect(container.firstChild).toBeNull();
  });

  it("renders error with destructive styling", () => {
    mockSearchParams.set("error", "Something went wrong");
    render(<FormMessage />);

    const message = screen.getByText("Something went wrong");
    expect(message).toBeInTheDocument();
    expect(message.className).toContain("destructive");
  });

  it("renders success message with green styling", () => {
    mockSearchParams.set("message", "All good!");
    render(<FormMessage />);

    const message = screen.getByText("All good!");
    expect(message).toBeInTheDocument();
    expect(message.className).toContain("green");
  });

  it("shows error when both error and message params are present", () => {
    mockSearchParams.set("error", "Bad request");
    mockSearchParams.set("message", "Success");
    render(<FormMessage />);

    expect(screen.getByText("Bad request")).toBeInTheDocument();
    expect(screen.queryByText("Success")).not.toBeInTheDocument();
  });
});

