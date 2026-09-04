import { createBrowserRouter, Navigate } from "react-router-dom";

// Layouts
import AdminLayout from "./components/layouts/AdminLayout";
import AuthLayout from "./components/layouts/AuthLayout";

// Auth
import LoginPage from "./features/auth/pages/LoginPage";

// Dashboard
import DashboardPage from "./features/dashboard/pages/DashboardPage";

// Profile

// Users
import UsersPage from "./features/users/pages/PeoplePage";
import CreateUserPage from "./features/users/pages/CreateUserPage";
import EditUserPage from "./features/users/pages/EditUserPage";

// Payments
import ProfilePage from "./features/users/pages/ProfilePage";
import { OrganizationsPage } from "./features/organizations";
import OrganizationDetailsPage from "./features/organizations/pages/OrganizationDetailsPage";
import OrganizationEditPage from "./features/organizations/pages/OrganizationEditPage";
import SearchLeadsPage from "./features/search/SearchPage";
import MapPage from "./features/map/MapPage";
import LeadsPage from "./features/leads/LeadsPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <AuthLayout />,
    children: [
      {
        index: true,
        element: <LoginPage />,
      },
    ],
  },

  {
    path: "/",
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },

      {
        path: "search",
        element: <SearchLeadsPage />,
      },
      {
        path: "map",
        element: <MapPage />,
      },
      {
        path: "leads",
        element: <LeadsPage />,
      },
      {
        path: "profile",
        element: <ProfilePage />,
      },

      {
        path: "users",
        children: [
          {
            index: true,
            element: <UsersPage />,
          },
          {
            path: "create",
            element: <CreateUserPage />,
          },
          {
            path: ":id/edit",
            element: <EditUserPage />,
          },
        ],
      },

      {
        path: "organizations",
        children: [
          {
            index: true,
            element: <OrganizationsPage />,
          },
          {
            path: ":id",
            element: <OrganizationDetailsPage />,
          },
          {
            path: ":id/edit",
            element: <OrganizationEditPage />,
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
