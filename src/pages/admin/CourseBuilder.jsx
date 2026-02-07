import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  Plus, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  BookOpen, 
  Layers, 
  Video, 
  FileQuestion, 
  Code, 
  MessageSquare, 
  FileText,
  Play,
  Link2,
  Eye,
  EyeOff,
  DollarSign,
  Tag,
  GraduationCap,
  Globe,
  Lock,
  Sparkles,
  Save,
  X,
  Image
} from 'lucide-react';

/**
 * CourseBuilder - Instructor course creation and management interface
 * Enhanced with purple/violet theme and YouTube video embedding
 */
export default function CourseBuilder() {
  const navigate = useNavigate();
  const { user, createCourse, createModule } = useApp();
  
  // Course form state
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    tags: [],
    image: '',
    code: '',
    level: 'beginner',
    price: 0,
    access: 'payment',
    visibility: 'everyone',
    published: false,
  });

  // Modules state
  const [modules, setModules] = useState([]);
  const [expandedModule, setExpandedModule] = useState(null);
  const [newTagInput, setNewTagInput] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [previewVideo, setPreviewVideo] = useState(null);

  // Convert YouTube URL to embed URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    // Handle different YouTube URL formats
    let videoId = null;
    
    // youtube.com/watch?v=VIDEO_ID
    const watchMatch = url.match(/(?:youtube\.com\/watch\?v=)([^&\s]+)/);
    if (watchMatch) videoId = watchMatch[1];
    
    // youtu.be/VIDEO_ID
    const shortMatch = url.match(/(?:youtu\.be\/)([^?\s]+)/);
    if (shortMatch) videoId = shortMatch[1];
    
    // youtube.com/embed/VIDEO_ID
    const embedMatch = url.match(/(?:youtube\.com\/embed\/)([^?\s]+)/);
    if (embedMatch) videoId = embedMatch[1];
    
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId}`;
    }
    return null;
  };

  // Handle basic course input changes
  const handleCourseChange = (e) => {
    const { name, value, type, checked } = e.target;
    setCourseData({
      ...courseData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle tag addition
  const handleAddTag = () => {
    if (newTagInput.trim() && !courseData.tags.includes(newTagInput)) {
      setCourseData({
        ...courseData,
        tags: [...courseData.tags, newTagInput.trim()],
      });
      setNewTagInput('');
    }
  };

  // Handle tag removal
  const handleRemoveTag = (tagToRemove) => {
    setCourseData({
      ...courseData,
      tags: courseData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Add new module
  const handleAddModule = () => {
    const newModule = {
      id: Date.now(),
      title: '',
      description: '',
      activities: [],
    };
    setModules([...modules, newModule]);
    setExpandedModule(newModule.id);
  };

  // Update module
  const handleUpdateModule = (moduleId, updates) => {
    setModules(
      modules.map((mod) =>
        mod.id === moduleId ? { ...mod, ...updates } : mod
      )
    );
  };

  // Delete module
  const handleDeleteModule = (moduleId) => {
    setModules(modules.filter((mod) => mod.id !== moduleId));
    if (expandedModule === moduleId) {
      setExpandedModule(null);
    }
  };

  // Add activity to module
  const handleAddActivity = (moduleId) => {
    const newActivity = {
      id: Date.now(),
      title: '',
      type: 'video',
      description: '',
      videoUrl: '',
      duration: 0,
    };
    setModules(
      modules.map((mod) =>
        mod.id === moduleId
          ? { ...mod, activities: [...(mod.activities || []), newActivity] }
          : mod
      )
    );
  };

  // Update activity
  const handleUpdateActivity = (moduleId, activityId, updates) => {
    setModules(
      modules.map((mod) =>
        mod.id === moduleId
          ? {
              ...mod,
              activities: mod.activities.map((act) =>
                act.id === activityId ? { ...act, ...updates } : act
              ),
            }
          : mod
      )
    );
  };

  // Delete activity
  const handleDeleteActivity = (moduleId, activityId) => {
    setModules(
      modules.map((mod) =>
        mod.id === moduleId
          ? {
              ...mod,
              activities: mod.activities.filter((act) => act.id !== activityId),
            }
          : mod
      )
    );
  };

  // Get activity icon
  const getActivityIcon = (type) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'quiz': return <FileQuestion className="w-4 h-4" />;
      case 'lab': return <Code className="w-4 h-4" />;
      case 'dialogue': return <MessageSquare className="w-4 h-4" />;
      case 'assignment': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Get activity color
  const getActivityColor = (type) => {
    switch (type) {
      case 'video': return 'bg-white border border-rose-200 text-gray-900';
      case 'quiz': return 'bg-white border border-amber-200 text-gray-900';
      case 'lab': return 'bg-white border border-emerald-200 text-gray-900';
      case 'dialogue': return 'bg-white border border-sky-200 text-gray-900';
      case 'assignment': return 'bg-white border border-violet-200 text-gray-900';
      default: return 'bg-white border border-gray-200 text-gray-900';
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!courseData.title.trim()) newErrors.title = 'Course title is required';
    if (!courseData.description.trim()) newErrors.description = 'Course description is required';
    if (!courseData.code.trim()) newErrors.code = 'Course code is required';
    if (modules.length === 0) newErrors.modules = 'At least one module is required';
    
    modules.forEach((mod, idx) => {
      if (!mod.title.trim()) {
        newErrors[`module_${idx}_title`] = 'Module title is required';
      }
      if (mod.activities.length === 0) {
        newErrors[`module_${idx}_activities`] = 'Each module needs at least one activity';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit course
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      console.log('Form validation failed');
      return;
    }

    setSaving(true);
    try {
      // Create the course
      const newCourse = createCourse({
        ...courseData,
        responsibleId: user.id,
        adminId: user.id,
        code: courseData.code,
        website: '',
        attendees: [],
      });

      console.log('Course created:', newCourse);

      if (!newCourse || !newCourse.id) {
        throw new Error('Failed to create course');
      }

      // Create modules for the course
      for (const module of modules) {
        const moduleResult = createModule(newCourse.id, {
          title: module.title,
          description: module.description,
        });
        
        console.log('Module created:', moduleResult);
        if (!moduleResult) {
          console.warn('Failed to create module:', module.title);
        }
      }

      // Wait a moment for state to update, then navigate
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setSaving(false);
      
      // Navigate after state is updated
      setTimeout(() => {
        navigate('/admin/courses', {
          state: { successMessage: 'Course created successfully!' },
        });
      }, 100);
      
    } catch (error) {
      console.error('Error creating course:', error);
      setErrors({ submit: error.message || 'Failed to create course. Please try again.' });
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 p-4 md:p-6">
      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-gray-200 w-full max-w-4xl overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary-500" />
                <span className="font-semibold text-gray-900">Video Preview</span>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <div className="aspect-video bg-black">
              <iframe
                src={previewVideo}
                title="Video Preview"
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-3 bg-primary-500 rounded-xl shadow-lg shadow-primary-500/20">
              <GraduationCap className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Create New Course
              </h1>
              <p className="text-gray-600 text-sm md:text-base">Build engaging learning experiences with modules and activities</p>
            </div>
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Course Details Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-primary-500" />
              Course Details
              <Sparkles className="w-5 h-5 text-primary-400 animate-pulse" />
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Title */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={courseData.title}
                  onChange={handleCourseChange}
                  placeholder="e.g., Advanced React Development"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-900 placeholder-gray-400 transition"
                />
                {errors.title && <p className="text-rose-500 text-sm mt-2">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Course Description *
                </label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleCourseChange}
                  placeholder="Describe what students will learn..."
                  rows="4"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-900 placeholder-gray-400 transition resize-none"
                />
                {errors.description && <p className="text-rose-500 text-sm mt-2">{errors.description}</p>}
              </div>

              {/* Course Image URL */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <Image className="w-4 h-4" />
                  Course Cover Image URL
                </label>
                <input
                  type="url"
                  name="image"
                  value={courseData.image}
                  onChange={handleCourseChange}
                  placeholder="https://example.com/course-image.jpg"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-900 placeholder-gray-400 transition"
                />
                {courseData.image && (
                  <div className="mt-3 relative rounded-xl overflow-hidden border border-gray-300">
                    <img src={courseData.image} alt="Course preview" className="w-full h-48 object-cover" />
                  </div>
                )}
              </div>

              {/* Course Code */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700">
                  Course Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={courseData.code}
                  onChange={handleCourseChange}
                  placeholder="e.g., REACT-101"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-900 placeholder-gray-400 transition"
                />
                {errors.code && <p className="text-rose-500 text-sm mt-2">{errors.code}</p>}
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <GraduationCap className="w-4 h-4" />
                  Difficulty Level
                </label>
                <select
                  name="level"
                  value={courseData.level}
                  onChange={handleCourseChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-900 transition"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={courseData.price}
                  onChange={handleCourseChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-900 placeholder-gray-400 transition"
                />
              </div>

              {/* Access Type */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Access Type
                </label>
                <select
                  name="access"
                  value={courseData.access}
                  onChange={handleCourseChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-900 transition"
                >
                  <option value="free">Free</option>
                  <option value="payment">Payment Required</option>
                  <option value="code">Access Code</option>
                </select>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={courseData.visibility}
                  onChange={handleCourseChange}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 text-gray-900 transition"
                >
                  <option value="everyone">Everyone</option>
                  <option value="registered">Registered Users Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {/* Tags */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold mb-2 text-gray-700 flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  Course Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary-400 text-gray-900 placeholder-gray-400 transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold transition shadow-lg shadow-primary-500/25 text-white"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courseData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1.5 bg-primary-50 border border-primary-200 rounded-lg text-sm flex items-center gap-2 text-primary-700"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-rose-500 hover:text-rose-600 transition"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Published */}
              <div className="lg:col-span-2 flex items-center gap-3 p-4 bg-gray-100 rounded-xl border border-gray-200">
                <input
                  type="checkbox"
                  name="published"
                  checked={courseData.published}
                  onChange={handleCourseChange}
                  className="w-5 h-5 rounded border-gray-300 bg-white cursor-pointer accent-primary-500"
                />
                <div className="flex items-center gap-2">
                  {courseData.published ? (
                    <Eye className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <EyeOff className="w-5 h-5 text-gray-500" />
                  )}
                  <label className="text-sm font-semibold text-gray-700 cursor-pointer">
                    {courseData.published ? 'Course will be published immediately' : 'Save as draft (not published)'}
                  </label>
                </div>
              </div>
            </div>

            {errors.submit && (
              <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700">
                {errors.submit}
              </div>
            )}
          </div>

          {/* Modules Section */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Layers className="w-6 h-6 text-primary-500" />
                Modules & Activities
              </h2>
              <button
                type="button"
                onClick={handleAddModule}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl font-semibold transition shadow-lg shadow-primary-500/25 text-white"
              >
                <Plus className="w-5 h-5" />
                Add Module
              </button>
            </div>

            {errors.modules && (
              <p className="text-rose-500 text-sm mb-4">{errors.modules}</p>
            )}

            <div className="space-y-4">
              {modules.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                  <Layers className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 mb-2">No modules yet</p>
                  <p className="text-gray-500 text-sm">Click "Add Module" to get started building your course content</p>
                </div>
              ) : (
                modules.map((module, idx) => (
                  <div
                    key={module.id}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white"
                  >
                    {/* Module Header */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedModule(expandedModule === module.id ? null : module.id)
                      }
                      className="w-full px-4 md:px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-3 text-left flex-1">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          {expandedModule === module.id ? (
                            <ChevronUp className="w-5 h-5 text-primary-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-primary-500" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {module.title || `Module ${idx + 1}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {module.activities?.length || 0} activities
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModule(module.id);
                        }}
                        className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </button>

                    {/* Module Details */}
                    {expandedModule === module.id && (
                      <div className="border-t border-gray-200 p-4 md:p-6 bg-gray-50 space-y-5">
                        {/* Module Title */}
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Module Title *
                          </label>
                          <input
                            type="text"
                            value={module.title}
                            onChange={(e) =>
                              handleUpdateModule(module.id, { title: e.target.value })
                            }
                            placeholder="e.g., React Fundamentals"
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary-400 text-gray-900 placeholder-gray-400 transition"
                          />
                          {errors[`module_${idx}_title`] && (
                            <p className="text-rose-500 text-sm mt-1">
                              {errors[`module_${idx}_title`]}
                            </p>
                          )}
                        </div>

                        {/* Module Description */}
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-gray-700">
                            Module Description
                          </label>
                          <textarea
                            value={module.description}
                            onChange={(e) =>
                              handleUpdateModule(module.id, {
                                description: e.target.value,
                              })
                            }
                            placeholder="What will students learn in this module?"
                            rows="2"
                            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:border-primary-400 text-gray-900 placeholder-gray-400 transition resize-none"
                          />
                        </div>

                        {/* Activities */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-primary-500" />
                              Activities
                            </h3>
                            <button
                              type="button"
                              onClick={() => handleAddActivity(module.id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 rounded-lg text-sm font-semibold transition text-white"
                            >
                              <Plus className="w-4 h-4" />
                              Add Activity
                            </button>
                          </div>

                          {module.activities?.length === 0 ? (
                            <p className="text-gray-600 text-sm italic p-4 bg-gray-100 rounded-xl border border-dashed border-gray-300 text-center">
                              No activities yet. Each module needs at least one activity.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {module.activities.map((activity) => (
                                <div
                                  key={activity.id}
                                  className={`p-4 rounded-xl border space-y-3 ${getActivityColor(activity.type)}`}
                                >
                                  {/* Activity Header */}
                                  <div className="flex flex-wrap gap-2 items-center">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg">
                                      {getActivityIcon(activity.type)}
                                      <span className="text-sm font-medium capitalize">{activity.type}</span>
                                    </div>
                                    <input
                                      type="text"
                                      value={activity.title}
                                      onChange={(e) =>
                                        handleUpdateActivity(module.id, activity.id, {
                                          title: e.target.value,
                                        })
                                      }
                                      placeholder="Activity title"
                                      className="flex-1 min-w-[200px] px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition text-sm"
                                    />
                                    <select
                                      value={activity.type}
                                      onChange={(e) =>
                                        handleUpdateActivity(module.id, activity.id, {
                                          type: e.target.value,
                                        })
                                      }
                                      className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition text-sm"
                                    >
                                      <option value="video">Video</option>
                                      <option value="quiz">Quiz</option>
                                      <option value="lab">Lab</option>
                                      <option value="dialogue">Dialogue</option>
                                      <option value="assignment">Assignment</option>
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteActivity(module.id, activity.id)
                                      }
                                      className="p-2 hover:bg-rose-50 text-rose-500 rounded-lg transition"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>

                                  {/* Video URL Input - Only for video type */}
                                  {activity.type === 'video' && (
                                    <div className="space-y-2">
                                      <label className="block text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                                        <Link2 className="w-3.5 h-3.5" />
                                        YouTube Video URL
                                      </label>
                                      <div className="flex gap-2">
                                        <input
                                          type="url"
                                          value={activity.videoUrl || ''}
                                          onChange={(e) =>
                                            handleUpdateActivity(module.id, activity.id, {
                                              videoUrl: e.target.value,
                                            })
                                          }
                                          placeholder="https://www.youtube.com/watch?v=..."
                                          className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition text-sm"
                                        />
                                        {activity.videoUrl && getYouTubeEmbedUrl(activity.videoUrl) && (
                                          <button
                                            type="button"
                                            onClick={() => setPreviewVideo(getYouTubeEmbedUrl(activity.videoUrl))}
                                            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 rounded-lg text-sm font-medium transition text-rose-600"
                                          >
                                            <Play className="w-4 h-4" />
                                            Preview
                                          </button>
                                        )}
                                      </div>
                                      
                                      {/* Embedded Video Preview */}
                                      {activity.videoUrl && getYouTubeEmbedUrl(activity.videoUrl) && (
                                        <div className="mt-3 rounded-xl overflow-hidden border border-gray-300 aspect-video">
                                          <iframe
                                            src={getYouTubeEmbedUrl(activity.videoUrl)}
                                            title={activity.title || 'Video Preview'}
                                            className="w-full h-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          />
                                        </div>
                                      )}

                                      {/* Duration */}
                                      <div className="flex items-center gap-2">
                                        <label className="text-xs font-semibold text-gray-600">Duration (minutes):</label>
                                        <input
                                          type="number"
                                          value={activity.duration || 0}
                                          onChange={(e) =>
                                            handleUpdateActivity(module.id, activity.id, {
                                              duration: parseInt(e.target.value) || 0,
                                            })
                                          }
                                          min="0"
                                          className="w-24 px-2 py-1 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Description */}
                                  <textarea
                                    value={activity.description}
                                    onChange={(e) =>
                                      handleUpdateActivity(module.id, activity.id, {
                                        description: e.target.value,
                                      })
                                    }
                                    placeholder="Activity description..."
                                    rows="2"
                                    className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-400/20 transition resize-none text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          {errors[`module_${idx}_activities`] && (
                            <p className="text-rose-500 text-sm mt-2">
                              {errors[`module_${idx}_activities`]}
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-xl font-semibold transition order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-50 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-lg shadow-primary-500/30 order-1 sm:order-2 text-white"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Create Course
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
