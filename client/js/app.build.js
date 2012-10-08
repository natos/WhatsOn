({
    appDir: "../",
    baseUrl: "js",
    dir: "../../client-build",
    modules: [
        {
            name: "main",
            // Parts of the app are dynamically loaded, and 
            // are not automatically included by the r.js optimizer.
            // Specify these modules explicitly, so that they are
            // included in the generated build file.
            include: [
                // Core modules
                "modules/user",
                "modules/canvas",
                "modules/router",
                // Flaco MVC library
                "lib/flaco/model",
                "lib/flaco/controller",
                "lib/flaco/view"
            ]
        }
    ]
})