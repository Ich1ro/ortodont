exports.getCors = function () {
    const corsUrl = process.env.CORS_URL || '*';
    if (!corsUrl) {
        throw new Error("Cors URL cannot be null or undefined");
    }

    const origins = corsUrl.split('|');
    const corsOptions = {
        origin: origins,
        methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH']
    }

    return corsOptions;
}