// @ts-check
/**
 * SYNASE AI — FormSubmit Contact Form Integration
 * Reference: https://formsubmit.co/
 * 
 * Features:
 * - Direct AJAX transmission to https://formsubmit.co/ajax/{destination_email}
 * - Configurable destination email via window.FORMSUBMIT_EMAIL with fallback placeholder
 * - Full client-side input validation with accessible error messaging
 * - Honeypot spam defense (_honey)
 * - Reply-to routing (_replyto) and custom notification subject (_subject)
 * - State machine: idle | validating | submitting | success | error
 * - Form data preservation on transmission failure with retry support
 */

/**
 * Default public contact recipient. Configurable at runtime via window.FORMSUBMIT_EMAIL.
 */
export const DEFAULT_CONTACT_EMAIL = 'satyam8076singh@gmail.com';

/**
 * Validates an email address format.
 * @param {string} email
 * @returns {boolean}
 */
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

/**
 * Validates the contact form fields.
 * @param {Object} data
 * @returns {{ valid: boolean, errors: Record<string, string> }}
 */
export function validateContactForm(data) {
  const errors = {};

  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Please provide your full name (at least 2 characters).';
  }

  if (!data.email || !isValidEmail(data.email)) {
    errors.email = 'Please provide a valid work email address.';
  }

  if (!data.inquiry_type || data.inquiry_type.trim() === '') {
    errors.inquiry_type = 'Please select a primary inquiry category.';
  }

  if (!data.subject || data.subject.trim().length < 4) {
    errors.subject = 'Please enter a descriptive inquiry subject.';
  }

  if (!data.message || data.message.trim().length < 10) {
    errors.message = 'Please provide message details (at least 10 characters).';
  } else if (data.message.trim().length > 3000) {
    errors.message = 'Message must be under 3000 characters.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Initializes the Contact Us form behavior.
 * @param {HTMLFormElement} form
 * @param {Object} [options]
 * @returns {{ destroy: () => void, setTopic: (topic: string) => void }}
 */
export function initContactForm(form, options = {}) {
  if (!form) return { destroy: () => {}, setTopic: () => {} };

  const actionEmail = form.getAttribute('action')?.replace(/^https:\/\/formsubmit\.co\/(?:ajax\/)?/, '')?.trim();
  const destinationEmail = options.destinationEmail ||
    actionEmail ||
    (typeof window !== 'undefined' && window.FORMSUBMIT_EMAIL) ||
    DEFAULT_CONTACT_EMAIL;

  const submitBtn = /** @type {HTMLButtonElement|null} */ (form.querySelector('.form-submit'));
  const feedbackEl = form.querySelector('#contact-feedback');

  let isSubmitting = false;

  // Clear previous inline errors
  function clearErrors() {
    form.querySelectorAll('.form-field-error').forEach((el) => el.remove());
    form.querySelectorAll('[aria-invalid="true"]').forEach((el) => {
      el.removeAttribute('aria-invalid');
      el.removeAttribute('aria-describedby');
    });
    if (feedbackEl) {
      feedbackEl.className = 'contact-feedback-box';
      feedbackEl.style.display = 'none';
      feedbackEl.innerHTML = '';
    }
  }

  // Display specific field error
  function showFieldError(fieldName, message) {
    const fieldInput = form.querySelector(`[name="${fieldName}"]`);
    if (!fieldInput) return;

    fieldInput.setAttribute('aria-invalid', 'true');
    const errorId = `err_${fieldName}`;
    fieldInput.setAttribute('aria-describedby', errorId);

    const errorEl = document.createElement('div');
    errorEl.id = errorId;
    errorEl.className = 'form-field-error';
    errorEl.setAttribute('role', 'alert');
    errorEl.textContent = message;

    fieldInput.parentElement?.appendChild(errorEl);
  }

  // Display top feedback message
  function showFeedback(type, htmlContent) {
    if (!feedbackEl) return;
    feedbackEl.className = `contact-feedback-box ${type}`;
    feedbackEl.style.display = 'block';
    feedbackEl.innerHTML = htmlContent;
    feedbackEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Real-time error dismissal on input/change
  const inputFields = /** @type {NodeListOf<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>} */ (
    form.querySelectorAll('input, select, textarea')
  );
  const handleInputChange = (event) => {
    const target = /** @type {HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement} */ (event.target);
    if (target && target.getAttribute('aria-invalid') === 'true') {
      target.removeAttribute('aria-invalid');
      target.removeAttribute('aria-describedby');
      const errEl = form.querySelector(`#err_${target.name}`);
      if (errEl) errEl.remove();
    }
  };
  inputFields.forEach((el) => {
    el.addEventListener('input', handleInputChange);
    el.addEventListener('change', handleInputChange);
  });

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    clearErrors();

    const formData = new FormData(form);

    // Spam Honeypot Check
    const honey = formData.get('_honey');
    if (honey) {
      // Quietly swallow bot submission
      showFeedback('success', 'Thank you. Your inquiry has been submitted.');
      form.reset();
      return;
    }

    const rawData = {
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      organization: String(formData.get('organization') || ''),
      inquiry_type: String(formData.get('inquiry_type') || ''),
      subject: String(formData.get('subject') || ''),
      message: String(formData.get('message') || '')
    };

    const validation = validateContactForm(rawData);
    if (!validation.valid) {
      Object.entries(validation.errors).forEach(([field, msg]) => {
        showFieldError(field, msg);
      });
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid instanceof HTMLElement) firstInvalid.focus();
      showFeedback('error', 'Please resolve the highlighted fields before sending.');
      return;
    }

    isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.classList.add('loading');
      submitBtn.innerHTML = '<span class="spinner" aria-hidden="true"></span> Transmitting Inquiry…';
    }

    const payload = {
      ...rawData,
      _subject: `[SYNASE AI] ${rawData.inquiry_type}: ${rawData.subject}`,
      _replyto: rawData.email,
      _template: 'table',
      _captcha: 'false'
    };

    const endpoint = `https://formsubmit.co/ajax/${encodeURIComponent(destinationEmail)}`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json().catch(() => null);

      if (response.ok && (result?.success === 'true' || result?.success === true || response.status === 200)) {
        showFeedback(
          'success',
          `<strong>Inquiry Transmitted Successfully.</strong><br>Thank you, ${escapeHtml(rawData.name)}. Our architecture team has received your message regarding <em>${escapeHtml(rawData.subject)}</em> and will respond to <strong>${escapeHtml(rawData.email)}</strong> within 24 hours.`
        );
        form.reset();
      } else if (result?.message && /activat|confirm/i.test(result.message)) {
        showFeedback(
          'success',
          `<strong>Form Activation Notice:</strong><br>${escapeHtml(result.message)}<br>Please check the inbox for <strong>${escapeHtml(destinationEmail)}</strong> to complete the one-time FormSubmit confirmation link.`
        );
        form.reset();
      } else {
        const errorMsg = result?.message || 'The FormSubmit endpoint returned an unexpected response.';
        showFeedback(
          'error',
          `<strong>Transmission Notice:</strong> ${escapeHtml(errorMsg)}<br>Your message has been preserved below. You may retry or contact <a href="mailto:${destinationEmail}">${destinationEmail}</a> directly.`
        );
      }
    } catch (err) {
      // Network offline or CORS/fetch exception
      console.warn('FormSubmit Network Error:', err);
      showFeedback(
        'error',
        `<strong>Network Connection Issue:</strong> Unable to reach the inquiry delivery endpoint directly.<br>` +
        `Your message has been retained. You can email us at <a href="mailto:${destinationEmail}">${destinationEmail}</a> or ` +
        `<button type="button" id="contact-fallback-submit" style="background:transparent;border:none;color:inherit;text-decoration:underline;cursor:pointer;font-weight:700;padding:0;font-size:inherit;">click here to submit directly via FormSubmit gateway →</button>`
      );
      const fallbackBtn = form.querySelector('#contact-fallback-submit');
      if (fallbackBtn) {
        fallbackBtn.addEventListener('click', () => {
          form.submit();
        });
      }
    } finally {
      isSubmitting = false;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        submitBtn.innerHTML = 'Send Engineering Inquiry →';
      }
    }
  }

  form.addEventListener('submit', handleSubmit);

  const ALIAS_MAP = {
    'product information': 'Product Evaluation & Demo',
    'product information & architecture': 'Product Evaluation & Demo',
    'product evaluation & demo': 'Product Evaluation & Demo',
    'product demo': 'Product Evaluation & Demo',
    'demo': 'Product Evaluation & Demo',
    'partnership': 'Research & Academic Collaboration',
    'partnership & research': 'Research & Academic Collaboration',
    'research & academic collaboration': 'Research & Academic Collaboration',
    'research': 'Research & Academic Collaboration',
    'academic': 'Research & Academic Collaboration',
    'technical support': 'Technical Support',
    'technical support & integration': 'Technical Support',
    'support': 'Technical Support',
    'general inquiry': 'General Inquiries',
    'general inquiries': 'General Inquiries',
    'other': 'Other'
  };

  /**
   * Sets the dropdown to the specified topic name or close match.
   * @param {string} topic
   */
  function setTopic(topic) {
    const select = /** @type {HTMLSelectElement|null} */ (form.querySelector('[name="inquiry_type"]'));
    if (!select || !topic) return;

    const normalizedTopic = topic.trim().toLowerCase();
    const aliasResolved = ALIAS_MAP[normalizedTopic] || topic;
    const clean = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, '');
    const cleanTarget = clean(aliasResolved);

    for (let i = 0; i < select.options.length; i++) {
      const opt = select.options[i];
      if (!opt.value) continue;
      const cleanVal = clean(opt.value);
      const cleanText = clean(opt.text);

      if (
        cleanVal === cleanTarget ||
        cleanText === cleanTarget ||
        cleanVal.includes(cleanTarget) ||
        cleanTarget.includes(cleanVal) ||
        cleanText.includes(cleanTarget) ||
        cleanTarget.includes(cleanText)
      ) {
        select.selectedIndex = i;
        select.dispatchEvent(new Event('change', { bubbles: true }));

        // Clear any previous error on inquiry_type
        select.removeAttribute('aria-invalid');
        select.removeAttribute('aria-describedby');
        const errEl = form.querySelector('#err_inquiry_type');
        if (errEl) errEl.remove();
        break;
      }
    }
  }

  return {
    destroy: () => {
      form.removeEventListener('submit', handleSubmit);
      inputFields.forEach((el) => {
        el.removeEventListener('input', handleInputChange);
        el.removeEventListener('change', handleInputChange);
      });
    },
    setTopic,
    getTopic: () => {
      const select = /** @type {HTMLSelectElement|null} */ (form.querySelector('[name="inquiry_type"]'));
      return select ? select.value : '';
    }
  };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
