import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { UserResponse } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Search, UserPlus, Mail, Phone, Hash, Building2, Home } from 'lucide-react';
import { toast } from 'sonner';

const Students: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

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

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const filteredStudents = students.filter(student => 
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.matric_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
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
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Student
          </Button>
        )}
      </div>

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
                        <Button variant="ghost" size="sm">View</Button>
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
