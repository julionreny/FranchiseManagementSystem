import { useEffect, useState } from "react";
import "./Notifications.css";
import {
  getNotifications,
  clearNotifications,
} from "../../services/notificationService";

const Notifications = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const branchId = user?.branch_id;

  const [notifications, setNotifications] = useState([]);

  const fetchNotifications = async () => {
    const res = await getNotifications(branchId);
    setNotifications(res.data);
  };

  useEffect(() => {
    if (branchId) fetchNotifications();
  }, [branchId]);

  const handleClearAll = async () => {
    if (!window.confirm("Clear all notifications?")) return;
    await clearNotifications(branchId);
    setNotifications([]);
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>Notifications</h1>

        {notifications.length > 0 && (
          <button className="clear-btn" onClick={handleClearAll}>
            Clear All
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="empty-state">No notifications</p>
      ) : (
        <ul className="notification-list">
          {notifications.map((n) => (
            <li key={n.notification_id} className={`notif ${n.type}`}>
              <p>{n.message}</p>
              <span>
                {new Date(n.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
