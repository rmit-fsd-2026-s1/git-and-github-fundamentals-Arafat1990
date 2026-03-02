// Week 1: Registration UI (front-end only)
// Focus: events + validation + feedback

const $ = (id) => document.getElementById(id);

const form = $("registerForm");
const submitBtn = $("submitBtn");
const toast = $("toast");

const fields = {
  fullName: $("fullName"),
  username: $("username"),
  email: $("email"),
  phone: $("phone"),
  password: $("password"),
  confirmPassword: $("confirmPassword"),
  country: $("country"),
  age: $("age"),
  terms: $("terms"),
  newsletter: $("newsletter"),
};

const errors = {
  fullName: $("fullNameError"),
  username: $("usernameError"),
  email: $("emailError"),
  phone: $("phoneError"),
  password: $("passwordError"),
  confirmPassword: $("confirmPasswordError"),
  country: $("countryError"),
  age: $("ageError"),
  terms: $("termsError"),
};

const progressText = $("progressText");
const progressFill = $("progressFill");
const meterFill = $("meterFill");
const passwordHint = $("passwordHint");
const togglePasswordBtn = $("togglePassword");
const clearDraftBtn = $("clearDraft");

const suggestionsBox = $("emailSuggestions");

const DRAFT_KEY = "week1_registration_draft_v1";

const emailDomains = ["gmail.com", "outlook.com", "hotmail.com", "yahoo.com", "icloud.com", "proton.me", "edu.au"];

function showToast(message) {
  toast.textContent = message;
  toast.style.display = "block";
  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    toast.style.display = "none";
  }, 2500);
}

function setError(key, message) {
  errors[key].textContent = message || "";
}

function isValidEmail(email) {
  // Simple but reasonable
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
}

function normalizeUsername(v) {
  return v.trim().toLowerCase();
}

function validateFullName() {
  const v = fields.fullName.value.trim();
  if (v.length < 3) return setError("fullName", "Please enter your full name.");
  return setError("fullName", "");
}

function validateUsername() {
  const v = normalizeUsername(fields.username.value);
  fields.username.value = v; // mild auto-normalize
  if (!/^[a-z0-9_]{3,15}$/.test(v)) {
    return setError("username", "3–15 chars: letters, numbers, underscore only.");
  }
  return setError("username", "");
}

function validateEmail() {
  const v = fields.email.value.trim();
  if (!isValidEmail(v)) return setError("email", "Enter a valid email address.");
  return setError("email", "");
}

function formatPhone(raw) {
  const digits = raw.replace(/\D/g, "").slice(0, 10); // US-style demo
  const a = digits.slice(0, 3);
  const b = digits.slice(3, 6);
  const c = digits.slice(6, 10);

  if (digits.length <= 3) return a;
  if (digits.length <= 6) return `(${a}) ${b}`;
  return `(${a}) ${b}-${c}`;
}

function validatePhone() {
  const v = fields.phone.value.trim();
  if (!v) return setError("phone", "");
  const digits = v.replace(/\D/g, "");
  if (digits.length !== 10) return setError("phone", "Phone must have 10 digits (or leave blank).");
  return setError("phone", "");
}

function passwordScore(pw) {
  let score = 0;
  if (pw.length >= 8) score += 25;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) score += 25;
  if (/\d/.test(pw)) score += 25;
  if (/[^a-zA-Z0-9]/.test(pw)) score += 25;
  return score; // 0..100
}

function validatePassword() {
  const pw = fields.password.value;
  const score = passwordScore(pw);
  meterFill.style.width = `${score}%`;

  if (!pw) {
    passwordHint.textContent = "Use 8+ chars with upper/lower, number, symbol.";
    setError("password", "Password is required.");
    return;
  }

  if (pw.length < 8) {
    passwordHint.textContent = "Too short — add more characters.";
    setError("password", "Password must be at least 8 characters.");
    return;
  }

  if (score < 75) {
    passwordHint.textContent = "Almost — add uppercase/lowercase + number + symbol.";
    setError("password", "Password is weak.");
    return;
  }

  passwordHint.textContent = "Strong password ✅";
  setError("password", "");
}

function validateConfirmPassword() {
  const pw = fields.password.value;
  const cpw = fields.confirmPassword.value;
  if (!cpw) return setError("confirmPassword", "Please confirm your password.");
  if (pw !== cpw) return setError("confirmPassword", "Passwords do not match.");
  return setError("confirmPassword", "");
}

function validateCountry() {
  if (!fields.country.value) return setError("country", "Please select a country.");
  return setError("country", "");
}

function validateAge() {
  const v = fields.age.value;
  if (!v) return setError("age", "Age is required.");
  const n = Number(v);
  if (!Number.isFinite(n)) return setError("age", "Enter a valid age.");
  if (n < 13) return setError("age", "You must be 13+ to register.");
  if (n > 120) return setError("age", "Enter a realistic age.");
  return setError("age", "");
}

function validateTerms() {
  if (!fields.terms.checked) return setError("terms", "You must accept the terms to continue.");
  return setError("terms", "");
}

function validateAll() {
  validateFullName();
  validateUsername();
  validateEmail();
  validatePhone();
  validatePassword();
  validateConfirmPassword();
  validateCountry();
  validateAge();
  validateTerms();

  const hasError = Object.values(errors).some((el) => el.textContent.trim().length > 0);
  return !hasError;
}

function updateSubmitState() {
  // gate submit: must accept terms AND no current errors for required fields
  const ok = validateAll();
  submitBtn.disabled = !ok;
}

function updateProgress() {
  // simple completion: required fields + terms
  const required = [
    fields.fullName.value.trim(),
    fields.username.value.trim(),
    fields.email.value.trim(),
    fields.password.value,
    fields.confirmPassword.value,
    fields.country.value,
    fields.age.value,
    fields.terms.checked ? "yes" : "",
  ];

  const filled = required.filter(Boolean).length;
  const pct = Math.round((filled / required.length) * 100);

  progressText.textContent = `${pct}% complete`;
  progressFill.style.width = `${pct}%`;
  progressFill.parentElement.setAttribute("aria-valuenow", String(pct));
}

function saveDraft() {
  const draft = {
    fullName: fields.fullName.value,
    username: fields.username.value,
    email: fields.email.value,
    phone: fields.phone.value,
    country: fields.country.value,
    age: fields.age.value,
    newsletter: fields.newsletter.checked,
    // intentionally NOT saving password fields
  };
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function loadDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const d = JSON.parse(raw);

    fields.fullName.value = d.fullName || "";
    fields.username.value = d.username || "";
    fields.email.value = d.email || "";
    fields.phone.value = d.phone || "";
    fields.country.value = d.country || "";
    fields.age.value = d.age || "";
    fields.newsletter.checked = !!d.newsletter;

    showToast("Draft restored.");
  } catch {
    // ignore
  }
}

function clearDraft() {
  localStorage.removeItem(DRAFT_KEY);
  showToast("Draft cleared.");
}

function hideSuggestions() {
  suggestionsBox.style.display = "none";
  suggestionsBox.innerHTML = "";
}

function showEmailSuggestions() {
  const v = fields.email.value.trim();
  const at = v.indexOf("@");

  // Only suggest once user typed "@"
  if (at === -1) return hideSuggestions();

  const left = v.slice(0, at);
  const right = v.slice(at + 1);

  if (!left) return hideSuggestions();

  const matches = emailDomains
    .filter((d) => d.startsWith(right.toLowerCase()))
    .slice(0, 5)
    .map((d) => `${left}@${d}`);

  if (matches.length === 0) return hideSuggestions();

  suggestionsBox.innerHTML = "";
  for (const m of matches) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.setAttribute("role", "option");
    btn.textContent = m;
    btn.addEventListener("click", () => {
      fields.email.value = m;
      hideSuggestions();
      validateEmail();
      saveDraft();
      updateProgress();
      updateSubmitState();
    });
    suggestionsBox.appendChild(btn);
  }

  suggestionsBox.style.display = "block";
}

// --- Event wiring (this is the "focus on JS events" part) ---

// input events (live feedback)
fields.fullName.addEventListener("input", () => { validateFullName(); saveDraft(); updateProgress(); updateSubmitState(); });
fields.username.addEventListener("input", () => { validateUsername(); saveDraft(); updateProgress(); updateSubmitState(); });
fields.email.addEventListener("input", () => { showEmailSuggestions(); validateEmail(); saveDraft(); updateProgress(); updateSubmitState(); });
fields.phone.addEventListener("input", () => {
  const caretEnd = fields.phone.selectionEnd;
  fields.phone.value = formatPhone(fields.phone.value);
  // best-effort caret set
  fields.phone.setSelectionRange(caretEnd, caretEnd);
  validatePhone();
  saveDraft();
  updateProgress();
  updateSubmitState();
});
fields.password.addEventListener("input", () => { validatePassword(); updateProgress(); updateSubmitState(); });
fields.confirmPassword.addEventListener("input", () => { validateConfirmPassword(); updateProgress(); updateSubmitState(); });
fields.country.addEventListener("change", () => { validateCountry(); saveDraft(); updateProgress(); updateSubmitState(); });
fields.age.addEventListener("input", () => { validateAge(); saveDraft(); updateProgress(); updateSubmitState(); });

// blur events (hide suggestions when leaving email)
fields.email.addEventListener("blur", () => {
  // delay so clicking suggestion still works
  setTimeout(hideSuggestions, 120);
});

fields.terms.addEventListener("change", () => { validateTerms(); updateProgress(); updateSubmitState(); });

// show/hide password
togglePasswordBtn.addEventListener("click", () => {
  const isHidden = fields.password.type === "password";
  fields.password.type = isHidden ? "text" : "password";
  fields.confirmPassword.type = isHidden ? "text" : "password";
  togglePasswordBtn.textContent = isHidden ? "Hide" : "Show";
});

// clear draft
clearDraftBtn.addEventListener("click", () => {
  clearDraft();
  // keep UI but wipe fields
  form.reset();
  hideSuggestions();
  Object.keys(errors).forEach((k) => setError(k, ""));
  meterFill.style.width = "0%";
  progressFill.style.width = "0%";
  progressText.textContent = "0% complete";
  submitBtn.disabled = true;
});

// submit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const ok = validateAll();
  updateProgress();
  updateSubmitState();

  if (!ok) {
    showToast("Please fix the errors before submitting.");
    return;
  }

  // Front-end only: show a success message
  showToast("Account created (demo). No backend connected.");
  clearDraft();
  form.reset();
  meterFill.style.width = "0%";
  submitBtn.disabled = true;
  updateProgress();
});

// initial load
loadDraft();
validateAll();
updateProgress();
updateSubmitState();