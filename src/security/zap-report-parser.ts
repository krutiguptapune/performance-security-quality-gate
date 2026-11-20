export type SecurityFinding = {
  pluginId: string;
  alert: string;
  url: string;
  risk: string;
};

export type AcceptedFinding = {
  pluginId: string;
  alert: string;
  url: string;
  reason: string;
};

type Allowlist = {
  acceptedFindings: AcceptedFinding[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateReport(report: unknown): asserts report is {
  site: {
    alerts: {
      pluginid: string | number;
      alert: string;
      riskcode: string | number;
      riskdesc: string;
      instances: { uri: string }[];
    }[];
  }[];
} {
  if (!isRecord(report)) {
    throw new Error("Invalid ZAP report: expected a JSON object.");
  }

  if (!Array.isArray(report.site) || report.site.length === 0) {
    throw new Error("Invalid ZAP report: missing or empty site array.");
  }

  for (const [siteIndex, site] of report.site.entries()) {
    if (!isRecord(site) || !Array.isArray(site.alerts)) {
      throw new Error(
        `Invalid ZAP report: site ${siteIndex} must contain an alerts array.`
      );
    }

    for (const [alertIndex, alert] of site.alerts.entries()) {
      if (!isRecord(alert)) {
        throw new Error(
          `Invalid ZAP report: alert ${alertIndex} in site ${siteIndex} is invalid.`
        );
      }

      const validPluginId =
        (typeof alert.pluginid === "string" ||
          typeof alert.pluginid === "number") &&
        String(alert.pluginid).trim().length > 0;

      if (
        !validPluginId ||
        typeof alert.alert !== "string" ||
        alert.alert.trim().length === 0 ||
        !["0", "1", "2", "3"].includes(String(alert.riskcode)) ||
        typeof alert.riskdesc !== "string" ||
        !Array.isArray(alert.instances)
      ) {
        throw new Error(
          `Invalid ZAP report: alert ${alertIndex} in site ${siteIndex} has missing or invalid fields.`
        );
      }

      for (const [instanceIndex, instance] of alert.instances.entries()) {
        if (!isRecord(instance) || typeof instance.uri !== "string") {
          throw new Error(
            `Invalid ZAP report: instance ${instanceIndex} in alert ${alertIndex} has an invalid URI.`
          );
        }
      }
    }
  }
}

function validateAllowlist(allowlist: unknown): asserts allowlist is Allowlist {
  if (!isRecord(allowlist) || !Array.isArray(allowlist.acceptedFindings)) {
    throw new Error(
      "Invalid allowlist: acceptedFindings must be an array."
    );
  }

  for (const [index, finding] of allowlist.acceptedFindings.entries()) {
    if (
      !isRecord(finding) ||
      typeof finding.pluginId !== "string" ||
      typeof finding.alert !== "string" ||
      typeof finding.url !== "string" ||
      typeof finding.reason !== "string" ||
      finding.reason.trim().length === 0
    ) {
      throw new Error(`Invalid allowlist entry at index ${index}.`);
    }
  }
}

export function checkSecurityReport(
  report: unknown,
  allowlist: unknown
) {
  // Validate both inputs before checking security findings.
  validateReport(report);
  validateAllowlist(allowlist);

  const highRiskFindings: SecurityFinding[] = [];

  for (const site of report.site) {
    for (const alert of site.alerts) {
      // ZAP risk codes: 0 = Informational, 1 = Low,
      // 2 = Medium, 3 = High.
      // Use riskcode, not the confidence in riskdesc.
      if (String(alert.riskcode) !== "3") {
        continue;
      }

      for (const instance of alert.instances) {
        highRiskFindings.push({
          pluginId: String(alert.pluginid),
          alert: alert.alert,
          url: instance.uri,
          risk: alert.riskdesc
        });
      }
    }
  }

  const acceptedFindings = highRiskFindings.filter((finding) =>
    allowlist.acceptedFindings.some(
      (accepted) =>
        accepted.pluginId === finding.pluginId &&
        accepted.alert === finding.alert &&
        accepted.url === finding.url
    )
  );

  const unacceptedFindings = highRiskFindings.filter(
    (finding) =>
      !acceptedFindings.some(
        (accepted) =>
          accepted.pluginId === finding.pluginId &&
          accepted.alert === finding.alert &&
          accepted.url === finding.url
      )
  );

  return {
    totalHighRisk: highRiskFindings.length,
    acceptedCount: acceptedFindings.length,
    unacceptedCount: unacceptedFindings.length,
    acceptedFindings,
    unacceptedFindings,
    passed: unacceptedFindings.length === 0
  };
}