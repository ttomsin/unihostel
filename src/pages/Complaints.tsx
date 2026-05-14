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
  CardTitle,
  CardFooter
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
import { Loader2, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, MoreHorizontal, User, Building } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format } from 'date-fns';

const Complaints: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<ComplaintResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitComplaintDialogOpen, setIsSubmitComplaintDialogOpen] = useState(false);
  const [isResolveComplaintDialogOpen, setIsResolveComplaintDialogOpen] = useState(false);
  
  const [newComplaint, setNewComplaint] = useState({
    title: '',
    description: '',
  });

  const [resolvingComplaint, setResolvingComplaint] = useState<ComplaintResponse | null>(null);
  const [resolveMessage, setResolveMessage] = useState('');

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      let endpoint = '';
      if (user?.role === 'superadmin') endpoint = '/superadmin/complaints';
      else if (user?.role === 'admin') endpoint = '/admins/complaints';
      else if (user?.role === 'student') endpoint = '/students/complaints';

      if (!endpoint) {
        setComplaints([]);
        setIsLoading(false);
        return;
      }

      const response = await api.get(endpoint);
      const data = response.data;
      
      // Debug logging to help identify ID issues
      console.log("Complaints Data received:", data);

      if (Array.isArray(data)) {
        setComplaints(data);
      } else if (data && typeof data === 'object' && Array.isArray(data.complaints)) {
        setComplaints(data.complaints);
      } else {
        setComplaints([]);
      }
    } catch (error) {
      console.error('Failed to fetch complaints', error);
      toast.error('Failed to load complaints');
      setComplaints([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchComplaints();
    }
  }, [user]);

  const handleSubmitComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/students/complaints', newComplaint);
      toast.success('Complaint submitted successfully');
      setNewComplaint({ title: '', description: '' });
      setIsSubmitComplaintDialogOpen(false);
      fetchComplaints();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolveComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safety check for ID
    const complaintId = resolvingComplaint?.id || (resolvingComplaint as any)?.ID;
    
    if (!complaintId || complaintId === '00000000-0000-0000-0000-000000000000') {
      toast.error("Invalid Complaint ID. Please check backend response.");
      console.error("Attempted to resolve complaint with invalid ID:", resolvingComplaint);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/admins/complaints/${complaintId}/resolve`, {
        resolved: true,
        resolve_message: resolveMessage,
      });
      
      toast.success('Complaint marked as resolved');
      setResolveMessage('');
      setResolvingComplaint(null);
      setIsResolveComplaintDialogOpen(false);
      
      await fetchComplaints();
    } catch (error: any) {
      console.error("Resolution error details:", error.response || error);
      toast.error(error.response?.data?.error || 'Failed to resolve complaint');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: string, resolved?: boolean) => {
    if (resolved === true) {
      return <Badge variant="outline" className="text-green-500 border-green-500 bg-green-50 dark:bg-green-950/20"><CheckCircle2 className="h-3 w-3 mr-1" /> Resolved</Badge>;
    }
    
    const s = status?.toLowerCase();
    if (s === 'resolved') {
      return <Badge variant="outline" className="text-green-500 border-green-500 bg-green-50 dark:bg-green-950/20"><CheckCircle2 className="h-3 w-3 mr-1" /> Resolved</Badge>;
    }
    if (s === 'in-progress') {
      return <Badge variant="outline" className="text-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-900/20"><AlertCircle className="h-3 w-3 mr-1" /> In Progress</Badge>;
    }
    
    return <Badge variant="outline" className="text-orange-500 border-orange-500 bg-orange-50 dark:bg-orange-950/20"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">Complaints</h2>
          <p className="text-muted-foreground text-sm md:text-base">
            Manage hostel-related issues and maintenance requests.
          </p>
        </div>
        {user?.role === 'student' && (
          <Dialog open={isSubmitComplaintDialogOpen} onOpenChange={setIsSubmitComplaintDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto shadow-lg">
                <Plus className="h-4 w-4 mr-2" />
                New Complaint
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-lg rounded-xl">
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
                    className="min-h-[120px]"
                    value={newComplaint.description}
                    onChange={(e) => setNewComplaint(prev => ({ ...prev, description: e.target.value }))}
                    required 
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Submit Complaint
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardHeader className="bg-slate-50/50 dark:bg-slate-900/50 border-b">
          <CardTitle className="text-lg md:text-xl">
            {user?.role === 'student' ? 'My History' : 'Recent Submissions'}
          </CardTitle>
          <CardDescription className="text-xs md:text-sm">
            {user?.role === 'student' 
              ? 'Tracking your submitted issues and their current resolution status.'
              : 'Managing student reports across all assigned hostel blocks.'
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
          ) : complaints.length === 0 ? (
            <div className="text-center py-20 px-4">
              <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold">No complaints yet</h3>
              <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">Everything seems to be running smoothly.</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="font-bold">Title</TableHead>
                      {user?.role !== 'student' && <TableHead className="font-bold">Student</TableHead>}
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold">Date</TableHead>
                      <TableHead className="font-bold">Resolution</TableHead>
                      {(user?.role === 'admin' || user?.role === 'superadmin') && <TableHead className="text-right font-bold">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {complaints.map((complaint) => (
                      <TableRow key={complaint.id || (complaint as any).ID} className="group transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900 dark:text-slate-100">{complaint.title}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">{complaint.description}</span>
                          </div>
                        </TableCell>
                        {user?.role !== 'student' && (
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{complaint.student_name || 'N/A'}</span>
                              <span className="text-[10px] text-muted-foreground uppercase">{complaint.hostel_name}</span>
                            </div>
                          </TableCell>
                        )}
                        <TableCell>{getStatusBadge(complaint.status, complaint.resolved)}</TableCell>
                        <TableCell className="text-xs font-medium text-slate-500">
                          {complaint.created_at ? format(new Date(complaint.created_at), 'MMM d, yyyy') : 'N/A'}
                        </TableCell>
                        <TableCell>
                          {complaint.resolve_message ? (
                            <span className="text-xs bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-md line-clamp-1 max-w-[200px]">
                              {complaint.resolve_message}
                            </span>
                          ) : <span className="text-xs text-muted-foreground italic">Pending resolution</span>}
                        </TableCell>
                        {(user?.role === 'admin' || user?.role === 'superadmin') && (
                          <TableCell className="text-right">
                            {!complaint.resolved && (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="font-bold text-xs"
                                onClick={() => {
                                  setResolvingComplaint(complaint);
                                  setIsResolveComplaintDialogOpen(true);
                                }}
                              >
                                Resolve
                              </Button>
                            )}
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile List View */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {complaints.map((complaint) => (
                  <div key={complaint.id || (complaint as any).ID} className="p-4 space-y-3 active:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="font-black text-slate-900 dark:text-slate-100 leading-none">{complaint.title}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{complaint.description}</p>
                      </div>
                      {getStatusBadge(complaint.status, complaint.resolved)}
                    </div>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-2 items-center text-[10px] uppercase font-bold tracking-wider text-slate-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {complaint.created_at ? format(new Date(complaint.created_at), 'MMM d') : 'N/A'}
                      </div>
                      {user?.role !== 'student' && (
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {complaint.student_name || 'N/A'}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Building className="h-3 w-3" />
                        {complaint.hostel_name || 'Hostel'}
                      </div>
                    </div>

                    {complaint.resolve_message && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                        <p className="text-[10px] font-black text-emerald-800 dark:text-emerald-400 uppercase mb-1">Resolution Message</p>
                        <p className="text-xs text-emerald-700 dark:text-emerald-300 italic">"{complaint.resolve_message}"</p>
                      </div>
                    )}

                    {!complaint.resolved && (user?.role === 'admin' || user?.role === 'superadmin') && (
                      <Button 
                        variant="secondary" 
                        className="w-full font-bold text-xs bg-slate-100 dark:bg-slate-800"
                        onClick={() => {
                          setResolvingComplaint(complaint);
                          setIsResolveComplaintDialogOpen(true);
                        }}
                      >
                        Action Required: Resolve Now
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Resolve Complaint Dialog */}
      <Dialog open={isResolveComplaintDialogOpen} onOpenChange={setIsResolveComplaintDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-lg rounded-xl">
          <DialogHeader>
            <DialogTitle>Resolve Complaint</DialogTitle>
            <DialogDescription>
              Submit details of the resolution for <span className="font-bold text-slate-900 dark:text-slate-100">{resolvingComplaint?.title}</span>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleResolveComplaint} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="resolve_message">Resolution Message</Label>
              <Textarea 
                id="resolve_message" 
                placeholder="Describe what was done to fix the issue..." 
                className="min-h-[120px]"
                value={resolveMessage}
                onChange={(e) => setResolveMessage(e.target.value)}
                required 
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm Resolution
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Complaints;
