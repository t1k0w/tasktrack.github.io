/**
 * Task Manager - Telegram Mini App
 * Handles form submission and Telegram WebApp integration
 */

// Initialize Telegram WebApp
const tg = window.Telegram.WebApp;

// Expand to full height
tg.expand();

// Enable closing confirmation if form has data
tg.enableClosingConfirmation();

// Apply Telegram theme
document.documentElement.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color || '#1a1a2e');
document.documentElement.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color || '#8b8b9e');
document.documentElement.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color || '#6c63ff');
document.documentElement.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color || '#6c63ff');
document.documentElement.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color || '#ffffff');
document.documentElement.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color || '#16213e');

// DOM Elements
const form = document.getElementById('task-form');
const taskTypeSelect = document.getElementById('task-type');
const titleInput = document.getElementById('title');
const descInput = document.getElementById('desc');
const titleCounter = document.getElementById('title-count');
const submitBtn = document.getElementById('submit-btn');
const loader = document.getElementById('loader');


// Character counter for title
titleInput.addEventListener('input', () => {
    const count = titleInput.value.length;
    titleCounter.textContent = count;

    // Visual feedback near limit
    if (count >= 90) {
        titleCounter.style.color = 'var(--error-color)';
    } else if (count >= 70) {
        titleCounter.style.color = '#eab308';
    } else {
        titleCounter.style.color = 'var(--tg-theme-hint-color)';
    }
});

// Get selected priority
function getSelectedPriority() {
    const selected = document.querySelector('input[name="priority"]:checked');
    return selected ? selected.value : 'normal';
}

// Get task type
function getTaskType() {
    return taskTypeSelect.value;
}



// Validate form
function validateForm() {
    let isValid = true;

    // Reset error states
    taskTypeSelect.classList.remove('error');
    titleInput.classList.remove('error');

    // Validate task type
    if (!getTaskType()) {
        taskTypeSelect.classList.add('error');
        isValid = false;
    }

    // Validate title
    const title = titleInput.value.trim();
    if (!title) {
        titleInput.classList.add('error');
        titleInput.focus();
        isValid = false;
    }

    if (!isValid) {
        // Haptic feedback
        if (tg.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('error');
        }
    }

    return isValid;
}

// Show loader
function showLoader() {
    loader.classList.remove('hidden');
    submitBtn.disabled = true;
}

// Hide loader
function hideLoader() {
    loader.classList.add('hidden');
    submitBtn.disabled = false;
}



// Submit form data to Telegram
async function submitForm() {
    if (!validateForm()) {
        return;
    }

    showLoader();

    // Prepare data
    const data = {
        taskType: getTaskType(),
        title: titleInput.value.trim(),
        desc: descInput.value.trim(),
        priority: getSelectedPriority()
    };

    // Haptic feedback
    if (tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    // Small delay for UX
    setTimeout(() => {
        try {
            // Send data to bot
            tg.sendData(JSON.stringify(data));
        } catch (error) {
            console.error('Error sending data:', error);
            hideLoader();

            // Show error alert
            tg.showAlert('Ошибка отправки данных. Попробуйте еще раз.');
        }
    }, 500);
}

// Event listeners
submitBtn.addEventListener('click', submitForm);

// Handle Enter key in title field (move to description)
titleInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        descInput.focus();
    }
});

// Handle Ctrl+Enter in description (submit)
descInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        submitForm();
    }
});

// Telegram Main Button setup (alternative submit method)
tg.MainButton.setText('✅ Отправить задачу');
tg.MainButton.color = tg.themeParams.button_color || '#6c63ff';
tg.MainButton.textColor = tg.themeParams.button_text_color || '#ffffff';

// Show main button when form has title
function updateMainButton() {
    const isValid = titleInput.value.trim() && getTaskType();

    if (isValid) {
        tg.MainButton.show();
        // Hide HTML button explicitly
        document.querySelector('.submit-section').style.display = 'none';
        // Update padding to avoid content being hidden behind MainButton
        document.getElementById('app').style.paddingBottom = '20px';
    } else {
        tg.MainButton.hide();
        // Only show HTML button if NOT in Telegram environment (platform is unknown)
        // OR if you want it as fallback. For now, let's keep it hidden if empty to avoid clutter
        // if (tg.platform === 'unknown') {
        //     document.querySelector('.submit-section').style.display = 'block';
        //     document.getElementById('app').style.paddingBottom = '120px';
        // }
    }
}

titleInput.addEventListener('input', updateMainButton);
taskTypeSelect.addEventListener('change', updateMainButton);

tg.MainButton.onClick(submitForm);

// Handle back button
tg.BackButton.onClick(() => {
    if (titleInput.value.trim() || descInput.value.trim()) {
        tg.showConfirm('Вы уверены, что хотите выйти? Данные будут потеряны.', (confirmed) => {
            if (confirmed) {
                tg.close();
            }
        });
    } else {
        tg.close();
    }
});

// Show back button
tg.BackButton.show();

// Ready signal to Telegram
tg.ready();

// Debug info (remove in production)
console.log('Telegram WebApp Info:', {
    user: tg.initDataUnsafe?.user,
    theme: tg.colorScheme,
    platform: tg.platform,
    version: tg.version
});
