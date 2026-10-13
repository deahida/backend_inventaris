import { Outlet } from 'react-router';

export default function AuthLayout() {
  // Login and auth pages handle their own full-screen layout
  return <Outlet />;
}
