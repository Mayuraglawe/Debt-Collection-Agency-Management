import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="font-bold text-lg">Atlas</span>
            </div>
            <p className="text-sm opacity-75">
              Agentic AI ecosystem for FedEx debt collection
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Product</h3>
            <ul className="space-y-2 text-sm opacity-75">
              <li>
                <Link to="/dashboard" className="hover:opacity-100 transition-opacity">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/agents" className="hover:opacity-100 transition-opacity">
                  Agents
                </Link>
              </li>
              <li>
                <Link to="/analytics" className="hover:opacity-100 transition-opacity">
                  Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Resources</h3>
            <ul className="space-y-2 text-sm opacity-75">
              <li>
                <a href="#" className="hover:opacity-100 transition-opacity">
                  Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition-opacity">
                  API Reference
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition-opacity">
                  Support
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-sm mb-4">Legal</h3>
            <ul className="space-y-2 text-sm opacity-75">
              <li>
                <a href="#" className="hover:opacity-100 transition-opacity">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition-opacity">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="hover:opacity-100 transition-opacity">
                  Compliance
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-secondary-foreground/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs opacity-60">
            © {currentYear} Atlas. All rights reserved. FedEx AI Debt Collection Platform.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs opacity-60 hover:opacity-100 transition-opacity">
              Twitter
            </a>
            <a href="#" className="text-xs opacity-60 hover:opacity-100 transition-opacity">
              LinkedIn
            </a>
            <a href="#" className="text-xs opacity-60 hover:opacity-100 transition-opacity">
              GitHub
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
