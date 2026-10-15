import { useEffect, useState } from "react";
import { portfolioApi } from "../../api/portfolioApi";
import { useToast } from "../context/useToast";
import { useConfirm } from "../context/useConfirm";

export default function AdminMessages() {
  const toast = useToast();
  const confirm = useConfirm();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const loadMessages = async () => {
    try {
      const res = await portfolioApi.getMessages();
      setMessages(res.data || []);
    } catch (err) {
      toast.error("Failed to load messages: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    portfolioApi.getMessages()
      .then((res) => {
        if (active) {
          setMessages(res.data || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          console.error("Failed to load messages:", err.message);
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await portfolioApi.updateMessageStatus(id, newStatus);
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: newStatus } : m))
      );
      if (selectedMessage && selectedMessage.id === id) {
        setSelectedMessage({ ...selectedMessage, status: newStatus });
      }
      toast.success(`Message marked as ${newStatus}.`);
    } catch (err) {
      toast.error("Failed to update status: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirm({
      title: "inbox.delete_prompt",
      message: "Permanently delete this contact message? This action cannot be undone.",
      confirmText: "Delete Message",
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await portfolioApi.deleteMessage(id);
      setMessages((prev) => prev.filter((m) => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
      toast.success("Message deleted.");
    } catch (err) {
      toast.error("Failed to delete message: " + err.message);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-card-header">
        <h2 className="admin-card-title">📨 Contact Inquiries Inbox</h2>
        <button className="btn btn-ghost btn-sm" onClick={loadMessages}>
          Refresh
        </button>
      </div>

      <div className="admin-card">
        {loading ? (
          <p style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            Loading inbox messages...
          </p>
        ) : messages.length === 0 ? (
          <p style={{ color: "var(--text-dim)", fontFamily: "var(--font-mono)" }}>
            No contact messages received yet.
          </p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Sender</th>
                  <th>Email</th>
                  <th>Message Preview</th>
                  <th>Received</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {messages.map((msg) => (
                  <tr
                    key={msg.id}
                    style={{
                      background: msg.status === "unread" ? "rgba(245, 185, 66, 0.04)" : "transparent",
                    }}
                  >
                    <td>
                      <span className={`badge-status ${msg.status}`}>
                        {msg.status}
                      </span>
                    </td>
                    <td style={{ fontWeight: msg.status === "unread" ? 700 : 500 }}>
                      {msg.name}
                    </td>
                    <td>
                      <a href={`mailto:${msg.email}`} style={{ color: "var(--accent-teal)" }}>
                        {msg.email}
                      </a>
                    </td>
                    <td
                      onClick={() => {
                        setSelectedMessage(msg);
                        if (msg.status === "unread") handleStatusChange(msg.id, "read");
                      }}
                      style={{
                        maxWidth: 240,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        cursor: "pointer",
                        color: "var(--text)",
                      }}
                      title="Click to view full message"
                    >
                      {msg.message}
                    </td>
                    <td style={{ color: "var(--text-dim)", fontSize: 12 }}>
                      {new Date(msg.created_at).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ marginRight: 6 }}
                        onClick={() => {
                          setSelectedMessage(msg);
                          if (msg.status === "unread") handleStatusChange(msg.id, "read");
                        }}
                      >
                        Read
                      </button>
                      <button
                        className="btn btn-ghost btn-sm btn-danger"
                        onClick={() => handleDelete(msg.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedMessage && (
        <div className="admin-modal-backdrop" onClick={() => setSelectedMessage(null)}>
          <div className="admin-modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3 style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: 16 }}>
                Inquiry from {selectedMessage.name}
              </h3>
              <button className="btn btn-ghost btn-sm" onClick={() => setSelectedMessage(null)}>
                ✕
              </button>
            </div>

            <div className="admin-modal-body">
              <div style={{ marginBottom: 14, fontFamily: "var(--font-mono)", fontSize: 13 }}>
                <p style={{ margin: "0 0 6px", color: "var(--text-dim)" }}>
                  <strong style={{ color: "var(--text)" }}>Email: </strong>
                  <a href={`mailto:${selectedMessage.email}`} style={{ color: "var(--accent-teal)" }}>
                    {selectedMessage.email}
                  </a>
                </p>
                <p style={{ margin: "0 0 6px", color: "var(--text-dim)" }}>
                  <strong style={{ color: "var(--text)" }}>Date: </strong>
                  {new Date(selectedMessage.created_at).toLocaleString()}
                </p>
                <p style={{ margin: "0 0 16px", color: "var(--text-dim)" }}>
                  <strong style={{ color: "var(--text)" }}>Status: </strong>
                  <span className={`badge-status ${selectedMessage.status}`}>
                    {selectedMessage.status}
                  </span>
                </p>
              </div>

              <div
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: 18,
                  fontSize: 14.5,
                  lineHeight: 1.6,
                  whiteSpace: "pre-wrap",
                  color: "var(--text)",
                }}
              >
                {selectedMessage.message}
              </div>
            </div>

            <div className="admin-modal-footer">
              <a
                href={`mailto:${selectedMessage.email}?subject=Re: Portfolio Inquiry`}
                className="btn btn-primary btn-sm"
              >
                Reply via Email ✉
              </a>
              {selectedMessage.status !== "archived" && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleStatusChange(selectedMessage.id, "archived")}
                >
                  Archive
                </button>
              )}
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => setSelectedMessage(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
