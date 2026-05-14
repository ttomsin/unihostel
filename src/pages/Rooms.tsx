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
import { Loader2, Search, Home, Users, Building2, UserPlus, AlertCircle, Plus, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

import { useSearchParams } from 'react-router-dom';

const Rooms: React.FC = () => {
  const { user, updateUser } = useAuth();
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

  const fetchProfile = async () => {
    try {
      const response = await api.get('/students/me');
      updateUser(response.data);
    } catch (error) {
      console.error('Failed to fetch updated profile', error);
    }
  };

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      let endpoint = '';

      if (user?.role === 'superadmin') {
        // Always use the superadmin endpoint
        endpoint = '/superadmin/rooms';
      }
      else if (user?.role === 'admin') {
        endpoint = '/admins/rooms';
      }
      else if (user?.role === 'student') {
        if (selectedHostel !== 'all' && selectedHostel !== '') {
          endpoint = `/common/hostels/${selectedHostel}/rooms`;
        } else if (user.hostel_id) {
          endpoint = `/common/hostels/${user.hostel_id}/rooms`;
        }
      }

      if (!endpoint) {
        setRooms([]);
        setIsLoading(false);
        return;
      }

      const response = await api.get(endpoint);
      let roomsData = response.data;

      // Filter rooms by hostel if superadmin selected a specific hostel
      if (user?.role === 'superadmin' && selectedHostel !== 'all') {
        roomsData = Array.isArray(roomsData)
            ? roomsData.filter((room: RoomResponse) => room.hostel_id === selectedHostel)
            : [];
      }

      setRooms(Array.isArray(roomsData) ? roomsData : []);
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
  }, [user?.role, user?.hostel_id, selectedHostel]);

  const handleJoinRoom = async (roomId: string) => {
    setIsJoining(roomId);
    try {
      await api.post(`/students/rooms/${roomId}/join`);
      toast.success('Successfully joined the room');
      
      // Update local auth state to reflect the new room_id
      await fetchProfile();
      
      // Refresh room list to show updated occupancy
      fetchRooms();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to join room');
    } finally {
      setIsJoining(null);
    }
  };

  const handleBatchCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchRooms.hostel_id) {
      toast.error("Please select a hostel first");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/superadmin/rooms', batchRooms);
      toast.success('Rooms created successfully');
      setIsBatchDialogOpen(false);
      if (selectedHostel !== 'all' && selectedHostel !== batchRooms.hostel_id) {
        setSelectedHostel('all');
      } else {
        fetchRooms();
      }
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
      setRoomStudents(Array.isArray(response.data) ? response.data : response.data.students || []);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to fetch students in room');
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const handleRemoveStudentFromRoom = async (studentId: string) => {
    try {
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

  const filteredRooms = rooms.filter(room => {
    const searchMatch = (room.number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                       (room.hostel_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    const hostelMatch = selectedHostel === 'all' || room.hostel_id === selectedHostel;
    return searchMatch && hostelMatch;
  });

  const getOccupancyColor = (occupancy: number, capacity: number) => {
    const ratio = occupancy / capacity;
    if (ratio >= 1) return 'bg-destructive';
    if (ratio >= 0.75) return 'bg-orange-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6 p-4 md:p-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Rooms</h2>
          <p className="text-muted-foreground text-sm">
            Browse and manage hostel rooms and occupancy.
          </p>
        </div>
        {user?.role === 'superadmin' && (
          <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Batch Create
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] sm:max-w-md">
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
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        setBatchRooms(prev => ({ 
                          ...prev, 
                          start_letter: val,
                          end_letter: val 
                        }));
                      }}
                      maxLength={1}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end">End Letter</Label>
                    <Input 
                      id="end" 
                      value={batchRooms.end_letter}
                      readOnly 
                      className="bg-muted cursor-not-allowed" 
                      required 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="room_count">Rooms to Create</Label>
                    <Input 
                      id="room_count" 
                      type="number" 
                      value={batchRooms.room_count}
                      onChange={(e) => setBatchRooms(prev => ({ ...prev, room_count: parseInt(e.target.value) }))}
                      min={1}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Bed Capacity</Label>
                    <Input 
                      id="capacity" 
                      type="number" 
                      value={batchRooms.capacity}
                      onChange={(e) => setBatchRooms(prev => ({ ...prev, capacity: parseInt(e.target.value) }))}
                      min={1}
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
                  <Button type="submit" disabled={isSubmitting} className="w-full">
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Rooms
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
          <Input
            type="search"
            placeholder="Search by room number or hostel..."
            className="pl-10 h-11 bg-white dark:bg-slate-900 border-none shadow-sm rounded-xl ring-offset-transparent focus-visible:ring-2 focus-visible:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {user?.role === 'superadmin' && (
          <div className="w-full md:w-64">
            <Select value={selectedHostel} onValueChange={setSelectedHostel}>
              <SelectTrigger className="h-11 rounded-xl shadow-sm border-none bg-white dark:bg-slate-900">
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
        <div className="flex justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="text-center py-20">
          <Home className="h-12 w-12 mx-auto mb-4 opacity-20 text-slate-400" />
          <p className="font-bold">No rooms found</p>
          <p className="text-sm text-muted-foreground">Adjust your search or filters to see more rooms.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.map((room) => {
            const isCurrentRoom = user?.room_id === room.id;
            return (
              <Card key={room.id} className={`overflow-hidden border-none shadow-md transition-all ${isCurrentRoom ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-slate-950' : ''}`}>
                <CardHeader className="pb-2 bg-slate-50/50 dark:bg-slate-900/50">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-xl font-black flex items-center gap-2">
                        {isCurrentRoom && <CheckCircle2 className="h-4 w-4 text-blue-500" />}
                        Room {room.number}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 font-bold text-xs uppercase tracking-tighter">
                        <Building2 className="h-3 w-3" />
                        {room.hostel_name || 'Hostel Not Set'}
                      </CardDescription>
                    </div>
                    <Badge variant={room.gender === 'male' ? 'default' : 'secondary'} className="capitalize font-black text-[10px]">
                      {room.gender}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <span>Occupancy</span>
                      <span>{room.occupancy} / {room.capacity} beds</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getOccupancyColor(room.occupancy, room.capacity)} transition-all`} 
                        style={{ width: `${(room.occupancy / room.capacity) * 100}%` }}
                      />
                    </div>
                  </div>
                  
                  {room.students && room.students.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Residents</p>
                      <div className="flex flex-wrap gap-2">
                        {room.students.map((student) => (
                          <div key={student.id} className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-md border text-[10px] font-bold">
                            <div className={`w-1.5 h-1.5 rounded-full ${student.id === user?.id ? 'bg-blue-500 animate-pulse' : 'bg-slate-300'}`} />
                            {student.full_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="bg-slate-50/50 dark:bg-slate-900/50 border-t p-4">
                  {user?.role === 'student' ? (
                    <Button 
                      className={`w-full font-black uppercase tracking-widest text-xs h-10 ${isCurrentRoom ? 'bg-blue-500 hover:bg-blue-600' : ''}`}
                      disabled={(!isCurrentRoom && room.occupancy >= room.capacity) || isJoining === room.id}
                      variant={isCurrentRoom ? 'default' : 'outline'}
                      onClick={() => !isCurrentRoom && handleJoinRoom(room.id)}
                    >
                      {isJoining === room.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isCurrentRoom ? (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      ) : (
                        <UserPlus className="mr-2 h-4 w-4" />
                      )}
                      {isCurrentRoom ? 'Your Current Room' : room.occupancy >= room.capacity ? 'Full' : 'Join Room'}
                    </Button>
                  ) : (
                    <div className="flex gap-2 w-full">
                      {user?.role === 'superadmin' && (
                        <Button 
                          variant="outline" 
                          className="flex-1 font-bold text-xs"
                          onClick={() => {
                            setEditingRoom(room);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          Edit
                        </Button>
                      )}
                      <Button 
                        variant="secondary" 
                        className="flex-1 font-bold text-xs"
                        onClick={() => {
                          setViewingRoomId(room.id);
                          setIsViewStudentsDialogOpen(true);
                          fetchRoomStudents(room.id);
                        }}
                      >
                        <Users className="mr-2 h-4 w-4" />
                        Manage
                      </Button>
                    </div>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      {/* Existing Edit & View Students Dialogs remain below... */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Room {editingRoom?.number}</DialogTitle>
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
                <Button type="submit" disabled={isSubmitting} className="w-full">
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
    </div>
  );
};

export default Rooms;
