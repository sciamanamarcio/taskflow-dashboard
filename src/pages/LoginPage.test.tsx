import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../lib/api";
import LoginPage from "./LoginPage";

const { loginMock } = vi.hoisted(() => ({ loginMock: vi.fn() }));

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({ login: loginMock }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => loginMock.mockReset());

  it("submits the typed credentials", async () => {
    loginMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(loginMock).toHaveBeenCalledWith("jane@example.com", "password123");
  });

  it("shows the API error message", async () => {
    loginMock.mockRejectedValue(new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password"));
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
  });
});
