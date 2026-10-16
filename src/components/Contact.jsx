import { useState } from "react";
import { usePortfolio } from "../context/usePortfolio";
import { portfolioApi } from "../api/portfolioApi";
import SocialIcon from "./SocialIcon";
import "./Contact.css";

const FORM_ENDPOINT = "https://formspree.io/f/mzebeegd";

export default function Contact() {
  const { profile, socialLinks } = usePortfolio();
  const [form, setForm] = useState({ name: "", email: "", message: "", _gotcha: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error

  // Derive links: prioritize dynamically managed socialLinks from admin, fallback to profile
  const activeLinks =
    Array.isArray(socialLinks) && socialLinks.length > 0
      ? socialLinks
          .filter((l) => l.is_active !== false)
          .sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0))
      : [
          {
            id: "fallback-email",
            platform: "email",
            title: "Email",
            url: `mailto:${profile?.email || "officiallahiru.p@gmail.com"}`,
            display_value: profile?.email || "officiallahiru.p@gmail.com",
          },
          {
            id: "fallback-linkedin",
            platform: "linkedin",
            title: "LinkedIn",
            url: profile?.linkedin_url || "https://www.linkedin.com/in/lahiru-priyankara-5972742ab",
            display_value: (profile?.linkedin_url || "linkedin.com/in/lahiru-priyankara").replace(/^https?:\/\//i, ""),
          },
          {
            id: "fallback-github",
            platform: "github",
            title: "GitHub",
            url: profile?.github_url || "https://github.com/lahiru-priyankara",
            display_value: (profile?.github_url || "github.com/lahiru-priyankara").replace(/^https?:\/\//i, ""),
          },
        ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form._gotcha) return; // bot honeypot
    setStatus("sending");

    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      };

      // 1. Submit to portfolio backend API (persists in Supabase database & Admin inbox)
      let backendSuccess = false;
      try {
        const res = await portfolioApi.submitMessage(payload);
        if (res.success) backendSuccess = true;
      } catch (backendErr) {
        console.warn("Backend API submit notice:", backendErr.message);
      }

      // 2. Also forward to Formspree for immediate email inbox notifications
      try {
        const formData = new FormData(e.target);
        const formspreeRes = await fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { Accept: "application/json" },
          body: formData,
        });
        if (!backendSuccess && !formspreeRes.ok) {
          throw new Error("Form submission failed");
        }
      } catch (formspreeErr) {
        if (!backendSuccess) throw formspreeErr;
      }

      setStatus("sent");
      setForm({ name: "", email: "", message: "", _gotcha: "" });
    } catch {
      setStatus("error");
    }
  };

  return (
    <section id="contact" className="section contact">
      <div className="container">
        <span className="eyebrow reveal-on-scroll">Contact.jsx</span>
        <h2 className="section-title reveal-on-scroll delay-1">
          Let's <span className="accent">talk</span>
        </h2>

        <div className="contact-grid">
          <div className="contact-links-card reveal-on-scroll reveal-popup delay-2">
            <div className="contact-card-header">
              <span className="dot dot-red" />
              <span className="dot dot-amber" />
              <span className="dot dot-green" />
              <span className="card-filename">contact.config.json</span>
            </div>
            <div className="contact-card-body">
              <ul className="contact-list">
                {activeLinks.map((l) => (
                  <li key={l.id || l.platform}>
                    <div className="contact-link-row">
                      <span className="contact-icon-badge" title={l.title || l.platform}>
                        <SocialIcon
                          platform={l.platform}
                          url={l.url}
                          title={l.title}
                          size={14}
                        />
                      </span>
                      <span className="config-key">"{l.platform || l.title?.toLowerCase()}"</span>:{" "}
                      <a
                        href={l.url}
                        target={l.url.startsWith("mailto:") || l.url.startsWith("tel:") ? "_self" : "_blank"}
                        rel="noopener noreferrer"
                        className="config-value"
                        title={`Open ${l.title || l.platform}`}
                      >
                        "{l.display_value || l.url}"
                      </a>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="contact-status-chip">
                <span className="status-indicator" />
                <span>Available for freelance &amp; full-stack roles</span>
              </div>
              <p className="contact-note">
                Feel free to reach out directly through any channel above, or send a message using the form.
              </p>
            </div>
          </div>

          <form className="contact-form reveal-on-scroll reveal-popup delay-3" onSubmit={handleSubmit}>
            {/* Honeypot field for bot protection */}
            <input
              type="text"
              name="_gotcha"
              value={form._gotcha}
              onChange={handleChange}
              style={{ display: "none" }}
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="contact-form-row">
              <label>
                Name
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  required
                />
              </label>
            </div>
            <label>
              Message
              <textarea
                name="message"
                rows="5"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell me about your project..."
                required
              />
            </label>
            <button
              type="submit"
              className="btn btn-primary btn-shimmer"
              disabled={status === "sending"}
            >
              {status === "sending" ? "Sending..." : "Send Message"}
            </button>
            {status === "sent" && (
              <p className="form-success">Thanks — I'll get back to you soon.</p>
            )}
            {status === "error" && (
              <p className="form-error">
                Something went wrong — please email me directly instead.
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}