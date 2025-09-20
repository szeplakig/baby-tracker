import { useLoaderData, Link, Form } from "react-router-dom";
import { prisma } from "~/db.server";
import {
  FoodType,
  FeedingSource,
  type Feeding,
  type Child,
} from "@prisma-app/client";
import { formatDateTime, formatNumber, formatDate } from "~/utils.ts";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import type { ActionFunctionArgs } from "react-router-dom";
import { redirect } from "react-router-dom";

const SOURCE_TO_HU: Record<FeedingSource, string> = {
  BOTTLE: "Cumisüveg",
  NIPPLE: "Szoptatás",
};

const FOOD_TYPE_TO_HU: Record<FoodType, string> = {
  BREAST_MILK: "Anyatej",
  FORMULA: "Tápszer",
};

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "deleteFeeding") {
    const feedingId = Number(formData.get("feedingId"));
    await prisma.feeding.delete({ where: { id: feedingId } });
    return redirect(`/feedings/analytics`);
  }

  return null;
}

export async function loader() {
  const feedings = await prisma.feeding.findMany({
    orderBy: {
      startTime: "asc",
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

  // Calculate average amount per feeding type
  const totalAmount = feedings.reduce((sum: number, f: Feeding) => sum + (f.amount || 0), 0);
  const feedingsWithAmount = feedings.filter((f: Feeding) => f.amount !== null);
  const averageAmount = feedingsWithAmount.length > 0 ? totalAmount / feedingsWithAmount.length : 0;

  // Session-based chart data
  const sessionChartData = feedings.map((feeding: Feeding) => {
    const duration = feeding.endTime 
      ? (new Date(feeding.endTime).getTime() - new Date(feeding.startTime).getTime()) / (1000 * 60)
      : 0;
    
    return {
      name: formatDateTime(new Date(feeding.startTime)),
      amount: feeding.amount || 0,
      duration: Math.round(duration),
      foodType: FOOD_TYPE_TO_HU[feeding.foodType],
      source: SOURCE_TO_HU[feeding.source],
    };
  });

  // Daily aggregated data
  type DailyDataType = {
    date: string;
    totalAmount: number;
    count: number;
    totalDuration: number;
    breastMilkCount: number;
    formulaCount: number;
    bottleCount: number;
    nippleCount: number;
  };

  const dailyData = feedings.reduce(
    (acc: Record<string, DailyDataType>, feeding: Feeding) => {
      const date = formatDate(new Date(feeding.startTime));
      if (!acc[date]) {
        acc[date] = { 
          date, 
          totalAmount: 0, 
          count: 0, 
          totalDuration: 0,
          breastMilkCount: 0,
          formulaCount: 0,
          bottleCount: 0,
          nippleCount: 0
        };
      }
      acc[date].totalAmount += feeding.amount || 0;
      acc[date].count++;
      
      if (feeding.endTime) {
        const duration = (new Date(feeding.endTime).getTime() - new Date(feeding.startTime).getTime()) / (1000 * 60);
        acc[date].totalDuration += duration;
      }

      // Count by food type
      if (feeding.foodType === FoodType.BREAST_MILK) {
        acc[date].breastMilkCount++;
      } else if (feeding.foodType === FoodType.FORMULA) {
        acc[date].formulaCount++;
      }

      // Count by source
      if (feeding.source === FeedingSource.BOTTLE) {
        acc[date].bottleCount++;
      } else if (feeding.source === FeedingSource.NIPPLE) {
        acc[date].nippleCount++;
      }

      return acc;
    },
    {}
  );

  const dailyChartData = Object.values(dailyData).map((d: DailyDataType) => ({
    date: d.date,
    "Összes mennyiség": d.totalAmount,
    "Átlagos mennyiség": d.count > 0 ? Math.round(d.totalAmount / d.count) : 0,
    "Összes időtartam": Math.round(d.totalDuration),
    "Átlagos időtartam": d.count > 0 ? Math.round(d.totalDuration / d.count) : 0,
    "Etetések száma": d.count,
    "Anyatej": d.breastMilkCount,
    "Tápszer": d.formulaCount,
    "Cumisüveg": d.bottleCount,
    "Szoptatás": d.nippleCount,
  }));

  return {
    feedings: feedings.reverse(), // for the list view
    children,
    stats: {
      totalFeedings,
      byFoodType,
      byFeedingSource,
      totalAmount: Math.round(totalAmount),
      averageAmount: Math.round(averageAmount),
    },
    sessionChartData,
    dailyChartData,
  };
}

export default function FeedingAnalytics() {
  const { feedings, stats, children, sessionChartData, dailyChartData } = useLoaderData<typeof loader>();

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
    <div className="p-4 sm:p-8">
      <h1 className="text-3xl font-bold">Etetési statisztikák</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Összes etetés</p>
          <p className="text-2xl font-bold">{formatNumber(stats.totalFeedings)}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Összes mennyiség</p>
          <p className="text-2xl font-bold">{formatNumber(stats.totalAmount)} ml</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Átlagos mennyiség</p>
          <p className="text-2xl font-bold">{formatNumber(stats.averageAmount)} ml</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Típus szerint</p>
          {Object.entries(stats.byFoodType).map(([type, count]) => (
            <p key={type} className="text-sm">
              {FOOD_TYPE_TO_HU[type as FoodType]}: {formatNumber(count as number)}
            </p>
          ))}
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Forrás szerint</p>
          {Object.entries(stats.byFeedingSource).map(([source, count]) => (
            <p key={source} className="text-sm">
              {SOURCE_TO_HU[source as FeedingSource]}:{" "}
              {formatNumber(count as number)}
            </p>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Napi statisztikák</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip formatter={(value: number) => formatNumber(value)} />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Összes mennyiség"
              stroke="#8884d8"
              name="Összes mennyiség (ml)"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Átlagos mennyiség"
              stroke="#82ca9d"
              name="Átlagos mennyiség (ml)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Etetések száma"
              stroke="#ffc658"
              name="Etetések száma"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Átlagos időtartam"
              stroke="#ff7300"
              name="Átlagos időtartam (perc)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Napi etetési típusok</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatNumber(value)} />
            <Legend />
            <Bar dataKey="Anyatej" stackId="a" fill="#8884d8" name="Anyatej" />
            <Bar dataKey="Tápszer" stackId="a" fill="#82ca9d" name="Tápszer" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Napi etetési források</h2>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatNumber(value)} />
            <Legend />
            <Bar dataKey="Szoptatás" stackId="b" fill="#ff7300" name="Szoptatás" />
            <Bar dataKey="Cumisüveg" stackId="b" fill="#ffc658" name="Cumisüveg" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Etetések részletei</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={sessionChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip 
              formatter={(value: number, name: string) => [formatNumber(value), name]}
              labelFormatter={(label) => `Időpont: ${label}`}
            />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="amount"
              stroke="#8884d8"
              name="Mennyiség (ml)"
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="duration"
              stroke="#82ca9d"
              name="Időtartam (perc)"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
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
