const API_BASE_URL = window.location.origin;

const state = {
    entries: [],
    currentPage: 'main',
    lastEntry: null,
    voidBrowsing: false,
    voidView: {
        zoom: 1,
        panX: 0,
        panY: 0,
        isDragging: false,
        lastMouseX: 0,
        lastMouseY: 0
    }
};

// Load entries from API
async function loadEntries() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/entries`);
        if (!response.ok) throw new Error('Failed to load entries');
        const entries = await response.json();
        state.entries = entries.map(entry => ({
            ...entry,
            date: new Date(entry.date)
        }));
        recreateFloatingMoney();
        updateLeaderboard();
    } catch (error) {
        console.error('Error loading entries:', error);
        // Fallback to local data if API fails
        state.entries = [
            { name: 'Anonymous', amount: 1337.50, date: new Date('2024-10-12T14:23:00'), rank: 1 },
            { name: 'John Doe', amount: 999.99, date: new Date('2024-10-13T09:15:00'), rank: 2 },
            { name: 'Jane Smith', amount: 750.00, date: new Date('2024-10-13T16:42:00'), rank: 3 },
            { name: 'Bob Wilson', amount: 500.25, date: new Date('2024-10-14T08:30:00'), rank: 4 },
            { name: 'Alice Brown', amount: 420.69, date: new Date('2024-10-14T11:20:00'), rank: 5 },
        ];
        recreateFloatingMoney();
        updateLeaderboard();
    }
}

function recreateFloatingMoney() {
    const voidBg = document.getElementById('void-bg');
    // Clear existing money bits
    voidBg.querySelectorAll('.money-bit').forEach(el => el.remove());
    // Create new ones
    createFloatingMoney();
}

// Save entry to API
async function saveEntry(name, amount) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/entries`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, amount })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save entry');
        }

        // Reload all entries to get updated ranks
        await loadEntries();
        return true;
    } catch (error) {
        console.error('Error saving entry:', error);
        // Fallback to local storage if API fails
        state.entries.push({
            name: name || 'Anonymous',
            amount: parseFloat(amount),
            date: new Date(),
            rank: 0
        });
        recreateFloatingMoney();
        updateLeaderboard();
        return false;
    }
}

function createFloatingMoney() {
    const voidBg = document.getElementById('void-bg');
    state.entries.forEach((entry, index) => {
        const money = document.createElement('div');
        money.className = 'money-bit';
        money.textContent = '💸';
        money.style.left = Math.random() * 90 + 5 + '%';
        money.style.top = Math.random() * 90 + 5 + '%';
        money.style.animationDelay = Math.random() * 20 + 's';
        money.style.animationDuration = 15 + Math.random() * 10 + 's';
        
        money.addEventListener('mouseenter', (e) => showTooltip(e, entry));
        money.addEventListener('mouseleave', hideTooltip);
        money.addEventListener('mousemove', (e) => updateTooltipPosition(e));
        
        voidBg.appendChild(money);
    });
}

function showTooltip(e, entry) {
    const tooltip = document.getElementById('tooltip');
    const formattedDate = entry.date.toLocaleString();
    tooltip.innerHTML = `
        <div><strong>Amount Lost:</strong> $${entry.amount.toFixed(2)}</div>
        <div><strong>Date:</strong> ${formattedDate}</div>
        <div><strong>Rank:</strong> #${entry.rank}</div>
        <div><strong>By:</strong> ${entry.name}</div>
    `;
    tooltip.classList.add('show');
    updateTooltipPosition(e);
}

function hideTooltip() {
    const tooltip = document.getElementById('tooltip');
    tooltip.classList.remove('show');
}

function updateTooltipPosition(e) {
    const tooltip = document.getElementById('tooltip');
    tooltip.style.left = e.clientX + 'px';
    tooltip.style.top = e.clientY + 'px';
}

function updateLeaderboard() {
    state.entries.sort((a, b) => b.amount - a.amount);
    state.entries.forEach((entry, index) => {
        entry.rank = index + 1;
    });

    const list = document.getElementById('leaderboardList');
    list.innerHTML = state.entries.map(entry => `
        <div class="leaderboard-item">
            <div class="rank">#${entry.rank}</div>
            <div class="user-info">
                <div>${entry.name}</div>
                <div class="date">${entry.date.toLocaleString()}</div>
            </div>
            <div class="amount">$${entry.amount.toFixed(2)}</div>
        </div>
    `).join('');
}

function throwMoneyAnimation(startX, startY) {
    const modalContent = document.querySelector('.modal-content');
    modalContent.classList.add('hiding');
    
    setTimeout(() => {
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const money = document.createElement('div');
                money.className = 'throwing-money';
                money.textContent = ['💸', '💵', '💴', '💶', '💷'][Math.floor(Math.random() * 5)];
                money.style.left = startX + 'px';
                money.style.top = startY + 'px';
                money.style.fontSize = (24 + Math.random() * 24) + 'px';
                
                const angle = (Math.random() * Math.PI * 2);
                const distance = 400 + Math.random() * 600;
                const tx = Math.cos(angle) * distance;
                const ty = Math.sin(angle) * distance;
                const rotation = (Math.random() - 0.5) * 1440;
                
                money.style.setProperty('--tx', tx + 'px');
                money.style.setProperty('--ty', ty + 'px');
                money.style.setProperty('--rotation', rotation + 'deg');
                
                document.body.appendChild(money);
                
                setTimeout(() => money.remove(), 3000);
            }, i * 40);
        }
    }, 500);
    
    setTimeout(() => {
        modalContent.classList.remove('hiding');
        modalContent.classList.add('showing');
        setTimeout(() => {
            modalContent.classList.remove('showing');
        }, 500);
    }, 2500);
}

function switchPage(page, targetEntry = null) {
    const currentPageEl = document.querySelector('.page.active');
    const voidBrowseBtn = document.getElementById('voidBrowserBtn');

    // Fade out current page
    if (currentPageEl) {
        currentPageEl.classList.add('fade-out');
        setTimeout(() => {
            currentPageEl.classList.remove('active', 'fade-out');
        }, 300);
    }

    // Fade in new page
    setTimeout(() => {
        document.querySelectorAll('.page').forEach(p => p.classList.remove('active', 'fade-out'));

        if (page === 'main') {
            document.getElementById('mainPage').classList.add('active');
            document.getElementById('navBtn').textContent = 'View Leaderboard';
            voidBrowseBtn.style.display = 'inline-block';
            state.currentPage = 'main';

            // If we have a target entry, start browsing void
            if (targetEntry) {
                setTimeout(() => startVoidBrowsing(targetEntry), 500);
            }
        } else if (page === 'leaderboard') {
            document.getElementById('leaderboardPage').classList.add('active');
            document.getElementById('navBtn').textContent = 'Back to Home';
            voidBrowseBtn.style.display = 'none';
            state.currentPage = 'leaderboard';
            updateLeaderboard();
        }
    }, 300);
}

document.getElementById('navBtn').addEventListener('click', () => {
    switchPage(state.currentPage !== 'main' ? 'main' : 'leaderboard');
});

document.getElementById('voidBrowserBtn').addEventListener('click', () => {
    startVoidBrowsing();
});

document.getElementById('loseBtn').addEventListener('click', () => {
    document.getElementById('paymentModal').classList.add('show');
});

document.getElementById('cancelBtn').addEventListener('click', () => {
    document.getElementById('paymentModal').classList.remove('show');
    document.getElementById('amountInput').value = '';
    document.getElementById('nameInput').value = '';
});

document.getElementById('confirmBtn').addEventListener('click', async () => {
    const amount = parseFloat(document.getElementById('amountInput').value);
    const name = document.getElementById('nameInput').value || 'Anonymous';

    if (!amount || amount <= 0) {
        alert('Please enter a valid amount (minimum $0.01)!');
        return;
    }

    if (amount > 1000000) {
        alert('Maximum amount is $1,000,000');
        return;
    }

    const rect = document.getElementById('confirmBtn').getBoundingClientRect();
    throwMoneyAnimation(rect.left + rect.width / 2, rect.top + rect.height / 2);

    document.getElementById('paymentModal').classList.remove('show');
    document.getElementById('amountInput').value = '';
    document.getElementById('nameInput').value = '';

    // Disable the "Lose Your Money" button for 5 seconds
    const loseBtn = document.getElementById('loseBtn');
    loseBtn.disabled = true;
    loseBtn.style.opacity = '0.5';
    loseBtn.style.cursor = 'not-allowed';

    let countdown = 5;
    const originalText = loseBtn.textContent;
    loseBtn.textContent = `Wait ${countdown}s...`;

    const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
            loseBtn.textContent = `Wait ${countdown}s...`;
        } else {
            clearInterval(countdownInterval);
            loseBtn.textContent = originalText;
            loseBtn.disabled = false;
            loseBtn.style.opacity = '1';
            loseBtn.style.cursor = 'pointer';
        }
    }, 1000);

    // Save to backend
    await saveEntry(name, amount);

    // Store this entry info for the congratulations popup
    state.lastEntry = { name, amount, date: new Date() };

    // Wait a moment for the entry to be saved and ranked
    setTimeout(() => {
        showCongratsPopup(name, amount);
    }, 1500);

    // Don't redirect to leaderboard - stay on current page
});

// Show congratulations popup
function showCongratsPopup(name, amount) {
    const entry = state.entries.find(e => e.name === name && e.amount === amount);
    if (!entry) return;

    const popup = document.getElementById('congratsPopup');
    document.getElementById('congratsAmount').textContent = `$${amount.toFixed(2)}`;
    document.getElementById('congratsDate').textContent = new Date(entry.date).toLocaleString();
    document.getElementById('congratsRank').textContent = `#${entry.rank} of ${state.entries.length}`;

    popup.classList.add('show');

    // Auto-hide after 5 seconds
    setTimeout(() => {
        popup.classList.remove('show');
    }, 5000);
}

// Close congrats popup and go to void
document.getElementById('congratsClose').addEventListener('click', () => {
    document.getElementById('congratsPopup').classList.remove('show');
    if (state.lastEntry) {
        const entry = state.entries.find(e =>
            e.name === state.lastEntry.name &&
            e.amount === state.lastEntry.amount
        );
        // Go to main page first, then start void browsing
        if (state.currentPage !== 'main') {
            switchPage('main', entry);
        } else {
            startVoidBrowsing(entry);
        }
    }
});

// Void Browser Implementation
let canvas, ctx;
let voidEntries = [];
let animationFrameId = null;

// Start void browsing mode
function startVoidBrowsing(targetEntry = null) {
    if (state.voidBrowsing) return;

    state.voidBrowsing = true;

    // Hide main content
    const mainContent = document.querySelector('.content');
    if (mainContent) {
        mainContent.style.opacity = '0';
        mainContent.style.transition = 'opacity 0.5s ease';
    }

    // Show void browser overlay
    const overlay = document.getElementById('voidBrowserOverlay');
    overlay.classList.add('active');

    // Initialize canvas
    canvas = document.getElementById('voidCanvas');
    if (!canvas) return;

    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Generate positions
    generateVoidPositions();

    // Center on target if provided
    if (targetEntry) {
        centerOnEntry(targetEntry);
    }

    // Setup controls once
    setupVoidControls();

    // Start drawing
    drawVoid();
}

// Exit void browsing mode
function exitVoidBrowsing() {
    state.voidBrowsing = false;

    // Hide overlay
    const overlay = document.getElementById('voidBrowserOverlay');
    overlay.classList.remove('active');

    // Show main content again
    const mainContent = document.querySelector('.content');
    if (mainContent) {
        mainContent.style.opacity = '1';
    }

    // Cancel animation frame
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function generateVoidPositions() {
    voidEntries = state.entries.map((entry) => {
        // Scatter randomly throughout the void
        const angle = Math.random() * Math.PI * 2;
        const radius = 200 + Math.random() * 1000; // Wide spread
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return {
            ...entry,
            x,
            y,
            radius: 12 + (entry.amount / 150) // Size based on amount
        };
    });
}

function centerOnEntry(entry) {
    const voidEntry = voidEntries.find(ve =>
        ve.rank === entry.rank
    );
    if (voidEntry) {
        state.voidView.panX = canvas.width / 2 - voidEntry.x * state.voidView.zoom;
        state.voidView.panY = canvas.height / 2 - voidEntry.y * state.voidView.zoom;
    }
}

function drawVoid() {
    // Clear canvas
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars/background
    ctx.fillStyle = 'rgba(74, 222, 128, 0.1)';
    for (let i = 0; i < 100; i++) {
        const x = (Math.random() * canvas.width);
        const y = (Math.random() * canvas.height);
        ctx.fillRect(x, y, 1, 1);
    }

    // Save context
    ctx.save();

    // Apply pan and zoom
    ctx.translate(state.voidView.panX, state.voidView.panY);
    ctx.scale(state.voidView.zoom, state.voidView.zoom);

    // Draw connections between nearby entries
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.1)';
    ctx.lineWidth = 1 / state.voidView.zoom;
    voidEntries.forEach((entry, i) => {
        voidEntries.slice(i + 1).forEach(other => {
            const dist = Math.hypot(entry.x - other.x, entry.y - other.y);
            if (dist < 200) {
                ctx.beginPath();
                ctx.moveTo(entry.x, entry.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
            }
        });
    });

    // Draw each entry
    voidEntries.forEach((entry) => {
        // Subtle glow effect (reduced)
        const gradient = ctx.createRadialGradient(entry.x, entry.y, 0, entry.x, entry.y, entry.radius * 1.5);
        gradient.addColorStop(0, 'rgba(34, 197, 94, 0.3)');
        gradient.addColorStop(0.5, 'rgba(34, 197, 94, 0.15)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(entry.x - entry.radius * 1.5, entry.y - entry.radius * 1.5, entry.radius * 3, entry.radius * 3);

        // Draw entry circle
        ctx.beginPath();
        ctx.arc(entry.x, entry.y, entry.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(34, 197, 94, ${0.6 + (entry.amount / 2000)})`;
        ctx.fill();
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 1.5 / state.voidView.zoom;
        ctx.stroke();

        // Draw rank number
        if (state.voidView.zoom > 0.5) {
            ctx.fillStyle = '#fff';
            ctx.font = `${12 / state.voidView.zoom}px Arial`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(`#${entry.rank}`, entry.x, entry.y);
        }

        // Draw amount label
        if (state.voidView.zoom > 1) {
            ctx.fillStyle = '#4ade80';
            ctx.font = `${10 / state.voidView.zoom}px Arial`;
            ctx.fillText(`$${entry.amount.toFixed(2)}`, entry.x, entry.y + entry.radius + 15);
        }
    });

    ctx.restore();
}

function setupVoidControls() {
    // Exit button
    document.getElementById('exitVoid').onclick = () => {
        exitVoidBrowsing();
    };

    // Zoom buttons
    document.getElementById('zoomIn').onclick = () => {
        state.voidView.zoom *= 1.2;
        updateZoomLevel();
        drawVoid();
    };

    document.getElementById('zoomOut').onclick = () => {
        state.voidView.zoom /= 1.2;
        updateZoomLevel();
        drawVoid();
    };

    document.getElementById('resetView').onclick = () => {
        state.voidView.zoom = 1;
        state.voidView.panX = 0;
        state.voidView.panY = 0;
        updateZoomLevel();
        drawVoid();
    };

    // Mouse drag
    canvas.onmousedown = (e) => {
        state.voidView.isDragging = true;
        state.voidView.lastMouseX = e.clientX;
        state.voidView.lastMouseY = e.clientY;
    };

    canvas.onmousemove = (e) => {
        if (state.voidView.isDragging) {
            const dx = e.clientX - state.voidView.lastMouseX;
            const dy = e.clientY - state.voidView.lastMouseY;
            state.voidView.panX += dx;
            state.voidView.panY += dy;
            state.voidView.lastMouseX = e.clientX;
            state.voidView.lastMouseY = e.clientY;
            drawVoid();
        }
    };

    canvas.onmouseup = () => {
        state.voidView.isDragging = false;
    };

    canvas.onmouseleave = () => {
        state.voidView.isDragging = false;
    };

    // Mouse wheel zoom
    canvas.onwheel = (e) => {
        e.preventDefault();
        const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
        state.voidView.zoom *= zoomFactor;
        updateZoomLevel();
        drawVoid();
    };

    // Click on entries
    canvas.onclick = (e) => {
        if (state.voidView.isDragging) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = (e.clientX - rect.left - state.voidView.panX) / state.voidView.zoom;
        const mouseY = (e.clientY - rect.top - state.voidView.panY) / state.voidView.zoom;

        voidEntries.forEach(entry => {
            const dist = Math.hypot(mouseX - entry.x, mouseY - entry.y);
            if (dist < entry.radius) {
                showEntryDetails(entry);
            }
        });
    };

    // Window resize
    window.addEventListener('resize', () => {
        if (canvas && state.currentPage === 'void') {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            drawVoid();
        }
    });
}

function updateZoomLevel() {
    document.getElementById('zoomLevel').textContent = `${Math.round(state.voidView.zoom * 100)}%`;
}

function showEntryDetails(entry) {
    alert(`${entry.name}\nAmount: $${entry.amount.toFixed(2)}\nRank: #${entry.rank}\nDate: ${new Date(entry.date).toLocaleString()}`);
}

// Make leaderboard items clickable to jump to void
function makeLeaderboardClickable() {
    setTimeout(() => {
        document.querySelectorAll('.leaderboard-item').forEach((item, index) => {
            item.style.cursor = 'pointer';
            item.onclick = () => {
                const entry = state.entries[index];
                // Go to main page first, then browse void
                switchPage('main', entry);
            };
        });
    }, 100);
}

// Update the updateLeaderboard function to make items clickable
const originalUpdateLeaderboard = updateLeaderboard;
updateLeaderboard = function() {
    originalUpdateLeaderboard();
    makeLeaderboardClickable();
};

// Initialize the app
loadEntries();