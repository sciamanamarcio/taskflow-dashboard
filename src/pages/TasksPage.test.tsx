import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Task } from "../lib/tasks-api";
import TasksPage from "./TasksPage";

const { listMock, createMock, updateMock, removeMock } = vi.hoisted(() => ({
  listMock: vi.fn(),
  createMock: vi.fn(),
  updateMock: vi.fn(),
  removeMock: vi.fn(),
}));

vi.mock("../auth/AuthContext", () => ({
  useAuth: () => ({ user: { id: "u1", name: "Jane" } }),
}));

vi.mock("../lib/tasks-api", async (importOriginal) => {
  const original = await importOriginal<typeof import("../lib/tasks-api")>();
  return {
    ...original,
    tasksApi: { list: listMock, create: createMock, update: updateMock, remove: removeMock },
  };
});

const task: Task = {
  id: "t1",
  title: "Write tests",
  description: "Cover the main flows",
  status: "TODO",
  dueDate: null,
  userId: "u1",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

const pageOf = (tasks: Task[]) => ({
  data: tasks,
  meta: { page: 1, limit: 5, total: tasks.length, totalPages: tasks.length > 0 ? 1 : 0 },
});

function renderPage() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <TasksPage />
    </QueryClientProvider>,
  );
}

describe("TasksPage", () => {
  beforeEach(() => {
    listMock.mockReset();
    createMock.mockReset();
    updateMock.mockReset();
    removeMock.mockReset();
    listMock.mockResolvedValue(pageOf([task]));
  });

  it("lists the tasks returned by the API", async () => {
    renderPage();

    expect(await screen.findByText("Write tests")).toBeInTheDocument();
    expect(screen.getByText("Cover the main flows")).toBeInTheDocument();
  });

  it("shows an empty state when there are no tasks", async () => {
    listMock.mockResolvedValue(pageOf([]));
    renderPage();

    expect(await screen.findByText(/no tasks found/i)).toBeInTheDocument();
  });

  it("creates a task from the form", async () => {
    createMock.mockResolvedValue({ ...task, id: "t2", title: "Ship it" });
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Write tests");

    await user.click(screen.getByRole("button", { name: /new task/i }));
    await user.type(screen.getByLabelText(/^title$/i), "Ship it");
    await user.click(screen.getByRole("button", { name: /create task/i }));

    expect(createMock).toHaveBeenCalledWith(expect.objectContaining({ title: "Ship it" }));
  });

  it("filters by status", async () => {
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Write tests");

    await user.selectOptions(screen.getByLabelText(/filter by status/i), "DONE");

    expect(listMock).toHaveBeenLastCalledWith({ status: "DONE", page: 1, limit: 5 });
  });

  it("deletes a task after confirmation", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    removeMock.mockResolvedValue(undefined);
    const user = userEvent.setup();
    renderPage();
    await screen.findByText("Write tests");

    await user.click(screen.getByRole("button", { name: /delete write tests/i }));

    expect(removeMock).toHaveBeenCalledWith("t1");
  });
});
