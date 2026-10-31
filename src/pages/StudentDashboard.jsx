import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';
import { PlusCircle, Clock, CheckCircle, RefreshCw, MapPin, Tag, MessageSquare, X } from 'lucide-react';
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
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${styles[priority] || styles.low}`}>
      {priority} Priority
    </span>
  );
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('hostel');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Modal State
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data);
    } catch (err) {
      toast.error('Failed to load complaints');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category);
      formData.append('description', description);
      formData.append('location', location);
      formData.append('isAnonymous', isAnonymous);

      await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Complaint submitted successfully');
      setShowForm(false);
      fetchComplaints();
      setTitle(''); setDescription(''); setLocation(''); setIsAnonymous(false);
    } catch (err) {
      toast.error('Submission failed');
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
      toast.success('Message sent');
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

  const pendingCount = complaints.filter(c => c.status === 'pending').length;
  const inProgressCount = complaints.filter(c => c.status === 'in progress').length;
  const resolvedCount = complaints.filter(c => c.status === 'resolved').length;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6 relative">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Student Portal</h1>
            <p className="text-slate-500 mt-1">Track your submitted issues and their resolutions.</p>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transform hover:-translate-y-0.5 transition-all duration-200"
          >
            <PlusCircle className="w-5 h-5" />
            <span className="font-semibold text-sm tracking-wide">{showForm ? "Cancel Submission" : "New Complaint"}</span>
          </button>
        </div>

        {/* Form Overlay */}
        {showForm && (
          <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200/80 animate-fade-in relative z-10 transition-all duration-300">
            <h3 className="text-xl font-bold mb-6 text-slate-800">Submit an Issue</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Title</label>
                  <input type="text" required value={title} onChange={e=>setTitle(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-colors" placeholder="e.g. Broken Fan in Room 204" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category</label>
                  <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-colors">
                    <option value="hostel">Hostel</option>
                    <option value="mess">Mess</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="academic">Academic</option>
                    <option value="transport">Transport</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Location</label>
                <input type="text" required value={location} onChange={e=>setLocation(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-colors" placeholder="e.g. Block A, Room 204" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Description</label>
                <textarea required value={description} onChange={e=>setDescription(e.target.value)} rows="3" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-colors" placeholder="Please provide detailed information..."></textarea>
              </div>
              <div className="flex items-center pt-2">
                <input type="checkbox" id="anon" checked={isAnonymous} onChange={e=>setIsAnonymous(e.target.checked)} className="h-5 w-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 transition-colors cursor-pointer" />
                <label htmlFor="anon" className="ml-3 text-sm font-medium text-slate-700 cursor-pointer select-none">Submit Anonymously</label>
              </div>
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-slate-100">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-colors">Submit Complaint</button>
              </div>
            </form>
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="bg-yellow-50 p-3.5 rounded-xl border border-yellow-100">
                <Clock className="w-7 h-7 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Pending</p>
                <p className="text-2xl font-bold text-slate-800">{pendingCount}</p>
              </div>
           </div>
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-100">
                <RefreshCw className="w-7 h-7 text-purple-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">In Progress</p>
                <p className="text-2xl font-bold text-slate-800">{inProgressCount}</p>
              </div>
           </div>
           <div className="bg-white rounded-2xl shadow-sm border border-slate-200/60 p-5 flex items-center space-x-4 hover:shadow-md transition-shadow">
              <div className="bg-green-50 p-3.5 rounded-xl border border-green-100">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Resolved</p>
                <p className="text-2xl font-bold text-slate-800">{resolvedCount}</p>
              </div>
           </div>
        </div>


        {/* Complaints List grid */}
        <div className="pt-4 mt-8">
           <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
             Your History
           </h3>
           
           {complaints.length === 0 ? (
             <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center">
               <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle className="w-8 h-8 text-slate-400" />
               </div>
               <h4 className="text-lg font-semibold text-slate-700">No issues reported</h4>
               <p className="text-slate-500 mt-1">You haven't filed any complaints yet.</p>
             </div>
           ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
               {complaints.map(comp => (
                 <div key={comp._id} onClick={() => openComplaintModal(comp._id)} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md cursor-pointer transition-shadow relative overflow-hidden group">
                   {/* Top badge */}
                   <div className="flex justify-between items-start mb-3">
                     <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${comp.status === 'resolved' ? 'bg-green-100 text-green-700' : 
                          comp.status === 'in progress' ? 'bg-purple-100 text-purple-700' : 'bg-yellow-100 text-yellow-700'}
                     `}>
                       {comp.status}
                     </span>
                     <div className="flex flex-col items-end gap-1">
                       <span className="text-xs font-mono text-slate-400 font-medium">#{comp.ticketId.split('-')[1]}</span>
                       <PriorityBadge priority={comp.priority} />
                     </div>
                   </div>
                   
                   <h4 className="text-lg font-bold text-slate-800 leading-tight mb-2 group-hover:text-blue-600 transition-colors pr-12">{comp.title}</h4>
                   <p className="text-slate-600 text-sm line-clamp-2 mb-4">{comp.description}</p>
                   
                   <div className="flex items-center gap-4 text-xs font-medium text-slate-500 mt-auto pt-4 border-t border-slate-100">
                     <div className="flex items-center gap-1.5">
                       <Tag className="w-4 h-4 text-slate-400" />
                       <span className="capitalize">{comp.category}</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                       <MapPin className="w-4 h-4 text-slate-400" />
                       <span className="truncate max-w-[150px]">{comp.location}</span>
                     </div>
                     <div className="flex items-center gap-1.5 ml-auto text-blue-500 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                       <MessageSquare className="w-4 h-4" /> View Details
                     </div>
                   </div>
                 </div>
               ))}
             </div>
           )}
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
                   <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider
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
                    <span>Date: <span className="font-semibold text-slate-700">{new Date(selectedComplaint.createdAt).toLocaleDateString()}</span></span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <p className="text-slate-700 whitespace-pre-wrap">{selectedComplaint.description}</p>
                  </div>
                </div>

                {/* Comments Section */}
                <div>
                  <h4 className="text-base font-bold text-slate-800 mb-4 flex items-center">
                    <MessageSquare className="w-5 h-5 mr-2 text-slate-400" /> Discussion & Updates
                  </h4>
                  
                  <div className="space-y-4 mb-6">
                    {selectedComplaint.comments?.length > 0 ? selectedComplaint.comments.map((comment, idx) => (
                      <div key={idx} className={`flex flex-col p-4 rounded-xl border ${comment.addedBy?.role === 'student' ? 'bg-blue-50/50 border-blue-100 ml-8' : 'bg-slate-50 border-slate-100 mr-8'}`}>
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-xs font-bold text-slate-700 flex items-center">
                            {comment.addedBy?.name || 'User'}
                            {comment.addedBy?.role === 'admin' && <span className="ml-2 text-[10px] bg-indigo-100 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Admin</span>}
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
                       placeholder="Add a comment or ask for an update..."
                       className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none resize-none transition-all shadow-sm"
                       rows="2"
                     />
                     <button 
                       type="submit" 
                       disabled={isSubmittingComment}
                       className="bg-slate-900 hover:bg-slate-800 text-white px-5 rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-70"
                     >
                       {isSubmittingComment ? 'Sending...' : 'Send message'}
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

export default StudentDashboard;
