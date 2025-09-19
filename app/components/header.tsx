import { Link } from "react-router-dom";

export function Header() {
  return (
    <header className="bg-blue-600 text-white p-4">
      <nav className="container mx-auto flex gap-4">
        <Link to="/" className="hover:underline">
          Kezdőlap
        </Link>
        <Link to="/feedings/analytics" className="hover:underline">
          Etetések
        </Link>
        <Link to="/pumping-sessions/analytics" className="hover:underline">
          Fejések
        </Link>
        <Link to="/weights/analytics" className="hover:underline">
          Súlymérés
        </Link>
      </nav>
    </header>
  );
}
