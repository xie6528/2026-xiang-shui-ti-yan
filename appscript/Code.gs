const SPREADSHEET_NAME = '2026_香水體驗';
const SPREADSHEET_ID = '1FsYH_uHaoVGxTQwp5i9lE68vE3BpQ0o6L9BUBiB2eDY';
const SHEET_NAME = '報名資料';
const HEADERS = ['姓名', 'email', '單位', '電話', '職稱'];

function setupSheet() {
  const spreadsheet = getSpreadsheet_();
  spreadsheet.rename(SPREADSHEET_NAME);
  const sheet = getRegistrationSheet_(spreadsheet);
  sheet.getRange(1, HEADERS.indexOf('電話') + 1, sheet.getMaxRows(), 1).setNumberFormat('@');
}

function doGet() {
  return HtmlService.createHtmlOutput('<p>Google Apps Script 已部署，請使用表單進行報名。</p>');
}

function doPost(e) {
  const params = e && e.parameter ? e.parameter : {};
  const requestId = /^[A-Za-z0-9_-]{1,80}$/.test(params.requestId || '') ? params.requestId : '';
  const isTestSubmission = params.testSubmission === 'true';
  let success = false;

  const values = HEADERS.map((header, index) => {
    const fieldNames = ['name', 'email', 'unit', 'phone', 'position'];
    const value = String(params[fieldNames[index]] || '').trim();
    return value;
  });

  if (values[0] && values[1] && !isTestSubmission) {
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const sheet = getRegistrationSheet_(getSpreadsheet_());
      const nextRow = sheet.getLastRow() + 1;
      const phoneColumn = HEADERS.indexOf('電話') + 1;
      sheet.getRange(1, phoneColumn, sheet.getMaxRows(), 1).setNumberFormat('@');
      sheet.getRange(nextRow, 1, 1, HEADERS.length).setValues([values]);
      success = true;
    } finally {
      lock.releaseLock();
    }
  }

  const accepted = success || (isTestSubmission && values[0] && values[1]);
  const message = accepted ? '報名成功，資料已送出。' : '報名失敗，請檢查必填欄位並稍後再試。';
  const response = HtmlService.createHtmlOutput(
    '<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><p>' + message + '</p>' +
    '<script>window.top.postMessage({type:"signup-result",requestId:' +
    JSON.stringify(requestId) + ',success:' + Boolean(accepted) + '}, "*");</script></html>'
  );
  response.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return response;
}

function getSpreadsheet_() {
  return SpreadsheetApp.openById(SPREADSHEET_ID);
}

function getRegistrationSheet_(spreadsheet) {
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.getSheets()[0];
    sheet.setName(SHEET_NAME);
  }

  const firstRow = sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0];
  if (firstRow.every((value) => value === '')) {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  } else if (HEADERS.some((header, index) => firstRow[index] !== header)) {
    throw new Error('報名資料表標題列與預期欄位不符。');
  }

  return sheet;
}
