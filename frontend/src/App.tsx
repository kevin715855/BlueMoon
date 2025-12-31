import { useAuth } from "./hooks/useAuth";
import { useApartments } from "./hooks/useApartments";
import { useResidents } from "./hooks/useResidents";
import { LoginPage } from "./components/LoginPage";
import { ResidentDashboard } from "./components/resident/ResidentDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { LoadingSpinner } from "./components/shared/LoadingSpinner";

// Loading Component
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
      </div>
    </div>
  );
}

// Error Component
function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-gray-900 mb-2">Oops! Something went wrong</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

function App() {
  const { user, loading: authLoading, error: authError, login, logout } = useAuth();
  const { apartments, loading: apartmentsLoading, error: apartmentsError } = useApartments();
  const { residents, loading: residentsLoading, error: residentsError } = useResidents();

  // Show loading screen while checking authentication
  if (authLoading) {
    return <LoadingScreen />;
  }

  // Show error if auth failed
  if (authError) {
    return <ErrorScreen message={authError} onRetry={() => window.location.reload()} />;
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage onLogin={login} loading={authLoading} />;
  }

  // User is authenticated - determine which dashboard to show based on role
  const isResident = user.role === "Resident";
  const isAdmin = user.role === "Accountant" || user.role === "Admin" || user.role === "Manager" || user.role === "BuildingManager";

  if (isResident) {
    // Resident Dashboard
    return (
      <ResidentDashboard
        username={user.username}
        role={user.role}
        onLogout={logout}
      />
    );
  }

  if (isAdmin) {
    // Admin Dashboard - load apartments and residents
    const loading = apartmentsLoading || residentsLoading;
    const error = apartmentsError || residentsError;

    if (error) {
      return <ErrorScreen message={error} onRetry={() => window.location.reload()} />;
    }

    return (
      <AdminDashboard
        username={user.username}
        role={user.role}
        apartments={apartments}
        residents={residents}
        onLogout={logout}
        apartmentsLoading={apartmentsLoading}
        residentsLoading={residentsLoading}
      />
    );
  }

  // Unknown role
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-gray-900 mb-2">Unknown Role</h2>
        <p className="text-gray-600 mb-4">Your role ({user.role}) is not recognized.</p>
        <button
          onClick={logout}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default App;
