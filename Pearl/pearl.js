/**
 * script.js - Pearl Poem Explorer Logic
 * Handles interactive narrative, data visualization, and Gemini AI integration.
 */

// 1. API Configuration (Empty as per environment requirements)
const apiKey = CONFIG.GEMINI_API_KEY;

// 2. Data Definitions
const plotSteps = [
    { id: 1, title: "The Loss", icon: "🌹", content: "The Dreamer loses his 'pearl' (his daughter) in a garden. He falls into a deep sleep on her grave." },
    { id: 2, title: "The Vision", icon: "✨", content: "He wakes in a brilliant spirit-world. He travels to a river that divides him from a beautiful city." },
    { id: 3, title: "The Maiden", icon: "👑", content: "He sees his daughter across the river. She is no longer an infant, but a radiant Queen of Heaven." },
    { id: 4, title: "The Debate", icon: "⚖️", content: "They debate the nature of grace. He thinks she hasn't 'earned' her rank; she explains grace is a gift." },
    { id: 5, title: "The City", icon: "🏰", content: "She shows him the New Jerusalem. He sees the Lamb and the procession of the blessed souls." },
    { id: 6, title: "The Return", icon: "👁️", content: "He tries to cross the river and wakes up. He finds peace, knowing his pearl is safe with God." }
];

const symbols = [
    { name: "Pearl", icon: "⚪", e: "The lost child.", h: "The Kingdom of Heaven." },
    { name: "Garden", icon: "🌿", e: "The graveyard.", h: "Resurrection ground." },
    { name: "River", icon: "🌊", e: "Death's divide.", h: "Eternal transition." },
    { name: "White Dress", icon: "👗", e: "Purity/Death.", h: "Divine Wedding Garment." }
];

// 3. Application Initialization
function initApp() {
    renderPlot();
    renderSymbols();
    initChart();
    
    // Attach AI Event Listeners
    const sendBtn = document.getElementById('send-btn');
    const chatInput = document.getElementById('chat-input');
    const modernizeBtn = document.getElementById('modernize-btn');

    if (sendBtn) sendBtn.addEventListener('click', handleChat);
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleChat();
        });
    }
    if (modernizeBtn) modernizeBtn.addEventListener('click', handleModernize);
}

// 4. Component Rendering
function renderPlot(activeId = 1) {
    const nav = document.getElementById('plot-nav');
    const content = document.getElementById('plot-content');
    if (!nav || !content) return;

    nav.innerHTML = '';
    plotSteps.forEach(step => {
        const btn = document.createElement('button');
        const isActive = step.id === activeId;
        btn.className = `p-3 text-left rounded-xl transition-all text-sm font-medium whitespace-nowrap md:whitespace-normal ${isActive ? 'bg-teal-700 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`;
        btn.innerHTML = `<span>${step.icon} ${step.title}</span>`;
        btn.onclick = () => renderPlot(step.id);
        nav.appendChild(btn);
    });

    const active = plotSteps.find(s => s.id === activeId);
    content.innerHTML = `
        <div class="fade-in bg-slate-50 p-8 rounded-2xl border border-slate-100 h-full flex flex-col justify-center">
            <h3 class="text-2xl font-bold serif text-slate-800 mb-4">${active.title}</h3>
            <p class="text-slate-600 text-lg leading-relaxed">${active.content}</p>
        </div>
    `;
}

function renderSymbols() {
    const grid = document.getElementById('symbol-grid');
    if (!grid) return;
    grid.innerHTML = '';
    symbols.forEach(s => {
        const card = document.createElement('div');
        card.className = "symbol-card bg-white rounded-2xl border border-slate-100 p-6";
        card.innerHTML = `
            <div class="text-3xl mb-3">${s.icon}</div>
            <h4 class="font-bold text-slate-800 mb-3">${s.name}</h4>
            <div class="space-y-2 text-xs">
                <div class="text-amber-700"><strong>Earthly:</strong> ${s.e}</div>
                <div class="text-teal-700"><strong>Heavenly:</strong> ${s.h}</div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function initChart() {
    const canvas = document.getElementById('parableChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1st Hr', '3rd Hr', '6th Hr', '9th Hr', '11th Hr'],
            datasets: [
                { type: 'line', label: 'Reward (Salvation)', data: [1,1,1,1,1], borderColor: '#0f766e', backgroundColor: '#0f766e', yAxisID: 'y1' },
                { type: 'bar', label: 'Labor (Merit)', data: [12,9,6,3,1], backgroundColor: 'rgba(245, 158, 11, 0.3)', borderColor: '#f59e0b', yAxisID: 'y' }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { 
                y: { position: 'left', suggestedMax: 14, title: { display: true, text: 'Labor Hours' } },
                y1: { position: 'right', suggestedMax: 2, display: false }
            }
        }
    });
}

// 5. Gemini AI Logic
async function callGemini(prompt, system) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: system }] }
    };

    let delay = 1000;
    for (let i = 0; i < 5; i++) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (response.ok) {
                const data = await response.json();
                return data.candidates?.[0]?.content?.parts?.[0]?.text;
            }
        } catch (e) {
            // Error handled by retry logic
        }
        await new Promise(r => setTimeout(r, delay));
        delay *= 2;
    }
    return "The connection to the heavenly city is weak. Please try again later.";
}

async function handleChat() {
    const input = document.getElementById('chat-input');
    const chatWindow = document.getElementById('chat-window');
    if (!input || !chatWindow) return;

    const msg = input.value.trim();
    if (!msg) return;

    // Append User Message
    const userMsg = document.createElement('div');
    userMsg.className = "flex justify-end";
    userMsg.innerHTML = `<div class="bg-slate-700 text-white p-4 rounded-2xl rounded-tr-none text-sm max-w-[90%] shadow-sm">${msg}</div>`;
    chatWindow.appendChild(userMsg);
    input.value = '';
    chatWindow.scrollTop = chatWindow.scrollHeight;

    // Append Loading State
    const loader = document.createElement('div');
    loader.className = "flex items-start";
    loader.innerHTML = `<div class="bg-teal-100 text-teal-900 p-4 rounded-2xl rounded-tl-none text-sm italic loading-dots">The Maiden is speaking</div>`;
    chatWindow.appendChild(loader);

    const sys = "You are the Maiden from 'Pearl'. Speak with divine wisdom, medieval flair, and a focus on grace. Address the user as 'Sir' or 'Dreamer'. Keep responses under 100 words.";
    const reply = await callGemini(msg, sys);
    
    chatWindow.removeChild(loader);
    const aiMsg = document.createElement('div');
    aiMsg.className = "flex items-start";
    aiMsg.innerHTML = `<div class="bg-teal-100 text-teal-900 p-4 rounded-2xl rounded-tl-none text-sm max-w-[90%] shadow-sm">${reply}</div>`;
    chatWindow.appendChild(aiMsg);
    chatWindow.scrollTop = chatWindow.scrollHeight;
}

async function handleModernize() {
    const input = document.getElementById('modern-input');
    const output = document.getElementById('modern-output');
    const btn = document.getElementById('modernize-btn');
    if (!input || !output || !btn) return;

    const val = input.value.trim();
    if (!val) return;

    btn.disabled = true;
    btn.innerText = "Transforming...";
    
    const sys = "You are a poetic scholar. Relate modern concepts of loss to the 14th-century Pearl poem's themes of grace and eternal value. Keep it empathetic and brief.";
    const res = await callGemini(`Modern context: ${val}`, sys);
    
    output.innerText = res;
    output.classList.remove('hidden');
    btn.disabled = false;
    btn.innerText = "Generate Modern Reflection";
}

// 6. Global Execution
window.onload = initApp;