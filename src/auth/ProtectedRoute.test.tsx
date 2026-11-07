import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ProtectedRoute } from "./ProtectedRoute";

const { useAuthMock } = vi.hoisted(() => ({ useAuthMock: vi.fn() }));

vi.mock("./AuthContext", () => ({ useAuth: useAuthMock }));

function renderAtPrivate() {
  return render(
    <MemoryRouter initialEntries={["/private"]}>
      <Routes>
        <Route path="/login" element={<p>Login page</p>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/private" element={<p>Secret content</p>} />
        </Route>
      </Routes>
    </MemoryRouter>,
  );
}

describe("ProtectedRoute", () => {
  it("redirects anonymous users to /login", () => {
    useAuthMock.mockReturnValue({ user: null, loading: false });
    renderAtPrivate();

    expect(screen.getByText("Login page")).toBeInTheDocument();
    expect(screen.queryByText("Secret content")).not.toBeInTheDocument();
  });

  it("renders the page for authenticated users", () => {
    useAuthMock.mockReturnValue({ user: { id: "1", name: "Jane" }, loading: false });
    renderAtPrivate();

    expect(screen.getByText("Secret content")).toBeInTheDocument();
  });
});
