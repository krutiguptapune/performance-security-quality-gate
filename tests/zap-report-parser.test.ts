import { describe, it, expect } from "vitest";
import { checkSecurityReport } from "../src/security/zap-report-parser.js";

const validReport = {
  site: [
    {
      alerts: [
        {
          pluginid: "10038",
          alert: "Content Security Policy Header Not Set",
          riskcode: "2",
          riskdesc: "Medium (High)",
          instances: [
            { uri: "http://localhost:3000" }
          ]
        }
      ]
    }
  ]
};

const emptyAllowlist = {
  acceptedFindings: []
};

describe("ZAP report parser", () => {
  it("fails when the report is missing its site array", () => {
    expect(() =>
      checkSecurityReport({}, emptyAllowlist)
    ).toThrow("missing or empty site array");
  });

  it("fails when a site is missing its alerts array", () => {
    const report = {
      site: [{}]
    };

    expect(() =>
      checkSecurityReport(report, emptyAllowlist)
    ).toThrow("must contain an alerts array");
  });

  it("passes a valid report with zero alerts", () => {
    const report = {
      site: [
        {
          alerts: []
        }
      ]
    };

    const result = checkSecurityReport(report, emptyAllowlist);

    expect(result.totalHighRisk).toBe(0);
    expect(result.passed).toBe(true);
  });

  it("ignores Medium findings even when confidence is High", () => {
    const result = checkSecurityReport(validReport, emptyAllowlist);

    expect(result.totalHighRisk).toBe(0);
    expect(result.passed).toBe(true);
  });

  it("fails when an unaccepted High-risk finding exists", () => {
    const report = {
      site: [
        {
          alerts: [
            {
              pluginid: "90001",
              alert: "Example High Risk Finding",
              riskcode: "3",
              riskdesc: "High (High)",
              instances: [
                { uri: "http://localhost:3000/example" }
              ]
            }
          ]
        }
      ]
    };

    const result = checkSecurityReport(report, emptyAllowlist);

    expect(result.totalHighRisk).toBe(1);
    expect(result.unacceptedCount).toBe(1);
    expect(result.passed).toBe(false);
  });

  it("passes when an exact High-risk finding is allowlisted", () => {
    const report = {
      site: [
        {
          alerts: [
            {
              pluginid: "90001",
              alert: "Example High Risk Finding",
              riskcode: "3",
              riskdesc: "High (High)",
              instances: [
                { uri: "http://localhost:3000/example" }
              ]
            }
          ]
        }
      ]
    };

    const allowlist = {
      acceptedFindings: [
        {
          pluginId: "90001",
          alert: "Example High Risk Finding",
          url: "http://localhost:3000/example",
          reason: "Accepted for this test environment."
        }
      ]
    };

    const result = checkSecurityReport(report, allowlist);

    expect(result.acceptedCount).toBe(1);
    expect(result.unacceptedCount).toBe(0);
    expect(result.passed).toBe(true);
  });

  it("fails when an allowlist entry has no reason", () => {
    const invalidAllowlist = {
      acceptedFindings: [
        {
          pluginId: "90001",
          alert: "Example",
          url: "http://localhost:3000",
          reason: "   "
        }
      ]
    };

    expect(() =>
      checkSecurityReport(validReport, invalidAllowlist)
    ).toThrow("Invalid allowlist entry");
  });
});