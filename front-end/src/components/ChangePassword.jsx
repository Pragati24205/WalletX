import React, { useState } from "react";

export default function ChangePassword({ onClose }) {
  const [oldPass, setOldPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirm, setConfirm] = useState("");

  function submit() {
    if (!oldPass || !newPass || !confirm) return alert("Fill all fields");
    if (newPass !== confirm) return alert("Passwords don't match");

    alert("Password changed successfully (demo)");
    onClose();
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Change Password</h3>

        <input
          className="input"
          type="password"
          placeholder="Current password"
          value={oldPass}
          onChange={e => setOldPass(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="New password"
          value={newPass}
          onChange={e => setNewPass(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Confirm new password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
        />

        <div className="modal-actions">
          <button onClick={onClose} className="modal-cancel">Cancel</button>
          <button onClick={submit} className="modal-save">Update</button>
        </div>
      </div>
    </div>
  );
}
