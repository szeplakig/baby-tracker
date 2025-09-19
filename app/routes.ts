import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("children/new", "routes/children.new.tsx"),
  route("children/:childId", "routes/children.$childId.tsx"),
  route(
    "children/:childId/feedings/new",
    "routes/children.$childId.feedings.new.tsx"
  ),
  route(
    "children/:childId/weights/new",
    "routes/children.$childId.weights.new.tsx"
  ),
  route("pumping-sessions/new", "routes/pumping-sessions.new.tsx"),
  route(
    "pumping-sessions/analytics",
    "routes/pumping-sessions.analytics.tsx"
  ),
  route("feedings/analytics", "routes/feedings.analytics.tsx"),
] satisfies RouteConfig;
