/**
 * MOBILE TOUCH FIX - Completely new approach
 * This script intercepts touch events at the document level
 * and manually triggers clicks on interactive elements.
 */

(function() {
    'use strict';
    
    // Only run on touch devices
    const isTouchDevice = ('ontouchstart' in window) || 
                          (navigator.maxTouchPoints > 0) || 
                          (navigator.msMaxTouchPoints > 0);
    
    if (!isTouchDevice) {
        console.log('🖥️ Desktop detected, touch fix not needed');
        return;
    }
    
    console.log('📱 MOBILE TOUCH FIX ACTIVATED');
    
    // Track touch start position for detecting taps vs scrolls
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    let touchTarget = null;
    
    // Threshold for detecting a tap (not a scroll)
    const TAP_THRESHOLD = 15; // pixels
    const TAP_TIME_THRESHOLD = 300; // milliseconds
    
    // Selectors for interactive elements
    const INTERACTIVE_SELECTORS = [
        'button',
        'a',
        'input[type="submit"]',
        'input[type="button"]',
        '.btn',
        '[onclick]',
        '[role="button"]',
        '.theme-preview',
        '.chess-style-preview',
        '.notification-bell',
        '.user-dropdown-btn',
        '.hamburger-menu',
        '.nav-menu a',
        '.user-dropdown-item',
        '.logout-item',
        '#logout-btn',
        '#logout-profile-btn',
        '[data-route]',
        '.auth-link a',
        'select',
        'input[type="checkbox"]',
        'input[type="radio"]',
        'label[for]'
    ].join(', ');
    
    // Find the closest interactive element
    function findInteractiveElement(element) {
        if (!element || element === document.body || element === document.documentElement) {
            return null;
        }
        
        if (element.matches && element.matches(INTERACTIVE_SELECTORS)) {
            return element;
        }
        
        // Check parent elements
        return element.closest ? element.closest(INTERACTIVE_SELECTORS) : null;
    }
    
    // Handle touch start
    document.addEventListener('touchstart', function(e) {
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
        touchTarget = e.target;
        
        // Visual feedback
        const interactiveEl = findInteractiveElement(touchTarget);
        if (interactiveEl) {
            interactiveEl.style.opacity = '0.7';
            interactiveEl.style.transform = 'scale(0.98)';
        }
    }, { passive: true });
    
    // Handle touch end
    document.addEventListener('touchend', function(e) {
        const touch = e.changedTouches[0];
        const touchEndX = touch.clientX;
        const touchEndY = touch.clientY;
        const touchEndTime = Date.now();
        
        // Calculate movement
        const deltaX = Math.abs(touchEndX - touchStartX);
        const deltaY = Math.abs(touchEndY - touchStartY);
        const deltaTime = touchEndTime - touchStartTime;
        
        // Reset visual feedback
        const interactiveEl = findInteractiveElement(touchTarget);
        if (interactiveEl) {
            interactiveEl.style.opacity = '';
            interactiveEl.style.transform = '';
        }
        
        // Check if this was a tap (not a scroll)
        if (deltaX < TAP_THRESHOLD && deltaY < TAP_THRESHOLD && deltaTime < TAP_TIME_THRESHOLD) {
            const targetElement = document.elementFromPoint(touchEndX, touchEndY);
            const clickableElement = findInteractiveElement(targetElement);
            
            if (clickableElement) {
                console.log('📱 TAP detected on:', clickableElement.tagName, clickableElement.textContent?.substring(0, 30));
                
                // Prevent default and stop propagation
                e.preventDefault();
                
                // Handle different element types
                if (clickableElement.tagName === 'A') {
                    const href = clickableElement.getAttribute('href');
                    console.log('📱 Link tap:', href);
                    
                    if (href && href.startsWith('#')) {
                        // Hash link - trigger navigation
                        window.location.hash = href.substring(1);
                    } else if (href && !href.startsWith('javascript:')) {
                        // Regular link
                        window.location.href = href;
                    }
                } else if (clickableElement.tagName === 'BUTTON' || clickableElement.classList.contains('btn')) {
                    // Simulate click on button
                    clickableElement.click();
                } else if (clickableElement.tagName === 'INPUT') {
                    if (clickableElement.type === 'submit' || clickableElement.type === 'button') {
                        clickableElement.click();
                    } else if (clickableElement.type === 'checkbox' || clickableElement.type === 'radio') {
                        clickableElement.checked = !clickableElement.checked;
                        clickableElement.dispatchEvent(new Event('change', { bubbles: true }));
                    } else {
                        clickableElement.focus();
                    }
                } else if (clickableElement.tagName === 'SELECT') {
                    clickableElement.focus();
                    // Try to open the select dropdown
                    const event = new MouseEvent('mousedown', {
                        bubbles: true,
                        cancelable: true,
                        view: window
                    });
                    clickableElement.dispatchEvent(event);
                } else if (clickableElement.tagName === 'LABEL') {
                    const forId = clickableElement.getAttribute('for');
                    if (forId) {
                        const input = document.getElementById(forId);
                        if (input) {
                            input.focus();
                            if (input.type === 'checkbox' || input.type === 'radio') {
                                input.checked = !input.checked;
                                input.dispatchEvent(new Event('change', { bubbles: true }));
                            }
                        }
                    }
                } else {
                    // Generic click
                    clickableElement.click();
                }
            }
        }
        
        // Reset
        touchTarget = null;
    }, { passive: false });
    
    // Handle touch cancel
    document.addEventListener('touchcancel', function() {
        if (touchTarget) {
            const interactiveEl = findInteractiveElement(touchTarget);
            if (interactiveEl) {
                interactiveEl.style.opacity = '';
                interactiveEl.style.transform = '';
            }
        }
        touchTarget = null;
    }, { passive: true });
    
    // Disable any overlays that might be blocking touch
    function disableBlockingOverlays() {
        const overlays = document.querySelectorAll('.modal-overlay, .loading-overlay, .overlay');
        overlays.forEach(overlay => {
            const style = window.getComputedStyle(overlay);
            const isVisible = style.display !== 'none' && 
                             style.visibility !== 'hidden' && 
                             style.opacity !== '0';
            
            if (!isVisible || !overlay.classList.contains('active')) {
                overlay.style.pointerEvents = 'none';
                overlay.style.display = 'none';
            }
        });
    }
    
    // Run initially and on DOM changes
    disableBlockingOverlays();
    
    // Watch for DOM changes
    const observer = new MutationObserver(function(mutations) {
        disableBlockingOverlays();
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
    });
    
    // Debug helper - show what was touched
    if (localStorage.getItem('debug-touches') === 'true') {
        document.addEventListener('touchstart', function(e) {
            const el = e.target;
            console.log('🔍 TOUCH START:', {
                element: el.tagName,
                id: el.id,
                class: el.className,
                text: el.textContent?.substring(0, 50),
                styles: {
                    pointerEvents: window.getComputedStyle(el).pointerEvents,
                    zIndex: window.getComputedStyle(el).zIndex,
                    position: window.getComputedStyle(el).position
                }
            });
        }, { passive: true });
    }
    
    console.log('📱 Mobile touch fix initialized. Set localStorage["debug-touches"]="true" for debug info.');
    
})();
