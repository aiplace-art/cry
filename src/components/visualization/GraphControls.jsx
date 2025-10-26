import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * GraphControls - Interactive controls for graph manipulation
 *
 * Features:
 * - Add new nodes
 * - Filter by type/status
 * - Toggle animations
 * - Export/import graph data
 * - Layout algorithms
 */

const GraphControls = ({
  onAddNode,
  onFilterChange,
  currentFilter,
  onToggleParticles,
  showParticles,
  onExport,
  onImport,
  onLayoutChange,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedNodeType, setSelectedNodeType] = useState('worker');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNodeData, setNewNodeData] = useState({
    label: '',
    description: '',
  });

  const nodeTypes = [
    { value: 'coordinator', label: 'Coordinator', icon: '👑' },
    { value: 'worker', label: 'Worker', icon: '🤖' },
    { value: 'task', label: 'Task', icon: '📋' },
    { value: 'dataFlow', label: 'Data Flow', icon: '📊' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Nodes' },
    { value: 'coordinator', label: 'Coordinators' },
    { value: 'worker', label: 'Workers' },
    { value: 'task', label: 'Tasks' },
    { value: 'active', label: 'Active' },
    { value: 'working', label: 'Working' },
    { value: 'idle', label: 'Idle' },
  ];

  const layoutOptions = [
    { value: 'circular', label: 'Circular' },
    { value: 'hierarchical', label: 'Hierarchical' },
    { value: 'force', label: 'Force-Directed' },
    { value: 'grid', label: 'Grid' },
  ];

  const handleAddNode = () => {
    if (!newNodeData.label) return;

    onAddNode({
      type: selectedNodeType,
      label: newNodeData.label,
      data: {
        description: newNodeData.description,
        status: 'idle',
      },
    });

    setNewNodeData({ label: '', description: '' });
    setShowAddForm(false);
  };

  return (
    <motion.div
      className="graph-controls"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="controls-header">
        <h3>Graph Controls</h3>
        <button
          className="toggle-button"
          onClick={() => setIsExpanded(!isExpanded)}
          aria-label={isExpanded ? 'Collapse controls' : 'Expand controls'}
        >
          {isExpanded ? '−' : '+'}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            className="controls-content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Add Node Section */}
            <div className="control-section">
              <button
                className="control-button primary"
                onClick={() => setShowAddForm(!showAddForm)}
              >
                {showAddForm ? '✕ Cancel' : '+ Add Node'}
              </button>

              <AnimatePresence>
                {showAddForm && (
                  <motion.div
                    className="add-node-form"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className="form-group">
                      <label>Node Type</label>
                      <div className="node-type-selector">
                        {nodeTypes.map((type) => (
                          <button
                            key={type.value}
                            className={`type-button ${
                              selectedNodeType === type.value ? 'active' : ''
                            }`}
                            onClick={() => setSelectedNodeType(type.value)}
                          >
                            <span className="type-icon">{type.icon}</span>
                            <span className="type-label">{type.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Label</label>
                      <input
                        type="text"
                        placeholder="Enter node label"
                        value={newNodeData.label}
                        onChange={(e) =>
                          setNewNodeData({ ...newNodeData, label: e.target.value })
                        }
                      />
                    </div>

                    <div className="form-group">
                      <label>Description (optional)</label>
                      <textarea
                        placeholder="Enter node description"
                        value={newNodeData.description}
                        onChange={(e) =>
                          setNewNodeData({
                            ...newNodeData,
                            description: e.target.value,
                          })
                        }
                        rows={2}
                      />
                    </div>

                    <button
                      className="control-button success"
                      onClick={handleAddNode}
                      disabled={!newNodeData.label}
                    >
                      Create Node
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Filter Section */}
            <div className="control-section">
              <label>Filter Nodes</label>
              <select
                value={currentFilter}
                onChange={(e) => onFilterChange(e.target.value)}
                className="control-select"
              >
                {filterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Layout Section */}
            <div className="control-section">
              <label>Layout Algorithm</label>
              <div className="button-group">
                {layoutOptions.map((layout) => (
                  <button
                    key={layout.value}
                    className="control-button small"
                    onClick={() => onLayoutChange?.(layout.value)}
                  >
                    {layout.label}
                  </button>
                ))}
              </div>
            </div>

            {/* View Options */}
            <div className="control-section">
              <label>View Options</label>
              <div className="toggle-group">
                <button
                  className={`toggle-option ${showParticles ? 'active' : ''}`}
                  onClick={onToggleParticles}
                >
                  <span className="toggle-icon">✨</span>
                  <span className="toggle-label">Particles</span>
                </button>
              </div>
            </div>

            {/* Export/Import */}
            <div className="control-section">
              <div className="button-group">
                <button
                  className="control-button secondary"
                  onClick={onExport}
                >
                  ⬇ Export
                </button>
                <button
                  className="control-button secondary"
                  onClick={onImport}
                >
                  ⬆ Import
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="control-section stats-section">
              <h4>Quick Stats</h4>
              <div className="stat-grid">
                <div className="stat-item">
                  <span className="stat-label">Nodes</span>
                  <span className="stat-value">0</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Edges</span>
                  <span className="stat-value">0</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Active</span>
                  <span className="stat-value">0</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default GraphControls;
