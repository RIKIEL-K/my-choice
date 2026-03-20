import type { FC } from "react";
import { useAuth } from "@/features/hooks/context/useAuth";

export const AdminDashboardPage: FC = () => {
  const { role } = useAuth();
  
  const isSuperadmin = role === "superadmin";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
          Admin Dashboard
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome to the administration panel.
          {isSuperadmin ? " You have full superadmin access." : " You have standard admin access."}
        </p>
      </div>

      {/* Tabs navigation base structure */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <a
            href="#"
            className="border-teal-500 text-teal-600 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
            aria-current="page"
          >
            Overview
          </a>
          <a
            href="#"
            className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
          >
            Users
          </a>
          {isSuperadmin && (
            <a
              href="#"
              className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium"
            >
              System Settings
            </a>
          )}
        </nav>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* Sample generic admin card */}
        <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black/5">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-base font-semibold leading-6 text-gray-900">Manage Users</h3>
            <div className="mt-2 max-w-xl text-sm text-gray-500">
              <p>View, edit, or remove user accounts.</p>
            </div>
            <div className="mt-3 text-sm leading-6">
              <button className="font-semibold text-teal-600 hover:text-teal-500">Go to users →</button>
            </div>
          </div>
        </div>

        {/* Superadmin specific card */}
        {isSuperadmin && (
          <div className="overflow-hidden rounded-lg bg-white shadow ring-1 ring-black/5">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-base font-semibold leading-6 text-gray-900">System Logs</h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>View application inner logs and server metrics.</p>
              </div>
              <div className="mt-3 text-sm leading-6">
                <button className="font-semibold text-teal-600 hover:text-teal-500">View logs →</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
