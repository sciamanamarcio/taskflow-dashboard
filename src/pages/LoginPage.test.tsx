import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError } from "../lib/api";
import LoginPage from "./LoginPage";

type LoginFn = (email: string, password: string) => Promise<void>;

const { state } = vi.hoisted(() => ({
  state: { login: (async () => {}) as LoginFn },
}));

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({ login: (email: string, password: string) => state.login(email, password) }),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    state.login = async () => {};
  });

  it("submits the typed credentials", async () => {
    const calls: string[][] = [];
    state.login = async (email, password) => {
      calls.push([email, password]);
    };
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "password123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(calls).toEqual([["jane@example.com", "password123"]]);
  });

  it("shows the API error message", async () => {
    state.login = async () => {
      throw new ApiError(401, "INVALID_CREDENTIALS", "Invalid email or password");
    };
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText(/email/i), "jane@example.com");
    await user.type(screen.getByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid email or password");
  });
});
