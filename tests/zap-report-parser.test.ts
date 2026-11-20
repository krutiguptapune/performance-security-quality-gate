import { describe, expect, it } from "vitest";
import { checkSecurityReport } from "../src/security/zap-report-parser.js";

describe("ZAP Security Report Parser", () => {

  it("should fail when an unaccepted High-risk finding exists", () => {

    const report = {
      site: [{
        alerts: [{
          pluginid: "10001",
          alert: "Test High Risk Issue",
          riskcode: "3",
          riskdesc: "High",
          instances: [{
            uri: "http://localhost:3000/test"
          }]
        }]
      }]
    };

    const allowlist = {
      acceptedFindings: []
    };

    const result = checkSecurityReport(
      report,
      allowlist
    );

    expect(result.passed).toBe(false);
    expect(result.unacceptedCount).toBe(1);
  });


  it("should pass when a High-risk finding is accepted", () => {

    const report = {
      site: [{
        alerts: [{
          pluginid: "10001",
          alert: "Test High Risk Issue",
          riskcode: "3",
          riskdesc: "High",
          instances: [{
            uri: "http://localhost:3000/test"
          }]
        }]
      }]
    };

    const allowlist = {
      acceptedFindings: [{
        pluginId: "10001",
        alert: "Test High Risk Issue",
        url: "http://localhost:3000/test",
        reason: "Accepted for this test scenario"
      }]
    };

    const result = checkSecurityReport(
      report,
      allowlist
    );

    expect(result.passed).toBe(true);
    expect(result.acceptedCount).toBe(1);
  });


  it("should ignore Medium-risk findings", () => {

    const report = {
      site: [{
        alerts: [{
          pluginid: "10002",
          alert: "Test Medium Risk Issue",
          riskcode: "2",
          riskdesc: "Medium",
          instances: [{
            uri: "http://localhost:3000/test"
          }]
        }]
      }]
    };

    const allowlist = {
      acceptedFindings: []
    };

    const result = checkSecurityReport(
      report,
      allowlist
    );

    expect(result.passed).toBe(true);
    expect(result.totalHighRisk).toBe(0);
  });

});