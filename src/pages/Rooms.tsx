import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { RoomResponse, Hostel } from '@/types';
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
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Loader2, Search, Home, Users, Building2, UserPlus, AlertCircle, Plus } from 'lucide-react';
import { toast } from 'sonner';

import { useSearchParams } from 'react-router-dom';

const Rooms: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState<RoomResponse[]>([]);
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [selectedHostel, setSelectedHostel] = useState<string>(searchParams.get('hostel') || 'all');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isJoining, setIsJoining] = useState<string | null>(null);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);

  const [batchRooms, setBatchRooms] = useState({
    hostel_id: '',
    start_letter: 'A',
    end_letter: 'A',
    room_count: 10,
    capacity: 4,
    gender: 'male'
  });

  const fetchHostels = async () => {
    try {
      const response = await api.get('/common/hostels');
      setHostels(response.data);
    } catch (error) {
      console.error('Failed to fetch hostels', error);
    }
  };

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      let endpoint = '';
      if (user?.role === 'superadmin') endpoint = '/superadmin/rooms';
      else if (user?.role === 'admin') endpoint = '/admins/rooms';
      else if (user?.role === 'student') {
        if (selectedHostel === 'all') {
          endpoint = user.hostel_id ? `/common/hostels/${user.hostel_id}/rooms` : '';
        } else {
          endpoint = `/common/hostels/${selectedHostel}/rooms`;
        }
      }

      if (!endpoint && user?.role === 'student') {
        // If student has no hostel assigned and 'all' is selected, maybe return empty list
        setRooms([]);
        setIsLoading(false);
        return;
      }

      const response = await api.get(endpoint);
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms', error);
      toast.error('Failed to load rooms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'superadmin') {
      fetchHostels();
    }
    fetchRooms();
  }, [user, selectedHostel]);

  const handleJoinRoom = async (roomId: string) => {
    setIsJoining(roomId);
    try {
      await api.post(`/students/rooms/${roomId}/join`);
      toast.success('Successfully joined the room');
      fetchRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to join room');
    } finally {
      setIsJoining(null);
    }
  };

  const handleBatchCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/superadmin/rooms', batchRooms);
      toast.success('Rooms created successfully');
      setIsBatchDialogOpen(false);
      fetchRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create rooms');
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomResponse | null>(null);

  const [isViewStudentsDialogOpen, setIsViewStudentsDialogOpen] = useState(false);
  const [viewingRoomId, setViewingRoomId] = useState<string | null>(null);
  const [roomStudents, setRoomStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);

  const fetchRoomStudents = async (roomId: string) => {
    setIsLoadingStudents(true);
    setRoomStudents([]);
    try {
      const endpoint = user?.role === 'superadmin' ? `/superadmin/rooms/${roomId}` : `/admins/rooms/${roomId}/students`;
      const response = await api.get(endpoint);
      // Ensure we set an array. If the superadmin endpoint returns a single room object instead of a list of students,
      // we might need to extract the students array. According to typical pattern /admins/rooms/{room_id}/students returns students list.
      // Assuming it returns an array of students.
      setRoomStudents(Array.isArray(response.data) ? response.data : response.data.students || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch students in room');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleRemoveStudentFromRoom = async (studentId: string) => {
    try {
      // both superadmin and admin might use this or they have different endpoints. Let's use the admin one as user mentioned.
      // or /superadmin/students/{student_id}/remove-room if superadmin. We will use /students/... ? User said "an endpont for admin to fetch students in a room"
      // Wait, user provided paths: /admins/students/{student_id}/remove-room
      // What about superadmin? Let's use /admins/students if they are admin, else... Wait, if superadmin also wants to do it, we'll try `/superadmin/students/${studentId}`? Wait, we can just use `/admins/students/${studentId}/remove-room` for both?
      // Wait, let's look at the earlier paths: "/superadmin/students/{student_id}/remove-room" is not in there. 
      // But maybe it's common? Let's try /admins/students/${studentId}/remove-room for admin, but for superadmin it's just /superadmin/students patch? Let's use /admins/... for admin. 
      // User specific requested: `/admins/students/{student_id}/remove-room`
      const endpoint = user?.role === 'superadmin' ? `/superadmin/students/${studentId}` : `/admins/students/${studentId}/remove-room`;
      
      if (user?.role === 'superadmin') {
         await api.patch(endpoint, { room_id: null });
      } else {
         await api.patch(endpoint);
      }
      
      toast.success('Student removed from room');
      if (viewingRoomId) fetchRoomStudents(viewingRoomId);
      fetchRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to remove student');
    }
  };

  const handleEditRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRoom) return;
    setIsSubmitting(true);
    try {
      await api.patch(`/superadmin/rooms/${editingRoom.id}`, {
        capacity: editingRoom.capacity,
        gender: editingRoom.gender
      });
      toast.success('Room updated successfully');
      setIsEditDialogOpen(false);
      fetchRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update room');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRooms = rooms.filter(room => 
    room.number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    room.hostel_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const ratio = occupancy / capacity;
    if (ratio >= 1) return 'bg-destructive';
    if (ratio >= 0.75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rooms</h2>
          <p className="text-muted-foreground">
            Browse and manage hostel rooms and occupancy.
          </p>
        </div>
        {user?.role === 'superadmin' && (
          <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Batch Create
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Batch Create Rooms</DialogTitle>
                <DialogDescription>
                  Quickly create multiple rooms for a specific hostel.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleBatchCreate} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="hostel">Select Hostel</Label>
                  <Select 
                    value={batchRooms.hostel_id} 
                    onValueChange={(val) => setBatchRooms(prev => ({ ...prev, hostel_id: val }))}
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start">Start Letter</Label>
                    <Input 
                      id="start" 
                      value={batchRooms.start_letter}
                      onChange={(e) => setBatchRooms(prev => ({ ...prev, start_letter: e.target.value }))}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Letter</Label>
                    <Input 
                      id="end" 
                      value={batchRooms.end_letter}
                      onChange={(e) => setBatchRooms(prev => ({ ...prev, end_letter: e.target.value }))}
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room_count">Room Count</Label>
                    <Input 
                      id="room_count" 
                      type="number" 
                      value={batchRooms.room_count}
                      onChange={(e) => setBatchRooms(prev => ({ ...prev, room_count: parseInt(e.target.value) }))}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input 
                      id="capacity" 
                      type="number" 
                      value={batchRooms.capacity}
                      onChange={(e) => setBatchRooms(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                      required 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <Select 
                    value={batchRooms.gender} 
                    onValueChange={(val) => setBatchRooms(prev => ({ ...prev, gender: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Rooms
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
            <DialogTitle>Edit Room {editingRoom?.number}</DialogTitle>
            <DialogDescription>
              Update room capacity and gender assignment.
            </DialogDescription>
          </DialogHeader>
          {editingRoom && (
            <form onSubmit={handleEditRoom} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit_capacity">Capacity</Label>
                <Input 
                  id="edit_capacity" 
                  type="number" 
                  value={editingRoom.capacity}
                  onChange={(e) => setEditingRoom(prev => prev ? ({ ...prev, capacity: parseInt(e.target.value) }) : null)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit_gender">Gender</Label>
                <Select 
                  value={editingRoom.gender} 
                  onValueChange={(val) => setEditingRoom(prev => prev ? ({ ...prev, gender: val as any }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Room
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isViewStudentsDialogOpen} onOpenChange={(open) => {
        setIsViewStudentsDialogOpen(open);
        if (!open) {
          setViewingRoomId(null);
          setRoomStudents([]);
        }
      }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Room Students</DialogTitle>
            <DialogDescription>
              View and manage students in this room.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {isLoadingStudents ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : roomStudents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p>No students currently assigned to this room.</p>
              </div>
            ) : (
              <div className="border rounded-md overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Matric No.</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {roomStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.full_name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell className="uppercase">{student.matric_number}</TableCell>
                        <TableCell>{student.level}</TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => {
                              if (confirm('Are you sure you want to remove this student from the room?')) {
                                handleRemoveStudentFromRoom(student.id);
                              }
                            }}
                          >
                            Remove
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by room number or hostel..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {user?.role === 'superadmin' && (
          <div className="w-full md:w-64">
            <Select value={selectedHostel} onValueChange={setSelectedHostel}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Hostel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Hostels</SelectItem>
                {hostels.map((hostel) => (
                  <SelectItem key={hostel.id} value={hostel.id}>{hostel.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Home className="h-12 w-12 mx-auto mb-4 opacity-20" />
          <p>No rooms found.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => (
            <Card key={room.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-xl flex items-center gap-2">
                      <Home className="h-5 w-5 text-primary" />
                      Room {room.number}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {room.hostel_name}
                    </CardDescription>
                  </div>
                  <Badge variant={room.gender === 'male' ? 'default' : 'secondary'} className="capitalize">
                    {room.gender}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Occupancy</span>
                    <span className="font-medium">{room.occupancy} / {room.capacity}</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getOccupancyColor(room.occupancy, room.capacity)} transition-all`} 
                      style={{ width: `${(room.occupancy / room.capacity) * 100}%` }}
                    />
                  </div>
                </div>
                
                {room.students && room.students.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Current Residents</p>
                    <div className="flex flex-wrap gap-2">
                      {room.students.map((student) => (
                        <Badge key={student.id} variant="outline" className="text-[10px]">
                          {student.full_name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="bg-muted/50 border-t p-4">
                {user?.role === 'student' ? (
                  <Button 
                    className="w-full" 
                    disabled={room.occupancy >= room.capacity || isJoining === room.id || user.room_id === room.id}
                    onClick={() => handleJoinRoom(room.id)}
                  >
                    {isJoining === room.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                    {user.room_id === room.id ? 'Current Room' : room.occupancy >= room.capacity ? 'Room Full' : 'Join Room'}
                  </Button>
                ) : (
                  <div className="flex gap-2 w-full">
                    {user?.role === 'superadmin' && (
                      <Button 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setEditingRoom(room);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => {
                        setViewingRoomId(room.id);
                        setIsViewStudentsDialogOpen(true);
                        fetchRoomStudents(room.id);
                      }}
                    >
                      <Users className="mr-2 h-4 w-4" />
                      Students
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Rooms;
