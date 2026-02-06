// Toggle dropdown menu - sidebar style
function toggleDropdown() {
    const dropdownContent = document.querySelector('.dropdown-content');
    const container = document.querySelector('.container');
    const body = document.body;
    
    if (dropdownContent && container) {
        const isOpen = dropdownContent.classList.contains('open');
        
        if (isOpen) {
            // Close menu
            dropdownContent.classList.remove('open');
            container.classList.remove('menu-open');
            body.classList.remove('menu-open');
        } else {
            // Open menu
            dropdownContent.classList.add('open');
            container.classList.add('menu-open');
            body.classList.add('menu-open');
        }
    }
}

// Open settings from navigation
function openSettingsFromNav() {
    // Close dropdown first
    const dropdownContent = document.querySelector('.dropdown-content');
    const container = document.querySelector('.container');
    const body = document.body;
    
    if (dropdownContent) {
        dropdownContent.classList.remove('open');
        container.classList.remove('menu-open');
        body.classList.remove('menu-open');
    }
    
    // Open settings popup if function exists
    if (typeof openAdditionalSettings === 'function') {
        openAdditionalSettings();
    } else {
        alert('Settings feature is only available on the Profile page.');
    }
}