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
  const pumpingSessions: PumpingSession[] = await prisma.pumpingSession.findMany({
    orderBy: {
      startTime: "asc",
    },
  });

  const totalVolume = pumpingSessions.reduce(
    (sum, s) => sum + s.volumeMl,
    0
  );
  const totalSessions = pumpingSessions.length;
  const averageVolume = totalSessions > 0 ? totalVolume / totalSessions : 0;
  const totalDuration = pumpingSessions.reduce(
    (sum, s) => sum + s.duration,
    0
  );
  const averageDuration = totalSessions > 0 ? totalDuration / totalSessions : 0;

  const sessionChartData = pumpingSessions.map((session) => ({
    name: new Date(session.startTime).toLocaleString(),
    volume: session.volumeMl,
    duration: session.duration,
  }));

  const dailyData = pumpingSessions.reduce(
    (acc, session) => {
      const date = new Date(session.startTime).toLocaleDateString();
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
      { date: string; totalVolume: number; count: number; totalDuration: number }
    >
  );

  const dailyChartData = Object.values(dailyData).map((d) => ({
    date: d.date,
    "Total Volume": d.totalVolume,
    "Average Volume": d.totalVolume / d.count,
    "Total Duration": d.totalDuration,
    "Average Duration": d.totalDuration / d.count,
    "Sessions": d.count,
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
      <h1 className="text-3xl font-bold">Pumping Analytics</h1>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Total Volume</p>
          <p className="text-2xl font-bold">{stats.totalVolume} ml</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Total Sessions</p>
          <p className="text-2xl font-bold">{stats.totalSessions}</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Average Volume</p>
          <p className="text-2xl font-bold">{stats.averageVolume} ml</p>
        </div>
        <div className="rounded-lg bg-white p-4 shadow">
          <p className="text-sm font-medium text-gray-500">Average Duration</p>
          <p className="text-2xl font-bold">{stats.averageDuration} min</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Volume and Duration per Session</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={sessionChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" hide />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="volume"
              stroke="#8884d8"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="duration"
              stroke="#82ca9d"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">Daily Summary</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={dailyChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="Total Volume"
              stroke="#8884d8"
            />
            <Line
              type="monotone"
              dataKey="Average Volume"
              stroke="#82ca9d"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold">All Pumping Sessions</h2>
        <ul className="mt-4 space-y-4">
          {pumpingSessions.map((session: PumpingSession) => (
            <li key={session.id} className="rounded-lg bg-white p-4 shadow">
              <p>
                <strong>Start:</strong>{" "}
                {new Date(session.startTime).toLocaleString()}
              </p>
              <p>
                <strong>End:</strong>{" "}
                {new Date(session.endTime).toLocaleString()}
              </p>
              <p>
                <strong>Duration:</strong> {session.duration} minutes
              </p>
              <p>
                <strong>Volume:</strong> {session.volumeMl} ml
              </p>
              <div className="flex items-center gap-x-4">
                <Link
                  to={`/pumping-sessions/${session.id}/edit`}
                  className="text-blue-500 hover:underline"
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
                    className="text-red-500 hover:underline"
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
