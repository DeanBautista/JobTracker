import { useAuth } from "@/features/auth/context/useAuth";

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <main className="p-8">
      <h1 className="text-2xl">Welcome, {user?.name}</h1>
      <button type="button" onClick={logout} className="mt-4 underline">
        Log out
      </button>
    </main>
  );
}