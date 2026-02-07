const DEFAULT_REMINDER_CONFIG = {
  enabled: false,
  daysInactive: 7,
  webhookUrl: '',
  lastSentAt: null,
};

function getReminderConfig(userId) {
  const raw = localStorage.getItem(`oporail_reminder_${userId}`);
  if (!raw) return { ...DEFAULT_REMINDER_CONFIG };
  try {
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_REMINDER_CONFIG, ...parsed };
  } catch {
    return { ...DEFAULT_REMINDER_CONFIG };
  }
}

function saveReminderConfig(userId, config) {
  localStorage.setItem(`oporail_reminder_${userId}`, JSON.stringify(config));
}

function updateLastActive(userId) {
  localStorage.setItem(`oporail_last_active_${userId}`, new Date().toISOString());
}

function getLastActive(userId) {
  return localStorage.getItem(`oporail_last_active_${userId}`);
}

async function sendReminderWebhook(config, payload) {
  if (!config.webhookUrl) return false;
  try {
    await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return true;
  } catch (error) {
    console.error('Error enviando recordatorio:', error);
    return false;
  }
}

async function checkReminder(userId, userEmail) {
  const config = getReminderConfig(userId);
  if (!config.enabled || !config.daysInactive) return;

  const lastActive = getLastActive(userId);
  if (!lastActive) return;

  const lastActiveDate = new Date(lastActive);
  const now = new Date();
  const diffDays = Math.floor((now - lastActiveDate) / (1000 * 60 * 60 * 24));
  const lastSentAt = config.lastSentAt ? new Date(config.lastSentAt) : null;

  if (diffDays >= config.daysInactive) {
    const canSend = !lastSentAt || (now - lastSentAt) > 24 * 60 * 60 * 1000;
    if (!canSend) return;

    const sent = await sendReminderWebhook(config, {
      userId,
      email: userEmail,
      daysInactive: diffDays,
      lastActive,
    });

    if (sent) {
      saveReminderConfig(userId, { ...config, lastSentAt: now.toISOString() });
    }
  }
}

export {
  getReminderConfig,
  saveReminderConfig,
  updateLastActive,
  getLastActive,
  checkReminder,
};
