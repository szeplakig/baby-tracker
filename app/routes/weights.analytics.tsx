import { useLoaderData } from "react-router-dom";
import { prisma } from "~/db.server";
import type { Weight } from "@prisma-app/client";

export async function loader() {
  const weights = await prisma.weight.findMany({
    orderBy: {
      date: "desc",
    },
  });

  return { weights };
}

export default function WeightAnalytics() {
  const { weights } = useLoaderData<typeof loader>();

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Súlymérési adatok</h1>
      {weights.length === 0 ? (
        <p className="mt-4">Nincsenek rögzített súlymérési adatok.</p>
      ) : (
        <div className="mt-8">
          <ul className="mt-4 space-y-4">
            {(weights as Weight[]).map((weight) => (
              <li key={weight.id} className="rounded-lg bg-white p-4 shadow">
                <p>
                  <strong>Dátum:</strong>{" "}
                  {new Date(weight.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Súly:</strong> {weight.weight} kg
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
