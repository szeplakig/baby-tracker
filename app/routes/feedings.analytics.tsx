import { useLoaderData, Link, Form } from "react-router-dom";
import { prisma } from "~/db.server";
import {
  FoodType,
  FeedingSource,
  type Feeding,
  type Child,
} from "@prisma-app/client";
import { formatDateTime, formatNumber } from "~/utils.ts";

const SOURCE_TO_HU: Record<FeedingSource, string> = {
  BOTTLE: "Cumisüveg",
  NIPPLE: "Szoptatás",
};

const FOOD_TYPE_TO_HU: Record<FoodType, string> = {
  BREAST_MILK: "Anyatej",
  FORMULA: "Tápszer",
};

export async function loader() {
  const feedings = await prisma.feeding.findMany({
    orderBy: {
      startTime: "desc",
    },
  });
  const children = await prisma.child.findMany();

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


  return {
    feedings,
    children,
    stats: {
      totalFeedings,
      byFoodType,
      byFeedingSource,
    },
  };
}

export default function FeedingAnalytics() {
  const { feedings, stats, children } = useLoaderData<typeof loader>();

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
      <h1 className="text-3xl font-bold">Etetési statisztikák</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Összes etetés</p>
          <p className="text-2xl font-bold">{formatNumber(stats.totalFeedings)}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Típus szerint</p>
          {Object.entries(stats.byFoodType).map(([type, count]) => (
            <p key={type}>
              {FOOD_TYPE_TO_HU[type as FoodType]}: {formatNumber(count as number)}
            </p>
          ))}
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Forrás szerint</p>
          {Object.entries(stats.byFeedingSource).map(([source, count]) => (
            <p key={source}>
              {SOURCE_TO_HU[source as FeedingSource]}:{" "}
              {formatNumber(count as number)}
            </p>
          ))}
        </div>
      </div>
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Legutóbbi etetések</h2>
        <ul className="mt-4 space-y-4">
          {(feedings as Feeding[]).map((feeding) => (
            <li key={feeding.id} className="rounded-lg bg-white p-4 shadow">
              <p>
                <strong>Időpont:</strong>{" "}
                {formatDateTime(new Date(feeding.startTime))}
              </p>
              {feeding.endTime && (
                <p>
                  <strong>Vége:</strong>{" "}
                  {formatDateTime(new Date(feeding.endTime))}
                </p>
              )}
              <p>
                <strong>Típus:</strong> {FOOD_TYPE_TO_HU[feeding.foodType]}
              </p>
              <p>
                <strong>Forrás:</strong> {SOURCE_TO_HU[feeding.source]}
              </p>
              {feeding.amount && (
                <p>
                  <strong>Mennyiség:</strong> {formatNumber(feeding.amount)} ml
                </p>
              )}
              <div className="mt-2 flex gap-x-2">
                <Link
                  to={`/children/${feeding.childId}/feedings/${feeding.id}/edit`}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Szerkesztés
                </Link>
                <Form method="post">
                  <input type="hidden" name="intent" value="deleteFeeding" />
                  <input type="hidden" name="feedingId" value={feeding.id} />
                  <button
                    type="submit"
                    className="text-sm text-red-500 hover:underline"
                  >
                    Törlés
                  </button>
                </Form>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
