import { apiRequest } from "./client.js";

export const portfolioApi = {
  // Auth
  login: (email, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  refreshToken: (refresh_token) =>
    apiRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify({ refresh_token }),
    }),
  getMe: () => apiRequest("/auth/me"),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),

  // System & Intro Settings
  getSettings: () => apiRequest("/settings"),
  updateSettings: (data) =>
    apiRequest("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Profile
  getProfile: () => apiRequest("/profile"),
  updateProfile: (data) =>
    apiRequest("/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Projects
  getProjects: (params = {}) =>
    apiRequest(params?.all ? "/projects?all=true" : "/projects"),
  createProject: (data) =>
    apiRequest("/projects", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateProject: (id, data) =>
    apiRequest(`/projects/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  togglePublishProject: (id, is_published) =>
    apiRequest(`/projects/${id}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ is_published }),
    }),
  deleteProject: (id) =>
    apiRequest(`/projects/${id}`, {
      method: "DELETE",
    }),
  syncProjectGithub: (id, data = {}) =>
    apiRequest(`/projects/${id}/github-sync`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Skills
  getSkills: () => apiRequest("/skills"),
  createSkill: (data) =>
    apiRequest("/skills", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSkill: (id, data) =>
    apiRequest(`/skills/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  deleteSkill: (id) =>
    apiRequest(`/skills/${id}`, {
      method: "DELETE",
    }),

  // Services
  getServices: (params = {}) =>
    apiRequest(params?.all ? "/services?all=true" : "/services"),
  createService: (data) =>
    apiRequest("/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateService: (id, data) =>
    apiRequest(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  togglePublishService: (id, is_published) =>
    apiRequest(`/services/${id}/publish`, {
      method: "PATCH",
      body: JSON.stringify({ is_published }),
    }),
  deleteService: (id) =>
    apiRequest(`/services/${id}`, {
      method: "DELETE",
    }),

  // Social Links
  getSocialLinks: (params = {}) =>
    apiRequest(params?.all ? "/social-links?all=true" : "/social-links"),
  createSocialLink: (data) =>
    apiRequest("/social-links", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateSocialLink: (id, data) =>
    apiRequest(`/social-links/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  toggleStatusSocialLink: (id, is_active) =>
    apiRequest(`/social-links/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ is_active }),
    }),
  deleteSocialLink: (id) =>
    apiRequest(`/social-links/${id}`, {
      method: "DELETE",
    }),

  // Contact Messages
  submitMessage: (data) =>
    apiRequest("/messages", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMessages: () => apiRequest("/messages"),
  updateMessageStatus: (id, status) =>
    apiRequest(`/messages/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
  deleteMessage: (id) =>
    apiRequest(`/messages/${id}`, {
      method: "DELETE",
    }),

  // System Diagnostics & Health Telemetry
  getSystemHealth: () => apiRequest("/system/health"),
};
