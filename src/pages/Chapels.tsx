import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Chapel } from '@/types';
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
import { Loader2, Plus, Church } from 'lucide-react';
import { toast } from 'sonner';

const Chapels: React.FC = () => {
  const { user } = useAuth();
  const [chapels, setChapels] = useState<Chapel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newChapel, setNewChapel] = useState({
    name: ''
  });

  const fetchChapels = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/superadmin/chapels');
      setChapels(response.data);
    } catch (error) {
      console.error('Failed to fetch chapels', error);
      toast.error('Failed to load chapels');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChapels();
  }, []);

  const handleCreateChapel = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/superadmin/chapels', newChapel);
      toast.success('Chapel created successfully');
      setNewChapel({ name: '' });
      setIsAddDialogOpen(false);
      fetchChapels();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create chapel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingChapel, setEditingChapel] = useState<Chapel | null>(null);

  const handleUpdateChapel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingChapel) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/superadmin/chapels/${editingChapel.id}`, { name: editingChapel.name });
      toast.success('Chapel updated successfully');
      setIsEditDialogOpen(false);
      fetchChapels();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update chapel');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Chapels</h2>
          <p className="text-muted-foreground">
            Manage university chapels and student attendance.
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Chapel
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Chapel</DialogTitle>
              <DialogDescription>
                Add a new chapel to the university system.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateChapel} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Chapel Name</Label>
                <Input 
                  id="name" 
                  placeholder="e.g., St. Peter's Chapel" 
                  value={newChapel.name}
                  onChange={(e) => setNewChapel({ name: e.target.value })}
                  required 
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Chapel
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Chapel</DialogTitle>
            <DialogDescription>
              Update the name of the chapel.
            </DialogDescription>
          </DialogHeader>
          {editingChapel && (
            <form onSubmit={handleUpdateChapel} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_name">Chapel Name</Label>
                <Input 
                  id="edit_name" 
                  value={editingChapel.name}
                  onChange={(e) => setEditingChapel({ ...editingChapel, name: e.target.value })}
                  required 
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Chapel
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <CardTitle>Chapel Directory</CardTitle>
          <CardDescription>
            List of all chapels in the university.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : chapels.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Church className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No chapels found.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Chapel Name</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chapels.map((chapel) => (
                    <TableRow key={chapel.id}>
                      <TableCell className="font-medium">{chapel.name}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setEditingChapel(chapel);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
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

export default Chapels;
