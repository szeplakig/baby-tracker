import { useLoaderData, Link } from "react-router-dom";
import { prisma } from "~/db.server";
import { type Weight, type Child } from "@prisma-app/client";
import { formatDateTime, formatNumber } from "~/utils.ts";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export async function loader() {
  const weights = await prisma.weight.findMany({
    orderBy: {
      date: "asc",
    },
    include: {
      child: true,
    },
  });
  const children = await prisma.child.findMany();

  const totalWeights = weights.length;

  const chartData = weights.map((w: Weight & { child: Child }) => ({
    date: new Date(w.date).toLocaleDateString(),
    weight: w.weight,
    child: w.child.name,
  }));

  return {
    weights,
    children,
    stats: {
      totalWeights,
    },
    chartData,
  };
}

export default function WeightAnalytics() {
  const { weights, children, stats, chartData } =
    useLoaderData<typeof loader>();

  if (weights.length === 0) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-3xl font-bold">Nincsenek súlymérési adatok</h1>
        <p className="mt-4">Még nincsenek rögzített súlymérések.</p>
        {children.length > 0 ? (
          <Link
            to={`/children/${(children as Child[])[0].id}/weights/new`}
            className="mt-4 inline-block rounded bg-blue-500 px-4 py-2 text-white"
          >
            Első súlymérés rögzítése
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
      <h1 className="text-3xl font-bold">Súlymérési statisztikák</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Összes mérés</p>
          <p className="text-2xl font-bold">{formatNumber(stats.totalWeights)}</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Súlyfejlődés</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip formatter={(value: number) => formatNumber(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#8884d8"
              name="Súly (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Legutóbbi mérések</h2>
        <ul className="mt-4 space-y-4">
          {(weights as (Weight & { child: Child })[])
            .slice()
            .reverse()
            .map((weight) => (
              <li key={weight.id} className="rounded-lg bg-white p-4 shadow">
                <p>
                  <strong>Gyermek:</strong> {weight.child.name}
                </p>
                <p>
                  <strong>Időpont:</strong>{" "}
                  {formatDateTime(new Date(weight.date))}
                </p>
                <p>
                  <strong>Súly:</strong> {formatNumber(weight.weight)} kg
                </p>
                <div className="mt-2 flex gap-x-2">
                  <Link
                    to={`/weights/${weight.id}/edit`}
                    className="text-sm text-blue-500 hover:underline"
                  >
                    Szerkesztés
                  </Link>
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
