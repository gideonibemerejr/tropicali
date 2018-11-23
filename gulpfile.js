const gulp = require('gulp')
const { parallel } = require('gulp')
const { series } = require('gulp')

const sass = require('gulp-sass')
const cleanCss = require('gulp-clean-css')
const sourcemaps = require('gulp-sourcemaps')

const browserSync = require('browser-sync').create()

const imagemin = require('gulp-imagemin')


// File paths to maintain DRY code. Need to figure out if the destination is the same -- currently paths.dest
const paths = {
  styles: {
      src: "src/css/app.scss",
  },
  html: {
    src: "src/*.html"
  },
  fonts: {
    src: "src/fonts/*",
    dest: "dist/fonts"
  },
  img: {
    src: "src/img/*",
    dest: "dist/img"
  },
  dest: "dist"
}

/*******************************************************
 COMPILE FILES HTML, CSS, JS, IMG, FONTS
********************************************************/

// This function compiles + Minifies SASS to CSS
function style() {
  // Grabs the app.scss file
  return gulp.src(paths.styles.src)
  // Intializes sourcemaps for css line information in devtools
  .pipe(sourcemaps.init())
    //passes app.scss through to sass
    .pipe(sass())
    .pipe(
      //minifies our css, adds compatibility for ie8+ 
      cleanCss({
        compatibility: 'ie8'
      })
    )
    //writes our css line information for devtools
    .pipe(sourcemaps.write())
    // compiles our app.scss changes to dist/app.css 
    .pipe(gulp.dest(paths.dest))
    .pipe(browserSync.stream())
}

// This function minifies HTML
function markup() {
  return gulp.src(paths.html.src)
  .pipe(gulp.dest(paths.dest))
}

// This function adds src/fonts to dist/fonts
function fonts() {
  return gulp.src(paths.fonts.src)
    .pipe(gulp.dest(paths.fonts.dest))
}

// This function adds src/img to dist/img
function img() {
  return gulp.src(paths.img.src)
    .pipe(imagemin())
    .pipe(gulp.dest(paths.img.dest))
}

/************************************************
WATCH FILES & RUN COMPILERS AUTOMATICALLY
*************************************************/

// Watch src/app.scss and run sass compiler if changes any occur
function watchStyle() {  
  gulp.watch(paths.styles.src, style)
}

// Watch index.html for any changes and update
function watchMarkup() {
  gulp.watch(paths.html.src, markup).on("change", browserSync.reload)
}

// Watch src/fonts/ for any added fonts and send them to dist/fonts
function watchFonts() {
  gulp.watch(paths.fonts.src, fonts)
}

function watchImg() {
  gulp.watch(paths.img.src, img)
}
// Saves all compilers to run once when called
const compile = gulp.parallel(markup, style, fonts, img)

/************************************************
Local Server + Default Construct
*************************************************/

//start browserSync -- will not run independently i.e. gulp startServer
function startServer() {
  browserSync.init({
    server: {
      baseDir: "dist"
    }
  })
}
// compiles all files THEN starts browserSync
const serve = gulp.series(compile, startServer)

//watches all files IN ONE PLACE for any changes and updates 
const watch = gulp.parallel(watchMarkup, watchStyle, watchFonts, watchImg)

// runs all our code as default gulp task
const defaultTasks = gulp.parallel(serve, watch)

exports.default = defaultTasks