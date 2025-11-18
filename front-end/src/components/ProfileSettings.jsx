import React, { useState } from "react";
import api from "../api";

export default function ProfileSettings({ user, onClose, onSave }) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [loading, setLoading] = useState(false);

  async function saveChanges() {
    if (!name.trim() || !email.trim()) return alert("Fill all fields");

    setLoading(true);
    try {
      const updated = {
        ...user,
        name,
        email
      };

      // no backend yet → mock update
      onSave(updated);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Edit Profile</h3>

        <label style={{ fontSize: 14 }}>Username</label>
        <input
          className="input"
          value={name}
          onChange={e => setName(e.target.value)}
        />

        <label style={{ fontSize: 14, marginTop: 10 }}>Email</label>
        <input
          className="input"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={onClose} className="modal-cancel">Cancel</button>
          <button onClick={saveChanges} className="modal-save">
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
