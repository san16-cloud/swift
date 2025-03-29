// Dashboard data for the executive dashboard
// This will be replaced with actual API calls to the backend in the future

export const deploymentData = [
  { month: 'Jan', frequency: 4, incidents: 8, target: 12 },
  { month: 'Feb', frequency: 5, incidents: 7, target: 12 },
  { month: 'Mar', frequency: 6, incidents: 5, target: 12 },
  { month: 'Apr', frequency: 7, incidents: 6, target: 12 },
  { month: 'May', frequency: 8, incidents: 3, target: 12 },
  { month: 'Jun', frequency: 8, incidents: 4, target: 12 },
];

export const technicalDebtData = [
  { name: 'Auth Service', value: 65, effort: 'Medium', impact: 'High' },
  { name: 'Payment API', value: 45, effort: 'Low', impact: 'High' },
  { name: 'User Dashboard', value: 40, effort: 'Medium', impact: 'Medium' },
  { name: 'Admin Portal', value: 30, effort: 'High', impact: 'Medium' },
  { name: 'Notification System', value: 20, effort: 'Low', impact: 'Low' },
];

export const languageData = [
  { name: 'JavaScript', value: 45 },
  { name: 'TypeScript', value: 25 },
  { name: 'Python', value: 20 },
  { name: 'Java', value: 10 },
];

export const deploymentBottlenecks = [
  {
    id: 1,
    area: "Manual Testing",
    impact: "High",
    suggestion: "Implement automated regression tests for core flows",
    timeEstimate: "2-3 weeks"
  },
  {
    id: 2,
    area: "Database Migrations",
    impact: "Medium",
    suggestion: "Add migration verification steps to CI pipeline",
    timeEstimate: "1 week"
  },
  {
    id: 3,
    area: "Approval Workflows",
    impact: "Medium",
    suggestion: "Streamline approval process for non-critical changes",
    timeEstimate: "Immediate"
  }
];

export const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];