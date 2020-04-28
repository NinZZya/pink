"use strict";

var gulp = require("gulp");
var plumber = require("gulp-plumber");
var sourcemaps = require("gulp-sourcemaps");
var sass = require("gulp-sass");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var cssmin = require("gulp-csso");
var imagemin = require("gulp-imagemin")
var server = require("browser-sync").create();
var jsmin = require("gulp-js-minify");
var del = require("del");
var rename = require("gulp-rename");
var runSequence = require("gulp4-run-sequence");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var posthtml = require("gulp-posthtml");
var include = require("posthtml-include");

var path = {
  build: {
      html: "build/",
      js: "build/js/",
      css: "build/css/",
      img: "build/img/",
      fonts: "build/fonts/",
      sprite: "source/img/",
      favicon: "build/favicon.ico"
  },
  src: {
      html: "source/*.html",
      js: "source/js/**/*.js",
      style: "source/sass/style.scss",
      img: "source/img/build/**/*.*",
      fonts: "source/fonts/**/*.*",
      sprite: "source/img/sprite/*.svg",
      favicon: "source/favicon.ico"
  },
  watch: {
      html: "source/**/*.html",
      js: "source/js/**/*.js",
      style: "source/sass/**/*.{scss,sass}",
      img: "source/img/build/**/*.{png,jpg,svg}",
      fonts: "source/fonts/**/*.*",
      sprite: "source/img/sprite/*.svg",
      favicon: "source/favicon.ico"
  },
  img: {
    // src: "source/img/source/**/*.{png,jpg,svg}",
    src: "source/img/source/iphone-hand-desktop@2x.png",
    build: "source/img/build/"
  },
  clean: {
    build: "build",
    sprite: "source/img/spite.svg",
  }
};


gulp.task("build:img", function(done) {
  gulp.src(path.img.src)
    .pipe(imagemin([
      imagemin.gifsicle({interlaced: true}),
      imagemin.mozjpeg({quality: 75, progressive: true}),
      imagemin.optipng({optimizationLevel: 5}),
      imagemin.svgo({
          plugins: [
              {removeViewBox: true},
              {cleanupIDs: false}
          ]
      })
    ]))
    .pipe(gulp.dest(path.img.build))
    .pipe(server.stream());
    done();
});

gulp.task("build:webp", function(done) {
  gulp.src(path.img.webp)
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest(path.img.build))
    .pipe(server.stream());
    done();
});

gulp.task("clean", function (done) {
  del(path.clean.build);
  done();
});

gulp.task("sprite", function(done) {
  del(path.clean.sprite);
  gulp.src(path.src.sprite)
    .pipe(plumber())
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))

    .pipe(rename("sprite.svg"))
    .pipe(gulp.dest(path.build.sprite))
    .pipe(server.stream());
  done();
});

gulp.task("fonts", function(done) {
  gulp.src(path.src.fonts)
    .pipe(gulp.dest(path.build.fonts));
  done();
});

gulp.task("css", function (done) {
  gulp.src(path.src.style)
    .pipe(plumber())
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({cascade: false})
    ]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(path.build.css))
    .pipe(cssmin())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest(path.build.css))
    .pipe(server.stream());
  done();
});

gulp.task("js", function(done) {
  gulp.src(path.src.js)
    .pipe(plumber())
    .pipe(gulp.dest(path.build.js))
    .pipe(jsmin())
    .pipe(rename({suffix: ".min"}))
    .pipe(gulp.dest(path.build.js))
    .pipe(server.stream());
  done();
});

gulp.task("html", function (done) {
  gulp.src(path.src.html)
    .pipe(posthtml([
      include()
    ]))
    .pipe(gulp.dest(path.build.html));
  done();
});

gulp.task("favicon", function (done) {
  gulp.src(path.src.favicon)
    .pipe(gulp.dest(path.build.favicon));
  done();
});

gulp.task("img", function(done) {
  gulp.src(path.src.img)
    .pipe(gulp.dest(path.build.img))
    .pipe(server.stream());
    done();
});

gulp.task("server", function () {
  server.init({
    server: path.build.html,
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch(path.watch.js, gulp.series("js"));
  gulp.watch(path.watch.html, gulp.series("html"));
  gulp.watch(path.watch.fonts, gulp.series("fonts"));
  gulp.watch(path.watch.img, gulp.series("img"));
  gulp.watch(path.watch.style, gulp.series("css"));
  gulp.watch(path.watch.sprite, gulp.series("sprite", "html"));
  gulp.watch(path.watch.favicon, gulp.series("favicon"));
  gulp.watch(path.watch.html).on("change", server.reload);
});

gulp.task("build", function(done) {
  runSequence(
    "img",
    "fonts",
    "css",
    "js",
    "html",
    done
  );
});
