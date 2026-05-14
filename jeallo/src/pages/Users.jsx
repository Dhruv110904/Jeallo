import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import { 
  UserPlus, Search, Mail, Building2, 
  ShieldCheck, MoreVertical, X, Loader2,
  Fingerprint, Briefcase, User as UserIcon,
  Phone, MapPin, Calendar, DollarSign,
  Trash2, Edit, AlertCircle, PhoneCall, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function Users() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const { data: users, isLoading } = useQuery({
    queryKey: ['users', searchQuery],
    queryFn: () => api.get('/v1/users', { params: { search: searchQuery } }).then(res => res.data),
  });

  const createEmployeeMutation = useMutation({
    mutationFn: (newEmployee) => api.post('/v1/users', newEmployee),
    onSuccess: (response) => {
      console.log('Employee Created:', response.data);
      queryClient.invalidateQueries(['users']);
      setIsModalOpen(false);
      toast.success(`Employee Created! ID: ${response.data.employee_id || response.data.user?.employee_id}`);
    },
    onError: (error) => {
      console.error('Creation Error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to create employee');
    }
  });

  const updateEmployeeMutation = useMutation({
    mutationFn: ({id, ...data}) => api.put(`/v1/users/${id}`, data),
    onSuccess: (response) => {
      console.log('Employee Updated:', response.data);
      queryClient.invalidateQueries(['users']);
      setEditingUser(null);
      toast.success('Employee updated successfully');
    },
    onError: (error) => {
      console.error('Update Error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to update employee');
    }
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: (id) => api.delete(`/v1/users/${id}`),
    onSuccess: (response) => {
      console.log('Employee Deleted:', response.data);
      queryClient.invalidateQueries(['users']);
      toast.success('Employee deleted successfully');
    },
    onError: (error) => {
      console.error('Delete Error:', error.response?.data);
      toast.error(error.response?.data?.message || 'Failed to delete employee');
    }
  });

  const handleAddEmployee = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    // Format emergency contacts as array
    data.emergency_contacts = [
        { name: data.ec_name, phone: data.ec_phone, relation: data.ec_relation }
    ];
    createEmployeeMutation.mutate(data);
  };

  const handleUpdateEmployee = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    data.emergency_contacts = [
        { name: data.ec_name, phone: data.ec_phone, relation: data.ec_relation }
    ];
    updateEmployeeMutation.mutate({ id: editingUser.id, ...data });
  };

  const confirmDelete = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
        deleteEmployeeMutation.mutate(id);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team Directory</h1>
          <p className="text-slate-500 font-medium">Full lifecycle management for employee records and identity.</p>
        </div>
        <button 
          onClick={() => {
            console.log('Opening Add Employee Modal');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 bg-jeallo-gradient text-white px-6 py-3 rounded-2xl text-sm font-black shadow-lg shadow-jeallo-primary/20 transition-all hover:scale-105 active:scale-95"
        >
          <UserPlus className="w-5 h-5" />
          Add Employee
        </button>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-slate-100 p-4 rounded-3xl flex flex-wrap items-center gap-4 shadow-sm">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, ID, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border-none rounded-2xl py-3 pl-12 pr-4 text-slate-900 text-sm focus:ring-2 focus:ring-jeallo-primary/20 outline-none transition-all placeholder:text-slate-400 font-medium"
          />
        </div>
        <div className="flex gap-3">
          <select className="bg-slate-50 border-none rounded-2xl py-3 px-6 text-slate-600 text-sm font-bold outline-none cursor-pointer focus:ring-2 focus:ring-jeallo-primary/20">
            <option>All Departments</option>
            <option>Engineering</option>
            <option>Marketing</option>
            <option>Operations</option>
          </select>
        </div>
      </div>

      {/* Grid of Users */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          [1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-72 bg-white border border-slate-100 rounded-[2.5rem] animate-pulse"></div>
          ))
        ) : (
          users?.data
            ?.filter(u => u.role !== 'super_admin')
            .map((user) => (
            <div key={user.id} className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-jeallo-primary/5 to-jeallo-orange/5 rounded-bl-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div className="relative">
                   <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center overflow-hidden border border-slate-100">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-2xl font-black text-jeallo-primary uppercase">{user.name.charAt(0)}</span>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-white p-1.5 rounded-lg shadow-md border border-slate-50">
                    <Fingerprint className="w-4 h-4 text-jeallo-orange" />
                  </div>
                </div>
                <div className="flex gap-1">
                    {user.id !== currentUser?.id && (
                        <>
                            <button 
                                onClick={() => setEditingUser(user)}
                                className="p-2 hover:bg-slate-50 rounded-xl text-slate-300 hover:text-jeallo-primary transition-all"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => confirmDelete(user.id, user.name)}
                                className="p-2 hover:bg-red-50 rounded-xl text-slate-300 hover:text-red-500 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xl font-black text-slate-900 group-hover:text-jeallo-primary transition-colors">{user.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">ID: {user.employee_id}</span>
                  <span className="text-slate-400 font-bold text-xs">• {user.designation || 'Team Member'}</span>
                </div>
              </div>

              <div className="space-y-3 pt-6 border-t border-slate-50">
                <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                  <Briefcase className="w-4 h-4 text-slate-400" />
                  {user.department || 'General'}
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                  <Mail className="w-4 h-4 text-slate-400" />
                  {user.email}
                </div>
                <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 text-jeallo-primary" />
                  <span className="capitalize">{user.roles?.[0]?.replace('_', ' ') || 'User'}</span>
                </div>
                {user.phone && (
                    <div className="flex items-center gap-3 text-slate-500 text-xs font-bold">
                        <Phone className="w-4 h-4 text-slate-400" />
                        {user.phone}
                    </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Employee Modal */}
      {(isModalOpen || editingUser) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 my-8">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {editingUser ? 'Update Employee Profile' : 'Create New Employee'}
                </h2>
                <p className="text-slate-500 text-sm font-medium">
                    {editingUser ? `Editing ${editingUser.name}` : 'Detailed professional and personal records.'}
                </p>
              </div>
              <button 
                onClick={() => { setIsModalOpen(false); setEditingUser(null); }}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={editingUser ? handleUpdateEmployee : handleAddEmployee} className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Basic Info */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-jeallo-primary border-l-4 border-jeallo-primary pl-3">Professional Identity</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="col-span-2">
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Full Name</label>
                        <div className="relative">
                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input name="name" defaultValue={editingUser?.name} type="text" required className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none" placeholder="John Doe" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input name="email" defaultValue={editingUser?.email} type="email" required className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none" placeholder="john@example.com" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input name="phone" defaultValue={editingUser?.phone} type="text" className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none" placeholder="+1 234 567 890" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Department</label>
                        <select 
                            name="department" 
                            defaultValue={editingUser?.department || 'Engineering'} 
                            className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none cursor-pointer"
                        >
                            <option value="Engineering">Engineering</option>
                            <option value="Marketing">Marketing</option>
                            <option value="Operations">Operations</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Designation</label>
                        <input name="designation" defaultValue={editingUser?.designation} type="text" className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none" placeholder="e.g. Senior Dev" />
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Role</label>
                        <select name="role" defaultValue={editingUser?.roles?.[0] || 'employee'} className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none cursor-pointer">
                            <option value="employee">Employee</option>
                            <option value="manager">Manager</option>
                            <option value="super_admin">Super Admin</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Salary (Annual)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input name="salary" defaultValue={editingUser?.salary} type="number" className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none" placeholder="85000" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Joining Date</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input name="joining_date" defaultValue={editingUser?.joining_date} type="date" className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none" />
                        </div>
                    </div>

                    {!editingUser && (
                        <div className="col-span-2">
                            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Temporary Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input name="password" type="text" defaultValue="Jeallo@123" className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none" />
                            </div>
                        </div>
                    )}
                </div>
              </div>

              {/* Personal Info */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-jeallo-orange border-l-4 border-jeallo-orange pl-3">Personal Details</h3>
                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Resident Address</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                            <textarea name="address" defaultValue={editingUser?.address} rows={3} className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none resize-none" placeholder="123 Silicon Valley, CA"></textarea>
                        </div>
                    </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-500 border-l-4 border-red-500 pl-3">Emergency Contact</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Contact Name</label>
                        <input name="ec_name" defaultValue={editingUser?.emergency_contacts?.[0]?.name} type="text" className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none" placeholder="Jane Doe" />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Relation</label>
                        <input name="ec_relation" defaultValue={editingUser?.emergency_contacts?.[0]?.relation} type="text" className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none" placeholder="Spouse" />
                    </div>
                    <div>
                        <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2 ml-1">Phone</label>
                        <div className="relative">
                            <PhoneCall className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input name="ec_phone" defaultValue={editingUser?.emergency_contacts?.[0]?.phone} type="text" className="w-full bg-slate-50 border-none rounded-2xl py-3.5 pl-12 pr-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-jeallo-primary/20 outline-none" placeholder="+1 999..." />
                        </div>
                    </div>
                </div>
              </div>

              <div className="pt-8">
                <button 
                  type="submit"
                  disabled={createEmployeeMutation.isPending || updateEmployeeMutation.isPending}
                  className="w-full bg-jeallo-gradient text-white font-black py-5 rounded-2xl shadow-xl shadow-jeallo-primary/20 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 text-lg uppercase tracking-widest"
                >
                  {(createEmployeeMutation.isPending || updateEmployeeMutation.isPending) ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    editingUser ? 'Update Employee Record' : 'Create Employee Profile'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
