import { Navigate } from "react-router-dom";
import { UseAuth } from "../../context/AuthContext";


export default function AuthGuard({ children }: { children: React.ReactNode }): React.JSX.Element {
  const { user, loading } = UseAuth();

  console.log(user)

  if (loading) {
    return <div>Loading...</div>;
  }

    if (!user) {
        return <Navigate to="/login" replace/>;
    }

    return <>{children}</>;
}