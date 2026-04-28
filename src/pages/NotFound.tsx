import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
    <p className="text-6xl font-mono font-semibold text-foreground/10 mb-4">404</p>
    <p className="text-foreground mb-6">Page not found.</p>
    <Link to="/app" className="btn-primary text-sm">
      Go home
    </Link>
  </div>
);

export default NotFound;
