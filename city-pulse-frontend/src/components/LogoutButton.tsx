import { logout, getCurrentUser } from '../utils/authUtils';
import './LogoutButton.css';

function LogoutButton() {
  const user = getCurrentUser();

  return (
    <div className="logout-container">
      <span className="user-name">Hi, {user?.username}</span>
      <button className="logout-button" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

export default LogoutButton;