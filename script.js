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
    
    // Update active class in TOC - WORKS WITH YOUR BUTTON ORDER
    document.querySelectorAll('.chapter-link').forEach((btn) => {
        // Extract chapter number from the onclick attribute
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr && onclickAttr.includes(`showChapter(${num})`)) {
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
    document.documentElement.style.backgroundAttachment = 'scroll';
}

// iOS Safari bottom bar fix - improved
function fixSafariBottomBar() {
    // Check if Safari on iOS
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    
    if (isIOS) {
        // Get the actual visible viewport height
        const visibleHeight = window.innerHeight;
        
        // Apply to body and html
        document.body.style.minHeight = visibleHeight + 'px';
        document.documentElement.style.minHeight = visibleHeight + 'px';
        
        // Fix for jumpToTop button
        const jumpBtn = document.getElementById('jumpToTop');
        if (jumpBtn && !jumpBtn.classList.contains('hidden')) {
            // Ensure button is above bottom bar
            jumpBtn.style.bottom = `max(30px, ${window.visualViewport ? window.visualViewport.height - window.innerHeight + 30 : 30}px)`;
        }
        
        // Add extra padding to chapter-nav on iOS
        const chapterNav = document.querySelector('.chapter-nav');
        if (chapterNav) {
            const bottomBarHeight = window.visualViewport ? 
                window.visualViewport.height - window.innerHeight : 0;
            chapterNav.style.paddingBottom = `calc(2rem + ${bottomBarHeight}px)`;
        }
    }
}

// iOS viewport height fix - SIMPLIFIED
function setVh() {
    // For iOS specifically, ensure body takes full height
    if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
        const height = window.innerHeight;
        document.body.style.minHeight = height + 'px';
        document.documentElement.style.height = height + 'px';
        
        // Additional fix for bottom bar
        fixSafariBottomBar();
    }
}

// Call setVh on various events
setVh();
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', setVh);

// Use visualViewport API if available (more accurate for Safari)
if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', function() {
        if (navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
            fixSafariBottomBar();
        }
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

    // ============= JUMP TO TOP - COMPLETELY REWRITTEN FOR MOBILE SAFARI =============
    const jumpBtn = document.getElementById('jumpToTop');
    const tocContainer = document.querySelector('.toc-container');

    if (jumpBtn) {
        function checkScroll() {
            // Get scroll position (works on all browsers)
            const scrollTop = window.pageYOffset || 
                             document.documentElement.scrollTop || 
                             document.body.scrollTop || 
                             0;
            
            if (tocContainer) {
                const tocRect = tocContainer.getBoundingClientRect();
                const isPastTOC = tocRect.bottom < 50;
                
                if (isPastTOC || scrollTop > 150) {
                    jumpBtn.classList.remove('hidden');
                    // Update button position for bottom bar
                    if (window.visualViewport) {
                        const bottomBarHeight = window.visualViewport.height - window.innerHeight;
                        jumpBtn.style.bottom = `max(30px, ${bottomBarHeight + 30}px)`;
                    }
                } else {
                    jumpBtn.classList.add('hidden');
                }
            } else {
                if (scrollTop > 150) {
                    jumpBtn.classList.remove('hidden');
                } else {
                    jumpBtn.classList.add('hidden');
                }
            }
        }
        
        // SIMPLE SCROLL TO TOP FUNCTION THAT WORKS ON SAFARI
        function scrollToTop() {
            // Hide button
            jumpBtn.classList.add('hidden');
            
            // METHOD 1: Simple instant scroll (always works)
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
            
            // METHOD 2: Try smooth scroll (may not work on Safari, but that's okay)
            try {
                window.scrollTo({
                    top: 0,
                    behavior: 'smooth'
                });
            } catch (e) {
                // Ignore errors, we already did instant scroll
            }
            
            return false;
        }
        
        // CLICK EVENT (works on all browsers)
        jumpBtn.addEventListener('click', function(e) {
            e.preventDefault();
            scrollToTop();
            return false;
        });
        
        // TOUCH EVENT for mobile
        jumpBtn.addEventListener('touchstart', function(e) {
            e.preventDefault();
            scrollToTop();
            return false;
        }, { passive: false });
        
        // Scroll monitoring
        let ticking = false;
        window.addEventListener('scroll', function() {
            if (!ticking) {
                window.requestAnimationFrame(function() {
                    checkScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
        
        // Additional events
        window.addEventListener('touchend', checkScroll);
        window.addEventListener('resize', checkScroll);
        
        // Periodic check
        setInterval(checkScroll, 200);
        
        // Initial check
        setTimeout(checkScroll, 100);
        checkScroll();
    }
    
    // Apply Safari bottom bar fix after load
    setTimeout(fixSafariBottomBar, 300);
});

// Run fix again after full page load
window.addEventListener('load', function() {
    fixSafariBottomBar();
    setVh();
});