import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { User, Chapel } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Save, User as UserIcon, Phone, Mail, Hash, GraduationCap, Building2, Home, Lock, Church } from 'lucide-react';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [chapels, setChapels] = useState<Chapel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    email: '',
    gender: 'unspecified',
    password: '',
    chapel_id: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profileRes, chapelsRes] = await Promise.all([
          api.get('/students/me'),
          api.get('/students/chapels')
        ]);
        setProfile(profileRes.data);
        setChapels(chapelsRes.data);
        setFormData({
          full_name: profileRes.data.full_name,
          phone: profileRes.data.phone || '',
          email: profileRes.data.email,
          gender: profileRes.data.gender || 'unspecified',
          password: '',
          chapel_id: profileRes.data.chapel_id || '',
        });
      } catch (error) {
        console.error('Failed to fetch profile settings', error);
        toast.error('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.role === 'student') {
      fetchData();
    } else {
      setProfile(user);
      setFormData({
        full_name: user?.full_name || '',
        phone: user?.phone || '',
        email: user?.email || '',
        gender: user?.gender || 'unspecified',
        password: '',
        chapel_id: user?.chapel_id || '',
      });
      setIsLoading(false);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const payload: any = { ...formData };
      if (!payload.password) {
        delete payload.password;
      }
      if (!payload.chapel_id) {
        delete payload.chapel_id;
      }
      if (!payload.phone) {
        delete payload.phone;
      }

      const endpoint = user?.role === 'student' ? '/students/me' : '/students/me'; 
      const response = await api.patch(endpoint, payload);
      setProfile(response.data);
      login({ token: localStorage.getItem('token') || '', user: response.data });
      toast.success('Profile updated successfully');
      setFormData(prev => ({ 
        ...prev, 
        password: '', 
        phone: response.data.phone || '', 
        gender: response.data.gender || 'unspecified',
        chapel_id: response.data.chapel_id || '',
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-6">
        <Card className="w-full md:w-1/3">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.full_name}`} />
                <AvatarFallback>{profile?.full_name?.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle>{profile?.full_name}</CardTitle>
            <CardDescription className="capitalize">{profile?.role}</CardDescription>
            <div className="flex justify-center mt-2">
              <Badge variant={profile?.is_active ? 'default' : 'secondary'}>
                {profile?.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{profile?.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile?.phone || 'No phone number'}</span>
            </div>
            {profile?.matric_number && (
              <div className="flex items-center gap-3 text-sm">
                <Hash className="h-4 w-4 text-muted-foreground" />
                <span>{profile?.matric_number}</span>
              </div>
            )}
            <Separator />
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Academic Info</p>
              <div className="flex items-center gap-3 text-sm">
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
                <span>Level {profile?.level || 'N/A'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase text-muted-foreground">Hostel Info</p>
              <div className="flex items-center gap-3 text-sm">
                <Building2 className="h-4 w-4 text-muted-foreground" />
                <span>Hostel ID: {profile?.hostel_id || 'Not assigned'}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Home className="h-4 w-4 text-muted-foreground" />
                <span>Room ID: {profile?.room_id || 'Not assigned'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <form onSubmit={handleUpdateProfile}>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input 
                  id="full_name" 
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="gender">Gender</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, gender: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                    <SelectItem value="unspecified">Unspecified</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="chapel">Chapel</Label>
                <Select 
                  value={formData.chapel_id} 
                  onValueChange={(val) => setFormData(prev => ({ ...prev, chapel_id: val }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chapel" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapels.map(chapel => (
                      <SelectItem key={chapel.id} value={chapel.id}>{chapel.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">New Password (leave blank to keep current)</Label>
                <Input 
                  id="password" 
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                />
              </div>
              <div className="rounded-lg bg-muted p-4 text-xs text-muted-foreground">
                <p>Note: Academic information and hostel assignments can only be changed by a superadmin.</p>
                <p className="mt-1">Profile edits remaining: {profile?.edit_count || 0}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="ml-auto" disabled={isSaving || (profile?.edit_count === 0 && user?.role === 'student')}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
