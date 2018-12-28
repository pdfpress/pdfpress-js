import { expect } from "chai";
import { createReadStream } from "fs";
import * as streamEqual from "stream-equal";
import { generate } from "../lib";
import * as nock from "nock";

describe("generate", () => {
  it("should handle a simple url request", () => {
    const fixture = createReadStream("fixtures/test.pdf");
    nock('https://api.pdfpress.app')
      .post('/generate')
      .reply(200, fixture);
    return generate({ url: "https://www.google.com" })
    .then((response) => {
      const source = createReadStream("fixtures/test.pdf");
      return streamEqual(source, response, (err, equal) => {
        expect(equal).to.be.true;
      });
    });
  });

  it("should handle a simple url request with callback", () => {
    const fixture = createReadStream("fixtures/test.pdf");
    nock('https://api.pdfpress.app')
      .post('/generate')
      .reply(200, fixture);
    return generate({ url: "https://www.google.com" }, (response) => {
      const source = createReadStream("fixtures/test.pdf");
      expect(response).to.exist;
      if (response) {
        return streamEqual(source, response, (err, equal) => {
          expect(err).to.be.null;
          expect(equal).to.be.true;
        });
      }
    });
  });

  it("should handle a simple url request with callback that errors", () => {
    nock('https://api.pdfpress.app')
      .post('/generate')
      .reply(400, {});
    return generate({ url: "https://www.google.com" }, (response, err) => {
      expect(err).to.exist;
      expect(response).to.be.null;
    });
  });

  it("should handle a simple url request that errors", () => {
    nock('https://api.pdfpress.app')
      .post('/generate')
      .reply(400, {});
    return generate({ url: "https://www.google.com" })
      .catch((err) => {
        expect(err).to.exist;
      });
  });

})
