let chosenMode = "Text";
let isConnected = false;
let autoConnectTimer = null;
let countdownInterval = null;

function toggleDropdownMenu(e) {
    e.stopPropagation();
    document.getElementById('topDropdownMenu').classList.toggle('active');
}

window.addEventListener('click', () => {
    let menu = document.getElementById('topDropdownMenu');
    if(menu && menu.classList.contains('active')) menu.classList.remove('active');
});

function openAuthModal() {
    document.getElementById('topDropdownMenu').classList.remove('active');
    document.getElementById('authModalOverlay').style.display = 'flex';
}

function closeAuthModal() {
    document.getElementById('authModalOverlay').style.display = 'none';
}

// Dark Mode Persistence Support
function toggleThemeMode() {
    document.body.classList.toggle('dark-theme');
    let isDark = document.body.classList.contains('dark-theme');
    let themeMenuText = document.getElementById('themeMenuText');
    if(themeMenuText) {
        themeMenuText.innerText = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
    }
    
    if (isDark) {
        localStorage.setItem('omechat_theme', 'dark');
    } else {
        localStorage.setItem('omechat_theme', 'light');
    }
    
    let menu = document.getElementById('topDropdownMenu');
    if(menu) menu.classList.remove('active');
}

function selectMode(mode) {
    chosenMode = mode;
    document.querySelectorAll('.option-card').forEach(c => c.classList.remove('active'));
    event.currentTarget.classList.add('active');
}

function openMatchScreen() {
    document.getElementById('home-page').classList.add('hidden');
    document.getElementById('chat-page').classList.remove('hidden');
    isConnected = false;
    clearTimers();
    
    document.getElementById('rulesBoxContent').style.display = 'block';
    document.getElementById('loadingAnimationBox').style.display = 'none';
    document.getElementById('liveMessagesArea').style.display = 'none';
    document.getElementById('videoChatUI').style.display = 'none';
    document.getElementById('voiceChatUI').style.display = 'none';
    document.getElementById('mainActionBtn').innerText = "Start";
    updateBottomControlsUI();
}

function exitChatToHome() {
    clearTimers();
    isConnected = false;
    document.getElementById('chat-page').classList.add('hidden');
    document.getElementById('home-page').classList.remove('hidden');
}

function updateBottomControlsUI() {
    let dynamicArea = document.getElementById('dynamicInputArea');
    let sendBtn = document.getElementById('sendBtnElem');

    if (chosenMode === 'Text') {
        dynamicArea.innerHTML = `<input type="text" style="width: 100%; background-color: var(--card-bg); border: 1px solid var(--border-color); border-radius: 12px; padding: 12px; color: var(--text-color); outline: none; font-size: 15px;" id="messageInput" placeholder="Type a message..." onkeypress="checkEnter(event)">`;
        sendBtn.style.display = "block";
        sendBtn.innerText = "Send";
        sendBtn.setAttribute("onclick", "sendMessage()");
        sendBtn.style.background = "#2563eb";
    } else {
        dynamicArea.innerHTML = `<button style="background-color: #ef4444; color: white; border: none; padding: 10px 16px; border-radius: 10px; font-weight: bold; width: auto; cursor: pointer; font-size: 13px;" onclick="exitChatToHome()">Exit</button>`;
        sendBtn.style.display = "none";
    }
}

function clearTimers() {
    if(autoConnectTimer) clearTimeout(autoConnectTimer);
    if(countdownInterval) clearInterval(countdownInterval);
    autoConnectTimer = null;
    countdownInterval = null;
}

function onStartOrSkip() {
    clearTimers();
    let loadingBox = document.getElementById('loadingAnimationBox');
    let rulesBox = document.getElementById('rulesBoxContent');
    let startBtn = document.getElementById('mainActionBtn');
    let loadingText = document.getElementById('loadingTextStatus');

    let textMsgArea = document.getElementById('liveMessagesArea');
    let videoUI = document.getElementById('videoChatUI');
    let voiceUI = document.getElementById('voiceChatUI');

    rulesBox.style.display = 'none';
    textMsgArea.style.display = 'none';
    videoUI.style.display = 'none';
    voiceUI.style.display = 'none';

    loadingText.innerText = `Searching for a ${chosenMode.toLowerCase()} stranger...`;
    loadingBox.style.display = 'flex';
    updateBottomControlsUI();
    
    setTimeout(() => {
        loadingBox.style.display = 'none';
        
        if (chosenMode === 'Text') {
            textMsgArea.style.display = 'flex';
            textMsgArea.innerHTML = `
                <div class="clean-system-msg">Connected with a <span style="color: #ef4444; font-weight: bold;">stranger</span> from India 🇮🇳</div>
                <div class="clean-stranger-msg"><span style="color: #ef4444; font-weight: bold;">Stranger</span>: Hello!</div>
            `;
            textMsgArea.scrollTop = textMsgArea.scrollHeight;
        } else if (chosenMode === 'Video') {
            videoUI.style.display = 'flex';
        } else if (chosenMode === 'Voice') {
            voiceUI.style.display = 'flex';
        }

        startBtn.innerText = "Skip";
        isConnected = true;
    }, 800);
}

function simulateStrangerDisconnect(reason) {
    if (!isConnected || chosenMode !== 'Text') return;
    isConnected = false;
    document.getElementById('mainActionBtn').innerText = "Start";
    
    let liveArea = document.getElementById('liveMessagesArea');
    let timeLeft = 30;
    
    let notifyText = (reason === 'left') ? "Stranger has left the chat" : "Stranger went offline";
    
    liveArea.innerHTML += `
        <div class="clean-system-msg" id="disconnectNoticeBox" style="color: #ef4444; font-weight: 600;">
            ${notifyText}. Reconnecting in <span id="countdownSec">${timeLeft}</span>s...
        </div>
    `;
    liveArea.scrollTop = liveArea.scrollHeight;

    countdownInterval = setInterval(() => {
        timeLeft--;
        let secElem = document.getElementById('countdownSec');
        if(secElem) secElem.innerText = timeLeft;
        if(timeLeft <= 0) {
            clearInterval(countdownInterval);
        }
    }, 1000);

    autoConnectTimer = setTimeout(() => {
        let noticeBox = document.getElementById('disconnectNoticeBox');
        if(noticeBox) noticeBox.remove();
        onStartOrSkip();
    }, 30000);
}

function checkEnter(e) { if (e.key === 'Enter') sendMessage(); }

function sendMessage() {
    let input = document.getElementById('messageInput');
    let liveArea = document.getElementById('liveMessagesArea');
    if (input && input.value.trim() !== "" && isConnected && chosenMode === 'Text') {
        liveArea.innerHTML += `<div class="clean-user-msg"><span style="color: #2563eb; font-weight: bold;">You</span>: ${input.value}</div>`;
        input.value = "";
        liveArea.scrollTop = liveArea.scrollHeight;
    }
}

function toggleMuteVideo() {
    let btn = document.getElementById('videoMuteBtn');
    if(btn.innerText.includes('Mute')) {
        btn.innerText = "🔇 Unmute";
    } else {
        btn.innerText = "🎙️ Mute";
    }
}

function toggleCameraVideo() {
    let btn = document.getElementById('videoCamBtn');
    if(btn.innerText.includes('Cam Off')) {
        btn.innerText = "📷 Cam On";
    } else {
        btn.innerText = "📹 Cam Off";
    }
}

function toggleSpeakerVideo() {
    let btn = document.getElementById('videoSpeakerBtn');
    if(btn.innerText.includes('Speaker')) {
        btn.innerText = "🔈 Earpiece";
    } else {
        btn.innerText = "🔊 Speaker";
    }
}

function toggleMuteVoice() {
    let btn = document.getElementById('voiceMuteBtn');
    if(btn.innerText.includes('Mute')) {
        btn.innerText = "🔇 Unmute";
    } else {
        btn.innerText = "🎙️ Mute";
    }
}

function toggleSpeakerVoice() {
    let btn = document.getElementById('voiceSpeakerBtn');
    if(btn.innerText.includes('Speaker')) {
        btn.innerText = "🔈 Earpiece";
    } else {
        btn.innerText = "🔊 Speaker";
    }
}

function renderGooglePicker() { alert("Google Sign-In Account Picker Initialized successfully."); closeAuthModal(); }
function renderTwitterForm() { alert("Twitter OAuth Gateway Initialized successfully."); closeAuthModal(); }
function renderPhoneForm() { alert("Phone OTP Authentication Service Triggered."); closeAuthModal(); }
function showPrivacyPolicy() {
    document.getElementById('topDropdownMenu').classList.remove('active');
    alert("Privacy Policy: Absolute anonymity guaranteed.");
}

// Dark Mode Auto-Load & Time-Based Active Count Logic on page open
window.addEventListener('DOMContentLoaded', () => {
    let savedTheme = localStorage.getItem('omechat_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        let themeText = document.getElementById('themeMenuText');
        if(themeText) themeText.innerText = "☀️ Light Mode";
    }
});

setInterval(() => {
    let currentHour = new Date().getHours();
    let targetBase;

    if (currentHour >= 20 || currentHour < 4) {
        targetBase = Math.floor(Math.random() * (10000 - 7000 + 1)) + 7000;
    } else {
        targetBase = Math.floor(Math.random() * (6000 - 3000 + 1)) + 3000;
    }

    let fluctuation = Math.floor(Math.random() * 41) - 20;
    let finalCount = targetBase + fluctuation;
    
    let activeText = `🟢 ${finalCount.toLocaleString()} Active`;
    
    let countElemHome = document.getElementById('liveActiveCount');
    let countElemChat = document.getElementById('liveActiveCountChat');
    
    if(countElemHome) countElemHome.innerText = activeText;
    if(countElemChat) countElemChat.innerText = activeText;
}, 4000);












