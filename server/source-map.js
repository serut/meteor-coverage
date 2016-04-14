if (IS_COVERAGE_ACTIVE) {
    var istanbulAPI = Npm.require('istanbul-api'),
        fs = Npm.require('fs'),
        sourceMap = istanbulAPI.libSourceMaps.createSourceMapStore({verbose: true}),
        meteor_dir = COVERAGE_APP_FOLDER;


    // Alter inside the source map the path of each sources
    alterSourceMapPaths = function (map) {
        for (var i = 0; i < map.sources.length; i++) {
            // Magic character inside the path
            var paths = map.sources[i].split(String.fromCharCode(56507) + "app/");
            if (paths.length == 2) {
                var path = paths[1];
                // if it's a package the path is wrong
                if (path.indexOf(':') > -1) {
                    var p = path.split(':');
                    map.sources[i] = meteor_dir + "packages/" + p[1];
                } else {
                    map.sources[i] = meteor_dir + path;
                }
            } else {
                Log.error("Failed to alter source map path", map.sources[i])
            }
        }
        return map;
    }

    registerSourceMap = function (filepath) {
        // SIDE EFFECTS
        sourceMapPath = filepath + ".map";
        if (fs.existsSync(sourceMapPath)) {
            fileContent = JSON.parse(fs.readFileSync(sourceMapPath, "utf8"));
            fileContent = alterSourceMapPaths(fileContent)
            Log.info("Add source map for file " + sourceMapPath)
            sourceMap.registerMap(filepath, fileContent);
        } else {
            Log.error("Source map not found", sourceMapPath);
        }
    }

    SourceMap = {
        registerSourceMap: registerSourceMap,
        lib: sourceMap
    }
}