import {
  type RouteConfig,
  index,
  layout,
  route,
} from "@react-router/dev/routes";

export default [
  index("routes/auth/login.tsx"),
  route("register", "routes/auth/register.tsx"),

  layout("routes/protected.tsx", [
    route("playground", "routes/user/petdashboard.tsx"),
    route("admin/dashboard", "routes/admin/adminDashboard.tsx"),
  ]),
] satisfies RouteConfig;
