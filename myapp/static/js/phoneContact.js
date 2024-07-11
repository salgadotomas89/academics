document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const phoneInput = document.getElementById('phoneInput');
  const submitButton = form.querySelector('button[type="submit"]');
  let isBlocked = false;
  let attemptCount = 0;
  let lastAttemptTime = 0;
  const MAX_ATTEMPTS = 3;
  const ATTEMPT_WINDOW = 10000; // 10 segundos
  const BLOCK_DURATION = 30000; // 30 segundos de bloqueo

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    
    if (isBlocked) {
      return;
    }

    const now = Date.now();
    if (now - lastAttemptTime < ATTEMPT_WINDOW) {
      attemptCount++;
    } else {
      attemptCount = 1;
    }
    lastAttemptTime = now;

    if (attemptCount > MAX_ATTEMPTS) {
      blockForm(BLOCK_DURATION);
      showToast('Demasiados intentos. Por favor, espera antes de intentar de nuevo.', 'error');
      return;
    }
    
    const phoneNumber = phoneInput.value;
    
    fetch('phone-contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': getCookie('csrftoken')
      },
      body: JSON.stringify({ phone: phoneNumber })
    })
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        showSuccessState();
        blockForm(20000);
        attemptCount = 0;
      } else if (data.blocked) {
        blockForm(20000);
      } else {
        showToast(data.message, 'error');
      }
    })
    .catch(error => {
      console.error('Error:', error);
      showToast('Hubo un error al enviar el formulario.', 'error');
    });
  });
  
  function blockForm(duration) {
    isBlocked = true;
    phoneInput.disabled = true;
    submitButton.disabled = true;
    
    setTimeout(() => {
      phoneInput.disabled = false;
      submitButton.disabled = false;
      isBlocked = false;
      resetButtonState();
    }, duration);
  }

  function showSuccessState() {
    submitButton.classList.remove('btn-primary');
    submitButton.classList.add('btn-success');
    submitButton.textContent = 'Teléfono enviado exitosamente';
    showToast('Teléfono enviado exitosamente', 'success');
  }

  function resetButtonState() {
    submitButton.classList.remove('btn-success');
    submitButton.classList.add('btn-primary');
    submitButton.textContent = 'Enviar';
  }

  function showToast(message, type = 'info') {
    const toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.innerHTML = `
      <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
        <div class="toast-header">
          <strong class="me-auto">Notificación</strong>
          <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
        <div class="toast-body ${type}">
          ${message}
        </div>
      </div>
    `;
    document.body.appendChild(toastContainer);
    
    const toastElement = toastContainer.querySelector('.toast');
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 2000 });
    toast.show();
    
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastContainer.remove();
    });
  }
  
  function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  }
});