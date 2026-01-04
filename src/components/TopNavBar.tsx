import { EllipsisVertical, LogOut, User } from "lucide-react";
import { routes } from "../routes";
import { UserContext } from "../auth/user-context";

interface Props {
  user?: UserContext;
}

export function TopNavBar(props: Props) {
  return (
    <div className="flex justify-end p-4 gap-2 items-center">
      <a href={routes.about.href()} className="text-xs text-gray-600 underline">
        About
      </a>

      {props.user && props.user.userId && (
        <details className="group relative">
          <summary className="list-none cursor-pointer flex items-center justify-center p-1 text-gray-600 rounded hover:bg-gray-100 transition-all [&::-webkit-details-marker]:hidden [&::marker]:hidden">
            <EllipsisVertical size={16} className="shrink-0" />
          </summary>
          {/* Dropdown Menu */}
          <div className="absolute top-full right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden py-1 z-50 min-w-[160px]">
            <div className="flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-indigo-600 w-full">
              <User size={16} />
              <a
                href={routes.users.settings.index.href({
                  id: props.user.userId,
                })}
              >
                User Settings
              </a>
            </div>
            <div>
              <form
                method={routes.auth.logout.method}
                action={routes.auth.logout.href()}
              >
                <button
                  type="submit"
                  className="flex items-center gap-3 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50 hover:text-red-600 transition-all w-full text-left"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </form>
            </div>
          </div>
        </details>
      )}
    </div>
  );
}
