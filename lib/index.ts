import { ReadStream } from "fs";
import * as https from "https";

interface IGenerateParams {
  url?: string;
  html?: string;
}

export const API_BASE = "api.pdfpress.app"

function makeRequest(path: string, _body: object): Promise<ReadStream> {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(_body);
    const request = https.request({
      host: API_BASE,
      path: path,
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      }
    });
    request.on('response', (res) => {
      return resolve(res);
    });
    request.on('error', (err: Error) => {
      return reject(err);
    } )

    request.on('socket', function(socket) {
      if (socket.connecting) {
        socket.on(('secureConnect'), () => {
          request.write(body);
          request.end();
        });
      } else {
        request.write(body);
        request.end();
      }
    });
  });
}

export function generate(params: IGenerateParams, callback?: (pdf?: ReadStream, err?: Error) => void) : Promise<ReadStream> {
  return promisify(makeRequest("/generate", params), callback);
}

export function generateTemplate(templateID: string, params: object, callback?: (pdf?: ReadStream, err?: Error) => void) : Promise<ReadStream> {
  return promisify(makeRequest(`/templates/${templateID}/generate`, params), callback);
}

function promisify(promise: Promise<ReadStream>, callback?: (res?: ReadStream, err?: Error) => void) : Promise<ReadStream> {
  if (callback) {
    promise.then((res) => {
      setTimeout(() => callback(res, undefined), 0);
    }).catch((err: Error) => {
      setTimeout(() => callback(undefined, err), 0);
    });
  }
  return promise;
}
