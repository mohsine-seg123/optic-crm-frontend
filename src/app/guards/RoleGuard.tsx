import { Navigate } from "react-router-dom";
import { UseAuth } from "../../context/AuthContext";

export default function RoleGuard({ children, role }: { children: React.ReactNode, role: "admin" | "user" }): React.JSX.Element {
  const { user} = UseAuth();

  if (!user) {
    return <Navigate to="/login" replace/>;
  }

  if (user.role !== role) {
    return <Navigate to="/unauthorized" replace/>;
  }

  return <>{children}</>;

}