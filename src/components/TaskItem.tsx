import { useState } from "react";
import { getErrorMessage } from "../lib/api";
import { STATUSES, STATUS_LABELS, type Task, type TaskStatus } from "../lib/tasks-api";
import { useDeleteTask, useUpdateTask } from "../lib/useTasks";
import { TaskForm } from "./TaskForm";

export function TaskItem({ task }: { task: Task }) {
  const [editing, setEditing] = useState(false);
  const update = useUpdateTask();
  const remove = useDeleteTask();

  if (editing) {
    return (
      <li className="card">
        <TaskForm
          initial={task}
          submitLabel="Save"
          onSubmit={async (input) => {
            await update.mutateAsync({ id: task.id, input });
            setEditing(false);
          }}
          onCancel={() => setEditing(false)}
        />
      </li>
    );
  }

  const actionError = update.error ?? remove.error;

  return (
    <li className="card task">
      <div className="task-main">
        <h3>{task.title}</h3>
        {task.description && <p className="muted">{task.description}</p>}
        {actionError && (
          <p role="alert" className="error">
            {getErrorMessage(actionError)}
          </p>
        )}
      </div>

      <div className="task-actions">
        <select
          aria-label={`Status of ${task.title}`}
          value={task.status}
          disabled={update.isPending}
          onChange={(e) =>
            update.mutate({ id: task.id, input: { status: e.target.value as TaskStatus } })
          }
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>

        <button
          className="btn btn-ghost"
          aria-label={`Edit ${task.title}`}
          onClick={() => setEditing(true)}
        >
          Edit
        </button>

        <button
          className="btn btn-ghost btn-danger"
          aria-label={`Delete ${task.title}`}
          disabled={remove.isPending}
          onClick={() => {
            if (window.confirm(`Delete "${task.title}"?`)) remove.mutate(task.id);
          }}
        >
          Delete
        </button>
      </div>
    </li>
  );
}
