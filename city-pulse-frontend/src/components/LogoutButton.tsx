import { logout, getCurrentUser, isAdmin } from "../utils/authUtils";
import { useNavigate } from "react-router-dom";
import "./LogoutButton.css";

interface LogoutButtonProps {
  inline?: boolean;
}

function LogoutButton({ inline = false }: LogoutButtonProps) {
  const user = getCurrentUser();
  const navigate = useNavigate();

  return (
    <div className={`logout-container${inline ? " inline" : ""}`}>
      <span className="user-name">Hi, {user?.username}</span>
      <button className="logout-button" onClick={logout}>
        Logout
      </button>
      {!inline && isAdmin() && (
        <button
          className="admin-dashboard-btn"
          onClick={() => navigate("/admin/dashboard")}
          title="Open Admin Dashboard"
        >
          Dashboard
        </button>
      )}
    </div>
  );
}

export default LogoutButton;
