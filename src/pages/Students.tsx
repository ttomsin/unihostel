import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { UserResponse, Hostel, Faculty, Chapel } from '@/types';
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
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search, UserPlus, Mail, Phone, Hash, Building2, Home } from 'lucide-react';
import { toast } from 'sonner';

const Students: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<UserResponse[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [chapels, setChapels] = useState<Chapel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const [newStudent, setNewStudent] = useState({
    full_name: '',
    matric_number: '',
    level: 100
  });

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<UserResponse | null>(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const endpoint = user?.role === 'superadmin' ? '/superadmin/students' : '/admins/students';
      const response = await api.get(endpoint);
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students', error);
      toast.error('Failed to load students');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMetadata = async () => {
    try {
      const [hostelsRes, facultiesRes, chapelsRes] = await Promise.all([
        api.get('/superadmin/hostels'),
        api.get('/superadmin/faculties'),
        api.get('/superadmin/chapels')
      ]);
      setHostels(hostelsRes.data);
      setFaculties(facultiesRes.data);
      setChapels(chapelsRes.data);
    } catch (error) {
      console.error('Failed to fetch metadata', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    if (user?.role === 'superadmin') {
      fetchMetadata();
    }
  }, [user]);

  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [batchData, setBatchData] = useState('');

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/superadmin/students', newStudent);
      toast.success('Student added successfully');
      setNewStudent({
        full_name: '',
        matric_number: '',
        level: 100
      });
      setIsAddDialogOpen(false);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add student');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Parse JSON batch data
      const studentsToCreate = JSON.parse(batchData);
      if (!Array.isArray(studentsToCreate)) {
        throw new Error('Data must be an array of students');
      }
      await api.post('/superadmin/students/batch', studentsToCreate);
      toast.success('Batch students added successfully');
      setBatchData('');
      setIsBatchDialogOpen(false);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message || error.response?.data?.error || 'Failed to add batch students');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(student => 
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.matric_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Students</h2>
          <p className="text-muted-foreground">
            Manage student records and hostel assignments.
          </p>
        </div>
        {user?.role === 'superadmin' && (
          <div className="flex gap-2">
            <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Batch Add
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Batch Add Students</DialogTitle>
                  <DialogDescription>
                    Paste a JSON array of students to add them in bulk.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleBatchCreate} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="batch_data">JSON Data</Label>
                    <textarea 
                      id="batch_data"
                      className="w-full h-48 p-2 text-xs font-mono border rounded-md"
                      placeholder='[{"full_name": "John Doe", "matric_number": "CSC/001", "level": 100}]'
                      value={batchData}
                      onChange={(e) => setBatchData(e.target.value)}
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Batch
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add Student
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Add New Student</DialogTitle>
                  <DialogDescription>
                    Create a new student account and assign them to academic and residential units.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateStudent} className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input 
                      id="full_name" 
                      value={newStudent.full_name}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, full_name: e.target.value }))}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="matric_number">Matric Number</Label>
                    <Input 
                      id="matric_number" 
                      value={newStudent.matric_number}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, matric_number: e.target.value }))}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">Level</Label>
                    <Select 
                      value={newStudent.level.toString()} 
                      onValueChange={(val) => setNewStudent(prev => ({ ...prev, level: parseInt(val) }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="100">100</SelectItem>
                        <SelectItem value="200">200</SelectItem>
                        <SelectItem value="300">300</SelectItem>
                        <SelectItem value="400">400</SelectItem>
                        <SelectItem value="500">500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting} className="w-full">
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Add Student
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </div>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Student Details</DialogTitle>
          </DialogHeader>
          {viewingStudent && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingStudent.full_name}`} />
                  <AvatarFallback>{viewingStudent.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{viewingStudent.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{viewingStudent.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Matric Number</p>
                  <p>{viewingStudent.matric_number || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Level</p>
                  <p>{viewingStudent.level || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Hostel</p>
                  <p>{viewingStudent.hostel_name || 'Not Assigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Room</p>
                  <p>{viewingStudent.room_number || 'Not Assigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Faculty</p>
                  <p>{viewingStudent.faculty_name || 'Not Assigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Chapel</p>
                  <p>{viewingStudent.chapel_name || 'Not Assigned'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Phone</p>
                  <p>{viewingStudent.phone || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground font-medium">Gender</p>
                  <p className="capitalize">{viewingStudent.gender || 'N/A'}</p>
                </div>
              </div>
              <div className="pt-4 border-t flex justify-between items-center text-xs text-muted-foreground">
                <span>Created: {viewingStudent.created_at ? new Date(viewingStudent.created_at).toLocaleDateString() : 'N/A'}</span>
                <Badge variant={viewingStudent.is_active ? 'default' : 'secondary'}>
                  {viewingStudent.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Student Directory</CardTitle>
              <CardDescription>
                Showing {filteredStudents.length} students
              </CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, matric, or email..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No students found matching your search.</p>
            </div>
          ) : (
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Matric Number</TableHead>
                    <TableHead>Hostel & Room</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.full_name}`} />
                            <AvatarFallback>{student.full_name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{student.full_name}</span>
                            <span className="text-xs text-muted-foreground">{student.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{student.matric_number || 'N/A'}</TableCell>
                      <TableCell>
                        <div className="flex flex-col text-xs">
                          <span className="font-medium">{student.hostel_name || 'No Hostel'}</span>
                          <span className="text-muted-foreground">Room: {student.room_number || 'N/A'}</span>
                        </div>
                      </TableCell>
                      <TableCell>{student.level || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={student.is_active ? 'default' : 'secondary'}>
                          {student.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            setViewingStudent(student);
                            setIsViewDialogOpen(true);
                          }}
                        >
                          View
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

export default Students;
