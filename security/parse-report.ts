import { readFile } from "node:fs/promises";
import path from "node:path";
import { checkSecurityReport } from "../src/security/zap-report-parser.js";

async function main() {

  const reportPath = path.resolve(
    "reports/zap-report.json"
  );

  const allowlistPath = path.resolve(
    "security/allowlist.json"
  );

  try {

    const reportText = await readFile(
      reportPath,
      "utf-8"
    );

    const allowlistText = await readFile(
      allowlistPath,
      "utf-8"
    );

    const report = JSON.parse(reportText);
    const allowlist = JSON.parse(allowlistText);

    const result = checkSecurityReport(
      report,
      allowlist
    );

    console.log("\n===== SECURITY QUALITY GATE =====");

    console.log(
      "Total High-risk findings:",
      result.totalHighRisk
    );

    console.log(
      "Accepted findings:",
      result.acceptedCount
    );

    console.log(
      "Unaccepted High-risk findings:",
      result.unacceptedCount
    );

    if (!result.passed) {

      console.error("\nSECURITY GATE FAILED!");

      console.error(
        result.unacceptedFindings
      );

      process.exitCode = 1;

    } else {

      console.log("\nSECURITY GATE PASSED!");
    }

  } catch (error) {

    console.error(
      "Security report could not be processed:",
      error
    );

    process.exitCode = 1;
  }
}

main();