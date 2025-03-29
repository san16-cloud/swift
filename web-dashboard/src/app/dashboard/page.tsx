'use client';

import React from 'react';
import Image from 'next/image';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { 
  deploymentData, 
  technicalDebtData, 
  languageData, 
  deploymentBottlenecks, 
  CHART_COLORS 
} from '../../data/dashboardData';

const ExecutiveDashboard = () => {
  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center">
          <div className="mr-4">
            <Image
              src="/swiftlogo.png"
              alt="Swift Logo"
              width={50}
              height={50}
              className="rounded-md"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Executive Dashboard</h1>
            <p className="text-gray-600">Legacy System Performance & Modernization Opportunities</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Deployment Metrics Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Deployment Frequency</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={deploymentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="frequency" stroke="#0088FE" name="Actual" />
                  <Line type="monotone" dataKey="target" stroke="#00C49F" strokeDasharray="5 5" name="Target" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-800">Key Insight</h3>
              <p className="text-blue-700 text-sm">Deployment frequency has improved 100% in 6 months, but is still 33% below industry benchmark.</p>
            </div>
          </div>

          {/* Incident Metrics Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Regression Incidents</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={deploymentData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="incidents" fill="#FF8042" name="Incidents" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <h3 className="font-medium text-green-800">Key Insight</h3>
              <p className="text-green-700 text-sm">Regression incidents reduced by 62% while deployment frequency increased.</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Technical Debt Card */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Technical Debt Hotspots</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={technicalDebtData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" name="Debt Score">
                    {technicalDebtData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-purple-50 rounded-lg">
              <h3 className="font-medium text-purple-800">Priority Recommendation</h3>
              <p className="text-purple-700 text-sm">Auth Service and Payment API represent highest ROI debt reduction opportunities with 20% of effort yielding 60% of impact.</p>
            </div>
          </div>

          {/* Codebase Composition Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">Codebase Composition</h2>
            <div className="h-72 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {languageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
              <h3 className="font-medium text-yellow-800">Modernization Path</h3>
              <p className="text-yellow-700 text-sm">Legacy JavaScript components are prime candidates for incremental TypeScript migration.</p>
            </div>
          </div>
        </div>

        {/* Deployment Bottlenecks Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Deployment Bottlenecks</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Area</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Suggestion</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Estimate</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deploymentBottlenecks.map((bottleneck) => (
                  <tr key={bottleneck.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bottleneck.area}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${bottleneck.impact === 'High' ? 'bg-red-100 text-red-800' : 
                          bottleneck.impact === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-green-100 text-green-800'}`}>
                        {bottleneck.impact}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{bottleneck.suggestion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bottleneck.timeEstimate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Items Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Recommended Action Items</h2>
          <div className="space-y-4">
            <div className="p-4 border-l-4 border-blue-500 bg-blue-50">
              <h3 className="font-medium">Immediate Win: Streamline Approval Process</h3>
              <p className="text-sm text-gray-600 mt-1">Eliminating redundant approvals for non-critical components could increase deployment frequency by 35%.</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Effort: Low
                </span>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Impact: High
                </span>
              </div>
            </div>

            <div className="p-4 border-l-4 border-purple-500 bg-purple-50">
              <h3 className="font-medium">Technical Debt: Auth Service Refactoring</h3>
              <p className="text-sm text-gray-600 mt-1">Modernizing the authentication flow could reduce incidents by 40% and improve developer velocity.</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Effort: Medium
                </span>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Impact: High
                </span>
              </div>
            </div>

            <div className="p-4 border-l-4 border-green-500 bg-green-50">
              <h3 className="font-medium">Strategic Investment: Automated Testing</h3>
              <p className="text-sm text-gray-600 mt-1">Implementing automated tests for core flows could reduce regression incidents by 60%.</p>
              <div className="mt-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Effort: Medium
                </span>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Impact: High
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExecutiveDashboard;