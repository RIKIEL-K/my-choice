import React from "react";
import { NavLink, Link, useParams, useSearchParams } from "react-router-dom";
import { Landmark, Users, BarChart3, Vote as VoteIcon, UserCircle, LogOut } from "lucide-react";

export type HeaderProps = {
  title?: string;
  onEditProfile?: () => void;
  onLogout?: () => void;
};

export const Header: React.FC<HeaderProps> = ({
  onEditProfile,
  onLogout,
}) => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const electionId = searchParams.get("election") || id;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-teal-600 text-white p-1.5 rounded-lg">
                <VoteIcon className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black text-gray-900 tracking-tight lowercase">
                vote
              </span>
            </Link>
          </div>

          {/* Bureau Navigation - Aucune utilisation de tableau (map) ici, tel que demandé */}
          <nav className="hidden md:flex space-x-8 h-full">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`
              }
            >
              <Landmark className="w-4 h-4 mr-2 shrink-0" />
              Élections
            </NavLink>

            <NavLink
              to={electionId ? `/elections/candidates?election=${electionId}` : "/elections/candidates"}
              className={({ isActive }) =>
                `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`
              }
            >
              <Users className="w-4 h-4 mr-2 shrink-0" />
              Candidats
            </NavLink>

            <NavLink
              to={electionId ? `/elections/${electionId}/results` : "/results"}
              className={({ isActive }) =>
                `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`
              }
            >
              <BarChart3 className="w-4 h-4 mr-2 shrink-0" />
              Résultats
            </NavLink>

            <NavLink
              to={electionId ? `/elections/${electionId}/vote` : "/vote"}
              className={({ isActive }) =>
                `inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "border-teal-600 text-teal-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`
              }
            >
              <VoteIcon className="w-4 h-4 mr-2 shrink-0" />
              Votes
            </NavLink>
          </nav>

          {/* Right actions */}
          <div className="flex items-center md:ml-4 gap-3">
            {onEditProfile && (
              <button
                type="button"
                className="hidden sm:inline-flex items-center justify-center rounded-full bg-white p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                onClick={onEditProfile}
                title="Profil"
              >
                <UserCircle className="w-6 h-6" />
                <span className="sr-only">Profil</span>
              </button>
            )}
            
            {onLogout && (
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-teal-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600"
                onClick={onLogout}
              >
                <LogOut className="w-4 h-4 mr-2 hidden sm:block" />
                Déconnexion
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile navigation - Pareil, composant en dur */}
      <div className="md:hidden border-t border-gray-200 bg-gray-50 flex overflow-x-auto">
        <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `flex flex-col items-center flex-1 py-3 text-xs font-medium ${
                isActive
                  ? "text-teal-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`
            }
          >
            <Landmark className="w-5 h-5 mb-1" />
            Élections
        </NavLink>
        <NavLink
            to={electionId ? `/elections/candidates?election=${electionId}` : "/elections/candidates"}
            className={({ isActive }) =>
              `flex flex-col items-center flex-1 py-3 text-xs font-medium ${
                isActive
                  ? "text-teal-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`
            }
          >
            <Users className="w-5 h-5 mb-1" />
            Candidats
        </NavLink>
        <NavLink
            to={electionId ? `/elections/${electionId}/results` : "/results"}
            className={({ isActive }) =>
              `flex flex-col items-center flex-1 py-3 text-xs font-medium ${
                isActive
                  ? "text-teal-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`
            }
          >
            <BarChart3 className="w-5 h-5 mb-1" />
            Résultats
        </NavLink>
        <NavLink
            to={electionId ? `/elections/${electionId}/vote` : "/vote"}
            className={({ isActive }) =>
              `flex flex-col items-center flex-1 py-3 text-xs font-medium ${
                isActive
                  ? "text-teal-600"
                  : "text-gray-500 hover:bg-gray-100"
              }`
            }
          >
            <VoteIcon className="w-5 h-5 mb-1" />
            Votes
        </NavLink>
      </div>
    </header>
  );
};
