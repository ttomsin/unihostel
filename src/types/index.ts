export type Role = 'superadmin' | 'admin' | 'student';
export type Gender = 'male' | 'female' | 'other' | 'unspecified';

export interface User {
  id: string;
  full_name: string;
  email: string;
  matric_number?: string;
  phone?: string;
  gender: Gender;
  role: Role;
  is_active: boolean;
  level?: number;
  hostel_id?: string;
  room_id?: string;
  faculty_id?: string;
  chapel_id?: string;
  edit_count: number;
  created_at: string;
  updated_at: string;
}

export interface UserResponse extends User {
  hostel_name?: string;
  room_number?: string;
  faculty_name?: string;
  chapel_name?: string;
}

export interface UserSimpleResponse {
  id: string;
  full_name: string;
  gender: Gender;
  level: number;
}

export interface Hostel {
  id: string;
  name: string;
  faculties: Faculty[];
  created_at: string;
  updated_at: string;
}

export interface Faculty {
  id: string;
  name: string;
  hostel_id: string;
}

export interface FacultyResponse extends Faculty {
  hostel_name: string;
}

export interface Chapel {
  id: string;
  name: string;
}

export interface Room {
  id: string;
  number: string;
  capacity: number;
  gender: Gender;
  hostel_id: string;
  created_at: string;
  updated_at: string;
}

export interface RoomResponse extends Room {
  hostel_name: string;
  occupancy: number;
  students: UserSimpleResponse[];
}

export interface Complaint {
  id: string;
  title: string;
  description: string;
  status: string;
  student_id: string;
  hostel_id: string;
  created_at: string;
}

export interface ComplaintResponse extends Complaint {
  student_name: string;
  hostel_name: string;
}

export interface SuperAdminSettings {
  id: number;
  show_complaints: boolean;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  [key: string]: any;
}
