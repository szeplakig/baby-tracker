import { useLoaderData, Form, Link } from "react-router-dom";
import { prisma } from "~/db.server";
import type { PumpingSession } from "@prisma-app/client";
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
import type { ActionFunctionArgs } from "react-router-dom";
import { redirect } from "react-router-dom";
import { formatDateTime } from "~/utils.ts";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "deletePumpingSession") {
    const sessionId = Number(formData.get("sessionId"));
    await prisma.pumpingSession.delete({ where: { id: sessionId } });
    return redirect(`/pumping-sessions/analytics`);
  }

  return null;
}

export async function loader() {
  const pumpingSessions: PumpingSession[] =
    await prisma.pumpingSession.findMany({
      orderBy: {
        startTime: "asc",
      },
    });

  const totalVolume = pumpingSessions.reduce((sum, s) => sum + s.volumeMl, 0);
  const totalSessions = pumpingSessions.length;
  const averageVolume = totalSessions > 0 ? totalVolume / totalSessions : 0;
  const totalDuration = pumpingSessions.reduce((sum, s) => sum + s.duration, 0);
  const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

  const sessionChartData = pumpingSessions.map((session) => ({
    name: formatDateTime(new Date(session.startTime)),
    volume: session.volumeMl,
    duration: session.duration,
  }));

  const dailyData = pumpingSessions.reduce(
    (acc, session) => {
      const date = formatDateTime(new Date(session.startTime));
      if (!acc[date]) {
        acc[date] = { date, totalVolume: 0, count: 0, totalDuration: 0 };
      }
      acc[date].totalVolume += session.volumeMl;
      acc[date].count++;
      acc[date].totalDuration += session.duration;
      return acc;
    },
    {} as Record<
      string,
      {
        date: string;
        totalVolume: number;
        count: number;
        totalDuration: number;
      }
    >
  );

  const dailyChartData = Object.values(dailyData).map((d) => ({
    date: d.date,
    "Total Volume": d.totalVolume,
    "Average Volume": d.totalVolume / d.count,
    "Total Duration": d.totalDuration,
    "Average Duration": d.totalDuration / d.count,
    Sessions: d.count,
  }));

  return {
    pumpingSessions: pumpingSessions.reverse(), // for the list view
    stats: {
      totalVolume,
      totalSessions,
      averageVolume: Math.round(averageVolume),
      averageDuration: Math.round(averageDuration),
    },
    sessionChartData,
    dailyChartData,
  };
}

export default function PumpingAnalytics() {
  const { pumpingSessions, stats, sessionChartData, dailyChartData } =
    useLoaderData<typeof loader>();

  return (
    <div className="p-4 sm:p-8">
      <h1 className="text-3xl font-bold">Fejési statisztikák</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Összes fejés</p>
          <p className="text-2xl font-bold">{stats.totalSessions}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">
            Összesen lefejt tej
          </p>
          <p className="text-2xl font-bold">{stats.totalVolume} ml</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Átlagos mennyiség</p>
          <p className="text-2xl font-bold">{stats.averageVolume} ml</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Átlagos időtartam</p>
          <p className="text-2xl font-bold">{stats.averageDuration} perc</p>
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
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Total Volume"
              stroke="#8884d8"
              name="Teljes mennyiség (ml)"
            />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="Average Volume"
              stroke="#82ca9d"
              name="Átlagos mennyiség (ml)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="Sessions"
              stroke="#ffc658"
              name="Fejések száma"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Fejések listája</h2>
        <ul className="mt-4 space-y-4">
          {pumpingSessions.map((session: PumpingSession) => (
            <li key={session.id} className="rounded-lg bg-white p-4 shadow">
              <p>
                <strong>Időpont:</strong>{" "}
                {formatDateTime(new Date(session.startTime))}
              </p>
              <p>
                <strong>Időtartam:</strong> {session.duration} perc
              </p>
              <p>
                <strong>Mennyiség:</strong> {session.volumeMl} ml
              </p>
              <div className="mt-2 flex gap-x-2">
                <Link
                  to={`/pumping-sessions/${session.id}/edit`}
                  className="text-sm text-blue-500 hover:underline"
                >
                  Szerkesztés
                </Link>
                <Form method="post">
                  <input
                    type="hidden"
                    name="intent"
                    value="deletePumpingSession"
                  />
                  <input type="hidden" name="sessionId" value={session.id} />
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
