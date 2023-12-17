exports.httpResponse = (result, resp) => {
    if (result.status !== 200 && result.status !== 201) {
        resp.status(result.status);
        resp.json(result.reason);
    }
    else {
        result.data && resp.json(result.data);
        result.data || resp.sendStatus(200);
    }
}

exports.imgResponse = (result, resp) => {
    if (!result) {
        resp.status(500);
        resp.json({ msg: 'Error while getting the image' });
        return;
    }

    if (result.status !== 200) {
        resp.status(result.status);
        resp.json({ msg: 'Error while getting the image' });
        return;
    }

    resp.writeHead(200, {
        'Content-Type': result.type,
        'Content-Length': result.img.length
    });

    resp.end(result.img);

    return;
}

exports.created = (data) => {
    return {
        status: 201,
        data
    }
}

exports.ok = (data) => {
    return {
        status: 200,
        data
    }
}

exports.badRequest = (reason) => {
    return {
        status: 400,
        reason: reason ? { msg: reason, key: reason.toLowerCase().split(' ').join('-') } : null
    }
}

exports.notFound = (reason) => {
    return {
        status: 404,
        reason: reason ? { msg: reason, key: reason.toLowerCase().split(' ').join('-') } : null
    }
}

exports.error = () => {
    return {
        status: 500,
        reason: { msg: 'Internal Server Error' }
    }
}
