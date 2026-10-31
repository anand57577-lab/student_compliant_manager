import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Clock, CheckCircle, RefreshCw, Users, FileText, Filter, MessageSquare, AlertTriangle, X } from 'lucide-react';
import Layout from '../components/common/Layout';
import { useAuth } from '../context/AuthContext';

const PriorityBadge = ({ priority }) => {
  const styles = {
    low: 'bg-slate-100 text-slate-600',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    critical: 'bg-red-100 text-red-700'
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${styles[priority] || styles.low}`}>
      {priority}
    </span>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterStatus, filterCategory]);

  const fetchData = async () => {
    try {
      const statsRes = await api.get('/analytics');
      setStats(statsRes.data);

      let query = '?';
      if (filterStatus) query += `status=${filterStatus}&`;
      if (filterCategory) query += `category=${filterCategory}`;
      
      const compRes = await api.get(`/complaints${query}`);
      setComplaints(compRes.data);
    } catch (err) {
      toast.error('Failed to load dashboard data');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/complaints/${id}/status`, { status });
      toast.success('Status updated');
      
      // Update local state for modal if open
      if (selectedComplaint && selectedComplaint._id === id) {
        setSelectedComplaint(prev => ({ ...prev, status }));
      }
      fetchData();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setIsSubmittingComment(true);
    try {
      const res = await api.post(`/complaints/${selectedComplaint._id}/comments`, { text: commentText });
      setSelectedComplaint(res.data);
      setCommentText('');
      toast.success('Reply added');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const openComplaintModal = async (id) => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setSelectedComplaint(res.data);
    } catch (err) {
      toast.error('Failed to fetch details');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-6 relative">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Analytics</h1>
            <p className="text-slate-500 mt-1">Overview of all student reported issues across the campus.</p>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-in-up">
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between relative z-10">
                 <div>
                   <p className="text-slate-500 font-medium text-sm">Total Reports</p>
                   <p className="text-3xl font-bold text-slate-800 mt-1">{stats.total}</p>
                 </div>
                 <div className="bg-blue-50 p-3.5 rounded-xl border border-blue-100 group-hover:bg-blue-600 transition-colors">
                   <Users className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors" />
                 </div>
               </div>
             </div>
             
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between relative z-10">
                 <div>
                   <p className="text-slate-500 font-medium text-sm">Pending</p>
                   <p className="text-3xl font-bold text-slate-800 mt-1">{stats.pending}</p>
                 </div>
                 <div className="bg-yellow-50 p-3.5 rounded-xl border border-yellow-100 group-hover:bg-yellow-500 transition-colors">
                   <Clock className="w-6 h-6 text-yellow-500 group-hover:text-white transition-colors" />
                 </div>
               </div>
             </div>
             
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between relative z-10">
                 <div>
                   <p className="text-slate-500 font-medium text-sm">In Progress</p>
                   <p className="text-3xl font-bold text-slate-800 mt-1">{stats.inProgress}</p>
                 </div>
                 <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-100 group-hover:bg-purple-500 transition-colors">
                   <RefreshCw className="w-6 h-6 text-purple-500 group-hover:text-white transition-colors" />
                 </div>
               </div>
             </div>
             
             <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 relative overflow-hidden group hover:shadow-md transition-shadow">
               <div className="flex items-center justify-between relative z-10">
                 <div>
                   <p className="text-slate-500 font-medium text-sm">Resolved</p>
                   <p className="text-3xl font-bold text-slate-800 mt-1">{stats.resolved}</p>
                 </div>
                 <div className="bg-green-50 p-3.5 rounded-xl border border-green-100 group-hover:bg-green-500 transition-colors">
                   <CheckCircle className="w-6 h-6 text-green-500 group-hover:text-white transition-colors" />
                 </div>
               </div>
             </div>
          </div>
        )}

        {/* Main Grid: Chart & Table side by side or stacked */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Chart Section */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 flex flex-col items-center justify-center">
             <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center w-full justify-start">
               <FileText className="w-5 h-5 mr-2 text-slate-400" />
               Category Breakdown
             </h3>
             {stats && stats.categories && (
               <div className="h-64 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={stats.categories} layout="vertical" margin={{ top: 0, right: 0, left: 20, bottom: 0 }}>
                     <XAxis type="number" hide />
                     <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 13, textTransform: 'capitalize'}} width={100} />
                     <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                     <Bar dataKey="value" fill="#3b82f6" radius={[0, 6, 6, 0]} barSize={28}>
                       {stats.categories.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#f43f5e'][index % 5]} />
                       ))}
                     </Bar>
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             )}
          </div>

          {/* Table Section */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200/60 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800 flex items-center">
                Tickets Management
              </h3>
              <div className="flex space-x-3 items-center">
                <Filter className="w-5 h-5 text-slate-400 hidden md:block" />
                <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-slate-600">
                  <option value="">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
                <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="bg-white border border-slate-200 text-sm rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 shadow-sm text-slate-600">
                  <option value="">All Categories</option>
                  <option value="hostel">Hostel</option>
                  <option value="mess">Mess</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="academic">Academic</option>
                  <option value="transport">Transport</option>
                </select>
              </div>
            </div>
            
            <div className="overflow-x-auto flex-1 h-[400px] overflow-y-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-200/80 sticky top-0 z-10">
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm">Ticket / Reporter</th>
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm">Issue Details</th>
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/90 backdrop-blur-sm">Priority & Status</th>
                    <th className="px-5 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right bg-slate-50/90 backdrop-blur-sm">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {complaints.length > 0 ? complaints.map(comp => (
                    <tr key={comp._id} className="hover:bg-slate-50/80 transition-colors group cursor-pointer" onClick={() => openComplaintModal(comp._id)}>
                      <td className="px-5 py-4">
                        <div className="font-mono text-xs text-slate-500 mb-1">{comp.ticketId}</div>
                        <div className="text-sm font-medium text-slate-700">
                          {comp.isAnonymous ? <span className="italic text-slate-400">Anonymous</span> : comp.studentId?.name || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-bold text-slate-800 line-clamp-1 group-hover:text-blue-600 transition-colors">{comp.title}</div>
                        <div className="text-xs text-slate-500 mt-1 capitalize">{comp.category} • {comp.location}</div>
                      </td>
                      <td className="px-5 py-4">
                         <div className="flex flex-col space-y-1 items-start">
                           <PriorityBadge priority={comp.priority} />
                           <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider
                              ${comp.status === 'resolved' ? 'text-green-700' : 
                                comp.status === 'in progress' ? 'text-purple-700' : 'text-yellow-700'}
                           `}>
                             {comp.status}
                           </span>
                         </div>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2" onClick={(e) => e.stopPropagation()}>
                         <button onClick={() => openComplaintModal(comp._id)} className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors mr-2">
                           <MessageSquare className="w-3.5 h-3.5 mr-1" /> Reply
                         </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-5 py-12 text-center text-slate-500">
                        {stats?.total === 0 ? "No complaints in the system yet." : "No complaints found matching the filters."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Complaint Detail & Comment Modal */}
        {selectedComplaint && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in-up">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center space-x-3">
                  <h2 className="text-lg font-bold text-slate-800 tracking-tight">{selectedComplaint.ticketId}</h2>
                  <PriorityBadge priority={selectedComplaint.priority} />
                   <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider
                      ${selectedComplaint.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                        selectedComplaint.status === 'in progress' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}
                   `}>
                     {selectedComplaint.status}
                   </span>
                </div>
                <button onClick={() => setSelectedComplaint(null)} className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-white">
                
                {/* Complaint Info */}
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedComplaint.title}</h3>
                  <div className="flex gap-4 text-sm text-slate-500 mb-4">
                    <span className="capitalize">Category: <span className="font-semibold text-slate-700">{selectedComplaint.category}</span></span>
                    <span>Location: <span className="font-semibold text-slate-700">{selectedComplaint.location}</span></span>
                    <span>Reporter: <span className="font-semibold text-slate-700">{selectedComplaint.isAnonymous ? 'Anonymous' : selectedComplaint.studentId?.name || 'Unknown'}</span></span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
                  </div>
                  
                  {/* Status Actions */}
                  <div className="mt-6 flex gap-3 border-t border-slate-100 pt-6">
                     <span className="text-sm font-semibold text-slate-700 flex items-center mr-2">Admin Actions:</span>
                     {selectedComplaint.status === 'pending' && (
                       <button onClick={() => updateStatus(selectedComplaint._id, 'in progress')} className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors cursor-pointer">Start Progress</button>
                     )}
                     {selectedComplaint.status === 'in progress' && (
                       <button onClick={() => updateStatus(selectedComplaint._id, 'resolved')} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-700 rounded-lg shadow-sm transition-colors cursor-pointer">Mark as Resolved</button>
                     )}
                     {(selectedComplaint.status !== 'pending' && selectedComplaint.status !== 'in progress') && (
                        <span className="text-sm text-slate-500 italic flex items-center">No further status actions available.</span>
                     )}
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-slate-400" /> Discussion & Updates
                  </h4>
                  
                  <div className="space-y-4 mb-6">
                    {selectedComplaint.comments?.length > 0 ? selectedComplaint.comments.map((comment, idx) => (
                      <div key={idx} className={`flex flex-col p-4 rounded-xl border ${comment.addedBy?.role === 'admin' ? 'bg-blue-50/50 border-blue-100 ml-8' : 'bg-slate-50 border-slate-100 mr-8'}`}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-slate-700 flex items-center">
                            {comment.addedBy?.name || 'System User'}
                            {comment.addedBy?.role === 'admin' && <span className="ml-2 text-[10px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded uppercase">Admin</span>}
                          </span>
                          <span className="text-xs text-slate-400">{new Date(comment.createdAt).toLocaleString()}</span>
                        </div>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap">{comment.text}</p>
                      </div>
                    )) : (
                      <div className="text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500 text-sm">
                        No updates or comments yet.
                      </div>
                    )}
                  </div>

                  {/* Add Comment Tool */}
                  <form onSubmit={handleAddComment} className="flex gap-3">
                     <textarea 
                       required
                       value={commentText}
                       onChange={e=>setCommentText(e.target.value)}
                       placeholder="Write an update or reply to the student..."
                       className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none transition-all shadow-sm"
                       rows="2"
                     />
                     <button 
                       type="submit" 
                       disabled={isSubmittingComment}
                       className="bg-slate-900 hover:bg-slate-800 text-white px-5 rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-70"
                     >
                       {isSubmittingComment ? 'Sending...' : 'Send Reply'}
                     </button>
                  </form>
                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default AdminDashboard;
