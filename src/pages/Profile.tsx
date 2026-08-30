import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, saveUserProfile, type UserProfile } from '../lib/profile';
import { getUserResumes } from '../lib/resume';
import type { Resume } from '../types/resume';
import { User, Briefcase, MapPin, Wallet, GraduationCap, Star, ArrowLeft, Loader2, BookOpen, Edit2, Save, X, Upload, FileText, Download } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { Shader, FlutedGlass, FilmGrain } from 'shaders/react';
import { ResumePreview } from '../components/Resume/ResumePreview';

export const DEFAULT_AVATARS = [
  '/avatars/avatar1.png',
  '/avatars/avatar2.png',
  '/avatars/avatar3.png',
  'https://api.dicebear.com/7.x/micah/svg?seed=Felix&backgroundColor=4642ff',
  'https://api.dicebear.com/7.x/micah/svg?seed=Aneka&backgroundColor=56c2fc',
  'https://api.dicebear.com/7.x/micah/svg?seed=Jude&backgroundColor=7f66ff',
  'https://api.dicebear.com/7.x/micah/svg?seed=Sara&backgroundColor=171720',
  'https://api.dicebear.com/7.x/micah/svg?seed=Sam&backgroundColor=4642ff',
  'https://api.dicebear.com/7.x/micah/svg?seed=Buster&backgroundColor=56c2fc',
  'https://api.dicebear.com/7.x/micah/svg?seed=Mimi&backgroundColor=7f66ff'
];

export default function Profile() {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [inputs, setInputs] = useState({
    targetRoles: '',
    skills: '',
    companyType: ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Computed avatar logic
  const activeAvatar = profile?.profile_picture || currentUser?.photoURL || DEFAULT_AVATARS[0];
  const editAvatar = editForm.profile_picture || currentUser?.photoURL || DEFAULT_AVATARS[0];

  useEffect(() => {
    if (!currentUser) {
      navigate('/auth');
      return;
    }

    async function loadProfile() {
      try {
        const [data, userResumes] = await Promise.all([
          getUserProfile(currentUser!.uid),
          getUserResumes(currentUser!.uid)
        ]);
        setProfile(data);
        setResumes(userResumes);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    
    loadProfile();
  }, [currentUser, navigate]);

  const handleEditClick = () => {
    setEditForm(profile || {});
    setInputs({
      targetRoles: profile?.target_roles?.join(', ') || '',
      skills: profile?.skills?.join(', ') || '',
      companyType: profile?.company_preferences?.join(', ') || ''
    });
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({});
  };

  const handleSave = async () => {
    if (!currentUser) return;
    setIsSaving(true);
    try {
      await saveUserProfile(currentUser.uid, editForm);
      setProfile(editForm as UserProfile);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert('Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setEditForm({ ...editForm, profile_picture: event.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  if (!currentUser) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#4642ff]" />
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] text-white font-sans antialiased selection:bg-[#4642ff] selection:text-white min-h-screen relative overflow-hidden flex flex-col">
      {/* Background Shader */}
      <div className="fixed inset-0 z-0 pointer-events-none" aria-hidden="true">
        <Shader style={{ width: '100%', height: '100%', display: 'block' }}>
          <FlutedGlass aberration={0.61} angle={31} frequency={8} highlight={0.15} highlightSoftness={0} lightAngle={-90} refraction={4} shape="rounded" softness={1} speed={0.15} />
          <FilmGrain strength={0.05} />
        </Shader>
      </div>

      {/* Header */}
      <header className="relative z-20 flex items-center justify-between px-6 py-7 sm:px-12 border-b border-white/10 bg-black/20 backdrop-blur-md">
        <Link to="/" className="flex items-center gap-2 text-xl font-medium tracking-tight text-white hover:text-white/80 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Feed</span>
        </Link>
        <button onClick={() => logout()} className="shrink-0 rounded-full bg-white/10 text-white px-5 py-2 text-sm font-medium hover:bg-white/20 transition-colors">
          Log Out
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-20 flex-grow max-w-4xl w-full mx-auto px-6 py-12 sm:px-12 pb-24">
        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 backdrop-blur-sm shadow-2xl relative">
          
          {/* Action Buttons */}
          <div className="flex justify-end w-full mb-8 sm:mb-2 sm:absolute sm:top-8 sm:right-8 gap-3 z-10">
            {!isEditing ? (
              <button 
                onClick={handleEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-colors"
              >
                <Edit2 className="w-4 h-4" /> Edit Profile
              </button>
            ) : (
              <>
                <button 
                  onClick={handleCancelEdit}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium transition-colors text-white/70 hover:text-white"
                >
                  <X className="w-4 h-4" /> Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4642ff] hover:bg-[#5b4fff] rounded-full text-sm font-medium transition-colors text-white disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save
                </button>
              </>
            )}
          </div>

          {/* Top Section: Avatar & Basic Info */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-8 border-b border-white/10 pb-10 mt-2 sm:mt-0">
            
            <div className="shrink-0 flex flex-col items-center gap-4">
              <div className="relative group">
                <img 
                  src={isEditing ? editAvatar : activeAvatar} 
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-[#4642ff]/30 shadow-lg bg-black"
                  onError={(e) => { e.currentTarget.src = DEFAULT_AVATARS[0]; }}
                />
                {isEditing && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 bg-black/60 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Upload className="w-6 h-6 text-white mb-1" />
                    <span className="text-xs font-medium">Upload</span>
                  </button>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleAvatarUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            </div>
            
            <div className="text-center sm:text-left pt-2 flex-grow">
              {isEditing ? (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-white/50 mb-1">Display Name</label>
                  <input 
                    type="text" 
                    value={editForm.username || ''}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full sm:max-w-md bg-black/40 border border-white/10 rounded-xl px-4 py-2 text-xl font-semibold focus:outline-none focus:border-[#4642ff]"
                    placeholder="Your Name"
                  />
                </div>
              ) : (
                <h1 className="text-4xl font-semibold mb-2">{profile?.username || currentUser.displayName || 'No Name Provided'}</h1>
              )}
              
              <p className="text-white/60 text-lg mb-4">{currentUser.email}</p>
              
              {!isEditing && (
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                  {profile?.experience_level && (
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-[#56c2fc]" />
                      {profile.experience_level} ({profile.experience_years} years)
                    </span>
                  )}
                  {profile?.location && (
                    <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-medium flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-rose-400" />
                      {profile.location.city || profile.location.country || 'Remote'}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Avatar Selector in Edit Mode */}
          {isEditing && (
            <div className="pt-8 pb-4 border-b border-white/10">
              <h3 className="text-sm font-medium text-white/70 mb-4">Choose a 3D Avatar</h3>
              <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {DEFAULT_AVATARS.map((avatar, idx) => (
                  <button
                    key={idx}
                    onClick={() => setEditForm({ ...editForm, profile_picture: avatar })}
                    className={`shrink-0 snap-center rounded-full overflow-hidden border-2 transition-all ${editAvatar === avatar ? 'border-[#4642ff] scale-110 shadow-[0_0_15px_rgba(70,66,255,0.5)]' : 'border-transparent hover:border-white/30'}`}
                  >
                    <img src={avatar} alt={`Avatar ${idx+1}`} className="w-16 h-16 object-cover bg-black/20" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Detailed Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10">
            
            {/* Roles & Career */}
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#4642ff]" />
                  Target Roles
                </h2>
                {isEditing ? (
                  <div>
                    <input 
                      type="text" 
                      value={inputs.targetRoles}
                      onChange={(e) => {
                        setInputs({ ...inputs, targetRoles: e.target.value });
                        setEditForm({ ...editForm, target_roles: e.target.value.split(',').map(s => s.trim()).filter(Boolean) });
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4642ff]"
                      placeholder="e.g. Frontend Developer, UI Designer (comma separated)"
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.target_roles?.length ? (
                      profile.target_roles.map((role, i) => (
                        <span key={i} className="px-3 py-1.5 bg-[#4642ff]/20 text-[#7f66ff] border border-[#4642ff]/30 rounded-lg text-sm">{role}</span>
                      ))
                    ) : (
                      <span className="text-white/40 italic">Not specified</span>
                    )}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#4642ff]" />
                  Skills
                </h2>
                {isEditing ? (
                  <div>
                    <input 
                      type="text" 
                      value={inputs.skills}
                      onChange={(e) => {
                        setInputs({ ...inputs, skills: e.target.value });
                        setEditForm({ ...editForm, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) });
                      }}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#4642ff]"
                      placeholder="e.g. React, TypeScript, Figma (comma separated)"
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {profile?.skills?.length ? (
                      profile.skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-sm">{skill}</span>
                      ))
                    ) : (
                      <span className="text-white/40 italic">Not specified</span>
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* Salary & Education */}
            <div className="space-y-8">
              <section>
                <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-emerald-400" />
                  Salary Expectations
                </h2>
                <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                  {isEditing ? (
                    <div className="flex items-center gap-3">
                      <select 
                        value={editForm.salary?.currency || 'USD'}
                        onChange={(e) => setEditForm({ ...editForm, salary: { ...editForm.salary!, currency: e.target.value } })}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="USD" className="bg-[#171720] text-white">USD ($)</option>
                        <option value="EUR" className="bg-[#171720] text-white">EUR (€)</option>
                        <option value="GBP" className="bg-[#171720] text-white">GBP (£)</option>
                        <option value="NGN" className="bg-[#171720] text-white">NGN (₦)</option>
                      </select>
                      <input 
                        type="number" 
                        value={editForm.salary?.minimum || ''}
                        onChange={(e) => setEditForm({ ...editForm, salary: { ...editForm.salary!, minimum: Number(e.target.value) || null } })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
                        placeholder="Minimum amount"
                      />
                      <span className="text-white/50">/</span>
                      <select 
                        value={editForm.salary?.period || 'hourly'}
                        onChange={(e) => setEditForm({ ...editForm, salary: { ...editForm.salary!, period: e.target.value } })}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-400"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="hourly" className="bg-[#171720] text-white">hr</option>
                        <option value="monthly" className="bg-[#171720] text-white">mo</option>
                        <option value="yearly" className="bg-[#171720] text-white">yr</option>
                      </select>
                    </div>
                  ) : (
                    <>
                      {profile?.salary?.minimum ? (
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-3xl font-semibold break-all">
                            {profile.salary.currency === 'USD' ? '$' : profile.salary.currency === 'EUR' ? '€' : profile.salary.currency === 'GBP' ? '£' : '₦'}
                            {profile.salary.minimum.toLocaleString()}
                          </span>
                          <div className="flex flex-col text-white/50 text-sm leading-tight">
                            <span>/ {profile.salary.period}</span>
                            <span>minimum</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-white/40 italic">Not specified</span>
                      )}
                    </>
                  )}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-medium mb-4 flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-amber-400" />
                  Education
                </h2>
                <div className="bg-black/20 rounded-2xl p-5 border border-white/5">
                  {isEditing ? (
                    <div className="space-y-3">
                      <select 
                        value={editForm.education?.level || ''}
                        onChange={(e) => setEditForm({ ...editForm, education: { ...editForm.education!, level: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="" disabled className="bg-[#171720] text-white">Highest level</option>
                        <option value="High school" className="bg-[#171720] text-white">High school</option>
                        <option value="Diploma" className="bg-[#171720] text-white">Diploma</option>
                        <option value="Bachelor's" className="bg-[#171720] text-white">Bachelor's</option>
                        <option value="Master's" className="bg-[#171720] text-white">Master's</option>
                        <option value="PhD" className="bg-[#171720] text-white">PhD</option>
                      </select>
                      <input 
                        type="text" 
                        value={editForm.education?.field || ''}
                        onChange={(e) => setEditForm({ ...editForm, education: { ...editForm.education!, field: e.target.value } })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-amber-400"
                        placeholder="Field of study (e.g. Computer Science)"
                      />
                    </div>
                  ) : (
                    <>
                      {profile?.education?.level ? (
                        <div>
                          <div className="font-medium text-lg">{profile.education.level}</div>
                          {profile.education.field && <div className="text-white/60 mt-1">{profile.education.field}</div>}
                        </div>
                      ) : (
                        <span className="text-white/40 italic">Not specified</span>
                      )}
                    </>
                  )}
                </div>
              </section>
            </div>
            
          </div>
          
          {/* Preferences Bottom Row */}
          <div className="pt-10 mt-8 border-t border-white/10">
            <h2 className="text-xl font-medium mb-6">Work Preferences</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/50 text-sm mb-2">Work Type</div>
                {isEditing ? (
                  <select 
                    value={editForm.work_preference || ''}
                    onChange={(e) => setEditForm({ ...editForm, work_preference: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4642ff]"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" disabled className="bg-[#171720] text-white">Select</option>
                    <option value="Remote only" className="bg-[#171720] text-white">Remote only</option>
                    <option value="Hybrid" className="bg-[#171720] text-white">Hybrid</option>
                    <option value="On-site" className="bg-[#171720] text-white">On-site</option>
                    <option value="No preference" className="bg-[#171720] text-white">No preference</option>
                  </select>
                ) : (
                  <div className="font-medium">{profile?.work_preference || 'Not specified'}</div>
                )}
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/50 text-sm mb-2">Availability</div>
                {isEditing ? (
                  <select 
                    value={editForm.availability || ''}
                    onChange={(e) => setEditForm({ ...editForm, availability: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4642ff]"
                    style={{ colorScheme: 'dark' }}
                  >
                    <option value="" disabled className="bg-[#171720] text-white">Select</option>
                    <option value="Immediately" className="bg-[#171720] text-white">Immediately</option>
                    <option value="Within 2 weeks" className="bg-[#171720] text-white">Within 2 weeks</option>
                    <option value="Within 1 month" className="bg-[#171720] text-white">Within 1 month</option>
                    <option value="Open to offers" className="bg-[#171720] text-white">Open to offers (Passive)</option>
                  </select>
                ) : (
                  <div className="font-medium">{profile?.availability || 'Not specified'}</div>
                )}
              </div>
              <div className="bg-white/5 rounded-xl p-4">
                <div className="text-white/50 text-sm mb-2">Company Type</div>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={inputs.companyType}
                    onChange={(e) => {
                      setInputs({ ...inputs, companyType: e.target.value });
                      setEditForm({ ...editForm, company_preferences: e.target.value.split(',').map(s => s.trim()).filter(Boolean) });
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4642ff]"
                    placeholder="e.g. Startup, Enterprise"
                  />
                ) : (
                  <div className="font-medium">{profile?.company_preferences?.join(', ') || 'Any'}</div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Saved Resumes Section */}
        <div className="mt-8">
          <h2 className="text-xl font-medium mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4642ff]" />
            Saved Resumes
          </h2>
          {resumes.length === 0 ? (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <p className="text-white/60 mb-4">You haven't saved any resumes yet.</p>
              <Link to="/resume" className="px-4 py-2 bg-[#4642ff] hover:bg-[#5b4fff] text-white rounded-lg inline-block text-sm font-medium transition-colors">
                Build a Resume
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {resumes.map((resume) => (
                <div key={resume.id} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-colors flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-lg">{resume.title || 'My Resume'}</h3>
                      <p className="text-sm text-white/50">Template: <span className="capitalize">{resume.template}</span></p>
                    </div>
                    <FileText className="w-5 h-5 text-[#56c2fc]" />
                  </div>
                  
                  <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                    <span className="text-xs text-white/40">Updated: {new Date(resume.updatedAt).toLocaleDateString()}</span>
                    <button 
                      onClick={() => navigate(`/resume/${resume.id}/preview`)}
                      className="text-sm text-[#4642ff] hover:text-[#5b4fff] font-medium px-3 py-1 bg-[#4642ff]/10 rounded-full transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
