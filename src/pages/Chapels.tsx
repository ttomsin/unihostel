import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Church } from 'lucide-react';

const Chapels: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Chapels</h2>
        <p className="text-muted-foreground">
          Manage university chapels and student attendance.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Church className="h-5 w-5 text-primary" />
            Chapel Management
          </CardTitle>
          <CardDescription>
            This feature is coming soon.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            You will be able to add and manage chapels here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Chapels;
