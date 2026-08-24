import { NavLink } from "react-router-dom";

type Item = {
  name: string;
  path: string;
};

type Props = {
  title: string;
  icon: React.ReactNode;
  items: Item[];
};

export default function SidebarSection({ title, icon, items }: Props) {
  return (
    <div>
      {/* Titre de section — repère silencieux, non interactif */}
      <div className="flex items-center gap-3 px-3 mb-2 select-none">
        <span className="flex items-center justify-center w-4 h-4 text-text-h [&>svg]:w-full [&>svg]:h-full">
          {icon}
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
          {title}
        </span>
      </div>

      {/* Liens */}
      <div className="space-y-0.5">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center px-3 py-1.5 rounded-sm text-[13.5px] transition-colors duration-150 outline-none focus-visible:ring-2 focus-visible:ring-primary-border ${
                isActive
                  ? "bg-primary-bg text-primary font-medium"
                  : "text-text hover:bg-bg-subtle hover:text-text-h"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`absolute left-0 top-1/2 -translate-y-1/2 w-[3px] rounded-full bg-primary transition-all duration-150 ${
                    isActive ? "h-4 opacity-100" : "h-0 opacity-0"
                  }`}
                />
                <span
                  className={
                    isActive
                      ? "pl-2"
                      : "pl-0 group-hover:pl-0.5 transition-all duration-150"
                  }
                >
                  {item.name}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
