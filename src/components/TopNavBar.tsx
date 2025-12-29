import { routes } from "../routes";

export function TopNavBar() {
  return (
    <div className="flex justify-end p-4">
      <a href={routes.about.href()} className="text-xs text-gray-600 underline">
        About
      </a>
    </div>
  );
}
