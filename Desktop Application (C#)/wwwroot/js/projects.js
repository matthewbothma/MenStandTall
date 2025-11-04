// Company Projects JavaScript - Wrapped in namespace to avoid conflicts
(function() {
    'use strict';
    
    console.log('PROJECTS: Company Projects script starting...');

    let projectsCurrentUser = null;
    let projectsList = [];
    let projectsDB = null;
    let projectsFirebaseReady = false;
    
    // Show project notification - MOVED TO TOP for immediate availability
    function showProjectNotification(message, type = 'info') {
        console.log('NOTIFY: showProjectNotification called:', message, type);
        
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#3b82f6'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 9999;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            max-width: 300px;
            font-weight: 500;
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
        
        console.log('NOTIFY: Notification displayed successfully');
    }
    
    // Make showProjectNotification available globally immediately
    window.showProjectNotification = showProjectNotification;

    // Test function to verify notification works - ADDED FOR TESTING
    window.testProjectNotification = function() {
        console.log('TEST: Testing project notification function...');
        if (typeof window.showProjectNotification === 'function') {
            window.showProjectNotification('SUCCESS: Project notification system is working!', 'success');
            console.log('TEST: Test notification called successfully');
        } else {
            console.error('ERROR: showProjectNotification is not available');
        }
    };
    
    // Wait for DOM to be ready before initializing
    function waitForDOM(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    // Firebase ready check
    function waitForProjectsFirebase(callback) {
        console.log('FIREBASE: Waiting for Firebase...');
        
        let attempts = 0;
        const maxAttempts = 100;
        
        function checkFirebase() {
            attempts++;
            console.log('FIREBASE: Firebase check attempt ' + attempts + '/' + maxAttempts);
            
            if (window.firebaseAuth && window.firebaseDB) {
                console.log('FIREBASE: Firebase ready for company projects');
                projectsFirebaseReady = true;
                callback();
                return;
            }
            
            if (attempts >= maxAttempts) {
                console.error('ERROR: Firebase failed to initialize');
                showProjectNotification('ERROR: Firebase connection failed. Please refresh the page.', 'error');
                callback();
                return;
            }
            
            setTimeout(checkFirebase, 100);
        }
        
        checkFirebase();
    }

    // Initialize everything when both Firebase and DOM are ready
    function initializeProjects() {
        waitForDOM(function() {
            console.log('DOM: DOM is ready for projects');
            
            waitForProjectsFirebase(function() {
                console.log('FIREBASE: Firebase ready for company projects');
                
                // Verify essential DOM elements exist
                const requiredElements = [
                    'projectsContainer',
                    'loadingState', 
                    'emptyState',
                    'total-projects',
                    'active-projects',
                    'completed-projects',
                    'overdue-projects'
                ];
                
                const missingElements = requiredElements.filter(function(id) {
                    return !document.getElementById(id);
                });
                
                if (missingElements.length > 0) {
                    console.error('ERROR: Missing required DOM elements:', missingElements);
                    showProjectNotification('ERROR: Page elements not loaded correctly. Please refresh.', 'error');
                    return;
                }
                
                console.log('DOM: All required DOM elements found');
                setupProjects();
                console.log('SETUP: Company Projects setup complete');
            });
        });
    }

    // Setup projects
    function setupProjects() {
        console.log('SETUP: Setting up company projects');
        
        if (!window.firebaseAuth || !window.firebaseDB) {
            console.error('ERROR: Firebase not available');
            showProjectNotification('ERROR: Firebase not available. Please check your connection.', 'error');
            showEmptyState();
            return;
        }
        
        projectsDB = window.firebaseDB;
        console.log('FIREBASE: Firebase database reference set');
        
        // Note: Removed test connection to avoid permission errors
        // The actual data loading will test the connection
        
        window.firebaseAuth.onAuthStateChanged(function(user) {
            console.log('AUTH: Auth state changed:', user ? user.email : 'No user');
            
            if (!user) {
                console.log('AUTH: No user, redirecting');
                window.location.href = '/';
            } else {
                projectsCurrentUser = user;
                console.log('AUTH: User authenticated:', user.email);
                setupProjectHandlers();
                loadProjectsFromFirebase();
            }
        });
    }

    // Handle Firebase errors
    function handleFirebaseError(error, operation) {
        console.error('ERROR: Firebase ' + operation + ' failed:', error);
        
        let errorMessage = '';
        let showPermissionError = false;
        
        switch (error.code) {
            case 'permission-denied':
                errorMessage = 'Database access denied. Please check Firestore security rules.';
                showPermissionError = true;
                break;
            case 'failed-precondition':
                errorMessage = 'Database indexing in progress. Please try again in a few minutes.';
                break;
            case 'unavailable':
                errorMessage = 'Database temporarily unavailable. Please try again later.';
                break;
            case 'unauthenticated':
                errorMessage = 'User not authenticated. Please log in again.';
                setTimeout(function() {
                    window.location.href = '/';
                }, 2000);
                break;
            case 'not-found':
                errorMessage = 'Database collection not found. This may be normal for new accounts.';
                break;
            default:
                errorMessage = 'Database error: ' + error.message;
        }
        
        showProjectNotification('ERROR: ' + errorMessage, 'error');
        
        if (showPermissionError) {
            showPermissionErrorState();
        } else {
            showEmptyState();
        }
    }

    // Load ALL projects for company collaboration
    async function loadProjectsFromFirebase() {
        console.log('LOADING: LOADING PROJECTS FROM FIREBASE');
        console.log('================================');
        
        if (!projectsDB || !projectsCurrentUser) {
            const errorMsg = `ERROR: Missing requirements - DB: ${!!projectsDB}, User: ${!!projectsCurrentUser}`;
            console.error(errorMsg);
            showProjectNotification('ERROR: Cannot load projects: Missing requirements', 'error');
            showEmptyState();
            return;
        }
        
        console.log('LOADING: Starting project load for user:', projectsCurrentUser.email);
        showLoadingState(true);
        
        try {
            console.log('QUERY: Querying projects collection...');
            
            let query = projectsDB.collection('projects');
            
            try {
                console.log('QUERY: Attempting ordered query...');
                const snapshot = await query.orderBy('createdAt', 'desc').get();
                
                projectsList = snapshot.docs.map(function(doc) {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data
                    };
                });
                
                console.log('SUCCESS: Projects loaded with ordering:', projectsList.length);
                
            } catch (orderError) {
                console.log('FALLBACK: OrderBy failed, loading without ordering:', orderError.message);
                
                const snapshot = await query.get();
                
                projectsList = snapshot.docs.map(function(doc) {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data
                    };
                });
                
                // Sort on client side
                projectsList.sort(function(a, b) {
                    const dateA = new Date(a.createdAt || '1970-01-01');
                    const dateB = new Date(b.createdAt || '1970-01-01');
                    return dateB - dateA;
                });
                
                console.log('SUCCESS: Projects loaded without ordering:', projectsList.length);
            }
            
            // Debug project data
            console.log('DATA: Project data summary:');
            projectsList.forEach((project, index) => {
                console.log(`  ${index + 1}. ${project.name} (${project.status}) - ${project.authorName || 'Unknown'}`);
            });
            
            if (projectsList.length === 0) {
                console.log('EMPTY: No projects found, showing empty state');
                showEmptyState();
            } else {
                console.log('RENDER: Rendering projects...');
                renderProjects();
                
                // Show completion message if applicable
                const completedCount = projectsList.filter(p => p.status === 'Completed').length;
                if (completedCount === projectsList.length && projectsList.length > 0) {
                    showProjectNotification(`SUCCESS: All ${projectsList.length} projects are completed!`, 'success');
                }
            }
            
            console.log('STATS: Updating project statistics...');
            updateProjectStats();
            
            console.log('SUCCESS: Project loading completed successfully');
            
        } catch (error) {
            console.error('ERROR: Error during project loading:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            handleFirebaseError(error, 'loading projects');
        } finally {
            console.log('UI: Hiding loading state');
            showLoadingState(false);
        }
    }

    // Create new project - ENHANCED with better validation and activity updates
    window.createProject = async function() {
        console.log('CREATE: Creating new project...');
        
        if (!projectsDB || !projectsCurrentUser) {
            console.error('ERROR: Database or user not available');
            showProjectNotification('ERROR: Cannot create project: Not properly connected', 'error');
            return;
        }
        
        const form = document.getElementById('createProjectForm');
        if (!form) {
            console.error('ERROR: Create project form not found');
            showProjectNotification('ERROR: Form not found', 'error');
            return;
        }
        
        // Enhanced validation
        if (!validateProjectForm(form)) {
            console.log('VALIDATE: Form validation failed, stopping creation');
            return;
        }
        
        // Get form data
        const formData = new FormData(form);
        
        // IMPROVED: Better user name extraction with multiple fallbacks
        let userName = 'User';
        
        if (projectsCurrentUser.displayName && projectsCurrentUser.displayName.trim()) {
            // User has a display name set
            userName = projectsCurrentUser.displayName.trim();
        } else if (projectsCurrentUser.email) {
            // Extract name from email (before @)
            const emailParts = projectsCurrentUser.email.split('@');
            if (emailParts[0] && emailParts[0].trim()) {
                userName = emailParts[0].trim();
                
                // Capitalize first letter if it's lowercase
                userName = userName.charAt(0).toUpperCase() + userName.slice(1);
                
                // Replace dots and underscores with spaces for better readability
                userName = userName.replace(/[._]/g, ' ');
            }
        }
        
        // Clean name - remove domain if somehow it's still there
        if (userName.includes('@')) {
            userName = userName.split('@')[0];
        }
        
        console.log('USER: Author name resolved to:', userName);
        console.log('USER: User email:', projectsCurrentUser.email);
        console.log('USER: User displayName:', projectsCurrentUser.displayName);
        
        const projectData = {
            name: formData.get('Name') || '',
            deadline: formData.get('Deadline') || '',
            description: formData.get('Description') || '',
            status: formData.get('Status') || 'Planning',
            priority: formData.get('Priority') || 'Medium',
            progress: parseInt(formData.get('Progress')) || 0,
            userId: projectsCurrentUser.uid,
            authorName: userName,
            authorEmail: projectsCurrentUser.email || 'unknown@example.com',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('DATA: Project data to create:', projectData);
        
        // Show loading state on button
        const createButton = document.querySelector('#addProjectModal .btn-modern.btn-add-project');
        let originalButtonText = '';
        if (createButton) {
            originalButtonText = createButton.innerHTML;
            createButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
            createButton.disabled = true;
        }
        
        try {
            const docRef = await projectsDB.collection('projects').add(projectData);
            console.log('SUCCESS: Project created successfully with ID:', docRef.id);
            
            showProjectNotification('SUCCESS: Project created and shared with team!', 'success');
            
            // Hide modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('addProjectModal'));
            if (modal) modal.hide();
            
            // Reset form
            form.reset();
            
            // Reload projects
            await loadProjectsFromFirebase();
            
            // Dispatch events for dashboard and activity updates
            const projectEvent = new CustomEvent('projectUpdated', {
                detail: { 
                    projectId: docRef.id, 
                    action: 'created',
                    status: projectData.status,
                    name: projectData.name,
                    authorName: userName,
                    timestamp: new Date().toISOString()
                }
            });
            
            const createdEvent = new CustomEvent('projectCreated', {
                detail: {
                    projectId: docRef.id,
                    project: projectData,
                    timestamp: new Date().toISOString()
                }
            });
            
            window.dispatchEvent(projectEvent);
            window.dispatchEvent(createdEvent);
            
            console.log('EVENT: Project creation events dispatched for dashboard activity tracking');
            
        } catch (error) {
            console.error('ERROR: Error creating project:', error);
            handleFirebaseError(error, 'creating project');
        } finally {
            // Restore button
            if (createButton) {
                createButton.innerHTML = originalButtonText;
                createButton.disabled = false;
            }
        }
    };

    // Update project - ENHANCED with better validation and activity updates
    window.updateProject = async function() {
        console.log('UPDATE: Updating project...');
        
        const projectId = document.getElementById('editProjectId')?.value;
        const form = document.getElementById('editProjectForm');
        
        if (!form || !projectId) {
            console.error('ERROR: Edit project form or ID not found');
            showProjectNotification('ERROR: Form or project ID not found', 'error');
            return;
        }
        
        // Enhanced validation
        if (!validateProjectForm(form)) {
            console.log('VALIDATE: Form validation failed, stopping update');
            return;
        }
        
        if (!projectsDB || !projectsCurrentUser) {
            showProjectNotification('ERROR: Cannot update project: Not properly connected', 'error');
            return;
        }
        
        // Get current project data for comparison
        const oldProject = projectsList.find(p => p.id === projectId);
        if (!oldProject) {
            showProjectNotification('ERROR: Project not found', 'error');
            return;
        }
        
        // Get form values
        const newName = document.getElementById('editProjectName')?.value?.trim() || '';
        const newDeadline = document.getElementById('editProjectDeadline')?.value || '';
        const newDescription = document.getElementById('editProjectDescription')?.value?.trim() || '';
        const newStatus = document.getElementById('editProjectStatus')?.value || '';
        const newPriority = document.getElementById('editProjectPriority')?.value || '';
        const newProgress = parseInt(document.getElementById('editProjectProgress')?.value) || 0;
        
        // Check what changed
        const statusChanged = oldProject.status !== newStatus;
        const progressChanged = oldProject.progress !== newProgress;
        const nameChanged = oldProject.name !== newName;
        
        const projectData = {
            name: newName,
            deadline: newDeadline,
            description: newDescription,
            status: newStatus,
            priority: newPriority,
            progress: newProgress,
            updatedAt: new Date().toISOString()
        };
        
        console.log('DATA: Project data to update:', projectData);
        console.log('CHANGES: Changes detected:', { statusChanged, progressChanged, nameChanged });
        
        // Show loading state on button
        const updateButton = document.querySelector('#editProjectModal .btn-modern.btn-edit-project');
        let originalButtonText = '';
        if (updateButton) {
            originalButtonText = updateButton.innerHTML;
            updateButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
            updateButton.disabled = true;
        }
        
        try {
            await projectsDB.collection('projects').doc(projectId).update(projectData);
            console.log('SUCCESS: Project updated:', projectId);
            
            // Show appropriate success message
            let successMessage = 'SUCCESS: Project updated successfully!';
            if (statusChanged && newStatus === 'Completed') {
                successMessage = 'SUCCESS: Project marked as completed! Dashboard will update shortly.';
            } else if (statusChanged) {
                successMessage = `SUCCESS: Project status changed to ${newStatus}!`;
            } else if (progressChanged) {
                successMessage = `SUCCESS: Project progress updated to ${newProgress}%!`;
            }
            
            showProjectNotification(successMessage, 'success');
            
            // Hide modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('editProjectModal'));
            if (modal) modal.hide();
            
            // Reload projects
            await loadProjectsFromFirebase();
            
            // Dispatch events for dashboard and activity updates
            const userName = projectsCurrentUser.displayName || (projectsCurrentUser.email ? projectsCurrentUser.email.split('@')[0] : 'User');
            const cleanUserName = userName.includes('@') ? userName.split('@')[0] : userName;
            
            const projectEvent = new CustomEvent('projectUpdated', {
                detail: { 
                    projectId: projectId, 
                    action: 'updated',
                    statusChanged: statusChanged,
                    newStatus: newStatus,
                    oldStatus: oldProject.status,
                    name: newName,
                    authorName: cleanUserName,
                    timestamp: new Date().toISOString()
                }
            });
            
            // Create activity event based on what changed
            let activityTitle = '';
            let activityDescription = '';
            let activityIcon = 'fas fa-edit';
            
            if (statusChanged && newStatus === 'Completed') {
                activityTitle = `Project Completed: ${newName}`;
                activityDescription = `Marked as completed by ${cleanUserName}`;
                activityIcon = 'fas fa-check-circle';
            } else if (statusChanged) {
                activityTitle = `Project Status Updated: ${newName}`;
                activityDescription = `Status changed from ${oldProject.status} to ${newStatus}`;
                activityIcon = 'fas fa-flag';
            } else if (progressChanged) {
                activityTitle = `Project Progress Updated: ${newName}`;
                activityDescription = `Progress updated to ${newProgress}%`;
                activityIcon = 'fas fa-chart-line';
            } else if (nameChanged) {
                activityTitle = `Project Renamed: ${newName}`;
                activityDescription = `Updated by ${cleanUserName}`;
                activityIcon = 'fas fa-edit';
            } else {
                activityTitle = `Project Updated: ${newName}`;
                activityDescription = `Modified by ${cleanUserName}`;
                activityIcon = 'fas fa-edit';
            }
            
            const activityEvent = new CustomEvent('recentActivityUpdated', {
                detail: {
                    type: 'project_updated',
                    title: activityTitle,
                    description: activityDescription,
                    icon: activityIcon,
                    timestamp: new Date().toISOString(),
                    projectId: projectId
                }
            });
            
            window.dispatchEvent(projectEvent);
            window.dispatchEvent(activityEvent);
            
            console.log('EVENT: Project update and activity events dispatched');
            
        } catch (error) {
            console.error('ERROR: Error updating project:', error);
            handleFirebaseError(error, 'updating project');
        } finally {
            // Restore button
            if (updateButton) {
                updateButton.innerHTML = originalButtonText;
                updateButton.disabled = false;
            }
        }
    };

    // Delete project with ownership check - Global function
    window.deleteProject = async function(projectId, projectName) {
        const project = projectsList.find(function(p) { return p.id === projectId; });
        if (!project) {
            showProjectNotification('ERROR: Project not found', 'error');
            return;
        }
        
        const isOwner = projectsCurrentUser && project.userId === projectsCurrentUser.uid;
        
        let confirmMessage;
        if (isOwner) {
            confirmMessage = 'Are you sure you want to delete "' + projectName + '"? This action cannot be undone.';
        } else {
            confirmMessage = 'WARNING: You are about to delete "' + projectName + '" created by ' + (project.authorName || project.authorEmail) + '.\n\nThis is a team project that doesn\'t belong to you. Are you sure you want to delete it?\n\nThis action cannot be undone and will affect the entire team.';
        }
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        if (!projectsDB || !projectsCurrentUser) {
            showProjectNotification('ERROR: Cannot delete project: Not properly connected', 'error');
            return;
        }
        
        try {
            await projectsDB.collection('projects').doc(projectId).delete();
            console.log('SUCCESS: Project deleted:', projectId);
            
            const successMessage = isOwner 
                ? 'SUCCESS: Your project deleted successfully!' 
                : 'SUCCESS: Team project deleted successfully!';
                
            showProjectNotification(successMessage, 'success');
            await loadProjectsFromFirebase();
            
            // Trigger dashboard update event
            if (typeof window.dispatchEvent === 'function') {
                const projectEvent = new CustomEvent('projectUpdated', {
                    detail: { 
                        projectId: projectId, 
                        action: 'deleted',
                        name: projectName,
                        status: project.status
                    }
                });
                
                const deletedEvent = new CustomEvent('projectDeleted', {
                    detail: {
                        projectId: projectId,
                        projectName: projectName,
                        timestamp: new Date().toISOString()
                    }
                });
                
                window.dispatchEvent(projectEvent);
                window.dispatchEvent(deletedEvent);
                
                console.log('EVENT: Project deletion events dispatched for dashboard activity tracking');
            }
            
        } catch (error) {
            handleFirebaseError(error, 'deleting project');
        }
    };

    // Edit project - populate modal - Global function
    window.editProject = function(projectId) {
        const project = projectsList.find(function(p) { return p.id === projectId; });
        if (!project) return;
        
        const elements = {
            id: document.getElementById('editProjectId'),
            name: document.getElementById('editProjectName'),
            deadline: document.getElementById('editProjectDeadline'),
            description: document.getElementById('editProjectDescription'),
            status: document.getElementById('editProjectStatus'),
            priority: document.getElementById('editProjectPriority'),
            progress: document.getElementById('editProjectProgress')
        };
        
        // Check if all elements exist
        const missingElements = Object.keys(elements).filter(key => !elements[key]);
        if (missingElements.length > 0) {
            console.error('ERROR: Missing edit form elements:', missingElements);
            showProjectNotification('ERROR: Edit form not properly loaded', 'error');
            return;
        }
        
        // Populate form
        elements.id.value = project.id;
        elements.name.value = project.name || '';
        elements.deadline.value = project.deadline || '';
        elements.description.value = project.description || '';
        elements.status.value = project.status || '';
        elements.priority.value = project.priority || '';
        elements.progress.value = project.progress || 0;
        
        const modal = new bootstrap.Modal(document.getElementById('editProjectModal'));
        modal.show();
    };

    // View project details - Global function
    window.viewProject = function(projectId) {
        const project = projectsList.find(function(p) { return p.id === projectId; });
        if (!project) return;
        
        const details = 'Project: ' + project.name + '\nAuthor: ' + (project.authorName || project.authorEmail) + '\nStatus: ' + project.status + '\nPriority: ' + project.priority + '\nProgress: ' + project.progress + '%\nDeadline: ' + new Date(project.deadline).toLocaleDateString() + '\nDescription: ' + project.description;
        
        alert(details);
    };

    // Collaborate on project - Global function
    window.collaborateOnProject = function(projectId) {
        const project = projectsList.find(function(p) { return p.id === projectId; });
        if (!project) return;
        
        const collaborationMessage = 'Collaborate on: ' + project.name + '\n\nThis project belongs to ' + (project.authorName || project.authorEmail) + '.\nYou can view and edit this project as part of team collaboration.\n\nWould you like to edit the project?\n\nNote: Any changes you make will be visible to the entire team.';
        
        if (confirm(collaborationMessage)) {
            editProject(projectId);
        }
    };

    // Render projects - Helper function
    function renderProjects() {
        console.log('RENDER: Rendering projects...');
        
        const container = document.getElementById('projectsContainer');
        if (!container) {
            console.error('ERROR: Projects container not found');
            return;
        }
        
        container.innerHTML = '';
        
        if (projectsList.length === 0) {
            showEmptyState();
            return;
        }
        
        projectsList.forEach(function(project) {
            const projectCard = createProjectCard(project);
            container.appendChild(projectCard);
        });
        
        console.log('RENDER: Rendered', projectsList.length, 'projects');
    }

    // Create project card element
    function createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-project-id', project.id);
        
        const isOwner = projectsCurrentUser && project.userId === projectsCurrentUser.uid;
        
        // Calculate progress percentage safely
        const progressValue = Math.max(0, Math.min(100, parseInt(project.progress) || 0));
        
        card.innerHTML = `
            <div class="project-header">
                <h3 class="project-title">${escapeHtml(project.name)}</h3>
            </div>
            <div class="project-meta">
                <span class="project-author">
                    <i class="fas fa-user"></i> ${escapeHtml(project.authorName || project.authorEmail || 'Unknown')}
                    ${!isOwner ? '<i class="fas fa-users" title="Team Project" style="margin-left: 0.5rem;"></i>' : ''}
                </span>
                <span class="project-status ${(project.status || 'planning').toLowerCase()}">${project.status || 'Planning'}</span>
                <span class="project-priority ${(project.priority || 'medium').toLowerCase()}">${project.priority || 'Medium'}</span>
            </div>
            <p class="project-description">${escapeHtml(project.description || 'No description provided.')}</p>
            <div class="project-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressValue}%"></div>
                </div>
                <span class="progress-text">${progressValue}%</span>
            </div>
            <div class="project-footer">
                <span class="project-deadline">
                    <i class="fas fa-calendar"></i> ${new Date(project.deadline).toLocaleDateString()}
                </span>
                <div class="project-actions">
                    ${!isOwner ? `
                        <button class="project-btn btn-view" onclick="collaborateOnProject('${project.id}')" title="Collaborate on Team Project">
                            <i class="fas fa-users"></i> Collaborate
                        </button>
                    ` : ''}
                    <button class="project-btn btn-edit" onclick="editProject('${project.id}')" title="Edit Project">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="project-btn btn-delete" onclick="deleteProject('${project.id}', '${escapeHtml(project.name).replace(/'/g, '\\\'')}')" title="Delete Project">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `;
        
        return card;
    }

    // Escape HTML to prevent XSS
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Update project statistics
    function updateProjectStats() {
        const totalEl = document.getElementById('total-projects');
        const activeEl = document.getElementById('active-projects');
        const completedEl = document.getElementById('completed-projects');
        const overdueEl = document.getElementById('overdue-projects');
        
        if (!totalEl || !activeEl || !completedEl || !overdueEl) {
            console.warn('STATS: Stats elements not found');
            return;
        }
        
        const total = projectsList.length;
        const completed = projectsList.filter(p => p.status === 'Completed').length;
        const active = total - completed;
        
        const now = new Date();
        const overdue = projectsList.filter(p => {
            if (p.status === 'Completed') return false;
            const deadline = new Date(p.deadline);
            return deadline < now;
        }).length;
        
        totalEl.textContent = total;
        activeEl.textContent = active;
        completedEl.textContent = completed;
        overdueEl.textContent = overdue;
        
        console.log('STATS: Updated -', { total, active, completed, overdue });
    }

    // Show loading state
    function showLoadingState(show) {
        const loadingEl = document.getElementById('loadingState');
        const containerEl = document.getElementById('projectsContainer');
        const emptyEl = document.getElementById('emptyState');
        
        if (loadingEl) loadingEl.style.display = show ? 'block' : 'none';
        if (containerEl) containerEl.style.display = show ? 'none' : 'grid';
        if (emptyEl) emptyEl.style.display = 'none';
    }

    // Show empty state
    function showEmptyState() {
        const loadingEl = document.getElementById('loadingState');
        const containerEl = document.getElementById('projectsContainer');
        const emptyEl = document.getElementById('emptyState');
        
        if (loadingEl) loadingEl.style.display = 'none';
        if (containerEl) containerEl.style.display = 'none';
        if (emptyEl) emptyEl.style.display = 'block';
    }

    // Show permission error state
    function showPermissionErrorState() {
        const container = document.getElementById('projectsContainer');
        if (!container) return;
        
        container.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                <h3>Database Access Denied</h3>
                <p>Please check Firestore security rules.</p>
            </div>
        `;
    }

    // Setup project handlers
    function setupProjectHandlers() {
        console.log('HANDLERS: Setting up project handlers');
        
        // Create project form submit
        const createForm = document.getElementById('createProjectForm');
        if (createForm) {
            createForm.addEventListener('submit', function(e) {
                e.preventDefault();
                window.createProject();
            });
        }
        
        // Edit project form submit
        const editForm = document.getElementById('editProjectForm');
        if (editForm) {
            editForm.addEventListener('submit', function(e) {
                e.preventDefault();
                window.updateProject();
            });
        }
        
        // ADDED: Search input filter
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                console.log('FILTER: Search input changed:', this.value);
                applyFilters();
            });
        }
        
        // ADDED: Status filter dropdown
        const statusFilter = document.getElementById('statusFilter');
        if (statusFilter) {
            statusFilter.addEventListener('change', function() {
                console.log('FILTER: Status filter changed:', this.value);
                applyFilters();
            });
        }
        
        // ADDED: Priority filter dropdown
        const priorityFilter = document.getElementById('priorityFilter');
        if (priorityFilter) {
            priorityFilter.addEventListener('change', function() {
                console.log('FILTER: Priority filter changed:', this.value);
                applyFilters();
            });
        }
        
        // ADDED: View toggle buttons
        const viewToggles = document.querySelectorAll('.view-toggle');
        viewToggles.forEach(function(toggle) {
            toggle.addEventListener('click', function() {
                viewToggles.forEach(function(t) { t.classList.remove('active'); });
                this.classList.add('active');
                
                const view = this.dataset.view;
                const container = document.getElementById('projectsContainer');
                
                if (view === 'list') {
                    container.classList.add('list-view');
                } else {
                    container.classList.remove('list-view');
                }
                
                console.log('VIEW: Changed to', view);
            });
        });
        
        console.log('HANDLERS: Project handlers setup complete');
    }
    
    // ADDED: Apply filters function
    function applyFilters() {
        console.log('FILTER: Applying filters...');
        
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';
        const statusValue = statusFilter ? statusFilter.value.toLowerCase() : 'all';
        const priorityValue = priorityFilter ? priorityFilter.value.toLowerCase() : 'all';
        
        console.log('FILTER: Search:', searchTerm, 'Status:', statusValue, 'Priority:', priorityValue);
        
        // Filter projects
        const filteredProjects = projectsList.filter(function(project) {
            // Search filter
            if (searchTerm && searchTerm.length > 0) {
                const nameMatch = project.name && project.name.toLowerCase().includes(searchTerm);
                const descMatch = project.description && project.description.toLowerCase().includes(searchTerm);
                const authorMatch = project.authorName && project.authorName.toLowerCase().includes(searchTerm);
                
                if (!nameMatch && !descMatch && !authorMatch) {
                    return false;
                }
            }
            
            // Status filter
            if (statusValue !== 'all') {
                const projectStatus = (project.status || 'planning').toLowerCase();
                if (projectStatus !== statusValue) {
                    return false;
                }
            }
            
            // Priority filter
            if (priorityValue !== 'all') {
                const projectPriority = (project.priority || 'medium').toLowerCase();
                if (projectPriority !== priorityValue) {
                    return false;
                }
            }
            
            return true;
        });
        
        console.log('FILTER: Filtered projects:', filteredProjects.length, '/', projectsList.length);
        
        // Render filtered projects
        renderFilteredProjects(filteredProjects);
    }
    
    // ADDED: Render filtered projects
    function renderFilteredProjects(filteredProjects) {
        console.log('RENDER: Rendering filtered projects...');
        
        const container = document.getElementById('projectsContainer');
        if (!container) {
            console.error('ERROR: Projects container not found');
            return;
        }
        
        container.innerHTML = '';
        
        if (filteredProjects.length === 0) {
            // Show filtered empty state
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'col-span-full text-center py-12';
            emptyDiv.innerHTML = `
                <div class="empty-projects" style="display: block;">
                    <div class="empty-icon">
                        <i class="fas fa-filter"></i>
                    </div>
                    <h4>No Projects Match Your Filters</h4>
                    <p>Try adjusting your search criteria or clear filters to see all projects.</p>
                    <button class="btn-modern btn-secondary" onclick="clearProjectFilters()">
                        <i class="fas fa-times"></i> Clear Filters
                    </button>
                </div>
            `;
            container.appendChild(emptyDiv);
            return;
        }
        
        filteredProjects.forEach(function(project) {
            const projectCard = createProjectCard(project);
            container.appendChild(projectCard);
        });
        
        console.log('RENDER: Rendered', filteredProjects.length, 'filtered projects');
    }
    
    // ADDED: Clear filters function (Global)
    window.clearProjectFilters = function() {
        console.log('FILTER: Clearing all filters...');
        
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        if (searchInput) searchInput.value = '';
        if (statusFilter) statusFilter.value = 'all';
        if (priorityFilter) priorityFilter.value = 'all';
        
        // Re-render all projects
        renderProjects();
        
        showProjectNotification('? Filters cleared!', 'info');
        console.log('FILTER: Filters cleared successfully');
    };
    
    // ADDED: Refresh projects function (Global)
    window.refreshProjects = function() {
        console.log('REFRESH: Manually refreshing projects...');
        
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            const originalHTML = refreshBtn.innerHTML;
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt fa-spin"></i><span>Refreshing...</span>';
            refreshBtn.disabled = true;
            
            loadProjectsFromFirebase().finally(function() {
                refreshBtn.innerHTML = originalHTML;
                refreshBtn.disabled = false;
            });
        } else {
            loadProjectsFromFirebase();
        }
        
        showProjectNotification('?? Refreshing projects...', 'info');
    };


    // Initialize when ready
    initializeProjects();
    
    console.log('PROJECTS: Company Projects script loaded');

})();