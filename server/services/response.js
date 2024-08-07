/**
 * Carefully handles response processing to prevent
 * common issues, like
 * "Cannot set headers after they are sent to the client"
 * @type {{send:function}}
 */
export const Response = {};

/**
 * (s)end the response
 * @param res {HTTPResponse}
 * @param status {number?} optional new status code
 * @param message {string?} optional message
 * @param json {object?} optional json-able object
 * @return {any}
 */
Response.send = ({ res, type, status, message, json }) => {
  if (res.headersSent) {
    return;
  }
  if (status) {
    res.status(status);
  }

  if (type) {
    res.set('Content-type', type);
  }

  if (json) {
    return res.json(json);
  }
  else if (message) {
    return res.send(message);
  }
  
  return res.end();
  
};
