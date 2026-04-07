import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap } from 'lucide-react';

const Faculties: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Faculties</h2>
        <p className="text-muted-foreground">
          Manage university faculties and their hostel assignments.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Faculty Management
          </CardTitle>
          <CardDescription>
            This feature is coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You will be able to add and manage faculties here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Faculties;
