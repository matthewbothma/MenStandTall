// Company Projects JavaScript - Wrapped in namespace to avoid conflicts
(function() {
    'use strict';
    
    console.log('?? Company Projects script starting...');

    let projectsCurrentUser = null;
    let projectsList = [];
    let projectsDB = null;
    let projectsFirebaseReady = false;
    
    // Show project notification - MOVED TO TOP for immediate availability
    function showProjectNotification(message, type = 'info') {
        console.log('?? showProjectNotification called:', message, type);
        
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
        
        console.log('? Notification displayed successfully');
    }
    
    // Make showProjectNotification available globally immediately
    window.showProjectNotification = showProjectNotification;

    // Test function to verify notification works - ADDED FOR TESTING
    window.testProjectNotification = function() {
        console.log('?? Testing project notification function...');
        if (typeof window.showProjectNotification === 'function') {
            window.showProjectNotification('? Project notification system is working!', 'success');
            console.log('? Test notification called successfully');
        } else {
            console.error('? showProjectNotification is not available');
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
        console.log('?? Waiting for Firebase...');
        
        let attempts = 0;
        const maxAttempts = 100;
        
        function checkFirebase() {
            attempts++;
            console.log('?? Firebase check attempt ' + attempts + '/' + maxAttempts);
            
            if (window.firebaseAuth && window.firebaseDB) {
                console.log('? Firebase ready for company projects');
                projectsFirebaseReady = true;
                callback();
                return;
            }
            
            if (attempts >= maxAttempts) {
                console.error('? Firebase failed to initialize');
                showProjectNotification('? Firebase connection failed. Please refresh the page.', 'error');
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
            console.log('? DOM is ready for projects');
            
            waitForProjectsFirebase(function() {
                console.log('? Firebase ready for company projects');
                
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
                    console.error('? Missing required DOM elements:', missingElements);
                    showProjectNotification('? Page elements not loaded correctly. Please refresh.', 'error');
                    return;
                }
                
                console.log('? All required DOM elements found');
                setupProjects();
                console.log('? Company Projects setup complete');
            });
        });
    }

    // Setup projects
    function setupProjects() {
        console.log('?? Setting up company projects');
        
        if (!window.firebaseAuth || !window.firebaseDB) {
            console.error('? Firebase not available');
            showProjectNotification('? Firebase not available. Please check your connection.', 'error');
            showEmptyState();
            return;
        }
        
        projectsDB = window.firebaseDB;
        console.log('? Firebase database reference set');
        
        // Note: Removed test connection to avoid permission errors
        // The actual data loading will test the connection
        
        window.firebaseAuth.onAuthStateChanged(function(user) {
            console.log('?? Auth state changed:', user ? user.email : 'No user');
            
            if (!user) {
                console.log('? No user, redirecting');
                window.location.href = '/';
            } else {
                projectsCurrentUser = user;
                console.log('? User authenticated:', user.email);
                setupProjectHandlers();
                loadProjectsFromFirebase();
            }
        });
    }

    // Handle Firebase errors
    function handleFirebaseError(error, operation) {
        console.error('? Firebase ' + operation + ' failed:', error);
        
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
        
        showProjectNotification('? ' + errorMessage, 'error');
        
        if (showPermissionError) {
            showPermissionErrorState();
        } else {
            showEmptyState();
        }
    }

    // Load ALL projects for company collaboration
    async function loadProjectsFromFirebase() {
        console.log('?? LOADING PROJECTS FROM FIREBASE');
        console.log('================================');
        
        if (!projectsDB || !projectsCurrentUser) {
            const errorMsg = `? Missing requirements - DB: ${!!projectsDB}, User: ${!!projectsCurrentUser}`;
            console.error(errorMsg);
            showProjectNotification('? Cannot load projects: Missing requirements', 'error');
            showEmptyState();
            return;
        }
        
        console.log('?? Starting project load for user:', projectsCurrentUser.email);
        showLoadingState(true);
        
        try {
            console.log('?? Querying projects collection...');
            
            let query = projectsDB.collection('projects');
            
            try {
                console.log('?? Attempting ordered query...');
                const snapshot = await query.orderBy('createdAt', 'desc').get();
                
                projectsList = snapshot.docs.map(function(doc) {
                    const data = doc.data();
                    return {
                        id: doc.id,
                        ...data
                    };
                });
                
                console.log('? Projects loaded with ordering:', projectsList.length);
                
            } catch (orderError) {
                console.log('?? OrderBy failed, loading without ordering:', orderError.message);
                
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
                
                console.log('? Projects loaded without ordering:', projectsList.length);
            }
            
            // Debug project data
            console.log('?? Project data summary:');
            projectsList.forEach((project, index) => {
                console.log(`  ${index + 1}. ${project.name} (${project.status}) - ${project.authorName || 'Unknown'}`);
            });
            
            if (projectsList.length === 0) {
                console.log('?? No projects found, showing empty state');
                showEmptyState();
            } else {
                console.log('?? Rendering projects...');
                renderProjects();
                
                // Show completion message if applicable
                const completedCount = projectsList.filter(p => p.status === 'Completed').length;
                if (completedCount === projectsList.length && projectsList.length > 0) {
                    showProjectNotification(`?? All ${projectsList.length} projects are completed!`, 'success');
                }
            }
            
            console.log('?? Updating project statistics...');
            updateProjectStats();
            
            console.log('? Project loading completed successfully');
            
        } catch (error) {
            console.error('? Error during project loading:', error);
            console.error('Error details:', {
                code: error.code,
                message: error.message,
                stack: error.stack
            });
            handleFirebaseError(error, 'loading projects');
        } finally {
            console.log('?? Hiding loading state');
            showLoadingState(false);
        }
    }

    // Create new project - ENHANCED with better validation and activity updates
    window.createProject = async function() {
        console.log('?? Creating new project...');
        
        if (!projectsDB || !projectsCurrentUser) {
            console.error('? Database or user not available');
            showProjectNotification('? Cannot create project: Not properly connected', 'error');
            return;
        }
        
        const form = document.getElementById('createProjectForm');
        if (!form) {
            console.error('? Create project form not found');
            showProjectNotification('? Form not found', 'error');
            return;
        }
        
        // Enhanced validation
        if (!validateProjectForm(form)) {
            console.log('?? Form validation failed, stopping creation');
            return;
        }
        
        // Get form data
        const formData = new FormData(form);
        const userName = projectsCurrentUser.displayName || (projectsCurrentUser.email ? projectsCurrentUser.email.split('@')[0] : 'User');
        
        // Clean name extraction (remove domain from email)
        const cleanUserName = userName.includes('@') ? userName.split('@')[0] : userName;
        
        const projectData = {
            name: formData.get('Name') || '',
            deadline: formData.get('Deadline') || '',
            description: formData.get('Description') || '',
            status: formData.get('Status') || 'Planning',
            priority: formData.get('Priority') || 'Medium',
            progress: parseInt(formData.get('Progress')) || 0,
            userId: projectsCurrentUser.uid,
            authorName: cleanUserName,
            authorEmail: projectsCurrentUser.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        console.log('?? Project data to create:', projectData);
        
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
            console.log('? Project created successfully with ID:', docRef.id);
            
            showProjectNotification('?? Project created and shared with team!', 'success');
            
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
                    authorName: cleanUserName,
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
            
            console.log('?? Project creation events dispatched for dashboard activity tracking');
            
        } catch (error) {
            console.error('? Error creating project:', error);
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
        console.log('?? Updating project...');
        
        const projectId = document.getElementById('editProjectId')?.value;
        const form = document.getElementById('editProjectForm');
        
        if (!form || !projectId) {
            console.error('? Edit project form or ID not found');
            showProjectNotification('? Form or project ID not found', 'error');
            return;
        }
        
        // Enhanced validation
        if (!validateProjectForm(form)) {
            console.log('?? Form validation failed, stopping update');
            return;
        }
        
        if (!projectsDB || !projectsCurrentUser) {
            showProjectNotification('? Cannot update project: Not properly connected', 'error');
            return;
        }
        
        // Get current project data for comparison
        const oldProject = projectsList.find(p => p.id === projectId);
        if (!oldProject) {
            showProjectNotification('? Project not found', 'error');
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
        
        console.log('?? Project data to update:', projectData);
        console.log('?? Changes detected:', { statusChanged, progressChanged, nameChanged });
        
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
            console.log('? Project updated:', projectId);
            
            // Show appropriate success message
            let successMessage = '? Project updated successfully!';
            if (statusChanged && newStatus === 'Completed') {
                successMessage = '?? Project marked as completed! Dashboard will update shortly.';
            } else if (statusChanged) {
                successMessage = `?? Project status changed to ${newStatus}!`;
            } else if (progressChanged) {
                successMessage = `?? Project progress updated to ${newProgress}%!`;
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
            
            console.log('?? Project update and activity events dispatched');
            
        } catch (error) {
            console.error('? Error updating project:', error);
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
            showProjectNotification('? Project not found', 'error');
            return;
        }
        
        const isOwner = projectsCurrentUser && project.userId === projectsCurrentUser.uid;
        
        let confirmMessage;
        if (isOwner) {
            confirmMessage = 'Are you sure you want to delete "' + projectName + '"? This action cannot be undone.';
        } else {
            confirmMessage = '?? WARNING: You are about to delete "' + projectName + '" created by ' + (project.authorName || project.authorEmail) + '.\n\nThis is a team project that doesn\'t belong to you. Are you sure you want to delete it?\n\nThis action cannot be undone and will affect the entire team.';
        }
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        if (!projectsDB || !projectsCurrentUser) {
            showProjectNotification('? Cannot delete project: Not properly connected', 'error');
            return;
        }
        
        try {
            await projectsDB.collection('projects').doc(projectId).delete();
            console.log('? Project deleted:', projectId);
            
            const successMessage = isOwner 
                ? '? Your project deleted successfully!' 
                : '? Team project deleted successfully!';
                
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
                
                console.log('??? Project deletion events dispatched for dashboard activity tracking');
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
            description: document.getElementById('editProjectDescription'),  // FIXED: Added missing closing parenthesis
            status: document.getElementById('editProjectStatus'),
            priority: document.getElementById('editProjectPriority'),
            progress: document.getElementById('editProjectProgress')
        };
        
        // Check if all elements exist
        const missingElements = Object.keys(elements).filter(key => !elements[key]);
        if (missingElements.length > 0) {
            console.error('? Missing edit form elements:', missingElements);
            showProjectNotification('? Edit form not properly loaded', 'error');
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
        
        const collaborationMessage = '?? Collaborate on: ' + project.name + '\n\nThis project belongs to ' + (project.authorName || project.authorEmail) + '.\nYou can view and edit this project as part of team collaboration.\n\nWould you like to edit the project?\n\nNote: Any changes you make will be visible to the entire team.';
        
        if (confirm(collaborationMessage)) {
            window.editProject(projectId);
        }
    };

    // Refresh projects with better error handling - Global function
    window.refreshProjects = async function() {
        const refreshBtn = document.getElementById('refreshBtn');
        
        if (!refreshBtn) {
            console.warn('?? Refresh button not found');
            await loadProjectsFromFirebase();
            return;
        }
        
        const icon = refreshBtn.querySelector('i');
        
        if (icon) icon.classList.add('fa-spin');
        refreshBtn.disabled = true;
        
        try {
            console.log('?? Refreshing projects...');
            await loadProjectsFromFirebase();
            showProjectNotification('? Company projects refreshed!', 'success');
        } catch (error) {
            console.error('? Error refreshing projects:', error);
            handleFirebaseError(error, 'refreshing projects');
        } finally {
            if (icon) icon.classList.remove('fa-spin');
            refreshBtn.disabled = false;
        }
    };

    // Render projects with null checks
    function renderProjects() {
        const container = document.getElementById('projectsContainer');
        
        if (!container) {
            console.error('? Projects container not found in DOM');
            return;
        }
        
        if (projectsList.length === 0) {
            showEmptyState();
            return;
        }
        
        console.log('?? Rendering projects in grid layout');
        
        // Clear container and reset to grid display
        container.innerHTML = '';
        container.style.display = 'grid';
        container.removeAttribute('data-state');
        
        // Hide other states before showing projects
        hideOtherStates();
        
        try {
            projectsList.forEach(function(project) {
                const projectCard = createProjectCard(project);
                container.appendChild(projectCard);
            });
            
            // Animate cards
            setTimeout(function() {
                animateProjectCards();
            }, 100);
            
            console.log('? Projects rendered successfully:', projectsList.length);
            
        } catch (error) {
            console.error('? Error rendering projects:', error);
            showProjectNotification('?? Error displaying projects', 'warning');
        }
    }

    // Validate project form with better error handling
    function validateProjectForm(form) {
        if (!form) {
            console.error('? Form not provided to validateProjectForm');
            showProjectNotification('? Form validation error', 'error');
            return false;
        }
        
        console.log('?? Validating project form...');
        
        // Get all required fields within the form
        const requiredFields = form.querySelectorAll('input[required], textarea[required], select[required]');
        let isValid = true;
        let missingFields = [];
        
        requiredFields.forEach(function(field) {
            const fieldName = field.getAttribute('name') || field.id || 'Unknown field';
            const value = field.value ? field.value.trim() : '';
            
            console.log(`?? Checking field ${fieldName}: "${value}"`);
            
            if (!value) {
                field.classList.add('is-invalid');
                missingFields.push(fieldName);
                isValid = false;
                
                // Add error styling
                field.style.borderColor = '#ef4444';
                field.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            } else {
                field.classList.remove('is-invalid');
                
                // Remove error styling
                field.style.borderColor = '';
                field.style.backgroundColor = '';
            }
        });
        
        if (!isValid) {
            const message = `?? Missing required fields: ${missingFields.join(', ')}`;
            console.warn('?? Form validation failed:', missingFields);
            showProjectNotification(message, 'warning');
            
            // Focus on first invalid field
            const firstInvalidField = form.querySelector('.is-invalid');
            if (firstInvalidField) {
                firstInvalidField.focus();
            }
        } else {
            console.log('? Form validation passed');
        }
        
        return isValid;
    }

    // Create project card element
    function createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card status-' + project.status.toLowerCase().replace(' ', '');
        card.setAttribute('data-status', project.status.toLowerCase().replace(' ', ''));
        card.setAttribute('data-priority', project.priority.toLowerCase());
        
        const statusBadgeClass = getStatusBadgeClass(project.status);
        const progressClass = getProgressClass(project.progress);
        const isOverdue = new Date(project.deadline) < new Date() && project.status !== 'Completed';
        
        const isOwner = projectsCurrentUser && project.userId === projectsCurrentUser.uid;
        const authorName = project.authorName || project.authorEmail || 'Unknown User';
        
        // FIXED: Remove question marks from author badges
        const authorBadge = isOwner 
            ? '<span class="author-badge owner">?? You</span>' 
            : '<span class="author-badge">?? ' + escapeHtml(authorName) + '</span>';
        
        const priorityIcon = project.priority === 'High' ? '<i class="fas fa-exclamation-triangle priority-indicator" title="High Priority"></i>' : '';
        const overdueClass = isOverdue ? 'overdue' : '';
        const overdueText = isOverdue ? 'Overdue: ' : 'Due: ';
        
        const actionsHtml = isOwner ? 
            '<button class="btn-action btn-edit" onclick="editProject(\'' + project.id + '\')" title="Edit Project">' +
            '<i class="fas fa-edit"></i>' +
            '</button>' +
            '<button class="btn-action btn-delete" onclick="deleteProject(\'' + project.id + '\', \'' + escapeHtml(project.name) + '\')" title="Delete Project">' +
            '<i class="fas fa-trash"></i>' +
            '</button>' :
            '<button class="btn-action btn-edit" onclick="editProject(\'' + project.id + '\')" title="Edit Project">' +
            '<i class="fas fa-edit"></i>' +
            '</button>' +
            '<button class="btn-action btn-collaborate" onclick="collaborateOnProject(\'' + project.id + '\')" title="Collaborate">' +
            '<i class="fas fa-users"></i>' +
            '</button>';
        
        card.innerHTML = '<div class="project-header">' +
            '<h3 class="project-title">' + escapeHtml(project.name) + '</h3>' +
            '<div class="project-header-badges">' + priorityIcon + '</div>' +
            '</div>' +
            '<div class="project-author">' + authorBadge + '</div>' +
            '<p class="project-description">' + escapeHtml(project.description) + '</p>' +
            '<div class="project-meta">' +
            '<span class="status-badge ' + statusBadgeClass + '">' + project.status + '</span>' +
            '<div class="deadline-info ' + overdueClass + '">' +
            '<i class="fas fa-calendar-alt"></i>' +
            '<span>' + overdueText + new Date(project.deadline).toLocaleDateString() + '</span>' +
            '</div>' +
            '</div>' +
            '<div class="progress-section">' +
            '<div class="progress-header">' +
            '<span class="progress-label">Progress</span>' +
            '<span class="progress-percentage">' + project.progress + '%</span>' +
            '</div>' +
            '<div class="progress-bar-container">' +
            '<div class="progress-bar-fill ' + progressClass + '" style="width: ' + project.progress + '%"></div>' +
            '</div>' +
            '</div>' +
            '<div class="project-actions">' +
            '<button class="btn-action btn-view" onclick="viewProject(\'' + project.id + '\')" title="View Details">' +
            '<i class="fas fa-eye"></i>' +
            '</button>' +
            actionsHtml +
            '</div>';
        
        return card;
    }

    // Animate project cards
    function animateProjectCards() {
        const cards = document.querySelectorAll('.project-card');
        cards.forEach(function(card, index) {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(function() {
                card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    // Utility functions
    function getStatusBadgeClass(status) {
        const statusMap = {
            'Planning': 'planning',
            'Active': 'active',
            'Completed': 'completed',
            'OnHold': 'onhold'
        };
        return statusMap[status] || 'planning';
    }

    function getProgressClass(progress) {
        if (progress >= 75) return 'high-progress';
        if (progress >= 50) return 'medium-progress';
        if (progress >= 25) return 'low-progress';
        return 'very-low-progress';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // UI state functions with proper null checks and fallbacks
    function showLoadingState(show) {
        const loadingState = document.getElementById('loadingState');
        const container = document.getElementById('projectsContainer');
        
        if (!loadingState) {
            console.warn('?? Loading state element not found in DOM - creating fallback');
            // Create a simple loading indicator if element doesn't exist
            if (container && show) {
                container.innerHTML = '<div style="text-align: center; padding: 2rem;"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';
            }
            return;
        }
        
        if (!container) {
            console.warn('?? Projects container element not found in DOM');
            return;
        }
        
        if (show) {
            loadingState.style.display = 'flex';
            container.style.display = 'grid';
            container.setAttribute('data-state', 'loading');
            hideOtherStates();
            console.log('?? Loading state shown and centered');
        } else {
            loadingState.style.display = 'none';
            container.removeAttribute('data-state');
            console.log('?? Loading state hidden');
        }
    }

    function showEmptyState() {
        const emptyState = document.getElementById('emptyState');
        const container = document.getElementById('projectsContainer');
        
        if (!emptyState) {
            console.warn('?? Empty state element not found in DOM - creating fallback');
            // Create a simple empty state if element doesn't exist
            if (container) {
                container.innerHTML = '<div style="text-align: center; padding: 3rem;"><h4>No Projects Found</h4><p>Create your first project to get started.</p></div>';
                container.style.display = 'flex';
                container.setAttribute('data-state', 'empty');
            }
            return;
        }
        
        if (!container) {
            console.warn('?? Projects container element not found in DOM');
            return;
        }
        
        container.style.display = 'flex';
        container.setAttribute('data-state', 'empty');
        emptyState.style.display = 'block';
        hideOtherStates();
        console.log('?? Empty state shown and centered');
    }

    function showPermissionErrorState() {
        const permissionError = document.getElementById('permissionError');
        const container = document.getElementById('projectsContainer');
        
        if (!permissionError) {
            console.warn('?? Permission error element not found in DOM - creating fallback');
            if (container) {
                container.innerHTML = '<div style="text-align: center; padding: 3rem; color: #ef4444;"><h4>Permission Error</h4><p>Unable to access projects. Please check your permissions.</p></div>';
                container.style.display = 'flex';
                container.setAttribute('data-state', 'error');
            }
            return;
        }
        
        if (!container) {
            console.warn('?? Projects container element not found in DOM');
            return;
        }
        
        container.style.display = 'flex';
        container.setAttribute('data-state', 'error');
        permissionError.style.display = 'block';
        hideOtherStates();
        console.log('?? Permission error state shown and centered');
    }

    function hideOtherStates() {
        const states = ['loadingState', 'emptyState', 'permissionError'];
        states.forEach(function(stateId) {
            const element = document.getElementById(stateId);
            if (element && element.style && !element.style.display.includes('block')) {
                element.style.display = 'none';
            }
        });
    }

    // Update project statistics with null checks and better status detection
    function updateProjectStats() {
        console.log('?? All projects:', projectsList.map(p => ({ 
            name: p.name, 
            status: p.status, 
            statusType: typeof p.status 
        })));
        
        // Fix: Better status filtering logic
        const stats = {
            total: projectsList.length,
            active: projectsList.filter(function(p) { 
                const status = p.status;
                // Active means NOT completed - check for exact status matches
                return status !== 'Completed' && status !== 'Complete' && status !== 'Done';
            }).length,
            completed: projectsList.filter(function(p) { 
                const status = p.status;
                // Completed projects
                return status === 'Completed' || status === 'Complete' || status === 'Done';
            }).length,
            overdue: projectsList.filter(function(p) { 
                const deadline = new Date(p.deadline);
                const now = new Date();
                const status = p.status;
                // Overdue: deadline passed AND not completed
                return deadline < now && status !== 'Completed' && status !== 'Complete' && status !== 'Done';
            }).length
        };
        
        const myProjects = projectsList.filter(function(p) { return projectsCurrentUser && p.userId === projectsCurrentUser.uid; }).length;
        const teamProjects = projectsList.length - myProjects;
        
        console.log('?? Updating project stats with better logic:', stats);
        console.log('?? My projects: ' + myProjects + ', ?? Team projects: ' + teamProjects);
        
        // Safely update stat elements with null checks
        const totalElement = document.getElementById('total-projects');
        const activeElement = document.getElementById('active-projects');
        const completedElement = document.getElementById('completed-projects');
        const overdueElement = document.getElementById('overdue-projects');
        
        if (totalElement) {
            totalElement.textContent = stats.total;
            console.log('? Updated total projects:', stats.total);
        }
        if (activeElement) {
            activeElement.textContent = stats.active;
            console.log('? Updated active projects:', stats.active);
        }
        if (completedElement) {
            completedElement.textContent = stats.completed;
            console.log('? Updated completed projects:', stats.completed);
        }
        if (overdueElement) {
            overdueElement.textContent = stats.overdue;
            console.log('? Updated overdue projects:', stats.overdue);
        }
    }

    // Setup project handlers with proper null checks and manual event binding
    function setupProjectHandlers() {
        console.log('?? Setting up project handlers');
        
        // Wait a bit for DOM elements to be fully ready
        setTimeout(function() {
            const searchInput = document.getElementById('searchInput');
            const statusFilter = document.getElementById('statusFilter');
            const priorityFilter = document.getElementById('priorityFilter');
            
            console.log('?? Filter elements check:', {
                searchInput: !!searchInput,
                statusFilter: !!statusFilter,
                priorityFilter: !!priorityFilter
            });
            
            if (searchInput) {
                // Remove existing listeners first
                searchInput.removeEventListener('input', filterProjects);
                searchInput.addEventListener('input', filterProjects);
                console.log('? Search input handler set up');
            } else {
                console.warn('?? Search input not found');
            }
            
            if (statusFilter) {
                // Remove existing listeners first
                statusFilter.removeEventListener('change', filterProjects);
                statusFilter.addEventListener('change', filterProjects);
                console.log('? Status filter handler set up');
                
                // Make sure dropdown is clickable
                statusFilter.style.pointerEvents = 'auto';
                statusFilter.style.cursor = 'pointer';
            } else {
                console.warn('?? Status filter not found');
            }
            
            if (priorityFilter) {
                // Remove existing listeners first
                priorityFilter.removeEventListener('change', filterProjects);
                priorityFilter.addEventListener('change', filterProjects);
                console.log('? Priority filter handler set up');
                
                // Make sure dropdown is clickable
                priorityFilter.style.pointerEvents = 'auto';
                priorityFilter.style.cursor = 'pointer';
            } else {
                console.warn('?? Priority filter not found');
            }
            
            // Setup clear button
            const clearButton = document.querySelector('.btn-clear-filters');
            if (clearButton) {
                clearButton.removeEventListener('click', window.clearProjectFilters);
                clearButton.addEventListener('click', window.clearProjectFilters);
                clearButton.style.pointerEvents = 'auto';
                clearButton.style.cursor = 'pointer';
                console.log('? Clear button handler set up');
            } else {
                console.warn('?? Clear button not found');
            }
            
            setupViewToggles();
            
            // Test the filters immediately
            setTimeout(function() {
                console.log('?? Testing filter functionality...');
                if (statusFilter && priorityFilter) {
                    console.log('?? Status options:', Array.from(statusFilter.options).map(o => o.value));
                    console.log('?? Priority options:', Array.from(priorityFilter.options).map(o => o.value));
                }
            }, 1000);
            
            console.log('? Project handlers set up successfully');
        }, 500);
    }

    // Global filter function for HTML onclick
    window.filterProjects = filterProjects;

    // Enhanced filter projects function with better error handling
    function filterProjects() {
        console.log('?? Filtering projects...');
        
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        if (!searchInput || !statusFilter || !priorityFilter) {
            console.warn('?? Filter elements not found:', {
                searchInput: !!searchInput,
                statusFilter: !!statusFilter,
                priorityFilter: !!priorityFilter
            });
            return;
        }
        
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusValue = statusFilter.value;
        const priorityValue = priorityFilter.value;
        
        console.log('?? Filter values:', {
            searchTerm: searchTerm,
            statusValue: statusValue,
            priorityValue: priorityValue
        });
        
        const cards = document.querySelectorAll('.project-card');
        let visibleCount = 0;
        
        console.log('?? Total cards to filter:', cards.length);
        
        cards.forEach(function(card, index) {
            const titleElement = card.querySelector('.project-title');
            const descriptionElement = card.querySelector('.project-description');
            
            if (!titleElement || !descriptionElement) {
                console.warn('?? Missing title or description in card', index);
                return;
            }
            
            const title = titleElement.textContent.toLowerCase();
            const description = descriptionElement.textContent.toLowerCase();
            const status = card.getAttribute('data-status');
            const priority = card.getAttribute('data-priority');
            
            // Check all filter criteria
            const matchesSearch = !searchTerm || title.includes(searchTerm) || description.includes(searchTerm);
            const matchesStatus = statusValue === 'all' || status === statusValue;
            const matchesPriority = priorityValue === 'all' || priority === priorityValue;
            
            const shouldShow = matchesSearch && matchesStatus && matchesPriority;
            
            if (shouldShow) {
                card.style.display = 'block';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
                visibleCount++;
            } else {
                card.style.display = 'none';
                card.style.opacity = '0';
                card.style.transform = 'translateY(10px)';
            }
        });
        
        // Show message if no results
        const container = document.getElementById('projectsContainer');
        if (container) {
            const existingMessage = container.querySelector('.no-results-message');
            if (existingMessage) {
                existingMessage.remove();
            }
            
            if (visibleCount === 0 && cards.length > 0) {
                const noResultsDiv = document.createElement('div');
                noResultsDiv.className = 'no-results-message';
                noResultsDiv.style.cssText = 'grid-column: 1 / -1; text-align: center; padding: 2rem; color: #6b7280;';
                noResultsDiv.innerHTML = `
                    <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5; color: var(--brand-orange);"></i>
                    <h4>No projects match your filters</h4>
                    <p>Try adjusting your search criteria or filters</p>
                    <button onclick="clearProjectFilters()" class="btn-modern" style="margin-top: 1rem;">
                        <i class="fas fa-times"></i> Clear Filters
                    </button>
                `;
                container.appendChild(noResultsDiv);
            }
        }
        
        console.log(`?? Filter applied: ${visibleCount} of ${cards.length} projects visible`);
        
        // Show notification about filter results
        if (searchTerm || statusValue !== 'all' || priorityValue !== 'all') {
            const filterMessage = `?? Showing ${visibleCount} project${visibleCount !== 1 ? 's' : ''} matching your filters`;
            showProjectNotification(filterMessage, 'info');
        }
    }

    // Enhanced clear filters function
    window.clearProjectFilters = function() {
        console.log('?? Clearing all filters...');
        
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        console.log('?? Filter elements for clearing:', {
            searchInput: !!searchInput,
            statusFilter: !!statusFilter,
            priorityFilter: !!priorityFilter
        });
        
        if (searchInput) {
            searchInput.value = '';
            console.log('?? Search input cleared');
        }
        
        if (statusFilter) {
            statusFilter.value = 'all';
            console.log('?? Status filter reset to "all"');
        }
        
        if (priorityFilter) {
            priorityFilter.value = 'all';
            console.log('?? Priority filter reset to "all"');
        }
        
        // Remove no results message
        const container = document.getElementById('projectsContainer');
        if (container) {
            const existingMessage = container.querySelector('.no-results-message');
            if (existingMessage) {
                existingMessage.remove();
            }
        }
        
        // Apply the cleared filters
        filterProjects();
        showProjectNotification('?? All filters cleared', 'success');
    };

    // Setup view toggles with null checks and smooth transitions
    function setupViewToggles() {
        const viewToggles = document.querySelectorAll('.view-toggle');
        const projectsContainer = document.getElementById('projectsContainer');
        
        if (!projectsContainer) {
            console.warn('?? Projects container not found for view toggles');
            return;
        }
        
        if (viewToggles.length === 0) {
            console.warn('?? No view toggle buttons found');
            return;
        }
        
        viewToggles.forEach(function(toggle) {
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                
                // Remove active class from all toggles
                viewToggles.forEach(function(t) { 
                    t.classList.remove('active'); 
                });
                
                // Add active class to clicked toggle
                this.classList.add('active');
                
                const view = this.getAttribute('data-view');
                const viewName = view === 'list' ? 'List View' : 'Grid View';
                
                // Apply view with smooth transition
                projectsContainer.style.transition = 'all 0.3s ease';
                
                if (view === 'list') {
                    projectsContainer.classList.add('list-view');
                    projectsContainer.style.gridTemplateColumns = '1fr';
                    
                    // Apply list-specific styling to cards
                    const cards = projectsContainer.querySelectorAll('.project-card');
                    cards.forEach(function(card) {
                        card.style.transition = 'all 0.3s ease';
                        card.style.margin = '0.5rem 0';
                        card.style.width = '100%';
                    });
                } else {
                    projectsContainer.classList.remove('list-view');
                    projectsContainer.style.gridTemplateColumns = 'repeat(auto-fill, minmax(350px, 1fr))';
                    
                    // Apply grid-specific styling to cards
                    const cards = projectsContainer.querySelectorAll('.project-card');
                    cards.forEach(function(card) {
                        card.style.transition = 'all 0.3s ease';
                        card.style.margin = '0';
                        card.style.width = 'auto';
                    });
                }
                
                console.log(`?? View changed to: ${viewName}`);
                showProjectNotification(`?? Switched to ${viewName}`, 'success');
            });
        });
        
        console.log('? View toggles set up');
    }

    // Force reinitialize handlers
    window.forceReinitHandlers = function() {
        console.log('?? Force reinitializing all handlers...');
        
        // Remove existing handlers
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        const searchInput = document.getElementById('searchInput');
        const clearBtn = document.querySelector('.btn-clear-filters');
        
        if (statusFilter) {
            statusFilter.removeEventListener('change', filterProjects);
            statusFilter.addEventListener('change', filterProjects);
            statusFilter.onchange = filterProjects;
            console.log('?? Status filter handlers reset');
        }
        
        if (priorityFilter) {
            priorityFilter.removeEventListener('change', filterProjects);
            priorityFilter.addEventListener('change', filterProjects);
            priorityFilter.onchange = filterProjects;
            console.log('?? Priority filter handlers reset');
        }
        
        if (searchInput) {
            searchInput.removeEventListener('input', filterProjects);
            searchInput.addEventListener('input', filterProjects);
            searchInput.oninput = filterProjects;
            console.log('?? Search input handlers reset');
        }
        
        if (clearBtn) {
            clearBtn.removeEventListener('click', window.clearProjectFilters);
            clearBtn.addEventListener('click', window.clearProjectFilters);
            clearBtn.onclick = window.clearProjectFilters;
            console.log('?? Clear button handlers reset');
        }
    };

    // Debug function to test dropdowns - Global function
    window.debugFilters = function() {
        console.log('?? DEBUGGING FILTER FUNCTIONALITY');
        console.log('================================');
        
        const searchInput = document.getElementById('searchInput');
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        const clearBtn = document.querySelector('.btn-clear-filters');
        
        console.log('?? Element Check:');
        console.log('- Search Input:', !!searchInput, searchInput);
        console.log('- Status Filter:', !!statusFilter, statusFilter);
        console.log('- Priority Filter:', !!priorityFilter, priorityFilter);
        console.log('- Clear Button:', !!clearBtn, clearBtn);
        
        if (statusFilter) {
            console.log('?? Status Filter Details:');
            console.log('- Value:', statusFilter.value);
            console.log('- Disabled:', statusFilter.disabled);
            console.log('- Pointer Events:', getComputedStyle(statusFilter).pointerEvents);
            console.log('- Options:', Array.from(statusFilter.options).map(o => ({value: o.value, text: o.text})));
            
            // Add visual debug
            statusFilter.setAttribute('data-debug', 'true');
            statusFilter.style.border = '3px solid red';
            statusFilter.style.background = 'yellow';
        }
        
        if (priorityFilter) {
            console.log('?? Priority Filter Details:');
            console.log('- Value:', priorityFilter.value);
            console.log('- Disabled:', priorityFilter.disabled);
            console.log('- Pointer Events:', getComputedStyle(priorityFilter).pointerEvents);
            console.log('- Options:', Array.from(priorityFilter.options).map(o => ({value: o.value, text: o.text})));
            
            // Add visual debug
            priorityFilter.setAttribute('data-debug', 'true');
            priorityFilter.style.border = '3px solid blue';
            priorityFilter.style.background = 'lightblue';
        }
        
        if (clearBtn) {
            console.log('?? Clear Button Details:');
            console.log('- Disabled:', clearBtn.disabled);
            console.log('- Pointer Events:', getComputedStyle(clearBtn).pointerEvents);
            console.log('- Click Handler:', clearBtn.onclick);
            
            // Add visual debug
            clearBtn.setAttribute('data-debug', 'true');
            clearBtn.style.border = '3px solid green';
            clearBtn.style.background = 'lightgreen';
        }
        
        console.log('?? Project Cards:', document.querySelectorAll('.project-card').length);
        
        return {
            searchInput,
            statusFilter,
            priorityFilter,
            clearBtn
        };
    };

    // Test change events manually
    window.testDropdownChange = function() {
        console.log('?? Testing dropdown change events...');
        
        const statusFilter = document.getElementById('statusFilter');
        const priorityFilter = document.getElementById('priorityFilter');
        
        if (statusFilter) {
            console.log('?? Current status value:', statusFilter.value);
            statusFilter.value = 'active';
            console.log('?? Changed status to:', statusFilter.value);
            
            // Trigger change event manually
            statusFilter.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('?? Dispatched change event for status filter');
        }
        
        if (priorityFilter) {
            console.log('?? Current priority value:', priorityFilter.value);
            priorityFilter.value = 'high';
            console.log('?? Changed priority to:', priorityFilter.value);
            
            // Trigger change event manually
            priorityFilter.dispatchEvent(new Event('change', { bubbles: true }));
            console.log('?? Dispatched change event for priority filter');
        }
    };

    // Force setup handlers after a delay (fallback)
    window.forceSetupHandlers = function() {
        console.log('?? Force setting up handlers...');
        setupProjectHandlers();
    };

    // Add manual event listeners as a fallback
    window.addEventListener('load', function() {
        console.log('?? Window loaded, setting up manual fallback handlers...');
        
        setTimeout(function() {
            const statusFilter = document.getElementById('statusFilter');
            const priorityFilter = document.getElementById('priorityFilter');
            const searchInput = document.getElementById('searchInput');
            const clearBtn = document.querySelector('.btn-clear-filters');
            
            if (statusFilter && !statusFilter.hasAttribute('data-handler-set')) {
                statusFilter.onchange = filterProjects;
                statusFilter.setAttribute('data-handler-set', 'true');
                console.log('?? Manual status filter handler set');
            }
            
            if (priorityFilter && !priorityFilter.hasAttribute('data-handler-set')) {
                priorityFilter.onchange = filterProjects;
                priorityFilter.setAttribute('data-handler-set', 'true');
                console.log('?? Manual priority filter set');
            }
            
            if (searchInput && !searchInput.hasAttribute('data-handler-set')) {
                searchInput.oninput = filterProjects;
                searchInput.setAttribute('data-handler-set', 'true');
                console.log('?? Manual search input handler set');
            }
            
            if (clearBtn && !clearBtn.hasAttribute('data-handler-set')) {
                clearBtn.onclick = window.clearProjectFilters;
                clearBtn.setAttribute('data-handler-set', 'true');
                console.log('?? Manual clear button handler set');
            }
        }, 2000);
    });
    
    // Call initialization
    initializeProjects();

    // Listen for custom Firebase ready event as backup
    window.addEventListener('firebaseReady', function() {
        console.log('?? Firebase ready event received');
        if (!projectsFirebaseReady) {
            initializeProjects();
        }
    });

    console.log('?? Company Projects script loaded');

    // Debug function to force project loading
    window.forceLoadProjects = function() {
        console.log('?? FORCE LOADING PROJECTS');
        console.log('========================');
        
        console.log('?? Current State:');
        console.log('- Firebase Ready:', projectsFirebaseReady);
        console.log('- Current User:', projectsCurrentUser ? projectsCurrentUser.email : 'None');
        console.log('- Database Available:', !!projectsDB);
        console.log('- Projects List Length:', projectsList.length);
        
        if (projectsDB && projectsCurrentUser) {
            console.log('? All requirements met, forcing load...');
            loadProjectsFromFirebase()
                .then(() => {
                    console.log('? Force load completed');
                })
                .catch((error) => {
                    console.error('? Force load failed:', error);
                });
        } else {
            console.log('? Requirements not met:');
            console.log('- Database:', !!projectsDB);
            console.log('- User:', !!projectsCurrentUser);
            
            if (!projectsCurrentUser) {
                console.log('?? Attempting to get current user...');
                if (window.firebaseAuth && window.firebaseAuth.currentUser) {
                    projectsCurrentUser = window.firebaseAuth.currentUser;
                    console.log('? Got current user:', projectsCurrentUser.email);
                    
                    if (!projectsDB && window.firebaseDB) {
                        projectsDB = window.firebaseDB;
                        console.log('? Got database reference');
                    }
                    
                    // Try loading again
                    loadProjectsFromFirebase()
                        .then(() => {
                            console.log('? Force load after retry completed');
                        })
                        .catch((error) => {
                            console.error('? Force load after retry failed:', error);
                        });
                } else {
                    console.log('? No current user available in Firebase Auth');
                }
            }
        }
    };
})();