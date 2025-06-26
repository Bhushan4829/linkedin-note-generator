import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { User } from '@supabase/supabase-js';
import { FiCopy, FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface Template {
  id: string;
  type: 'note' | 'email' | 'inmail';
  name: string;
  content: string;
  is_default: boolean;
}

// First define the useTemplates hook
const useTemplates = (user: User | null) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTemplates = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setTemplates(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const addTemplate = async (template: Omit<Template, 'id' | 'user_id' | 'is_default' | 'created_at' | 'updated_at'>) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('templates')
        .insert({
          ...template,
          user_id: user.id
        })
        .select();
      
      if (error) throw error;
      setTemplates(prev => [data[0], ...prev]);
      return data[0];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add template');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTemplate = async (id: string, updates: Partial<Template>) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('templates')
        .update(updates)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      setTemplates(prev => prev.map(t => t.id === id ? data[0] : t));
      return data[0];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update template');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (id: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('templates')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      setTemplates(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete template');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const setDefaultTemplate = async (type: 'note' | 'email' | 'inmail', id: string) => {
    setLoading(true);
    try {
      await supabase
        .from('templates')
        .update({ is_default: false })
        .eq('user_id', user?.id)
        .eq('type', type);
      
      const { data, error } = await supabase
        .from('templates')
        .update({ is_default: true })
        .eq('id', id)
        .select();
      
      if (error) throw error;
      setTemplates(prev => prev.map(t => 
        t.type === type ? { ...t, is_default: t.id === id } : t
      ));
      return data[0];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to set default template');
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    templates,
    loading,
    error,
    loadTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate
  };
};

// Then define the TemplateManager component
export const TemplateManager: React.FC<{ user: User | null }> = ({ user }) => {
  const [activeTab, setActiveTab] = useState<'note' | 'email' | 'inmail'>('note');
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [expandedTemplates, setExpandedTemplates] = useState<Record<string, boolean>>({});
  
  const {
    templates,
    loading,
    error,
    loadTemplates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    setDefaultTemplate
  } = useTemplates(user);

  useEffect(() => {
    if (user) loadTemplates();
  }, [user]);

  const filteredTemplates = templates.filter((t: Template) => t.type === activeTab);

  const handleAddTemplate = async () => {
    if (!newTemplateName || !newTemplateContent) return;
    await addTemplate({
      type: activeTab,
      name: newTemplateName,
      content: newTemplateContent
    });
    setNewTemplateName('');
    setNewTemplateContent('');
    setShowAddForm(false);
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // You could add a toast notification here if you want
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const toggleExpandTemplate = (id: string) => {
    setExpandedTemplates(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div style={{ 
      marginTop: 20, 
      borderTop: '1px solid #eee', 
      paddingTop: 20,
      maxHeight: '500px',
      overflowY: 'auto'
    }}>
      <h3 style={{ marginBottom: 10 }}>Template Manager</h3>
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 15 }}>
        <button 
          onClick={() => setActiveTab('note')}
          style={{ 
            background: activeTab === 'note' ? '#0073b1' : '#eee',
            color: activeTab === 'note' ? 'white' : '#333',
            padding: '5px 10px',
            borderRadius: 4,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Notes
        </button>
        <button 
          onClick={() => setActiveTab('email')}
          style={{ 
            background: activeTab === 'email' ? '#26A541' : '#eee',
            color: activeTab === 'email' ? 'white' : '#333',
            padding: '5px 10px',
            borderRadius: 4,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Emails
        </button>
        <button 
          onClick={() => setActiveTab('inmail')}
          style={{ 
            background: activeTab === 'inmail' ? '#F8C13A' : '#eee',
            color: activeTab === 'inmail' ? '#333' : '#333',
            padding: '5px 10px',
            borderRadius: 4,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          InMails
        </button>
      </div>

      {error && <div style={{ color: 'red', marginBottom: 10 }}>{error}</div>}

      {!showAddForm ? (
        <button 
          onClick={() => setShowAddForm(true)}
          style={{
            background: '#0073b1',
            color: 'white',
            border: 'none',
            padding: '8px 12px',
            borderRadius: 4,
            marginBottom: 15,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '5px'
          }}
        >
          <span>+</span> Add New Template
        </button>
      ) : (
        <div style={{ 
          background: '#f5f5f5', 
          padding: 15, 
          borderRadius: 6,
          marginBottom: 15
        }}>
          <h4 style={{ marginTop: 0 }}>Add New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Template</h4>
          <input
            value={newTemplateName}
            onChange={e => setNewTemplateName(e.target.value)}
            placeholder="Template name"
            style={{ width: '100%', marginBottom: 8, padding: 6, borderRadius: 4, border: '1px solid #ddd' }}
          />
          <textarea
            value={newTemplateContent}
            onChange={e => setNewTemplateContent(e.target.value)}
            placeholder="Template content"
            rows={4}
            style={{ 
              width: '100%', 
              marginBottom: 8, 
              padding: 6, 
              borderRadius: 4, 
              border: '1px solid #ddd',
              fontFamily: 'monospace',
              minHeight: '100px'
            }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button 
              onClick={handleAddTemplate}
              style={{
                background: '#0073b1',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Save
            </button>
            <button 
              onClick={() => setShowAddForm(false)}
              style={{
                background: '#eee',
                color: '#333',
                border: 'none',
                padding: '8px 12px',
                borderRadius: 4,
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading && <div>Loading templates...</div>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTemplates.length === 0 ? (
          <div style={{ 
            color: '#666', 
            textAlign: 'center', 
            padding: 20,
            background: '#f9f9f9',
            borderRadius: 6
          }}>
            No templates found. Add your first template!
          </div>
        ) : (
          filteredTemplates.map((template: Template) => (
            <div 
              key={template.id}
              style={{ 
                background: template.is_default ? '#e6f7ff' : '#fff',
                border: '1px solid #ddd',
                borderRadius: 6,
                padding: 12,
                position: 'relative',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8
              }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  fontSize: '14px',
                  color: template.is_default ? '#0073b1' : '#333'
                }}>
                  {template.name}
                  {template.is_default && (
                    <span style={{
                      background: '#0073b1',
                      color: 'white',
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: 10,
                      marginLeft: '8px'
                    }}>
                      Default
                    </span>
                  )}
                </div>
                
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    onClick={() => handleCopy(template.content)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      padding: '4px',
                      borderRadius: '4px',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                    title="Copy template"
                  >
                    <FiCopy size={14} />
                  </button>
                  <button
                    onClick={() => toggleExpandTemplate(template.id)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      padding: '4px',
                      borderRadius: '4px'
                    }}
                  >
                    {expandedTemplates[template.id] ? (
                      <FiChevronUp size={14} />
                    ) : (
                      <FiChevronDown size={14} />
                    )}
                  </button>
                </div>
              </div>
              
              <div 
                style={{ 
                  fontSize: 13, 
                  color: '#555', 
                  whiteSpace: 'pre-wrap',
                  maxHeight: expandedTemplates[template.id] ? 'none' : '60px',
                  overflow: 'hidden',
                  transition: 'max-height 0.2s ease',
                  lineHeight: '1.4',
                  fontFamily: 'monospace',
                  background: '#f9f9f9',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #eee'
                }}
              >
                {template.content}
              </div>
              
              <div style={{ 
                display: 'flex', 
                gap: 5, 
                marginTop: 10,
                justifyContent: 'flex-end'
              }}>
                <button
                  onClick={() => setDefaultTemplate(template.type, template.id)}
                  style={{
                    background: template.is_default ? '#0073b1' : 'transparent',
                    color: template.is_default ? 'white' : '#0073b1',
                    border: template.is_default ? 'none' : '1px solid #0073b1',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  {template.is_default ? '✓ Default' : 'Set as Default'}
                </button>
                <button
                  onClick={() => deleteTemplate(template.id)}
                  style={{
                    background: 'transparent',
                    color: '#f44336',
                    border: '1px solid #f44336',
                    padding: '4px 8px',
                    borderRadius: 4,
                    fontSize: 12,
                    cursor: 'pointer'
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};