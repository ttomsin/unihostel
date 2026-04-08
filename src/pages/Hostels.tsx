import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Hostel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Building2, GraduationCap, Calendar, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Hostels: React.FC = () => {
  const { user } = useAuth();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newHostel, setNewHostel] = useState({ name: '' });

  const fetchHostels = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/superadmin/hostels');
      setHostels(response.data);
    } catch (error) {
      console.error('Failed to fetch hostels', error);
      toast.error('Failed to load hostels');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHostels();
  }, []);

  const handleCreateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/superadmin/hostels', newHostel);
      toast.success('Hostel created successfully');
      setNewHostel({ name: '' });
      setIsAddDialogOpen(false);
      fetchHostels();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create hostel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState<Hostel | null>(null);

  const handleUpdateHostel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHostel) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/superadmin/hostels/${editingHostel.id}`, { name: editingHostel.name });
      toast.success('Hostel updated successfully');
      setIsEditDialogOpen(false);
      fetchHostels();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update hostel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Hostels</h2>
          <p className="text-muted-foreground">
            Manage university hostels and their associated faculties.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Hostel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Hostel</DialogTitle>
              <DialogDescription>
                Add a new hostel building to the university system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateHostel} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Hostel Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., Hall of Residence A" 
                  value={newHostel.name}
                  onChange={(e) => setNewHostel({ name: e.target.value })}
                  required 
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Hostel
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Hostel</DialogTitle>
            <DialogDescription>
              Update the name of the hostel building.
            </DialogDescription>
          </DialogHeader>
          {editingHostel && (
            <form onSubmit={handleUpdateHostel} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Hostel Name</Label>
                <Input 
                  id="edit_name" 
                  value={editingHostel.name}
                  onChange={(e) => setEditingHostel({ ...editingHostel, name: e.target.value })}
                  required 
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Hostel
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : hostels.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No hostels found. Create one to get started.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {hostels.map((hostel) => (
            <Card key={hostel.id}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-primary" />
                      {hostel.name}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      ID: {hostel.id.substring(0, 8)}...
                    </CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setEditingHostel(hostel);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{hostel.faculties?.length || 0} Faculties assigned</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Created: {format(new Date(hostel.created_at), 'MMM d, yyyy')}</span>
                </div>
              </CardContent>
              <CardFooter className="bg-muted/50 border-t p-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" asChild>
                  <a href={`/rooms?hostel=${hostel.id}`}>Manage Rooms</a>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Hostels;
