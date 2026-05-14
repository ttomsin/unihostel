import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import api from '@/lib/api';
import { 
  Database, 
  Users, 
  Building2, 
  Church, 
  GraduationCap, 
  ShieldAlert,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const TestingPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const seedData = {
    chapels: [
      { name: "Chapel of Grace" },
      { name: "St. Thomas Aquinas" },
      { name: "Hallelujah Chapel" },
      { name: "Victory Chapel" }
    ],
    faculties: [
      { name: "Computer Science" },
      { name: "Mechanical Engineering" },
      { name: "Law" },
      { name: "Architecture" },
      { name: "Biochemistry" }
    ],
    hostels: [
      { name: "Male Hostel A" },
      { name: "Male Hostel B" },
      { name: "Female Hostel A" },
      { name: "Female Hostel B" }
    ],
    admins: [
      { full_name: "Admin Thompson", password: "password123" },
      { full_name: "Admin Sarah", password: "password123" },
      { full_name: "Admin David", password: "password123" }
    ],
    students: [
      { full_name: "Alice Johnson", matric_number: "CSC/21/001", level: 100 },
      { full_name: "Bob Smith", matric_number: "MEE/21/042", level: 300 },
      { full_name: "Charlie Brown", matric_number: "LAW/20/015", level: 400 },
      { full_name: "Diana Prince", matric_number: "ARC/19/008", level: 500 },
      { full_name: "Edward Norton", matric_number: "BCH/22/033", level: 200 }
    ]
  };

  const runTest = async (type: string, endpoint: string, data: any) => {
    setIsLoading(type);
    const toastId = toast.loading(`Seeding ${type}...`);
    try {
      await api.post(endpoint, data);
      toast.success(`Successfully seeded ${type} data.`, { id: toastId });
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to seed ${type}.`, { id: toastId });
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tighter">System Testing & Seeding</h1>
          <p className="text-muted-foreground">Quickly populate the database with test data for demonstration.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Core Infrastructure */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Infrastructure
            </CardTitle>
            <CardDescription>Setup hostels, faculties, and chapels</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Church className="h-5 w-5 text-amber-500" />
                <span className="font-semibold">Chapels</span>
              </div>
              <Button 
                size="sm" 
                onClick={() => runTest('chapels', '/superadmin/testing/chapels', seedData.chapels)}
                disabled={isLoading !== null}
              >
                {isLoading === 'chapels' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Seed Chapels'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <GraduationCap className="h-5 w-5 text-purple-500" />
                <span className="font-semibold">Faculties</span>
              </div>
              <Button 
                size="sm" 
                onClick={() => runTest('faculties', '/superadmin/testing/faculties', seedData.faculties)}
                disabled={isLoading !== null}
              >
                {isLoading === 'faculties' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Seed Faculties'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-emerald-500" />
                <span className="font-semibold">Hostels</span>
              </div>
              <Button 
                size="sm" 
                onClick={() => runTest('hostels', '/superadmin/testing/hostels', seedData.hostels)}
                disabled={isLoading !== null}
              >
                {isLoading === 'hostels' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Seed Hostels'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Accounts */}
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-500" />
              User Accounts
            </CardTitle>
            <CardDescription>Generate admin and student test users</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-rose-500" />
                <span className="font-semibold">Hostel Admins</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('admins', '/superadmin/testing/admins', seedData.admins)}
                disabled={isLoading !== null}
              >
                {isLoading === 'admins' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Seed Admins'}
              </Button>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-blue-500" />
                <span className="font-semibold">Students</span>
              </div>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => runTest('students', '/superadmin/testing/students', seedData.students)}
                disabled={isLoading !== null}
              >
                {isLoading === 'students' ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Seed Students'}
              </Button>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-indigo-600 mt-0.5" />
                <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium leading-relaxed">
                  Tip: Seed infrastructure first (Chapels, Faculties, Hostels) before seeding Users to ensure all relationship constraints are met.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-none shadow-lg bg-slate-900 text-white overflow-hidden">
        <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-slate-800 rounded-2xl">
              <Database className="h-8 w-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Full System Reset</h3>
              <p className="text-slate-400 text-sm">Clear all existing data and re-initialize system (SuperAdmin only)</p>
            </div>
          </div>
          <Button variant="destructive" className="w-full md:w-auto font-bold uppercase tracking-widest px-8">
            Factory Reset
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TestingPage;
