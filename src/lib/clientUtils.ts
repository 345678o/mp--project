export function formatProjectCode(projectCode: string): string {
  // Format: 202526001 -> 2025-2026 Project #001
  if (projectCode.length === 8) {
    const year = projectCode.slice(0, 4);
    const nextYear = (parseInt(year) + 1).toString();
    const projectNumber = projectCode.slice(-3);
    return `${year}-${nextYear} Project #${projectNumber}`;
  }
  return projectCode;
}

export function parseProjectCode(formattedCode: string): string {
  // Parse: "2025-2026 Project #001" -> "202526001"
  const match = formattedCode.match(/(\d{4})-(\d{4}) Project #(\d{3})/);
  if (match) {
    const [, year1, , projectNum] = match;
    const yearSuffix = year1.slice(-2);
    return `${yearSuffix}${projectNum}`;
  }
  return formattedCode;
} 