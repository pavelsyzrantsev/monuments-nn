document.addEventListener('DOMContentLoaded', function() {
    checkIfUserReturned();
    console.log('Скрипт загружен');
    
    initMonumentSearch();
    initSmartMediaControls();
    window.playAudio = playAudio;
    window.pauseAudio = pauseAudio;
});

function handleFormSubmit() {
    const name = document.getElementById('nameInput').value.trim();
    const email = document.getElementById('emailInput').value.trim();
    const message = document.getElementById('messageInput').value.trim();
    
    if (!name || !email || !message) {
        alert('❗ Заполните все поля!');
        return false;
    }
    
    if (!email.includes('@') || !email.includes('.')) {
        alert('❗ Введите корректный email!');
        return false;
    }
    
    localStorage.setItem('userName', name);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('lastMessage', message);
    localStorage.setItem('lastVisit', new Date().toISOString());
    
    showGreeting(name);
    document.getElementById('nameInput').value = '';
    document.getElementById('emailInput').value = '';
    document.getElementById('messageInput').value = '';
    return false;
}

function showGreeting(name) {
    const greetingDiv = document.getElementById('greetingMessage');
    const userNameSpan = document.getElementById('userName');
    
    if (greetingDiv && userNameSpan) {
        userNameSpan.textContent = name;
        greetingDiv.style.display = 'block';
    }
}

function checkIfUserReturned() {
    const savedName = localStorage.getItem('userName');
    
    if (savedName) {
        showGreeting(savedName);
        const nameInput = document.getElementById('nameInput');
        if (nameInput) {
            nameInput.value = savedName;
        }
    }
}


function initSmartMediaControls() {
    const video = document.getElementById('Video');
    const audio = document.getElementById('Audio');
    
    if (video || audio) {
        console.log('Инициализация умного управления медиа с Lodash');
        
        if (video) setupSmartVideoControls(video);
        if (audio) setupSmartAudioControls(audio);
    }
}

function setupSmartVideoControls(video) {
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const skipForward = document.getElementById('skipForward');
    const skipBackward = document.getElementById('skipBackward');
    const volumeSlider = document.getElementById('volumeSlider');
    const volumeValue = document.getElementById('volumeValue');
    
    if (!video) return;
    
    const throttledSkip = _.throttle((seconds) => {
        const newTime = video.currentTime + seconds;
        video.currentTime = _.clamp(newTime, 0, video.duration || 0);
        
        console.log(`Видео: перемотка на ${seconds} сек`);
        showMediaFeedback(`Перемотка: ${seconds > 0 ? '+' : ''}${seconds} сек`);
        
    }, 500);
    
    const debouncedPlay = _.debounce(() => {
        video.play().catch(e => console.log('Ошибка воспроизведения:', e));
        showMediaFeedback('Воспроизведение видео');
    }, 300);
    
    const debouncedPause = _.debounce(() => {
        video.pause();
        showMediaFeedback('Пауза видео');
    }, 300);
    
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            debouncedPlay();
        });
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', () => {
            debouncedPause();
        });
    }
    
    if (skipForward) {
        skipForward.addEventListener('click', () => {
            throttledSkip(2);
        });
    }
    
    if (skipBackward) {
        skipBackward.addEventListener('click', () => {
            throttledSkip(-2);
        });
    }
    
    if (volumeSlider && volumeValue) {
        volumeValue.textContent = Math.round(video.volume * 100) + '%';
        
        const throttledVolumeUpdate = _.throttle((value) => {
            video.volume = _.clamp(parseFloat(value), 0, 1);
            volumeValue.textContent = Math.round(value * 100) + '%';
            console.log(`Громкость видео: ${Math.round(value * 100)}%`);
        }, 200);
        
        volumeSlider.addEventListener('input', function() {
            throttledVolumeUpdate(this.value);
        });
    }
    
    document.addEventListener('keydown', _.throttle((event) => {
        if (!video) return;
        
        if (document.activeElement.tagName !== 'INPUT' && 
            document.activeElement.tagName !== 'TEXTAREA') {
            
            switch(event.key) {
                case ' ':
                case 'Spacebar':
                    event.preventDefault();
                    if (video.paused) {
                        debouncedPlay();
                    } else {
                        debouncedPause();
                    }
                    break;
                case 'ArrowRight':
                    event.preventDefault();
                    throttledSkip(10);
                    break;
                case 'ArrowLeft':
                    event.preventDefault();
                    throttledSkip(-10);
                    break;
                case 'ArrowUp':
                    event.preventDefault();
                    video.volume = _.clamp(video.volume + 0.1, 0, 1);
                    if (volumeSlider) volumeSlider.value = video.volume;
                    if (volumeValue) volumeValue.textContent = Math.round(video.volume * 100) + '%';
                    showMediaFeedback(`Громкость: ${Math.round(video.volume * 100)}%`);
                    break;
                case 'ArrowDown':
                    event.preventDefault();
                    video.volume = _.clamp(video.volume - 0.1, 0, 1);
                    if (volumeSlider) volumeSlider.value = video.volume;
                    if (volumeValue) volumeValue.textContent = Math.round(video.volume * 100) + '%';
                    showMediaFeedback(`Громкость: ${Math.round(video.volume * 100)}%`);
                    break;
            }
        }
    }, 300));
}

function setupSmartAudioControls(audio) {
    if (!audio) return;
    
    const audioControls = document.querySelector('.audio-controls');
    
    if (audioControls) {
        console.log('Настройка умного аудио-управления с Lodash');
        
        const throttledAudioSkip = _.throttle((seconds) => {
            const newTime = audio.currentTime + seconds;
            audio.currentTime = _.clamp(newTime, 0, audio.duration || 0);
            
            console.log(`Аудио: перемотка на ${seconds} сек`);
            showMediaFeedback(`Аудио перемотка: ${seconds > 0 ? '+' : ''}${seconds} сек`);
            
        }, 500);
        
        const skipForwardBtn = document.createElement('button');
        skipForwardBtn.className = 'control-btn skip-btn';
        skipForwardBtn.textContent = '⏩ +10сек';
        skipForwardBtn.addEventListener('click', () => {
            throttledAudioSkip(10);
        });
        
        const skipBackwardBtn = document.createElement('button');
        skipBackwardBtn.className = 'control-btn skip-btn';
        skipBackwardBtn.textContent = '⏪ -10сек';
        skipBackwardBtn.addEventListener('click', () => {
            throttledAudioSkip(-10);
        });
        
        audioControls.appendChild(skipForwardBtn);
        audioControls.appendChild(skipBackwardBtn);
        
        const debouncedAudioPlay = _.debounce(() => {
            audio.play().catch(e => console.log('Ошибка воспроизведения аудио:', e));
            showMediaFeedback('Воспроизведение аудио');
        }, 300);
        
        const debouncedAudioPause = _.debounce(() => {
            audio.pause();
            showMediaFeedback('Пауза аудио');
        }, 300);
        
        const audioPlayBtn = audioControls.querySelector('[onclick*="playAudio"]');
        const audioPauseBtn = audioControls.querySelector('[onclick*="pauseAudio"]');
        
        if (audioPlayBtn) {
            audioPlayBtn.onclick = () => debouncedAudioPlay();
        }
        
        if (audioPauseBtn) {
            audioPauseBtn.onclick = () => debouncedAudioPause();
        }
    }
}

function initMonumentSearch() {
    const searchInput = document.getElementById('monumentSearch');
    const monumentDetails = document.querySelectorAll('.monument-detail');
    
    if (searchInput && monumentDetails.length > 0) {
        console.log('Инициализация поиска памятников с Lodash');
        
        const debouncedSearch = _.debounce(function(searchTerm) {
            let visibleCount = 0;
            
            monumentDetails.forEach(monument => {
                const title = monument.querySelector('.detail-title').textContent;
                const titleLower = _.toLower(title);
                
                const isVisible = _.includes(titleLower, _.toLower(searchTerm));
                
                if (isVisible) {
                    monument.style.display = 'block';
                    visibleCount++;
                    highlightSearchText(monument, searchTerm);
                } else {
                    monument.style.display = 'none';
                }
            });
            
            updateSearchResults(visibleCount, monumentDetails.length);
            
        }, 300);
        
        searchInput.addEventListener('input', function() {
            const searchTerm = this.value.trim();
            debouncedSearch(searchTerm);
        });
        
        searchInput.addEventListener('search', function() {
            debouncedSearch(this.value);
        });
    }
}

function updateSearchResults(visible, total) {
    const resultsElement = document.getElementById('searchResults');
    if (resultsElement) {
        if (visible === total) {
            resultsElement.textContent = `Все памятники (${total})`;
            resultsElement.style.color = '#666';
        } else if (visible === 0) {
            resultsElement.textContent = `Памятники не найдены`;
            resultsElement.style.color = '#e74c3c';
        } else {
            resultsElement.textContent = `Найдено: ${visible} из ${total}`;
            resultsElement.style.color = '#27ae60';
        }
    }
}

function highlightSearchText(element, searchTerm) {
    if (!searchTerm) return;
    
    const titleElement = element.querySelector('.detail-title');
    if (titleElement) {
        const originalText = titleElement.textContent;
        const escapedTerm = _.escapeRegExp(searchTerm);
        const regex = new RegExp(`(${escapedTerm})`, 'gi');
        const highlighted = originalText.replace(regex, '<mark>$1</mark>');
        
        if (!_.isEqual(titleElement.innerHTML, highlighted)) {
            titleElement.innerHTML = highlighted;
        }
    }
}

function showMediaFeedback(message) {
    let feedbackElement = document.getElementById('mediaFeedback');
    
    if (!feedbackElement) {
        feedbackElement = document.createElement('div');
        feedbackElement.id = 'mediaFeedback';
        feedbackElement.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(44, 62, 80, 0.9);
            color: white;
            padding: 10px 15px;
            border-radius: 6px;
            font-size: 14px;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s;
        `;
        document.body.appendChild(feedbackElement);
    }
    
    feedbackElement.textContent = message;
    feedbackElement.style.opacity = '1';
    
    _.delay(() => {
        feedbackElement.style.opacity = '0';
    }, 2000);
}

function playAudio() {
    const audio = document.getElementById('cityAudio');
    if (audio) {
        _.debounce(() => {
            audio.play().catch(e => console.log('Ошибка воспроизведения:', e));
        }, 300)();
    }
}

function pauseAudio() {
    const audio = document.getElementById('cityAudio');
    if (audio) {
        _.debounce(() => {
            audio.pause();
        }, 300)();
    }
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;

}
