// Make functions global by attaching to window
window.currentChapter = 1;

// Function to show a specific chapter
window.showChapter = function(num) {
    // Hide all chapters
    for (let i = 1; i <= 10; i++) {
        let chapter = document.getElementById('chapter' + i);
        if (chapter) chapter.style.display = 'none';
    }
    
    // Show selected chapter
    let selectedChapter = document.getElementById('chapter' + num);
    if (selectedChapter) selectedChapter.style.display = 'block';
    
    // Update active class in TOC
    const chapterWords = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
    const targetText = 'Chapter ' + chapterWords[num-1];
    
    document.querySelectorAll('.chapter-link').forEach((btn) => {
        if (btn.textContent.trim() === targetText) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    
    // Update chapter number and buttons
    window.currentChapter = num;
    let indicator = document.getElementById('chapterIndicator');
    if (indicator) indicator.textContent = num + ' / 10';
    
    let prevBtn = document.getElementById('prevBtn');
    let nextBtn = document.getElementById('nextBtn');
    
    if (prevBtn) prevBtn.disabled = (num === 1);
    if (nextBtn) nextBtn.disabled = (num === 10);
    
    // Save to browser
    localStorage.setItem('currentChapter', num);
};

// Function to change chapter by direction
window.changeChapter = function(direction) {
    let newChapter = window.currentChapter + direction;
    if (newChapter >= 1 && newChapter <= 10) {
        window.showChapter(newChapter);
    }
};

// Function to update dark/light mode
function updateDarkMode(isDark) {
    if (isDark) {
        // Dark mode - remove light class
        document.documentElement.classList.remove('light');
        document.body.classList.remove('light');
        
        // Set dark background
        document.documentElement.style.backgroundColor = '#0a0e1a';
        document.documentElement.style.backgroundImage = "url('assets/darkmodeland.jpg')";
    } else {
        // Light mode - add light class
        document.documentElement.classList.add('light');
        document.body.classList.add('light');
        
        // Set light background
        document.documentElement.style.backgroundColor = '#e0e6f0';
        document.documentElement.style.backgroundImage = "url('assets/lightmodetree.jpg')";
    }
    
    // Ensure background properties are set
    document.documentElement.style.backgroundSize = 'cover';
    document.documentElement.style.backgroundPosition = 'center';
    document.documentElement.style.backgroundAttachment = 'scroll'; // Changed from fixed to scroll
}

// iOS viewport height fix - COMPREHENSIVE
function setVh() {
    // Get the actual viewport height
    const vh = window.innerHeight * 0.01;
    const height = window.innerHeight;
    const width = window.innerWidth;
    
    // Set CSS variables
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    document.documentElement.style.setProperty('--window-height', `${height}px`);
    document.documentElement.style.setProperty('--window-width', `${width}px`);
    
    // For iOS specifically, set body height
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        document.body.style.minHeight = height + 'px';
        
        // Also ensure html takes full height
        document.documentElement.style.height = height + 'px';
        
        // Log for debugging
        console.log('iOS height set to:', height);
    }
}

// Call setVh on various events
setVh();
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', setVh);
window.addEventListener('scroll', function() {
    // Debounced scroll handler
    if (!window.requestAnimationFrame) {
        setTimeout(setVh, 100);
    } else {
        window.requestAnimationFrame(setVh);
    }
});

// Additional fix for iOS keyboard showing/hiding
if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
    window.addEventListener('focusin', function(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            setTimeout(setVh, 300);
        }
    });
    
    window.addEventListener('focusout', function() {
        setTimeout(setVh, 300);
    });
}

// Wait for page to load before setting up
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DARK MODE DIAGNOSIS ===');
    
    // Dark mode toggle
    let darkModeBtn = document.getElementById('darkmode-toggle');
    if (darkModeBtn) {
        console.log('Dark mode button found');
        
        darkModeBtn.addEventListener('click', function() {
            console.log('=== BUTTON CLICKED ===');
            
            // Check if light class exists (meaning we're in light mode)
            const isLight = document.body.classList.contains('light');
            
            // Update mode - if light class exists, go to dark; if not, go to light
            updateDarkMode(isLight);
            
            console.log('After toggle - Light class?', document.body.classList.contains('light'));
            
            localStorage.setItem('darkMode', document.body.classList.contains('light') ? 'light' : 'dark');
            console.log('Local storage saved as:', localStorage.getItem('darkMode'));
        });
    } else {
        console.log('ERROR: Dark mode button NOT found!');
    }

    // Load dark mode preference - DEFAULT TO DARK MODE
    console.log('Loading saved preference...');
    console.log('Local storage value:', localStorage.getItem('darkMode'));

    // Check if there's a saved preference
    const savedMode = localStorage.getItem('darkMode');
    
    if (savedMode === 'light') {
        // User previously chose light mode
        updateDarkMode(false);
        console.log('Setting to light mode based on storage');
    } else {
        // Default to dark mode (includes first-time visitors and those with 'dark' saved)
        updateDarkMode(true);
        // If first time, save the default
        if (!savedMode) {
            localStorage.setItem('darkMode', 'dark');
        }
        console.log('Setting to dark mode');
    }
    
    console.log('Body has light class?', document.body.classList.contains('light'));
    console.log('=== END DIAGNOSIS ===\n');

    // Load last chapter
    const savedChapter = localStorage.getItem('currentChapter');
    if (savedChapter) {
        window.showChapter(parseInt(savedChapter));
    } else {
        window.showChapter(1);
    }

    // JUMP TO TOP - IMPROVED FOR iOS
    const jumpBtn = document.getElementById('jumpToTop');
    const tocContainer = document.querySelector('.toc-container');
    let lastScrollY = window.scrollY;
    let ticking = false;

    if (jumpBtn) {
        function checkScroll() {
            const currentScrollY = window.scrollY;
            
            if (tocContainer) {
                const tocRect = tocContainer.getBoundingClientRect();
                
                // Use a more generous threshold for iOS
                const isPastTOC = tocRect.bottom < 100;
                const hasScrolledSignificantly = currentScrollY > 150;
                
                if (isPastTOC || hasScrolledSignificantly) {
                    jumpBtn.classList.remove('hidden');
                } else {
                    jumpBtn.classList.add('hidden');
                }
                
                lastScrollY = currentScrollY;
            } else {
                if (window.scrollY > 150) {
                    jumpBtn.classList.remove('hidden');
                } else {
                    jumpBtn.classList.add('hidden');
                }
            }
            ticking = false;
        }
        
        // Multiple event listeners for iOS
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(checkScroll);
                ticking = true;
            }
        });
        
        window.addEventListener('touchend', checkScroll);
        window.addEventListener('resize', checkScroll);
        
        // Periodic check for iOS
        setInterval(checkScroll, 200);
        
        // Initial check with delay to ensure DOM is ready
        setTimeout(checkScroll, 100);
        checkScroll();
        
        // Click handler
        jumpBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});