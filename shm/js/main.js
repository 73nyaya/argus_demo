/**
 * Main Application Controller
 * Handles navigation and section initialization
 */

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCurrentSection();
});

/**
 * Initialize navigation between sections
 */
function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetSection = button.getAttribute('data-section');

            // Update active button
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update active section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetSection) {
                    section.classList.add('active');
                    initSection(targetSection);
                }
            });
        });
    });
}

/**
 * Initialize the currently active section
 */
function initCurrentSection() {
    const activeSection = document.querySelector('.content-section.active');
    if (activeSection) {
        initSection(activeSection.id);
    }
}

/**
 * Initialize a specific section
 */
function initSection(sectionId) {
    // Cleanup previous section if needed
    const previousSection = document.querySelector('.content-section.active');
    if (previousSection && previousSection.id === 'sensors' && sectionId !== 'sensors') {
        if (typeof cleanupSensors === 'function') {
            cleanupSensors();
        }
    }
    
    switch (sectionId) {
        case 'sensors':
            if (typeof initSensors === 'function') {
                initSensors();
            }
            break;
        case 'stress':
            if (typeof initStress === 'function') {
                initStress();
            }
            break;
        case 'code':
            if (typeof initCode === 'function') {
                initCode();
            }
            break;
        case 'modal':
            if (typeof initModal === 'function') {
                initModal();
            }
            break;
        case 'crack':
            if (typeof initCrack === 'function') {
                initCrack();
            }
            break;
        default:
            console.warn(`Unknown section: ${sectionId}`);
    }
}
