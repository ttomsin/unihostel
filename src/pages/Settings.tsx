import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { SuperAdminSettings } from '@/types';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, Save, Settings as SettingsIcon, Bell, Shield, Eye } from 'lucide-react';
import { toast } from 'sonner';

const Settings: React.FC = () => {
  const [settings, setSettings] = useState<SuperAdminSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/superadmin/settings');
        setSettings(response.data);
      } catch (error) {
        console.error('Failed to fetch settings', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggleComplaints = async (checked: boolean) => {
    if (!settings) return;
    
    const updatedSettings = { ...settings, show_complaints: checked };
    setSettings(updatedSettings);
    
    try {
      await api.patch('/superadmin/settings', { show_complaints: checked });
      toast.success('Settings updated');
    } catch (error) {
      toast.error('Failed to update settings');
      setSettings(settings); // Revert
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            System Preferences
          </CardTitle>
          <CardDescription>
            Global settings for the hostel management system.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="show-complaints" className="text-base">Show Complaints</Label>
              <p className="text-sm text-muted-foreground">
                Allow admins to see and manage student complaints.
              </p>
            </div>
            <Switch 
              id="show-complaints" 
              checked={settings?.show_complaints} 
              onCheckedChange={handleToggleComplaints}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2 opacity-50 cursor-not-allowed">
            <div className="space-y-0.5">
              <Label className="text-base">Maintenance Mode</Label>
              <p className="text-sm text-muted-foreground">
                Disable student access for system maintenance.
              </p>
            </div>
            <Switch disabled />
          </div>

          <div className="flex items-center justify-between space-x-2 opacity-50 cursor-not-allowed">
            <div className="space-y-0.5">
              <Label className="text-base">Auto-Assign Rooms</Label>
              <p className="text-sm text-muted-foreground">
                Automatically assign rooms to new students based on faculty.
              </p>
            </div>
            <Switch disabled />
          </div>
        </CardContent>
        <CardFooter className="bg-muted/50 border-t p-4">
          <p className="text-xs text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            Notification Settings
          </CardTitle>
          <CardDescription>
            Configure how the system sends alerts.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2">
            <Label className="text-sm">Email Alerts for New Complaints</Label>
            <Switch checked disabled />
          </div>
          <div className="flex items-center justify-between space-x-2">
            <Label className="text-sm">Weekly Summary Reports</Label>
            <Switch disabled />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
