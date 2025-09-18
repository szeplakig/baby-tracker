import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold">Baby Tracker</h1>
      <Link to="/children/new" className="text-blue-500 hover:underline">
        Add a new Child
      </Link>
      <br />
      <Link
        to="/pumping-sessions/new"
        className="text-blue-500 hover:underline"
      >
        Add a new Pumping Session
      </Link>
    </div>
  );
}
