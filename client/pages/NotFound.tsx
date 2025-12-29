import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-blue-50/30 to-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-destructive/10 mb-6">
            <AlertCircle size={32} className="text-destructive" />
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-secondary mb-2">404</h1>
          <p className="text-xl sm:text-2xl text-foreground/70 mb-6">Page not found</p>
          <p className="text-foreground/60 mb-8 max-w-md">
            The page at <span className="font-mono text-sm bg-muted px-2 py-1 rounded">{location.pathname}</span> doesn't exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/90 transition-colors"
            >
              Return to Home
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center px-6 py-3 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-primary/5 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default NotFound;
