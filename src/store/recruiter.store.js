"use client";

import { create } from "zustand";
import axios from "axios";

/**
 * recruiter.store.js
 *
 * Zustand store for all recruiter-specific client state.
 * Uses axios for all API calls to:
 *   GET  /api/recruiter/dashboard
 *   GET  /api/recruiter/analytics
 */

export const useRecruiterStore = create((set, get) => ({
  // ─── Dashboard State ────────────────────────────────────────────────────────
  dashboardData: null,
  dashboardLoading: false,
  dashboardError: null,

  // ─── Analytics State ─────────────────────────────────────────────────────────
  analyticsData: null,
  analyticsLoading: false,
  analyticsError: null,

  // Current filter values for analytics
  analyticsFilters: {
    dateRange: "last-6-months",
    department: "all",
    location: "all",
  },

  // ─── Actions ─────────────────────────────────────────────────────────────────

  /**
   * Fetch all data required for the recruiter dashboard in a single request.
   * Populates dashboardData with:
   *   { summaryCards, applicationTrend, recentJobs, interviews, topJobs }
   */
  fetchDashboardData: async () => {
    set({ dashboardLoading: true, dashboardError: null });
    try {
      const { data } = await axios.get("/api/recruiter/dashboard");
      set({ dashboardData: data, dashboardLoading: false });
    } catch (error) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Failed to fetch dashboard data";
      set({ dashboardError: message, dashboardLoading: false });
    }
  },

  /**
   * Fetch all analytics data in a single request, passing current filters
   * as query parameters.
   * Populates analyticsData with:
   *   { keyMetrics, hiringFunnel, candidateFlowTrend, timeToHireData,
   *     sourcePerformance, aiScoreDistribution, interviewSuccessRate,
   *     recruiterPerformance, skillGap, topJobs }
   *
   * @param {object} filters – optional override; if omitted, uses store state
   */
  fetchAnalyticsData: async (filters) => {
    const currentFilters = filters ?? get().analyticsFilters;
    set({ analyticsLoading: true, analyticsError: null });
    try {
      const params = {};
      if (currentFilters.dateRange && currentFilters.dateRange !== "all") {
        params.dateRange = currentFilters.dateRange;
      }
      if (currentFilters.department && currentFilters.department !== "all") {
        params.department = currentFilters.department;
      }
      if (currentFilters.location && currentFilters.location !== "all") {
        params.location = currentFilters.location;
      }

      const { data } = await axios.get("/api/recruiter/analytics", { params });
      set({ analyticsData: data, analyticsLoading: false });
    } catch (error) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Failed to fetch analytics data";
      set({ analyticsError: message, analyticsLoading: false });
    }
  },

  /**
   * Update analytics filter values and re-fetch.
   * @param {object} newFilters – partial filter object to merge
   */
  setAnalyticsFilters: (newFilters) => {
    const merged = { ...get().analyticsFilters, ...newFilters };
    set({ analyticsFilters: merged });
    get().fetchAnalyticsData(merged);
  },

  /**
   * Export an analytics report.
   * Currently triggers a browser download by opening the URL with params.
   * Replace with a real axios POST if the backend returns a blob/PDF.
   *
   * @param {string} reportType – "full" | "funnel" | "recruiter" | "skills"
   */
  exportAnalyticsReport: async (reportType) => {
    try {
      const filters = get().analyticsFilters;
      const params = new URLSearchParams({
        reportType,
        dateRange: filters.dateRange,
        department: filters.department,
        location: filters.location,
      });

      // If the backend returns a file blob:
      const response = await axios.get(
        `/api/recruiter/analytics/export?${params.toString()}`,
        { responseType: "blob" }
      );

      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${reportType}-report.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      // Export endpoint not yet implemented — graceful no-op
      console.warn("Export endpoint not yet available.");
    }
  },

  // ─── Reset helpers ────────────────────────────────────────────────────────────
  clearDashboard: () =>
    set({ dashboardData: null, dashboardLoading: false, dashboardError: null }),

  clearAnalytics: () =>
    set({ analyticsData: null, analyticsLoading: false, analyticsError: null }),
}));
