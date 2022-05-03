/**
 * @description スプレッドシートから名前を取得して席替え。プロパティに保存。トリガーで毎朝9時に実施する。
 */
function create() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const [names] = ss.getSheetByName('name').getDataRange().getValues();
  /**
   * @description 席替え参加者リスト
   * @param {string[]}
   */
  console.log(names)
  //配列をランダムに入れ替える
  for (let i = names.length - 1; i > 0; i--) {
    let r = Math.floor(Math.random() * (i + 1));
    let tmp = names[i]
    names[i] = names[r]
    names[r] = tmp
  }
  console.log(names)
  const d = new Date()
  d.setDate(d.getDate() + 1)
  console.log(d)

  //明日の日付とともにシートに保存する。
  const date = Utilities.formatDate(d, Session.getScriptTimeZone(), "yyyy/MM/dd")
  const values = [[date, ...names]]
  const sh = ss.getSheetByName('recode')
  const lr = sh.getLastRow();//スプレッドシートの最終行を取得
  sh.getRange(lr + 1, 1, values.length, values[0].length).setValues(values);//貼付

  //データをプロパティに保存する
  const json = JSON.stringify(values);
  PropertiesService.getScriptProperties().setProperty('seki', json);
}
/**
 * @description プロパティの席替えリストをLINEメッセージに変換し返却。
 */
function getMessages() {
  //プロパティから名前のランダムリスト+日付を取得
  const json = PropertiesService.getScriptProperties().getProperty('seki');
  const [values] = JSON.parse(json);
  const v = values.reduce((a, x, i) => {
    if(i ===0) return [...a, x]
    const nn = i+". " +x
    return[...a, nn]
  }, [])
  //ラインに投下される形
  const text = v.join('\n');
  const messages = [
    {
      type: "text",
      text: "せきがえんぬ~"
    },
    {
      type: "text",
      text,
    }]
  console.log(messages)
  return messages;
}
/**
 * @description LINEからメッセージを受信すると起動。「席替え！」を受信すると席替え内容を返す。
 */
function doPost(e) {
  try {
    const event = JSON.parse(e.postData.contents).events[0];
    console.log(event)
    if(event["type"] !== 'message' || event["message"]["type"] !== "text"){
      return;
    }
    const sendedText = event["message"]["text"]; //送信テキスト
    console.log(sendedText)
    const t = ["席替え！", "せきがえ！"]
    if(!t.includes(sendedText)) {
      return;
    }
    const url = 'https://api.line.me/v2/bot/message/reply';
    const ACCESS_TOKEN = PropertiesService.getScriptProperties().getProperty('token');
    if (!ACCESS_TOKEN) {
      console.error('no token')
      return;
    }
    const messages = getMessages();
    const replyToken = event["replyToken"];
    const options = {
      "headers": {
        "Content-Type": "application/json; charset=UTF-8",
        "Authorization": 'Bearer ' + ACCESS_TOKEN
      },
      "method": "post",
      "payload": JSON.stringify({ replyToken, messages }),
      muteHttpExceptions: true
    };
    var response = UrlFetchApp.fetch(url, options);
    if (response.getResponseCode !== 200) {
      console.error("error!")
      return
    }
  } catch (e) {
    console.log(e)
    const s = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('log')
    const lr = s.getLastRow()
    s.getRange(lr + 1, 1).setValue(JSON.stringify(e))
  }
  return ContentService
    .createTextOutput(JSON.stringify({ 'content': 'post ok' }))
    .setMimeType(ContentService.MimeType.JSON);
}

