<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

const MAX_MESSAGE = 4000;
const MIN_MESSAGE = 20;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Messages {
  ariaLabel: string;
  honeypotLabel: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  subject: string;
  subjectOptions: { general: string; estimate: string; consulting: string; other: string };
  message: string;
  messagePlaceholder: string;
  charCounter: string; // contains "{count}"
  privacy: string;
  submit: string;
  sending: string;
  success: string;
  errors: {
    name: string;
    email: string;
    messageShort: string;
    messageLong: string;
    rateLimit: string;
    server: string;
  };
}

const props = defineProps<{
  messages: Messages;
  /** endpoint path; defaults to /api/contact */
  action?: string;
}>();

type SubjectKey = 'general' | 'estimate' | 'consulting' | 'other';
type Status = 'idle' | 'submitting' | 'success' | 'error';

const form = reactive({
  name: '',
  email: '',
  subject: 'general' as SubjectKey,
  message: '',
  website: '', // honeypot — must stay empty
});

const touched = reactive({ name: false, email: false, message: false });
const status = ref<Status>('idle');
const feedback = ref('');

const messageCount = computed(() => form.message.length);
const counterText = computed(() => props.messages.charCounter.replace('{count}', String(messageCount.value)));

const errors = computed(() => {
  const e: Partial<Record<'name' | 'email' | 'message', string>> = {};
  if (!form.name.trim()) e.name = props.messages.errors.name;
  if (!EMAIL_RE.test(form.email.trim())) e.email = props.messages.errors.email;
  const len = form.message.trim().length;
  if (len > 0 && len < MIN_MESSAGE) e.message = props.messages.errors.messageShort;
  else if (len > MAX_MESSAGE) e.message = props.messages.errors.messageLong;
  else if (len === 0) e.message = props.messages.errors.messageShort;
  return e;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

const subjectEntries = computed(
  () =>
    [
      ['general', props.messages.subjectOptions.general],
      ['estimate', props.messages.subjectOptions.estimate],
      ['consulting', props.messages.subjectOptions.consulting],
      ['other', props.messages.subjectOptions.other],
    ] as [SubjectKey, string][],
);

function showError(field: 'name' | 'email' | 'message'): boolean {
  return touched[field] && Boolean(errors.value[field]);
}

async function onSubmit() {
  touched.name = touched.email = touched.message = true;
  feedback.value = '';
  if (!isValid.value) return;
  // Honeypot tripped → pretend success, send nothing.
  if (form.website.trim() !== '') {
    status.value = 'success';
    feedback.value = props.messages.success;
    return;
  }

  status.value = 'submitting';
  feedback.value = props.messages.sending;
  try {
    const res = await fetch(props.action ?? '/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject,
        message: form.message.trim(),
        website: form.website,
      }),
    });
    if (res.ok) {
      status.value = 'success';
      feedback.value = props.messages.success;
      form.name = form.email = form.message = '';
      form.subject = 'general';
      touched.name = touched.email = touched.message = false;
    } else if (res.status === 429) {
      status.value = 'error';
      feedback.value = props.messages.errors.rateLimit;
    } else {
      status.value = 'error';
      feedback.value = props.messages.errors.server;
    }
  } catch {
    status.value = 'error';
    feedback.value = props.messages.errors.server;
  }
}
</script>

<template>
  <form class="cf" novalidate :aria-label="messages.ariaLabel" @submit.prevent="onSubmit">
    <div class="cf__row cf__row--split">
      <div class="md-field cf__field">
        <label for="cf-name">{{ messages.name }}</label>
        <input
          id="cf-name"
          v-model="form.name"
          class="md-input"
          type="text"
          name="name"
          autocomplete="name"
          :placeholder="messages.namePlaceholder"
          :data-state="showError('name') ? 'error' : undefined"
          :aria-invalid="showError('name') || undefined"
          aria-describedby="cf-name-err"
          @blur="touched.name = true"
        />
        <span id="cf-name-err" class="cf__err" role="alert">{{ showError('name') ? errors.name : '' }}</span>
      </div>

      <div class="md-field cf__field">
        <label for="cf-email">{{ messages.email }}</label>
        <input
          id="cf-email"
          v-model="form.email"
          class="md-input"
          type="email"
          name="email"
          autocomplete="email"
          :placeholder="messages.emailPlaceholder"
          :data-state="showError('email') ? 'error' : undefined"
          :aria-invalid="showError('email') || undefined"
          aria-describedby="cf-email-err"
          @blur="touched.email = true"
        />
        <span id="cf-email-err" class="cf__err" role="alert">{{ showError('email') ? errors.email : '' }}</span>
      </div>
    </div>

    <div class="md-field cf__field">
      <label for="cf-subject">{{ messages.subject }}</label>
      <div class="cf__select-wrap">
        <select id="cf-subject" v-model="form.subject" class="md-input" name="subject">
          <option v-for="[key, label] in subjectEntries" :key="key" :value="key">{{ label }}</option>
        </select>
        <span class="cf__select-caret" aria-hidden="true">▾</span>
      </div>
    </div>

    <div class="md-field cf__field">
      <div class="cf__label-row">
        <label for="cf-message">{{ messages.message }}</label>
        <span class="cf__counter" :class="{ 'is-error': messageCount > MAX_MESSAGE }">{{ counterText }}</span>
      </div>
      <textarea
        id="cf-message"
        v-model="form.message"
        class="md-input"
        name="message"
        rows="6"
        :maxlength="MAX_MESSAGE + 200"
        :placeholder="messages.messagePlaceholder"
        :data-state="showError('message') ? 'error' : undefined"
        :aria-invalid="showError('message') || undefined"
        aria-describedby="cf-message-err"
        @blur="touched.message = true"
      />
      <span id="cf-message-err" class="cf__err" role="alert">{{ showError('message') ? errors.message : '' }}</span>
    </div>

    <!-- Honeypot — visually hidden, off-screen, not announced. Bots fill it; humans don't. -->
    <div class="cf__hp" aria-hidden="true">
      <label for="cf-website">{{ messages.honeypotLabel }}</label>
      <input id="cf-website" v-model="form.website" type="text" name="website" tabindex="-1" autocomplete="off" />
    </div>

    <!-- Live feedback region -->
    <p
      class="cf__feedback"
      :class="{ 'is-success': status === 'success', 'is-error': status === 'error' }"
      role="status"
      aria-live="polite"
    >
      {{ feedback }}
    </p>

    <div class="cf__row cf__submit-row">
      <span class="cf__privacy">{{ messages.privacy }}</span>
      <button type="submit" class="md-btn cf__submit" :disabled="status === 'submitting'">
        {{ status === 'submitting' ? messages.sending : status === 'success' ? messages.success : messages.submit }}
        <span class="arrow">→</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.cf {
  display: grid;
  gap: 18px;
}
.cf__row {
  display: grid;
  gap: 18px;
}
.cf__row--split {
  grid-template-columns: 1fr;
}
@media (min-width: 640px) {
  .cf__row--split { grid-template-columns: 1fr 1fr; }
}
.cf__field {
  display: grid;
  gap: 6px;
}
.cf__label-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.cf__counter {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-3);
  letter-spacing: 0.06em;
}
.cf__counter.is-error { color: var(--danger); }
.cf__err {
  min-height: 16px;
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--danger);
  letter-spacing: 0.04em;
}
.cf__select-wrap { position: relative; }
.cf__select-wrap select {
  appearance: none;
  -webkit-appearance: none;
  padding-right: 36px;
}
.cf__select-caret {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: var(--text-3);
  font-family: var(--font-mono);
  font-size: 12px;
}
.cf__hp {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.cf__feedback {
  margin: 0;
  min-height: 1.2em;
  font-family: var(--font-mono);
  font-size: 12px;
  letter-spacing: 0.04em;
  color: var(--text-2);
}
.cf__feedback.is-success { color: var(--brand); }
.cf__feedback.is-error { color: var(--danger); }
.cf__submit-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.cf__privacy {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-3);
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
.cf__submit { height: 48px; padding: 0 24px; }
</style>
