import { useLoaderData, Link } from "react-router-dom";
import { prisma } from "~/db.server";
import { FoodType, FeedingSource, type Feeding, type Child } from "@prisma-app/client";

export async function loader() {
  const feedings = await prisma.feeding.findMany({
    orderBy: {
      startTime: "desc",
    },
  });
  const children = await prisma.child.findMany();
  const latestWeight = await prisma.weight.findFirst({
    orderBy: {
      date: "desc",
    },
  });

  const totalFeedings = feedings.length;
  const byFoodType = feedings.reduce(
    (acc: Record<FoodType, number>, f: Feeding) => {
      acc[f.foodType] = (acc[f.foodType] || 0) + 1;
      return acc;
    },
    {} as Record<FoodType, number>
  );

  const byFeedingSource = feedings.reduce(
    (acc: Record<FeedingSource, number>, f: Feeding) => {
      acc[f.source] = (acc[f.source] || 0) + 1;
      return acc;
    },
    {} as Record<FeedingSource, number>
  );

  const dailyTarget = latestWeight ? latestWeight.weight * 150 : null;

  return {
    feedings,
    children,
    stats: {
      totalFeedings,
      byFoodType,
      byFeedingSource,
      dailyTarget,
    },
  };
}

export default function FeedingAnalytics() {
  const {
    feedings,
    stats,
    children,
  } = useLoaderData<typeof loader>();

  if (feedings.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold">Nincsenek etetési adatok</h1>
        <p className="mt-4">Még nincsenek rögzített etetések.</p>
        {children.length > 0 ? (
          <Link
            to={`/children/${(children as Child[])[0].id}/feedings/new`}
            className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-white"
          >
            Első etetés rögzítése
          </Link>
        ) : (
          <Link
            to="/children/new"
            className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-white"
          >
            Gyermek hozzáadása
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Feeding Analytics</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Total Feedings</p>
          <p className="text-2xl font-bold">{stats.totalFeedings}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Napi cél</p>
          <p className="text-2xl font-bold">
            {stats.dailyTarget ? `${stats.dailyTarget} ml` : "N/A"}
          </p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">By Food Type</p>
          {Object.entries(stats.byFoodType).map(([type, count]) => (
            <p key={type}>
              {type}: {count}
            </p>
          ))}
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">By Feeding Source</p>
          {Object.entries(stats.byFeedingSource).map(([source, count]) => (
            <p key={source}>
              {source}: {count}
            </p>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold">All Feedings</h2>
        <ul className="mt-4 space-y-4">
          {feedings.map((feeding: Feeding) => (
            <li key={feeding.id} className="rounded-lg bg-white p-4 shadow">
              <p>
                <strong>Start:</strong>{" "}
                {new Date(feeding.startTime).toLocaleString()}
              </p>
              {feeding.endTime && (
                <p>
                  <strong>End:</strong>{" "}
                  {new Date(feeding.endTime).toLocaleString()}
                </p>
              )}
              <p>
                <strong>Food Type:</strong> {feeding.foodType}
              </p>
              <p>
                <strong>Source:</strong> {feeding.source}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
