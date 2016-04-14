IS_COVERAGE_VERBOSE = process.env["COVERAGE_VERBOSE"] === "1"
Log = {
    error: function() {
        if (IS_COVERAGE_VERBOSE)
            console.error(...arguments);
    },
    info: function() {
        if (IS_COVERAGE_VERBOSE)
            console.log(...arguments);
    }
}
