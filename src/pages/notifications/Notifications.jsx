import { useEffect, useState } from "react";
import "./Notifications.css";
import axios from "axios";

import {
  getNotifications,
  clearNotifications,
  deleteNotification,
  getOwnerNotifications,
} from "../../services/notificationService";

const Notifications = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  const branchId = user?.branch_id;
  const franchiseId = user?.franchise_id;
  const isOwner = user?.role_id === 1;

  const [notifications, setNotifications] = useState([]);

  /* =========================
     FETCH NOTIFICATIONS
  ========================= */
  const fetchNotifications = async () => {
    try {
      let res;

      if (isOwner && franchiseId) {
        // OWNER → fetch all franchise notifications
        res = await getOwnerNotifications(franchiseId);
      } else if (!isOwner && branchId) {
        // MANAGER → fetch branch notifications
        res = await getNotifications(branchId);
      }

      setNotifications(res?.data || []);
    } catch (err) {
      console.error("Notification fetch error:", err);
    }
  };

  useEffect(() => {
    if ((isOwner && franchiseId) || (!isOwner && branchId)) {
      fetchNotifications();
    }
  }, [branchId, franchiseId, isOwner]);

  /* =========================
     CLEAR ALL (Manager only)
  ========================= */
  const handleClearAll = async () => {
    if (!window.confirm("Clear all notifications?")) return;

    try {
      if (isOwner) {
        alert("Owner clear all not implemented");
        return;
      }

      await clearNotifications(branchId);
      setNotifications([]);
    } catch (err) {
      console.error("Clear error:", err);
    }
  };

  /* =========================
     MARK AS READ
  ========================= */
  const handleRead = async (id) => {
    try {
      await deleteNotification(id);

      setNotifications((prev) =>
        prev.filter((n) => n.notification_id !== id)
      );
    } catch (err) {
      console.error("Delete notification error:", err);
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h1>
          {isOwner ? "Franchise Notifications" : "Branch Notifications"}
        </h1>

        {!isOwner && notifications.length > 0 && (
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
            <li key={n.notification_id} className="notif">
              <div className="notif-content">
                <p>{n.message}</p>
                <span>
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </div>

              <button
                className="read-btn"
                onClick={() => handleRead(n.notification_id)}
              >
                Mark As Read
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;