/**
 * 嶽ノ子 LP 問い合わせフォーム — 任意項目4列を追加する Apps Script
 *
 * gcloud 認証は Google Workspace によりブロックされるため、
 * フォーム編集画面からこのスクリプトを実行してください（1回だけ）。
 *
 * 手順:
 * 1. Google Form「お問い合わせフォーム」を編集画面で開く
 * 2. 拡張機能 → Apps Script
 * 3. この内容を貼り付けて保存
 * 4. 関数 addOptionalFields を選択 → 実行
 * 5. 初回は「権限を確認」→ 自分のアカウントで許可（Google製スクリプトなのでブロックされない）
 * 6. 実行ログに entry ID が出る → index.html の name を差し替え
 */
function addOptionalFields() {
  var form = FormApp.getActiveForm();
  if (!form) {
    throw new Error('フォームの編集画面を開いた状態で Apps Script を起動してください');
  }

  var BUSINESS = ['デイサービス', '訪問介護', '居宅介護支援', '有料老人ホーム', '障害福祉', 'その他'];
  var PROBLEMS = [
    'シフト作成', '送迎管理', '月次集計', '申し送り', '記録チェック', '備品管理',
    'ヒヤリハット報告', '報告書作成', '家族連絡', '利用者一覧',
    '算定要件のセルフチェック', '記録・算定のセルフチェック', 'その他'
  ];
  var METHOD = ['紙', 'Excel', '既存介護ソフト', 'LINE／電話', '複数混在'];
  var SHARE = ['可能', '一部可能', '相談したい'];

  var DETAIL_TITLE = 'お問い合わせの詳細（具体的な内容をご記入ください）';
  var insertAt = findItemIndex(form, DETAIL_TITLE);
  if (insertAt < 0) insertAt = form.getItems().length;

  var specs = [
    { title: '事業種別（任意）', type: 'radio', choices: BUSINESS },
    { title: '困っている業務（任意・複数選択可）', type: 'checkbox', choices: PROBLEMS },
    { title: '現在の管理方法（任意）', type: 'radio', choices: METHOD },
    { title: '現場資料の共有可否（任意）', type: 'radio', choices: SHARE }
  ];

  specs.forEach(function (spec) {
    if (findItemIndex(form, spec.title) >= 0) return;
    var item;
    if (spec.type === 'checkbox') {
      item = form.addCheckboxItem().setTitle(spec.title).setChoiceValues(spec.choices).setRequired(false);
    } else {
      item = form.addMultipleChoiceItem().setTitle(spec.title).setChoiceValues(spec.choices).setRequired(false);
    }
    var items = form.getItems();
    var from = items.length - 1;
    form.moveItem(from, insertAt);
    insertAt++;
  });

  Logger.log('=== 追加完了。送信に使う entry ID（公開フォームから確認） ===');
  Logger.log('※ item.getId() は送信用 ID と異なります。lp/scripts/list_form_fields.py で確認してください。');
  form.getItems().forEach(function (item) {
    Logger.log(item.getTitle() + ' (itemId=' + item.getId() + ')');
  });
}

function findItemIndex(form, title) {
  var items = form.getItems();
  for (var i = 0; i < items.length; i++) {
    if (items[i].getTitle() === title) return i;
  }
  return -1;
}

function findEntryId(form, title) {
  var idx = findItemIndex(form, title);
  if (idx < 0) return '(未作成)';
  return form.getItems()[idx].getId();
}
