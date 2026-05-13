<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue';
import { useScrollAnimation } from '../../composables/useScrollAnimation';

// Limits mirror the PocketBase `contacts` collection (pb/pb_migrations).
const MIN_MESSAGE = 10;
const MAX_MESSAGE = 2000;
const MAX_NAME = 100;
const MAX_SUBJECT = 200;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Messages {
  ariaLabel: string;
  honeypotLabel: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  subject: string;
  subjectPlaceholder: string;
  message: string;
  messagePlaceholder: string;
  charCounter: string; // contains "{count}"
  privacy: string; // contains "{link}" — replaced with the privacy-policy link
  privacyLinkText: string; // the linked text inside `privacy`
  submit: string;
  sending: string;
  success: string;
  /** Generic submission failure — never expose PocketBase error details.
   *  Contains "{email}", replaced with the contact address at render time. */
  error: string;
  errors: {
    name: string;
    email: string;
    subject: string;
    messageShort: string;
    messageLong: string;
    rateLimit: string;
  };
}

const props = defineProps<{
  messages: Messages;
  /** Public PocketBase base URL — the form POSTs to
   *  `${pbUrl}/api/collections/contacts/records`. Provided by Contact.astro
   *  from process.env.PUBLIC_PB_URL at request time. */
  pbUrl: string;
  /** Public contact email — substituted into the `{email}` placeholder in the
   *  generic-failure message. Provided by Contact.astro from CONTACT_EMAIL
   *  (src/lib/site.ts) at request time. */
  contactEmail: string;
  /** Locale-aware href of the privacy policy page (e.g. `/privacy`, `/it/privacy`). */
  privacyHref: string;
}>();

type Status = 'idle' | 'submitting' | 'success' | 'error';

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: '',
  website: '', // honeypot — must stay empty; never sent
});

const touched = reactive({ name: false, email: false, subject: false, message: false });
const status = ref<Status>('idle');
const feedback = ref('');

// --- animation wiring (visual only; never alters submit/validation logic) ---
const formEl = ref<HTMLFormElement | null>(null);
const feedbackEl = ref<HTMLParagraphElement | null>(null);
const { animateOnScroll } = useScrollAnimation();
const motionAllowed =
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

onMounted(() => {
  if (!motionAllowed || !formEl.value) return;
  // Staggered, subtle reveal of the form fields on scroll-in.
  const fields = formEl.value.querySelectorAll<HTMLElement>('.cf__field, .cf__submit-row');
  animateOnScroll(fields, { opacity: 0, y: 16 }, { opacity: 1, y: 0 }, { stagger: 0.08 });
});

watch(status, async (s) => {
  if (!motionAllowed) return;
  if (s !== 'success' && s !== 'error') return;
  await nextTick();
  const el = feedbackEl.value;
  if (!el) return;
  const { default: gsap } = await import('gsap');
  gsap.fromTo(el, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' });
  if (s === 'error') {
    gsap.fromTo(el, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' });
  }
});

const messageCount = computed(() => form.message.length);
const counterText = computed(() => props.messages.charCounter.replace('{count}', String(messageCount.value)));
const errorText = computed(() => props.messages.error.replace('{email}', props.contactEmail));
// Split the privacy line around the `{link}` token so the policy link is real.
const privacyParts = computed(() => props.messages.privacy.split('{link}'));

const errors = computed(() => {
  const e: Partial<Record<'name' | 'email' | 'subject' | 'message', string>> = {};
  if (!form.name.trim()) e.name = props.messages.errors.name;
  if (!EMAIL_RE.test(form.email.trim())) e.email = props.messages.errors.email;
  if (!form.subject.trim()) e.subject = props.messages.errors.subject;
  const len = form.message.trim().length;
  if (len < MIN_MESSAGE) e.message = props.messages.errors.messageShort;
  else if (len > MAX_MESSAGE) e.message = props.messages.errors.messageLong;
  return e;
});

const isValid = computed(() => Object.keys(errors.value).length === 0);

function showError(field: 'name' | 'email' | 'subject' | 'message'): boolean {
  return touched[field] && Boolean(errors.value[field]);
}

function resetForm() {
  form.name = form.email = form.subject = form.message = '';
  touched.name = touched.email = touched.subject = touched.message = false;
}

async function onSubmit() {
  touched.name = touched.email = touched.subject = touched.message = true;
  feedback.value = '';
  if (!isValid.value) return;

  // Honeypot tripped → a bot. Pretend it worked; send nothing.
  if (form.website.trim() !== '') {
    status.value = 'success';
    feedback.value = props.messages.success;
    resetForm();
    return;
  }

  status.value = 'submitting';
  feedback.value = props.messages.sending;
  try {
    const res = await fetch(`${props.pbUrl}/api/collections/contacts/records`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        name: form.name.trim(),
        email: form.email.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
      }),
    });
    if (res.ok) {
      status.value = 'success';
      feedback.value = props.messages.success;
      resetForm();
    } else if (res.status === 429) {
      status.value = 'error';
      feedback.value = props.messages.errors.rateLimit;
    } else {
      // Don't surface PocketBase's response body — generic message only.
      status.value = 'error';
      feedback.value = errorText.value;
    }
  } catch {
    status.value = 'error';
    feedback.value = errorText.value;
  }
}
</script>

<template>
  <form
    ref="formEl"
    class="cf"
    novalidate
    :aria-label="messages.ariaLabel"
    @submit.prevent="onSubmit"
  >
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
          aria-required="true"
          :maxlength="MAX_NAME"
          :placeholder="messages.namePlaceholder"
          :data-state="showError('name') ? 'error' : undefined"
          :aria-invalid="showError('name') || undefined"
          aria-describedby="cf-name-err"
          @blur="touched.name = true"
        >
        <span
          id="cf-name-err"
          class="cf__err"
          role="alert"
        >{{ showError('name') ? errors.name : '' }}</span>
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
          aria-required="true"
          :placeholder="messages.emailPlaceholder"
          :data-state="showError('email') ? 'error' : undefined"
          :aria-invalid="showError('email') || undefined"
          aria-describedby="cf-email-err"
          @blur="touched.email = true"
        >
        <span
          id="cf-email-err"
          class="cf__err"
          role="alert"
        >{{ showError('email') ? errors.email : '' }}</span>
      </div>
    </div>

    <div class="md-field cf__field">
      <label for="cf-subject">{{ messages.subject }}</label>
      <input
        id="cf-subject"
        v-model="form.subject"
        class="md-input"
        type="text"
        name="subject"
        aria-required="true"
        :maxlength="MAX_SUBJECT"
        :placeholder="messages.subjectPlaceholder"
        :data-state="showError('subject') ? 'error' : undefined"
        :aria-invalid="showError('subject') || undefined"
        aria-describedby="cf-subject-err"
        @blur="touched.subject = true"
      >
      <span
        id="cf-subject-err"
        class="cf__err"
        role="alert"
      >{{ showError('subject') ? errors.subject : '' }}</span>
    </div>

    <div class="md-field cf__field">
      <div class="cf__label-row">
        <label for="cf-message">{{ messages.message }}</label>
        <span
          class="cf__counter"
          :class="{ 'is-error': messageCount > MAX_MESSAGE }"
        >{{ counterText }}</span>
      </div>
      <textarea
        id="cf-message"
        v-model="form.message"
        class="md-input"
        name="message"
        rows="6"
        aria-required="true"
        :maxlength="MAX_MESSAGE + 200"
        :placeholder="messages.messagePlaceholder"
        :data-state="showError('message') ? 'error' : undefined"
        :aria-invalid="showError('message') || undefined"
        aria-describedby="cf-message-err"
        @blur="touched.message = true"
      />
      <span
        id="cf-message-err"
        class="cf__err"
        role="alert"
      >{{ showError('message') ? errors.message : '' }}</span>
    </div>

    <!-- Honeypot — visually hidden, off-screen, not announced. Bots fill it; humans don't. Never sent. -->
    <div
      class="cf__hp"
      aria-hidden="true"
    >
      <label for="cf-website">{{ messages.honeypotLabel }}</label>
      <input
        id="cf-website"
        v-model="form.website"
        type="text"
        name="website"
        tabindex="-1"
        autocomplete="off"
      >
    </div>

    <!-- Live feedback region -->
    <p
      ref="feedbackEl"
      class="cf__feedback"
      :class="{ 'is-success': status === 'success', 'is-error': status === 'error' }"
      role="status"
      aria-live="polite"
    >
      {{ feedback }}
    </p>

    <div class="cf__row cf__submit-row">
      <span class="cf__privacy">{{ privacyParts[0] }}<a
        :href="privacyHref"
        class="cf__privacy-link"
      >{{ messages.privacyLinkText }}</a>{{ privacyParts[1] ?? '' }}</span>
      <button
        type="submit"
        class="md-btn cf__submit"
        :class="{ 'is-loading': status === 'submitting' }"
        :disabled="status === 'submitting'"
      >
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
.cf__privacy-link {
  color: var(--text-2);
  text-decoration: underline;
  text-underline-offset: 2px;
}
.cf__privacy-link:hover { color: var(--brand); }
.cf__submit { height: 48px; padding: 0 24px; }
/* Loading-state press; transform-only so no layout shift. The .md-btn base
   already transitions `transform`. Gated on reduced-motion (reduced-motion
   users just get the disabled state, no scale). The focus-border transition
   is already smooth via `.md-input` in app.css. */
@media (prefers-reduced-motion: no-preference) {
  .cf__submit.is-loading { transform: scale(0.97); }
}
</style>
