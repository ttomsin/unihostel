import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { ComplaintResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Complaints: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
  });

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      let endpoint = '';
      if (user?.role === 'superadmin') endpoint = '/superadmin/complaints';
      else if (user?.role === 'admin') endpoint = '/admins/complaints';
      else if (user?.role === 'student') endpoint = '/admins/complaints'; // Students see their hostel's complaints or we filter? API says admins/complaints for admin's hostel

      // Actually for student, they might only see their own or hostel's. 
      // The API.json shows /admins/complaints for admin's hostel.
      // Let's assume students can see their hostel's complaints too if they use the same endpoint.
      
      const response = await api.get(endpoint || '/admins/complaints');
      setComplaints(response.data);
    } catch (error) {
      console.error('Failed to fetch complaints', error);
      toast.error('Failed to load complaints');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [user]);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/students/complaints', newComplaint);
      toast.success('Complaint submitted successfully');
      setNewComplaint({ title: '', description: '' });
      setIsDialogOpen(false);
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return <Badge variant="outline" className="text-orange-500 border-orange-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'resolved':
        return <Badge variant="outline" className="text-green-500 border-green-500"><CheckCircle2 className="h-3 w-3 mr-1" /> Resolved</Badge>;
      case 'in-progress':
        return <Badge variant="outline" className="text-blue-500 border-blue-500"><AlertCircle className="h-3 w-3 mr-1" /> In Progress</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Complaints</h2>
          <p className="text-muted-foreground">
            View and manage hostel-related issues and maintenance requests.
          </p>
        </div>
        {user?.role === 'student' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Complaint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Submit a Complaint</DialogTitle>
                <DialogDescription>
                  Describe the issue you're facing in your hostel or room.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitComplaint} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input 
                    id="title" 
                    placeholder="e.g., Broken fan, Leaking tap" 
                    value={newComplaint.title}
                    onChange={(e) => setNewComplaint(prev => ({ ...prev, title: e.target.value }))}
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Provide more details about the issue..." 
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
                    required 
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Complaint
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Complaints</CardTitle>
          <CardDescription>
            A list of complaints submitted in your hostel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No complaints found.</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Hostel</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">{complaint.title}</TableCell>
                      <TableCell>{complaint.student_name || 'Unknown'}</TableCell>
                      <TableCell>{complaint.hostel_name || 'Unknown'}</TableCell>
                      <TableCell>{getStatusBadge(complaint.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(complaint.created_at), 'MMM d, yyyy')}
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

export default Complaints;
