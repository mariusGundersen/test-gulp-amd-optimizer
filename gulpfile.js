"use strict";

// includes
{
    var gulp = require("gulp"),
        debug = require("gulp-debug"),
        util = require("gulp-util"),
        uglify = require("gulp-uglify"),
        concat = require("gulp-concat"),
        sourcemaps = require("gulp-sourcemaps"),
        ts = require("gulp-typescript"),
        babel = require("gulp-babel"),
        filter = require("gulp-filter"),
        Promise = require("es6-promise").Promise, // Fix for weird problem with autoprefixer
        merge = require("merge2"),
        rename = require("gulp-rename"),
        plumber = require("gulp-plumber"),
        foreach = require("gulp-foreach"),
        gAmdOptimize = require("gulp-amd-optimizer"),
        lazypipe = require("lazypipe"),
        clone = require("gulp-clone"),
        es = require("event-stream");
}

// paths
{
    var paths = {
        publicDir: "app"
    };

    /* Source folders */
    paths.scriptsSrcFolder = "Scripts";
    paths.typescriptSrcFolder = paths.scriptsSrcFolder + "/ts";
    paths.nodePackages = "node_modules";
    paths.typingsSrcFolder = "typings";

    /* Globs */
    paths.typeScriptFilesGlob = "{*.ts,**/*.ts}";
    paths.typeScriptDefsGlob = "*.d.ts";
    paths.jsGlob = "[^_references.js]*.js"; // Exclude _references.js file

    /* Source files */
    paths.typeScriptFiles = paths.scriptsSrcFolder + "/" + paths.typeScriptFilesGlob;
    paths.typeScriptDefinitionFiles = paths.typingsSrcFolder + "/**/" + paths.typeScriptDefsGlob;
    paths.babelPolyfill = paths.nodePackages + "/babel-polyfill/dist/polyfill.js";

    /* Dest folders */
    paths.scriptsDest = paths.publicDir + "/script";
}

function visualStudioReporter() {
    return {
        error: function (error) {
            //This works
            util.log("Typescript: error", error.message);
            //This isn't shown
            console.error(error.message);
        },
        finish: ts.reporter.defaultReporter().finish
    };
}

function errorHandler(err) {
    util.log(err);
    notify(err);
    this.emit("end");
}

var getTsProject = function () {
    return ts.createProject("tsconfig.json");
}
var tsProject = getTsProject();
gulp.task("scripts:custom", function () {
    return gulp.src([paths.typeScriptFiles, paths.typeScriptDefinitionFiles], { base: paths.typescriptSrcFolder })
        .pipe(plumber({ handleError: errorHandler }))
        .pipe(sourcemaps.init())
        .on('end', function() { util.log("Transpiling TS -> ES6..."); })
        .pipe(ts(tsProject, {}, visualStudioReporter()))
        .on('end', function() { util.log("Transpiling ES6 -> ES5 using Babel..."); })
        .pipe(babel({ presets: ["es2015", "stage-3"] }))
        .on('end', function () { util.log("Generating AMD optimized bundles..."); })
        .pipe(gAmdOptimize({
            baseUrl: paths.typescriptSrcFolder,
            exclude: ["require", "exports"]
        }))
        .pipe(concat('modules.js'))
        .on('end', function () { util.log("Outputting sourcemaps..."); })
        .pipe(sourcemaps.write("./"))
        .on('end', function () { util.log("Outputting destination scripts..."); })
        .pipe(gulp.dest(paths.scriptsDest));
});

gulp.task("default", ["scripts:custom"]);