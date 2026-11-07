import { useId, useState, type FormEvent } from "react";
import { getErrorMessage } from "../lib/api";
import { STATUSES, STATUS_LABELS, type Task, type TaskInput, type TaskStatus } from "../lib/tasks-api";

interface Props {
  initial?: Task;
  submitLabel: string;
  onSubmit: (input: TaskInput) => Promise<unknown>;
  onCancel?: () => void;
}

export function TaskForm({ initial, submitLabel, onSubmit, onCancel }: Props) {
  const uid = useId();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [status, setStatus] = useState<TaskStatus>(initial?.status ?? "TODO");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), status });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor={`${uid}-title`}>Title</label>
        <input
          id={`${uid}-title`}
          required
          maxLength={120}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor={`${uid}-description`}>Description</label>
        <textarea
          id={`${uid}-description`}
          rows={3}
          maxLength={1000}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor={`${uid}-status`}>Status</label>
        <select
          id={`${uid}-status`}
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      <div className="form-actions">
        <button className="btn btn-primary" type="submit" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </button>
        {onCancel && (
          <button className="btn btn-ghost" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
