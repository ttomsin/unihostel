import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { FacultyResponse, Hostel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Plus, GraduationCap, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const Faculties: React.FC = () => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState<FacultyResponse[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newFaculty, setNewFaculty] = useState({
    name: '',
    hostel_id: ''
  });

  const fetchFaculties = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/superadmin/faculties');
      setFaculties(response.data);
    } catch (error) {
      console.error('Failed to fetch faculties', error);
      toast.error('Failed to load faculties');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchHostels = async () => {
    try {
      const response = await api.get('/superadmin/hostels');
      setHostels(response.data);
    } catch (error) {
      console.error('Failed to fetch hostels', error);
    }
  };

  useEffect(() => {
    fetchFaculties();
    fetchHostels();
  }, []);

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/superadmin/faculties', newFaculty);
      toast.success('Faculty created successfully');
      setNewFaculty({ name: '', hostel_id: '' });
      setIsAddDialogOpen(false);
      fetchFaculties();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create faculty');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Faculties</h2>
          <p className="text-muted-foreground">
            Manage university faculties and their hostel assignments.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Faculty
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Faculty</DialogTitle>
              <DialogDescription>
                Add a new faculty and assign it to a default hostel.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateFaculty} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Faculty Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Faculty of Science" 
                  value={newFaculty.name}
                  onChange={(e) => setNewFaculty(prev => ({ ...prev, name: e.target.value }))}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hostel">Assign Hostel</Label>
                <Select 
                  value={newFaculty.hostel_id} 
                  onValueChange={(val) => setNewFaculty(prev => ({ ...prev, hostel_id: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a hostel" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostels.map(hostel => (
                      <SelectItem key={hostel.id} value={hostel.id}>{hostel.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Faculty
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Faculty Directory</CardTitle>
          <CardDescription>
            List of all faculties and their designated hostels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : faculties.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <GraduationCap className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No faculties found.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Faculty Name</TableHead>
                    <TableHead>Assigned Hostel</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faculties.map((faculty) => (
                    <TableRow key={faculty.id}>
                      <TableCell className="font-medium">{faculty.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-3 w-3 text-muted-foreground" />
                          <span>{faculty.hostel_name || 'Not assigned'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">Edit</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Faculties;
