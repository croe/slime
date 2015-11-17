'use strict';
let assign = require('lodash').assign;
let browserify = require('browserify');
let buffer = require('vinyl-buffer');
let cache = require('gulp-cached');
let csscomb = require('gulp-csscomb');
let del = require('del');
let ejs = require('gulp-ejs');
let gulp = require('gulp');
let gutil = require('gulp-util');
let imagemin = require('gulp-imagemin');
let istanbul = require('gulp-istanbul');
let jshint = require('gulp-jshint');
let mocha = require('gulp-mocha');
let notify = require('gulp-notify');
let pleeease = require('gulp-pleeease');
let plumber = require('gulp-plumber');
let pngquant = require('imagemin-pngquant');
let rename = require('gulp-rename');
let runSequence = require('run-sequence');
let sass = require('gulp-sass');
let shell = require('gulp-shell');
let source = require('vinyl-source-stream');
let sourcemaps = require('gulp-sourcemaps');
let stylish = require('jshint-stylish');
let uglify = require('gulp-uglify');
let watchify = require('watchify');
let webserver = require('gulp-webserver');
// let iconfont = require('gulp-iconfont');
// let jsdoc = require('gulp-jsdoc');
const PATHS = (() => {
  var ret = {};
  ret.dirDistSources = './dist/';
  ret.dirSources = './src/';
  ret.dirTemp = './_tmp/';
  ret.dirCoverage = `${ret.dirDistSources}_coverage/`;
  ret.dirCoverageMocha = `${ret.dirCoverage}mocha/`;
  ret.dirImages = `${ret.dirSources}common/images/`;
  ret.dirImageminDist = `${ret.dirDistSources}common/images`;
  ret.dirIcons = `${ret.dirImages}icons/`;
  ret.dirIconSources = `${ret.dirIcons}sources/`;
  ret.dirJsDoc = `${ret.dirDistSources}/_jsdocument/`;
  ret.dirKSS = `${ret.dirDistSources}/_styleguide/`;
  ret.dirScripts = `${ret.dirSources}common/scripts/`;
  ret.dirScriptsDist = `${ret.dirDistSources}common/scripts/`;
  ret.dirStylesheets = `${ret.dirSources}common/styles/`;
  ret.dirStylesheetsDist = `${ret.dirDistSources}common/styles/`;
  ret.dirTmp = 'tmp/';
  ret.dirTests = 'test/';
  ret.dirBrowserifyDist = `${ret.dirDistSources}common/scripts/`;
  ret.globGulpfile = 'gulpfile.js';
  ret.filenameScriptMain = 'scripts.js';
  ret.filenameStylesheetDist = 'styles.css';
  ret.globEjs = `${ret.dirSources}**/*.ejs`;
  ret.globHtml = `${ret.dirSources}**/*.html`;
  ret.globIcons = `${ret.dirIconSources}**/*.svg`;
  ret.globIgnoreVendorScripts = `!${ret.dirScripts}vendor/**/*.js`;
  ret.globImages = `${ret.dirImages}**/*`;
  ret.globJshintrc = '.jshintrc';
  ret.globScripts = `${ret.dirScripts}**/*.js`;
  ret.globScriptMain = `${ret.dirScripts}scripts.js`;
  ret.globStylesheetsScss = `${ret.dirStylesheets}**/*.scss`;
  ret.globStylesheetsSass = `${ret.dirStylesheets}**/*.sass`;
  ret.globStylesheetsCss = `${ret.dirStylesheets}**/*.css`;
  ret.globStylesheetDist = `${ret.dirStylesheetsDist}${ret.filenameStylesheetDist}`;
  ret.globTests = `${ret.dirTests}**/*.js`;
  ret.globTestsMocha = `${ret.dirTests}mocha/**/*.js`;
  ret = Object.freeze(ret);
  return ret;
})();

// アイコンフォント自動生成 -> 未動作の部分あり、featuresブランチで検証
/*
 gulp.task('iconfont', () => {
 return gulp.src(PATHS.globIcons)
 .pipe(iconfont({
 fontName: 'icons',
 appendUnicode: true,
 formats: ['ttf', 'eot', 'woff'],
 timestamp: Math.round(Date.now()/1000)
 }))
 .on('glyphs', function(glyphs, options) {
 console.log(glyphs, options);
 })
 .pipe(gulp.dest(PATHS.dirIcons));
 });
 */
// jsdoc生成 -> Macでエラーあり、検証中
/*
 gulp.task('jsdoc', () => {
 return gulp.src([PATHS.globScripts])
 .pipe(plumber({
 errorHandler: notify.onError('<%= error.message %>')
 }))
 .pipe(jsdoc(PATHS.dirJsDoc));
 });
 */
// 量産システム
gulp.task('generate', () => {
  let data = require('./siteconfig.json');
  for(var i = 0; i < data.page.length; i++){
      console.log(data.page[i].filename);
      console.log(PATHS.dirSources + data.page[i].path);
      let pagedata = {};
      pagedata.common = data.common;
      pagedata.page = data.page[i];
      console.log(pagedata.page.id);
      console.log('./ejs_template/' + data.page[i].template)
      gulp.src('./ejs_template/' + data.page[i].template)
        .pipe(rename(data.page[i].filename + '.ejs'))
        .pipe(ejs(pagedata))
        .pipe(gulp.dest(PATHS.dirSources + data.page[i].path));
  }
});
// browserify
gulp.task('browserify', () => {
  return browserify(PATHS.globScriptMain)
    .bundle()
    .pipe(source(PATHS.filenameScriptMain))
    .pipe(gulp.dest(PATHS.dirBrowserifyDist));
});
// CSS順序の整列
gulp.task('csscomb', () => {
  return gulp.src(PATHS.globStylesheetDist)
    .pipe(csscomb())
    .pipe(gulp.dest(PATHS.dirStylesheetsDist));
});
// ejsのコンパイル
gulp.task('ejs', () => {
  let json = require('./siteconfig.json');
  return gulp.src([
      PATHS.dirSources + '**/*.ejs',
      '!' + PATHS.dirDistSources + '**/_*.ejs'
    ])
    .pipe(ejs(json))
    .pipe(gulp.dest(PATHS.dirDistSources));
});
// 画像圧縮
let imageminWithPath = (srcStr, distStr) => {
    return gulp.src(srcStr)
        .pipe(imagemin({
            progressive: true,
            use: [pngquant()]
        }))
        .pipe(gulp.dest(distStr));
};
gulp.task('imagemin', () => {
    return imageminWithPath(PATHS.globImages, PATHS.dirImageminDist);
});
// jshintチェック
gulp.task('jshint', () => {
  return gulp
    .src([PATHS.globGulpfile, PATHS.globScripts, PATHS.globTests, PATHS.globIgnoreVendorScripts])
    .pipe(plumber({
      errorHandler: notify.onError('<%= error.message %>')
    }))
    .pipe(cache('jshint'))
    .pipe(jshint({
      lookup: PATHS.globJshintrc
    }))
    .pipe(jshint.reporter(stylish))
    .pipe(jshint.reporter('fail'));
});
// KSS作成
gulp.task('kss', shell.task([`kss-node --source ${PATHS.dirStylesheets} --destination ${PATHS.dirKSS} --css /common/styles/${PATHS.filenameStylesheetDist}`]));
// mochaテスト
gulp.task('mocha', () => {
  return gulp.src([PATHS.globScripts])
    .pipe(istanbul({
      includeUntested: false,
      instrumenter: istanbul.Instrumenter
    }))
    .pipe(istanbul.hookRequire())
    .on('finish', () => {
      gulp.src([PATHS.globTestsMocha])
        .pipe(mocha({
          ui: 'bdd',
          reporter: 'nyan',
          globals: [],
          timeout: 2000,
          bail: false,
          ignoreLeaks: false
        }))
        .pipe(istanbul.writeReports({
          dir: PATHS.dirCoverageMocha,
          reporters: ['lcov'],
          reportOpts: {
            dir: PATHS.dirCoverageMocha
          }
        }));
    });
});
// AutoPrefix 圧縮　メディアクエリまとめ
gulp.task('pleeease', () => {
  return gulp.src(PATHS.globStylesheetDist)
    .pipe(pleeease({
      fallbacks: {
        autoprefixer: ['last 4 versions']
      },
      optimizers: {
        minifier: false // ソース圧縮の有無
      }
    }))
    .pipe(gulp.dest(PATHS.dirStylesheetsDist));
});
// Sassコンパイル
gulp.task('sass-build', () => {
  return gulp.src([PATHS.globStylesheetsScss, PATHS.globStylesheetsSass, PATHS.globStylesheetsCss])
    .pipe(plumber({
      errorHandler: notify.onError('<%= error.message %>')
    }))
    .pipe(sass({
      outputStyle: 'nested'
    }))
    .pipe(gulp.dest(PATHS.dirStylesheetsDist));
});
gulp.task('sass', () => {
  runSequence('sass-build', 'pleeease');
});
// JSの圧縮
gulp.task('uglify', () => {
  return gulp.src('dist/common/scripts/scripts.js')
    .pipe(uglify())
    .pipe(gulp.dest(PATHS.dirScriptsDist));
});
gulp.task('watchify', () => {
  let customOpts = {
    entries: [PATHS.globScriptMain],
    debug: true
  };
  let opts = assign({}, watchify.args, customOpts);
  let b = watchify(browserify(opts));
  b.on('update', bundle);
  b.on('log', gutil.log);

  function bundle() {
    return b.bundle()
      .on('error', gutil.log.bind(gutil, 'Browserify Error'))
      .pipe(source(PATHS.filenameScriptMain))
      .pipe(buffer())
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(PATHS.dirBrowserifyDist));
  }
  return bundle();
});
// webserverの起動
gulp.task('webserver', () => {
  return gulp.src(PATHS.dirDistSources)
    .pipe(webserver({
      livereload: true,
      open: 'http://localhost:8000/'
    }));
});
// dist削除
gulp.task('build-precleaning', () => {
  return del([PATHS.dirDistSources]);
});
// dist生成
gulp.task('build-precopying', () => {
  return gulp.src('src/**/*.*', {base:'src'})
    .pipe(gulp.dest(PATHS.dirDistSources));
});
// 未使用ファイル削除
gulp.task('build-postcleaning', () => {
  return del([
    './dist/**/ejs_include',
    './dist/**/*.ejs',
    './dist/**/*.scss',
    './dist/**/*.sass',
    './dist/common/scripts/modules',
    './dist/common/styles/modules'
  ]);
});
// ビルド
gulp.task('build', () => {
  runSequence('build-precleaning', 'build-precopying', ['browserify', 'ejs', 'imagemin', 'kss', 'mocha', 'sass'], ['csscomb', 'uglify'], 'build-postcleaning');
});
// テストツール
gulp.task('test', ['jshint', 'mocha']);
// 監視
gulp.task('watch', () => {
  gulp.watch(PATHS.globEjs, ['ejs']);
  gulp.watch([PATHS.dirScripts, PATHS.dirTests], ['jshint', 'mocha']);
  gulp.watch([PATHS.globStylesheetsScss], ['kss', 'sass']);
  runSequence(['ejs', 'watchify', 'sass'], 'webserver');
});
