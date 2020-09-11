const app = require("../app");
const chai = require("chai");
chai.use(require("chai-url"));
const chaiHttp = require("chai-http");
process.env.NODE_ENV = "test";

const { expect } = chai;
const originalLogFunction = console.log;
let output;
const nock = require("nock");
chai.use(chaiHttp);
describe("Tests valid decade and user Music", () => {
  let agent = chai.request.agent(app); //app uses sessions, we need to retain coookies
  /*it("Tests valid decade vs user", (done) => {
    agent.get("/login").end((err, res) => {
      expect(res).to.have.status(200);
      expect(res.body).to.have.property("url");

      nock("base.url.com")
        .get(`/body/${res.body.url}`)
        .reply(200, { data: "some data" });
      agent.get("/music");
    });
  });*/
});
describe("Test Entry", () => {
  let agent = chai.request.agent(app); //app uses sessions, we need to retain coookies

  it("Tests Server Working", (done) => {
    agent.get("/").end((err, res) => {
      expect(res).to.have.status(200);

      done();
    });
  });
});
describe("Tests two valid decades", () => {
  let agent = chai.request.agent(app); //app uses sessions, we need to retain coookies
  it("gets data for two valid decades", (done) => {
    agent.get("/compare/1990-2010").end((err, res) => {
      expect(res).to.have.status(200);
      //expect(res).to.have.cookie("type", "decade");
      //expect(res).to.redirectTo("/music");
      if (err) return done(err);
      done();
    });
  });
});

/*agent.get("/compare/1990-6Months").end((err, res) => {
      expect(res).to.have.status(200);
      //expect(res).to.have.cookie("type", "user");
      //expect(res).to.redirectTo("/music");
      if (err) return done(err);
      done();
    });*/

describe("Second decade past vaild time range", () => {
  let agent = chai.request.agent(app); //app uses sessions, we need to retain coookies
  it("Tests invalid second decade", (done) => {
    agent.get("/compare/1990-1920").end((err, res) => {
      expect(res).to.have.status(400);
      expect(res.body.error).to.equals(
        "invalid value entered for 2nd comparator"
      );
      done();
    });
  });
});

describe("First decade past vaild time range", () => {
  let agent = chai.request.agent(app); //app uses sessions, we need to retain coookies
  it("Tests invalid first decade", (done) => {
    agent.get("/compare/1920-2000").end((err, res) => {
      expect(res).to.have.status(400);
      expect(res.body.error).to.equals(
        "invalid value entered for 1st comparator"
      );
      done();
    });
  });
});
describe("User enters invalid time range", () => {
  let agent = chai.request.agent(app); //app uses sessions, we need to retain coookies
  it("Tests invalid user time range", (done) => {
    agent.get("/compare/1970-lastWeek").end((err, res) => {
      expect(res).to.have.status(400);
      expect(res.body.error).to.equals(
        "invalid value entered for 2nd comparator"
      );
      done();
    });
  });
});
describe("User enters their time range before decade", () => {
  let agent = chai.request.agent(app); //app uses sessions, we need to retain coookies
  it("Inserts user time range as first comparator", (done) => {
    agent.get("/compare/allTime-1980").end((err, res) => {
      expect(res).to.have.status(400);
      expect(res.body.error).to.equals(
        "invalid value entered for 1st comparator"
      );
      done();
    });
  });
});
