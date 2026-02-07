import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Plus, Trash2, ChevronDown, ChevronUp, BookOpen, Layers } from 'lucide-react';

/**
 * CourseBuilder - Instructor course creation and management interface
 * Allows instructors to create courses with modules and activities
 * Maintains midnight theme with cyan/sky/slate colors
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
      type: 'quiz',
      description: '',
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!courseData.title.trim()) newErrors.title = 'Course title is required';
    if (!courseData.description.trim()) newErrors.description = 'Course description is required';
    if (!courseData.code.trim()) newErrors.code = 'Course code is required';
    if (modules.length === 0) newErrors.modules = 'At least one module is required';
    
    // Validate modules
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
    if (!validateForm()) return;

    setSaving(true);
    try {
      // Create course in AppContext
      const newCourse = await createCourse({
        ...courseData,
        responsibleId: user.id,
        adminId: user.id,
        website: '',
        attendees: [],
      });

      // Create modules for the course
      for (const module of modules) {
        await createModule(newCourse.id, {
          title: module.title,
          description: module.description,
        });
      }

      // Navigate after successful creation
      navigate('/admin/dashboard', {
        state: { successMessage: 'Course created successfully!' },
      });
    } catch (error) {
      setErrors({ submit: 'Failed to create course. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-8 h-8 text-cyan-400" />
            <h1 className="text-4xl font-bold">Create New Course</h1>
          </div>
          <p className="text-slate-400 text-lg">Build a comprehensive learning experience with modules and activities</p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Course Details Section */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-900/30 p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-cyan-400 mb-6 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Course Details
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Title */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold mb-3 text-cyan-300">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={courseData.title}
                  onChange={handleCourseChange}
                  placeholder="e.g., Advanced React Development"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder-slate-500 transition"
                />
                {errors.title && <p className="text-red-400 text-sm mt-2">{errors.title}</p>}
              </div>

              {/* Description */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold mb-3 text-cyan-300">
                  Course Description *
                </label>
                <textarea
                  name="description"
                  value={courseData.description}
                  onChange={handleCourseChange}
                  placeholder="Describe what students will learn..."
                  rows="4"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder-slate-500 transition resize-none"
                />
                {errors.description && <p className="text-red-400 text-sm mt-2">{errors.description}</p>}
              </div>

              {/* Course Code */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-cyan-300">
                  Course Code *
                </label>
                <input
                  type="text"
                  name="code"
                  value={courseData.code}
                  onChange={handleCourseChange}
                  placeholder="e.g., REACT-101"
                  className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder-slate-500 transition"
                />
                {errors.code && <p className="text-red-400 text-sm mt-2">{errors.code}</p>}
              </div>

              {/* Level */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-cyan-300">
                  Difficulty Level
                </label>
                <select
                  name="level"
                  value={courseData.level}
                  onChange={handleCourseChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white transition"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-cyan-300">
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
                  className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white placeholder-slate-500 transition"
                />
              </div>

              {/* Access Type */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-cyan-300">
                  Access Type
                </label>
                <select
                  name="access"
                  value={courseData.access}
                  onChange={handleCourseChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white transition"
                >
                  <option value="free">Free</option>
                  <option value="payment">Payment Required</option>
                  <option value="code">Access Code</option>
                </select>
              </div>

              {/* Visibility */}
              <div>
                <label className="block text-sm font-semibold mb-3 text-cyan-300">
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={courseData.visibility}
                  onChange={handleCourseChange}
                  className="w-full px-4 py-3 bg-slate-700/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 text-white transition"
                >
                  <option value="everyone">Everyone</option>
                  <option value="registered">Registered Users Only</option>
                  <option value="private">Private</option>
                </select>
              </div>

              {/* Tags */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold mb-3 text-cyan-300">
                  Course Tags
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Add a tag and press Enter"
                    className="flex-1 px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 text-white placeholder-slate-500 transition"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold transition"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {courseData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-cyan-600/30 border border-cyan-500/50 rounded-lg text-sm flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="text-red-400 hover:text-red-300"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Published */}
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="published"
                  checked={courseData.published}
                  onChange={handleCourseChange}
                  className="w-5 h-5 rounded border-cyan-500 bg-slate-700 cursor-pointer"
                />
                <label className="text-sm font-semibold text-cyan-300 cursor-pointer">
                  Publish immediately
                </label>
              </div>
            </div>

            {errors.submit && (
              <div className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-300">
                {errors.submit}
              </div>
            )}
          </div>

          {/* Modules Section */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-cyan-900/30 p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-cyan-400 flex items-center gap-2">
                <Layers className="w-6 h-6" />
                Modules & Activities
              </h2>
              <button
                type="button"
                onClick={handleAddModule}
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded-lg font-semibold transition"
              >
                <Plus className="w-5 h-5" />
                Add Module
              </button>
            </div>

            {errors.modules && (
              <p className="text-red-400 text-sm mb-4">{errors.modules}</p>
            )}

            <div className="space-y-4">
              {modules.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-cyan-500/30 rounded-lg">
                  <p className="text-slate-400 mb-4">No modules yet. Click "Add Module" to get started.</p>
                </div>
              ) : (
                modules.map((module, idx) => (
                  <div
                    key={module.id}
                    className="border border-cyan-500/30 rounded-lg overflow-hidden bg-slate-700/30"
                  >
                    {/* Module Header */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedModule(expandedModule === module.id ? null : module.id)
                      }
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/50 transition"
                    >
                      <div className="flex items-center gap-3 text-left flex-1">
                        {expandedModule === module.id ? (
                          <ChevronUp className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-cyan-400" />
                        )}
                        <div>
                          <p className="font-semibold text-cyan-300">
                            {module.title || `Module ${idx + 1}`}
                          </p>
                          <p className="text-sm text-slate-400">
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
                        className="p-2 hover:bg-red-500/20 text-red-400 rounded transition"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </button>

                    {/* Module Details */}
                    {expandedModule === module.id && (
                      <div className="border-t border-cyan-500/20 p-6 bg-slate-800/50 space-y-6">
                        {/* Module Title */}
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-cyan-300">
                            Module Title *
                          </label>
                          <input
                            type="text"
                            value={module.title}
                            onChange={(e) =>
                              handleUpdateModule(module.id, { title: e.target.value })
                            }
                            placeholder="e.g., React Fundamentals"
                            className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 text-white placeholder-slate-500 transition"
                          />
                          {errors[`module_${idx}_title`] && (
                            <p className="text-red-400 text-sm mt-1">
                              {errors[`module_${idx}_title`]}
                            </p>
                          )}
                        </div>

                        {/* Module Description */}
                        <div>
                          <label className="block text-sm font-semibold mb-2 text-cyan-300">
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
                            rows="3"
                            className="w-full px-4 py-2 bg-slate-700/50 border border-cyan-500/30 rounded-lg focus:outline-none focus:border-cyan-400 text-white placeholder-slate-500 transition resize-none"
                          />
                        </div>

                        {/* Activities */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-cyan-300">Activities</h3>
                            <button
                              type="button"
                              onClick={() => handleAddActivity(module.id)}
                              className="flex items-center gap-1 px-3 py-1 bg-sky-600 hover:bg-sky-700 rounded text-sm font-semibold transition"
                            >
                              <Plus className="w-4 h-4" />
                              Add Activity
                            </button>
                          </div>

                          {module.activities?.length === 0 ? (
                            <p className="text-slate-400 text-sm italic">
                              No activities yet. Each module needs at least one.
                            </p>
                          ) : (
                            <div className="space-y-3">
                              {module.activities.map((activity) => (
                                <div
                                  key={activity.id}
                                  className="p-4 bg-slate-700/50 border border-sky-500/30 rounded-lg space-y-3"
                                >
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      value={activity.title}
                                      onChange={(e) =>
                                        handleUpdateActivity(module.id, activity.id, {
                                          title: e.target.value,
                                        })
                                      }
                                      placeholder="Activity title"
                                      className="flex-1 px-3 py-2 bg-slate-600 border border-sky-500/30 rounded text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition text-sm"
                                    />
                                    <select
                                      value={activity.type}
                                      onChange={(e) =>
                                        handleUpdateActivity(module.id, activity.id, {
                                          type: e.target.value,
                                        })
                                      }
                                      className="px-3 py-2 bg-slate-600 border border-sky-500/30 rounded text-white focus:outline-none focus:border-sky-400 transition text-sm"
                                    >
                                      <option value="quiz">Quiz</option>
                                      <option value="lab">Lab</option>
                                      <option value="dialogue">Dialogue</option>
                                      <option value="video">Video</option>
                                      <option value="assignment">Assignment</option>
                                    </select>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteActivity(module.id, activity.id)
                                      }
                                      className="p-2 hover:bg-red-500/20 text-red-400 rounded transition"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <textarea
                                    value={activity.description}
                                    onChange={(e) =>
                                      handleUpdateActivity(module.id, activity.id, {
                                        description: e.target.value,
                                      })
                                    }
                                    placeholder="Activity description"
                                    rows="2"
                                    className="w-full px-3 py-2 bg-slate-600 border border-sky-500/30 rounded text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 transition resize-none text-sm"
                                  />
                                </div>
                              ))}
                            </div>
                          )}
                          {errors[`module_${idx}_activities`] && (
                            <p className="text-red-400 text-sm mt-2">
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
          <div className="flex gap-4 justify-end">
            <button
              type="button"
              onClick={() => navigate('/admin/dashboard')}
              className="px-6 py-3 border border-cyan-500/50 text-cyan-300 hover:bg-slate-700/50 rounded-lg font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-sky-500 hover:from-cyan-600 hover:to-sky-600 disabled:opacity-50 rounded-lg font-bold transition flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/50 border-t-white rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Course'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
