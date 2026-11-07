import { useEffect, useState } from "react";
import { TaskForm } from "../components/TaskForm";
import { TaskItem } from "../components/TaskItem";
import { getErrorMessage } from "../lib/api";
import { STATUSES, STATUS_LABELS, type TaskStatus } from "../lib/tasks-api";
import { useCreateTask, useTasks } from "../lib/useTasks";

const PAGE_SIZE = 5;

export default function TasksPage() {
  const [status, setStatus] = useState<TaskStatus | "">("");
  const [page, setPage] = useState(1);
  const [showForm, setShowForm] = useState(false);

  const { data, isPending, isError, error, isPlaceholderData } = useTasks({
    status: status || undefined,
    page,
    limit: PAGE_SIZE,
  });
  const create = useCreateTask();

  // Se a última tarefa de uma página for removida, volta para a última página existente
  useEffect(() => {
    if (data && data.meta.totalPages > 0 && page > data.meta.totalPages) {
      setPage(data.meta.totalPages);
    }
  }, [data, page]);

  return (
    <section className="tasks-page">
      <div className="toolbar">
        <h2>Your tasks</h2>
        <div className="toolbar-actions">
          <select
            aria-label="Filter by status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as TaskStatus | "");
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Close" : "New task"}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card">
          <TaskForm
            submitLabel="Create task"
            onSubmit={async (input) => {
              await create.mutateAsync(input);
              setShowForm(false);
            }}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {isPending && <p className="muted">Loading tasks...</p>}

      {isError && (
        <p role="alert" className="error">
          {getErrorMessage(error)}
        </p>
      )}

      {data && data.data.length === 0 && <p className="muted empty">No tasks found.</p>}

      {data && data.data.length > 0 && (
        <ul className={`task-list${isPlaceholderData ? " stale" : ""}`}>
          {data.data.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </ul>
      )}

      {data && data.meta.totalPages > 1 && (
        <nav className="pagination" aria-label="Pagination">
          <button
            className="btn btn-ghost"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </button>
          <span className="muted">
            Page {data.meta.page} of {data.meta.totalPages}
          </span>
          <button
            className="btn btn-ghost"
            disabled={page >= data.meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </section>
  );
}
