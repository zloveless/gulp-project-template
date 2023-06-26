import { src, dest, watch as gw, series, parallel } from "gulp";
import * as dartSass from "sass";
import * as gulpSass from "gulp-sass";
import * as sourcemaps from "gulp-sourcemaps";
import * as ts from "gulp-typescript";
import * as uglify from "gulp-uglify";

//import rename = require("gulp-rename");
import del = require("del");
import { dirname } from "path";

const sass = gulpSass(dartSass);
const paths = {
    scss: {
        src: "./assets/scss/site.scss",
        dest: "./wwwroot/css"
    },
    fa: {
        src: "./assets/css/all.min.css",
        dest: "./wwwroot/css"
    },
    images: {
        src: "./assets/images/**/*.*",
        dest: "./wwwroot/images"
    },
    fonts: {
        src: "./assets/webfonts/*.*",
        dest: "./wwwroot/webfonts"
    },
    scripts: {
        src: "./assets/scripts/**/*.ts",
        dest: "./wwwroot/js"
    }
};

async function buildStyles(outStyle: "compact" | "compressed" | "expanded" | "nested" | undefined) {
    return src(paths.scss.src)
        .pipe(sourcemaps.init())
        .pipe(sass({ outputStyle: outStyle }).on("error", sass.logError))
        .pipe(sourcemaps.write("."))
        .pipe(dest(paths.scss.dest));
}

async function copyFontAwesome() {
    return src(paths.fa.src)
        .pipe(dest(paths.fa.dest));
}

async function copyFonts() {
    return src(paths.fonts.src)
        .pipe(dest(paths.fonts.dest));
}

async function transpileScripts() {
    const project = ts.createProject("tsconfig.json");
    return src(paths.scripts.src)
        .pipe(sourcemaps.init())
        .pipe(project())
        .pipe(uglify())
        .pipe(sourcemaps.write("."))
        .pipe(dest(paths.scripts.dest));
}

/*****************************************************************/
// Gulp tasks below
/*****************************************************************/

export async function clean() {
    return del([dirname(paths.scss.dest)]);
} 

export async function build(){
    return Promise.all([
        buildStyles("expanded"),
        transpileScripts(),
        copyFonts(),
        copyFontAwesome()
    ]);
}

export async function publish(){
    await Promise.all([
        buildStyles("compressed"),
        copyFonts(),
        copyFontAwesome() 
    ]);
}

export async function watch() {
    return gw([
        "./assets/scss/**/*.scss",
        paths.scripts.src,
        paths.images.src
    ], series(clean, build));
}
