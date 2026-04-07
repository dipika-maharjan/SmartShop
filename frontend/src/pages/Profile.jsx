import { useEffect, useState } from "react";
import API from "../services/api";
import "./Profile.css";

const initialAddress = {
  label: "",
  line1: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
};

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState(initialAddress);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  const authHeaders = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/users/me", authHeaders);
      setProfile(res.data);
      setName(res.data?.name || "");
      setPhone(res.data?.phone || "");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const saveProfile = async () => {
    try {
      setError("");
      const res = await API.put("/users/me", { name, phone }, authHeaders);
      setProfile(res.data);
      alert("Profile updated");
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update profile.");
    }
  };

  const addAddress = async () => {
    try {
      setError("");

      if (!address.line1.trim() || !address.city.trim()) {
        setError("Address line and city are required.");
        return;
      }

      await API.post("/users/addresses", address, authHeaders);
      setAddress(initialAddress);
      await fetchProfile();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add address.");
    }
  };

  const removeAddress = async (addressId) => {
    try {
      await API.delete(`/users/addresses/${addressId}`, authHeaders);
      await fetchProfile();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to remove address.");
    }
  };

  if (loading) {
    return (
      <main className="profile-shell">
        <section className="profile-card">
          <h2>My Profile</h2>
          <p>Loading profile...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="profile-shell">
      <section className="profile-card">
        <header className="profile-head">
          <span className="profile-badge">Account</span>
          <h2>My Profile</h2>
          <p>Update personal details and maintain your delivery addresses.</p>
        </header>

        {error && <p className="profile-error">{error}</p>}

        <div className="profile-grid">
          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
          </label>
          <label>
            Phone
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />
          </label>
        </div>

        <div className="profile-actions">
          <button type="button" onClick={saveProfile}>
            Save Profile
          </button>
        </div>

        <hr className="profile-divider" />

        <section>
          <div className="profile-section-title">
            <h3>Address Book</h3>
          </div>

          <div className="profile-grid profile-grid--address">
            <label>
              Label
              <input
                placeholder="Home / Office"
                value={address.label}
                onChange={(e) => setAddress((prev) => ({ ...prev, label: e.target.value }))}
              />
            </label>
            <label>
              Line 1
              <input
                placeholder="Street and area"
                value={address.line1}
                onChange={(e) => setAddress((prev) => ({ ...prev, line1: e.target.value }))}
              />
            </label>
            <label>
              City
              <input
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress((prev) => ({ ...prev, city: e.target.value }))}
              />
            </label>
            <label>
              State
              <input
                placeholder="State"
                value={address.state}
                onChange={(e) => setAddress((prev) => ({ ...prev, state: e.target.value }))}
              />
            </label>
            <label>
              Postal Code
              <input
                placeholder="Postal Code"
                value={address.postalCode}
                onChange={(e) => setAddress((prev) => ({ ...prev, postalCode: e.target.value }))}
              />
            </label>
            <label>
              Country
              <input
                placeholder="Country"
                value={address.country}
                onChange={(e) => setAddress((prev) => ({ ...prev, country: e.target.value }))}
              />
            </label>
          </div>

          <div className="profile-actions">
            <button type="button" onClick={addAddress}>
              Add Address
            </button>
          </div>
        </section>

        <div className="profile-address-list">
          {(profile?.addresses || []).length === 0 ? <p className="profile-muted">No saved addresses.</p> : null}

          {(profile?.addresses || []).map((a) => (
            <article key={a._id} className="profile-address-item">
              <div>
                <p className="profile-address-label">{a.label || "Address"}</p>
                <p className="profile-address-line">
                  {a.line1}, {a.city} {a.state} {a.postalCode} {a.country}
                </p>
              </div>
              <button
                type="button"
                className="profile-remove-btn"
                onClick={() => removeAddress(a._id)}
              >
                Remove
              </button>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
