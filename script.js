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

// Wait for page to load before setting up
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== DARK MODE DIAGNOSIS ===');
    
    // Dark mode toggle
    let darkModeBtn = document.getElementById('darkmode-toggle');
    if (darkModeBtn) {
        console.log('Dark mode button found');
        
        darkModeBtn.addEventListener('click', function() {
            console.log('=== BUTTON CLICKED ===');
            console.log('Before toggle - Body has dark class?', document.body.classList.contains('dark'));
            
            document.body.classList.toggle('dark');
            
            console.log('After toggle - Body has dark class?', document.body.classList.contains('dark'));
            console.log('Current dark mode setting:', document.body.classList.contains('dark') ? 'dark' : 'light');
            
            localStorage.setItem('darkMode', document.body.classList.contains('dark') ? 'dark' : 'light');
            console.log('Local storage saved as:', localStorage.getItem('darkMode'));
        });
    } else {
        console.log('ERROR: Dark mode button NOT found!');
    }

    // Load dark mode preference - DEFAULT TO DARK MODE, BUT REMEMBER CHOICE
    console.log('Loading saved preference...');
    console.log('Local storage value:', localStorage.getItem('darkMode'));

    // Check if there's a saved preference
    if (localStorage.getItem('darkMode') === 'light') {
        document.body.classList.remove('dark');
        console.log('Setting to light mode based on storage');
    } else if (localStorage.getItem('darkMode') === 'dark') {
        document.body.classList.add('dark');
        console.log('Setting to dark mode based on storage');
    } else {
        // First time visiting - default to dark
        document.body.classList.add('dark');
        localStorage.setItem('darkMode', 'dark');
        console.log('First visit - defaulting to dark');
    }
    
    console.log('Final body dark class?', document.body.classList.contains('dark'));
    console.log('=== END DIAGNOSIS ===\n');

    // Load last chapter
    const savedChapter = localStorage.getItem('currentChapter');
    if (savedChapter) {
        window.showChapter(parseInt(savedChapter));
    } else {
        window.showChapter(1);
    }

    // JUMP TO TOP - SHOW AFTER TABLE OF CONTENTS
    const jumpBtn = document.getElementById('jumpToTop');
    const tocContainer = document.querySelector('.toc-container');
    
    if (jumpBtn) {
        function checkScroll() {
            if (tocContainer) {
                // Get the position of the Table of Contents
                const tocRect = tocContainer.getBoundingClientRect();
                
                // Show button when we've scrolled past the Table of Contents
                // (when the bottom of TOC is above the viewport)
                if (tocRect.bottom < 0) {
                    jumpBtn.classList.remove('hidden');
                } else {
                    jumpBtn.classList.add('hidden');
                }
            } else {
                // Fallback: show after 300px of scrolling
                if (window.scrollY > 300) {
                    jumpBtn.classList.remove('hidden');
                } else {
                    jumpBtn.classList.add('hidden');
                }
            }
        }
        
        // Check on scroll
        window.addEventListener('scroll', checkScroll);
        
        // Check on page load
        checkScroll();
        
        // Check when window resizes
        window.addEventListener('resize', checkScroll);
        
        // Click to go to top
        jumpBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
});

// iOS viewport height fix
function setVh() {
    let vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVh();
window.addEventListener('resize', setVh);
window.addEventListener('orientationchange', setVh);