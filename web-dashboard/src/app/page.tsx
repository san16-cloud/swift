'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero Section */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-6xl py-32 sm:py-48 lg:py-32">
          <div className="text-center">
            <div className="mb-8 flex justify-center">
              <Image
                src="/swiftlogo.png"
                alt="Swift Logo"
                width={120}
                height={120}
                className="rounded-lg"
              />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Swift Legacy Modernization
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 max-w-3xl mx-auto">
              Accelerate your journey from legacy systems to modern architectures. 
              Get real-time insights on deployment frequency, technical debt, 
              and modernization opportunities.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/dashboard"
                className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                View Executive Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="bg-gray-50 py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-blue-600">For CTOs and Tech Leaders</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Make modernization measurable
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Swift delivers data-driven insights to help you modernize legacy systems 
              without disrupting business continuity.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-5 w-5 flex-none rounded-full bg-blue-600" />
                  Deployment Velocity
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Increase deployment frequency from monthly to weekly, then to daily 
                    with data-backed modernization strategies.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-5 w-5 flex-none rounded-full bg-blue-600" />
                  Technical Debt Insights
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Identify and prioritize technical debt with impact analysis
                    that focuses your team on the highest ROI improvements.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <div className="h-5 w-5 flex-none rounded-full bg-blue-600" />
                  Executive Reporting
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">
                    Demonstrate modernization progress to stakeholders with
                    clear metrics and visualizations of your technical transformation.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-white py-16">
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="bg-blue-600 px-6 py-24 sm:px-12 sm:py-32 rounded-3xl">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to modernize with confidence?
              </h2>
              <p className="mt-6 text-lg leading-8 text-blue-100">
                Access your executive dashboard to see real-time insights on your 
                legacy system's performance and modernization opportunities.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/dashboard"
                  className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-blue-600 shadow-sm hover:bg-gray-100"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-center text-xs leading-5 text-gray-500">
              © 2025 Swift, Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}