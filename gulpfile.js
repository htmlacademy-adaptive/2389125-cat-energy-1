import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sass from 'gulp-dart-sass';
import postcss from 'gulp-postcss';
import csso from 'postcss-csso';
import rename from 'gulp-rename';
import imagemin from 'gulp-imagemin';
import webp from 'gulp-webp';
import {deleteAsync} from 'del';
import { stacksvg } from 'gulp-stacksvg';
import autoprefixer from 'autoprefixer';
import browser from 'browser-sync';

// Styles

export const styles = () => {
  return gulp.src('source/sass/style.scss', { sourcemaps: true })
    .pipe(plumber())
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss([
      autoprefixer(),
      csso()
    ]))
    .pipe(rename('style.min.css'))
    .pipe(gulp.dest('build/css', { sourcemaps: '.' }))
    .pipe(browser.stream());
}

// Scripts
const scripts = () => {
  return gulp.src('source/js/script.js')
  .pipe(gulp.dest('build/js'))
  .pipe(browser.stream());
}

//Images

export const images = () => {
  return gulp.src('source/img/**/*.{jpg,png,svg}')
    .pipe(imagemin())
    .pipe(gulp.dest('build/img'))
}

//CopyImages

const copyImages = () => {
return gulp.src('source/img/**/*.{png,jpg,svg}')
.pipe(gulp.dest('build/img'))
}

//Webp

export const createWebp = () => {
  return gulp.src('source/img/**/*.{jpg,png}')
  .pipe(webp())
  .pipe(gulp.dest('build/img'))
}

//Sprite

export const sprite = () => {
  return gulp.src('source/img/sprite/*.svg')
  .pipe(stacksvg())
  .pipe(rename('sprite.svg'))
  .pipe(gulp.dest('build/img/sprite'))
}

//Copy

const copy = (done) => {
 gulp.src([
 "source/fonts/**/*.{woff2,woff}",
 "source/*.ico",
 "source/*.webmanifest",
 ], {
 base: "source"
 })
 .pipe(gulp.dest("build"))
 done();
}

// HTML

const html = () => {
  return gulp.src('source/*.html')
  .pipe(gulp.dest('build'));
}

//Clean

export const clean = () => {
  return deleteAsync('build')
}

//Reload

export const reload = done => {
  browser.reload();
  done();
}

//Build

export const build = gulp.series(
  clean,
  copy,
  images,
  gulp.parallel(
    styles,
    sprite,
    createWebp,
    html,
    scripts,
  )
)


// Server

const server = (done) => {
  browser.init({
    server: {
      baseDir: 'build'
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

// Watcher

const watcher = () => {
  gulp.watch('source/sass/**/*.scss', gulp.series(styles));
  gulp.watch('source/*.html', gulp.series(html, reload));
}

export default gulp.series(
  clean,
  copy,
  copyImages,
  gulp.parallel(
    styles,
    sprite,
    createWebp,
    html,
    scripts,
  ),
  gulp.series(server, watcher)
)
