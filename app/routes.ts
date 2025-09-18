import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("children/new", "routes/children.new.tsx"),
  route("children/:childId", "routes/children.$childId.tsx"),
  route(
    "children/:childId/feedings/new",
    "routes/children.$childId.feedings.new.tsx"
  ),
] satisfies RouteConfig;
