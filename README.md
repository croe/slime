# SLIME

静的サイトを制作するための、柔軟なフレームワーク

## 依存パッケージ

Slimeを利用するには、予め以下のパッケージをインストールしておきます。

- [Node.js](https://nodejs.org/en/) required v4.0+
  - [ダウンロードページ](https://nodejs.org/en/)からインストーラをダウンロードして実行
- [Gulp](http://gulpjs.com/)
  - Node.jsをインストールした状態で`npm install -g gulp`を実行

## 使い方

### インストール

1. 依存パッケージのインストール
2. Slime最新版をダウンロード
3. フォルダをプロジェクト名でリネーム
4. ターミナル、またはコマンドプロンプトを起動し対象のディレクトリまで移動
5. 開発用npmパッケージのインストール
  - `$ npm install`

### コマンド

#### メイン

- `gulp build`
  - デプロイ用データを`dist/`に書き出します。
- `gulp test`
  - テストを実行します。
- `gulp watch`
  - `http://localhost:8000/`で`dist/`以下をローカルホスティングします。
- `gulp generate`
  - `siteconfig.json`で設定した内容からテンプレートをコピーし、HTMLを出力します。
  
#### サブ

いずれもメインコマンドに内包されていますが、個別で実行することも可能です。

- `gulp build-precleaning`
  - `gulp build`処理の最初に`dist/`を削除します。
- `gulp build-precopying`
  - `src/`のディレクトリ構造と内容をそのまま`dist/`に書き出します。
- `gulp build-postcleaning`
  - `dist/`に出力されたものから、開発時のみ使用するものを削除します。
- `gulp browserify`
  - `src/common/scripts/scripts.js`を`dist/common/scripts/scripts.js`として書き出します。
- `gulp csscomb`
  - `dist/common/styles/styles.css`を上書きします。
- `gulp ejs`
  - `src/`以下のejsファイルを`dist/`以下に、階層を維持して書き出します。
- `gulp imagemin`
  - `src/common/images/`以下のビットマップ画像を`dist/common/images/`以下に、階層を維持して書き出します。
- `gulp jsdoc`
  - `src/jsdoc/`を作成します(上書き)。
- `gulp jshint`
  - `src/common/scripts/`以下のJSファイルを文法チェックします。
- `gulp kss`
  - `src/kss/`を作成します(上書き)。
- `gulp mocha`
  - `test/mocha/`以下のJSファイルをmochaテストファイルとみなして実行します。
- `gulp pleeease`
  - `dist/common/styles/styles.css`を上書きします。
- `gulp sass`
  - `src/common/styles/styles.scss`を`dist/common/css/styles.css`として書き出します。
- `gulp uglify`
  - `dist/common/scripts/scripts.js`を上書きします。
- `gulp watchify`
  - `src/common/scripts/scripts.js`を`dist/common/scripts/scripts.js`として書き出します。
  - 監視モードで実行される以外は`gulp browserify`と同じ振る舞いです。
- `gulp webserver`
  - `localhost:8000/`でローカルホスティングします。

### HTML Template

 - ejsを使います。
  - 共通パーツをモジュール化して、静的にインクルードすることができます(結合したものが書き出されます)。
  - TDK・OGP等サイト設定を外部ファイル化
      - Googleスプレッドシートを利用して、非エンジニアでも容易な編集が可能です。
      - `siteconfig.json`にメタ情報、OGP情報などをまとめておくことで、抜け漏れを防ぎます。
      - `siteconfig.json`を決まった形で記述することで、ページの量産が可能です。

### スクリプト

 - Browserifyを使います。
  - shimを使ってグローバルにjQueryを宣言するため、BrowserifyとjQueryプラグインの併用が可能です。
- JSファイルにJsDocコメントを記述することで、ドキュメントを自動生成することができます。
  - JsDocコメントの書式は[公式ドキュメント](http://usejsdoc.org/)を参照ください。

#### ディレクトリ

- `src/common/scripts/modules/`
  - 再利用されない、プロジェクト固有なスクリプトを配置します。
- `src/common/scripts/vendor/`
  - サードパーティのスクリプトを配置します。

### スタイルシート

`src/common/styles/styles.scss`で全てのスタイルシートファイルを集約し、1ファイルのスタイルシートとして書き出します。

スタイルシートはあらかじめ、Base、 Layout、 Module、 State、 Themeに分割されています。これはSMACSSにもとづいたものです。

#### ディレクトリ

- `src/common/styles/modules/`
  - 自前モジュールのスタイルシートを配置します。モジュールごとにファイルを分け、それらを`src/common/css/_modules.scss`で`@import`します。`src/common/css/_modules.scss`は`src/common/css/styles.scss`に`@import`されます。
- `src/common/styles/vendor/`
  - サードパーティのスタイルシートを配置します。

#### スタイルガイド (KSS)

スタイルシートにKSSコメントを記述すると、`gulp kss`でスタイルガイドを自動生成することができます。

KSSコメントの書式は[公式ドキュメント](http://warpspire.com/kss/syntax/)を参照ください。

## 特殊なディレクトリについて

- `src/`
  - ソースファイルはこの中に配置します。
- `dist/`
  - デプロイファイルが書き出されます。`gulp build`のたびに`src/`の内容にもとづき最新のデプロイファイルで中身が更新されます。ディレクトリ構造はsrcの内容が引き継がれます。

## feature

 - webフォントの置き場 、fontello等更新しやすく・管理しやすく

 - Google apps scriptsでsiteconfig.jsonを生成する

 - jsonの情報を読み取ってテンプレから指定パスでHTMLを生成する。
    - 個別値の入力ができないため、テンプレートからコピー＆リネーム時にHTMLファイルを出力する。
 
 - JSDoc → ESDocへの変更
   
## Author
 - Akihiro Kato
    - Engineer
  
 - Yoshiki Yamamoto
    - Engineer
 

## LICENSE

 - Released under the [MIT Licenses](https://tldrlegal.com/license/mit-license).
