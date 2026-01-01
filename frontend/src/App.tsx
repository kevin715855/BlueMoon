import { useAuth } from "./hooks/useAuth";
import { LoginPage } from "./components/LoginPage";
import { ResidentDashboard } from "./components/resident/ResidentDashboard";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { LoadingSpinner } from "./components/shared/LoadingSpinner";
import { Toaster } from "./components/ui/sonner";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner />
        <p className="text-gray-600 mt-4">Đang tải...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-red-600 text-6xl mb-4">⚠️</div>
        <h2 className="text-gray-900 mb-2">Đã xảy ra lỗi</h2>
        <p className="text-gray-600 mb-6">{message}</p>
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          Thử lại
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const { user, loading: authLoading, error: authError, login, logout } = useAuth();

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
    return (
      <>
        <LoginPage onLogin={login} loading={authLoading} />
        <Toaster />
      </>
    );
  }

  // User is authenticated - determine which dashboard to show based on role
  const isResident = user.role === "Resident";
  const isAdmin = user.role === "Accountant" || user.role === "Admin" || user.role === "Manager";

  return (
    <>
      {isResident ? (
        <ResidentDashboard username={user.username} role={user.role} onLogout={logout} />
      ) : isAdmin ? (
        <AdminDashboard username={user.username} role={user.role} onLogout={logout} />
      ) : (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-gray-900 mb-2">Vai trò không xác định</h2>
            <p className="text-gray-600 mb-4">Vai trò ({user.role}) không được hỗ trợ.</p>
            <button
              onClick={logout}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      )}
      <Toaster />
    </>
  );
}
