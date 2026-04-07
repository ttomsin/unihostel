import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Building2, 
  ShieldCheck, 
  Users, 
  MessageSquare, 
  ArrowRight, 
  CheckCircle2,
  LayoutDashboard,
  Home,
  GraduationCap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const LandingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  // add

  const dashboardLink = user ? "/dashboard" : "/login";
  return (
    <div className="min-h-screen bg-background font-sans selection:bg-primary selection:text-primary-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <span>UniHostel</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#about" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">About</a>
              {user ? (
                <Link to="/dashboard">
                  <Button size="sm">Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">Log in</Button>
                  </Link>
                  <Link to="/login">
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center rounded-full px-3 py-1 text-sm font-medium bg-primary/10 text-primary mb-6">
                The Future of Campus Living
              </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-[1.1] font-heading">
                Manage Your University <br />
                <span className="text-primary">Hostel Experience</span> with Ease
              </h1>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
                A comprehensive, intuitive platform for students and administrators to manage room assignments, complaints, and campus life.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link to={dashboardLink}>
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full group">
                    {user ? "Go to Dashboard" : "Get Started Now"}
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to={dashboardLink}>
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full">
                    View Demo
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse delay-700" />
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 font-heading">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              UniHostel provides a complete suite of tools designed specifically for the unique needs of university housing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Smart Room Booking",
                description: "Students can browse available rooms and join their preferred accommodation with a single click.",
                icon: Home,
                color: "bg-blue-500/10 text-blue-500"
              },
              {
                title: "Complaint Management",
                description: "Real-time issue tracking system for maintenance requests and student concerns.",
                icon: MessageSquare,
                color: "bg-orange-500/10 text-orange-500"
              },
              {
                title: "Role-Based Access",
                description: "Tailored interfaces for Students, Admins, and Superadmins to ensure security and clarity.",
                icon: ShieldCheck,
                color: "bg-green-500/10 text-green-500"
              },
              {
                title: "Student Directory",
                description: "Comprehensive database for managing student records, faculties, and chapel assignments.",
                icon: Users,
                color: "bg-purple-500/10 text-purple-500"
              },
              {
                title: "Real-time Analytics",
                description: "Detailed dashboards for administrators to monitor occupancy rates and system health.",
                icon: LayoutDashboard,
                color: "bg-pink-500/10 text-pink-500"
              },
              {
                title: "Academic Integration",
                description: "Seamlessly connect student housing with their respective faculties and chapels.",
                icon: GraduationCap,
                color: "bg-amber-500/10 text-amber-500"
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -5 }}
                className="p-8 rounded-2xl bg-background border shadow-sm hover:shadow-md transition-all"
              >
                <div className={`h-12 w-12 rounded-xl ${feature.color} flex items-center justify-center mb-6`}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">5,000+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Students</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">12</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Hostels</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">98%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Satisfaction</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest font-semibold">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="p-12 md:p-20 rounded-[3rem] bg-primary text-primary-foreground">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 font-heading">Ready to Transform Your Campus?</h2>
            <p className="text-lg md:text-xl opacity-90 mb-10 max-w-2xl mx-auto">
              Join hundreds of universities worldwide using UniHostel to provide a better living experience for their students.
            </p>
            <Link to={dashboardLink}>
              <Button variant="secondary" size="lg" className="h-14 px-10 text-lg rounded-full">
                {user ? "Go to Dashboard" : "Get Started Today"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <span>UniHostel</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Contact Us</a>
            </div>
            <div className="text-sm text-muted-foreground">
              © 2026 UniHostel. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
