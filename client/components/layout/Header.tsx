import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 bg-background border-b border-border shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center transform group-hover:opacity-90 transition-opacity">
              <span className="text-white font-bold text-lg">A</span>
            </div>
            <span className="font-bold text-xl text-secondary hidden sm:inline">Atlas</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className="text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Home
            </Link>
            <Link
              to="/dashboard"
              className="text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Dashboard
            </Link>
            <Link
              to="/agents"
              className="text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Agents
            </Link>
            <Link
              to="/analytics"
              className="text-foreground hover:text-primary transition-colors text-sm font-medium"
            >
              Analytics
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <button className="px-4 py-2 text-primary font-medium text-sm hover:bg-primary/10 rounded-lg transition-colors">
              Sign In
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-lg hover:bg-primary/90 transition-colors">
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 hover:bg-secondary/10 rounded-lg transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-border animate-fade-in">
            <div className="flex flex-col gap-3">
              <Link
                to="/"
                className="px-4 py-2 text-foreground hover:text-primary hover:bg-secondary/5 rounded-lg transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/dashboard"
                className="px-4 py-2 text-foreground hover:text-primary hover:bg-secondary/5 rounded-lg transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Dashboard
              </Link>
              <Link
                to="/agents"
                className="px-4 py-2 text-foreground hover:text-primary hover:bg-secondary/5 rounded-lg transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Agents
              </Link>
              <Link
                to="/analytics"
                className="px-4 py-2 text-foreground hover:text-primary hover:bg-secondary/5 rounded-lg transition-colors text-sm font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Analytics
              </Link>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <button className="w-full px-4 py-2 text-primary font-medium text-sm hover:bg-primary/10 rounded-lg transition-colors">
                  Sign In
                </button>
                <button className="w-full px-4 py-2 bg-primary text-primary-foreground font-medium text-sm rounded-lg hover:bg-primary/90 transition-colors">
                  Get Started
                </button>
              </div>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
