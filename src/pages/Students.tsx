import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/lib/api";
import { UserResponse, Hostel, Faculty, Chapel } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Loader2,
  Search,
  UserPlus,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  ChevronRight,
  Filter,
} from "lucide-react";
import { toast } from "sonner";

const Students: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<UserResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false);
  const [batchData, setBatchData] = useState("");

  const [newStudent, setNewStudent] = useState({
    full_name: "",
    matric_number: "",
    level: 100,
  });

  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewingStudent, setViewingStudent] = useState<UserResponse | null>(
    null,
  );

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const endpoint =
        user?.role === "superadmin"
          ? "/superadmin/students"
          : "/admins/students";
      const response = await api.get(endpoint);
      setStudents(response.data);
    } catch (error) {
      console.error("Failed to fetch students", error);
      toast.error("Failed to load students");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [user]);

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post("/superadmin/students", newStudent);
      toast.success("Student added successfully");
      setNewStudent({ full_name: "", matric_number: "", level: 100 });
      setIsAddDialogOpen(false);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to add student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBatchCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const studentsToCreate = JSON.parse(batchData);
      if (!Array.isArray(studentsToCreate))
        throw new Error("Data must be an array");
      await api.post("/superadmin/students/batch", studentsToCreate);
      toast.success("Batch students added successfully");
      setBatchData("");
      setIsBatchDialogOpen(false);
      fetchStudents();
    } catch (error: any) {
      toast.error(error.message || "Failed to add batch students");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredStudents = students.filter(
    (student) =>
      student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.matric_number?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-black tracking-tight">
            Student Records
          </h2>
          <p className="text-muted-foreground text-sm">
            Managing all resident profiles and academic data.
          </p>
        </div>
        {user?.role === "superadmin" && (
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none font-bold"
              onClick={() => setIsBatchDialogOpen(true)}
            >
              Batch Import
            </Button>
            <Button
              size="sm"
              className="flex-1 sm:flex-none font-bold bg-blue-600"
              onClick={() => setIsAddDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-2" /> Add New
            </Button>
          </div>
        )}
      </div>

      <div className="relative flex-1 group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-blue-500 transition-colors" />
        <Input
          type="search"
          placeholder="Search by name, matric number, email..."
          className="pl-10 h-12 bg-white dark:bg-slate-900 border-none shadow-sm rounded-xl ring-offset-transparent focus-visible:ring-2 focus-visible:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="text-center py-20">
              <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="font-bold">No students found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your search criteria.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden md:block">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-900/50">
                    <TableRow>
                      <TableHead className="font-bold">Student</TableHead>
                      <TableHead className="font-bold">Matric Number</TableHead>
                      <TableHead className="font-bold">Allocation</TableHead>
                      <TableHead className="font-bold">Level</TableHead>
                      <TableHead className="text-right font-bold">
                        Details
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="group">
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-transparent group-hover:ring-blue-500 transition-all">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.full_name}`}
                              />
                              <AvatarFallback className="font-bold">
                                {student.full_name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900 dark:text-slate-100">
                                {student.full_name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {student.email}
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm uppercase tracking-tight">
                          {student.matric_number || "N/A"}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold flex items-center gap-1">
                              <Building2 className="h-3 w-3 text-blue-500" />{" "}
                              {student.hostel_name || "Unassigned"}
                            </span>
                            <span className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase tracking-tighter">
                              Room: {student.room_number || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="font-black px-2.5 py-0.5"
                          >
                            {student.level}L
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
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile View */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {filteredStudents.map((student) => (
                  <div
                    key={student.id}
                    className="p-4 flex items-center gap-4 active:bg-slate-50 transition-colors"
                    onClick={() => {
                      setViewingStudent(student);
                      setIsViewDialogOpen(true);
                    }}
                  >
                    <Avatar className="h-12 w-12 border">
                      <AvatarImage
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${student.full_name}`}
                      />
                      <AvatarFallback className="font-bold bg-slate-100">
                        {student.full_name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-black text-slate-900 dark:text-slate-100 truncate">
                          {student.full_name}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-[10px] font-black"
                        >
                          {student.level}L
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground font-mono uppercase truncate mb-1">
                        {student.matric_number || "N/A"}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
                        <Building2 className="h-2.5 w-2.5" />{" "}
                        {student.hostel_name || "No Allocation"}
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-300 shrink-0" />
                  </div>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Add Student Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Student</DialogTitle>
            <DialogDescription>
              Add a new student to the system. They can complete their profile
              later.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateStudent} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                placeholder="e.g., John Doe"
                value={newStudent.full_name}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, full_name: e.target.value })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="matric_number">Matric Number</Label>
              <Input
                id="matric_number"
                placeholder="e.g., CSC/2021/001"
                value={newStudent.matric_number}
                onChange={(e) =>
                  setNewStudent({
                    ...newStudent,
                    matric_number: e.target.value.toUpperCase(),
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="level">Academic Level</Label>
              <Select
                value={newStudent.level.toString()}
                onValueChange={(val) =>
                  setNewStudent({ ...newStudent, level: parseInt(val) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">100 Level</SelectItem>
                  <SelectItem value="200">200 Level</SelectItem>
                  <SelectItem value="300">300 Level</SelectItem>
                  <SelectItem value="400">400 Level</SelectItem>
                  <SelectItem value="500">500 Level</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Add Student
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Batch Import Dialog */}
      <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batch Import Students</DialogTitle>
            <DialogDescription>
              Paste a JSON array of student objects. Each student must have
              full_name, matric_number, and level.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBatchCreate} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="batch_data">JSON Data</Label>
              <textarea
                id="batch_data"
                className="flex min-h-[200px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder={`[\n  {\n    "full_name": "John Doe",\n    "matric_number": "CSC/2021/001",\n    "level": 100\n  },\n  {\n    "full_name": "Jane Doe",\n    "matric_number": "CSC/2021/002",\n    "level": 200\n  }\n]`}
                value={batchData}
                onChange={(e) => setBatchData(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Import Students
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-[95vw] sm:max-w-md rounded-2xl p-0 overflow-hidden border shadow-2xl bg-white dark:bg-slate-900">
          {viewingStudent && (
            <div className="relative">
              <div className="h-24 bg-gradient-to-r from-blue-600 to-indigo-600" />
              <div className="px-6 pb-6 pt-0 -mt-12 text-center">
                <Avatar className="h-24 w-24 mx-auto border-4 border-white dark:border-slate-950 shadow-xl mb-4">
                  <AvatarImage
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${viewingStudent.full_name}`}
                  />
                  <AvatarFallback className="text-2xl font-black bg-blue-100 dark:bg-blue-900">
                    {viewingStudent.full_name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {viewingStudent.full_name}
                </h3>
                <p className="text-sm text-muted-foreground font-medium mb-6">
                  {viewingStudent.email}
                </p>

                <div className="grid grid-cols-2 gap-3 text-left">
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-widest">
                      Matric Number
                    </p>
                    <p className="text-sm font-bold truncate text-slate-900 dark:text-white">
                      {viewingStudent.matric_number || "Not Assigned"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-widest">
                      Academic Level
                    </p>
                    <p className="text-sm font-bold truncate text-slate-900 dark:text-white">
                      {viewingStudent.level} Level
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-widest">
                      Assigned Hostel
                    </p>
                    <p className="text-sm font-bold truncate text-slate-900 dark:text-white">
                      {viewingStudent.hostel_name || "Not Assigned"}
                    </p>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                    <p className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 mb-1 tracking-widest">
                      Room Number
                    </p>
                    <p className="text-sm font-bold truncate text-slate-900 dark:text-white">
                      {viewingStudent.room_number || "Not Assigned"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col gap-2">
                  <Button
                    className="w-full font-bold h-11"
                    variant="secondary"
                    onClick={() => setIsViewDialogOpen(false)}
                  >
                    Close Profile
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Internal icon proxy
const Hash = ({ className }: { className?: string }) => (
  <span className={className}>#</span>
);

export default Students;
