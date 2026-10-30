const form = document.getElementById('signup-form');
const statusBox = document.getElementById('form-status');
const appScriptUrl = window.APP_SCRIPT_URL || 'https://script.google.com/macros/s/AKfycbwXa0wMf2lPEoHcdKoiDc43PSSNIii0aPPOeoaXo6tV_UhLbQE98fE1HWC3kBy5j37y/exec';
let responseFrame;

function setStatus(message, type = 'info') {
  statusBox.textContent = message;
  statusBox.className = `form-status ${type}`;
}

function getResponseFrame() {
  if (!responseFrame) {
    responseFrame = document.createElement('iframe');
    responseFrame.name = 'signup-response-frame';
    responseFrame.title = '報名資料送出結果';
    responseFrame.hidden = true;
    document.body.appendChild(responseFrame);
  }
  return responseFrame;
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const payload = Object.fromEntries(Array.from(formData.entries()).map(([key, value]) => [key, String(value).trim()]));

  if (!payload.name || !payload.email) {
    setStatus('請填寫姓名與 email。', 'error');
    return;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
    setStatus('請輸入有效的 email。', 'error');
    return;
  }

  if (appScriptUrl.includes('YOUR_DEPLOYMENT_ID')) {
    setStatus('尚未部署 Google Apps Script。請完成部署後，將 APP_SCRIPT_URL 更新到真實的 Web App URL。', 'error');
    return;
  }

  setStatus('資料送出中，請稍候…', 'info');
  const requestId = crypto.randomUUID();
  const frame = getResponseFrame();
  const requestForm = document.createElement('form');
  requestForm.method = 'POST';
  requestForm.action = appScriptUrl;
  requestForm.target = frame.name;
  requestForm.hidden = true;
  payload.requestId = requestId;
  const isTestSubmission = new URLSearchParams(window.location.search).get('test') === '1';
  if (isTestSubmission) {
    payload.testSubmission = 'true';
  }

  Object.entries(payload).forEach(([name, value]) => {
    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = name;
    input.value = value;
    requestForm.appendChild(input);
  });
  document.body.appendChild(requestForm);

  let timeoutId;
  const handleResponse = (messageEvent) => {
    const originAllowed = messageEvent.origin === new URL(appScriptUrl).origin ||
      messageEvent.origin.endsWith('.googleusercontent.com');
    if (!originAllowed || !messageEvent.data ||
        messageEvent.data.type !== 'signup-result' || messageEvent.data.requestId !== requestId) {
      return;
    }

    window.removeEventListener('message', handleResponse);
    window.clearTimeout(timeoutId);
    if (messageEvent.data.success) {
      setStatus('報名成功！資料已送出，感謝您的參與。', 'success');
      if (!isTestSubmission) {
        form.reset();
      }
    } else {
      setStatus('報名失敗，請檢查必填欄位並稍後再試。', 'error');
    }

    requestForm.remove();
  };

  window.addEventListener('message', handleResponse);
  timeoutId = window.setTimeout(() => {
    window.removeEventListener('message', handleResponse);
    requestForm.remove();
    setStatus('無法確認資料是否寫入，請確認 Google Apps Script 部署與授權後再試。', 'error');
  }, 30000);

  requestForm.submit();
});
