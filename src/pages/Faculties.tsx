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
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, GraduationCap, Building2 } from 'lucide-react';
import { toast } from 'sonner';

const Faculties: React.FC = () => {
  const { user } = useAuth();
  const [faculties, setFaculties] = useState<FacultyResponse[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newFaculty, setNewFaculty] = useState<{name: string, hostel_ids: string[]}>({
    name: '',
    hostel_ids: []
  });

  const fetchFaculties = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/common/faculties');
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
      const response = await api.get('/common/hostels');
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
      const res = await api.post('/superadmin/faculties', { name: newFaculty.name });
      const createdFaculty = res.data;
      
      for (const hostelId of newFaculty.hostel_ids) {
        await api.post('/superadmin/faculties/assign', {
          faculty_id: createdFaculty.id,
          hostel_id: hostelId
        });
      }

      toast.success('Faculty created successfully');
      setNewFaculty({ name: '', hostel_ids: [] });
      setIsAddDialogOpen(false);
      fetchFaculties();
      fetchHostels();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create faculty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState<FacultyResponse | null>(null);
  const [editFacultyName, setEditFacultyName] = useState('');
  const [editHostelIds, setEditHostelIds] = useState<string[]>([]);

  const handleUpdateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFaculty) return;
    setIsSubmitting(true);
    try {
      if (editFacultyName !== editingFaculty.name) {
        await api.patch(`/superadmin/faculties/${editingFaculty.id}`, { 
          name: editFacultyName
        });
      }

      const currentHostelIds = getAssignedHostelIds(editingFaculty.id);
      const toAssign = editHostelIds.filter(id => !currentHostelIds.includes(id));
      const toUnassign = currentHostelIds.filter(id => !editHostelIds.includes(id));

      for (const hostelId of toAssign) {
        await api.post('/superadmin/faculties/assign', {
          faculty_id: editingFaculty.id,
          hostel_id: hostelId
        });
      }

      for (const hostelId of toUnassign) {
        await api.post('/superadmin/faculties/unassign', {
          faculty_id: editingFaculty.id,
          hostel_id: hostelId
        });
      }

      toast.success('Faculty updated successfully');
      setIsEditDialogOpen(false);
      fetchFaculties();
      fetchHostels();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update faculty');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAssignedHostels = (facultyId: string) => {
    return hostels.filter(h => h.faculties?.some(f => f.id === facultyId));
  };

  const getAssignedHostelIds = (facultyId: string) => {
    return getAssignedHostels(facultyId).map(h => h.id);
  };

  // Deduplicate faculties in case the API returns duplicates per hostel
  const uniqueFaculties = faculties.filter((faculty, index, self) => 
    index === self.findIndex((f) => f.id === faculty.id)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Faculties</h2>
          <p className="text-muted-foreground">
            Manage university faculties and their hostel assignments.
          </p>
        </div>
        {user?.role === 'superadmin' && (
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
                  Add a new faculty and assign it to hostels.
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
                <div className="space-y-3">
                  <Label>Assign Hostels</Label>
                  <div className="grid gap-2 border rounded-md p-4 max-h-48 overflow-y-auto">
                    {hostels.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No hostels available.</p>
                    ) : (
                      hostels.map(hostel => (
                        <div key={hostel.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`hostel-${hostel.id}`}
                            checked={newFaculty.hostel_ids.includes(hostel.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewFaculty(prev => ({ ...prev, hostel_ids: [...prev.hostel_ids, hostel.id] }));
                              } else {
                                setNewFaculty(prev => ({ ...prev, hostel_ids: prev.hostel_ids.filter(id => id !== hostel.id) }));
                              }
                            }}
                          />
                          <Label htmlFor={`hostel-${hostel.id}`} className="font-normal cursor-pointer leading-none">
                            {hostel.name}
                          </Label>
                        </div>
                      ))
                    )}
                  </div>
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
        )}
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Faculty</DialogTitle>
            <DialogDescription>
              Update faculty name and hostel assignments.
            </DialogDescription>
          </DialogHeader>
          {editingFaculty && (
            <form onSubmit={handleUpdateFaculty} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Faculty Name</Label>
                <Input 
                  id="edit_name" 
                  value={editFacultyName}
                  onChange={(e) => setEditFacultyName(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-3">
                <Label>Assign Hostels</Label>
                <div className="grid gap-2 border rounded-md p-4 max-h-48 overflow-y-auto">
                  {hostels.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No hostels available.</p>
                  ) : (
                    hostels.map(hostel => (
                      <div key={hostel.id} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`edit-hostel-${hostel.id}`}
                          checked={editHostelIds.includes(hostel.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setEditHostelIds(prev => [...prev, hostel.id]);
                            } else {
                              setEditHostelIds(prev => prev.filter(id => id !== hostel.id));
                            }
                          }}
                        />
                        <Label htmlFor={`edit-hostel-${hostel.id}`} className="font-normal cursor-pointer leading-none">
                          {hostel.name}
                        </Label>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Faculty
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

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
          ) : uniqueFaculties.length === 0 ? (
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
                    <TableHead>Assigned Hostels</TableHead>
                    {user?.role === 'superadmin' && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {uniqueFaculties.map((faculty) => {
                    const assignedHostels = getAssignedHostels(faculty.id);
                    return (
                      <TableRow key={faculty.id}>
                        <TableCell className="font-medium">{faculty.name}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap items-center gap-1">
                            {assignedHostels.length > 0 ? (
                              assignedHostels.map(h => (
                                <Badge key={h.id} variant="secondary" className="flex items-center gap-1 font-normal">
                                  <Building2 className="h-3 w-3" />
                                  {h.name}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-muted-foreground text-sm">Not assigned</span>
                            )}
                          </div>
                        </TableCell>
                        {user?.role === 'superadmin' && (
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                setEditingFaculty(faculty);
                                setEditFacultyName(faculty.name);
                                setEditHostelIds(assignedHostels.map(h => h.id));
                                setIsEditDialogOpen(true);
                              }}
                            >
                              Edit
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
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
