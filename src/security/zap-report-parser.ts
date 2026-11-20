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

type ZapInstance = {
  uri?: string;
};

type ZapAlert = {
  pluginid?: string | number;
  alert?: string;
  riskcode?: string | number;
  riskdesc?: string;
  instances?: ZapInstance[];
};

type ZapReport = {
  site?: {
    alerts?: ZapAlert[];
  }[];
};

type Allowlist = {
  acceptedFindings: AcceptedFinding[];
};

export function checkSecurityReport(
  report: ZapReport,
  allowlist: Allowlist
) {
  const highRiskFindings: SecurityFinding[] = [];

  for (const site of report.site ?? []) {
    for (const alert of site.alerts ?? []) {

      const isHighRisk =
        String(alert.riskcode) === "3" ||
        alert.riskdesc?.toLowerCase().startsWith("high");

      if (!isHighRisk) {
        continue;
      }

      const instances = alert.instances?.length
        ? alert.instances
        : [{}];

      for (const instance of instances) {
        highRiskFindings.push({
          pluginId: String(alert.pluginid ?? ""),
          alert: alert.alert ?? "Unknown alert",
          url: instance.uri ?? "",
          risk: alert.riskdesc ?? "High"
        });
      }
    }
  }

  const acceptedFindings = highRiskFindings.filter(finding =>
    allowlist.acceptedFindings.some(accepted =>
      accepted.pluginId === finding.pluginId &&
      accepted.alert === finding.alert &&
      accepted.url === finding.url &&
      accepted.reason.trim().length > 0
    )
  );

  const unacceptedFindings = highRiskFindings.filter(finding =>
    !acceptedFindings.includes(finding)
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