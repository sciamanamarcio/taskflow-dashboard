import { useAuth } from "../auth/AuthContext";

// Placeholder: a lista de tarefas entra no PR #2
export default function TasksPage() {
  const { user } = useAuth();

  return (
    <section>
      <h2>Welcome, {user?.name}</h2>
      <p className="muted">Your tasks will show up here.</p>
    </section>
  );
}
